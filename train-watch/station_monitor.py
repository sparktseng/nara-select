"""Record all public TRA observations at Fengfu, Miaoli and Nanshi.

Event update time is not a measured physical passage time. No train-number
allowlist, passenger-only filter, or inferred locomotive identity is used.
"""
import argparse
import csv
import json
import hashlib
import os
import re
import time
from datetime import datetime, timedelta
from pathlib import Path
from urllib.error import HTTPError
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from zoneinfo import ZoneInfo

TZ = ZoneInfo('Asia/Taipei')
STATIONS = {'3150': '豐富', '3160': '苗栗', '3170': '南勢'}
BASE = 'https://ods.railway.gov.tw'
INDEX = BASE + '/tra-ods-web/ods/download/dataResource/railway_schedule/JSON/list'
TOKEN = 'https://tdx.transportdata.tw/auth/realms/TDXConnect/protocol/openid-connect/token'
LIVE = 'https://tdx.transportdata.tw/api/basic/v3/Rail/TRA/TrainLiveBoard?$format=JSON'
FIELDS = ['eventDate', 'trainNo', 'station', 'stationId', 'type', 'typeId',
          'direction', 'classification', 'carClass', 'scheduleNote', 'sourceEventAt',
          'firstReceivedAt', 'status', 'delayMinutes', 'eventAgeSeconds',
          'stale', 'initialSnapshot', 'timeMeaning', 'scheduleVersion']


def now():
    return datetime.now(TZ).isoformat()


def fetch(url, headers=None, data=None, text=False):
    with urlopen(Request(url, headers=headers or {}, data=data), timeout=25) as res:
        body = res.read().decode('utf-8-sig')
    return body if text else json.loads(body)


def schedules(day):
    """Load two operating days so a midnight observation is not misclassified."""
    index = fetch(INDEX, text=True)
    links = dict((d, u) for u, d in re.findall(
        r'<a\s+href="([^"]+)">(\d{8})\.json</a>', index))
    result = {}
    for date in (day - timedelta(days=1), day):
        key = date.strftime('%Y%m%d')
        if key not in links:
            continue
        payload = fetch(BASE + links[key])
        if not isinstance(payload.get('TrainInfos'), list):
            raise ValueError('invalid_schedule_schema')
        result[date.isoformat()] = {str(r['Train']): r for r in payload['TrainInfos']}
    return result


def classify(train, station, at, timetable):
    try:
        dt = datetime.fromisoformat(at.replace('Z', '+00:00'))
        if dt.tzinfo is None:
            raise ValueError('timezone_missing')
        dt = dt.astimezone(TZ)
    except (ValueError, AttributeError):
        return {'classification': '停靠方式待確認', 'direction': '未知'}
    # Early morning can belong to the preceding operating day. Only use a
    # single unambiguous candidate; do not guess from number parity.
    dates = [dt.date().isoformat()]
    if dt.hour < 4:
        dates.append((dt.date() - timedelta(days=1)).isoformat())
    candidates = [timetable[d][train] for d in dates
                  if train in timetable.get(d, {})]
    if len(candidates) != 1:
        return {'classification': '停靠方式待確認', 'direction': '未知'}
    r = candidates[0]
    stops = r.get('TimeInfos')
    if not isinstance(stops, list) or not stops:
        return {'classification': '停靠方式待確認', 'direction': '未知'}
    return {'classification': '表定停靠' if any(str(s.get('Station')) == station
            for s in stops) else '動態已回報・表定不停靠',
            'direction': {'2': '南下', '1': '北上'}.get(str(r.get('LineDir')), '未知'),
            'carClass': r.get('CarClass', ''), 'scheduleNote': r.get('Note', ''),
            'scheduleVersion': hashlib.sha256(json.dumps(
                {'Line': r.get('Line'), 'LineDir': r.get('LineDir'),
                 'CarClass': r.get('CarClass'), 'TimeInfos': stops},
                sort_keys=True, ensure_ascii=False).encode()).hexdigest()[:16]}


def extract(payload, received_at, timetable, initial=False):
    rows = payload.get('TrainLiveBoards') if isinstance(payload, dict) else None
    if not isinstance(rows, list):
        raise ValueError('invalid_liveboard_schema')
    result = []
    for row in rows:
        if not isinstance(row, dict):
            raise ValueError('invalid_train_record')
        sid = str(row.get('StationID', ''))
        if sid not in STATIONS:
            continue
        event = row.get('UpdateTime', '')
        try:
            dt = datetime.fromisoformat(event.replace('Z', '+00:00'))
            received = datetime.fromisoformat(received_at)
            if dt.tzinfo is None:
                raise ValueError('timezone_missing')
            age = (received - dt).total_seconds()
            date = dt.astimezone(TZ).date().isoformat()
        except (ValueError, TypeError, AttributeError):
            age, date = None, ''
        name = row.get('TrainTypeName')
        type_name = name.get('Zh_tw') if isinstance(name, dict) else None
        train = str(row.get('TrainNo', ''))
        record = dict(eventDate=date, trainNo=train, station=STATIONS[sid],
            stationId=sid, type=type_name or '未知', typeId=row.get('TrainTypeID', ''),
            sourceEventAt=event, firstReceivedAt=received_at,
            status=row.get('TrainStationStatus'), delayMinutes=row.get('DelayTime'),
            eventAgeSeconds=age, stale=age is None or age > 180 or age < -60,
            initialSnapshot=initial,
            timeMeaning='官方位置事件更新時間；非現場實測通過時間')
        record.update(classify(train, sid, event, timetable))
        result.append(record)
    return result


