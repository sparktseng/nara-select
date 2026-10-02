"""Bounded twice-daily public-source change monitor; never promote prose to a timetable."""
import argparse,concurrent.futures,hashlib,json,re
from datetime import datetime
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin,urlparse
from urllib.request import Request,urlopen
from zoneinfo import ZoneInfo
BASE='https://www.railway.gov.tw'
ROOT=BASE+'/tra-tip-web/tip/tip00N/tipN01/'
SOURCES=[('臺鐵最新消息',BASE+'/tra-tip-web/tip/tip009/tip911/newsList?page='+str(i)) for i in range(3)]+[
 ('臺鐵觀光列車',ROOT+'journey/index?lang=zh_TW'),('海風號',ROOT+'public/index/005?lang=zh_TW'),
 ('山嵐號',ROOT+'public/index/006?lang=zh_TW'),('鳴日號',ROOT+'sun/index?lang=zh_TW'),
 ('環島之星',ROOT+'around/index?lang=zh_TW'),('藍皮解憂號',ROOT+'blue/index?lang=zh_TW')]
WORDS=re.compile('山嵐|海風號|鳴日|藍皮|環島之星|蒸汽|蒸氣|仲夏寶島|專列|迴送|回送|彩繪|寶可夢|停駛|改線')
ALLOWED={'www.railway.gov.tw','tip.railway.gov.tw','event.liontravel.com','www.liontravel.com','www.eztravel.com.tw','vacation.eztravel.com.tw'}
class Page(HTMLParser):
 def __init__(self):
  super().__init__();self.skip=0;self.text=[];self.links=[];self.anchor=None;self.title=[];self.in_title=False
 def handle_starttag(self,tag,attrs):
  if tag in ('script','style'):self.skip+=1
  if tag=='title':self.in_title=True
  if tag=='a':self.anchor=[dict(attrs).get('href',''),[]]
  if tag in ('p','div','tr','li','br','h1','h2','h3'):self.text.append('\n')
 def handle_endtag(self,tag):
  if tag in ('script','style'):self.skip=max(0,self.skip-1)
  if tag=='title':self.in_title=False
  if tag=='a' and self.anchor:
   self.links.append((self.anchor[0],''.join(self.anchor[1]).strip()));self.anchor=None
 def handle_data(self,data):
  if self.skip:return
  self.text.append(data)
  if self.in_title:self.title.append(data)
  if self.anchor:self.anchor[1].append(data)
 def plain(self):return '\n'.join(' '.join(l.split()) for l in ''.join(self.text).splitlines() if l.strip())
def fetch(item):
 name,url=item
 try:
  if urlparse(url).hostname not in ALLOWED:raise ValueError('unsupported source host')
  with urlopen(Request(url,headers={'User-Agent':'NaraSelect-PublicTrainMonitor/1.0'}),timeout=25) as r:
   if urlparse(r.url).hostname not in ALLOWED:raise ValueError('unsupported redirect')
   raw=r.read(3000000).decode('utf-8-sig',errors='replace')
  p=Page();p.feed(raw);text=p.plain()
  if len(text)<100:raise ValueError('empty page')
  return dict(name=name,url=url,status='ok',fingerprint=hashlib.sha256(text.encode()).hexdigest(),title=''.join(p.title).strip(),links=p.links)
 except Exception as e:return dict(name=name,url=url,status='failed',error=type(e).__name__)
def monitor(previous=None):
 previous=previous or {};now=datetime.now(ZoneInfo('Asia/Taipei')).isoformat();old={p['url']:p for p in previous.get('pages',[])}
 with concurrent.futures.ThreadPoolExecutor(max_workers=4) as ex:pages=list(ex.map(fetch,SOURCES))
 details={}
 for p in pages:
  for href,title in p.pop('links',[]):
   url=urljoin(p['url'],href);host=urlparse(url).hostname
   if host not in ALLOWED:continue
   if 'newsDtl' in url and WORDS.search(title):details[url]=(title,url)
   elif host in ALLOWED-{'www.railway.gov.tw','tip.railway.gov.tw'} and ('行程' in title or '訂購' in title):details[url]=('觀光列車承辦行程',url)
 # Bound requests; dates/routes in prose are review clues, never published services.
 with concurrent.futures.ThreadPoolExecutor(max_workers=4) as ex:pages.extend(ex.map(fetch,list(details.values())[:20]))
 candidates={c['source']:c for c in previous.get('candidates',[])}
 for p in pages:
  p.pop('links',None)
  prior=old.get(p['url'],{})
  p['lastAttemptAt']=now;p['changed']=p.get('fingerprint')!=prior.get('fingerprint') if p['status']=='ok' else False
  p['lastSuccessAt']=now if p['status']=='ok' else prior.get('lastSuccessAt')
  if p['status']=='failed' and prior.get('fingerprint'):p['fingerprint']=prior['fingerprint']
  if p['status']=='ok' and p['changed'] and ('newsDtl' in p['url'] or urlparse(p['url']).hostname not in {'www.railway.gov.tw','tip.railway.gov.tw'}):
   candidates[p['url']]=dict(title=p['name'],source=p['url'],firstSeenAt=candidates.get(p['url'],{}).get('firstSeenAt',now),lastChangedAt=now,status='待核對日期、車次與苗栗山線路線')
 ok=sum(p['status']=='ok' for p in pages)
 return dict(checkedAt=now,status='ok' if ok==len(pages) else 'partial' if ok else 'failed',pages=pages,candidates=list(candidates.values())[-100:],scope='臺鐵消息前三頁、五款觀光列車官方頁及頁面提供的承辦行程連結；不含未公開調度或全部社群消息')
if __name__=='__main__':
 ap=argparse.ArgumentParser();ap.add_argument('--output',type=Path,required=True);a=ap.parse_args()
 old=json.loads(a.output.read_text()) if a.output.exists() else {}
 d=monitor(old);a.output.write_text(json.dumps(d,ensure_ascii=False,separators=(',',':')))
 print('Source monitor:',d['status'],'pages',len(d['pages']),'review clues',len(d['candidates']))
 if d['status']=='failed':raise SystemExit(1)
