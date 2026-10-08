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
  old.append(a);
 }
 const cta=C.topbar?.cta;
 if(cta?.enabled){
  const a=make('a',{class:'nav-button',href:url(cta.href)});
  a.textContent=cta.label||'Book now';
  old.append(a);
 }
}
function renderPrivacy(){
 const p=C.privacyBanner;
 if(!p?.enabled||document.querySelector('.privacy-banner'))return;
 const bar=make('div',{class:'privacy-banner'});
 bar.append(make('strong',{},p.title||''),make('span',{},p.text||''));
 if(p.href)bar.append(make('a',{href:url(p.href)},p.linkText||'Learn more'));
 document.body.prepend(bar);
}
document.addEventListener('DOMContentLoaded',()=>{addChromeStyles();renderBar();renderPrivacy()});
})();