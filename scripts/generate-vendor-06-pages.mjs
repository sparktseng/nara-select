import { mkdir, writeFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const slug = 'railway-village/06-hei-xin-tang-shaved-ice.html';
const map = 'https://maps.app.goo.gl/ZM9AiKtW1nfAFimd6';
const instagram = 'https://www.instagram.com/heixintang_brownsugar/';
const cover = 'https://nara5.tw/assets/hei-xin-tang-share.svg';

const langs = {
  zh: {
    dir: '', code: 'zh-Hant', label: '繁體中文',
    title: '黑心糖古早味剉冰店｜苗栗火車頭園區・鐵路一村6號店',
    desc: '黑心糖古早味剉冰店位於360苗栗縣苗栗市鐵路一村38號、苗栗火車頭園區鐵路一村6號店。查看常態營業時間與 Google Maps 導航。',
    back: '回到 5號店網站', crumb: '鐵路一村店家', tag: '苗栗火車頭園區・鐵路一村 6號店',
    lead: '想找園區裡的黑心糖？這一頁整理完整地址、常態營業時間與 Google Maps 入口，讓你出發前快速確認。',
    map: '在 Google Maps 查看最新資訊', about: '店家資訊',
    aboutText: '黑心糖古早味剉冰店位於苗栗火車頭園區的鐵路一村 6號店。公開店家資訊可確認古早味剉冰、紅豆湯、花生湯與燒仙草等品項；實際供應以店家當日公告為準。',
    hours: '常態營業時間', wedFri: '星期三至星期五', weekend: '星期六、星期日', closed: '星期一、星期二', closedText: '公休',
    notice: '實際營業時間、臨時公休及特殊節日調整，請以 Google Maps 或店家社群最新公告為準。',
    contact: '地址、電話與位置', place: '苗栗火車頭園區・鐵路一村 6號店', address: '地址：360 苗栗縣苗栗市鐵路一村38號', phone: '電話：0910 793 039', social: 'Instagram',
    verified: '本頁資料依店家 Google Maps、官方社群公開資訊及商工登記資料整理；未核實價格不自行刊載。',
    sweet: '逛完6號店，也來看看5號店。', sweetText: '從鐵路一村38號走到37號，就是 5號店 Nara Select；可以喝泰式飲品、看看當日甜點與泰國選物。實際供應以現場為準。',
    naraAddress: '5號店 Nara Select 地址：360 苗栗縣苗栗市鐵路一村37號', visit: '看看 5號店 Nara Select'
  },
  en: {
    dir: 'en/', code: 'en', label: 'English',
    title: 'Hei Xin Tang Traditional Shaved Ice｜Railway Village Store No. 6, Miaoli',
    desc: 'Find Hei Xin Tang at No. 38, Tielu 1st Village, Miaoli City 360, with regular hours and a direct Google Maps link.',
    back: 'Back to Nara Select', crumb: 'Railway Village shops', tag: 'Miaoli Railway Museum・Railway Village Store No. 6',
    lead: 'Check the full address, regular opening hours and latest Google Maps information before your visit.',
    map: 'View latest details on Google Maps', about: 'About the shop',
    aboutText: 'Hei Xin Tang Traditional Shaved Ice is at Railway Village Store No. 6. Public shop information lists traditional shaved ice, red bean soup, peanut soup and grass jelly; daily availability may vary.',
    hours: 'Regular hours', wedFri: 'Wednesday–Friday', weekend: 'Saturday–Sunday', closed: 'Monday–Tuesday', closedText: 'Closed',
    notice: 'For actual hours, temporary closures and holiday changes, check the latest Google Maps or shop social update.',
    contact: 'Address & contact', place: 'Miaoli Railway Museum・Railway Village Store No. 6', address: 'Address: No. 38, Tielu 1st Village, Miaoli City, Miaoli County 360, Taiwan', phone: 'Phone: 0910 793 039', social: 'Instagram',
    verified: 'This page uses the shop’s Google Maps listing, public official social posts and government business registration. Unverified prices are not published.',
    sweet: 'Visiting Store No. 6? Store No. 5 is next door.', sweetText: 'Walk from No. 38 to No. 37 to find Nara Select Store No. 5 for Thai drinks, daily sweets and Thai finds. Availability varies by day.',
    naraAddress: 'Nara Select Store No. 5: No. 37, Tielu 1st Village, Miaoli City', visit: 'Visit Nara Select Store No. 5'
  },
  ja: {
    dir: 'ja/', code: 'ja', label: '日本語',
    title: '黑心糖古早味剉冰店｜苗栗鉄道博物館・鉄路一村6号店',
    desc: '苗栗県苗栗市鉄路一村38号、鉄路一村6号店の黑心糖古早味剉冰店。通常営業時間とGoogle Mapsリンクをご案内します。',
    back: '5号店サイトへ戻る', crumb: '鉄路一村のお店', tag: '苗栗鉄道博物館・鉄路一村6号店',
    lead: '来店前に、住所、通常営業時間、Google Mapsの最新情報を確認できます。',
    map: 'Google Mapsで最新情報を見る', about: '店舗情報',
    aboutText: '黑心糖古早味剉冰店は鉄路一村6号店にあります。公開情報では伝統的なかき氷、紅豆湯、花生湯、仙草などが案内されています。提供内容は当日の告知をご確認ください。',
    hours: '通常営業時間', wedFri: '水曜日〜金曜日', weekend: '土曜日・日曜日', closed: '月曜日・火曜日', closedText: '定休日',
    notice: '実際の営業時間、臨時休業、祝日の変更は、Google Mapsまたは店舗SNSの最新情報をご確認ください。',
    contact: '住所・連絡先', place: '苗栗鉄道博物館・鉄路一村6号店', address: '住所：360 苗栗県苗栗市鉄路一村38号', phone: '電話：0910 793 039', social: 'Instagram',
    verified: '店舗のGoogle Maps、公式SNSの公開情報、商業登記をもとに整理しています。未確認の価格は掲載していません。',
    sweet: '6号店のあとは、お隣の5号店へ。', sweetText: '鉄路一村38号から37号へ歩くと、5号店 Nara Selectがあります。タイドリンク、当日のスイーツ、タイ雑貨を楽しめます。',
    naraAddress: '5号店 Nara Select：苗栗県苗栗市鉄路一村37号', visit: '5号店 Nara Selectを見る'
  },
  th: {
    dir: 'th/', code: 'th', label: 'ไทย',
    title: '黑心糖 น้ำแข็งไสโบราณ｜พิพิธภัณฑ์รถไฟเหมียวลี่・ร้านหมายเลข 6',
    desc: 'ร้าน黑心糖อยู่เลขที่ 38 หมู่บ้านรถไฟ เมืองเหมียวลี่ 360 พร้อมเวลาทำการปกติและลิงก์ Google Maps',
    back: 'กลับเว็บไซต์ร้านหมายเลข 5', crumb: 'ร้านค้าในหมู่บ้านรถไฟ', tag: 'พิพิธภัณฑ์รถไฟเหมียวลี่・ร้านหมายเลข 6',
    lead: 'ตรวจสอบที่อยู่ เวลาทำการปกติ และข้อมูลล่าสุดบน Google Maps ก่อนเดินทาง',
    map: 'ดูข้อมูลล่าสุดใน Google Maps', about: 'ข้อมูลร้าน',
    aboutText: '黑心糖 ร้านน้ำแข็งไสแบบดั้งเดิมอยู่ที่ร้านหมายเลข 6 ข้อมูลสาธารณะระบุน้ำแข็งไส ซุปถั่วแดง ซุปถั่วลิสง และเฉาก๊วย โปรดตรวจสอบรายการประจำวันที่ร้าน',
    hours: 'เวลาทำการปกติ', wedFri: 'วันพุธ–วันศุกร์', weekend: 'วันเสาร์–วันอาทิตย์', closed: 'วันจันทร์–วันอังคาร', closedText: 'ปิด',
    notice: 'เวลาจริง วันหยุดชั่วคราว และการปรับเวลาในวันพิเศษ โปรดดู Google Maps หรือโซเชียลของร้านล่าสุด',
    contact: 'ที่อยู่และติดต่อ', place: 'พิพิธภัณฑ์รถไฟเหมียวลี่・ร้านหมายเลข 6', address: 'ที่อยู่: เลขที่ 38 หมู่บ้านรถไฟ เมืองเหมียวลี่ มณฑลเหมียวลี่ 360 ไต้หวัน', phone: 'โทรศัพท์: 0910 793 039', social: 'Instagram',
    verified: 'ข้อมูลมาจาก Google Maps โพสต์สาธารณะของร้าน และทะเบียนธุรกิจ โดยไม่เผยแพร่ราคาที่ยังไม่ยืนยัน',
    sweet: 'จากร้านหมายเลข 6 แวะร้านหมายเลข 5 ได้เลย', sweetText: 'เดินจากเลขที่ 38 ไปเลขที่ 37 จะพบร้านหมายเลข 5 Nara Select พร้อมเครื่องดื่มไทย ขนมประจำวัน และสินค้าไทย',
    naraAddress: 'ร้านหมายเลข 5 Nara Select: เลขที่ 37 หมู่บ้านรถไฟ เมืองเหมียวลี่', visit: 'ดูร้านหมายเลข 5 Nara Select'
  },
  vi: {
    dir: 'vi/', code: 'vi', label: 'Tiếng Việt',
    title: 'Hei Xin Tang Đá bào truyền thống｜Cửa hàng số 6, Làng Đường sắt Miêu Lật',
    desc: 'Hei Xin Tang tại số 38, Làng Đường sắt, TP. Miêu Lật 360, với giờ mở cửa thường lệ và liên kết Google Maps.',
    back: 'Về trang Nara Select', crumb: 'Cửa hàng Làng Đường sắt', tag: 'Bảo tàng Đường sắt Miêu Lật・Cửa hàng số 6',
    lead: 'Kiểm tra địa chỉ, giờ mở cửa thường lệ và thông tin mới nhất trên Google Maps trước khi đến.',
    map: 'Xem thông tin mới nhất trên Google Maps', about: 'Thông tin cửa hàng',
    aboutText: 'Hei Xin Tang bán đá bào truyền thống tại cửa hàng số 6. Thông tin công khai có đá bào, chè đậu đỏ, chè đậu phộng và thạch cỏ; món thực tế tùy ngày.',
    hours: 'Giờ mở cửa thường lệ', wedFri: 'Thứ Tư–Thứ Sáu', weekend: 'Thứ Bảy–Chủ Nhật', closed: 'Thứ Hai–Thứ Ba', closedText: 'Đóng cửa',
    notice: 'Giờ thực tế, ngày nghỉ đột xuất và thay đổi dịp lễ vui lòng xem Google Maps hoặc mạng xã hội mới nhất của cửa hàng.',
    contact: 'Địa chỉ & liên hệ', place: 'Bảo tàng Đường sắt Miêu Lật・Cửa hàng số 6', address: 'Địa chỉ: Số 38, Làng Đường sắt, TP. Miêu Lật, huyện Miêu Lật 360, Đài Loan', phone: 'Điện thoại: 0910 793 039', social: 'Instagram',
    verified: 'Thông tin được tổng hợp từ Google Maps, bài đăng công khai chính thức và đăng ký kinh doanh. Giá chưa xác minh không được đăng.',
    sweet: 'Ghé cửa hàng số 6 rồi sang cửa hàng số 5.', sweetText: 'Đi từ số 38 đến số 37 là cửa hàng số 5 Nara Select, nơi có đồ uống Thái, món ngọt trong ngày và đồ tuyển chọn Thái Lan.',
    naraAddress: 'Nara Select cửa hàng số 5: Số 37, Làng Đường sắt, TP. Miêu Lật', visit: 'Xem Nara Select cửa hàng số 5'
  },
  id: {
    dir: 'id/', code: 'id', label: 'Bahasa Indonesia',
    title: 'Hei Xin Tang Es Serut Tradisional｜Railway Village Toko No. 6, Miaoli',
    desc: 'Hei Xin Tang berada di No. 38, Railway Village, Kota Miaoli 360, dengan jam reguler dan tautan Google Maps.',
    back: 'Kembali ke Nara Select', crumb: 'Toko Railway Village', tag: 'Museum Kereta Miaoli・Railway Village Toko No. 6',
    lead: 'Periksa alamat, jam buka reguler, dan informasi terbaru di Google Maps sebelum berkunjung.',
    map: 'Lihat info terbaru di Google Maps', about: 'Tentang toko',
    aboutText: 'Hei Xin Tang menyajikan es serut tradisional di Toko No. 6. Informasi publik mencantumkan es serut, sup kacang merah, sup kacang tanah, dan cincau; ketersediaan berubah setiap hari.',
    hours: 'Jam buka reguler', wedFri: 'Rabu–Jumat', weekend: 'Sabtu–Minggu', closed: 'Senin–Selasa', closedText: 'Tutup',
    notice: 'Untuk jam aktual, tutup sementara, dan perubahan hari libur, periksa Google Maps atau media sosial toko terbaru.',
    contact: 'Alamat & kontak', place: 'Museum Kereta Miaoli・Railway Village Toko No. 6', address: 'Alamat: No. 38, Railway Village, Kota Miaoli, Kabupaten Miaoli 360, Taiwan', phone: 'Telepon: 0910 793 039', social: 'Instagram',
    verified: 'Informasi dirangkum dari Google Maps, unggahan publik resmi, dan pendaftaran usaha. Harga yang belum terverifikasi tidak dipublikasikan.',
    sweet: 'Dari Toko No. 6, mampir ke Toko No. 5.', sweetText: 'Berjalan dari No. 38 ke No. 37 untuk menemukan Toko No. 5 Nara Select, dengan minuman Thailand, hidangan manis harian, dan produk pilihan Thailand.',
    naraAddress: 'Nara Select Toko No. 5: No. 37, Railway Village, Kota Miaoli', visit: 'Lihat Nara Select Toko No. 5'
  }
};

const reviews = {
  'zh-Hant': {title:'顧客評論常提到',text:'不少顧客喜歡黑心糖古早味剉冰香氣濃郁的黑糖滋味，粉圓與芋圓也經常獲得好評。想吃鹹食時，還有人推薦湯頭清甜的關東煮。合理的價格、乾淨舒適的環境，以及親切熱情的店員，都是評論中常被提到的特色。',notice:'以上為 Google Maps 公開評論的綜合整理，反映評論者的個人體驗；品項、價格與現場狀況可能調整，請以店家最新公告為準。'},
  en: {title:'What customers often mention',text:'Reviews often praise the rich brown-sugar flavour of the traditional shaved ice, especially the tapioca pearls and taro balls. Some customers also recommend the light, savoury oden broth. Reasonable prices, a clean and comfortable setting, and friendly staff are frequently mentioned.',notice:'This is a summary of public Google Maps reviews and reflects individual experiences. Items, prices and on-site conditions may change; check the shop’s latest notice.'},
  ja: {title:'口コミでよく挙げられること',text:'黒糖かき氷の豊かな香りと味、特にタピオカと芋圓が好評です。あっさりしたスープのおでん、手頃な価格、清潔で快適な店内、親切なスタッフもよく評価されています。',notice:'Google Mapsの公開口コミをまとめたもので、個人の体験を反映しています。商品、価格、店頭状況は変更される場合があります。'},
  th: {title:'สิ่งที่ลูกค้ามักพูดถึง',text:'รีวิวมักชื่นชมน้ำแข็งไสน้ำตาลทรายแดงที่หอมเข้มข้น โดยเฉพาะไข่มุกและเผือกก้อน หลายคนยังแนะนำโอเด้งน้ำซุปใสรสกลมกล่อม พร้อมกล่าวถึงราคาสมเหตุสมผล ร้านสะอาดสบาย และพนักงานเป็นมิตร',notice:'ข้อความนี้สรุปจากรีวิวสาธารณะบน Google Maps และสะท้อนประสบการณ์ส่วนบุคคล สินค้า ราคา และสภาพหน้างานอาจเปลี่ยนแปลงได้'},
  vi: {title:'Điều khách hàng thường nhắc đến',text:'Nhiều đánh giá khen đá bào đường đen thơm đậm, đặc biệt là trân châu và viên khoai môn. Một số khách cũng giới thiệu oden có nước dùng thanh ngọt. Giá hợp lý, không gian sạch sẽ thoải mái và nhân viên thân thiện cũng thường được nhắc đến.',notice:'Đây là bản tổng hợp các đánh giá công khai trên Google Maps và phản ánh trải nghiệm cá nhân. Món ăn, giá và tình hình tại cửa hàng có thể thay đổi.'},
  id: {title:'Hal yang sering disebut pelanggan',text:'Ulasan sering memuji es serut gula merah yang harum dan kaya rasa, terutama mutiara tapioka dan bola talas. Beberapa pelanggan juga merekomendasikan oden dengan kuah ringan. Harga wajar, tempat yang bersih dan nyaman, serta staf ramah juga kerap disebut.',notice:'Ringkasan ini berasal dari ulasan publik Google Maps dan mencerminkan pengalaman pribadi. Produk, harga, dan kondisi di toko dapat berubah.'}
};
const visitLabels = {
  'zh-Hant':'查看5號店｜泰式飲品與泰國選物',en:'Visit Store No. 5｜Thai drinks & Thai finds',ja:'5号店を見る｜タイドリンク・タイ雑貨',th:'ดูร้านหมายเลข 5｜เครื่องดื่มและสินค้าไทย',vi:'Xem cửa hàng số 5｜Đồ uống và sản phẩm Thái',id:'Lihat Toko No. 5｜Minuman & produk Thailand'
};
for (const l of Object.values(langs)) { l.review = reviews[l.code]; l.visit = visitLabels[l.code]; }
langs.zh.sweet = '吃完冰，再到隔壁找點泰國味。';
langs.zh.sweetText = '從鐵路一村38號往37號走，就是5號店 Nara Select。這裡有泰式飲品、當日甜點與泰國選物，逛完6號店後，可以順路來喝杯泰式奶茶、看看店裡的新鮮選物。';

const alternates = Object.values(langs).map(l => `<link rel="alternate" hreflang="${l.code}" href="https://nara5.tw/${l.dir}${slug}">`).join('') + `<link rel="alternate" hreflang="x-default" href="https://nara5.tw/${slug}">`;
const options = Object.values(langs).map(l => `<option value="/${l.dir}${slug}">${l.label}</option>`).join('');

for (const l of Object.values(langs)) {
  const path = `${l.dir}${slug}`;
  const url = `https://nara5.tw/${path}`;
  const json = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'IceCreamShop', name: '黑心糖古早味剉冰店', url,
    description: l.desc, telephone: '+886-910-793-039', hasMap: map, sameAs: [instagram],
    address: {'@type':'PostalAddress',streetAddress:'鐵路一村38號',addressLocality:'苗栗市',addressRegion:'苗栗縣',postalCode:'360',addressCountry:'TW'},
    openingHoursSpecification: [
      {'@type':'OpeningHoursSpecification',dayOfWeek:['Wednesday','Thursday','Friday'],opens:'12:30',closes:'20:30'},
      {'@type':'OpeningHoursSpecification',dayOfWeek:['Saturday','Sunday'],opens:'11:30',closes:'20:30'}
    ],
    containedInPlace: {'@type':'TouristAttraction',name:'苗栗火車頭園區'}
  });
  const html = `<!doctype html><html lang="${l.code}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${l.title}</title><meta name="description" content="${l.desc}"><meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1"><link rel="canonical" href="${url}">${alternates}<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/assets/vendor-page.css?v=20260918-1"><meta property="og:type" content="website"><meta property="og:site_name" content="鐵路一村店家｜Nara Select"><meta property="og:title" content="${l.title}"><meta property="og:description" content="${l.desc}"><meta property="og:url" content="${url}"><meta property="og:image" content="${cover}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${l.title}"><meta name="twitter:description" content="${l.desc}"><meta name="twitter:image" content="${cover}"><script type="application/ld+json">${json}</script></head><body><a class="skip" href="#main">Skip to content</a><header class="top"><div class="wrap nav"><a class="home" href="/${l.dir}">5號店<small>NARA SELECT</small></a><select class="lang" data-vendor-language aria-label="Language">${options}</select></div></header><main id="main"><section class="hero"><div class="wrap"><nav class="crumb"><a href="/${l.dir}">${l.back}</a> › ${l.crumb}</nav><div class="kicker">${l.tag}</div><h1>黑心糖古早味剉冰店</h1><p class="lead">${l.lead}</p><div class="actions"><a class="btn" href="${map}" target="_blank" rel="noopener">${l.map}</a><a class="btn alt" href="/${l.dir}">${l.back}</a></div></div></section><section class="section"><div class="wrap grid"><article class="card"><h2>${l.about}</h2><p>${l.aboutText}</p></article><article class="card"><h2>${l.hours}</h2><ul class="hours"><li><span>${l.wedFri}</span><strong>12:30–20:30</strong></li><li><span>${l.weekend}</span><strong>11:30–20:30</strong></li><li><span>${l.closed}</span><strong>${l.closedText}</strong></li></ul><p class="notice">${l.notice}</p></article><article class="card"><h2>${l.contact}</h2><p>${l.place}<br><strong>${l.address}</strong><br><a href="tel:+886910793039">${l.phone}</a></p><div class="actions"><a class="btn" href="${map}" target="_blank" rel="noopener">Google Maps</a><a class="btn alt" href="${instagram}" target="_blank" rel="noopener">${l.social}</a></div></article><article class="card"><h2>DATA SOURCE</h2><p class="source">${l.verified}</p></article></div></section><section class="section"><div class="wrap"><article class="card"><h2>${l.review.title}</h2><p>${l.review.text}</p><p class="notice">※ ${l.review.notice}</p></article></div></section><section class="section alt"><div class="wrap cta"><div><h2>${l.sweet}</h2><p>${l.sweetText}</p><p><strong>${l.naraAddress}</strong></p><div class="actions"><a class="btn" href="/${l.dir}">${l.visit}</a></div></div><img src="/assets/thai-milk-tea.webp" width="640" height="929" loading="lazy" decoding="async" alt="5號店 Nara Select Thai milk tea"></div></section></main><footer><div class="wrap">鐵路一村店家資訊・由 5號店 Nara Select 網站整理<br>© 2026 Nara Select</div></footer><script>document.querySelector('[data-vendor-language]').value=location.pathname.startsWith('/en/')?'/en/${slug}':location.pathname.startsWith('/ja/')?'/ja/${slug}':location.pathname.startsWith('/th/')?'/th/${slug}':location.pathname.startsWith('/vi/')?'/vi/${slug}':location.pathname.startsWith('/id/')?'/id/${slug}':'/${slug}'</script><script src="/assets/vendor-language.js?v=20260918-1" defer></script><script src="/assets/site-tracking.js?v=20260918-ga4" defer></script></body></html>`;
  await mkdir(new URL(`${l.dir}railway-village/`, root), {recursive:true});
  await writeFile(new URL(path, root), html);
}