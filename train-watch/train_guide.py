"""Family train guide; observations never alter the official timetable."""
import json

def photo(file, path, author, license='CC BY-SA 4.0'):
    return dict(src='https://upload.wikimedia.org/wikipedia/commons/'+path,
                source='https://commons.wikimedia.org/wiki/File:'+file.replace(' ', '_'),
                author=author, license=license)

GUIDE = {
 'formosa': dict(name='環島之星｜三麗鷗萌旅號', hint='車頭帶著三麗鷗彩繪車廂', photos=[dict(src='/assets/trains/formosa-sanrio-overview.jpg',source='https://commons.wikimedia.org/wiki/File:環島之星萌旅號攜手三麗鷗經典角色_全新主題列車萌趣啟航-新聞照片_頁面_13_影像_0001.jpg',author='國營臺灣鐵路股份有限公司',license='臺鐵開放資料授權'),dict(src='/assets/trains/formosa-sanrio-tra.jpg',source='https://www.railway.gov.tw/tra-tip-web/tip/tip00N/tipN01/around/index?lang=zh_TW',author='國營臺灣鐵路股份有限公司',license='臺鐵官方觀光列車照片（權利保留）')], lines=[
 '先看車頭後面的車廂：是不是有大耳狗、布丁狗或酷洛米？',
 '這是「環島之星萌旅號」，穿著三麗鷗彩繪衣服，帶大家繞臺灣旅行。',
 '車廂裡可以唱歌、喝飲料和參加活動，搭火車也像在玩！',
 '親子小任務：等它經過，一人記住一個角色，再分享你找到誰。']),
 'juguang': dict(name='莒光號｜橘色客車', hint='橘色客車、淺色腰帶，車頭另外牽引', photos=[dict(src='/assets/trains/juguang-coach-side.jpg',source='https://commons.wikimedia.org/wiki/File:Different_generations_of_TRA_Chu-Kuang_Express_coaches_at_Qidu_Marshalling_Yard_20210403.jpg',author='Lokseng01',license='CC BY-SA 4.0')], lines=[
 '先看看車頭後面的客車：常見的是橘色車身，配上一條淺色腰帶。',
 '它叫「莒光號」，由前面的機車帶著一節節客車前進。',
 '有些莒光號會安排成團體專列；牽引車頭和車廂可能因調度不同。',
 '親子小任務：先找帶頭的車頭，再看看後面客車的顏色。']),
 'emu700': dict(name='EMU700｜阿福號', hint='車頭下方突出', photos=[photo('Taiwan Railways Administration EMU700 near Shanjia Tunnel 20210820.jpg','1/19/Taiwan_Railways_Administration_EMU700_near_Shanjia_Tunnel_20210820.jpg','Subscriptshoe9')], lines=[
 '看看車頭下面，是不是有一塊向前突出的弧形造型？',
 '這款區間車叫「EMU700」，鐵道迷常叫它「阿福號」。',
 '通常八節車廂連在一起，陪大家上學、上班，也能出門玩。',
 '親子小任務：你覺得它的車頭像什麼？跟爸爸媽媽說說看！']),
 'emu800': dict(name='EMU800｜微笑號', hint='藍色臉／黃色臉', photos=[photo('TRA EMU800 prototype and manufactured in 2016 Zhubei Sta 20160915.jpg','5/59/TRA_EMU800_prototype_and_manufactured_in_2016_Zhubei_Sta_20160915.jpg','Cassiopeia sweet','Public domain')], lines=[
 '看看車頭的藍黃配色，是不是像一張微笑的臉？',
 '它叫「EMU800」，常被叫作「微笑號」；黃色車頭的版本，有些鐵道迷還叫它「小小兵」。',
 '寶可夢彩繪列車也是這個車型，只是換上了限定的新衣服！',
 '親子小任務：今天來的是藍色臉、黃色臉，還是穿著彩繪衣服的版本？']),
 'emu900': dict(name='EMU900｜綠色腰帶', hint='銀色車身、綠色線條', photos=[photo('TRA EMU900 at Shulin Marshalling Yard 04.jpg','b/b7/TRA_EMU900_at_Shulin_Marshalling_Yard_04.jpg','臺灣鐵路管理局','臺鐵開放資料授權')], lines=[
 '銀色車身、黑色車頭玻璃，再找找那條綠色的「腰帶」！',
 '它叫「EMU900」，曾被稱為「最美區間車」。',
 '通常十節車廂連在一起，是一列長長的通勤火車。',
 '親子小任務：等火車經過，一起看看綠色線條延伸到了哪裡！']),
 'e500': dict(name='自強號｜橘色車頭E500', hint='橘色車頭、E5開頭編號', photos=[photo('臺鐵E500型電力機車.jpg','1/14/臺鐵E500型電力機車.jpg','Mafalda4144')], lines=[
 '先找找看，今天是不是亮橘色的E500車頭帶著車廂來了？',
 'E500是電力機車，像力氣很大的領隊，負責帶著後面的客車前進。',
 '在推拉式自強號上，前後通常各有一台機車；看到「E5」開頭的編號，就找到E500家族了！',
 '親子小任務：如果整列火車後面還有一台車頭，跟前面的像不像？']),
 'e1000': dict(name='E1000｜備用的經典車頭', hint='圓潤流線車頭、橘白配色、E10開頭編號', photos=[dict(src='/assets/trains/e1000-pp.jpg',source='https://commons.wikimedia.org/wiki/File:E1000_推拉式自強號.jpg',author='Jason199567',license='CC BY-SA 4.0')], lines=[
 '看看車頭，是不是和照片一樣，有著圓潤的流線外形與橘白配色？再找找「E10」開頭的編號。',
 '這是E1000型電力機車，也是許多人記憶中的PP自強號車頭。過去列車前後各有一輛E1000，一端拉、一端推，帶著旅客往返臺灣各地。',
 '如今一般PP自強號班次已由E500接棒，E1000轉為備用，依當日調度需要出勤。',
 '如果今天遇見它，你很幸運！這位老朋友已經不是每天都能看到了，是可遇不可求的鐵道小驚喜。',
 '親子小任務：看看它圓潤的鼻子，再和E500的照片比一比，兩種車頭哪裡不一樣？']),
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

# One source photo shows both cab colors. The UI frames its left and right halves
# separately so a child can compare the fronts without changing the source image.
for variant, name, hint, first in (
    ('emu800_blue', 'EMU800｜藍色微笑號', '藍色車頭、黃色微笑線', '先找藍色車頭：下方的黃色弧線，像不像一個笑容？'),
    ('emu800_yellow', 'EMU800｜黃色小小兵', '黃色車頭、藍色微笑線', '先找黃色車頭：下方的藍色弧線，像不像一個笑容？'),
):
    GUIDE[variant] = dict(GUIDE['emu800'], name=name, hint=hint,
        photos=[dict(src='/assets/trains/emu800-pair.jpg',
                     source=GUIDE['emu800']['photos'][0]['source'],
                     author='Cassiopeia sweet', license='Public domain')],
        lines=[first, *GUIDE['emu800']['lines'][1:]])

HTML = '''<section class="train-guide" id="train-guide" aria-labelledby="train-guide-title">
<p class="eyebrow">跟著時刻表・認識火車</p><h2 id="train-guide-title">下一班火車，長什麼樣？</h2>
<p>先看時間，再看火車。照片與介紹只跟著最近三班出現。</p>
<div class="guide-toolbar"><p id="guide-status" aria-live="polite"></p><button id="guide-refresh" type="button">看接下來三班</button></div>
<div id="train-guide-cards" class="guide-cards"></div>
<small>照片供外觀對照，非當次列車實拍；你的選擇只用來閱讀介紹，不會修改官方時刻表。通過時間若非臺鐵公告，會標明參考來源。</small>
<details class="guide-credits"><summary>照片來源與授權</summary><div id="guide-credits-list"></div></details>
</section>'''

CSS = r'''
.train-guide{margin:16px 0 24px;padding:20px;background:#eeeee5;border:1px solid #d9ded5;border-radius:16px}.pokemon-panel>summary{cursor:pointer;min-height:44px}.pokemon-panel>summary h2{display:inline;font-size:20px}.train-guide h2{font-size:clamp(23px,4vw,29px);margin:0 0 8px}.guide-toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:16px 0}.guide-toolbar p{font-size:13px}.guide-toolbar button{flex-shrink:0;min-height:44px}.guide-cards{display:grid;gap:16px}.guide-card{background:white;border:1px solid #d9ded5;border-radius:12px;padding:16px;min-width:0}.guide-card.pokemon{border-top:4px solid #e53935;background:#fffbea}.guide-card h3{font-size:19px;margin:4px 0}.guide-time{font-variant-numeric:tabular-nums;font-weight:650}.guide-note{font-size:13px;color:#617169}.guide-photos{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:12px 0}.guide-photo{width:100%;padding:5px;min-width:0;text-align:left;border:2px solid #dce2d9;border-radius:10px;background:#fff;align-self:stretch}.guide-photo[aria-pressed=true]{border-color:#286650;background:#edf6ef}.guide-photo:focus-visible,.train-guide button:focus-visible,.train-guide summary:focus-visible{outline:3px solid #a77920;outline-offset:3px}.guide-photo img{display:block;width:100%;height:auto;aspect-ratio:4/3;object-fit:contain;background:#f2f3ee;border-radius:5px}.guide-photo strong{display:block;font-size:13px;line-height:1.5;margin-top:5px}.guide-photo small{font-size:12px;line-height:1.5}.guide-selected{display:block;font-size:12px;color:#24573c;min-height:18px}.guide-copy{border-top:1px solid #e5e9e2;padding-top:12px;margin-top:12px}.guide-copy h4{margin:0 0 8px;font-size:18px}.guide-copy p{font-size:15px;line-height:1.75;margin:6px 0}.guide-copy p:last-child{background:#f1f5ec;padding:9px;border-radius:6px}.guide-representative{width:100%;max-width:520px;margin:10px 0}.guide-card.pokemon .guide-representative,.guide-representative.pokemon-feature{width:100%;max-width:520px}.guide-representative.guide-selected-image{width:100%;max-width:520px;margin:0 0 14px}.guide-representative img{width:100%;height:auto;aspect-ratio:4/3;object-fit:contain;border-radius:8px;background:#f4f4ef}.guide-library,.guide-credits,.guide-alternatives{margin:14px 0}.train-guide summary{cursor:pointer;padding:8px 0;min-height:44px}.guide-credits small{margin:8px 0;overflow-wrap:anywhere}.train-guide>small{line-height:1.7}.guide-empty{padding:16px;background:white;border-radius:10px}.guide-photo .photo-unavailable{font-size:12px;padding:15px 4px;display:block}.guide-library .guide-photos{grid-template-columns:repeat(3,minmax(0,1fr))}@media(min-width:760px){.guide-cards{grid-template-columns:repeat(3,minmax(0,1fr))}.guide-photos{grid-template-columns:1fr}.guide-photo{display:grid;grid-template-columns:95px 1fr;column-gap:8px}.guide-photo img{grid-row:1/4}.guide-photo strong{font-size:14px}.guide-library .guide-photo{display:block}.guide-library .guide-photos{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(max-width:360px){.train-guide{padding:12px}.guide-card{padding:12px}.guide-photo strong{font-size:12px}.guide-toolbar{align-items:flex-start;flex-direction:column}}
.guide-copy:empty{display:none}.guide-copy:not(:empty){padding:12px;background:#fff;border:1px solid #d9ded5;border-radius:12px;scroll-margin-top:14px}.guide-copy h4:focus{outline:none}.guide-variant-frame{display:block;position:relative;width:100%;aspect-ratio:4/3;overflow:hidden;border-radius:8px;background:#f2f3ee}.guide-photo .guide-variant-frame img,.guide-representative .guide-variant-frame img{position:absolute;top:-25%;width:200%;max-width:none;height:auto;aspect-ratio:auto;object-fit:initial;border-radius:0;background:none}.guide-variant-blue img{left:0}.guide-variant-yellow img{left:-100%}.guide-library .guide-copy{margin:12px 0 16px}.guide-photo .guide-variant-frame{grid-row:1/4}.guide-card .guide-copy{margin-bottom:12px}.guide-times{display:flex;gap:10px;margin:12px 0;flex-wrap:wrap}.guide-time-slot{flex:1;min-width:118px;background:#e9f1e9;border:1px solid #bed4c8;border-radius:10px;padding:8px 12px;font-variant-numeric:tabular-nums}.guide-time-label{display:block;font-size:14px;font-weight:700;color:#325a4a}.guide-clock{display:block;font-size:clamp(30px,4vw,38px);line-height:1.2;letter-spacing:.01em;color:#183f34}.guide-time-slot small{font-size:13px;color:#475e58}.guide-card.pokemon .guide-time-slot{background:#fff4bf;border-color:#e6cb59}.guide-card h3{line-height:1.4}@media(max-width:759px){.guide-photos,.guide-library .guide-photos{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:390px){.guide-photos,.guide-library .guide-photos{gap:6px}.guide-photo{padding:4px}}
'''

JS = r'''
let guideLocked=false,guideDate='',guideKeys='',guideItems=[];
const guideLocal=['emu700','emu800_blue','emu800_yellow','emu900'],guideExpress=['e500','e1000','puyuma','emu3000'];
function guideElement(tag,text,cls){const e=document.createElement(tag);if(text)e.textContent=text;if(cls)e.className=cls;return e;}
function guideModel(r){const label=r.type||r.label||'';if(r.special||label.includes('寶可夢'))return 'pokemon';if(label.includes('環島之星'))return 'formosa';if(label.includes('莒光')||['1110','1111','1112','1113','1114','1115'].includes(r.carClass))return 'juguang';if(label==='自強3000'||['110G','110H','110K','110M'].includes(r.carClass))return 'emu3000';if(label==='普悠瑪'||r.carClass==='1107')return 'puyuma';if(['1108','1109','110A'].includes(r.carClass))return 'e500';return null;}
function guidePicture(p,alt){const img=document.createElement('img');img.src=p.src;img.alt=alt;img.loading='lazy';img.decoding='async';img.width=640;img.height=480;img.addEventListener('error',()=>{img.replaceWith(guideElement('span','照片暫時無法載入，可先依名稱與顏色選擇。','photo-unavailable'));},{once:true});return img;}
function guideVisual(p,id,alt){const img=guidePicture(p,alt);if(!id.startsWith('emu800_'))return img;const frame=guideElement('span',null,'guide-variant-frame guide-variant-'+(id==='emu800_blue'?'blue':'yellow'));frame.append(img);return frame;}
function guideReveal(target){const h=target.querySelector('h4');if(h){h.tabIndex=-1;h.focus({preventScroll:true});target.scrollIntoView({block:'start',behavior:'instant'});}}
function guideCopy(target,id,selected=false,withPhoto=false){const m=trainGuideData[id];target.replaceChildren();target.className='guide-copy';if((selected||withPhoto)&&m.photos.length){for(const [i,p] of m.photos.entries()){const fig=guideElement('figure',null,'guide-representative guide-selected-image');fig.append(guideVisual(p,id,m.name+(i?'彩繪車廂外觀照片':'清楚外觀對照照片')),guideElement('figcaption',id==='juguang'?'停放中的莒光號客車側面；外觀對照，非當次列車實拍':id.startsWith('emu800_')?'同一張合照分別聚焦藍色與黃色車頭，非當次列車實拍':i?'彩繪車廂細節對照，非當次列車實拍':'車型外觀對照，非當次列車實拍','guide-note'));target.append(fig);}}target.append(guideElement('h4',(selected?'你選的是':'')+m.name));for(const line of m.lines)target.append(guideElement('p',line));}
function guidePhotos(target,ids,onSelect){const grid=guideElement('div',null,'guide-photos');for(const id of ids){const m=trainGuideData[id],b=guideElement('button',null,'guide-photo');b.type='button';b.setAttribute('aria-pressed','false');b.setAttribute('aria-label','選擇 '+m.name+'，閱讀介紹');if(m.photos.length)b.append(guideVisual(m.photos[0],id,m.name+'，'+m.hint));b.append(guideElement('strong',m.name),guideElement('small',m.hint));const mark=guideElement('span','點照片認識它','guide-selected');b.append(mark);b.addEventListener('click',()=>{for(const x of grid.querySelectorAll('button')){x.setAttribute('aria-pressed','false');x.querySelector('.guide-selected').textContent='點照片認識它';}b.setAttribute('aria-pressed','true');mark.textContent='已選擇';onSelect(id);});grid.append(b);}target.append(grid);}
function guideCandidates(){
 const current=taipei();if(current.date!==date)return [];
 const sec=t=>t.split(':').reduce((a,b)=>a*60+Number(b),0);
 const rows=(scheduleData.days?.[date]||[]).filter(r=>{const end=r.departure||r.arrival;return end&&!visibility(r.kind,end,current.time,live.get(r.train),confirmedEvents.get(r.train)).hidden&&(!direction.value||r.direction===direction.value)&&(!kind.value||r.kind===kind.value);}).map(r=>({...r,guideTime:r.arrival||r.departure,guideEnd:r.departure||r.arrival}));
 if(!kind.value||kind.value==='通過不停')for(const r of confirmedSpecialRows(date)){
  if(!r.passTime||direction.value&&r.direction!==direction.value||rows.some(x=>String(x.train)===String(r.train)))continue;
  if(sec(r.passTime)+60<sec(current.time))continue;
  rows.push({...r,guideTime:r.passTime,guideEnd:r.passTime,passing:true});
 }
 return rows.sort((a,b)=>(sec(a.guideTime)+(a.passing?0:(live.get(a.train)||0)*60))-(sec(b.guideTime)+(b.passing?0:(live.get(b.train)||0)*60))||String(a.train).localeCompare(String(b.train))).slice(0,3);
}
function guideTimeSlot(label,time,detail){const slot=guideElement('div',null,'guide-time-slot');slot.append(guideElement('span',label,'guide-time-label'),guideElement('strong',time,'guide-clock'+(time.split(':').length===3?' has-seconds':'')));if(detail)slot.append(guideElement('small',detail));return slot;}
function guideCard(r,index){
 const model=guideModel(r),card=guideElement('article',null,'guide-card'+(model==='pokemon'?' pokemon':''));card.dataset.train=r.train;
 card.append(guideElement('small',visitWindow.value==='all'?'符合條件第'+(index+1)+'班':index===0?'下一班':'接下來第'+(index+1)+'班'),guideElement('h3',r.direction+' '+r.train+'次｜'+(r.special?.label||r.label||r.type||'專列')));
 const times=guideElement('div',null,'guide-times');
 if(r.passing)times.append(guideTimeSlot('參考通過',clockText(r.guideTime),'不停靠・非臺鐵公告'));
 else {if(r.arrival)times.append(guideTimeSlot('到站',clockText(r.arrival)));if(r.departure)times.append(guideTimeSlot('離站',clockText(r.departure)));}
 card.append(times,guideElement('small',null,'guide-event-status'));
 const copy=guideElement('div'),local=['區間車','區間快'].includes(r.type);
 if(!model){
  const intro=guideElement('p',r.passing?'實際車型未確認；火車經過時可按外觀找找看。':'火車來了，看看車頭和哪張照片最像。','guide-note');card.append(intro);
  const other=guideElement('details',null,'guide-alternatives');other.append(guideElement('summary','看照片辨認車型'),copy);
  guidePhotos(other,local?guideLocal:[...guideExpress,'juguang','formosa'],id=>{guideLocked=true;guideCopy(copy,id,true);renderTrainGuide();guideReveal(copy);});card.append(other);
 }else{
  if(model==='e500')card.append(guideElement('p','通常由橘色E500車頭牽引，實際車輛可能調整。','guide-note'));
  const m=trainGuideData[model];card.append(guideElement('p','辨認重點：'+m.hint+'｜'+(model==='e500'?'常見配置，實際車輛可能調整':r.special?'公開運用資訊，實際車輛可能調整':'依車種提供外觀對照'),'guide-note'));if(m.photos.length){const fig=guideElement('div',null,'guide-representative');fig.append(guideVisual(m.photos[0],model,m.name+'外觀對照照片'),guideElement('small','外觀對照，非當次列車實拍'));card.append(fig);}
  guideCopy(copy,model);const intro=guideElement('details',null,'guide-intro');intro.append(guideElement('summary','認識這班火車'),copy);card.append(intro);
  const other=guideElement('details',null,'guide-alternatives');other.append(guideElement('summary',model==='e500'?'車頭不一樣？看照片找找看':'車型不同？看照片找找看'));guidePhotos(other,model==='e500'?['e1000','emu3000','puyuma','juguang','formosa']:model==='pokemon'?[...guideLocal,...guideExpress]:[...guideExpress,'juguang','formosa'],id=>{guideLocked=true;guideCopy(copy,id,true);intro.open=true;renderTrainGuide();guideReveal(copy);});card.append(other);
 }
 if(r.special||r.passing)card.append(specialActions(r));
 return card;
}
function renderTrainGuide(force=false){const box=document.getElementById('train-guide-cards');if(!box)return;const current=taipei();if(guideDate!==current.date){guideLocked=false;guideKeys='';guideDate=current.date;}if(force){guideLocked=false;guideKeys='';}const items=guideCandidates(),keys=date+':'+visitWindow.value+':'+items.map(r=>r.train+':'+r.guideTime+':'+guideModel(r)).join('|');if(!guideLocked&&keys!==guideKeys||force||!box.childNodes.length){guideKeys=keys;guideItems=items;box.replaceChildren();for(const [i,r]of items.entries())box.append(guideCard(r,i));if(!items.length)box.append(guideElement('p','目前沒有符合條件的後續班次。','guide-empty'));}for(const card of box.querySelectorAll('.guide-card')){const r=guideItems.find(x=>x.train===card.dataset.train);if(!r)continue;const end=r.guideEnd;const passed=date===current.date&&(r.passing?current.time>end:visibility(r.kind,end,current.time,viewDelay(r.train),confirmedEvents.get(r.train)).hidden);const delay=r.passing?undefined:viewDelay(r.train);card.querySelector('.guide-event-status').textContent=passed?'表定／預估時段已過，介紹保留供閱讀':delay>0?'目前誤點 '+delay+' 分；預估時間請看完整時刻表':'';}document.getElementById('guide-status').textContent=guideLocked?'正在閱讀，卡片已保留；按右側按鈕更新班次。':visitWindow.value==='all'?'依所選日期與條件，顯示時間排序的前三班。':'依目前條件，顯示接下來最多三班。';}
function initTrainGuide(){window.trainGuideReady=true;document.getElementById('guide-refresh').addEventListener('click',()=>renderTrainGuide(true));for(const e of [direction,kind,document.getElementById('reset')])e.addEventListener(e.tagName==='SELECT'?'change':'click',()=>renderTrainGuide(true));const credits=document.getElementById('guide-credits-list'),seen=new Set();for(const m of Object.values(trainGuideData))for(const p of m.photos){if(seen.has(p.source))continue;seen.add(p.source);const row=guideElement('small',m.name+' · '+p.author+' · ');const source=guideElement('a','照片來源');source.href=p.source;source.target='_blank';source.rel='noopener';row.append(source,document.createTextNode(' · '));const license=guideElement('a',p.license);license.href=p.license==='Public domain'?'https://creativecommons.org/publicdomain/mark/1.0/':p.license.startsWith('CC BY-SA')?'https://creativecommons.org/licenses/by-sa/4.0/':p.license.startsWith('臺鐵新聞照片')?p.source:p.source+'#Licensing';license.target='_blank';license.rel='noopener';row.append(license);credits.append(row);}renderTrainGuide();}
initTrainGuide();
document.getElementById('train-guide-cards').addEventListener('toggle',e=>{if(e.target.open)guideLocked=true;},true);
'''

def add_train_guide(page):
    page = page.replace('</style>', CSS+'</style>', 1)
    page = page.replace('<div class="table-wrap">', HTML+'<div class="table-wrap">', 1)
    page = page.replace("document.getElementById('empty').hidden=count!==0;}","document.getElementById('empty').hidden=count!==0;if(window.trainGuideReady)renderTrainGuide();}",1)
    data = json.dumps(GUIDE, ensure_ascii=False, separators=(',', ':')).replace('<', '\\u003c')
    # Initialization follows the timetable's first render and live fetch setup.
    return page.replace('</script>', '\nconst trainGuideData='+data+';\n'+JS+'\n</script>', 1)
