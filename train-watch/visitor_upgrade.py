"""Visitor controls, date-safe filtering and special-train exports."""
import re

CONTROLS = '''<nav class="view-shortcuts" aria-label="看車入口"><button type="button" id="view-now">現在看</button><button type="button" id="view-date">選日期</button><button type="button" id="view-special">找特殊列車</button></nav>
<details id="visitor-panel" class="visitor-panel"><summary>日期、車次與篩選</summary><section class="visitor-controls" aria-label="日期與找車">
<label>日期<select id="visit-date"></select></label>
<label>車次搜尋<input id="train-search" type="search" inputmode="numeric" placeholder="例如 109、2183" maxlength="12"></label>
<label>看車時段<select id="visit-window"><option value="upcoming">接下來全部</option><option value="30">接下來30分鐘</option><option value="60">接下來60分鐘</option><option value="all">選定日期全天</option></select></label>
<label class="special-check"><input id="special-only" type="checkbox">只看特殊列車</label></section>
<p id="schedule-updated" class="guide-note"></p><p id="view-feedback" class="guide-note" role="status"></p>'''
VIEWING = '''<details class="viewing-guide"><summary>在哪裡看？來車方向與親子觀察</summary><div class="timetable-help-body">
<p><strong>苗栗站在山線。</strong>北上往豐富、竹南方向；南下往南勢、銅鑼方向。這是行車方向，請依你所在位置辨認來車端。</p>
<p><strong>先分清楚觀看位置：</strong>本頁時間是苗栗車站的到離站時間，在園區看見列車的時間與視野可能不同。</p>
<p>進入苗栗火車頭園區需購票；車站月台與園區為不同區域，進出請依各自現場指示。<a href="/miaoli-railway-walk.html">查看園區與鐵路一村介紹</a></p>
<p><strong>親子小任務：</strong>找車身顏色、比較車頭外形，再看看前後是否都有車頭。觀察後，可展開這班火車的照片與故事。</p>
<p>請在開放區域觀看，不跨越圍欄或月台候車線，拍攝時保留通行空間。</p>
</div></details>'''
CSS = '''.visitor-panel>summary{cursor:pointer;min-height:44px;padding:10px 0}.visitor-panel{margin:8px 0}.view-shortcuts{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0}.view-shortcuts button{min-height:44px}.visitor-controls{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin:12px 0}.visitor-controls label{display:grid;gap:4px;font-size:14px;min-width:0}.visitor-controls select,.visitor-controls input[type=search]{font:inherit;font-size:16px;color:#253a35;border:1px solid #c6cdc4;border-radius:8px;background:#fff;padding:10px;width:100%;min-width:0;min-height:44px}.visitor-controls .special-check{display:flex;align-items:center;gap:8px;grid-column:1/-1;min-height:44px}.special-check input{width:20px;height:20px}.viewing-guide{margin:16px 0}.viewing-guide summary{cursor:pointer;padding:12px 0;min-height:44px;font-weight:650}.visitor-controls :focus-visible,.view-shortcuts :focus-visible,.special-actions :focus-visible{outline:3px solid #a77920;outline-offset:3px}.special-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}.special-actions button,.special-actions a{font-size:14px;min-height:44px;padding:8px 10px;border:1px solid #c6cdc4;border-radius:8px;background:#fff;color:#21564b;text-decoration:none;display:inline-flex;align-items:center}.guide-clock{font-size:clamp(27px,3.2vw,34px);overflow-wrap:normal}.guide-time-slot{min-width:110px;padding:8px}.guide-card .guide-representative{max-width:300px}.guide-card .guide-note{margin:8px 0}.viewing-guide .timetable-help-body{max-width:none}@media(max-width:680px){.visitor-controls{grid-template-columns:1fr 1fr}.visitor-controls label:nth-child(3){grid-column:1/-1}.guide-clock{font-size:32px}}'''
JS = r'''
const visitDate=document.getElementById('visit-date'),trainSearch=document.getElementById('train-search'),visitWindow=document.getElementById('visit-window'),specialOnly=document.getElementById('special-only');
let followToday=true,viewDay=taipei().date;
const viewParams=new URLSearchParams(location.search);
if(/^\d{4}-\d{2}-\d{2}$/.test(viewParams.get('date')||'')){date=viewParams.get('date');followToday=false;}
trainSearch.value=/^\d{1,8}$/.test(viewParams.get('train')||'')?viewParams.get('train'):'';
specialOnly.checked=viewParams.get('special')==='1';
if(['upcoming','30','60','all'].includes(viewParams.get('window')))visitWindow.value=viewParams.get('window');
if(date!==taipei().date)visitWindow.value='all';
if(viewParams.size)document.getElementById('visitor-panel').open=true;
function clockText(t){return !t?'—':t.length>5&&t.slice(6)!=='00'?t:t.slice(0,5);}
function viewSeconds(t){return t.split(':').reduce((a,b)=>a*60+Number(b),0);}
function viewDelay(train){return date===taipei().date?live.get(String(train)):undefined;}
function updateVisitDates(){
 const available=Object.keys(scheduleData.days||{}).sort(),selected=date;
 visitDate.replaceChildren();for(const day of available){const option=document.createElement('option');option.value=day;option.textContent=day+(day===taipei().date?'（今天）':'');visitDate.append(option);}
 if(!available.includes(selected)){const option=document.createElement('option');option.value=selected;option.textContent=selected+'（資料未取得）';visitDate.append(option);}
 visitDate.value=selected;
 for(const option of visitWindow.options)option.disabled=selected!==taipei().date&&option.value!=='all';
 if(selected!==taipei().date)visitWindow.value='all';
 const updated=new Date(scheduleData.updatedAt);document.getElementById('schedule-updated').textContent='5號店整理｜時刻表更新：'+(Number.isFinite(updated.getTime())?updated.toLocaleString('zh-TW',{timeZone:'Asia/Taipei',hour12:false}):'時間未取得')+'｜車型與月台以現場資訊為準';
}
function viewMatches(r){
 if(direction.value&&r.direction!==direction.value||kind.value&&r.kind!==kind.value)return false;
 const q=trainSearch.value.trim();if(q&&String(r.train)!==q&&String(Number(r.train))!==String(Number(q)))return false;
 if(specialOnly.checked&&!r.special&&r.kind!=='通過不停')return false;
 if(visitWindow.value==='all')return true;
 const current=taipei(),passing=r.kind==='通過不停',start=passing?r.passTime:r.arrival||r.departure,end=passing?r.passTime:r.departure||r.arrival;
 if(!end)return visitWindow.value==='upcoming';
 const delay=viewDelay(r.train),event=date===current.date?confirmedEvents.get(String(r.train)):undefined;
 if(passing?end<current.time:visibility(r.kind,end,current.time,delay,event).hidden)return false;
 if(['30','60'].includes(visitWindow.value))return !!start&&viewSeconds(start)+(delay||0)*60<=viewSeconds(current.time)+Number(visitWindow.value)*60;
 return true;
}
function filter(){
 const current=taipei();if(current.date!==viewDay){viewDay=current.date;live.clear();confirmedEvents.clear();if(followToday){date=current.date;hydrate(scheduleData);}}
 const available=!!scheduleData.days?.[date]?.length;document.getElementById('expired').hidden=available;
 let count=0;for(const row of trains){const r={train:row.dataset.train,direction:row.dataset.direction,kind:row.dataset.kind,arrival:row.dataset.arrival==='—'?null:row.dataset.arrival,departure:row.dataset.departure==='—'?null:row.dataset.departure,passTime:row.dataset.passTime==='?'?null:row.dataset.passTime,special:row.dataset.specialLabel?{label:row.dataset.specialLabel}:null};
 const state=row.querySelector('.state');if(state)state.textContent=date===current.date?(viewDelay(r.train)===undefined?'依表定時間':visibility(r.kind,r.departure||r.arrival,current.time,viewDelay(r.train),confirmedEvents.get(r.train)).state):'選定日期表定時間';
 row.hidden=!available||!viewMatches(r);if(!row.hidden)count++;}
 document.getElementById('train-guide-title').textContent=visitWindow.value==='all'?'選定日期，先認識這三班':'下一班火車，長什麼樣？';document.getElementById('count').textContent=(date===current.date?'臺灣時間 '+current.time:date+' 表定時刻')+'｜符合條件 '+count+' 班';document.getElementById('empty').hidden=count!==0;
 document.getElementById('liveStatus').textContent=date===current.date&&live.size?'已套用可取得的誤點；實際到離站以現場為準':'依表定時間顯示，未提供即時到離站確認';
 document.getElementById('view-feedback').textContent=['30','60'].includes(visitWindow.value)?'依表定／可取得的誤點篩選；通過時間未確認的列車不列入這個時段。':date!==current.date?'正在查看選定日期，不是今天的即時列車。':visitWindow.value==='all'?'顯示今天全天，包含表定時段已過的班次。':'';
 if(window.trainGuideReady)renderTrainGuide();
}
function guideCandidates(){
 const rows=(scheduleData.days?.[date]||[]).filter(viewMatches).map(r=>({...r,guideTime:r.arrival||r.departure,guideEnd:r.departure||r.arrival}));
 for(const r of confirmedSpecialRows(date)){if(!r.passTime||rows.some(x=>String(x.train)===String(r.train))||!viewMatches(r))continue;rows.push({...r,guideTime:r.passTime,guideEnd:r.passTime,passing:true});}
 return rows.sort((a,b)=>(viewSeconds(a.guideTime)+(viewDelay(a.train)||0)*60)-(viewSeconds(b.guideTime)+(viewDelay(b.train)||0)*60)||String(a.train).localeCompare(String(b.train))).slice(0,3);
}
function visitChanged(){if(window.trainGuideReady){guideLocked=false;guideKeys='';}hydrate(scheduleData);filter();if(date===taipei().date)refreshLive();}
visitDate.addEventListener('change',()=>{date=visitDate.value;followToday=false;live.clear();confirmedEvents.clear();visitChanged();});
for(const control of [visitWindow,specialOnly])control.addEventListener('change',()=>{if(window.trainGuideReady){guideLocked=false;guideKeys='';}filter();});
trainSearch.addEventListener('input',()=>{if(window.trainGuideReady){guideLocked=false;guideKeys='';}filter();});
document.getElementById('reset').addEventListener('click',()=>{trainSearch.value='';specialOnly.checked=false;visitWindow.value='upcoming';date=taipei().date;followToday=true;live.clear();confirmedEvents.clear();visitChanged();});
document.getElementById('view-now').addEventListener('click',()=>{date=taipei().date;followToday=true;visitWindow.value='upcoming';trainSearch.value='';specialOnly.checked=false;kind.value='';direction.value='';visitChanged();});
document.getElementById('view-date').addEventListener('click',()=>{visitWindow.value='all';if(window.trainGuideReady){guideLocked=false;guideKeys='';}filter();document.getElementById('visitor-panel').open=true;visitDate.focus();});
document.getElementById('view-special').addEventListener('click',()=>{specialOnly.checked=true;kind.value='';trainSearch.value='';visitWindow.value='all';if(window.trainGuideReady){guideLocked=false;guideKeys='';}filter();});
function specialUrl(train){const url=new URL(location.pathname,location.origin);url.searchParams.set('date',date);url.searchParams.set('train',String(train));url.searchParams.set('window','all');return url.href;}
function specialActions(r){
 const box=document.createElement('div');box.className='special-actions';const source=r.special?.source||r.source;
 if(source&&/^https:\/\//.test(source)){const link=document.createElement('a');link.href=source;link.target='_blank';link.rel='noopener';link.textContent='資料來源';box.append(link);}
 const share=document.createElement('button');share.type='button';share.textContent='分享這班';share.addEventListener('click',async()=>{const title=date+' 苗栗站 '+r.train+'次 '+(r.special?.label||r.label||r.type||'特殊列車'),url=specialUrl(r.train);try{if(navigator.share){await navigator.share({title,url});}else{await navigator.clipboard.writeText(url);document.getElementById('view-feedback').textContent='已複製 '+title+' 的連結。';}}catch(e){if(e.name==='AbortError')return;box.querySelector('.share-fallback')?.remove();const link=document.createElement('a');link.className='share-fallback';link.href=url;link.textContent='開啟這班連結';box.append(link);document.getElementById('view-feedback').textContent='可開啟這班連結，再從網址列複製分享。';}});box.append(share);
 // Reference passage estimates are not official times and never become calendar events.
 if(r.kind!=='通過不停'&&(r.arrival||r.departure)){
 const link=document.createElement('a');link.textContent='加入行事曆';link.download='miaoli-'+date+'-'+r.train+'.ics';link.href=calendarUrl(r);box.append(link);}
 return box;
}
function calendarUrl(r){
 const escape=x=>String(x).replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
 const utc=t=>new Date(date+'T'+(t.length===5?t+':00':t)+'+08:00').toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
 const start=r.arrival||r.departure,end=r.departure&&r.departure!==start?r.departure:null;
 const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Nara Select//Miaoli Train Guide//ZH','CALSCALE:GREGORIAN','BEGIN:VEVENT','UID:'+date+'-'+r.train+'@nara5.tw','DTSTAMP:'+new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z'),'DTSTART:'+utc(start)];
 if(end)lines.push('DTEND:'+utc(end));else lines.push('DURATION:PT1M');
 lines.push('SUMMARY:'+escape('苗栗看火車｜'+r.train+'次 '+(r.special?.label||r.label||r.type)),'LOCATION:苗栗車站','DESCRIPTION:'+escape('表定時間，非即時確認；實際車型與到離站可能異動。到站 '+clockText(r.arrival)+'／離站 '+clockText(r.departure)+'。資料來源：'+(r.special?.source||r.source||'臺鐵官方每日時刻表')+'\n查詢：'+specialUrl(r.train)),'URL:'+specialUrl(r.train),'BEGIN:VALARM','TRIGGER:-PT10M','ACTION:DISPLAY','DESCRIPTION:苗栗看火車：請重新確認班次','END:VALARM','END:VEVENT','END:VCALENDAR');
 const folded=lines.map(line=>{let out='',bytes=0;for(const ch of line){const size=new TextEncoder().encode(ch).length;if(bytes+size>73){out+='\r\n ';bytes=1;}out+=ch;bytes+=size;}return out;}).join('\r\n')+'\r\n';return 'data:text/calendar;charset=utf-8,'+encodeURIComponent(folded);
}
'''

