"""Refresh a seven-day Miaoli station schedule from TRA's official index."""
import argparse,json,re,time
from datetime import datetime,timedelta
from pathlib import Path
from urllib.request import Request,urlopen
from zoneinfo import ZoneInfo
from build_stopping_table import station_rows,render
from pokemon_services import mark_rows,charter_rows,PDF
from build_pass_through_beta import beta_rows
BASE='https://ods.railway.gov.tw'
INDEX=BASE+'/tra-ods-web/ods/download/dataResource/railway_schedule/JSON/list'
def read(url):
    with urlopen(Request(url,headers={'User-Agent':'NaraSelect-MiaoliTimetable/1.0'}),timeout=40) as res:
        return res.read().decode('utf-8-sig')
def collect():
    index=read(INDEX)
    links=dict((d,u) for u,d in re.findall(r'<a\\s+href="([^"]+)"[^>]*>\\s*(\\d{8})\\.json\\s*</a>',index,re.I|re.S))
    today=datetime.now(ZoneInfo('Asia/Taipei')).date()
    days={}
    special_days={}
    pass_through_days={}
    for offset in range(7):
        day=today+timedelta(days=offset)
        try:
            payload=json.loads(read(BASE+links[day.strftime('%Y%m%d')]))
            rows=station_rows(payload)
            if not rows: raise ValueError('Empty station timetable')
            days[day.isoformat()]=mark_rows(rows,day.isoformat())
            special_days[day.isoformat()]=charter_rows(payload,day.isoformat())
            pass_through_days[day.isoformat()]=beta_rows(payload,day.isoformat())
        except Exception:
            if offset==0: raise
        time.sleep(.3)
    return {'updatedAt':datetime.now(ZoneInfo('Asia/Taipei')).isoformat(),'days':days,'specialDays':special_days,'passThroughDays':pass_through_days}
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
    page=page.replace('</style>', '.pokemon-row{background:#fff9df}.pokemon-row td:first-child{border-left:4px solid #d7a52e}.pokemon-label{display:inline-block;background:#ffeb9d;color:#634900;padding:2px 8px;border-radius:5px;margin-top:5px;font-size:12px;font-weight:700}.pokemon-panel{background:#fffdf4;border:1px solid #e5c773;border-radius:12px;padding:16px;margin:20px 0}.pokemon-panel h2{margin:0 0 8px;font-size:22px}.pokemon-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:10px;margin:12px 0}.pokemon-card{padding:12px;background:#fff;border-radius:8px;border:1px solid #e9dfbe}.pokemon-card strong{display:block}.pokemon-panel small{white-space:normal}</style>')
    page=page.replace('<section class="legend"', '<section class="pokemon-panel" aria-labelledby="pokemon-title"><h2 id="pokemon-title">寶可夢列車，下一班在哪一天？</h2><p id="pokemon-today" aria-live="polite"></p><div id="pokemon-upcoming" class="pokemon-cards"></div><small>依臺鐵公告的彩繪編組運用標示，可能因檢修或調度更換車輛。日期未公告時不推定為寶可夢列車。</small><small><a href="'+PDF+'" target="_blank" rel="noopener">查看臺鐵官方彩繪列車運用表</a></small></section><section class="legend"',1)
    page=page.replace("document.getElementById('empty').hidden=count!==0;}","document.getElementById('empty').hidden=count!==0;renderPokemon();}")
    page=page.replace('通過不停的列車另行製作。','寶可夢專列通過不停的資訊另列於下方，未公布的通過時間不推算。')
    page=page.replace('</script>', POKEMON_JS+'\n</script>')
    return page
