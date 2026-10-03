import unittest
from tdx_validate import audit_events


class EventClockAudit(unittest.TestCase):
    def row(self, **changes):
        r = dict(eventDate='2026-10-03', trainNo='165', stationId='3160', status=2,
                 sourceEventAt='2026-10-03T15:16:30+08:00', stale=False,
                 initialSnapshot=False, classification='動態已回報・表定不停靠')
        r.update(changes)
        return r

    def test_repeated_artifacts_are_one_event(self):
        r = audit_events([self.row(), self.row()])
        self.assertEqual(r['uniqueEvents'], 1)
        self.assertEqual(len(r['freshNonstopEvents']), 1)

    def test_stale_initial_and_unknown_freshness_excluded(self):
        rows = [self.row(stale=True), self.row(initialSnapshot=True, trainNo='166'),
                self.row(stale=None, trainNo='167')]
        self.assertEqual(audit_events(rows)['freshNonstopEvents'], [])

    def test_update_churn_is_not_multiple_passages(self):
        rows = [self.row(), self.row(sourceEventAt='2026-10-03T15:17:30+08:00')]
        r = audit_events(rows)
        self.assertEqual(len(r['sameStationStatusMultipleUpdateTimes']), 1)
        self.assertFalse(r['physicalPassageTimeMeasured'])


if __name__ == '__main__':
    unittest.main()
