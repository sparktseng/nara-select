"""Family train guide; observations never alter the official timetable."""
import json

def photo(file, path, author, license='CC BY-SA 4.0'):
    return dict(src='https://upload.wikimedia.org/wikipedia/commons/'+path,
                source='https://commons.wikimedia.org/wiki/File:'+file.replace(' ', '_'),
                author=author, license=license)

GUIDE = {
 'emu700': dict(name='EMU700｜阿福號', hint='車頭下方突出', photos=[photo('EMU700 series.jpg','0/06/EMU700_series.jpg','Ffggss')], lines=[
 '看看車頭下面，是不是有一塊向前突出的弧形造型？',
 '這款區間車叫「EMU700」，鐵道迷常叫它「阿福號」。',
 '通常八節車廂連在一起，陪大家上學、上班，也能出門玩。',
 '親子小任務：你覺得它的車頭像什麼？跟爸爸媽媽說說看！']),
 'emu800': dict(name='EMU800｜微笑號', hint='藍色臉／黃色臉', photos=[photo('TRA EMU800 prototype and manufactured in 2016 Zhubei Sta 20160915.jpg','5/59/TRA_EMU800_prototype_and_manufactured_in_2016_Zhubei_Sta_20160915.jpg','Cassiopeia sweet','Public domain')], lines=[
 '看看車頭的藍黃配色，是不是像一張微笑的臉？',
 '它叫「EMU800」，常被叫作「微笑號」；黃色車頭的版本，有些鐵道迷還叫它「小小兵」。',
 '寶可夢彩繪列車也是這個車型，只是換上了限定的新衣服！',
 '親子小任務：今天來的是藍色臉、黃色臉，還是穿著彩繪衣服的版本？']),
 'emu900': dict(name='EMU900｜綠色腰帶', hint='銀色車身、綠色線條', photos=[photo('TRA EMU900.jpg','c/c0/TRA_EMU900.jpg','臺灣鐵路管理局','臺鐵開放資料授權')], lines=[
 '銀色車身、黑色車頭玻璃，再找找那條綠色的「腰帶」！',
 '它叫「EMU900」，曾被稱為「最美區間車」。',
 '通常十節車廂連在一起，是一列長長的通勤火車。',
 '親子小任務：等火車經過，一起看看綠色線條延伸到了哪裡！']),
 'e500': dict(name='自強號｜橘色車頭E500', hint='橘色車頭、E5開頭編號', photos=[photo('臺鐵E500型電力機車.jpg','1/14/臺鐵E500型電力機車.jpg','Mafalda4144')], lines=[
 '先找找看，今天是不是亮橘色的E500車頭帶著車廂來了？',
 '它是電力機車，像力氣很大的領隊，和另一端的車頭一起帶著客車前進。',
 '這類自強號通常前後各有一台車頭；看到「E5」開頭的編號，就找到E500家族了！',
 '親子小任務：等整列火車經過，再找找最後面那台車頭，跟前面的像不像？']),
 'emu3000': dict(name='自強3000｜EMU3000', hint='白色車身、黑色車窗', photos=[photo('EMU3000 Series EMU.jpg','1/16/EMU3000_Series_EMU.jpg','Samson Ng . D201@EAL')], lines=[
 '看到白色車身、黑色車窗了嗎？這是新一代的自強號！',
 '它的車型叫「EMU3000」，車頭線條俐落，車廂之間還有彩色線條。',
 '有些班次也會稱作「新自強」，你可以先記住「自強3000」。',
 '親子小任務：找找看，這班車的線條是什麼顏色？']),
 'puyuma': dict(name='普悠瑪｜TEMU2000', hint='紅白配色的車頭', photos=[photo('台鐵普悠瑪.jpg','a/a1/台鐵普悠瑪.jpg','LucasLiu0910')], lines=[
 '紅白配色的火車來了！先看看它紅色的車頭。',
 '它叫「普悠瑪」，鐵道迷給它取了外號，叫「紅面番鴨」。',
 '它有個特別的本領：通過彎道時，車身可以稍微傾斜。',
 '親子小任務：你覺得它的車頭，像不像一隻鴨子的臉？']),
 'pokemon': dict(name='寶可夢彩繪列車｜微笑號換新衣', hint='黃色車頭、皮卡丘與寶可夢彩繪', photos=[dict(src='/assets/trains/pokemon-2026-tra.jpg',source='https://www.railway.gov.tw/tra-tip-web/tip/file/652bf2f9-24e9-4fd2-863e-f2abab7d146a',author='國營臺灣鐵路股份有限公司',license='臺鐵新聞照片（權利保留）')], lines=[
 '快看，火車換上寶可夢的新衣服了！找找車身上有哪些你認識的夥伴。',
 '它原本是 EMU800 區間車，這個車型有個可愛的外號，叫「微笑號」。',
 '這次不只車身換裝，連車廂裡也有精靈球和冒險元素！',
 '為了慶祝寶可夢30週年，臺鐵和新光三越合作，讓搭火車也像出發冒險。',
 '它在2026年9月24日亮相，9月25日至12月13日也會當一般區間車載大家出門。',
 '期間還有特別安排的主題專列；想在苗栗遇見它，記得先看當天的班次。',
 '親子小任務：你們各自找到哪一隻寶可夢？等火車經過後，互相分享吧！'])
}

