"""Bounded public-source change monitor; never promote prose to a timetable."""
import argparse,concurrent.futures,hashlib,json,re
from datetime import datetime,date
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin,urlparse,parse_qsl,urlencode,urlunparse
from urllib.request import Request,HTTPRedirectHandler,build_opener
from urllib.error import HTTPError
from zoneinfo import ZoneInfo
BASE='https://www.railway.gov.tw'
ROOT=BASE+'/tra-tip-web/tip/tip00N/tipN01/'
SOURCES=[('臺鐵最新消息',BASE+'/tra-tip-web/tip/tip009/tip911/newsList?page='+str(i)) for i in range(3)]+[
 ('臺鐵觀光列車',ROOT+'journey/index?lang=zh_TW'),('海風號',ROOT+'public/index/005?lang=zh_TW'),
 ('山嵐號',ROOT+'public/index/006?lang=zh_TW'),('鳴日號',ROOT+'sun/index?lang=zh_TW'),
 ('環島之星',ROOT+'around/index?lang=zh_TW'),('藍皮解憂號',ROOT+'blue/index?lang=zh_TW')]
WORDS=re.compile('山嵐|海風號|鳴日|藍皮|環島之星|蒸汽|蒸氣|仲夏寶島|專列|迴送|回送|彩繪|寶可夢|停駛|改線')
OFFICIAL={'www.railway.gov.tw','tip.railway.gov.tw'}
ALLOWED=OFFICIAL|{'event.liontravel.com','www.liontravel.com','www.eztravel.com.tw','vacation.eztravel.com.tw'}
PENDING='待核對日期、車次與苗栗山線路線'
MAX_BYTES=3000000

def allowed(url):
 u=urlparse(url)
 return u.scheme=='https' and u.hostname in ALLOWED and not u.username and u.port in (None,443)

def canonical(url):
 u=urlparse(url)
 if u.hostname in OFFICIAL and u.path.endswith('/newsDtl'):
  news=dict(parse_qsl(u.query)).get('newsNo')
  if news:return urlunparse(('https','www.railway.gov.tw',u.path,'',urlencode({'newsNo':news}),''))
 return urlunparse(u._replace(fragment=''))

class Redirects(HTTPRedirectHandler):
 def __init__(self):self.chain=[]
 def redirect_request(self,req,fp,code,msg,headers,newurl):
  self.chain.append(dict(status=code,url=newurl))
  if not allowed(newurl):raise ValueError('unsupported redirect: '+newurl)
  return super().redirect_request(req,fp,code,msg,headers,newurl)

class Page(HTMLParser):
 def __init__(self):
  super().__init__();self.skip=0;self.text=[];self.links=[];self.anchor=None;self.title=[];self.in_title=False
  self.article=[];self.article_depth=0
 def handle_starttag(self,tag,attrs):
  attrs=dict(attrs)
  if tag in ('script','style'):self.skip+=1
  if tag=='title':self.in_title=True
  if tag=='a':self.anchor=[attrs.get('href',''),[]]
  if tag=='div':
   if self.article_depth:self.article_depth+=1
   elif 'article' in attrs.get('class','').split():self.article_depth=1
  if self.article_depth:
   if tag in ('a','img'):self.article.append(attrs.get('href',attrs.get('src','')))
   if tag in ('p','div','br','tr'):self.article.append('\n')
  if tag in ('p','div','tr','li','br','h1','h2','h3'):self.text.append('\n')
 def handle_endtag(self,tag):
  if tag in ('script','style'):self.skip=max(0,self.skip-1)
  if tag=='title':self.in_title=False
  if tag=='div' and self.article_depth:self.article_depth-=1
  if tag=='a' and self.anchor:
   self.links.append((self.anchor[0],''.join(self.anchor[1]).strip()));self.anchor=None
 def handle_data(self,data):
  if self.skip:return
  self.text.append(data)
  if self.article_depth:self.article.append(data)
  if self.in_title:self.title.append(data)
  if self.anchor:self.anchor[1].append(data)
 def plain(self):return '\n'.join(' '.join(l.split()) for l in ''.join(self.text).splitlines() if l.strip())

