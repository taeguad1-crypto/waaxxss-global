(()=>{
  let busy=false;
  const modalOpen=()=>!!document.querySelector('.modal.on,.productModal.on,#productModal.on');
  const hasProductState=()=>!!(history.state&&history.state.wxProduct);
  function consumeProductHistory(){
    if(busy||!hasProductState()||modalOpen())return;
    busy=true;
    try{history.back()}catch(e){busy=false;return}
    setTimeout(()=>{busy=false},400);
  }
  function wrap(){
    const old=window.closeProduct;
    if(typeof old!=='function'||old.__wxCloseHistoryV1)return;
    const fn=function(){
      const wasOpen=modalOpen();
      const r=old.apply(this,arguments);
      if(wasOpen&&hasProductState())setTimeout(consumeProductHistory,0);
      return r;
    };
    fn.__wxCloseHistoryV1=1;
    fn.__wxOriginal=old;
    window.closeProduct=fn;
    document.documentElement.dataset.wxProductCloseHistory='v1';
  }
  function boot(){wrap();setTimeout(wrap,700);setInterval(wrap,1800)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
