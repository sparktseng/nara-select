"""Refresh a seven-day Miaoli station schedule from TRA's official index."""
import argparse,json,re,time
from datetime import datetime,timedelta
from pathlib import Path
from urllib.request import Request,urlopen
from zoneinfo import ZoneInfo
from build_stopping_table import station_rows,render
from pokemon_services import mark_rows,charter_rows
from train_guide import add_train_guide
from special_services import special_services
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
    special_days={}
    observed_special=[]
    for offset in range(7):
        day=today+timedelta(days=offset)
        try:
            payload=json.loads(read(BASE+links[day.strftime('%Y%m%d')]))
            observed_special.extend(special_services(payload,day.isoformat(),BASE+links[day.strftime('%Y%m%d')]))
            rows=station_rows(payload)
            if not rows: raise ValueError('Empty station timetable')
            days[day.isoformat()]=mark_rows(rows,day.isoformat())
            special_days[day.isoformat()]=charter_rows(payload,day.isoformat())
        except Exception:
            if offset==0: raise
        time.sleep(.3)
    return {'updatedAt':datetime.now(ZoneInfo('Asia/Taipei')).isoformat(),'days':days,'specialDays':special_days,'observedSpecial':observed_special}
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
    page=page.replace('<option value="中途停靠">中途停靠</option>','<option value="中途停靠">中途停靠</option><option value="通過不停">特殊列車・通過不停</option>',1)
    page=page.replace('苗栗站表定到站／發車時間（臺灣時間）','苗栗站列車時間（臺灣時間）')
    page=page.replace('本表只列停靠苗栗站的列車；','停靠與已核實經過苗栗站的列車；')
    page=page.replace("const date='"+today+"',trains=[...document.querySelectorAll('tbody tr')];","let date=taipei().date,trains=[];\nconst scheduleData="+json.dumps(data,ensure_ascii=False,separators=(',',':')).replace('<','\\u003c')+";\n"+HYDRATE)
    page=page.replace('const current=taipei(),same=current.date===date;','const current=taipei();if(current.date!==date){date=current.date;live.clear();confirmedEvents.clear();hydrate(scheduleData);}const same=current.date===date&&trains.length>0;')
    page=page.replace('});filter();setInterval(filter,15000);','});hydrate(scheduleData);filter();setInterval(filter,15000);\nrefreshSchedule();setInterval(refreshSchedule,300000);')
    page=page.replace("const status=visibility(row.dataset.kind,base,current.time,live.get(row.dataset.train),confirmedEvents.get(row.dataset.train));row.querySelector('.state').textContent=status.state;","const status=row.dataset.special==='1'?{hidden:row.dataset.passTime!=='?'&&row.dataset.passTime<current.time,state:''}:visibility(row.dataset.kind,base,current.time,live.get(row.dataset.train),confirmedEvents.get(row.dataset.train));if(row.querySelector('.state'))row.querySelector('.state').textContent=status.state;")
    page=page.replace("const d=live.get(row.dataset.train),cell=row.querySelector('.delay');","if(row.dataset.special==='1')continue;const d=live.get(row.dataset.train),cell=row.querySelector('.delay');")
    page=page.replace("row.querySelector('.delay').textContent='未取得';","if(row.dataset.special!=='1')row.querySelector('.delay').textContent='未取得';")
    page=page.replace('</style>', '.pokemon-row{background:#fff8cf}.pokemon-row td:first-child{border-left:4px solid #e53935}.pokemon-label{display:block;width:fit-content;max-width:160px;background:#ffde3b;color:#283c73;border:1px solid #e4ba18;padding:3px 7px;border-radius:8px;margin-top:5px;font-size:12px;font-weight:750;white-space:normal;line-height:1.45}.special-row{background:#edf5f7}.special-row td:first-child{border-left:4px solid #287b8b}.special-label{display:block;width:fit-content;max-width:160px;background:#d1e9ed;color:#164957;padding:3px 7px;border-radius:8px;margin-top:5px;font-size:12px;font-weight:750;white-space:normal;line-height:1.45}.special-row .delay{font-weight:700;color:#164957}.special-row .delay small{font-weight:400}@media(max-width:680px){.table-wrap table{min-width:610px}}</style>')
    page=page.replace('通過不停的列車另行製作。','已核實的特殊列車也標在時刻表；未公布的通過時間不推算。')
    page=page.replace('<section class="filters"', "<p style=\"font-size:14px;margin:14px 0\"><a href=\"/juguang-special-miaoli-20261107.html\">11／7 莒光號專列到苗栗｜讀 R100、R20 與這組老火車的故事 →</a></p>\n"+'<section class="filters"',1)
    return add_train_guide(compact_controls(page))
