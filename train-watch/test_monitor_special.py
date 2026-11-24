import json,unittest
from datetime import datetime
from pathlib import Path
from unittest.mock import patch
from urllib.error import HTTPError,URLError
from urllib.request import Request
import monitor_special as m

NEWS=m.BASE+'/tra-tip-web/tip/tip009/tip911/newsDtl?newsNo=abc'
LION='https://event.liontravel.com/zh-tw/railtour/shanlan'
NOW='2026-11-25T12:00:00+08:00'
CONTENT='山嵐號旅遊介紹、行程出發日期仍須查核。'*12

def schema_html(content=CONTENT):
 return '<title>山嵐號</title><script>const jsonString = '+json.dumps([dict(component='Text',data=dict(content=content))])+'; pg.render();</script>'
class Response:
 def __init__(self,raw,url=LION,status=200):self.body=raw.encode();self.url=url;self.status=status
 def __enter__(self):return self
 def __exit__(self,*args):pass
 def read(self,n):return self.body[:n]
class FetchTests(unittest.TestCase):
 def fetch(self,raw,url=LION,final=None):
  with patch.object(m,'build_opener') as op:
   op.return_value.open.return_value=Response(raw,final or url)
   return m.fetch(('test',url))
 def test_embedded_json_recovers_dynamic_page(self):
  p=self.fetch(schema_html());self.assertEqual(p['status'],'ok');self.assertEqual(p['extractionMode'],'lion-pagebuilder-json');self.assertGreater(p['textLength'],100)
 def test_runtime_script_does_not_change_fingerprint(self):
  a=self.fetch(schema_html());b=self.fetch(schema_html()+'<script>window.time=456</script>')
  self.assertEqual(a['fingerprint'],b['fingerprint'])
 def test_embedded_content_change_detected(self):
  self.assertNotEqual(self.fetch(schema_html())['fingerprint'],self.fetch(schema_html(CONTENT+'新增行程'))['fingerprint'])
 def test_missing_or_invalid_json_reports_reason(self):
  for raw in ('<title>test</title>','<script>const jsonString = [oops]</script>','<script>const jsonString = [];</script>'):
   p=self.fetch(raw);self.assertEqual(p['status'],'failed');self.assertTrue(p['errorMessage']);self.assertEqual(p['errorStage'],'parse')
 def test_schema_layout_alone_is_not_success(self):
  self.assertEqual(self.fetch(schema_html('短文'))['status'],'failed')
 def test_article_ignores_page_navigation(self):
  html='<title>臺鐵</title><p>發佈日期：2026/11/17</p><div class="article"><div>'+CONTENT+'</div></div>'
  a=self.fetch(html+'nav 1',NEWS);b=self.fetch(html+'nav 2',NEWS)
  self.assertEqual(a['status'],'ok');self.assertEqual(a['fingerprint'],b['fingerprint']);self.assertEqual(a['publishedDate'],'2026-11-17')
 def test_http_error_and_timeout_details(self):
  for err in (HTTPError(LION,403,'Forbidden',{},None),URLError('timed out')):
   with patch.object(m,'build_opener') as op:
    op.return_value.open.side_effect=err;p=m.fetch(('test',LION))
   self.assertEqual(p['status'],'failed');self.assertIn(str(err),p['errorMessage'])
  self.assertEqual(p['errorStage'],'request')
 def test_redirect_is_checked_before_following(self):
  handler=m.Redirects()
  for url in ('https://evil.example/x','http://event.liontravel.com/x'):
   with self.assertRaises(ValueError):handler.redirect_request(Request(LION),None,302,'',{},url)
  self.assertEqual(len(handler.chain),2)
 def test_allowed_redirect(self):
  handler=m.Redirects();target=LION+'/new'
  self.assertEqual(handler.redirect_request(Request(LION),None,302,'',{},target).full_url,target)
 def test_size_limit(self):
  p=self.fetch('x'*(m.MAX_BYTES+1));self.assertEqual(p['errorStage'],'read');self.assertIn('limit',p['errorMessage'])

