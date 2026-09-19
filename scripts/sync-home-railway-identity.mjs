import { readFileSync, writeFileSync } from 'node:fs';

const address = 'No. 37, Railway 1st Vil., Miaoli City, Miaoli County 360005, Taiwan (R.O.C.)';
const pages = {
  'index.html': '「鐵路一村」是這片臺鐵員工宿舍留下的歷史名稱。2025年園區開幕後，文創小鋪區的現場名稱是「火車頭一村」；在苗栗故事裡，我們保留「鐵路一村」，讓老地方的故事繼續被看見。',
  'en/index.html': '“Tielu Yicun” is the historic name carried by this former Taiwan Railway workers’ settlement. Since the park opened in 2025, on-site signs call the creative-shop area “Locomotive Village.” In Miaoli Stories, we keep Railway Village No. 1 visible so the older story can continue.',
  'th/index.html': '“Tielu Yicun” คือชื่อทางประวัติศาสตร์ของชุมชนที่พักพนักงานรถไฟไต้หวันแห่งนี้ หลังสวนเปิดในปี 2025 พื้นที่ร้านสร้างสรรค์ใช้ชื่อบนป้ายว่า “Locomotive Village” แต่ใน Miaoli Stories เรายังคงชื่อ Railway Village No. 1 เพื่อให้เรื่องราวเดิมดำเนินต่อไป',
  'vi/index.html': '“Tielu Yicun” là tên lịch sử của khu nhà ở dành cho nhân viên Đường sắt Đài Loan. Sau khi công viên khai trương năm 2025, khu cửa hàng sáng tạo được chỉ dẫn tại chỗ là “Locomotive Village”. Trong Miaoli Stories, chúng tôi vẫn giữ Railway Village No. 1 để câu chuyện cũ được tiếp nối.',
  'id/index.html': '“Tielu Yicun” adalah nama bersejarah permukiman mantan pegawai Taiwan Railway ini. Sejak taman dibuka pada 2025, papan di area toko kreatif memakai nama “Locomotive Village”. Dalam Miaoli Stories, kami tetap menampilkan Railway Village No. 1 agar kisah lamanya terus hidup.',
  'ja/index.html': '「鉄路一村」は、かつての台湾鉄道職員宿舎に残る歴史的な名称です。2025年の園区開幕後、文創店舗エリアの現地表示は「火車頭一村（Locomotive Village）」となりましたが、苗栗の物語では Railway Village No. 1 の名を残し、古い場所の物語を伝え続けます。'
};

let css = readFileSync('assets/home-stories.css', 'utf8');
if (!css.includes('.railway-identity{')) {
  css = css.replace(
    '.home-stories-intro{max-width:760px;color:#654b40;font-size:1.06rem}',
    '.home-stories-intro{max-width:760px;color:#654b40;font-size:1.06rem}.railway-identity{max-width:760px;margin:24px 0 0;padding:18px 20px;border-left:4px solid var(--story-orange);border-radius:0 16px 16px 0;background:var(--story-cream);color:#654b40}.railway-identity strong{display:block;margin-bottom:5px;color:var(--story-brown);font-size:1.08rem}.railway-identity span{display:block}'
  );
  writeFileSync('assets/home-stories.css', css);
}

for (const [path, copy] of Object.entries(pages)) {
  let html = readFileSync(path, 'utf8');
  if (!html.includes('class="railway-identity"')) {
    const sectionStart = html.indexOf('<section id="miaoli-stories"');
    const gridStart = html.indexOf('<div class="home-story-grid">', sectionStart);
    if (sectionStart < 0 || gridStart < 0) throw new Error(`Miaoli Stories insertion point missing: ${path}`);
    const identity = `<div class="railway-identity"><strong>Tielu Yicun — Miaoli Railway Village No. 1</strong><span>${copy}</span></div>`;
    html = html.slice(0, gridStart) + identity + html.slice(gridStart);
  }
  if (!html.includes(address)) {
    const footerNeedle = '<br><span>© 2026 Nara Select</span>';
    if (!html.includes(footerNeedle)) throw new Error(`Footer insertion point missing: ${path}`);
    html = html.replace(footerNeedle, `<br><span lang="en">${address}</span><br><span>© 2026 Nara Select</span>`);
  }
  writeFileSync(path, html);
}

