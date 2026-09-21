import { readFile, access, stat } from 'node:fs/promises';

const languages = ['', 'en/', 'ja/', 'th/', 'vi/', 'id/'];
const vendors = [
  {slug:'02-nambo-wan-yakisoba-bread.html',name:'喃啵萬 炒麵麵包',street:'鐵路一村34號',postal:'360',nearby:'37',menu:true,kind:'store02'},
  {slug:'06-hei-xin-tang-shaved-ice.html',name:'黑心糖古早味剉冰店',map:'R9xGh2wzvjmRofv9A',street:'鐵路一村38號',postal:'360',nearby:'37',menu:true,kind:'store06'}
];
const errors = [];

for (const vendor of vendors) {
  for (const lang of languages) {
    const page = `${lang}railway-village/${vendor.slug}`;
    const html = await readFile(page, 'utf8');
    const requiredTokens = ['<title>','meta name="description"','rel="canonical"','property="og:title"','property="og:description"','application/ld+json',`<h1>${vendor.name}</h1>`,'loading="lazy"','class="notice">※',vendor.street.replace('鐵路一村',''),vendor.nearby,vendor.postal];
    if (vendor.map) requiredTokens.push(vendor.map);
    for (const required of requiredTokens) if (!html.includes(required)) errors.push(`${page}: missing ${required}`);
    if ((html.match(/hreflang=/g) || []).length !== 7) errors.push(`${page}: hreflang count`);
    const match = html.match(/<script type="application\/ld\+json">([^<]+)<\/script>/);
    try {
      const data = JSON.parse(match?.[1] || '');
      if (data['@context'] !== 'https://schema.org' || !data['@type'] || data.address?.streetAddress !== vendor.street || data.address?.postalCode !== vendor.postal) errors.push(`${page}: incomplete address JSON-LD`);
      if (vendor.menu && !data.hasMenu) errors.push(`${page}: missing hasMenu JSON-LD`);
    } catch { errors.push(`${page}: invalid JSON-LD`); }
    if (vendor.kind === 'store02') for (const required of ['data-menu-open','data-menu-dialog','foodpanda.com.tw/restaurant/ifkl/','ubereats.com/tw/store/','W22nek-QU_6DFcnkQXLMfg','rel="noopener sponsored"','class="vendor-gallery"','store-02-yakisoba-bread.webp','store-02-braised-pork-rice.webp','store-02-menu-overview.webp','store-02-shop-interior.webp','store-02-shiba-inu.webp','store-02-dining-room.webp','store-02-exterior-sign.webp','thai-green-tea.webp']) if (!html.includes(required)) errors.push(`${page}: missing ${required}`);
    if (vendor.kind === 'store02') {
      for (const forbidden of ['maps.app.goo.gl','telephone','tel:+886975041213','0975 041 213']) if (html.includes(forbidden)) errors.push(`${page}: obsolete map or phone data remains: ${forbidden}`);
      const navigationLinks = html.match(/<a[^>]+href="https:\/\/www\.google\.com\/maps\/search\/\?api=1&query=[^"]+"/g) || [];
      if (navigationLinks.length !== 1) errors.push(`${page}: expected one top Google Maps navigation link, found ${navigationLinks.length}`);
      if (!html.includes('"hasMap":"https://www.google.com/maps/search/?api=1&query=')) errors.push(`${page}: missing corrected hasMap JSON-LD`);
      const uberLinks = html.match(/<a[^>]+href="https:\/\/www\.ubereats\.com\/tw\/store\/[^"]+"/g) || [];
      if (uberLinks.length !== 2) errors.push(`${page}: expected Uber Eats links in hero and menu, found ${uberLinks.length}`);
    }
    if (vendor.kind === 'store02' && html.includes('thai-milk-tea.webp')) errors.push(`${page}: Store No. 2 CTA must use Thai green tea, not Thai milk tea`);
    if (vendor.kind === 'store06') {
      for (const required of ['data-menu-open','data-menu-dialog','foodpanda.com.tw/restaurant/dn1x/hei-xin-tang','facebook.com/p/','instagram.com/heixintang_brownsugar','R9xGh2wzvjmRofv9A','rel="noopener sponsored"']) if (!html.includes(required)) errors.push(`${page}: missing ${required}`);
      for (const forbidden of ['ZM9AiKtW1nfAFimd6','ubereats.com']) if (html.includes(forbidden)) errors.push(`${page}: obsolete or unavailable service remains: ${forbidden}`);
      const navigationLinks = html.match(/<a[^>]+href="https:\/\/maps\.app\.goo\.gl\/R9xGh2wzvjmRofv9A"/g) || [];
      if (navigationLinks.length !== 1) errors.push(`${page}: expected one top Google Maps navigation link, found ${navigationLinks.length}`);
      const pandaLinks = html.match(/<a[^>]+href="https:\/\/www\.foodpanda\.com\.tw\/restaurant\/dn1x\/hei-xin-tang[^\"]*"/g) || [];
      if (pandaLinks.length !== 2) errors.push(`${page}: expected foodpanda links in hero and menu, found ${pandaLinks.length}`);
      const galleryAssets = ['store-06-exterior.webp','store-06-mixed-ice.webp','store-06-interior.webp','store-06-dessert-close.webp','store-06-tofu-jelly.webp','store-06-brown-sugar-ice.webp','store-06-entrance.webp','store-06-window-dessert.webp'];
      if (!html.includes('class="vendor-gallery"')) errors.push(`${page}: missing gallery`);
      for (const asset of galleryAssets) if (!html.includes(asset)) errors.push(`${page}: missing ${asset}`);
    }
    if ((await stat(page)).size > 32000) errors.push(`${page}: page too large`);
  }
}

for (const file of ['assets/vendor-page.css','assets/vendor-story.css','assets/vendor-language.js','assets/nambo-wan-share.svg','assets/hei-xin-tang-share.svg','assets/thai-milk-tea.webp','assets/store-02-yakisoba-bread.webp','assets/store-02-braised-pork-rice.webp','assets/store-02-menu-overview.webp','assets/store-02-shop-interior.webp','assets/store-02-shiba-inu.webp','assets/store-02-dining-room.webp','assets/store-02-exterior-sign.webp','assets/store-06-exterior.webp','assets/store-06-mixed-ice.webp','assets/store-06-interior.webp','assets/store-06-dessert-close.webp','assets/store-06-tofu-jelly.webp','assets/store-06-brown-sugar-ice.webp','assets/store-06-entrance.webp','assets/store-06-window-dessert.webp','404.html']) {
  try { await access(file); } catch { errors.push(`missing ${file}`); }
}
const sitemap = await readFile('sitemap.xml', 'utf8');
for (const vendor of vendors) for (const lang of languages) {
  const page = `${lang}railway-village/${vendor.slug}`;
  if (!sitemap.includes(`https://nara5.tw/${page}`)) errors.push(`sitemap missing ${page}`);
}

if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log('PASS: 2 vendors × 6 languages, SEO metadata, address JSON-LD, sitemap, vendor-specific links, lazy images and required assets.');
