"""Bounded backend-only TRA capability probe; never publishes passage times."""
import argparse
import json
import os
import re
from datetime import datetime
from pathlib import Path
from urllib.error import HTTPError
from urllib.parse import urlencode
from zoneinfo import ZoneInfo

from station_monitor import fetch, TOKEN, safe_error

BASE = 'https://tdx.transportdata.tw/api/basic/v3/Rail/TRA/'
STATIONS = ('3150', '3160', '3170')


def audit_events(events):
    """Audit saved observations without promoting update clocks to passage times."""
    unique = {}
    for r in events:
        key = (r.get('trainNo'), r.get('stationId'), r.get('sourceEventAt'), r.get('status'))
        unique.setdefault(key, r)
    eligible = [r for r in unique.values()
                if r.get('classification') == '動態已回報・表定不停靠'
                and r.get('stale') is False and r.get('initialSnapshot') is False]
    clocks = {}
    for r in unique.values():
        k = (r.get('eventDate'), r.get('trainNo'), r.get('stationId'), r.get('status'))
        clocks.setdefault(k, set()).add(r.get('sourceEventAt'))
    return {'uniqueEvents': len(unique), 'freshNonstopEvents': eligible,
            'sameStationStatusMultipleUpdateTimes': [
                {'key': list(k), 'updateTimes': sorted(t)}
                for k, t in clocks.items() if len(t) > 1],
            'physicalPassageTimeMeasured': False}


def run(day, output):
    credentials = [os.environ.get(k) for k in ('TDX_CLIENT_ID', 'TDX_CLIENT_SECRET')]
    if not all(credentials):
        raise RuntimeError('missing_backend_credentials')
    output.mkdir(parents=True, exist_ok=False)
    auth = fetch(TOKEN, {'Content-Type': 'application/x-www-form-urlencoded'},
                 urlencode(dict(grant_type='client_credentials',
                                client_id=credentials[0], client_secret=credentials[1])).encode())
    headers = {'Authorization': 'Bearer ' + auth['access_token']}
    probes = {
        'dates': ('DailyTrainTimetable/TrainDates', None),
        'daily': ('DailyTrainTimetable/TrainDate/' + day, 'TrainTimetables'),
        'specific6725': ('SpecificTrainTimetable/TrainNo/6725', 'TrainTimetables'),
        'lines': ('StationOfLine', 'StationOfLines'),
        'positions': ('TrainLiveBoard', 'TrainLiveBoards'),
        **{'station' + sid: ('StationLiveBoard/Station/' + sid, 'StationLiveBoards')
           for sid in STATIONS}}
    report = {'requestedTrainDate': day, 'receivedAt': datetime.now(ZoneInfo('Asia/Taipei')).isoformat(),
              'probes': {}, 'physicalPassageTimeMeasured': False}
    payloads = {}
    for name, (path, collection) in probes.items():
        try:
            p = fetch(BASE + path + '?' + urlencode({'$format': 'JSON', '$top': 10000}), headers)
            if not isinstance(p, dict):
                raise ValueError('invalid_wrapper')
            rows = p.get(collection) if collection else None
            # Special timetable wrapper is documented separately; inspect rather than guess.
            if name == 'specific6725':
                rows = p.get('TrainTimetables', p.get('SpecificTrainTimetables'))
            if collection and not isinstance(rows, list):
                raise ValueError('invalid_collection')
            payloads[name] = p
            (output / (name + '.json')).write_text(json.dumps(p, ensure_ascii=False, indent=2))
            report['probes'][name] = {'status': 'success', 'count': len(rows) if rows is not None else None,
                'wrapperKeys': sorted(p), 'rowKeys': sorted(rows[0]) if rows else [],
                'metadata': {k: p.get(k) for k in ('UpdateTime', 'SrcUpdateTime', 'UpdateInterval', 'SrcUpdateInterval', 'TrainDate', 'Count')}}
            if isinstance(p.get('Count'), int) and rows is not None and p['Count'] > len(rows):
                report['probes'][name]['status'] = 'truncated'
        except Exception as e:
            report['probes'][name] = {'status': 'failed', 'error': safe_error(e)}
        print(name, report['probes'][name]['status'], flush=True)
    daily = payloads.get('daily', {})
    report['dailyChecks'] = []
    for r in daily.get('TrainTimetables', []):
        info, stops = r.get('TrainInfo', {}), r.get('StopTimes', [])
        if str(info.get('TrainNo')) in ('165', '149', '6725'):
            report['dailyChecks'].append({'trainNo': info.get('TrainNo'),
                'tripLine': info.get('TripLine'), 'directionRaw': info.get('Direction'),
                'suspendedFlag': info.get('SuspendedFlag'),
                'threeStationStops': [s for s in stops if s.get('StationID') in STATIONS],
                'allStopStationIDs': [s.get('StationID') for s in stops]})
    report['threeStationPositions'] = [r for r in payloads.get('positions', {}).get('TrainLiveBoards', [])
                                       if r.get('StationID') in STATIONS]
    report['threeStationLineMembership'] = [
        {'lineID': r.get('LineID'), 'lineNo': r.get('LineNo'),
         'stations': [s for s in r.get('Stations', []) if s.get('StationID') in STATIONS]}
        for r in payloads.get('lines', {}).get('StationOfLines', [])
        if any(s.get('StationID') in STATIONS for s in r.get('Stations', []))]
    (output / 'report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2))
    return all(r['status'] == 'success' for r in report['probes'].values())


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--date', default=datetime.now(ZoneInfo('Asia/Taipei')).date().isoformat())
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--events', type=Path, nargs='+', help='Offline audit of saved events.json files')
    args = parser.parse_args()
    if args.events:
        events = [r for p in args.events for r in json.loads(p.read_text())]
        args.output.mkdir(parents=True, exist_ok=False)
        (args.output / 'event-audit.json').write_text(json.dumps(audit_events(events), ensure_ascii=False, indent=2))
    else:
        if not re.fullmatch(r'\d{4}-\d{2}-\d{2}', args.date):
            parser.error('date must be YYYY-MM-DD')
        datetime.strptime(args.date, '%Y-%m-%d')
        try:
            raise SystemExit(0 if run(args.date, args.output) else 1)
        except (HTTPError, RuntimeError, ValueError) as e:
            print('Probe stopped:', safe_error(e))
            raise SystemExit(1)