const storyPath = 'railway-village-history.html';
let story = readFileSync(storyPath, 'utf8');
if (!story.includes('.identity-note{')) {
  story = story.replace(
    'main{padding:62px 0 80px}.intro{max-width:780px;margin:0 auto 50px;font-size:1.08rem}',
    'main{padding:62px 0 80px}.intro{max-width:780px;margin:0 auto 22px;font-size:1.08rem}.identity-note{max-width:780px;margin:0 auto 50px;padding:18px 20px;border-left:5px solid var(--gold);border-radius:0 16px 16px 0;background:var(--card);color:#514940}.identity-note strong{display:block;margin-bottom:5px;color:var(--green)}'
  );
}
if (!story.includes('id="nameNote"')) {
  story = story.replace(
    '<p class="intro" id="intro">老房子沒有自己消失，也不是某一天突然變漂亮。它先被地方居民和關心文化保存的人拉住，再經過好幾年的整理、討論和施工，才慢慢長成今天的苗栗火車頭園區。</p>',
    '<p class="intro" id="intro">老房子沒有自己消失，也不是某一天突然變漂亮。它先被地方居民和關心文化保存的人拉住，再經過好幾年的整理、討論和施工，才慢慢長成今天的苗栗火車頭園區。</p><aside class="identity-note" id="nameNote"><strong>Tielu Yicun — Miaoli Railway Village No. 1</strong>「鐵路一村」是這片臺鐵員工宿舍留下的歷史名稱。2025年園區開幕後，文創小鋪區的現場名稱是「火車頭一村」；這個故事仍以「鐵路一村」為主角，讓地方記憶繼續被看見。</aside>'
  );
}
if (!story.includes('const nameNotes=')) {
  const notes = {
    'zh-Hant': '<strong>Tielu Yicun — Miaoli Railway Village No. 1</strong>「鐵路一村」是這片臺鐵員工宿舍留下的歷史名稱。2025年園區開幕後，文創小鋪區的現場名稱是「火車頭一村」；這個故事仍以「鐵路一村」為主角，讓地方記憶繼續被看見。',
    en: '<strong>Tielu Yicun — Miaoli Railway Village No. 1</strong>“Tielu Yicun” is the historic name of this former Taiwan Railway workers’ settlement. Since the park opened in 2025, on-site signs call the creative-shop area “Locomotive Village.” This story keeps Railway Village No. 1 at its centre so the older place memory remains visible.',
    th: '<strong>Tielu Yicun — Miaoli Railway Village No. 1</strong>“Tielu Yicun” คือชื่อทางประวัติศาสตร์ของชุมชนที่พักพนักงานรถไฟไต้หวันแห่งนี้ หลังสวนเปิดในปี 2025 พื้นที่ร้านสร้างสรรค์ใช้ชื่อ “Locomotive Village” แต่เรื่องนี้ยังคงให้ Railway Village No. 1 เป็นหัวใจของความทรงจำ',
    vi: '<strong>Tielu Yicun — Miaoli Railway Village No. 1</strong>“Tielu Yicun” là tên lịch sử của khu nhà nhân viên Đường sắt Đài Loan. Từ khi công viên mở cửa năm 2025, biển tại khu cửa hàng sáng tạo ghi “Locomotive Village”. Câu chuyện này vẫn đặt Railway Village No. 1 ở trung tâm để ký ức cũ được tiếp nối.',
    id: '<strong>Tielu Yicun — Miaoli Railway Village No. 1</strong>“Tielu Yicun” adalah nama bersejarah permukiman pegawai Taiwan Railway ini. Sejak taman dibuka pada 2025, papan area toko kreatif memakai nama “Locomotive Village”. Kisah ini tetap menempatkan Railway Village No. 1 sebagai pusat ingatan lama.',
    ja: '<strong>Tielu Yicun — Miaoli Railway Village No. 1</strong>「鉄路一村」は、かつての台湾鉄道職員宿舎に残る歴史的名称です。2025年の園区開幕後、文創店舗エリアの現地表示は「火車頭一村（Locomotive Village）」となりましたが、この物語では「鉄路一村」を主役として地域の記憶を伝え続けます。'
  };
  story = story.replace('  const T={', `  const nameNotes=${JSON.stringify(notes)};\n  const T={`);
}
story = story.replace("eyebrow:'RAILWAY VILLAGE STORY'", "eyebrow:'TIELU YICUN · RAILWAY VILLAGE NO. 1'");
if (!story.includes("document.getElementById('nameNote').innerHTML=nameNotes[lang]")) {
  story = story.replace(
    "document.querySelector('meta[name=\"description\"]').content=t.description;",
    "document.querySelector('meta[name=\"description\"]').content=t.description;document.getElementById('nameNote').innerHTML=nameNotes[lang]||nameNotes['zh-Hant'];"
  );
}
writeFileSync(storyPath, story);

console.log(`Updated ${Object.keys(pages).length} homepages and ${storyPath}.`);
