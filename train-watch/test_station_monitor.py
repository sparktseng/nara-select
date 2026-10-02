import unittest
from station_monitor import extract

AT = '2026-10-03T12:39:00+08:00'
RECEIVED = '2026-10-03T12:39:08+08:00'

def row(train='6725', station='3160', typ='電車專列', at=AT):
    return dict(TrainNo=train, StationID=station, TrainTypeName={'Zh_tw': typ},
                TrainTypeID='1130', TrainStationStatus=2, DelayTime=0,
                UpdateTime=at)

class Tests(unittest.TestCase):
    def test_all_three_stations_and_unknown_special_are_retained(self):
        rows = [row('6725', '3150'), row('6725'), row('6725', '3170'),
                row('X9876', '3160', None), row('8', '3300')]
        result = extract({'TrainLiveBoards': rows}, RECEIVED, {})
        self.assertEqual(len(result), 4)
        self.assertEqual(result[-1]['type'], '未知')
        self.assertEqual(result[-1]['classification'], '停靠方式待確認')

    def test_only_observed_nonstop_with_complete_schedule(self):
        schedule = {'2026-10-03': {'6725': {'LineDir': '2', 'CarClass': '1130',
            'TimeInfos': [{'Station': '1000'}, {'Station': '3300'}]}}}
        r = extract({'TrainLiveBoards': [row()]}, RECEIVED, schedule)[0]
        self.assertEqual(r['classification'], '動態已回報・表定不停靠')
        self.assertEqual(r['direction'], '南下')
        self.assertEqual(r['eventAgeSeconds'], 8)
        self.assertFalse(r['stale'])

    def test_stopping_kept(self):
        schedule = {'2026-10-03': {'6725': {'LineDir': '1',
            'TimeInfos': [{'Station': '3160'}]}}}
        self.assertEqual(extract({'TrainLiveBoards': [row()]}, RECEIVED, schedule)[0]
                         ['classification'], '表定停靠')

    def test_stale_snapshot_is_not_new_passage(self):
        r = extract({'TrainLiveBoards': [row(at='2026-10-03T10:00:00+08:00')]},
                    RECEIVED, {}, initial=True)[0]
        self.assertTrue(r['stale'])
        self.assertTrue(r['initialSnapshot'])
        self.assertIn('非現場', r['timeMeaning'])

    def test_midnight_ambiguous_operating_day_is_unknown(self):
        t = {'6725': {'LineDir': '2', 'TimeInfos': [{'Station': '3160'}]}}
        schedule = {'2026-10-02': t, '2026-10-03': t}
        r = extract({'TrainLiveBoards': [row(at='2026-10-03T00:39:00+08:00')]},
                    '2026-10-03T00:39:08+08:00', schedule)[0]
        self.assertEqual(r['classification'], '停靠方式待確認')

    def test_missing_timezone_and_invalid_schema(self):
        r = extract({'TrainLiveBoards': [row(at='2026-10-03T12:39:00')]}, RECEIVED, {})[0]
        self.assertTrue(r['stale'])
        with self.assertRaises(ValueError):
            extract({}, RECEIVED, {})

if __name__ == '__main__':
    unittest.main()
