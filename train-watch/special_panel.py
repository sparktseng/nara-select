"""Separate dated, verified special services from unverified source-monitor clues."""
HTML='''<section id="special-watch" class="special-watch" aria-labelledby="special-watch-title"><p class="eyebrow">難得一見的火車</p><h2 id="special-watch-title">觀光列車・特殊列車預告</h2><p>有苗栗站時間的列入下方時刻表；通過不停、時間未公布的，先在這裡認識它。</p><p id="special-watch-status" class="special-status" aria-live="polite">正在讀取最新班次與消息檢查狀態。</p><div id="special-watch-cards" class="special-watch-cards"></div><details id="special-more"><summary id="special-more-title">查看其他特殊列車預告</summary><div id="special-more-cards" class="special-watch-cards"></div></details><details><summary>消息查詢範圍與更新狀態</summary><p>每天早上 07:20、下午 17:20 檢查臺鐵公告、觀光列車官方頁與官方頁提供的承辦行程連結。排程可能延遲。未能核對日期、車次或苗栗山線路線的消息，先保留作待查線索，不當作確定班次。</p><p>目前未涵蓋全部社群消息與未公開的迴送調度；沒有預告不代表沒有特殊列車。通過時間不以兩站時間推算。</p><p>班次與路線依臺鐵每日時刻表；參考通過時間來自 TransTaiwan App。<a href="https://www.railway.gov.tw/tra-tip-web/tip/tip001/tip112/gobytime" target="_blank" rel="noopener">前往臺鐵時刻查詢</a></p><div id="special-source-status"></div></details></section>'''
CSS='''.special-watch{margin:20px 0;padding:18px;background:#eef4f5;border:1px solid #c5d9de;border-radius:14px}.special-watch h2{font-size:23px;margin:0 0 8px}.special-watch-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;margin:12px 0}.special-watch-card{background:white;padding:14px;border:1px solid #cddcde;border-radius:10px}.special-watch-card h3{margin:0;font-size:18px}.special-watch-card .special-time{font-weight:700;margin:8px 0}.special-watch small{line-height:1.65}.special-watch details summary{cursor:pointer;min-height:44px;padding:10px 0}.special-status{font-size:13px;color:#49646b}.special-service-label{display:block;margin-top:4px;font-size:12px;font-weight:700;color:#23546c;white-space:normal;max-width:130px}.special-watch-card .guide-copy{border-top:0;padding-top:0}.special-watch-card figure{margin:14px 0}.special-watch-card .guide-representative{max-width:100%}.special-watch-card .guide-copy p{font-size:15px;line-height:1.75}.special-watch-card a{display:inline-block;padding:5px 0}.special-source-row{margin:6px 0;font-size:13px}'''
JS=r'''
let specialMonitor=null;
function specialServices(){
 const map=new Map();
 for(const r of scheduleData.observedSpecial||[])if(r.verified===true)map.set(r.date+'|'+r.train,r);
 // Already verified Pokemon assignments remain the authority for their names.
 for(const [day,rows] of Object.entries(scheduleData.days||{}))for(const r of rows)if(r.special)map.set(day+'|'+r.train,{...r,date:day,label:r.special.label,source:r.special.source,verified:true,endTime:r.departure||r.arrival});
 for(const [day,rows] of Object.entries(scheduleData.specialDays||{}))for(const r of rows)map.set(day+'|'+r.train,{...(map.get(day+'|'+r.train)||{}),...r,date:day,verified:true,nameConfirmed:true,endTime:(map.get(day+'|'+r.train)||{}).endTime});
 return [...map.values()];
}
function renderSpecialWatch(){
 const now=taipei(),cards=document.getElementById('special-watch-cards');if(!cards)return;cards.replaceChildren();const more=document.getElementById('special-more-cards');more.replaceChildren();
 const items=specialServices().filter(r=>r.date>=now.date&&(r.date!==now.date||!r.endTime||r.endTime>=now.time)).sort((a,b)=>a.date.localeCompare(b.date)||String(a.arrival||a.departure||a.expectedPassTime||a.bracket?.beforeTime||'').localeCompare(String(b.arrival||b.departure||b.expectedPassTime||b.bracket?.beforeTime||''))||a.train.localeCompare(b.train));
 let shown=0;for(const r of items.slice(0,40)){
 const card=document.createElement('article');card.className='special-watch-card';
 const title=document.createElement('h3');title.textContent=r.label;card.append(title);
 const head=document.createElement('p');head.textContent=r.date+' · '+r.direction+' '+r.train+'次';card.append(head);
 const p=document.createElement('p');p.className='special-time';p.textContent=r.kind==='通過不停'?'通過苗栗站・'+(r.expectedPassTime?'預計 '+r.expectedPassTime+'（參考時間）':'通過時間待確認'):'停靠苗栗站・到 '+(r.arrival||'—')+'／開 '+(r.departure||'—');card.append(p);
 const n=document.createElement('small');n.textContent=r.kind==='通過不停'?(r.expectedPassTime?'參考 TransTaiwan App，非臺鐵公告。':r.bracket?'官方相鄰停靠站：'+r.bracket.beforeStation+' '+r.bracket.beforeTime+' 發車 → '+r.bracket.afterStation+' '+r.bracket.afterTime+' 抵達。這不是苗栗通過時間。':'日期與山線路線已核對，未公布時間不推算。'):'依臺鐵當日班次資料，車輛仍可能因調度調整。';card.append(n);
 const model=guideModel(r);if(model){const intro=document.createElement('div');guideCopy(intro,model,false,true);card.append(intro);}else{const q=document.createElement('p');q.className='guide-note';q.textContent=r.label?.includes('兩鐵')?'「兩鐵」就是鐵路＋鐵馬（自行車），讓旅客和腳踏車一起出門。當次實際車型尚未確認。':'這班的實際車型尚未確認，等火車來了，再依外觀一起找找看。';card.append(q);const b=document.createElement('button');b.type='button';b.textContent='火車來了？打開圖鑑找找看';b.addEventListener('click',()=>{const library=document.querySelector('.guide-library');library.open=true;library.scrollIntoView({block:'start',behavior:'smooth'});library.querySelector('summary').focus();});card.append(b);}
 (shown++<3?cards:more).append(card);
 }
 document.getElementById('special-more').hidden=items.length<=3;document.getElementById('special-more-title').textContent='查看其他 '+Math.max(0,Math.min(items.length,40)-3)+' 班特殊列車預告';
 if(!items.length){const p=document.createElement('p');p.textContent='已取得的日期內，目前沒有後續已核實的特殊班次。沒有預告不代表沒有特殊列車。';cards.append(p);}
 const status=document.getElementById('special-watch-status'),sources=document.getElementById('special-source-status');sources.replaceChildren();
 const stamp=t=>new Date(t).toLocaleString('zh-TW',{timeZone:'Asia/Taipei',hour12:false});
 let text='班次資料更新：'+(scheduleData.updatedAt?stamp(scheduleData.updatedAt):'尚未取得')+'。';
 if(specialMonitor){const age=Date.now()-Date.parse(specialMonitor.checkedAt);text+=' 消息檢查：'+stamp(specialMonitor.checkedAt)+(age>36*3600000?'（逾期，等待下次成功查詢）':specialMonitor.status==='ok'?'。':'（部分來源未取得）。');for(const s of specialMonitor.pages||[]){const line=document.createElement('p');line.className='special-source-row';line.textContent=s.name+'：'+(s.status==='ok'?'已查詢':'本次未取得')+(s.lastSuccessAt?'｜最近成功 '+stamp(s.lastSuccessAt):'');sources.append(line);}const p=document.createElement('p');p.textContent='待核對消息 '+(specialMonitor.candidates||[]).length+' 筆，未確認前不列入班次。';sources.append(p);}else text+=' 消息監測狀態暫未取得；仍顯示已核實班次。';status.textContent=text;
 const known=new Map(specialServices().filter(r=>r.date===date&&r.kind!=='通過不停').map(r=>[r.train,r]));
 for(const row of trains){row.querySelector('.special-service-label')?.remove();const r=known.get(row.dataset.train);if(!r||row.classList.contains('pokemon-row'))continue;const b=document.createElement('small');b.className='special-service-label';b.textContent=r.label;row.cells[1].append(b);}
}
async function refreshSpecialMonitor(){try{const r=await fetch('https://raw.githubusercontent.com/sparktseng/nara-select/main/train-watch/special-monitor.json?v='+Math.floor(Date.now()/300000),{cache:'no-store'});if(!r.ok)throw Error('monitor');const d=await r.json();if(!d.checkedAt||!Array.isArray(d.pages))throw Error('schema');specialMonitor=d;}catch{}renderSpecialWatch();}
renderSpecialWatch();refreshSpecialMonitor();setInterval(refreshSpecialMonitor,300000);setInterval(renderSpecialWatch,15000);
'''
def add_special_panel(page):
 page=page.replace('<section class="train-guide"',HTML+'<section class="train-guide"',1)
 page=page.replace('</style>',CSS+'</style>',1)
 page=page.replace('scheduleData.specialDays=d.specialDays||{};','scheduleData.specialDays=d.specialDays||{};scheduleData.observedSpecial=Array.isArray(d.observedSpecial)?d.observedSpecial:(scheduleData.observedSpecial||[]);scheduleData.updatedAt=d.updatedAt;')
 return page.replace('</script>',JS+'\n</script>',1)
