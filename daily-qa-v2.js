(()=>{
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)], uniq=a=>[...new Set(a)];
  const text=el=>(el?.innerText||el?.textContent||'').trim();
  const visible=el=>{if(!el?.getBoundingClientRect)return false;const r=el.getBoundingClientRect(),cs=getComputedStyle(el);return r.width>0&&r.height>0&&cs.display!=='none'&&cs.visibility!=='hidden'};
  function run(){
    const critical=[],warnings=[],info=[];
    const products=Array.isArray(window.PRODUCTS)?window.PRODUCTS:[];
    let images={};try{images=window.IMAGES||{}}catch(e){}

    const logoEls=$$('img[data-logo],header img.logo,.drawer img.logo,#splash img,.brand img');
    const official='file_00000000c3d0820983b48532d4a822ef.png';
    const badLogo=logoEls.filter(el=>{const src=el.getAttribute('src')||'';return src&&!src.includes(official)});
    if(badLogo.length)critical.push(`non-official WAAXXSS logo asset(s): ${badLogo.length}`);

    ['showPage','filterShop','openProduct','closeProduct'].forEach(n=>{if(typeof window[n]!=='function')critical.push(`missing core function: ${n}`)});
    const homeControls=$$('button,a,[role="button"]').filter(el=>/^HOME$/i.test(text(el))||el.dataset.p==='home');
    if(!homeControls.length)warnings.push('HOME control not found');
    else if(!homeControls.some(el=>el.dataset.p==='home'||/showPage\(['\"]home['\"]\)/.test(el.getAttribute('onclick')||'')||/\bhome\b/i.test(el.getAttribute('href')||'')))warnings.push('HOME control found but route binding is not explicit');

    const productButtons=$$('[onclick*="openProduct"],[data-product-id]');
    const brokenProductButtons=productButtons.filter(el=>{const m=(el.getAttribute('onclick')||'').match(/openProduct\(['\"]([^'\"]+)/);const id=el.dataset.productId||m?.[1];return id&&products.length&&!products.some(p=>String(p.id)===String(id))});
    if(brokenProductButtons.length)critical.push(`broken product detail links: ${brokenProductButtons.length}`);

    const dataImageIssues=[];
    products.forEach(p=>{
      for(const k of ['img','alt']){const key=p?.[k];if(key&&!images?.[key])dataImageIssues.push(`${p.id}:${k}:${key}`)}
      if(p?.img&&p?.alt&&p.img===p.alt)warnings.push(`duplicate product image key: ${p.id}`);
      if(p?.alt==='hero'&&p?.img!=='hero')warnings.push(`product uses unrelated HERO as alternate image: ${p.id}`);
    });
    if(dataImageIssues.length)critical.push(`product image keys missing from IMAGES: ${dataImageIssues.length}`);

    const imgs=$$('img'), broken=imgs.filter(x=>x.complete&&x.src&&x.naturalWidth===0), noSrc=imgs.filter(x=>!x.getAttribute('src'));
    if(broken.length)warnings.push(`broken rendered images: ${broken.length}`);
    if(noSrc.length)warnings.push(`rendered images without src: ${noSrc.length}`);
    const srcs=imgs.map(x=>x.currentSrc||x.src||'').filter(Boolean), duplicateOccurrences=srcs.filter((s,i)=>srcs.indexOf(s)!==i).length;
    if(duplicateOccurrences)info.push(`duplicate rendered image occurrences: ${duplicateOccurrences}`);

    const shop=$('#shop'), filters=$$('#filters button,.filters button',shop||document), filterLabels=uniq(filters.map(text).filter(Boolean));
    const expectedFilters=['ALL','MEN','WOMEN','POLO','HEADWEAR','SHOES'];
    const missingFilters=expectedFilters.filter(x=>!filterLabels.some(v=>v.toUpperCase()===x));
    if(missingFilters.length)warnings.push(`missing shop filters: ${missingFilters.join(',')}`);
    const sort=$('#wxSort');
    const sortValues=sort?[...sort.options].map(o=>o.value):[];
    const expectedSort=['recommended','registered','low','high','name'];
    if(!sort)warnings.push('shop sort control not ready');
    else if(expectedSort.some(v=>!sortValues.includes(v)))warnings.push('shop sort options incomplete');
    const shopProducts=$$('#shopProducts .product');
    const seq=$$('#shopProducts .product .wxSeq');
    if(shopProducts.length&&seq.length!==shopProducts.length)warnings.push(`product sequence labels incomplete: ${seq.length}/${shopProducts.length}`);

    const localSearch=$('#wxProductSearch');
    if(!localSearch)warnings.push('shop product search control not ready');
    if(!document.getElementById('wx-global-product-search-loader'))warnings.push('global product-search enhancer not loaded');
    if(document.documentElement.dataset.wxPoloFilterReady!=='1')warnings.push('POLO/search filter enhancer not ready');

    const modal=$('#modal,.modal,.productModal,#productModal');
    if(!modal)critical.push('product detail popup not found');
    else if(!$('.close,[data-close]',modal))warnings.push('product detail popup close control missing');
    const mainPic=$('.mainPic',modal||document);
    const pinchReady=mainPic?.dataset.wxViewer==='v2';
    if(mainPic&&!pinchReady)warnings.push('pinch/drag product viewer not ready');
    const openModal=$('.modal.on,.productModal.on,#productModal.on');
    if(openModal){
      const gallerySrc=uniq([$('.mainPic img',openModal)?.currentSrc||$('.mainPic img',openModal)?.src,...$$('.thumbs img',openModal).map(x=>x.currentSrc||x.src)].filter(Boolean));
      if(gallerySrc.length<6)warnings.push(`open product gallery has fewer than 6 unique images: ${gallerySrc.length}`);
      if(gallerySrc.length>10)warnings.push(`open product gallery has more than 10 unique images: ${gallerySrc.length}`);
    }

    if(innerWidth<=600){
      const intentional='.thumbs,.scrollrow,.wxProductRail,.wxRelatedRail,.filters,.wxSortBar,.wxPager,[data-scenes]';
      const overflow=$$('*').filter(el=>visible(el)&&el.getBoundingClientRect().right>innerWidth+4&&!el.closest(intentional)).slice(0,25);
      if(overflow.length)warnings.push(`mobile horizontal overflow candidates: ${overflow.length}`);
      const clipped=$$('button,a,input,select').filter(el=>visible(el)).filter(el=>{const r=el.getBoundingClientRect();return r.left<-4||r.right>innerWidth+4}).slice(0,25);
      if(clipped.length)warnings.push(`mobile interactive controls clipped: ${clipped.length}`);
    }
    const rootScroll={scrollHeight:Math.max(document.body?.scrollHeight||0,document.documentElement.scrollHeight||0),clientHeight:document.documentElement.clientHeight||innerHeight};
    if(rootScroll.scrollHeight>rootScroll.clientHeight+8){const by=getComputedStyle(document.body).overflowY,hy=getComputedStyle(document.documentElement).overflowY;if(by==='hidden'&&hy==='hidden')warnings.push('page is taller than viewport while vertical root scrolling is hidden')}

    const routeTargets={home:!!$('#home'),shop:!!$('#shop'),ai:!!$('#ai,#wx_style'),golf:!!$('#golf,#wx_golf,#wx_golfplus'),member:!!$('#my,#account,#wx_account,#wx_my'),manufacturer:!!$('#manufacturer,#wx_manufacturer,#b2b,#wx_b2b'),admin:!!$('#admin,#wx_admin')};
    if(!routeTargets.ai)warnings.push('AI route target missing');
    if(!routeTargets.golf)warnings.push('GOLF route target missing');
    if(!routeTargets.member)warnings.push('member route target missing');
    if(!routeTargets.manufacturer)info.push('manufacturer route not connected in current runtime');
    if(!routeTargets.admin)info.push('admin route not connected in current runtime');

    const runtime={chat:!!(window.WAAXXSS_CHAT||window.WAAXXSS_CHAT_OS),inlineMedia:!!window.WAAXXSS_CHAT_INLINE_MEDIA,aiWorkspace:!!window.WAAXXSS_AI_WORKSPACE,memberSync:!!window.WAAXXSS_MEMBER_DATA_SYNC,realtime:!!window.WAAXXSS_MEMBER_REALTIME,secureCall:!!window.WAAXXSS_SECURE_WEBRTC_CALL};
    const external={payment:'NOT AUTO-ACTIVATED — payment credentials/business decision required',login:'NOT AUTO-ACTIVATED — external auth configuration required',gps:'NOT AUTO-ACTIVATED — device permission/runtime required',externalAI:'NOT AUTO-ACTIVATED — provider API/secret required',domainDeploy:'NOT AUTO-CHANGED — deployment/domain decision outside static QA',manufacturer:'NOT AUTO-ACTIVATED — manufacturer account/workflow approval required',admin:'NOT AUTO-ACTIVATED — admin authorization policy required'};

    const report={checkedAt:new Date().toISOString(),version:'v2',status:critical.length?'FAIL':warnings.length?'CHECK':'PASS',critical:uniq(critical),warnings:uniq(warnings),info:uniq(info),coverage:{ui:true,routing:true,click:true,backHistory:!!document.documentElement.dataset.wxContinuityV4,logoHome:true,mobile:true,verticalHorizontalScroll:true,sorting:true,sequence:true,search:true,filter:true,popup:true,productDetail:true,pinchZoom:true,imageIntegrity:true,integrations:true},counts:{products:products.length,productButtons:productButtons.length,renderedImages:imgs.length,brokenImages:broken.length,duplicateRenderedImageOccurrences:duplicateOccurrences,logoElements:logoEls.length,shopProducts:shopProducts.length,sequenceLabels:seq.length},routeTargets,runtime,external,officialLogo:official,principle:'SAFE ADDITIVE diagnostic; no working feature or brand asset is removed/reverted'};
    window.WAAXXSS_DAILY_QA_V2=report;window.WAAXXSS_RUN_DAILY_QA_V2=run;document.documentElement.dataset.wxDailyQaV2=report.status.toLowerCase();return report;
  }
  window.WAAXXSS_RUN_DAILY_QA_V2=run;
  const boot=()=>{setTimeout(run,7200);setTimeout(run,12000)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
