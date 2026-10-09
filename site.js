(function(){
const C=window.LUPIN_CONFIG||{};
const script=document.currentScript;
const rootBase=script?new URL('./',script.src):new URL('../',location.href);
const currentPath=location.pathname.replace(/\/+$/,'/')||'/';
function url(path){return new URL(String(path||''),rootBase).href}
function make(tag,attrs,text){const e=document.createElement(tag);Object.entries(attrs||{}).forEach(([k,v])=>e.setAttribute(k,v));if(text!==undefined)e.textContent=text;return e}
function addChromeStyles(){
 if(document.getElementById('lupin-chrome-styles'))return;
 const s=document.createElement('style');
 s.id='lupin-chrome-styles';
 s.textContent='.privacy-banner{display:flex;align-items:center;gap:14px;padding:10px 4vw;background:#111318;color:#fff;font:11px/1.4 system-ui,sans-serif}.privacy-banner strong{color:#d7ff3f;white-space:nowrap}.privacy-banner span{color:#d5d8de}.privacy-banner a{color:#fff;font-weight:800;white-space:nowrap}.topbar nav{display:flex;align-items:center;gap:18px;flex:1;flex-wrap:wrap}.topbar nav a{white-space:nowrap}.topbar nav a.active{font-weight:900;text-decoration:underline;text-underline-offset:5px}.topbar .brand{display:inline-flex;align-items:center;gap:8px;white-space:nowrap}.topbar .nav-button{white-space:nowrap;text-decoration:none}.topbar .account-button{min-width:38px;text-align:center;padding:10px 12px}.topbar .logo{width:30px;height:30px;object-fit:contain;border-radius:50%}@media(max-width:900px){.privacy-banner{align-items:flex-start;flex-wrap:wrap;padding:10px 5vw}.privacy-banner span{flex:1;min-width:220px}.topbar nav{order:3;width:100%;overflow-x:auto;flex-wrap:nowrap;padding-bottom:2px}.topbar nav a{font-size:13px}.topbar .nav-button{font-size:13px}}';
 document.head.appendChild(s)
}
function renderBar(){
 const old=document.querySelector('.topbar');
 if(!old)return;
 old.innerHTML='';
 const brand=make('a',{class:'brand',href:url(C.brand?.home||'home/')});
 if(C.brand?.logo)brand.append(make('img',{class:'logo',src:C.brand.logo,alt:C.brand.name||'Logo'}));
 brand.append(document.createTextNode(C.brand?.name||'LUPIN AIRLINES'));
 old.append(brand);
 const nav=make('nav',{'aria-label':'Primary'});
 (C.topbar?.nav||[]).forEach(item=>{
  const label=Array.isArray(item)?item[0]:item?.label;
  const href=Array.isArray(item)?item[1]:item?.href;
  if(!label||!href)return;
  const a=make('a',{href:url(href)});
  a.textContent=label;
  if(new URL(a.href).pathname.replace(/\/+$/,'/')===currentPath)a.classList.add('active');
  nav.append(a);
 });
 old.append(nav);
 const account=C.topbar?.account;
 if(account){
  const a=make('a',{class:'nav-button account-button',href:url(account.href),title:account.label||'Account','aria-label':account.label||'Account'});
  a.textContent=account.icon||account.label||'Account';
  if(new URL(a.href).pathname.replace(/\/+$/,'/')===currentPath)a.classList.add('active');
  old.append(a)
 }
 const cta=C.topbar?.cta;
 if(cta?.enabled){const a=make('a',{class:'nav-button',href:url(cta.href)});a.textContent=cta.label||'Book now';old.append(a)}
}
function renderPrivacy(){
 const p=C.privacyBanner;
 if(!p?.enabled||document.querySelector('.privacy-banner'))return;
 const bar=make('div',{class:'privacy-banner'});
 bar.append(make('strong',{},p.title||''),make('span',{},p.text||''));
 if(p.href)bar.append(make('a',{href:url(p.href)},p.linkText||'Learn more'));
 document.body.prepend(bar)
}
function addScrollAnimations(){
 if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 if(document.getElementById('lupin-scroll-styles'))return;
 const styles=make('style',{id:'lupin-scroll-styles'});
 styles.textContent='.lupin-reveal{opacity:0;transform:translate3d(0,26px,0);transition:opacity .72s cubic-bezier(.2,.7,.2,1),transform .72s cubic-bezier(.2,.7,.2,1);transition-delay:var(--lupin-reveal-delay,0ms);will-change:opacity,transform}.lupin-reveal.lupin-visible{opacity:1;transform:translate3d(0,0,0)}.lupin-parallax{transform:translate3d(0,var(--lupin-parallax-y,0px),0);will-change:transform}@media(prefers-reduced-motion:reduce){.lupin-reveal,.lupin-reveal.lupin-visible,.lupin-parallax{opacity:1;transform:none;transition:none;will-change:auto}}';
 document.head.appendChild(styles);
 const selectors=['main > section','main > .wrap','main > .card','main > .cards','main > .search-card','.home-links > a','.feature-grid > article','.cards > article','.route-grid > article','.feature-grid > .feature','.product-section > .eyebrow','.product-section > h2','.mascot-card','.remark','.mdm-remark','body > footer','main article'];
 const found=new Set();
 selectors.forEach(selector=>document.querySelectorAll(selector).forEach(el=>found.add(el)));
 const revealTargets=Array.from(found).filter(el=>!el.closest('.topbar,.privacy-banner'));
 const groupCounters=new Map();
 revealTargets.forEach(el=>{
  if(el.classList.contains('lupin-reveal'))return;
  el.classList.add('lupin-reveal');
  const parent=el.parentElement;
  const selector=el.matches('.home-links > a')?'.home-links':el.matches('.feature-grid > article')?'.feature-grid':el.matches('.cards > article')?'.cards':el.matches('.route-grid > article')?'.route-grid':null;
  if(selector){
   const group=parent||document;
   const idx=groupCounters.get(group)||0;
   groupCounters.set(group,idx+1);
   el.style.setProperty('--lupin-reveal-delay',Math.min(idx,5)*90+'ms')
  }
 });
 const all=Array.from(document.querySelectorAll('.lupin-reveal'));
 if(!('IntersectionObserver'in window)){all.forEach(el=>el.classList.add('lupin-visible'));return}
 const observer=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('lupin-visible');observer.unobserve(entry.target)}});
 },{threshold:.12,rootMargin:'0px 0px -6% 0px'});
 all.forEach(el=>observer.observe(el));
 const parallax=Array.from(document.querySelectorAll('.mascot-card .mascot, main .hero img:not(.logo)'));
 if(parallax.length){
  parallax.forEach(el=>el.classList.add('lupin-parallax'));
  let pending=false;
  const paint=()=>{
   pending=false;
   const vh=window.innerHeight||800;
   parallax.forEach(el=>{
    const rect=el.getBoundingClientRect();
    const offset=(rect.top+rect.height/2-vh/2)/vh;
    el.style.setProperty('--lupin-parallax-y',Math.max(-12,Math.min(12,-offset*12))+'px')
   })
  };
  const requestPaint=()=>{if(!pending){pending=true;window.requestAnimationFrame(paint)}};
  window.addEventListener('scroll',requestPaint,{passive:true});
  window.addEventListener('resize',requestPaint);
  paint()
 }
}
document.addEventListener('DOMContentLoaded',()=>{addChromeStyles();renderBar();renderPrivacy();addScrollAnimations()});
})();