HTML = '''<section class="train-guide" id="train-guide" aria-labelledby="train-guide-title">
<p class="eyebrow">跟著時刻表・認識火車</p><h2 id="train-guide-title">下一班火車，長什麼樣？</h2>
<p>先看照片，等火車來了再一起找找看。火車經過後，再點照片讀介紹。</p>
<div class="guide-toolbar"><p id="guide-status" aria-live="polite"></p><button id="guide-refresh" type="button">看接下來三班</button></div>
<div id="train-guide-cards" class="guide-cards"></div>
<details class="guide-library"><summary>認識更多火車／我不確定是哪一款</summary><div id="guide-library-options"></div><div id="guide-library-copy"></div></details>
<small>照片供外觀對照，非當次列車實拍；你的選擇只用來閱讀介紹，不會修改官方時刻表。僅列已取得的停靠班次與已核實、具參考通過時間的專列。</small>
<details class="guide-credits"><summary>照片來源與授權</summary><div id="guide-credits-list"></div></details>
</section>'''

CSS = r'''
.train-guide{margin:16px 0 24px;padding:20px;background:#eeeee5;border:1px solid #d9ded5;border-radius:16px}.pokemon-panel>summary{cursor:pointer;min-height:44px}.pokemon-panel>summary h2{display:inline;font-size:20px}.train-guide h2{font-size:clamp(23px,4vw,29px);margin:0 0 8px}.guide-toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:16px 0}.guide-toolbar p{font-size:13px}.guide-toolbar button{flex-shrink:0;min-height:44px}.guide-cards{display:grid;gap:16px}.guide-card{background:white;border:1px solid #d9ded5;border-radius:12px;padding:16px;min-width:0}.guide-card.pokemon{border-top:4px solid #e53935;background:#fffbea}.guide-card h3{font-size:19px;margin:4px 0}.guide-time{font-variant-numeric:tabular-nums;font-weight:650}.guide-note{font-size:13px;color:#617169}.guide-photos{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:12px 0}.guide-photo{width:100%;padding:5px;min-width:0;text-align:left;border:2px solid #dce2d9;border-radius:10px;background:#fff;align-self:stretch}.guide-photo[aria-pressed=true]{border-color:#286650;background:#edf6ef}.guide-photo:focus-visible,.train-guide button:focus-visible,.train-guide summary:focus-visible{outline:3px solid #a77920;outline-offset:3px}.guide-photo img{display:block;width:100%;height:auto;aspect-ratio:4/3;object-fit:contain;background:#f2f3ee;border-radius:5px}.guide-photo strong{display:block;font-size:13px;line-height:1.5;margin-top:5px}.guide-photo small{font-size:12px;line-height:1.5}.guide-selected{display:block;font-size:12px;color:#24573c;min-height:18px}.guide-copy{border-top:1px solid #e5e9e2;padding-top:12px;margin-top:12px}.guide-copy h4{margin:0 0 8px;font-size:18px}.guide-copy p{font-size:15px;line-height:1.75;margin:6px 0}.guide-copy p:last-child{background:#f1f5ec;padding:9px;border-radius:6px}.guide-representative{max-width:240px;margin:10px 0}.guide-card.pokemon .guide-representative,.guide-representative.pokemon-feature{width:100%;max-width:520px}.guide-representative.guide-selected-image{width:100%;max-width:520px;margin:0 0 14px}.guide-representative img{width:100%;height:auto;aspect-ratio:4/3;object-fit:contain;border-radius:8px;background:#f4f4ef}.guide-library,.guide-credits,.guide-alternatives{margin:14px 0}.train-guide summary{cursor:pointer;padding:8px 0;min-height:44px}.guide-credits small{margin:8px 0;overflow-wrap:anywhere}.train-guide>small{line-height:1.7}.guide-empty{padding:16px;background:white;border-radius:10px}.guide-photo .photo-unavailable{font-size:12px;padding:15px 4px;display:block}.guide-library .guide-photos{grid-template-columns:repeat(3,minmax(0,1fr))}@media(min-width:760px){.guide-cards{grid-template-columns:repeat(3,minmax(0,1fr))}.guide-photos{grid-template-columns:1fr}.guide-photo{display:grid;grid-template-columns:95px 1fr;column-gap:8px}.guide-photo img{grid-row:1/4}.guide-photo strong{font-size:14px}.guide-library .guide-photo{display:block}.guide-library .guide-photos{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(max-width:360px){.train-guide{padding:12px}.guide-card{padding:12px}.guide-photo strong{font-size:12px}.guide-toolbar{align-items:flex-start;flex-direction:column}}
'''