def compact_controls(page):
    """Keep explanations accessible without delaying the next-train cards."""
    notice = '<div class="notice timetable-status"><span>顯示接下來的班次</span><span id="liveStatus" role="status">目前依表定時間顯示</span></div>'
    page = re.sub(r'<div class="notice"><strong>自動顯示現在之後的班次。</strong>.*?</div>', notice, page, count=1, flags=re.S)
    help_panel = '<details class="timetable-help"><summary>時間與看車說明</summary><div class="timetable-help-body"><p><strong>苗栗始發</strong>：從苗栗站出發，看離站。</p><p><strong>苗栗終到</strong>：抵達苗栗站後結束本車次，看進站。</p><p><strong>中途停靠</strong>：可以看進站與離站。</p><p>本表列出停靠與已核實經過苗栗站的列車。車站時刻與園區拍攝點看到的時間可能不同；未公布的通過時間不推算。</p><p>即時誤點資料未取得或已過期時，依表定時間顯示。參考通過時間另註明來源。</p></div></details><span id="legendORIGIN" hidden></span><span id="legendTERMINAL" hidden></span><span id="legendSTOP" hidden></span>'
    page = re.sub(r'<section class="legend".*?</section>', '', page, count=1, flags=re.S)
    page = page.replace('顯示全部方向</button></section>', '重設</button></section>'+help_panel, 1)
    page = page.replace('即時誤點資料未取得或已過期，目前依表定時間顯示接下來的列車。', '目前依表定時間顯示')
    page = page.replace('誤點資料更新：', '誤點更新：').replace('；預估時間依誤點推算。', '（已套用誤點）')
    css = '.timetable-status{display:flex;flex-wrap:wrap;gap:4px 16px;background:transparent;border:0;padding:0;margin:12px 0;font-size:14px;color:#56685e}.timetable-status #liveStatus{color:#795719}.filters{display:grid;grid-template-columns:minmax(0,180px) minmax(0,240px) auto;justify-content:start;gap:10px;margin:12px 0 4px}.filters label{min-width:0;font-size:14px}.filters select{width:100%;min-width:0;font-size:16px;min-height:44px;padding:8px}.filters #reset{font-size:14px;padding:8px 12px;min-height:44px}.timetable-help{font-size:14px;color:#56685e;margin:4px 0 10px}.timetable-help summary{cursor:pointer;padding:10px 0;min-height:44px;width:fit-content}.timetable-help-body{background:#fff;border:1px solid #d9ded5;border-radius:10px;padding:10px 14px;max-width:680px}.timetable-help-body p{margin:6px 0}.timetable-help summary:focus-visible,.filters :focus-visible{outline:3px solid #a77920;outline-offset:3px}@media(max-width:680px){.filters{grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:8px}.filters #reset{grid-column:1/-1;justify-self:end;min-height:36px;padding:4px 10px}.timetable-status{display:block;margin:10px 0}.timetable-status span{display:block}.timetable-help{margin-top:0}.timetable-help-body{padding:8px 12px}}'
    return page.replace('</style>', css+'</style>', 1)

