"""Refresh a seven-day Miaoli station schedule from TRA's official index."""
import argparse,json,re,time
from datetime import datetime,timedelta
from pathlib import Path
from urllib.request import Request,urlopen
from zoneinfo import ZoneInfo
from build_stopping_table import station_rows,render
BASE='https://ods.railway.gov.tw'
INDEX=BASE+'/tra-ods-web/ods/download/dataResource/railway_schedule/JSON/list'
def read(url):
    with urlopen(Request(url,headers={'User-Agent':'NaraSelect-MiaoliTimetable/1.0'}),timeout=40) as res:
        return res.read().decode('utf-8-sig')
def collect():
    index=read(INDEX)
    links=dict((d,u) for u,d in re.findall(r'<a\s+href="([^"]+)">(\d{8})\.json</a>',index))
    today=datetime.now(ZoneInfo('Asia/Taipei')).date()
    days={}
    for offset in range(7):
        day=today+timedelta(days=offset)
        try:
            payload=json.loads(read(BASE+links[day.strftime('%Y%m%d')]))
            rows=station_rows(payload)
            if not rows: raise ValueError('Empty station timetable')
            days[day.isoformat()]=rows
        except Exception:
            if offset==0: raise
        time.sleep(.3)
    return {'updatedAt':datetime.now(ZoneInfo('Asia/Taipei')).isoformat(),'days':days}
def public_page(data):
    today=next(iter(data['days']))
    page=render(data['days'][today],today)
    page=page.replace('<meta name="robots" content="noindex">','<meta name="description" content="查看今天苗栗站南下、北上停靠列車，自動顯示接下來班次，標示苗栗始發與終到。5號店整理。"><link rel="canonical" href="https://nara5.tw/miaoli-trains.html">')
    page=page.replace('苗栗站・山線｜時刻表第一版','苗栗站・山線｜停靠列車時刻表')
    page=page.replace('<strong>'+today+' 停靠苗栗站的列車</strong>｜共 '+str(len(data['days'][today]))+' 班','<strong id="dayTitle"></strong>｜<span id="dayTotal"></span>')
    page=page.replace('這是指定日期的時刻表；','本表只列停靠苗栗站的列車；')
    for key,kind in [('ORIGIN','苗栗始發'),('TERMINAL','苗栗終到'),('STOP','中途停靠')]:
        count=sum(r['kind']==kind for r in data['days'][today])
        old=str(count)+' 班'+({'ORIGIN':'，不顯示進站時間','TERMINAL':'，不顯示發車時間','STOP':''}[key])
        page=page.replace('<small>'+old+'</small>','<small id="legend'+key+'"></small>',1)
    page=page.replace('這份時刻表日期與今天不同，請勿當作今天班次使用。','今天的時刻表暫未取得，請查看臺鐵官方資訊；不會顯示其他日期的班次。')
    page=page.replace('臺鐵官方每日時刻表 '+today,'臺鐵官方每日時刻表')
    page=page.replace("const date='"+today+"',trains=[...document.querySelectorAll('tbody tr')];","let date=taipei().date,trains=[];\nconst scheduleData="+json.dumps(data,ensure_ascii=False,separators=(',',':')).replace('<','\\u003c')+";\n"+HYDRATE)
    page=page.replace('const current=taipei(),same=current.date===date;','const current=taipei();if(current.date!==date){date=current.date;live.clear();confirmedEvents.clear();hydrate(scheduleData);}const same=current.date===date&&trains.length>0;')
    page=page.replace('});filter();setInterval(filter,15000);','});hydrate(scheduleData);filter();setInterval(filter,15000);\nrefreshSchedule();setInterval(refreshSchedule,300000);')
    return page
HYDRATE=r'''
function hydrate(data){
 const rows=data.days?.[date]||[],body=document.querySelector('tbody');body.replaceChildren();
 for(const r of rows){const row=document.createElement('tr');row.hidden=true;Object.assign(row.dataset,{direction:r.direction,kind:r.kind,train:r.train,arrival:r.arrival||'—',departure:r.departure||'—'});
 const values=[r.direction,r.train,r.arrival||'—',r.departure||'—','未取得',r.kind];
 for(const value of values){const td=document.createElement('td');td.textContent=value;row.append(td);}
 const type=document.createElement('small');type.textContent=r.type;row.cells[1].append(type);row.cells[4].className='delay';
 const badge=document.createElement('span');badge.className='badge '+({'苗栗始發':'origin','苗栗終到':'terminal','中途停靠':'stop'}[r.kind]);badge.textContent=r.kind;row.cells[5].replaceChildren(badge);
 const note=document.createElement('small');note.textContent={'苗栗始發':'看出站；本站為起點','苗栗終到':'看進站；無本車次續行發車','中途停靠':'可看進站及發車'}[r.kind];row.cells[5].append(note);
 const state=document.createElement('small');state.className='state';row.cells[5].append(state);body.append(row);}
 trains=[...body.rows];document.getElementById('dayTitle').textContent=date+' 停靠苗栗站的列車';document.getElementById('dayTotal').textContent='共 '+rows.length+' 班';
 for(const [id,k,note] of [['ORIGIN','苗栗始發','，不顯示進站時間'],['TERMINAL','苗栗終到','，不顯示發車時間'],['STOP','中途停靠','']])document.getElementById('legend'+id).textContent=rows.filter(r=>r.kind===k).length+' 班'+note;
}
async function refreshSchedule(){try{const r=await fetch('https://raw.githubusercontent.com/sparktseng/nara-select/main/train-watch/schedule-days.json?v='+Math.floor(Date.now()/300000),{cache:'no-store'});if(!r.ok)throw Error('schedule');const d=await r.json();if(!Array.isArray(d.days?.[date])||!d.days[date].length)throw Error('missing_date');scheduleData.days=d.days;hydrate(scheduleData);filter();refreshLive();}catch{filter();}}
'''
if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--page',type=Path);p.add_argument('--data',type=Path,required=True);a=p.parse_args()
    data=collect();a.data.parent.mkdir(parents=True,exist_ok=True);a.data.write_text(json.dumps(data,ensure_ascii=False,separators=(',',':')))
    if a.page:a.page.write_text(public_page(data))
    print('Updated',len(data['days']),'days; today',len(next(iter(data['days'].values()))),'station rows')
