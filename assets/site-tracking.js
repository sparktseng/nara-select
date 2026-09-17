(() => {
  const measurementId = 'G-XYFCGC99C8';
  const storageKey = 'nara-analytics-consent';
  const lang = document.documentElement.lang || 'en';
  const copy = {
    'zh-Hant': { text:'我們使用 Google Analytics 了解匿名瀏覽與按鈕點擊，協助改善網站；不會傳送姓名、電話或訂單內容。', accept:'同意分析', decline:'拒絕', privacy:'隱私說明' },
    en: { text:'We use Google Analytics for anonymous visits and button clicks to improve this site. We do not send names, phone numbers or order details.', accept:'Allow analytics', decline:'Decline', privacy:'Privacy notice' },
    th: { text:'เราใช้ Google Analytics เพื่อดูการเข้าชมและการคลิกแบบไม่ระบุตัวตนเพื่อปรับปรุงเว็บไซต์ โดยไม่ส่งชื่อ เบอร์โทร หรือข้อมูลคำสั่งซื้อ', accept:'ยอมรับการวิเคราะห์', decline:'ปฏิเสธ', privacy:'ประกาศความเป็นส่วนตัว' },
    vi: { text:'Chúng tôi dùng Google Analytics để đo lượt truy cập và lượt nhấp ẩn danh nhằm cải thiện website; không gửi tên, số điện thoại hoặc thông tin đơn hàng.', accept:'Cho phép phân tích', decline:'Từ chối', privacy:'Thông báo riêng tư' },
    id: { text:'Kami memakai Google Analytics untuk kunjungan dan klik anonim guna memperbaiki situs; nama, nomor telepon, dan detail pesanan tidak dikirim.', accept:'Izinkan analitik', decline:'Tolak', privacy:'Pemberitahuan privasi' },
    ja: { text:'サイト改善のため、匿名の閲覧数とボタンクリックをGoogle Analyticsで測定します。氏名、電話番号、注文内容は送信しません。', accept:'分析を許可', decline:'拒否', privacy:'プライバシー' }
  };
  const t = copy[lang] || copy.en;
  const languageParam = encodeURIComponent(lang);
  const privacyUrl = `/privacy.html?lang=${languageParam}`;
  let loaded = false;

  function loadAnalytics() {
    if (loaded) return; loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){ window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', measurementId, { anonymize_ip:true, transport_type:'beacon' });
    const script = document.createElement('script'); script.async = true; script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`; document.head.appendChild(script);
  }
  function banner() {
    const style = document.createElement('style'); style.textContent = '.nara-consent{position:fixed;z-index:9999;left:14px;right:14px;bottom:14px;max-width:780px;margin:auto;padding:15px 17px;border:1px solid #d8c5b7;border-radius:16px;background:#fffaf4;color:#352a25;box-shadow:0 12px 35px rgba(53,42,37,.2);font:14px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.nara-consent p{margin:0 0 10px}.nara-consent-actions{display:flex;gap:8px;flex-wrap:wrap}.nara-consent button,.nara-consent a{border:1px solid #392d27;border-radius:99px;padding:7px 13px;font:inherit;font-weight:700;text-decoration:none;color:#392d27;background:transparent}.nara-consent .accept{background:#392d27;color:#fff}@media(max-width:520px){.nara-consent-actions{display:grid}.nara-consent button,.nara-consent a{text-align:center}}'; document.head.appendChild(style);
    const box = document.createElement('aside'); box.className='nara-consent'; box.setAttribute('aria-label',t.privacy); box.innerHTML=`<p>${t.text}</p><div class="nara-consent-actions"><button class="accept" type="button">${t.accept}</button><button class="decline" type="button">${t.decline}</button><a href="${privacyUrl}">${t.privacy}</a></div>`; document.body.appendChild(box);
    box.querySelector('.accept').addEventListener('click',()=>{localStorage.setItem(storageKey,'granted');box.remove();loadAnalytics();});
    box.querySelector('.decline').addEventListener('click',()=>{localStorage.setItem(storageKey,'denied');box.remove();});
  }
  const consent = localStorage.getItem(storageKey);
  if (consent === 'granted') loadAnalytics(); else if (consent !== 'denied') banner();

  document.addEventListener('click', event => {
    if (!loaded) return;
    const link = event.target.closest('a[href]'); if (!link) return;
    const href = link.href; let name = '';
    if (href.includes('lin.ee')) name='line_click'; else if (href.includes('google.com/maps')) name='maps_click'; else if (href.includes('instagram.com')) name='instagram_click'; else if (new URL(href,location.href).origin===location.origin) name='internal_navigation';
    if (name) window.gtag('event',name,{link_url:href,link_text:(link.textContent||'').trim().slice(0,80),page_language:lang});
  }, true);
  document.addEventListener('change', event => {
    if (loaded && event.target.matches('[data-language-select]')) window.gtag('event','language_change',{language_selected:event.target.value,page_language:lang});
  }, true);
})();
