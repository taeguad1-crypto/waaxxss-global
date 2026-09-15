(()=>{
  const pick=()=>document.querySelector('.modal.on .mainPic,.mainPic');
  function sync(){
    const box=pick();
    if(!box)return;
    const zoomed=box.getAttribute('data-wx-zoom')==='zoomed';
    const next=zoomed?'none':'pan-y';
    if(box.style.touchAction!==next)box.style.touchAction=next;
    box.dataset.wxVerticalScrollSafe='1';
  }
  function boot(){
    sync();
    new MutationObserver(()=>requestAnimationFrame(sync)).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class','data-wx-zoom']});
    window.addEventListener('resize',sync,{passive:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
