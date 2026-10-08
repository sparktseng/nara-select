"""A welcoming, observation-first guide for visitors scanning a QR code."""
import re

POKEMON = '''<section id="next-pokemon" class="next-pokemon" aria-labelledby="pokemon-next-title"><div id="pokemon-next-photo"></div><div><h2 id="pokemon-next-title">下一班寶可夢，什麼時候來？</h2><p id="pokemon-next-time" role="status"></p><p id="pokemon-next-direction"></p><p class="pokemon-hint">找黃色車頭，看看車身上的皮卡丘！</p><small>外觀對照照片，實際車輛可能調整。</small><a id="pokemon-next-source" target="_blank" rel="noopener">查看班次來源</a></div></section>'''

CSS = '''main>h1{font-size:clamp(24px,5vw,32px);margin:8px 0}main{padding-top:16px}.welcome-copy{margin:6px 0 12px}.day-summary{font-size:13px;margin:4px 0}.next-pokemon{display:grid;grid-template-columns:110px minmax(0,1fr);gap:12px;padding:12px;background:#fff6cf;border:1px solid #dec264;border-radius:12px;margin:12px 0}.next-pokemon h2{font-size:18px;margin:0 0 6px}.next-pokemon p{margin:4px 0;line-height:1.5}.next-pokemon img{width:100%;height:auto;aspect-ratio:4/3;object-fit:contain;border-radius:8px}.next-pokemon small{font-size:11px;display:block}.next-pokemon a{display:inline-block;font-size:12px;margin-top:4px}.pokemon-hint{font-size:13px}#pokemon-next-time{font-weight:750;font-size:18px}.train-guide{padding:14px;margin:12px 0}.train-guide>p:not(.eyebrow){font-size:14px;margin:6px 0}.train-guide>.eyebrow{display:none}.guide-toolbar{margin:8px 0}.guide-toolbar button{font-size:13px;padding:6px 10px}.guide-toolbar p{margin:0}.guide-cards{grid-template-columns:minmax(0,1fr);gap:10px}.guide-card{padding:12px}.guide-card:first-child .guide-representative{max-width:220px}.guide-card:not(:first-child) .guide-times{margin:6px 0}.guide-card:not(:first-child) .guide-clock{font-size:clamp(20px,20cqi,26px)}.guide-card:not(:first-child) .guide-clock.has-seconds{font-size:clamp(18px,18cqi,24px)}.guide-direction{font-weight:650;font-size:14px;margin:6px 0}.guide-location,.guide-observe{font-size:13px;margin:6px 0;line-height:1.6}.guide-compare{display:grid;grid-template-columns:1fr 1fr;gap:8px;max-width:360px}.guide-compare img{width:100%;height:90px;object-fit:contain}.guide-compare small{font-size:11px}.guide-extra>summary{font-size:14px}.train-story-link{max-width:none;padding:8px 10px;margin:12px 0;font-size:13px}.train-story-link .train-story-date{font-size:15px;padding:4px 8px}.train-story-link .train-story-text>span{display:none}.train-story-link .train-story-arrow{font-size:20px}.train-guide>small{font-size:11px;display:block;margin-top:8px}.guide-credits{font-size:12px;margin:4px 0}.timetable-status{font-size:12px;margin:6px 0}.view-shortcuts{margin-top:14px}@media(min-width:760px){.guide-cards{grid-template-columns:minmax(0,1.4fr) minmax(0,1fr)}.guide-card:first-child{grid-row:span 2}.guide-card:not(:first-child){align-self:start}}@media(max-width:380px){.next-pokemon{grid-template-columns:86px minmax(0,1fr);gap:8px}.next-pokemon h2{font-size:16px}#pokemon-next-time{font-size:16px}}'''

