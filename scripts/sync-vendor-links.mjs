import { readFile, writeFile } from 'node:fs/promises';

const pages = {
  'index.html': {title:'鐵路一村店家',two:['先從 2號店「喃啵萬 炒麵麵包」開始，查看核實後的營業時間與位置。','查看 2號店'],six:['6號店「黑心糖古早味剉冰店」，查看地址、常態營業時間與 Google Maps。','查看 6號店']},
  'en/index.html': {title:'Railway Village shops',two:['Store No. 2, Nambo Wan Yakisoba Bread, with verified hours and location.','View Store No. 2'],six:['Store No. 6, Hei Xin Tang Traditional Shaved Ice, with address, regular hours and Google Maps.','View Store No. 6']},
  'ja/index.html': {title:'鉄路一村のお店',two:['2号店「喃啵萬 炒麵麵包」。確認済みの営業時間と場所をご案内します。','2号店を見る'],six:['6号店「黑心糖古早味剉冰店」。住所、通常営業時間、Google Mapsをご案内します。','6号店を見る']},
  'th/index.html': {title:'ร้านค้าในหมู่บ้านรถไฟ',two:['ร้านหมายเลข 2 喃啵萬 พร้อมเวลาและตำแหน่งที่ตรวจสอบแล้ว','ดูร้านหมายเลข 2'],six:['ร้านหมายเลข 6 黑心糖 พร้อมที่อยู่ เวลาปกติ และ Google Maps','ดูร้านหมายเลข 6']},
  'vi/index.html': {title:'Cửa hàng Làng Đường sắt',two:['Cửa hàng số 2 Nambo Wan, có giờ mở cửa và vị trí đã xác minh.','Xem cửa hàng số 2'],six:['Cửa hàng số 6 Hei Xin Tang, có địa chỉ, giờ thường lệ và Google Maps.','Xem cửa hàng số 6']},
  'id/index.html': {title:'Toko Railway Village',two:['Toko No. 2 Nambo Wan, dengan jam dan lokasi terverifikasi.','Lihat Toko No. 2'],six:['Toko No. 6 Hei Xin Tang, dengan alamat, jam reguler, dan Google Maps.','Lihat Toko No. 6']}
};

for (const [file, copy] of Object.entries(pages)) {
  let html = await readFile(file, 'utf8');
  const lang = file === 'index.html' ? '' : `/${file.split('/')[0]}`;
  const section = `<section data-vendor-entry aria-labelledby="vendor-entry-title"><div class="wrap"><div class="eyebrow">RAILWAY VILLAGE SHOPS</div><h2 class="title" id="vendor-entry-title">${copy.title}</h2><div class="grid"><article class="card"><h3>喃啵萬 炒麵麵包</h3><p>${copy.two[0]}</p><div class="btns"><a class="btn alt" href="${lang}/railway-village/02-nambo-wan-yakisoba-bread.html">${copy.two[1]}</a></div></article><article class="card"><h3>黑心糖古早味剉冰店</h3><p>${copy.six[0]}</p><div class="btns"><a class="btn alt" href="${lang}/railway-village/06-hei-xin-tang-shaved-ice.html">${copy.six[1]}</a></div></article></div></div></section>`;
  const current = /<section data-vendor-entry[\s\S]*?<\/section>/;
  html = current.test(html) ? html.replace(current, section) : html.replace('</main>', `${section}</main>`);
  await writeFile(file, html);
}

let sitemap = await readFile('sitemap.xml', 'utf8');
const slugs = ['02-nambo-wan-yakisoba-bread.html', '06-hei-xin-tang-shaved-ice.html'];
const urls = [];
for (const file of Object.keys(pages)) {
  const lang = file === 'index.html' ? '' : `/${file.split('/')[0]}`;
  for (const slug of slugs) {
    const loc = `https://nara5.tw${lang}/railway-village/${slug}`;
    if (!sitemap.includes(`<loc>${loc}</loc>`)) urls.push(`  <url><loc>${loc}</loc><lastmod>2026-09-18</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`);
  }
}
if (urls.length) sitemap = sitemap.replace('</urlset>', `${urls.join('\n')}\n</urlset>`);
await writeFile('sitemap.xml', sitemap);