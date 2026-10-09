"""Public TRA HTML snapshots for only the next three stopping trains at Miaoli."""
import argparse
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta
from html import unescape
from html.parser import HTMLParser
import json
from pathlib import Path
import re
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from zoneinfo import ZoneInfo

TZ = ZoneInfo('Asia/Taipei')
BASE = 'https://www.railway.gov.tw'
STATION = BASE + '/tra-tip-web/tip/tip001/tip112/querybystationblank'
TRAIN = BASE + '/tra-tip-web/tip/tip001/tip112/querybytrainno'

class Rows(HTMLParser):
    def __init__(self):
        super().__init__(); self.rows=[]; self.row=None; self.cell=None
    def handle_starttag(self, tag, attrs):
        if tag == 'tr': self.row=[]
        if tag == 'td' and self.row is not None: self.cell=[]
    def handle_data(self, data):
        if self.cell is not None: self.cell.append(data)
    def handle_endtag(self, tag):
        if tag == 'td' and self.cell is not None:
            self.row.append(' '.join(' '.join(self.cell).split())); self.cell=None
        if tag == 'tr' and self.row is not None:
            self.rows.append(self.row); self.row=None

def rows(text):
    p=Rows(); p.feed(text); return p.rows

def delay(text):
    if text.strip() == '準點': return 0
    m=re.fullmatch(r'誤點\s*(\d+)\s*分', text.strip())
    return int(m[1]) if m and int(m[1]) <= 240 else None

def read(url):
    with urlopen(Request(url, headers={'User-Agent':'NaraSelect-MiaoliDelay/1.0 (+https://nara5.tw/miaoli-trains.html)'}), timeout=25) as r:
        return r.read().decode('utf-8')

def station_hints(text):
    result={}
    for r in rows(text):
        if len(r) < 6: continue
        m=re.search(r'(?:區間快|區間|普悠瑪|太魯閣|莒光|復興|自強(?:\(3000\))?)\s*(\d+)\s*\(', r[1])
        if m: result[str(int(m[1]))]=delay(r[-1])
    return result

def train_status(text, train, day, now):
    """Only accept one current status marker, on or before Miaoli in stop order."""
    p=' '.join(unescape(re.sub('<[^>]+>', ' ', text)).split())
    stamp=re.search(r'查詢時間[:：]\s*(\d{4}/\d{2}/\d{2} \d{2}:\d{2}:\d{2})',p)
    if not stamp: raise ValueError('Missing source query time')
    source_time=datetime.strptime(stamp[1],'%Y/%m/%d %H:%M:%S').replace(tzinfo=TZ)
    if source_time.date().isoformat()!=day or not -60 <= (now-source_time).total_seconds() <= 180:
        raise ValueError('Stale or wrong-date source')
    # Validate returned train header, rather than accepting an error page.
    if not re.search(r'(?:區間快|區間|普悠瑪|太魯閣|莒光|復興|自強(?:\(3000\))?)\s*'+re.escape(str(int(train)))+r'(?!\d)',p):
        raise ValueError('Wrong train')
    stops=[r for r in rows(text) if len(r)==4 and re.fullmatch(r'\d{2}:\d{2}',r[1]) and re.fullmatch(r'\d{2}:\d{2}',r[2])]
    miaoli=next((i for i,r in enumerate(stops) if r[0]=='苗栗'),None)
    markers=[(i,r) for i,r in enumerate(stops) if delay(r[3]) is not None]
    if miaoli is None or len(markers)!=1: return None
    i,r=markers[0]
    if i>miaoli: return None
    return {'TrainNo':str(train),'DelayTime':delay(r[3]),'UpdateTime':source_time.isoformat(),
            'reportedAtStation':r[0],'source':TRAIN+'?'+urlencode({'rideDate':day.replace('-','/'),'trainNo':train})}

def selected_rows(schedule, now, hints):
    day=now.date().isoformat(); candidates=[]
    for r in schedule.get('days',{}).get(day,[]):
        end=r.get('departure') or r.get('arrival')
        if not end: continue
        at=datetime.fromisoformat(day+'T'+end).replace(tzinfo=TZ)
        # Old station values help find late trains, but are never published as current delay.
        late=hints.get(str(int(r['train']))) or 0
        if at+timedelta(minutes=late) < now or at < now-timedelta(hours=4): continue
        start=r.get('arrival') or end
        order=datetime.fromisoformat(day+'T'+start).replace(tzinfo=TZ)+timedelta(minutes=late)
        candidates.append((order, r))
    return [r for _,r in sorted(candidates,key=lambda x:(x[0],str(x[1]['train'])))[:3]]

def collect(schedule, now=None):
    now=now or datetime.now(TZ); day=now.date().isoformat()
    station_url=STATION+'?'+urlencode({'rideDate':day.replace('-','/'),'station':'3160-苗栗'})
    text=read(station_url); hints=station_hints(text)
    if len(hints)<30: raise ValueError('Station timetable incomplete')
    chosen=selected_rows(schedule,now,hints)
    def one(r):
        url=TRAIN+'?'+urlencode({'rideDate':day.replace('-','/'),'trainNo':r['train']})
        try:
            text=read(url)
            return train_status(text,r['train'],day,datetime.now(TZ)),None
        except Exception as e: return None, type(e).__name__
    with ThreadPoolExecutor(max_workers=3) as pool: results=list(pool.map(one,chosen))
    return {'schemaVersion':1,'serviceDate':day,'receivedAt':datetime.now(TZ).isoformat(),
            'source':'TRA public website','sourceUrl':station_url,'scope':'next-three-stopping-trains',
            'selectedTrains':[str(r['train']) for r in chosen],
            'trains':[r for r,error in results if r is not None],
            'failedQueries':sum(error is not None for r,error in results),'stationEvents':[]}

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--schedule',default='train-watch/schedule-days.json');p.add_argument('--output',default='train-watch/tra-delay.json');a=p.parse_args()
    d=collect(json.loads(Path(a.schedule).read_text()));Path(a.output).write_text(json.dumps(d,ensure_ascii=False,separators=(',',':'))+'\n')
    print('TRA next three:',d['selectedTrains'],'valid statuses:',len(d['trains']),'failed queries:',d['failedQueries'])
