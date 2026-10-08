(function(){
const C=window.LUPIN_CONFIG||{};
const root=location.pathname.replace(/\\/+$/,'/').split('/').filter(Boolean);
function base(){return location.pathname.includes('/home/')||location.pathname.includes('/flights/')||location.pathname.includes('/booking/')||location.pathname.includes('/account/')||location.pathname.includes('/miles/')||location.pathname.includes('/status/')||location.pathname.includes('/destinations/')||location.pathname.includes('/experience/')||location.pathname.includes('/baggage/')||location.pathname.includes('/about/')||location.pathname.includes('/fleet/')||location.pathname.includes('/cabins/')||location.pathname.includes('/careers/')||location.pathname.includes('/airport-map/')||location.pathname.includes('/contact/')?'../':''}
const B=base();
function make(tag,attrs,text){const e=document.createElement(tag);Object.entries(attrs||{}).forEach(([k,v])=>e.setAttribute(k,v));if(text!==undefined)e.textContent=text;return e}
function addChromeStyles(){if(document.getElementById('lupin-chrome-styles'))return;const s=document.createElement('style');s.id='lupin-chrome-styles';s.textContent='.privacy-banner{display:flex;align-items:center;gap:14px;padding:10px 4vw;background:#111318;color:#fff;font:11px/1.4 system-ui,sans-serif}.privacy-banner strong{color:#d7ff3f;white-space:nowrap}.privacy-banner span{color:#d5d8de}.privacy-banner a{color:#fff;font-weight:800;white-space:nowrap}.live-clock{font-size:10px;font-weight:800;white-space:nowrap;color:#69707d}.account-button{min-width:38px;text-align:center;padding:10px 12px}@media(max-width:900px){.privacy-banner{align-items:flex-start;flex-wrap:wrap;padding:10px 5vw}.privacy-banner span{flex:1;min-width:220px}.live-clock{display:none}}';document.head.appendChild(s)}
function renderBar(){const old=document.querySelector('.topbar');if(!old)return;old.innerHTML='';const brand=make('a',{class:'brand',href:B+(C.brand?.home||'home/')});if(C.brand?.logo){const img=make('img',{class:'logo',src:C.brand.logo,alt:C.brand.name||'Logo'});brand.append(img)}brand.append(document.createTextNode(C.brand?.name||'LUPIN AIRLINES'));old.append(brand);const nav=make('nav',{});(C.topbar?.nav||[]).forEach(([label,href])=>{const a=make('a',{href:B+href});a.textContent=label;nav.append(a)});old.append(nav);if(C.topbar?.showClock){const clock=make('span',{class:'live-clock','aria-label':'Current time'});old.append(clock);const tick=()=>clock.textContent='🕒 '+new Date().toLocaleTimeString();tick();setInterval(tick,1000)}const account=C.topbar?.account;if(account){const a=make('a',{class:'nav-button account-button',href:B+account.href,title:account.label,'aria-label':account.label});a.textContent=account.icon||account.label;old.append(a)}const cta=C.topbar?.cta;if(cta?.enabled){const a=make('a',{class:'nav-button',href:B+cta.href});a.textContent=cta.label;old.append(a)}}
function renderPrivacy(){const p=C.privacyBanner;if(!p?.enabled||document.querySelector('.privacy-banner'))return;const bar=make('div',{class:'privacy-banner'});bar.append(make('strong',{},p.title),make('span',{},p.text));if(p.href)bar.append(make('a',{href:B+p.href},p.linkText||'Learn more'));document.body.prepend(bar)}
const CLOUD={apiBase:(C.cloud?.apiBase||'').replace(/\/$/,''),airline:C.cloud?.airline||'lupin-airlines',sessionKey:'lupinCloudSession'};
const session=()=>{try{return JSON.parse(sessionStorage.getItem(CLOUD.sessionKey)||'null')}catch{return null}};
const setSession=x=>sessionStorage.setItem(CLOUD.sessionKey,JSON.stringify(x));
const logout=()=>sessionStorage.removeItem(CLOUD.sessionKey);
async function api(path,options={}){
 if(!CLOUD.apiBase||CLOUD.apiBase.startsWith('REPLACE_'))throw new Error('Cloud API has not been connected yet.');
 const h=Object.assign({'Content-Type':'application/json'},options.headers||{});const s=session();if(s?.token)h.Authorization='Bearer '+s.token;
 const r=await fetch(CLOUD.apiBase+'/api/'+encodeURIComponent(CLOUD.airline)+path,Object.assign({},options,{headers:h}));
 let d={};try{d=await r.json()}catch{}
 if(!r.ok)throw new Error(d.error||'Cloud API error ('+r.status+').');return d;
}
async function register(username,password){const d=await api('/register',{method:'POST',body:JSON.stringify({username,password})});setSession({username:d.username,token:d.token});return d}
async function login(username,password){const d=await api('/login',{method:'POST',body:JSON.stringify({username,password})});setSession({username:d.username,token:d.token});return d}
async function account(){if(!session())return null;try{return await api('/me')}catch(e){if(/log in/i.test(e.message))logout();return null}}
async function bookings(){if(!session())return [];return (await api('/bookings')).bookings||[]}
async function book(booking){return api('/bookings',{method:'POST',body:JSON.stringify(booking)})}
async function cancel(id){return api('/bookings/'+encodeURIComponent(id)+'/cancel',{method:'POST'})}
async function readFlights(){return (await api('/flights')).flights||[]}
window.LUPIN_CLOUD={CLOUD,current:()=>session()?.username||'',logout,register,login,account,bookings,book,cancel,flights:readFlights};
window.LUPIN_LOCAL=window.LUPIN_CLOUD;
document.addEventListener('DOMContentLoaded',()=>{addChromeStyles();renderBar();renderPrivacy()});
})();