class CandidateTests(unittest.TestCase):
 def clue(self,title='公告',source=NEWS,first='2026-10-13T03:00:00+08:00',changed='2026-11-24T03:00:00+08:00'):
  return dict(title=title,source=source,firstSeenAt=first,lastChangedAt=changed,status=m.PENDING)
 def test_canonical_preserves_identity_and_list_pagination(self):
  self.assertEqual(m.canonical(NEWS+'&page=2'),NEWS)
  self.assertNotEqual(m.canonical(NEWS),m.canonical(NEWS.replace('abc','def')))
  self.assertNotEqual(m.canonical(m.SOURCES[0][1]),m.canonical(m.SOURCES[1][1]))
 def test_legacy_merge_preserves_oldest_discovery_and_latest_change(self):
  a=self.clue(source=NEWS+'&page=0');b=self.clue(source=NEWS+'&page=2',first='2026-11-01T03:00:00+08:00',changed='2026-11-25T03:00:00+08:00')
  merged=m.merge_candidates([a,b]);self.assertEqual(len(merged),1);c=merged[NEWS]
  self.assertEqual(c['firstSeenAt'],a['firstSeenAt']);self.assertEqual(c['lastChangedAt'],b['lastChangedAt'])
 def test_explicit_cancellation_is_archived(self):
  a,b=m.clean_candidates([self.clue('因應115年考試，11月9日停駛列車')],NOW)
  self.assertEqual(a,[]);self.assertEqual(b[0]['expiresAt'],'2026-11-09');self.assertFalse(b[0]['verified'])
 def test_ambiguous_relative_and_range_dates_are_not_expired(self):
  for title in ('今(24)日停駛','11月9日至12月9日停駛','115年12月1日起停駛','11月9日、12月9日停駛','海風號2027年12月20日開賣'):
   a,b=m.clean_candidates([self.clue(title)],NOW);self.assertEqual(b,[]);self.assertEqual(len(a),1)
 def test_future_and_unknown_year_are_conservative(self):
  self.assertIsNone(m.expiry(self.clue('1月9日停駛')))
  a,b=m.clean_candidates([self.clue('115年12月9日停駛')],NOW);self.assertEqual(len(a),1);self.assertEqual(b,[])
 def test_staleness_uses_first_seen_not_chrome_changes(self):
  a,b=m.clean_candidates([self.clue()],NOW);self.assertTrue(a[0]['status'].startswith('舊線索'));self.assertEqual(b,[])
 def test_monitor_failure_retains_last_success(self):
  prior=dict(pages=[dict(url=m.SOURCES[0][1],lastSuccessAt='2026-11-24',fingerprint='old')])
  with patch.object(m,'fetch',side_effect=lambda item:dict(name=item[0],url=item[1],status='failed',error='URLError',errorMessage='timeout')):
   out=m.monitor(prior)
  self.assertEqual(out['status'],'failed');self.assertEqual(out['pages'][0]['lastSuccessAt'],'2026-11-24');self.assertEqual(out['pages'][0]['fingerprint'],'old');self.assertEqual(out['summary']['pagesFailed'],9)
 def test_corrected_notice_can_leave_archive(self):
  _,archive=m.clean_candidates([self.clue('115年11月9日停駛列車')],NOW)
  def fake(item):
   links=[(NEWS,'115年12月9日停駛列車')] if item==m.SOURCES[0] else []
   return dict(name=item[0],url=item[1],status='ok',fingerprint='updated',links=links)
  with patch.object(m,'fetch',side_effect=fake):out=m.monitor(dict(archivedCandidates=archive))
  self.assertEqual(len(out['candidates']),1);self.assertEqual(out['archivedCandidates'],[])
 def test_partial_recovery_preserves_failure_history(self):
  prior=dict(pages=[dict(url=m.SOURCES[0][1],lastSuccessAt='2026-11-24',consecutiveFailures=2)])
  def fake(item):
   if item==m.SOURCES[0]:return dict(name=item[0],url=item[1],status='failed',error='URLError',errorMessage='timeout')
   return dict(name=item[0],url=item[1],status='ok',fingerprint='ok',links=[])
  with patch.object(m,'fetch',side_effect=fake):out=m.monitor(prior)
  self.assertEqual(out['status'],'partial');self.assertEqual(out['summary']['pagesFailed'],1);self.assertEqual(out['pages'][0]['consecutiveFailures'],3)
 def test_repeat_run_does_not_reactivate_expired_clue(self):
  title='115年11月9日停駛列車';old=self.clue(title);_,archive=m.clean_candidates([old],NOW)
  def fake(item):
   links=[(NEWS+'&page=2',title)] if item==m.SOURCES[0] else []
   return dict(name=item[0],url=item[1],status='ok',fingerprint='new',links=links)
  with patch.object(m,'fetch',side_effect=fake):out=m.monitor(dict(archivedCandidates=archive))
  self.assertEqual(out['candidates'],[]);self.assertEqual(len(out['archivedCandidates']),1);self.assertNotIn('services',out)

if __name__=='__main__':unittest.main()
