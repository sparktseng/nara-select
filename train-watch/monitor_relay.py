"""Hand off observation runs before the current runner ends; never log tokens."""
import argparse
import json
import os
from datetime import datetime, timezone
from urllib.request import Request, urlopen

WORKFLOW = 'three-station-monitor.yml'

def api(path, data=None):
    repo = os.environ['GITHUB_REPOSITORY']
    headers = {'Authorization': 'Bearer ' + os.environ['GH_TOKEN'],
        'Accept': 'application/vnd.github+json', 'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28'}
    req = Request('https://api.github.com/repos/' + repo + path,
        headers=headers, data=None if data is None else json.dumps(data).encode())
    with urlopen(req, timeout=25) as response:
        body = response.read()
        return json.loads(body) if body else {}

def fresh_start(artifacts, at):
    return any(not a.get('expired') and
        a.get('name', '').startswith('tra-three-stations-') and
        (at - datetime.fromisoformat(a['created_at'].replace('Z', '+00:00'))).total_seconds() <= 1200
        for a in artifacts)

def healthy_other(runs, current_id, at, newer_than=None):
    for run in runs:
        if str(run['id']) == str(current_id) or run['status'] != 'in_progress':
            continue
        if newer_than and run['created_at'] <= newer_than:
            continue
        artifacts = api('/actions/runs/' + str(run['id']) + '/artifacts?per_page=100')['artifacts']
        if fresh_start(artifacts, at):
            jobs = api('/actions/runs/' + str(run['id']) + '/jobs?per_page=100')['jobs']
            if any(step.get('conclusion') == 'success' and
                    (step['name'] == 'Verify immediate authenticated snapshot' or
                     step['name'].startswith('Observe minute samples segment'))
                    for job in jobs for step in job.get('steps', [])):
                return run['id']
    return None

def main(mode):
    current_id = os.environ['GITHUB_RUN_ID']
    runs = api('/actions/workflows/' + WORKFLOW + '/runs?per_page=100')['workflow_runs']
    at = datetime.now(timezone.utc)
    current = next((r for r in runs if str(r['id']) == current_id), None)
    if not current:
        raise RuntimeError('current_run_not_found')
    other = healthy_other(runs, current_id, at,
        current['created_at'] if mode == 'handoff' else None)
    if mode == 'guard':
        collect = os.environ.get('GITHUB_EVENT_NAME') != 'schedule' or other is None
        with open(os.environ['GITHUB_OUTPUT'], 'a') as f:
            f.write('collect=' + str(collect).lower() + '\n')
        print('Collect:', collect, 'existing active observer:', other)
    elif other:
        print('Handoff already covered by observer:', other)
    else:
        api('/actions/workflows/' + WORKFLOW + '/dispatches', {'ref': 'main'})
        print('Successor requested; current observer remains active during handoff.')

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('mode', choices=['guard', 'handoff'])
    args = parser.parse_args()
    main(args.mode)
