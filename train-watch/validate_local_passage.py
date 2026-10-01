"""Leave-one-train-out validation. Report abstentions and B interval coverage."""
import json
import sys
import urllib.request
from statistics import median
import local_passage_model as m

RESOURCES = {
    '2026-10-01': '8ae4c981a0f2e7d601a0f3d4ceaf1c89',
    '2026-10-03': '8ae4c981a0f2e7d601a0f3d4cf361c8b',
}

def validate(payload):
    total = 0
    errors = []
    b_errors = []
    covered = 0
    for target in payload['TrainInfos']:
        mi = next((s for s in target['TimeInfos'] if s['Station'] == m.MIAOLI), None)
        if mi is None or str(target.get('Line')) != '1':
            continue
        total += 1
        controls = {'TrainInfos': [t for t in payload['TrainInfos'] if t is not target]}
        pools, generic = m.learn(controls)
        synthetic = dict(target)
        synthetic['TimeInfos'] = [s for s in target['TimeInfos'] if s['Station'] != m.MIAOLI]
        estimate = m.estimate(synthetic, pools, generic)
        if estimate is None:
            continue
        error = abs((m.sec(estimate['center']) - m.sec(mi['ARRTime']) + 43200) % 86400 - 43200) / 60
        errors.append((error, str(target['Train']), estimate['anchor']))
        width = (m.sec(estimate['to']) - m.sec(estimate['from'])) % 86400
        if width <= 360:
            b_errors.append(error)
            covered += error <= width / 120
    values = sorted(x[0] for x in errors)
    result = {
        'eligible': total, 'predicted': len(values), 'abstained': total - len(values),
        'medianMinutes': median(values), 'p90Minutes': values[int(.9 * (len(values) - 1))],
        'maxMinutes': max(values), 'bCount': len(b_errors),
        'bIntervalCoverage': covered / len(b_errors) if b_errors else 0,
        'worst': sorted(errors, reverse=True)[:10],
    }
    assert len(values) >= 30, result
    assert result['medianMinutes'] <= 2 and result['p90Minutes'] <= 5, result
    assert result['bIntervalCoverage'] >= .9, result
    assert max(b_errors) <= 5, result
    return result

if __name__ == '__main__':
    for day, resource in RESOURCES.items():
        if len(sys.argv) > 1:
            from pathlib import Path
            payload = json.loads((Path(sys.argv[1]) / ('day' + day[-2:] + '.json')).read_text(encoding='utf-8-sig'))
        else:
            url = 'https://ods.railway.gov.tw/tra-ods-web/ods/download/dataResource/exceptionDataResource/' + resource
            req = urllib.request.Request(url, headers={'User-Agent': 'NaraSelect-Validation/1.0'})
            payload = json.loads(urllib.request.urlopen(req, timeout=40).read().decode('utf-8-sig'))
        print(day, json.dumps(validate(payload), ensure_ascii=False))