def lion_schema(raw):
 # PageBuilder's data is already in the response. Decode JSON only; never eval JS.
 m=re.search(r'\b(?:var|let|const)\s+jsonString\s*=\s*',raw)
 if not m:raise ValueError('missing Lion PageBuilder jsonString; dynamic content unavailable')
 schema,_=json.JSONDecoder().raw_decode(raw[m.end():])
 if not isinstance(schema,list) or not schema or not all(isinstance(v,dict) for v in schema):
  raise ValueError('unexpected Lion PageBuilder schema')
 # Content fields only: avoid a successful snapshot consisting solely of layout settings.
 texts=[]
 def walk(v):
  if isinstance(v,dict):
   for k,x in v.items():
    if k in {'content','text','title','description','tableHTML','myProductTitle','myProductDescription','question','answer'} and isinstance(x,str):
     p=Page();p.feed(x);texts.append(p.plain())
    elif isinstance(x,(dict,list)):walk(x)
  elif isinstance(v,list):
   for x in v:walk(x)
 walk(schema)
 text='\n'.join(texts)
 if len(text)<100:raise ValueError('Lion PageBuilder has insufficient embedded content')
 return text,json.dumps(schema,ensure_ascii=False,sort_keys=True,separators=(',',':'))

def fetch(item):
 name,url=item;redirects=Redirects();result=dict(name=name,url=url,status='failed');stage='request'
 try:
  if not allowed(url):raise ValueError('unsupported source URL: '+url)
  with build_opener(redirects).open(Request(url,headers={'User-Agent':'NaraSelect-PublicTrainMonitor/1.0'}),timeout=25) as r:
   result.update(finalUrl=r.url,httpStatus=r.status)
   if not allowed(r.url):raise ValueError('unsupported final URL: '+r.url)
   stage='read';body=r.read(MAX_BYTES+1);result['responseBytes']=len(body)
   if len(body)>MAX_BYTES:raise ValueError('response exceeds 3000000 byte limit')
   raw=body.decode('utf-8-sig',errors='replace')
  stage='parse';p=Page();p.feed(raw);text=p.plain();snapshot=text;mode='html'
  if urlparse(result['finalUrl']).hostname=='event.liontravel.com':
   text,snapshot=lion_schema(raw);mode='lion-pagebuilder-json'
   result['coverage']='embedded page data only; live inventory/API not checked'
  elif urlparse(url).hostname in OFFICIAL and urlparse(url).path.endswith('/newsDtl'):
   snapshot=' '.join(''.join(p.article).split());mode='tra-article'
   if not snapshot:raise ValueError('missing TRA article content')
   pub=re.search(r'發[佈布]日期[：:]\s*(\d{4})/(\d{1,2})/(\d{1,2})',text)
   if pub:result['publishedDate']=date(*map(int,pub.groups())).isoformat()
  result.update(textLength=len(text),extractionMode=mode)
  if len(text)<100:raise ValueError('empty page: fewer than 100 readable characters')
  result.update(status='ok',fingerprint=hashlib.sha256(snapshot.encode()).hexdigest(),title=''.join(p.title).strip(),links=p.links)
 except Exception as e:
  result.update(error=type(e).__name__,errorMessage=str(e)[:1000],errorStage=stage)
  if isinstance(e,HTTPError):result.update(httpStatus=e.code,finalUrl=e.url)
 finally:result['redirects']=redirects.chain
 return result

def merge_candidates(items):
 result={}
 for c in items:
  c=dict(c);key=canonical(c['source']);c['source']=key;prior=result.get(key)
  if prior:
   first=min(prior['firstSeenAt'],c['firstSeenAt'])
   if prior.get('lastChangedAt','')>c.get('lastChangedAt',''):c=prior
   c['firstSeenAt']=first
  result[key]=c
 return result

def expiry(c):
 # Only a single explicit dated cancellation, not multiple dates/ranges or relative days.
 if c.get('expiresAt'):return date.fromisoformat(c['expiresAt'])
 title=c['title']
 if '停駛' not in title or re.search(r'至|起|迄|~|～|—|每|連續',title):return None
 days=re.findall(r'(\d{1,2})月(\d{1,2})日',title)
 if len(days)!=1:return None
 years=re.findall(r'(\d{3,4})年',title)
 if len(set(years))>1:return None
 first=datetime.fromisoformat(c['firstSeenAt']).date()
 year=int(years[0]) if years else first.year
 if year<1911:year+=1911
 try:end=date(year,*map(int,days[0]))
 except ValueError:return None
 # Without an explicit year, only infer an upcoming date near the original discovery.
 if not years and not 0<=(end-first).days<=120:return None
 return end

