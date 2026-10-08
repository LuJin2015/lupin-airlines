/* Shared Lupin Airlines cloud authentication client. */
(function(){
  const C=window.LUPIN_CONFIG||{};
  const cfg=C.cloud||{};
  const API_BASE=String(cfg.apiBase||'https://lupin-data-api.lujinsg.workers.dev').replace(/\/$/,'');
  const AIRLINE=String(cfg.airline||'lupin-airlines');
  const SESSION_KEY='lupinCloudSession';
  const read=()=>{try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'null')}catch{return null}};
  const write=x=>{localStorage.setItem(SESSION_KEY,JSON.stringify(x));try{sessionStorage.setItem(SESSION_KEY,JSON.stringify(x))}catch{}};
  const clear=()=>{localStorage.removeItem(SESSION_KEY);try{sessionStorage.removeItem(SESSION_KEY)}catch{}};
  async function api(path,options={}){
    const headers=Object.assign({'Content-Type':'application/json'},options.headers||{});
    const s=read(); if(s?.token) headers.Authorization='Bearer '+s.token;
    let r;
    try{r=await fetch(API_BASE+'/api/'+encodeURIComponent(AIRLINE)+path,Object.assign({},options,{headers,cache:'no-store'}));}
    catch(e){const x=new Error('Could not reach the Lupin cloud. Check your connection and try again.');x.code='NETWORK';throw x;}
    let d={}; try{d=await r.json()}catch{}
    if(!r.ok){const e=new Error(d.error||'Cloud API error ('+r.status+').');e.status=r.status;throw e;}
    return d;
  }
  async function register(username,password){const d=await api('/register',{method:'POST',body:JSON.stringify({username,password})});write({username:d.username,miles:Number(d.miles||0),token:d.token});return d}
  async function login(username,password){const d=await api('/login',{method:'POST',body:JSON.stringify({username,password})});write({username:d.username,miles:Number(d.miles||0),token:d.token});return d}
  async function account(){if(!read())return null;try{return await api('/me')}catch(e){if(e.status===401)clear();throw e}}
  async function bookings(){if(!read())return [];return (await api('/bookings')).bookings||[]}
  async function book(data){return api('/bookings',{method:'POST',body:JSON.stringify(data)})}
  async function cancel(id){return api('/bookings/'+encodeURIComponent(id)+'/cancel',{method:'POST'})}
  async function flights(){return (await api('/flights')).flights||[]}
  window.LUPIN_CLOUD={apiBase:API_BASE,airline:AIRLINE,current:()=>read()?.username||'',session:read,logout:clear,register,login,account,bookings,book,cancel,flights};
})();
