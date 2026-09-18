import { readFile, access, stat } from 'node:fs/promises';

const languages = ['', 'en/', 'ja/', 'th/', 'vi/', 'id/'];
const vendors = [
  {slug:'02-nambo-wan-yakisoba-bread.html',name:'喃啵萬 炒麵麵包',map:'svvYSrcNzCKEuG7v8',street:'鐵路一村34號',postal:'360',nearby:'37',menu:true},
  {slug:'06-hei-xin-tang-shaved-ice.html',name:'黑心糖古早味剉冰店',map:'ZM9AiKtW1nfAFimd6',street:'鐵路一村38號',postal:'360',nearby:'37'}
];
const errors = [];

for (const vendor of vendors) {
  for (const lang of languages) {
    const page = `${lang}railway-village/${vendor.slug}`;
    const html = await readFile(page, 'utf8');
    for (const required of ['<title>','meta name="description"','rel="canonical"','property="og:title"','property="og:description"','application/ld+json',`<h1>${vendor.name}</h1>`,vendor.map,'loading="lazy"','class="notice">※',vendor.street.replace('鐵路一村',''),vendor.nearby,vendor.postal]) if (!html.includes(required)) errors.push(`${page}: missing ${required}`);
    if ((html.match(/hreflang=/g) || []).length !== 7) errors.push(`${page}: hreflang count`);
    const match = html.match(/<script type="application\/ld\+json">([^<]+)<\/script>/);
    try {
      const data = JSON.parse(match?.[1] || '');
      if (data['@context'] !== 'https://schema.org' || !data['@type'] || data.address?.streetAddress !== vendor.street || data.address?.postalCode !== vendor.postal) errors.push(`${page}: incomplete address JSON-LD`);
      if (vendor.menu && !data.hasMenu) errors.push(`${page}: missing hasMenu JSON-LD`);
    } catch { errors.push(`${page}: invalid JSON-LD`); }
    if (vendor.menu) for (const required of ['data-menu-open','data-menu-dialog','foodpanda.com.tw/restaurant/ifkl/','rel="noopener sponsored"','class="vendor-gallery"','store-02-yakisoba-bread.webp','store-02-braised-pork-rice.webp','store-02-menu-overview.webp','store-02-shop-interior.webp','store-02-shiba-inu.webp','store-02-dining-room.webp','store-02-exterior-sign.webp','thai-green-tea.webp']) if (!html.includes(required)) errors.push(`${page}: missing ${required}`);
    if (vendor.menu && html.includes('thai-milk-tea.webp')) errors.push(`${page}: Store No. 2 CTA must use Thai green tea, not Thai milk tea`);
    if ((await stat(page)).size > 20000) errors.push(`${page}: page too large`);
  }
}

for (const file of ['assets/vendor-page.css','assets/vendor-language.js','assets/nambo-wan-share.svg','assets/hei-xin-tang-share.svg','assets/thai-milk-tea.webp','assets/store-02-yakisoba-bread.webp','assets/store-02-braised-pork-rice.webp','assets/store-02-menu-overview.webp','assets/store-02-shop-interior.webp','assets/store-02-shiba-inu.webp','assets/store-02-dining-room.webp','assets/store-02-exterior-sign.webp','404.html']) {
  try { await access(file); } catch { errors.push(`missing ${file}`); }
}
const sitemap = await readFile('sitemap.xml', 'utf8');
for (const vendor of vendors) for (const lang of languages) {
  const page = `${lang}railway-village/${vendor.slug}`;
  if (!sitemap.includes(`https://nara5.tw/${page}`)) errors.push(`sitemap missing ${page}`);
}

if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log('PASS: 2 vendors × 6 languages, SEO metadata, address JSON-LD, sitemap, map links, lazy image and required assets.');