def clean_candidates(items,now):
 active=[];archive=[];today=datetime.fromisoformat(now).date()
 for c in items:
  c['verified']=False
  end=expiry(c)
  if end and end<today:
   c.update(expiresAt=end.isoformat(),status='已封存：明確停駛日期已過',archiveReason='explicit-cancellation-date',archivedAt=c.get('archivedAt',now));archive.append(c)
  else:
   stale=(today-datetime.fromisoformat(c['firstSeenAt']).date()).days>30
   c['status']='舊線索待複核：不代表已失效' if stale else PENDING
   active.append(c)
 return active,archive

def monitor(previous=None):
 previous=previous or {};now=datetime.now(ZoneInfo('Asia/Taipei')).isoformat()
 old={canonical(p['url']):p for p in previous.get('pages',[])}
 with concurrent.futures.ThreadPoolExecutor(max_workers=4) as ex:pages=list(ex.map(fetch,SOURCES))
 details={}
 for p in pages:
  for href,title in p.pop('links',[]):
   url=canonical(urljoin(p.get('finalUrl',p['url']),href));host=urlparse(url).hostname
   if not allowed(url):continue
   if 'newsDtl' in url and WORDS.search(title):details[url]=(title,url)
   elif host in ALLOWED-OFFICIAL and ('行程' in title or '訂購' in title):details[url]=('觀光列車承辦行程',url)
 # Bound requests; dates/routes in prose are review clues, never published services.
 with concurrent.futures.ThreadPoolExecutor(max_workers=4) as ex:pages.extend(ex.map(fetch,list(details.values())[:20]))
 candidates=merge_candidates(previous.get('archivedCandidates',[])+previous.get('candidates',[]))
 for p in pages:
  p.pop('links',None);key=canonical(p['url']);prior=old.get(key,{})
  p['lastAttemptAt']=now;p['changed']=p.get('fingerprint')!=prior.get('fingerprint') if p['status']=='ok' else False
  p['lastSuccessAt']=now if p['status']=='ok' else prior.get('lastSuccessAt')
  p['consecutiveFailures']=prior.get('consecutiveFailures',0)+1 if p['status']=='failed' else 0
  if p['status']=='failed' and prior.get('fingerprint'):p['fingerprint']=prior['fingerprint']
  if p['status']=='ok' and ('newsDtl' in p['url'] or urlparse(p['url']).hostname not in OFFICIAL):
   c=candidates.get(key)
   if p['changed'] or c is None:
    c=dict(c or {},title=p['name'],source=key,firstSeenAt=(c or {}).get('firstSeenAt',now),lastChangedAt=now,status=PENDING)
    if c.get('archiveReason')=='explicit-cancellation-date':
     for field in ('expiresAt','archiveReason','archivedAt'):c.pop(field,None)
    candidates[key]=c
   c.update(lastSeenAt=now,verified=False)
 active,archive=clean_candidates(candidates.values(),now)
 active=sorted(active,key=lambda c:c.get('lastChangedAt',''))[-100:]
 archive=sorted(archive,key=lambda c:c.get('archivedAt',''))[-100:]
 ok=sum(p['status']=='ok' for p in pages)
 return dict(checkedAt=now,status='ok' if ok==len(pages) else 'partial' if ok else 'failed',pages=pages,candidates=active,archivedCandidates=archive,
  summary=dict(pagesOk=ok,pagesFailed=len(pages)-ok,activeCandidates=len(active),archivedCandidates=len(archive),staleCandidates=sum(c['status'].startswith('舊線索') for c in active),detailLinksFound=len(details),detailLinksChecked=min(20,len(details))),
  scope='臺鐵消息前三頁、五款觀光列車官方頁及頁面提供的承辦行程連結；不含未公開調度或全部社群消息；雄獅僅比對內嵌頁面資料，不保證即時庫存完整')
if __name__=='__main__':
 ap=argparse.ArgumentParser();ap.add_argument('--output',type=Path,required=True);a=ap.parse_args()
 old=json.loads(a.output.read_text()) if a.output.exists() else {}
 d=monitor(old);a.output.write_text(json.dumps(d,ensure_ascii=False,separators=(',',':')))
 print('Source monitor:',d['status'],json.dumps(d['summary'],ensure_ascii=False))
 if d['status']=='failed':raise SystemExit(1)