JS = r'''
let guideLocked=false,guideDate='',guideKeys='',guideItems=[];
const guideLocal=['emu700','emu800','emu900'],guideExpress=['e500','puyuma','emu3000'];
function guideElement(tag,text,cls){const e=document.createElement(tag);if(text)e.textContent=text;if(cls)e.className=cls;return e;}
function guideModel(r){if(r.special||r.label?.includes('寶可夢'))return 'pokemon';if(r.type==='自強3000')return 'emu3000';if(r.type==='普悠瑪')return 'puyuma';if(['1108','1109','110A'].includes(r.carClass))return 'e500';return null;}
function guidePicture(p,alt){const img=document.createElement('img');img.src=p.src;img.alt=alt;img.loading='lazy';img.decoding='async';img.width=640;img.height=480;img.addEventListener('error',()=>{img.replaceWith(guideElement('span','照片暫時無法載入，可先依名稱與顏色選擇。','photo-unavailable'));},{once:true});return img;}
function guideCopy(target,id,selected=false){const m=trainGuideData[id];target.replaceChildren();target.className='guide-copy';if(selected&&m.photos.length){const fig=guideElement('figure',null,'guide-representative guide-selected-image');fig.append(guidePicture(m.photos[0],m.name+'清楚外觀對照照片'),guideElement('figcaption','車型外觀對照，非當次列車實拍','guide-note'));target.append(fig);}target.append(guideElement('h4',(selected?'你選的是':'')+m.name));for(const line of m.lines)target.append(guideElement('p',line));}
function guidePhotos(target,ids,onSelect){const grid=guideElement('div',null,'guide-photos');for(const id of ids){const m=trainGuideData[id],b=guideElement('button',null,'guide-photo');b.type='button';b.setAttribute('aria-pressed','false');b.setAttribute('aria-label','選擇 '+m.name+'，閱讀介紹');if(m.photos.length)b.append(guidePicture(m.photos[0],m.name+'，'+m.hint));b.append(guideElement('strong',m.name),guideElement('small',m.hint));const mark=guideElement('span','點照片認識它','guide-selected');b.append(mark);b.addEventListener('click',()=>{for(const x of grid.querySelectorAll('button')){x.setAttribute('aria-pressed','false');x.querySelector('.guide-selected').textContent='點照片認識它';}b.setAttribute('aria-pressed','true');mark.textContent='已選擇';onSelect(id);});grid.append(b);}target.append(grid);}
function guideCandidates(){const current=taipei();if(current.date!==date)return [];const sec=t=>t.split(':').reduce((a,b)=>a*60+Number(b),0);const rows=(scheduleData.days?.[date]||[]).filter(r=>{const end=r.departure||r.arrival;return end&&!visibility(r.kind,end,current.time,live.get(r.train),confirmedEvents.get(r.train)).hidden&&(!direction.value||r.direction===direction.value)&&(!kind.value||r.kind===kind.value);}).map(r=>({...r,guideTime:r.arrival||r.departure,guideEnd:r.departure||r.arrival}));if(!kind.value){for(const r of scheduleData.specialDays?.[date]||[]){if(!r.expectedPassTime||direction.value&&r.direction!==direction.value)continue;const t=r.expectedPassTime.length===5?r.expectedPassTime+':00':r.expectedPassTime;if(sec(t)+60<sec(current.time))continue;rows.push({...r,guideTime:t,guideEnd:t,passing:true});}}return rows.sort((a,b)=>(sec(a.guideTime)+(a.passing?0:(live.get(a.train)||0)*60))-(sec(b.guideTime)+(b.passing?0:(live.get(b.train)||0)*60))||String(a.train).localeCompare(String(b.train))).slice(0,3);}
function guideCard(r,index){const card=guideElement('article',null,'guide-card'+(guideModel(r)==='pokemon'?' pokemon':''));card.dataset.train=r.train;card.append(guideElement('small',index===0?'下一班':'接下來第'+(index+1)+'班'),guideElement('h3',r.direction+' '+r.train+'次｜'+(r.type||r.label||'專列')));let timeText=r.passing?'預估 '+r.guideTime.slice(0,5)+' 通過・不停靠':r.kind==='苗栗始發'?'表定 '+r.departure.slice(0,5)+' 發車・苗栗始發':r.kind==='苗栗終到'?'表定 '+r.arrival.slice(0,5)+' 到站・苗栗終到':'表定 '+r.arrival.slice(0,5)+' 到站／'+r.departure.slice(0,5)+' 發車';card.append(guideElement('p',timeText,'guide-time'),guideElement('small',null,'guide-event-status'));if(r.passing)card.append(guideElement('p','通過時間參考TransTaiwan App，非臺鐵公告。','guide-note'));
 const model=guideModel(r),copy=guideElement('div');const local=['區間車','區間快'].includes(r.type);if(!model){card.append(guideElement('p',local?'火車來了！看看車頭，哪張照片最像？':'看看眼前的火車，哪張照片最像？','guide-note'));guidePhotos(card,local?guideLocal:guideExpress,id=>{guideLocked=true;guideCopy(copy,id,true);renderTrainGuide();});card.append(copy);}else{if(model==='e500')card.append(guideElement('p','這班通常由橘色E500車頭牽引，實際車輛可能調整。','guide-note'));else card.append(guideElement('p','依公告／時刻資料介紹，實際車輛可能因調度更換。','guide-note'));const m=trainGuideData[model];if(m.photos.length){const fig=guideElement('div',null,'guide-representative');fig.append(guidePicture(m.photos[0],m.name+'外觀對照照片'),guideElement('small','車型外觀對照，非當次列車實拍'));card.append(fig);}guideCopy(copy,model);const intro=guideElement('details',null,'guide-intro');intro.append(guideElement('summary','認識這班火車'),copy);intro.addEventListener('toggle',()=>{if(intro.open){guideLocked=true;renderTrainGuide();}});card.append(intro);const other=guideElement('details',null,'guide-alternatives');other.append(guideElement('summary','來的火車長得不一樣？點這裡找找看'));const ids=model==='pokemon'?[...guideLocal,...guideExpress]:guideExpress;guidePhotos(other,ids,id=>{guideLocked=true;guideCopy(copy,id,true);intro.open=true;renderTrainGuide();});other.addEventListener('toggle',()=>{if(other.open){guideLocked=true;renderTrainGuide();}});card.append(other);}
 const unsure=guideElement('button','都不像／我不確定');unsure.type='button';unsure.addEventListener('click',()=>{guideLocked=true;const library=document.querySelector('.guide-library');library.open=true;library.querySelector('summary').focus();library.scrollIntoView({block:'nearest',behavior:'smooth'});renderTrainGuide();});card.append(unsure);return card;}
function renderTrainGuide(force=false){const box=document.getElementById('train-guide-cards');if(!box)return;const current=taipei();if(guideDate!==current.date){guideLocked=false;guideKeys='';guideDate=current.date;}if(force){guideLocked=false;guideKeys='';}const items=guideCandidates(),keys=items.map(r=>r.train+':'+r.guideTime+':'+guideModel(r)).join('|');if(!guideLocked&&keys!==guideKeys||force||!box.childNodes.length){guideKeys=keys;guideItems=items;box.replaceChildren();for(const [i,r]of items.entries())box.append(guideCard(r,i));if(!items.length)box.append(guideElement('p','目前沒有符合條件的後續班次。也可以打開下方圖鑑，先認識火車。','guide-empty'));}for(const card of box.querySelectorAll('.guide-card')){const r=guideItems.find(x=>x.train===card.dataset.train);if(!r)continue;const end=r.guideEnd;const passed=r.passing?current.time>end:visibility(r.kind,end,current.time,live.get(r.train),confirmedEvents.get(r.train)).hidden;const delay=r.passing?undefined:live.get(r.train);card.querySelector('.guide-event-status').textContent=passed?'表定／預估時段已過，介紹保留供閱讀':delay>0?'目前誤點 '+delay+' 分；到發預估請看上方時刻表':'';}document.getElementById('guide-status').textContent=guideLocked?'正在閱讀，卡片已保留；按右側按鈕更新班次。':'依目前方向與停靠篩選，顯示接下來最多三班。';}
function initTrainGuide(){window.trainGuideReady=true;const library=document.getElementById('guide-library-options'),copy=document.getElementById('guide-library-copy');guidePhotos(library,[...guideLocal,...guideExpress,'pokemon'],id=>guideCopy(copy,id,true));document.getElementById('guide-refresh').addEventListener('click',()=>renderTrainGuide(true));for(const e of [direction,kind,document.getElementById('reset')])e.addEventListener(e.tagName==='SELECT'?'change':'click',()=>renderTrainGuide(true));const credits=document.getElementById('guide-credits-list');for(const m of Object.values(trainGuideData))for(const p of m.photos){const row=guideElement('small',m.name+' · '+p.author+' · ');const source=guideElement('a','照片來源');source.href=p.source;source.target='_blank';source.rel='noopener';row.append(source,document.createTextNode(' · '));const license=guideElement('a',p.license);license.href=p.license==='Public domain'?'https://creativecommons.org/publicdomain/mark/1.0/':p.license.startsWith('CC BY-SA')?'https://creativecommons.org/licenses/by-sa/4.0/':p.license.startsWith('臺鐵新聞照片')?p.source:p.source+'#Licensing';license.target='_blank';license.rel='noopener';row.append(license);credits.append(row);}renderTrainGuide();}
initTrainGuide();
'''

