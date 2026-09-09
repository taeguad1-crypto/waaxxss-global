(()=>{
  const $=(s,r=document)=>r.querySelector(s);
  const norm=v=>String(v||'').toLocaleLowerCase('ko-KR').replace(/\s+/g,' ').trim();
  const money=v=>Number.isFinite(Number(v))?Number(v).toLocaleString('ko-KR')+'원':'';
  const products=()=>{try{return Array.isArray(window.PRODUCTS)?window.PRODUCTS:[]}catch(e){return[]}};
  function installCss(){
    if($('#wxGlobalProductSearchCssV1'))return;
    const s=document.createElement('style');
    s.id='wxGlobalProductSearchCssV1';
    s.textContent='#wxSearch2 [data-wx-search-list]{display:grid;gap:8px;margin-top:14px}#wxSearch2 [data-wx-search-product]{width:100%;display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center;text-align:left;border:1px solid #343434;background:#111;color:#fff;border-radius:12px;padding:13px 14px;min-height:58px}#wxSearch2 [data-wx-search-product] small{display:block;color:#c8a968;font-size:9px;font-weight:900;letter-spacing:.12em;margin-bottom:4px}#wxSearch2 [data-wx-search-product] strong{display:block;font-size:13px;line-height:1.35}#wxSearch2 [data-wx-search-product] span{font-size:10px;color:#bbb;white-space:nowrap}';
    document.head.appendChild(s);
  }
  function enhance(){
    const overlay=$('#wxSearch2');
    const input=overlay&&$('[data-q]',overlay);
    const result=overlay&&$('[data-r]',overlay);
    if(!overlay||!input||!result||input.dataset.wxGlobalProductSearchV1)return;
    installCss();
    input.dataset.wxGlobalProductSearchV1='1';
    const original=input.oninput;
    const render=()=>{
      const q=norm(input.value);
      if(!q)return;
      const hits=products().filter(p=>norm(`${p.id||''} ${p.cat||''} ${p.name||''} ${p.desc||''}`).includes(q)).slice(0,20);
      if(!hits.length)return;
      result.textContent='';
      const head=document.createElement('b');
      head.style.color='#d7b75b';
      head.textContent=`${hits.length}개 WAAXXSS 상품 검색`;
      result.appendChild(head);
      const list=document.createElement('div');
      list.dataset.wxSearchList='v1';
      hits.forEach(p=>{
        const b=document.createElement('button');
        b.type='button';
        b.dataset.wxSearchProduct=String(p.id||'');
        b.setAttribute('aria-label',`${p.name||'WAAXXSS 상품'} 상세 열기`);
        const left=document.createElement('div');
        const cat=document.createElement('small');cat.textContent=String(p.cat||'PRODUCT');
        const name=document.createElement('strong');name.textContent=String(p.name||'WAAXXSS PRODUCT');
        left.append(cat,name);
        const price=document.createElement('span');price.textContent=money(p.price);
        b.append(left,price);
        b.addEventListener('click',e=>{
          e.preventDefault();
          e.stopImmediatePropagation();
          if(typeof window.openProduct==='function'){
            overlay.remove();
            window.openProduct(String(p.id||''));
          }
        },true);
        list.appendChild(b);
      });
      result.appendChild(list);
    };
    input.oninput=e=>{
      if(typeof original==='function')original.call(input,e);
      render();
    };
    if(input.value)render();
    window.WAAXXSS_GLOBAL_SEARCH_PRODUCT={version:'v1',fullProductSearch:true,clickToDetail:true,checkedAt:new Date().toISOString()};
  }
  function boot(){
    enhance();
    new MutationObserver(()=>requestAnimationFrame(enhance)).observe(document.documentElement,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
