"""Bounded TDX sampling for field calibration; no website deployment."""
import argparse
import json
import os
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

TOKEN_URL = 'https://tdx.transportdata.tw/auth/realms/TDXConnect/protocol/openid-connect/token'
DATA_URL = 'https://tdx.transportdata.tw/api/basic/v3/Rail/TRA/TrainLiveBoard?$format=JSON'


class SafeError(Exception):
    pass


def request_json(request):
    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            return json.load(response)
    except urllib.error.HTTPError as error:
        raise SafeError('HTTP ' + str(error.code)) from None
    except (urllib.error.URLError, TimeoutError, OSError):
        raise SafeError('network_error') from None
    except (ValueError, UnicodeError):
        raise SafeError('invalid_json') from None


def snapshot(payload, received_at):
    if not isinstance(payload, dict) or not isinstance(payload.get('TrainLiveBoards'), list):
        raise SafeError('invalid_liveboard_schema')
    records = []
    fields = ('TrainNo', 'TrainTypeID', 'TrainTypeCode', 'StationID',
              'TrainStationStatus', 'DelayTime', 'UpdateTime')
    for row in payload['TrainLiveBoards']:
        if not isinstance(row, dict):
            raise SafeError('invalid_train_record')
        record = {key: row[key] for key in fields if key in row}
        for key in ('StationName', 'TrainTypeName'):
            name = row.get(key)
            if isinstance(name, dict):
                record[key] = {lang: name[lang] for lang in ('Zh_tw', 'En') if lang in name}
        records.append(record)
    result = {'receivedAt': received_at, 'trains': records}
    for key in ('UpdateTime', 'SrcUpdateTime', 'UpdateInterval', 'SrcUpdateInterval', 'Count'):
        if key in payload:
            result[key] = payload[key]
    # Freshness is dataset freshness, not physical train passage time.
    try:
        source = datetime.fromisoformat(payload['SrcUpdateTime'].replace('Z', '+00:00'))
        received = datetime.fromisoformat(received_at.replace('Z', '+00:00'))
        if source.tzinfo is None or received.tzinfo is None:
            raise ValueError
        age = (received - source).total_seconds()
        result['sourceAgeSeconds'] = age
        result['sourceStale'] = age > 180 or age < -60
    except (KeyError, ValueError, TypeError, AttributeError):
        result['sourceStale'] = None
    return result


def collect(client_id, client_secret, samples, interval, output, reader=request_json,
            clock=time.monotonic, sleep=time.sleep):
    token = None
    expires_at = 0
    auth_requests = 0
    data_requests = 0
    started = clock()
    with output.open('x', encoding='utf-8') as file:
        for index in range(samples):
            target = started + index * interval
            remaining = target - clock()
            if remaining > 0:
                sleep(remaining)
            try:
                if token is None or clock() >= expires_at:
                    if auth_requests >= 3:
                        raise SafeError('auth_request_budget_exhausted')
                    auth_requests += 1
                    form = urllib.parse.urlencode({'grant_type': 'client_credentials',
                        'client_id': client_id, 'client_secret': client_secret}).encode()
                    auth = reader(urllib.request.Request(TOKEN_URL, data=form,
                        headers={'Content-Type': 'application/x-www-form-urlencoded'}))
                    if not isinstance(auth, dict) or not isinstance(auth.get('access_token'), str):
                        raise SafeError('invalid_auth_response')
                    token = auth['access_token']
                    try:
                        lifetime = float(auth['expires_in'])
                    except (KeyError, TypeError, ValueError):
                        raise SafeError('invalid_token_lifetime') from None
                    if not 60 < lifetime <= 604800:
                        raise SafeError('invalid_token_lifetime')
                    expires_at = clock() + lifetime - 30
                data_requests += 1
                payload = reader(urllib.request.Request(DATA_URL,
                    headers={'Authorization': 'Bearer ' + token}))
                entry = snapshot(payload, datetime.now(timezone.utc).isoformat())
                entry.update({'sample': index + 1, 'dataRequests': data_requests})
                file.write(json.dumps(entry, ensure_ascii=False) + '\n')
                file.flush()
                print('sample', index + 1, 'saved;', len(entry['trains']), 'trains')
            except SafeError as error:
                # Never save HTTP response bodies, auth headers or token responses.
                file.write(json.dumps({'sample': index + 1,
                    'receivedAt': datetime.now(timezone.utc).isoformat(),
                    'error': str(error), 'dataRequests': data_requests}) + '\n')
                file.flush()
                print('Stopped:', str(error))
                return False
    return True


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--samples', type=int, default=30)
    parser.add_argument('--interval', type=int, default=60)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    if not 1 <= args.samples <= 180 or args.interval < 60:
        parser.error('samples must be 1..180; interval must be at least 60 seconds')
    credentials = [os.environ.get(key) for key in ('TDX_CLIENT_ID', 'TDX_CLIENT_SECRET')]
    if not all(credentials):
        parser.error('Set TDX_CLIENT_ID and TDX_CLIENT_SECRET through secure backend configuration')
    args.output.parent.mkdir(parents=True, exist_ok=True)
    try:
        success = collect(*credentials, args.samples, args.interval, args.output)
    except OSError:
        parser.error('Output unavailable or already exists; use a new path outside the public site')
    raise SystemExit(0 if success else 1)


if __name__ == '__main__':
    main()
