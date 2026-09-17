(() => {
  const supported = ['en','th','vi','id','ja'];
  const current = location.pathname.match(/^\/(en|th|vi|id|ja)(?=\/)/)?.[1] || 'zh-Hant';
  document.querySelectorAll('[data-language-select]').forEach(select => {
    select.value = current;
    select.addEventListener('change', event => {
      const language = event.target.value;
      const clean = location.pathname.replace(/^\/(en|th|vi|id|ja)(?=\/)/, '') || '/';
      localStorage.setItem('nara-language', language);
      location.href = language === 'zh-Hant' ? clean : `/${language}${clean}`;
    });
  });
})();
if (!document.querySelector('script[src*="site-tracking.js"]')) { const tracking=document.createElement('script'); tracking.src='/assets/site-tracking.js?v=20260918-ga4'; tracking.defer=true; document.body.appendChild(tracking); }
