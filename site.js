(function(){
const C=window.LUPIN_CONFIG||{};
const script=document.currentScript;
const rootBase=script?new URL('./',script.src):new URL('../',location.href);
const currentPath=location.pathname.replace(/\/+$/,'/')||'/';
function url(path){return new URL(String(path||''),rootBase).href}
function make(tag,attrs,text){const e=document.createElement(tag);Object.entries(attrs||{}).forEach(([k,v])=>e.setAttribute(k,v));if(text!==undefined)e.textContent=text;return e}
function addChromeStyles(){
 if(document.getElementById('lupin-chrome-styles'))return;
 const s=document.createElement('style');s.id='lupin-chrome-styles';
 s.textContent='.privacy-banner{display:flex;align-items:center;gap:14px;padding:10px 4vw;background:#111318;color:#fff;font:11px/1.4 system-ui,sans-serif}.privacy-banner strong{color:#d7ff3f;white-space:nowrap}.privacy-banner span{color:#d5d8de}.privacy-banner a{color:#fff;font-weight:800;white-space:nowrap}.topbar nav{display:flex;align-items:center;gap:18px;flex:1;flex-wrap:wrap}.topbar nav a{white-space:nowrap;position:relative}.topbar nav a:after{content:"";position:absolute;left:0;right:0;bottom:-5px;height:2px;background:var(--accent,#d7ff3f);transform:scaleX(0);transform-origin:left;transition:transform .22s ease}.topbar nav a:hover:after,.topbar nav a.active:after{transform:scaleX(1)}.topbar nav a.active{font-weight:900}.topbar .brand{display:inline-flex;align-items:center;gap:8px;white-space:nowrap}.topbar .nav-button{white-space:nowrap;text-decoration:none;transition:transform .2s ease,box-shadow .2s ease}.topbar .nav-button:hover{transform:translateY(-2px);box-shadow:0 8px 20px #11131822}.topbar .account-button{min-width:38px;text-align:center;padding:10px 12px}.topbar .logo{width:30px;height:30px;object-fit:contain;border-radius:50%}.topbar{transition:box-shadow .25s ease,background-color .25s ease}.topbar.lupin-scrolled{box-shadow:0 12px 32px rgba(17,19,24,.09);background-color:rgba(255,255,255,.92)}@media(max-width:900px){.privacy-banner{align-items:flex-start;flex-wrap:wrap;padding:10px 5vw}.privacy-banner span{flex:1;min-width:220px}.topbar nav{order:3;width:100%;overflow-x:auto;flex-wrap:nowrap;padding-bottom:5px}.topbar nav a{font-size:13px}.topbar .nav-button{font-size:13px}}';
 document.head.appendChild(s)
}
function renderBar(){
 const old=document.querySelector('.topbar');if(!old)return;old.innerHTML='';
 const brand=make('a',{class:'brand',href:url(C.brand?.home||'home/')});
 if(C.brand?.logo)brand.append(make('img',{class:'logo',src:C.brand.logo,alt:C.brand.name||'Logo'}));
 brand.append(document.createTextNode(C.brand?.name||'LUPIN AIRLINES'));old.append(brand);
 const nav=make('nav',{'aria-label':'Primary'});
 (C.topbar?.nav||[]).forEach(item=>{
  const label=Array.isArray(item)?item[0]:item?.label,href=Array.isArray(item)?item[1]:item?.href;
  if(!label||!href)return;
  const a=make('a',{href:url(href)});a.textContent=label;
  if(new URL(a.href).pathname.replace(/\/+$/,'/')===currentPath)a.classList.add('active');
  nav.append(a)
 });
 old.append(nav);
 const account=C.topbar?.account;
 if(account){const a=make('a',{class:'nav-button account-button',href:url(account.href),title:account.label||'Account','aria-label':account.label||'Account'});a.textContent=account.icon||account.label||'Account';if(new URL(a.href).pathname.replace(/\/+$/,'/')===currentPath)a.classList.add('active');old.append(a)}
 const cta=C.topbar?.cta;if(cta?.enabled){const a=make('a',{class:'nav-button',href:url(cta.href)});a.textContent=cta.label||'Book now';old.append(a)}
}
function renderPrivacy(){
 const p=C.privacyBanner;if(!p?.enabled||document.querySelector('.privacy-banner'))return;
 const bar=make('div',{class:'privacy-banner'});bar.append(make('strong',{},p.title||''),make('span',{},p.text||''));
 if(p.href)bar.append(make('a',{href:url(p.href)},p.linkText||'Learn more'));document.body.prepend(bar)
}
function addScrollAnimations(){
 const reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const styles=make('style',{id:'lupin-scroll-styles'});
 styles.textContent='#lupin-scroll-progress{position:fixed;z-index:99999;left:0;top:0;width:100%;height:3px;pointer-events:none;transform:scaleX(0);transform-origin:left center;background:linear-gradient(90deg,var(--accent,#d7ff3f),#9ce9dc,var(--accent,#d7ff3f));box-shadow:0 0 12px rgba(215,255,63,.48)}.lupin-reveal{opacity:0;transform:translate3d(0,30px,0);filter:blur(3px);transition:opacity .78s cubic-bezier(.2,.7,.2,1),transform .78s cubic-bezier(.2,.7,.2,1),filter .78s cubic-bezier(.2,.7,.2,1);transition-delay:var(--lupin-reveal-delay,0ms);backface-visibility:hidden}.lupin-reveal--scale{transform:translate3d(0,24px,0) scale(.965)}.lupin-reveal--blur{transform:translate3d(0,16px,0);filter:blur(9px)}.lupin-reveal.lupin-visible{opacity:1;transform:none;filter:none}.lupin-card-motion{transition:translate .26s cubic-bezier(.2,.7,.2,1),box-shadow .26s ease,border-color .26s ease}.lupin-card-motion:hover{translate:0 -6px;box-shadow:0 18px 42px rgba(17,19,24,.09)}.mascot-card.lupin-spotlight:before{content:"";position:absolute;inset:0;z-index:1;pointer-events:none;background:radial-gradient(circle at var(--lupin-pointer-x,50%) var(--lupin-pointer-y,45%),rgba(215,255,63,.17),transparent 52%);opacity:.9;transition:opacity .3s ease}.mascot-card.lupin-spotlight:hover:before{opacity:1}.lupin-parallax{transform:translate3d(0,var(--lupin-parallax-y,0px),0);will-change:transform}@media(prefers-reduced-motion:reduce){#lupin-scroll-progress{display:none}.lupin-reveal,.lupin-reveal.lupin-visible,.lupin-parallax{opacity:1;transform:none;filter:none;transition:none;will-change:auto}.lupin-card-motion{transition:none}.lupin-card-motion:hover{translate:none}}';
 document.head.appendChild(styles);
 if(reduce)return;
 const progress=make('div',{id:'lupin-scroll-progress',role:'progressbar','aria-label':'Page scroll progress','aria-valuemin':'0','aria-valuemax':'100','aria-valuenow':'0'});document.body.append(progress);
 const selectors=['main > section:not(.hero):not(.page-hero)','main > .wrap','main > .card','main > .cards','main > .search-card','.hero > div:first-child > *','.hero > .mascot-card','.page-hero > *','.home-links > a','.feature-grid > article','.cards > article','.route-grid > article','.feature-grid > .feature','.mascot-card','.remark','.mdm-remark','body > footer','main article'];
 const found=new Set();selectors.forEach(sel=>document.querySelectorAll(sel).forEach(el=>found.add(el)));
 const groupIndexes=new Map();
 Array.from(found).filter(el=>!el.closest('.topbar,.privacy-banner')).forEach(el=>{
  if(el.classList.contains('lupin-reveal'))return;
  el.classList.add('lupin-reveal');
  if(el.matches('.mascot-card,.cards > article,.feature-grid > article,.home-links > a,.route-grid > article'))el.classList.add('lupin-reveal--scale');
  if(el.matches('.hero .eyebrow,.page-hero .eyebrow'))el.classList.add('lupin-reveal--blur');
  const parent=el.parentElement,idx=groupIndexes.get(parent)||0;groupIndexes.set(parent,idx+1);
  el.style.setProperty('--lupin-reveal-delay',Math.min(idx,6)*85+'ms');
  if(el.matches('.home-links > a,.feature-grid > article,.cards > article,.route-grid > article'))el.classList.add('lupin-card-motion')
 });
 const targets=Array.from(document.querySelectorAll('.lupin-reveal'));
 if('IntersectionObserver'in window){
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('lupin-visible');observer.unobserve(entry.target)}}),{threshold:.1,rootMargin:'0px 0px -5% 0px'});
  targets.forEach(el=>observer.observe(el))
 }else targets.forEach(el=>el.classList.add('lupin-visible'));
 const spotlight=document.querySelector('.mascot-card');
 if(spotlight){spotlight.classList.add('lupin-spotlight');spotlight.addEventListener('pointermove',e=>{const r=spotlight.getBoundingClientRect();spotlight.style.setProperty('--lupin-pointer-x',((e.clientX-r.left)/r.width*100)+'%');spotlight.style.setProperty('--lupin-pointer-y',((e.clientY-r.top)/r.height*100)+'%')});spotlight.addEventListener('pointerleave',()=>{spotlight.style.setProperty('--lupin-pointer-x','50%');spotlight.style.setProperty('--lupin-pointer-y','45%')})}
 const parallax=Array.from(document.querySelectorAll('.mascot-card .mascot,main .hero img:not(.logo)'));
 parallax.forEach(el=>el.classList.add('lupin-parallax'));
 let pending=false;
 const paint=()=>{
  pending=false;const doc=document.documentElement,max=Math.max(1,doc.scrollHeight-window.innerHeight),percent=Math.max(0,Math.min(1,(window.scrollY||window.pageYOffset)/max));
  progress.style.transform='scaleX('+percent+')';progress.setAttribute('aria-valuenow',String(Math.round(percent*100)));
  const topbar=document.querySelector('.topbar');if(topbar)topbar.classList.toggle('lupin-scrolled',(window.scrollY||window.pageYOffset)>12);
  const vh=window.innerHeight||800;
  parallax.forEach(el=>{const r=el.getBoundingClientRect(),offset=(r.top+r.height/2-vh/2)/vh;el.style.setProperty('--lupin-parallax-y',Math.max(-14,Math.min(14,-offset*14))+'px')})
 };
 const requestPaint=()=>{if(!pending){pending=true;window.requestAnimationFrame(paint)}};
 window.addEventListener('scroll',requestPaint,{passive:true});window.addEventListener('resize',requestPaint);paint()
}
document.addEventListener('DOMContentLoaded',()=>{addChromeStyles();renderBar();renderPrivacy();addScrollAnimations()});
})();