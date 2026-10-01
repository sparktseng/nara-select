"""Build a dated, offline station timetable from TRA daily JSON."""
import argparse
import html
import json
from collections import Counter
from datetime import date, datetime
from zoneinfo import ZoneInfo
from pathlib import Path


def station_rows(payload):
    rows = []
    for train in payload['TrainInfos']:
        stops = sorted(train['TimeInfos'], key=lambda s: int(s['Order']))
        for index, stop in enumerate(stops):
            if stop['Station'] != '3160':
                continue
            origin = index == 0
            terminal = index == len(stops) - 1
            kind = '苗栗始發' if origin else '苗栗終到' if terminal else '中途停靠'
            car = train['CarClass']
            label = {'1131': '區間車', '1132': '區間快', '110G': '自強3000'}.get(car, '對號列車')
            rows.append(dict(train=train['Train'], direction='南下' if train['LineDir'] == '2' else '北上',
                type=label, kind=kind, arrival=None if origin else stop['ARRTime'],
                departure=None if terminal else stop['DEPTime'],
                sortTime=stop['DEPTime'] if origin else stop['ARRTime']))
    return sorted(rows, key=lambda r: (r['sortTime'], r['train']))


def render(rows, service_date, live_sample=None):
    counts = Counter(r['kind'] for r in rows)
    body = []
    for r in rows:
        def cell(value):
            return html.escape(value) if value is not None else '—'
        note = {'苗栗始發': '看出站；本站為起點', '苗栗終到': '看進站；無本車次續行發車', '中途停靠': '可看進站及發車'}[r['kind']]
        color = {'苗栗始發': 'origin', '苗栗終到': 'terminal', '中途停靠': 'stop'}[r['kind']]
        body.append('<tr hidden data-direction="{direction}" data-kind="{kind}" data-time="{sortTime}" data-departure="{departure}" data-arrival="{arrival}" data-train="{train}"><td>{direction}</td><td><b>{train}</b><small>{type}</small></td><td>{arrival}</td><td>{departure}</td><td class="delay">未取得<small>預估時間待更新</small></td><td><span class="badge {color}">{kind}</span><small>{note}</small><small class="state"></small></td></tr>'.format(
            **{k: cell(v) for k, v in r.items()}, color=color, note=note))
    template = '''<!doctype html>
<html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>苗栗站停靠列車時刻表｜5號店</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#f6f4ed;color:#253a35;font-family:system-ui,sans-serif;line-height:1.6}main{max-width:1000px;margin:auto;padding:28px 18px}a{color:#21564b}h1{font-size:clamp(25px,5vw,36px);margin:12px 0}p{margin:8px 0}.eyebrow{font-size:14px;color:#64756b}.notice{background:#fff0d3;border-left:4px solid #b98324;padding:12px 16px;margin:20px 0}.legend,.filters{display:flex;flex-wrap:wrap;gap:12px;margin:16px 0}.legend>div{flex:1;min-width:220px;background:white;padding:16px;border-radius:12px}.filters label{display:grid;gap:4px;font-size:14px}select,button{font:inherit;padding:10px;border:1px solid #c6cdc4;background:white;border-radius:8px;color:#253a35}button{align-self:end;cursor:pointer}.table-wrap{overflow:auto;background:white;border:1px solid #d9ded5;border-radius:12px}table{width:100%;border-collapse:collapse;min-width:620px;font-variant-numeric:tabular-nums}th,td{padding:12px 14px;text-align:left;border-bottom:1px solid #e8ebe4;white-space:nowrap}th{background:#e9eee7;font-size:14px}small{display:block;font-size:12px;color:#67746c}.badge{display:inline-block;padding:3px 9px;border-radius:6px;font-weight:650;font-size:13px}.origin{background:#dcece4;color:#24573c}.terminal{background:#f7e3cd;color:#794a18}.stop{background:#e8ebf0;color:#435166}footer{margin-top:24px;font-size:14px}.count{font-size:14px;margin:12px 0}#expired[hidden],tr[hidden],#empty[hidden]{display:none}#empty{padding:20px;text-align:center}
</style></head><body><main>
<a href="https://nara5.tw/">5號店 Nara Select</a><p class="eyebrow">苗栗站・山線｜時刻表第一版</p>
<h1>想看進站，還是看出發？</h1>
<p><strong>__DATE__ 停靠苗栗站的列車</strong>｜共 __TOTAL__ 班</p>
<p>按方向和停靠方式找車，先看清楚這一班從哪裡開始、在哪裡結束。</p>
<div class="notice"><strong>自動顯示現在之後的班次。</strong><br><span id="liveStatus">誤點資料尚未連線。</span><br>這是指定日期的時刻表；車站時間與園區拍攝點看到的時間可能不同。通過不停的列車另行製作。</div>
<div id="expired" class="notice" hidden>這份時刻表日期與今天不同，請勿當作今天班次使用。</div>
<section class="legend" aria-label="停靠方式說明">
<div><span class="badge origin">苗栗始發</span><p>看出站；本站為起點</p><small>__ORIGIN__ 班，不顯示進站時間</small></div>
<div><span class="badge terminal">苗栗終到</span><p>看進站；無本車次續行發車</p><small>__TERMINAL__ 班，不顯示發車時間</small></div>
<div><span class="badge stop">中途停靠</span><p>可看進站及發車</p><small>__STOP__ 班</small></div></section>
<section class="filters" aria-label="篩選列車">
<label>方向<select id="direction"><option value="">全部方向</option>南下</option>北上</option></select></label>
<label>停靠方式<select id="kind"><option value="">全部方式</option>苗栗始發</option>苗栗終到</option>中途停靠</option></select></label>
<button id="reset" type="button">顯示全部方向</button></section>
<p class="count" id="count" aria-live="polite">顯示 __TOTAL__ 班</p>
<div class="table-wrap"><table><caption style="text-align:left;padding:12px">苗栗站表定到站／發車時間（臺灣時間）</caption><thead><tr><th scope="col">方向</th><th scope="col">車次／車種</th><th scope="col">抵達</th><th scope="col">發車</th><th scope="col">誤點／預估</th><th scope="col">本站角色</th></tr></thead><tbody>__ROWS__</tbody></table><p id="empty" hidden>目前沒有符合條件的後續列車。</p></div>
<footer><p>資料來源：<a href="https://ods.railway.gov.tw/tra-ods-web/ods/download/dataResource/railway_schedule/JSON/list">臺鐵官方每日時刻表 __DATE__</a>。車種未細分的對號列車，不推定實際車型。</p><p>同一編組可能在終到後改車次折返；本表按各車次獨立標示，不推定編組接續。</p><p>等車空檔，來鐵路一村37號的 <a href="https://nara5.tw/">5號店</a> 坐坐。</p></footer>
</main><script>
const initialLive=__SNAPSHOT__;
let live=new Map(),confirmedEvents=new Map();
const date='__DATE__',trains=[...document.querySelectorAll('tbody tr')];
const direction=document.getElementById('direction'),kind=document.getElementById('kind');
function taipei(){const p=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(new Date());const v=Object.fromEntries(p.map(x=>[x.type,x.value]));return {date:v.year+'-'+v.month+'-'+v.day,time:v.hour+':'+v.minute+':'+v.second};}
function visibility(kind,scheduled,now,delay,event){
 const needed=kind==='苗栗終到'?'arrived':'departed';
 if(event===needed)return {hidden:true,state:needed==='arrived'?'已抵達終點':'已離站'};
 const sec=x=>x.split(':').reduce((a,b)=>a*60+Number(b),0);
 const late=delay!==undefined&&delay>0;
 const effective=sec(scheduled)+(late?delay*60:0);
 return {hidden:effective<sec(now),state:late?'誤點 '+delay+' 分':delay===undefined?'依表定時間':'準點'};
}
function filter(){const current=taipei(),same=current.date===date;document.getElementById('expired').hidden=same;let count=0;for(const row of trains){const base=row.dataset.departure==='—'?row.dataset.arrival:row.dataset.departure;const status=visibility(row.dataset.kind,base,current.time,live.get(row.dataset.train),confirmedEvents.get(row.dataset.train));row.querySelector('.state').textContent=status.state;const show=same&&!status.hidden&&(!direction.value||row.dataset.direction===direction.value)&&(!kind.value||row.dataset.kind===kind.value);row.hidden=!show;if(show)count++;}document.getElementById('count').textContent='臺灣時間 '+current.time+'｜接下來 '+count+' 班';document.getElementById('empty').hidden=count!==0;}
for(const x of [direction,kind])x.addEventListener('change',filter);document.getElementById('reset').addEventListener('click',()=>{direction.value='';kind.value='';filter();});filter();setInterval(filter,15000);

function applyLive(data){const age=(Date.now()-Date.parse(data.receivedAt))/1000;if(data.serviceDate!==date||!Number.isFinite(age)||age>180||age< -60||!Array.isArray(data.trains))throw Error('stale');for(const e of data.stationEvents||[]){const at=Date.parse(e.occurredAt);if(e.StationID==='3160'&&e.verified===true&&['arrived','departed'].includes(e.event)&&Number.isFinite(at)&&at<=Date.now()&&new Date(at).toLocaleDateString('en-CA',{timeZone:'Asia/Taipei'})===date){const key=String(e.TrainNo);if(confirmedEvents.get(key)!=='departed')confirmedEvents.set(key,e.event);}}live.clear();for(const r of data.trains){const a=(Date.now()-Date.parse(r.UpdateTime))/1000;if(Number.isFinite(a)&&a>=-60&&a<=180&&Number.isFinite(r.DelayTime)&&r.DelayTime>=0)live.set(String(r.TrainNo),r.DelayTime);}for(const row of trains){const d=live.get(row.dataset.train),cell=row.querySelector('.delay');cell.replaceChildren();cell.append(document.createTextNode(d===undefined?'未取得':d===0?'準點':'誤點 '+d+' 分'));const note=document.createElement('small');if(d!==undefined){const add=t=>{if(t==='—')return '—';let x=t.split(':').map(Number);let m=x[0]*60+x[1]+d;return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0')+(x[2]?':'+String(x[2]).padStart(2,'0'):'');};note.textContent='預估到 '+add(row.dataset.arrival)+'／開 '+add(row.dataset.departure);}else note.textContent='預估時間待更新';cell.append(note);}document.getElementById('liveStatus').textContent='誤點資料更新：'+new Date(data.receivedAt).toLocaleTimeString('zh-TW',{timeZone:'Asia/Taipei'})+'；預估時間依誤點推算。';filter();}
async function refreshLive(){
try{const res=await fetch('./train-watch-live.json',{cache:'no-store'});if(!res.ok)throw Error('unavailable');applyLive(await res.json());}
catch{try{if(!initialLive)throw Error('no_snapshot');applyLive(initialLive);document.getElementById('liveStatus').textContent+='（單次快照，尚未持續更新）';}catch{live.clear();for(const row of trains){row.querySelector('.delay').textContent='未取得';}document.getElementById('liveStatus').textContent='即時誤點資料未取得或已過期，目前依表定時間顯示接下來的列車。';filter();}}}
refreshLive();setInterval(refreshLive,60000);

</script></body></html>'''
    for key,value in {'DATE':service_date,'TOTAL':len(rows),'ORIGIN':counts['苗栗始發'],
                      'TERMINAL':counts['苗栗終到'],'STOP':counts['中途停靠'],'ROWS':''.join(body),'SNAPSHOT':json.dumps(live_sample,ensure_ascii=False).replace('<','\\u003c')}.items():
        template = template.replace('__'+key+'__',str(value))
    return template


if __name__ == '__main__':
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--source',type=Path,required=True)
    p.add_argument('--date',required=True)
    p.add_argument('--output',type=Path,required=True)
    p.add_argument('--snapshot',type=Path)
    a=p.parse_args();date.fromisoformat(a.date)
    rows=station_rows(json.loads(a.source.read_text()))
    sample=None
    if a.snapshot:
        raw=json.loads(a.snapshot.read_text().splitlines()[-1])
        if raw.get('error') or not isinstance(raw.get('trains'),list):
            p.error('Snapshot is not a successful train response')
        received=datetime.fromisoformat(raw['receivedAt'])
        if received.tzinfo is None or received.astimezone(ZoneInfo('Asia/Taipei')).date().isoformat()!=a.date:
            p.error('Snapshot date does not match timetable date')
        sample={'serviceDate':a.date,'receivedAt':raw['receivedAt'],
            'trains':[{k:r[k] for k in ('TrainNo','DelayTime','UpdateTime') if k in r} for r in raw['trains']]}
    a.output.write_text(render(rows,a.date,sample),encoding='utf-8')
    print(len(rows), dict(Counter(r['kind'] for r in rows)))
