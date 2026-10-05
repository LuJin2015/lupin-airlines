(function(){
const C=window.LUPIN_CONFIG||{};
const root=location.pathname.replace(/\\/+$/,'/').split('/').filter(Boolean);
const here=root[root.length-1]||'home';
function base(){return location.pathname.includes('/home/')||location.pathname.includes('/flights/')||location.pathname.includes('/booking/')||location.pathname.includes('/account/')||location.pathname.includes('/miles/')||location.pathname.includes('/status/')||location.pathname.includes('/destinations/')||location.pathname.includes('/experience/')||location.pathname.includes('/baggage/')||location.pathname.includes('/about/')||location.pathname.includes('/fleet/')||location.pathname.includes('/cabins/')||location.pathname.includes('/careers/')||location.pathname.includes('/airport-map/')||location.pathname.includes('/contact/')?'../':''}
const B=base();
function make(tag,attrs,text){const e=document.createElement(tag);Object.entries(attrs||{}).forEach(([k,v])=>e.setAttribute(k,v));if(text!==undefined)e.textContent=text;return e}
function addChromeStyles(){if(document.getElementById('lupin-chrome-styles'))return;const s=document.createElement('style');s.id='lupin-chrome-styles';s.textContent='.privacy-banner{display:flex;align-items:center;gap:14px;padding:10px 4vw;background:#111318;color:#fff;font:11px/1.4 system-ui,sans-serif}.privacy-banner strong{color:#d7ff3f;white-space:nowrap}.privacy-banner span{color:#d5d8de}.privacy-banner a{color:#fff;font-weight:800;white-space:nowrap}.live-clock{font-size:10px;font-weight:800;white-space:nowrap;color:#69707d}.account-button{min-width:38px;text-align:center;padding:10px 12px}@media(max-width:900px){.privacy-banner{align-items:flex-start;flex-wrap:wrap;padding:10px 5vw}.privacy-banner span{flex:1;min-width:220px}.live-clock{display:none}}';document.head.appendChild(s)}
function renderBar(){
 const old=document.querySelector('.topbar');if(!old)return;
 old.innerHTML='';
 const brand=make('a',{class:'brand',href:B+(C.brand?.home||'home/')});
 if(C.brand?.logo){const img=make('img',{class:'logo',src:C.brand.logo,alt:C.brand.name||'Logo'});brand.append(img)}
 brand.append(document.createTextNode(C.brand?.name||'LUPIN AIRLINES'));old.append(brand);
 const nav=make('nav',{});
 (C.topbar?.nav||[]).forEach(([label,href])=>{const a=make('a',{href:B+href});a.textContent=label;nav.append(a)});
 old.append(nav);
 if(C.topbar?.showClock){const clock=make('span',{class:'live-clock','aria-label':'Current time'});old.append(clock);const tick=()=>clock.textContent='🕒 '+new Date().toLocaleTimeString();tick();setInterval(tick,1000)}
 const account=C.topbar?.account;
 if(account){const a=make('a',{class:'nav-button account-button',href:B+account.href,title:account.label,'aria-label':account.label});a.textContent=account.icon||account.label;old.append(a)}
 const cta=C.topbar?.cta;if(cta?.enabled){const a=make('a',{class:'nav-button',href:B+cta.href});a.textContent=cta.label;old.append(a)}
}
function renderPrivacy(){
 const p=C.privacyBanner;if(!p?.enabled||document.querySelector('.privacy-banner'))return;
 const bar=make('div',{class:'privacy-banner'});
 const strong=make('strong',{},p.title);const span=make('span',{},p.text);bar.append(strong,span);
 if(p.href){const a=make('a',{href:B+p.href},p.linkText||'Learn more');bar.append(a)}
 document.body.prepend(bar);
}
document.addEventListener('DOMContentLoaded',()=>{addChromeStyles();renderBar();renderPrivacy()});
})();