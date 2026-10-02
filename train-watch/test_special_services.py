import unittest
from special_services import special_services
class SpecialServicesTest(unittest.TestCase):
 def train(self,line='1',note='',code='1130',stops=None):
  return dict(Train='6725',CarClass=code,Line=line,LineDir='2',Note=note,TimeInfos=stops or [dict(Station='1080',Order='1',ARRTime='11:05:00',DEPTime='11:20:00'),dict(Station='3300',Order='2',ARRTime='13:23:00',DEPTime='13:38:00')])
 def scan(self,t):return special_services(dict(TrainInfos=[t]),'2026-10-03','https://official.example/schedule')
 def test_mountain_pass_has_no_invented_time(self):
  r=self.scan(self.train())[0];self.assertEqual(r['kind'],'通過不停');self.assertIsNone(r['arrival']);self.assertIsNone(r['departure']);self.assertNotIn('expectedPassTime',r);self.assertFalse(r['nameConfirmed'])
 def test_coast_line_excluded(self):self.assertEqual(self.scan(self.train(line='2')),[])
 def test_name_does_not_prove_route(self):self.assertEqual(self.scan(self.train(line='2',note='山嵐號')),[])
 def test_ordinary_services_not_added(self):self.assertEqual(self.scan(self.train(code='1131')),[])
 def test_unbracketed_route_excluded(self):
  self.assertEqual(self.scan(self.train(stops=[dict(Station='6000',Order='1',ARRTime='11:00:00',DEPTime='11:00:00'),dict(Station='3300',Order='2',ARRTime='13:00:00',DEPTime='13:00:00')])),[])
 def test_official_stop_is_retained(self):
  r=self.scan(self.train(stops=[dict(Station='1080',Order='1',ARRTime='11:00:00',DEPTime='11:00:00'),dict(Station='3160',Order='2',ARRTime='12:00:00',DEPTime='12:02:00'),dict(Station='3300',Order='3',ARRTime='13:00:00',DEPTime='13:00:00')]))[0]
  self.assertEqual(r['arrival'],'12:00:00');self.assertEqual(r['departure'],'12:02:00');self.assertEqual(r['kind'],'中途停靠')
 def test_name_only_from_official_note(self):self.assertEqual(self.scan(self.train(note='環島之星觀光列車'))[0]['label'],'環島之星')
 def test_reverse_bracket_is_northbound(self):
  t=self.train();t['TimeInfos'][0]['Station']='3300';t['TimeInfos'][1]['Station']='1080';self.assertEqual(self.scan(t)[0]['direction'],'北上')
if __name__=='__main__':unittest.main()
