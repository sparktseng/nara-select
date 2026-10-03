"""Daily first qualifying non-stop update; never label it physical passage."""
from datetime import datetime
from statistics import mean, median
from collections import defaultdict
from zoneinfo import ZoneInfo

TZ = ZoneInfo('Asia/Taipei')

def daily_samples(events):
    groups = defaultdict(list)
    for r in events:
        if r.get('classification') != '動態已回報・表定不停靠':
            continue
        if r.get('stale') or r.get('initialSnapshot'):
            continue
        if not r.get('scheduleVersion') or not r.get('typeId') or r.get('direction') not in ('南下', '北上'):
            continue
        dt = datetime.fromisoformat(r['sourceEventAt'].replace('Z', '+00:00')).astimezone(TZ)
        if dt.hour < 4:
            continue  # operating day ambiguous until explicitly resolved
        key = (dt.date().isoformat(), str(r['trainNo']), str(r['typeId']),
            r['direction'], str(r['stationId']), r['scheduleVersion'])
        groups[key].append(r)
    return [dict(min(rows, key=lambda r: r['sourceEventAt']),
        repeatedEventCount=len({(r['sourceEventAt'], r['status']) for r in rows}),
        sampleMeaning='每日首次合格官方事件；非現場實測') for rows in groups.values()]

def summarize(events):
    groups = defaultdict(list)
    for r in daily_samples(events):
        # Only on-time samples define a nominal reference; delayed observations remain in raw log.
        if r.get('delayMinutes') != 0:
            continue
        key = (r['trainNo'], r['typeId'], r['direction'], r['stationId'], r['scheduleVersion'])
        dt = datetime.fromisoformat(r['sourceEventAt'].replace('Z', '+00:00')).astimezone(TZ)
        groups[key].append(dt.hour * 3600 + dt.minute * 60 + dt.second)
    return [dict(group=key, days=len(times), meanSeconds=mean(times),
        medianSeconds=median(times), earliestSeconds=min(times), latestSeconds=max(times),
        eligibleForCalibration=len(times) >= 7, publicationStatus='待現場校正；不可自動發布')
        for key, times in groups.items()]