CSS += '''
/* Mobile reading: give all three trains equal time emphasis. */
.guide-event-status:empty{display:none}.guide-toolbar{flex-wrap:wrap}.guide-toolbar button{min-height:44px}.guide-location:empty{display:none}
.park-entry{margin:12px 0;padding:14px 16px;background:#fff;border:1px solid #c6d7cb;border-radius:12px}.park-entry h2{font-size:18px;margin:0 0 6px}.park-entry p{font-size:14px;margin:4px 0}.park-entry a{display:inline-flex;align-items:center;min-height:44px;margin-top:4px;font-weight:700}.park-entry a:focus-visible{outline:3px solid #a77920;outline-offset:3px}.park-entry small{font-size:12px}
@media(max-width:759px){main{padding:14px 12px}.train-guide{padding:12px}.train-guide h2{font-size:22px}.guide-card h3{font-size:17px}.guide-times,.guide-card:not(:first-child) .guide-times{margin:10px 0;gap:8px}.guide-time-slot{min-width:0;padding:10px 8px}.guide-card .guide-clock,.guide-card:not(:first-child) .guide-clock{font-size:clamp(26px,30cqi,32px)}.guide-card .guide-clock.has-seconds,.guide-card:not(:first-child) .guide-clock.has-seconds{font-size:clamp(20px,23cqi,26px)}.guide-time-label{font-size:14px}.guide-toolbar p{font-size:12px}.guide-direction{font-size:13px;margin:4px 0}.train-guide>small,.next-pokemon small{font-size:12px}.timetable-status span:first-child{display:none}.table-wrap td:nth-child(3),.table-wrap td:nth-child(4){font-size:19px;font-weight:750;color:#183f34}}
'''

PARK_ENTRY = '<section class="park-entry" aria-labelledby="park-entry-title"><h2 id="park-entry-title">看完來車，還想繼續玩？</h2><p>帶孩子走進苗栗火車頭園區，看看展示的老火車，比一比車頭和車輪。散步到鐵路一村，也可以來5號店坐坐。</p><a href="/miaoli-railway-walk.html">看看園區怎麼逛、怎麼走 →</a><small>園區需購票；本頁為苗栗站時刻，在園區看到列車的時間與視野可能不同。</small></section>'

