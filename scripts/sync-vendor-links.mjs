import{readFile,writeFile}from'node:fs/promises';
const pages={
'index.html':['鐵路一村店家','先從 2號店「喃啵萬 炒麵麵包」開始，查看核實後的營業時間與位置。','查看 2號店'],
'en/index.html':['Railway Village shops','Start with Store No. 2, Nambo Wan Yakisoba Bread, with verified hours and location.','View Store No. 2'],
'ja/index.html':['鉄路一村のお店','まずは2号店「喃啵萬 炒麵麵包」。確認済みの営業時間と場所をご案内します。','2号店を見る'],
'th/index.html':['ร้านค้าในหมู่บ้านรถไฟ','เริ่มที่ร้านหมายเลข 2 喃啵萬 ขนมปังยากิโซบะ พร้อมเวลาและตำแหน่งที่ตรวจสอบแล้ว','ดูร้านหมายเลข 2'],
'vi/index.html':['Cửa hàng Làng Đường sắt','Bắt đầu với cửa hàng số 2 Nambo Wan Bánh mì Yakisoba, có giờ mở cửa và vị trí đã xác minh.','Xem cửa hàng số 2'],
'id/index.html':['Toko Railway Village','Mulai dari Toko No. 2 Nambo Wan Roti Yakisoba, dengan jam dan lokasi terverifikasi.','Lihat Toko No. 2']};
for(const[file,copy]of Object.entries(pages)){let html=await readFile(file,'utf8');if(html.includes('data-vendor-entry'))continue;const lang=file==='index.html'?'':('/'+file.split('/')[0]);const href=lang+'/railway-village/02-nambo-wan-yakisoba-bread.html';const section='<section data-vendor-entry aria-labelledby="vendor-entry-title"><div class="wrap"><div class="eyebrow">RAILWAY VILLAGE SHOPS</div><h2 class="title" id="vendor-entry-title">'+copy[0]+'</h2><div class="card"><h3>喃啵萬 炒麵麵包</h3><p>'+copy[1]+'</p><div class="btns"><a class="btn alt" href="'+href+'">'+copy[2]+'</a></div></div></div></section>';html=html.replace('</main>',section+'</main>');await writeFile(file,html)}
let sitemap=await readFile('sitemap.xml','utf8');const urls=Object.keys(pages).map(file=>{const lang=file==='index.html'?'':('/'+file.split('/')[0]);return'  <url><loc>https://nara5.tw'+lang+'/railway-village/02-nambo-wan-yakisoba-bread.html</loc><lastmod>2026-09-18</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>'}).join('\n');if(!sitemap.includes('02-nambo-wan-yakisoba-bread'))sitemap=sitemap.replace('</urlset>',urls+'\n</urlset>');await writeFile('sitemap.xml',sitemap);