HYDRATE=r'''
function confirmedSpecialRows(day){
 const map=new Map();
 for(const r of scheduleData.observedSpecial||[])if(r.date===day&&r.verified===true&&r.kind==='通過不停')map.set(String(r.train),r);
 for(const r of scheduleData.specialDays?.[day]||[])if(r.kind==='通過不停')map.set(String(r.train),{...(map.get(String(r.train))||{}),...r});
 return [...map.values()].filter(r=>r.direction&&r.train).map(r=>({...r,kind:'通過不停',type:r.label||'特殊列車',passTime:r.expectedPassTime?(r.expectedPassTime.length===5?r.expectedPassTime+':00':r.expectedPassTime):null}));
}
function hydrate(data){
 const stops=data.days?.[date]||[],specials=confirmedSpecialRows(date).filter(r=>!stops.some(s=>String(s.train)===String(r.train)));
 const rows=[...stops,...specials].sort((a,b)=>(a.passTime||a.sortTime||a.arrival||a.departure||'99:99').localeCompare(b.passTime||b.sortTime||b.arrival||b.departure||'99:99')||String(a.train).localeCompare(String(b.train))),body=document.querySelector('tbody');body.replaceChildren();
 for(const r of rows){const row=document.createElement('tr');row.hidden=true;Object.assign(row.dataset,{direction:r.direction,kind:r.kind,train:r.train,arrival:r.arrival||'—',departure:r.departure||'—'});
 const values=[r.direction,r.train,r.arrival||'—',r.departure||'—','未取得',r.kind];
 for(const value of values){const td=document.createElement('td');td.textContent=value;row.append(td);}
 if(r.kind!=='通過不停'){const type=document.createElement('small');type.textContent=r.type;row.cells[1].append(type);}row.cells[4].className='delay';
 if(r.kind==='通過不停'){
  row.dataset.special='1';row.dataset.passTime=r.passTime||'?';row.className=(r.special?.label||r.label||'').includes('寶可夢')?'pokemon-row':'special-row';
  const label=document.createElement('span');label.className=row.className==='pokemon-row'?'pokemon-label':'special-label';label.textContent=r.special?.label||r.label||'特殊列車';row.cells[1].append(label);
  row.cells[4].textContent=r.passTime?'參考通過 '+r.passTime.slice(0,5):'通過時間待確認';
  const source=document.createElement('small');source.textContent=r.passTime?'參考 TransTaiwan App，非臺鐵公告':'不推算時間';row.cells[4].append(source);
  const badge=document.createElement('span');badge.className='badge stop';badge.textContent='通過不停';row.cells[5].replaceChildren(badge);body.append(row);continue;
 }
 if(r.special){row.className='pokemon-row';const label=document.createElement('span');label.className='pokemon-label';label.textContent=r.special.label;row.cells[1].append(label);}
 const badge=document.createElement('span');badge.className='badge '+({'苗栗始發':'origin','苗栗終到':'terminal','中途停靠':'stop'}[r.kind]);badge.textContent=r.kind;row.cells[5].replaceChildren(badge);
 const note=document.createElement('small');note.textContent={'苗栗始發':'看出站；本站為起點','苗栗終到':'看進站；無本車次續行發車','中途停靠':'可看進站及發車'}[r.kind];row.cells[5].append(note);
 const state=document.createElement('small');state.className='state';row.cells[5].append(state);body.append(row);}
 trains=[...body.rows];document.getElementById('dayTitle').textContent=date+' 苗栗站列車';document.getElementById('dayTotal').textContent='停靠 '+stops.length+' 班・特殊通過 '+specials.length+' 班';
 for(const [id,k,note] of [['ORIGIN','苗栗始發','，不顯示進站時間'],['TERMINAL','苗栗終到','，不顯示發車時間'],['STOP','中途停靠','']])document.getElementById('legend'+id).textContent=rows.filter(r=>r.kind===k).length+' 班'+note;
}
async function refreshSchedule(){try{const r=await fetch('https://raw.githubusercontent.com/sparktseng/nara-select/main/train-watch/schedule-days.json?v='+Math.floor(Date.now()/300000),{cache:'no-store'});if(!r.ok)throw Error('schedule');const d=await r.json();if(!Array.isArray(d.days?.[date])||!d.days[date].length)throw Error('missing_date');if(Date.parse(d.updatedAt)<Date.parse(scheduleData.updatedAt))return;scheduleData.days=d.days;scheduleData.specialDays=d.specialDays||{};scheduleData.observedSpecial=Array.isArray(d.observedSpecial)?d.observedSpecial:[];scheduleData.updatedAt=d.updatedAt;hydrate(scheduleData);filter();refreshLive();}catch{filter();}}
'''

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--page',type=Path);p.add_argument('--data',type=Path,required=True);a=p.parse_args()
    data=collect();a.data.parent.mkdir(parents=True,exist_ok=True);a.data.write_text(json.dumps(data,ensure_ascii=False,separators=(',',':')))
    if a.page:a.page.write_text(public_page(data))
    print('Updated',len(data['days']),'days; today',len(next(iter(data['days'].values()))),'station rows')