def add_train_guide(page):
    page = page.replace('</style>', CSS+'</style>', 1)
    page = page.replace('<div class="table-wrap">', HTML+'<div class="table-wrap">', 1)
    page = page.replace('<section class="pokemon-panel" aria-labelledby="pokemon-title"><h2', '<details class="pokemon-panel" aria-labelledby="pokemon-title"><summary><h2', 1)
    page = page.replace('</h2><p id="pokemon-today"', '</h2></summary><p id="pokemon-today"', 1)
    page = page.replace('</small></section><section class="legend"', '</small></details><section class="legend"', 1)
    page = page.replace('renderPokemon();}', 'renderPokemon();if(window.trainGuideReady)renderTrainGuide();}', 1)
    page = page.replace('<p id="pokemon-today"', '<figure class="guide-representative pokemon-feature"><img src="/assets/trains/pokemon-2026-tra.jpg" alt="寶可夢彩繪列車實車照片：黃色車頭，車身有皮卡丘與寶可夢彩繪" width="1270" height="713" loading="lazy"><figcaption class="guide-note">照片：臺鐵官方新聞照片；非當次列車實拍。</figcaption></figure><p id="pokemon-today"', 1)
    data = json.dumps(GUIDE, ensure_ascii=False, separators=(',', ':')).replace('<', '\\u003c')
    # Initialization follows the timetable's first render and live fetch setup.
    return page.replace('</script>', '\nconst trainGuideData='+data+';\n'+JS+'\n</script>', 1)