def save_checkpoint(output, events, summary):
    for name, value in [('summary.json', summary), ('events.json', events)]:
        tmp = output / (name + '.tmp')
        tmp.write_text(json.dumps(value, ensure_ascii=False, indent=2))
        tmp.replace(output / name)
    with (output / 'events.csv').open('w', encoding='utf-8-sig', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=FIELDS)
        writer.writeheader()
        writer.writerows(events)


def safe_error(error):
    return 'HTTP_' + str(error.code) if isinstance(error, HTTPError) else type(error).__name__


def run(samples, interval, output):
    credentials = [os.environ.get(k) for k in ('TDX_CLIENT_ID', 'TDX_CLIENT_SECRET')]
    if not all(credentials):
        raise RuntimeError('missing_backend_credentials')
    output.mkdir(parents=True, exist_ok=True)
    events, seen, timetable, loaded_day = [], set(), {}, None
    token, expires, schedule_retry_at = None, 0, 0
    summary = {'startedAt': now(), 'stations': STATIONS, 'samples': 0,
        'attemptedSamples': 0, 'failedSamples': 0, 'retryCount': 0,
        'consecutiveFailures': 0, 'lastSuccessfulSampleAt': None,
        'status': 'running', 'errors': [],
        'coverage': '所有API回報車次，含專列；未公開與輪詢間略過的事件無法保證捕捉',
        'intervalSeconds': interval, 'physicalPassageTimeMeasured': False}
    save_checkpoint(output, events, summary)
    try:
        with (output / 'snapshots.jsonl').open('x', encoding='utf-8') as raw:
            for sample in range(samples):
                started = time.monotonic()
                day = datetime.now(TZ).date()
                schedule_error = None
                if loaded_day != day and started >= schedule_retry_at:
                    try:
                        timetable = schedules(day)
                        loaded_day = day
                    except Exception:
                        schedule_error = 'schedule_unavailable'
                        schedule_retry_at = time.monotonic() + 600
                if loaded_day != day:
                    schedule_error = 'schedule_unavailable'
                records, payload, received, error = None, None, None, None
                for attempt in range(3):
                    try:
                        if token is None or time.monotonic() >= expires:
                            auth = fetch(TOKEN, {'Content-Type': 'application/x-www-form-urlencoded'},
                                urlencode(dict(grant_type='client_credentials',
                                    client_id=credentials[0], client_secret=credentials[1])).encode())
                            token = auth['access_token']
                            lifetime = int(auth['expires_in'])
                            if not isinstance(token, str) or lifetime <= 60:
                                raise ValueError('invalid_auth_response')
                            expires = time.monotonic() + lifetime - 30
                        payload = fetch(LIVE, {'Authorization': 'Bearer ' + token})
                        received = now()
                        records = extract(payload, received, timetable, sample == 0)
                        break
                    except Exception as exc:
                        error = safe_error(exc)
                        if isinstance(exc, HTTPError) and exc.code in (401, 403):
                            token = None
                        if attempt < 2:
                            summary['retryCount'] += 1
                            time.sleep(2 ** (attempt + 1))
                summary['attemptedSamples'] += 1
                if records is None:
                    summary['failedSamples'] += 1
                    summary['consecutiveFailures'] += 1
                    summary['errors'].append({'at': now(), 'sample': sample + 1, 'error': error})
                    raw.write(json.dumps({'sample': sample + 1, 'receivedAt': now(),
                        'error': error, 'records': [], 'querySucceeded': False}) + '\n')
                    print(f"Sample {sample + 1}: query failed ({error}); saved and retrying next minute", flush=True)
                else:
                    summary['consecutiveFailures'] = 0
                    summary['samples'] += 1
                    summary['lastSuccessfulSampleAt'] = received
                    wrapper = {k: payload.get(k) for k in ('UpdateTime', 'SrcUpdateTime',
                        'UpdateInterval', 'SrcUpdateInterval', 'Count')}
                    raw.write(json.dumps(dict(sample=sample + 1, receivedAt=received,
                        metadata=wrapper, records=records, scheduleError=schedule_error,
                        querySucceeded=True), ensure_ascii=False) + '\n')
                    for r in records:
                        key = (r['trainNo'], r['stationId'], r['sourceEventAt'], r['status'])
                        if key not in seen:
                            seen.add(key)
                            events.append(r)
                    print(f"Sample {sample + 1}: {len(records)} station records, {len(events)} unique events", flush=True)
                raw.flush()
                summary.update(eventCount=len(events), checkpointAt=now())
                save_checkpoint(output, events, summary)
                if summary['consecutiveFailures'] >= 5:
                    summary['status'] = 'failed'
                    break
                if sample + 1 < samples:
                    time.sleep(max(0, interval - (time.monotonic() - started)))
        if summary['status'] != 'failed':
            summary['status'] = 'partial' if summary['failedSamples'] else 'success'
    except Exception as error:
        summary['status'] = 'failed'
        summary['error'] = safe_error(error)
        print('Stopped:', summary['error'], flush=True)
    finally:
        summary.update(finishedAt=now(), eventCount=len(events))
        save_checkpoint(output, events, summary)
    return summary['status'] in ('success', 'partial')


if __name__ == '__main__':
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--samples', type=int, default=65)
    p.add_argument('--interval', type=int, default=60)
    p.add_argument('--output', type=Path, required=True)
    args = p.parse_args()
    if not 1 <= args.samples <= 180 or args.interval < 60:
        p.error('samples must be 1..180; interval must be at least 60 seconds')
    try:
        ok = run(args.samples, args.interval, args.output)
    except RuntimeError as error:
        print(str(error))
        ok = False
    raise SystemExit(0 if ok else 1)

