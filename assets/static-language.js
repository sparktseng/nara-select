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