HYDRATE=r'''
function hydrate(data){
 const rows=data.days?.[date]||[],body=document.querySelector('tbody');body.replaceChildren();
 for(const r of rows){const row=document.createElement('tr');row.hidden=true;Object.assign(row.dataset,{direction:r.direction,kind:r.kind,train:r.train,arrival:r.arrival||'—',departure:r.departure||'—'});
 const values=[r.direction,r.train,r.arrival||'—',r.departure||'—','未取得',r.kind];
 for(const value of values){const td=document.createElement('td');td.textContent=value;row.append(td);}
 if(r.special){row.className='pokemon-row';const label=document.createElement('span');label.className='pokemon-label';label.textContent=r.special.label;row.cells[1].append(label);}
 const type=document.createElement('small');type.textContent=r.type;row.cells[1].append(type);row.cells[4].className='delay';
 const badge=document.createElement('span');badge.className='badge '+({'苗栗始發':'origin','苗栗終到':'terminal','中途停靠':'stop'}[r.kind]);badge.textContent=r.kind;row.cells[5].replaceChildren(badge);
 const note=document.createElement('small');note.textContent={'苗栗始發':'看出站；本站為起點','苗栗終到':'看進站；無本車次續行發車','中途停靠':'可看進站及發車'}[r.kind];row.cells[5].append(note);
 const state=document.createElement('small');state.className='state';row.cells[5].append(state);body.append(row);}
 trains=[...body.rows];document.getElementById('dayTitle').textContent=date+' 停靠苗栗站的列車';document.getElementById('dayTotal').textContent='共 '+rows.length+' 班';
 for(const [id,k,note] of [['ORIGIN','苗栗始發','，不顯示進站時間'],['TERMINAL','苗栗終到','，不顯示發車時間'],['STOP','中途停靠','']])document.getElementById('legend'+id).textContent=rows.filter(r=>r.kind===k).length+' 班'+note;
}
async function refreshSchedule(){try{const r=await fetch('https://raw.githubusercontent.com/sparktseng/nara-select/main/train-watch/schedule-days.json?v='+Math.floor(Date.now()/300000),{cache:'no-store'});if(!r.ok)throw Error('schedule');const d=await r.json();if(!Array.isArray(d.days?.[date])||!d.days[date].length)throw Error('missing_date');scheduleData.days=d.days;scheduleData.specialDays=d.specialDays||{};hydrate(scheduleData);filter();refreshLive();}catch{filter();}}
'''

POKEMON_JS=r'''
function renderPokemon(){
 const current=taipei(),items=[];let totalToday=0;
 for(const day of Object.keys(scheduleData.days).sort()){
  if(day<current.date)continue;
  for(const r of scheduleData.days[day]){if(!r.special)continue;if(day===current.date)totalToday++;
   const end=r.departure||r.arrival;
   if(day===current.date&&visibility(r.kind,end,current.time,live.get(r.train),confirmedEvents.get(r.train)).hidden)continue;
   items.push({day,r,time:r.arrival||r.departure});}
  for(const r of scheduleData.specialDays?.[day]||[]){if(day===current.date){totalToday++;if(current.time>'13:23:00')continue;}items.push({day,r,time:null});}
 }
 const todayItems=items.filter(x=>x.day===current.date);
 document.getElementById('pokemon-today').textContent=todayItems.length?'今天還有 '+todayItems.length+' 班寶可夢列車資訊；停靠班次也在下方時刻表以黃色標示。':totalToday?'今天公告的寶可夢班次已過表定時段。':'今天沒有已核實經過苗栗站的寶可夢班次；下方列出接下來公告的日期。';
 const box=document.getElementById('pokemon-upcoming');box.replaceChildren();
 for(const x of items.sort((a,b)=>a.day.localeCompare(b.day)||String(a.time||'').localeCompare(String(b.time||''))).slice(0,6)){
  const card=document.createElement('div');card.className='pokemon-card';const title=document.createElement('strong');title.textContent=x.day+' · '+x.r.direction+' '+x.r.train+'次';card.append(title);
  const label=document.createElement('span');label.className='pokemon-label';label.textContent=x.r.special?.label||x.r.label;card.append(label);
  const note=document.createElement('p');note.textContent=x.time?'停靠苗栗｜到站 '+(x.r.arrival||'—')+'／發車 '+(x.r.departure||'—'):x.r.kind+'｜通過時間未公布';card.append(note);
  if(!x.time){const extra=document.createElement('small');extra.textContent=x.r.note;card.append(extra);}box.append(card);
 }
 if(!items.length){const p=document.createElement('p');p.textContent='目前已取得的日期內沒有後續已核實班次，請查看官方公告。';box.append(p);}
}
'''

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--page',type=Path);p.add_argument('--data',type=Path,required=True);a=p.parse_args()
    data=collect();a.data.parent.mkdir(parents=True,exist_ok=True);a.data.write_text(json.dumps(data,ensure_ascii=False,separators=(',',':')))
    if a.page:a.page.write_text(public_page(data))
    print('Updated',len(data['days']),'days; today',len(next(iter(data['days'].values()))),'station rows')
