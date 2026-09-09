(()=>{
  const apply=()=>{
    const search=document.getElementById('wxSearch2');
    if(search){
      search.style.overflowY='auto';
      search.style.overflowX='hidden';
      search.style.webkitOverflowScrolling='touch';
      search.style.overscrollBehavior='contain';
      search.style.touchAction='pan-y';
      search.style.paddingBottom='calc(22px + env(safe-area-inset-bottom))';
      search.dataset.wxMobileScroll='v1';
      const results=search.querySelector('[data-r]');
      if(results){
        results.style.overflowWrap='anywhere';
        results.style.paddingBottom='max(24px, env(safe-area-inset-bottom))';
      }
    }
  };
  const boot=()=>{
    apply();
    new MutationObserver(()=>requestAnimationFrame(apply)).observe(document.documentElement,{childList:true,subtree:true});
    window.addEventListener('orientationchange',()=>setTimeout(apply,80));
    window.addEventListener('resize',apply,{passive:true});
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