def add_visitor_upgrade(page):
    page=page.replace('<section class="filters"',CONTROLS+'<section class="filters"',1)
    page=page.replace('</section><details class="timetable-help">','</section></details><details class="timetable-help">',1)
    page=page.replace('<div class="table-wrap">',VIEWING+'<div class="table-wrap">',1)
    page=page.replace('</style>',CSS+'</style>',1)
    page=page.replace('今天的時刻表暫未取得，請查看臺鐵官方資訊；不會顯示其他日期的班次。','選定日期的時刻表暫未取得，請選其他日期或查看臺鐵官方資訊。')
    page=re.sub(r'function filter\(\)\{.*?\}\nfor\(const x', 'for(const x',page,count=1,flags=re.S)
    page=re.sub(r'function guideCandidates\(\)\{.*?\n\}\nfunction guideTimeSlot','function guideTimeSlot',page,count=1,flags=re.S)
    page=page.replace('function confirmedSpecialRows(day){',JS+'\nfunction confirmedSpecialRows(day){',1)
    page=page.replace("Object.assign(row.dataset,{direction:r.direction", "Object.assign(row.dataset,{specialLabel:r.special?.label||r.label||'',direction:r.direction",1)
    page=page.replace("trains=[...body.rows];document", "updateVisitDates();trains=[...body.rows];document",1)
    page=page.replace("if(!Array.isArray(d.days?.[date])||!d.days[date].length)throw Error('missing_date');", "if(!d.days||!Object.keys(d.days).length)throw Error('missing_dates');",1)
    page=page.replace("const age=(Date.now()-Date.parse(data.receivedAt))/1000;", "if(date!==taipei().date)throw Error('not_today');const age=(Date.now()-Date.parse(data.receivedAt))/1000;",1)
    page=page.replace("async function refreshLive(){\ntry", "async function refreshLive(){\nif(date!==taipei().date){filter();return;}\ntry",1)
    page=page.replace("r.passTime.slice(0,5)","clockText(r.passTime)")
    page=page.replace("row.cells[5].replaceChildren(badge);body.append(row);continue;", "row.cells[5].replaceChildren(badge);const actions=document.createElement('details');const summary=document.createElement('summary');summary.textContent='來源與分享';actions.append(summary,specialActions(r));row.cells[1].append(actions);body.append(row);continue;",1)
    page=page.replace("row.cells[1].append(label);}", "row.cells[1].append(label);const actions=document.createElement('details');const summary=document.createElement('summary');summary.textContent='來源與分享';actions.append(summary,specialActions(r));row.cells[1].append(actions);}",1)
    return page
