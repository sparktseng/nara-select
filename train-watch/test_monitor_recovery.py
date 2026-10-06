import unittest
import tempfile
import os
import json
from pathlib import Path
from unittest.mock import patch
from urllib.error import HTTPError
import station_monitor as observer
from monitor_relay import fresh_start
from pass_samples import daily_samples, summarize
from datetime import datetime, timezone

class RecoveryTests(unittest.TestCase):
    def test_transient_failure_retries_and_keeps_checkpoint(self):
        def fetch(url, *args, **kwargs):
            if url == observer.TOKEN:
                return {'access_token': 'test-only-token', 'expires_in': 3600}
            fetch.calls += 1
            if fetch.calls == 1:
                raise HTTPError(url, 503, 'temporary', None, None)
            return {'TrainLiveBoards': []}
        fetch.calls = 0
        with tempfile.TemporaryDirectory() as d, patch.dict(os.environ,
                {'TDX_CLIENT_ID': 'test', 'TDX_CLIENT_SECRET': 'test'}), \
                patch.object(observer, 'fetch', side_effect=fetch), \
                patch.object(observer, 'schedules', return_value={}), \
                patch.object(observer.time, 'sleep'):
            self.assertTrue(observer.run(1, 60, Path(d)))
            summary = json.loads((Path(d) / 'summary.json').read_text())
            self.assertEqual(summary['retryCount'], 1)
            self.assertEqual(summary['samples'], 1)
            self.assertIsNotNone(summary['lastSuccessfulSampleAt'])

    def test_persistent_error_saves_failure_and_stops_after_five_samples(self):
        with tempfile.TemporaryDirectory() as d, patch.dict(os.environ,
                {'TDX_CLIENT_ID': 'test', 'TDX_CLIENT_SECRET': 'test'}), \
                patch.object(observer, 'fetch', side_effect=HTTPError('u', 401, 'x', None, None)), \
                patch.object(observer, 'schedules', return_value={}), \
                patch.object(observer.time, 'sleep'):
            self.assertFalse(observer.run(10, 60, Path(d)))
            summary = json.loads((Path(d) / 'summary.json').read_text())
            self.assertEqual(summary['consecutiveFailures'], 5)
            self.assertEqual(summary['failedSamples'], 5)
            self.assertTrue((Path(d) / 'events.json').exists())

    def test_empty_station_results_still_count_as_healthy_queries(self):
        now = datetime(2026,10,3,5,0,tzinfo=timezone.utc)
        self.assertTrue(fresh_start([{'name':'tra-three-stations-start-1-1',
            'created_at':'2026-10-03T04:50:00Z','expired':False}], now))
        self.assertFalse(fresh_start([{'name':'tra-three-stations-1-1-part01',
            'created_at':'2026-10-03T04:00:00Z','expired':False}], now))

    def event(self, at='2026-10-03T09:19:57+08:00', **change):
        r=dict(classification='動態已回報・表定不停靠', stale=False,
            initialSnapshot=False,scheduleVersion='v1',typeId='110G',type='自強(3000)',
            direction='南下',stationId='3160',trainNo='111',sourceEventAt=at,
            delayMinutes=0,status=2)
        r.update(change)
        return r

    def test_daily_duplicates_and_changed_types_are_separated(self):
        rows=[self.event(),self.event('2026-10-03T09:20:13+08:00'),
            self.event(typeId='1108'),self.event(scheduleVersion='v2'),
            self.event(stale=True),self.event(initialSnapshot=True)]
        result=daily_samples(rows)
        self.assertEqual(len(result),3)
        first=next(x for x in result if x['typeId']=='110G' and x['scheduleVersion']=='v1')
        self.assertEqual(first['sourceEventAt'],'2026-10-03T09:19:57+08:00')
        self.assertEqual(first['repeatedEventCount'],2)

    def test_delays_and_fewer_than_seven_days_do_not_qualify(self):
        self.assertEqual(summarize([self.event(delayMinutes=7)]),[])
        result=summarize([self.event()])[0]
        self.assertEqual(result['days'],1)
        self.assertFalse(result['eligibleForCalibration'])
        self.assertIn('不可自動發布', result['publicationStatus'])

if __name__ == '__main__':
    unittest.main()
