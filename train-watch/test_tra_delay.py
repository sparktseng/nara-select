import unittest
from datetime import datetime
from tra_delay import TZ,delay,train_status,selected_rows

class DelayTests(unittest.TestCase):
 def setUp(self): self.now=datetime(2026,10,9,12,0,tzinfo=TZ)
 def page(self,states):
  return '區間 1234 查詢時間:2026/10/09 12:00:00<table>'+''.join('<tr>'+''.join('<td>'+x+'</td>' for x in [station,'12:01','12:02',status])+'</tr>' for station,status in states)+'</table>'
 def test_blank_is_unknown(self):
  self.assertIsNone(delay(''));self.assertEqual(delay('準點'),0);self.assertEqual(delay('誤點 8 分'),8)
  self.assertIsNone(train_status(self.page([('苗栗','')]),'1234','2026-10-09',self.now))
 def test_current_delay_before_miaoli(self):
  r=train_status(self.page([('竹南','誤點 8 分'),('苗栗','')]),'1234','2026-10-09',self.now)
  self.assertEqual(r['DelayTime'],8)
 def test_passed_train_not_reused(self):
  self.assertIsNone(train_status(self.page([('苗栗',''),('銅鑼','準點')]),'1234','2026-10-09',self.now))
 def test_stale_wrong_date_and_train_rejected(self):
  for page,train,day in [(self.page([('苗栗','準點')]).replace('12:00:00','11:00:00'),'1234','2026-10-09'),(self.page([('苗栗','準點')]),'1234','2026-10-10'),(self.page([('苗栗','準點')]),'1235','2026-10-09')]:
   with self.assertRaises(ValueError):train_status(page,train,day,self.now)
 def test_only_three_and_late_train_kept(self):
  rows=[{'train':str(i),'arrival':t,'departure':t} for i,t in enumerate(['11:58:00','12:01:00','12:02:00','12:03:00'],1)]
  result=selected_rows({'days':{'2026-10-09':rows}},self.now,{'1':8})
  self.assertEqual([r['train'] for r in result],['2','3','4'])
  result=selected_rows({'days':{'2026-10-09':rows}},self.now,{'1':3})
  self.assertIn('1',[r['train'] for r in result]);self.assertEqual(len(result),3)
if __name__=='__main__':unittest.main()