JS = r'''
function parkDirection(r){return r.direction==='北上'?'北上｜從右往左，往苗栗車站方向':'南下｜從左往右，往南方行駛';}
function parkLocation(r){return ['苗栗始發','苗栗終到'].includes(r.kind)?'這班'+(r.kind==='苗栗始發'?'從苗栗站出發':'在苗栗站終到')+'，園區部分位置可能看不到；入口附近或車站較有機會。':'園區面對鐵軌時，左側是苗栗車站與北方，右側是南方。';}
function nextPokemonCandidate(){
 const current=taipei(),items=[];
 for(const day of Object.keys(scheduleData.days||{}).sort()){
  if(day<current.date)continue;
  for(const r of scheduleData.days[day]){
   if(!(r.special?.label||'').includes('寶可夢'))continue;
   const t=r.arrival||r.departure;if(!t||day===current.date&&(r.departure||t)<current.time)continue;
   items.push({...r,day,time:t});
  }
  for(const r of confirmedSpecialRows(day)){
   if(!(r.special?.label||r.label||'').includes('寶可夢')||!r.passTime||day===current.date&&r.passTime<current.time)continue;
   if(!items.some(x=>x.day===day&&String(x.train)===String(r.train)))items.push({...r,day,time:r.passTime,passing:true});
  }
 }
 return items.sort((a,b)=>(a.day+a.time).localeCompare(b.day+b.time))[0];
}
function renderNextPokemon(){
 const r=nextPokemonCandidate(),time=document.getElementById('pokemon-next-time'),dir=document.getElementById('pokemon-next-direction'),source=document.getElementById('pokemon-next-source');
 if(!r){time.textContent='下一班資訊更新中';dir.textContent='只列已確認到苗栗站的公開班次，不推算未公布的時間。';source.hidden=true;return;}
 const current=taipei(),delta=Math.ceil((new Date(r.day+'T'+r.time+'+08:00')-new Date(current.date+'T'+current.time+'+08:00'))/60000),days=Math.round((new Date(r.day+'T00:00:00+08:00')-new Date(current.date+'T00:00:00+08:00'))/86400000),weekday=new Date(r.day+'T12:00:00+08:00').toLocaleDateString('zh-TW',{timeZone:'Asia/Taipei',weekday:'short'});
 const when=days===0?'今天':days===1?'明天':days===2?'後天':r.day.slice(5).replace('-','／');
 time.textContent=when+'（'+weekday+'）'+clockText(r.time)+(r.passing?' 參考通過・不停靠':r.arrival?' 到苗栗站':' 從苗栗站出發')+'｜'+r.train+'次';
 if(days===0)time.textContent+=delta>0?'・距表定時間約 '+delta+' 分鐘':'・表定已到站，請依現場確認';
 dir.textContent=parkDirection(r)+'。'+(['苗栗始發','苗栗終到'].includes(r.kind)?parkLocation(r):'')+(Number(r.time.slice(0,2))>=18?'這班在晚間，請先確認觀看位置與開放時間。':'')+(r.passing?'通過時間為參考，非臺鐵公告。':'');
 const url=r.special?.source||r.source;source.hidden=!/^https:\/\//.test(url||'');if(!source.hidden)source.href=url;
}
const visitorBaseGuideCard=guideCard;
guideCard=function(r,index){
 const card=visitorBaseGuideCard(r,index);if(guideModel(r)==='e500')card.querySelector('.guide-note')?.remove();const times=card.querySelector('.guide-times'),direction=guideElement('p',parkDirection(r).split('｜')[1],'guide-direction');times.after(direction);
 const location=guideElement('p',['苗栗始發','苗栗終到'].includes(r.kind)?parkLocation(r):'','guide-location');direction.after(location);
 if(index===0){
  const observation=guideElement('p','一起找找看：車頭是什麼顏色？前後的車頭像不像？','guide-observe');location.after(observation);
  if(!guideModel(r)){
   const comparison=guideElement('div',null,'guide-compare');
   for(const id of ['emu800','emu900']){const m=trainGuideData[id],fig=guideElement('div');fig.append(guideVisual(m.photos[0],id,m.name+'外觀比較照片'),guideElement('small',m.hint));comparison.append(fig);}
   observation.after(guideElement('p','先比較車頭外形；照片供辨認，不代表這班確定使用的車型。','guide-note'),comparison);
  }
 }else{
  const extra=guideElement('details',null,'guide-extra');extra.append(guideElement('summary','看照片、認識這班火車'));
  if(!['苗栗始發','苗栗終到'].includes(r.kind))location.remove();const keep=new Set([card.querySelector('small'),card.querySelector('h3'),times,direction,location,card.querySelector('.guide-event-status')]);
  for(const node of [...card.children])if(!keep.has(node))extra.append(node);card.append(extra);
 }
 return card;
};
const visitorBaseRenderGuide=renderTrainGuide;
renderTrainGuide=function(force=false){visitorBaseRenderGuide(force);renderNextPokemon();};
const pokemonPhoto=trainGuideData.pokemon.photos[0];document.getElementById('pokemon-next-photo').append(guideVisual(pokemonPhoto,'pokemon','寶可夢彩繪列車黃色車頭與皮卡丘外觀對照照片'));
const activity=document.querySelector('.train-story-link');if(activity)document.querySelector('.park-entry').after(activity);
const daily=document.getElementById('dayTitle')?.parentElement;if(daily){daily.classList.add('day-summary');document.getElementById('visitor-panel').before(daily);}
'''

def add_visitor_experience(page):
    page=page.replace('想看進站，還是看出發？','來苗栗，一起看火車')
    page=page.replace('按方向和停靠方式找車，先看清楚這一班從哪裡開始、在哪裡結束。','不用特別挑日子。看看下一班，從車頭、顏色開始認識火車。')
    guide=re.search(r'<section class="train-guide".*?</section>',page,re.S).group()
    page=page.replace(guide,'',1)
    page=page.replace('<nav class="view-shortcuts"',POKEMON+guide+PARK_ENTRY+'<nav class="view-shortcuts"',1)
    page=page.replace('先看時間，再看火車。照片與介紹只跟著最近三班出現。','先看進離站時間，再用照片認識火車。來車方向以園區面對鐵軌為準。')
    page=page.replace('<p><strong>苗栗站在山線。</strong>北上往豐富、竹南方向；南下往南勢、銅鑼方向。這是行車方向，請依你所在位置辨認來車端。</p>','<p><strong>園區面對鐵軌：</strong>左側是苗栗車站與北方，右側是南方。北上列車從右往左；南下列車從左往右。</p><p><strong>始發與終到要留意位置：</strong>從苗栗站出發或在苗栗站終到的列車，園區部分位置可能看不到；入口附近或車站較有機會。</p>')
    page=page.replace('</style>',CSS+'</style>',1)
    page=page.replace('\ninitTrainGuide();',JS+'\ninitTrainGuide();',1)
    return page
