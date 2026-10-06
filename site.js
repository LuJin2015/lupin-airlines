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
const CLOUD={repo:C.cloud?.repo||'LuJin2015/lupin-data',dataBase:C.cloud?.dataBase||'https://raw.githubusercontent.com/LuJin2015/lupin-data/main/data/lupin-airlines',workflow:C.cloud?.workflow||'lupin-airlines-cloud.yml',clientId:C.cloud?.clientId||'REPLACE_WITH_GITHUB_OAUTH_CLIENT_ID',tokenKey:'lupinGitHubToken',sessionKey:'lupinCurrentUser'};
async function cloudRead(file){const r=await fetch(CLOUD.dataBase+'/'+file+'?t='+Date.now(),{cache:'no-store'});if(!r.ok)throw new Error('Could not read cloud data: '+file);return r.json()}
const cloudToken=()=>sessionStorage.getItem(CLOUD.tokenKey)||'';
const cloudCurrent=()=>sessionStorage.getItem(CLOUD.sessionKey)||'';
const cloudSetCurrent=u=>sessionStorage.setItem(CLOUD.sessionKey,u);
const cloudLogout=()=>{sessionStorage.removeItem(CLOUD.sessionKey);sessionStorage.removeItem(CLOUD.tokenKey)};
async function cloudHash(v){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(v));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
async function githubConnect(){if(CLOUD.clientId.startsWith('REPLACE_'))throw new Error('GitHub OAuth Client ID has not been configured yet.');const r=await fetch('https://github.com/login/device/code',{method:'POST',headers:{Accept:'application/json'},body:new URLSearchParams({client_id:CLOUD.clientId,scope:'repo'})});if(!r.ok)throw new Error('Could not start GitHub authorization.');const d=await r.json();window.open(d.verification_uri||'https://github.com/login/device','_blank','noopener');alert('Enter GitHub code '+d.user_code+' in the new GitHub window, then return here.');let wait=(Number(d.interval)||5)*1000,end=Date.now()+(Number(d.expires_in)||900)*1000;while(Date.now()<end){await new Promise(x=>setTimeout(x,wait));const q=await fetch('https://github.com/login/oauth/access_token',{method:'POST',headers:{Accept:'application/json'},body:new URLSearchParams({client_id:CLOUD.clientId,device_code:d.device_code,grant_type:'urn:ietf:params:oauth:grant-type:device_code'})});const x=await q.json();if(x.access_token){sessionStorage.setItem(CLOUD.tokenKey,x.access_token);return x.access_token}if(x.error==='access_denied'||x.error==='expired_token')throw new Error('GitHub authorization was not completed.');if(x.error==='slow_down')wait+=5000}throw new Error('GitHub authorization timed out.')}
async function cloudTokenOrConnect(){return cloudToken()||githubConnect()}
async function cloudDispatch(operation,payload){const t=await cloudTokenOrConnect();const r=await fetch('https://api.github.com/repos/'+CLOUD.repo+'/actions/workflows/'+CLOUD.workflow+'/dispatches',{method:'POST',headers:{Accept:'application/vnd.github+json',Authorization:'Bearer '+t,'X-GitHub-Api-Version':'2026-03-10','Content-Type':'application/json'},body:JSON.stringify({ref:'main',inputs:{operation,payload:JSON.stringify(payload)}})});if(r.status===401){sessionStorage.removeItem(CLOUD.tokenKey);throw new Error('GitHub authorization expired.');}if(r.status===403)throw new Error('Your GitHub account needs write access to '+CLOUD.repo+'.');if(!r.ok)throw new Error('GitHub could not start the cloud update ('+r.status+').')}
async function cloudWait(test){const end=Date.now()+30000;while(Date.now()<end){try{if(await test())return true}catch{}await new Promise(x=>setTimeout(x,1500))}return false}
async function cloudRegister(username,password){const accounts=await cloudRead('accounts.json');if(accounts.some(x=>x.username===username))throw new Error('That username is already in use.');const account={username,passwordHash:await cloudHash(password),miles:0,createdAt:new Date().toISOString()};await cloudDispatch('register',{username,account});if(!await cloudWait(async()=> (await cloudRead('accounts.json')).some(x=>x.username===username)))throw new Error('GitHub Actions did not finish the account update in time.');cloudSetCurrent(username)}
async function cloudLogin(username,password){const accounts=await cloudRead('accounts.json'),a=accounts.find(x=>x.username===username);if(!a||a.passwordHash!==await cloudHash(password))throw new Error('Incorrect username or password.');cloudSetCurrent(username)}
async function cloudAccount(){const u=cloudCurrent();if(!u)return null;return (await cloudRead('accounts.json')).find(x=>x.username===u)||null}
async function cloudBookings(){const u=cloudCurrent();return u?(await cloudRead('bookings.json')).filter(x=>x.username===u):[]}
async function cloudBook(booking){await cloudDispatch('book',{username:booking.username,booking});if(!await cloudWait(async()=> (await cloudRead('bookings.json')).some(x=>x.bookingId===booking.bookingId)))throw new Error('GitHub Actions did not finish the booking update in time.');return booking}
async function cloudCancel(id){const u=cloudCurrent();await cloudDispatch('cancel',{username:u,bookingId:id});if(!await cloudWait(async()=> (await cloudRead('bookings.json')).some(x=>x.bookingId===id&&x.status==='Cancelled')))throw new Error('GitHub Actions did not finish the cancellation in time.')}
window.LUPIN_CLOUD={CLOUD,read:cloudRead,current:cloudCurrent,logout:cloudLogout,githubConnect,register:cloudRegister,login:cloudLogin,account:cloudAccount,bookings:cloudBookings,book:cloudBook,cancel:cloudCancel,hashPassword:cloudHash};
window.LUPIN_LOCAL=window.LUPIN_CLOUD;
document.addEventListener('DOMContentLoaded',()=>{addChromeStyles();renderBar();renderPrivacy()});
})();