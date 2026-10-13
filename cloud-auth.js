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
  const AUTH_BASE=API_BASE+'/api/auth';
  async function sharedAuth(action,username,password){
    const response=await fetch(AUTH_BASE+'/'+action,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password}),cache:'no-store'});
    let data={};try{data=await response.json()}catch{}
    if(!response.ok){const e=new Error(data.error||'Lupin Cloud account error ('+response.status+').');e.status=response.status;throw e}
    localStorage.setItem('lupinCloudAccount',JSON.stringify({token:data.token,user:data.user,expiresAt:data.expiresAt}));
    window.dispatchEvent(new CustomEvent('lupin-auth-change',{detail:{token:data.token,user:data.user,expiresAt:data.expiresAt}}));
    return data;
  }
  async function ensureShared(username,password,preferred){
    try{return await sharedAuth(preferred,username,password)}
    catch(e){
      if(preferred==='login'&&e.status===401){
        // Existing airline-only accounts are upgraded after their airline password is verified.
        return await sharedAuth('register',username,password);
      }
      if(preferred==='register'&&e.status===409)return await sharedAuth('login',username,password);
      throw e;
    }
  }
  async function register(username,password){
    const identity=await ensureShared(username,password,'register');
    let d;
    try{d=await api('/register',{method:'POST',body:JSON.stringify({username,password})})}
    catch(e){if(e.status===409)d=await api('/login',{method:'POST',body:JSON.stringify({username,password})});else throw e}
    write({username:d.username,miles:Number(d.miles||0),token:d.token,cloudUser:identity.user});
    return {...d,cloudUser:identity.user};
  }
  async function login(username,password){
    // Validate against the airline account first for legacy-account migration.
    let d;
    try{d=await api('/login',{method:'POST',body:JSON.stringify({username,password})})}
    catch(e){throw e}
    let identity;
    try{identity=await ensureShared(username,password,'login')}
    catch(e){clear();throw e}
    write({username:d.username,miles:Number(d.miles||0),token:d.token,cloudUser:identity.user});
    return {...d,cloudUser:identity.user};
  }
  async function account(){if(!read())return null;try{return await api('/me')}catch(e){if(e.status===401)clear();throw e}}
  async function bookings(){if(!read())return [];return (await api('/bookings')).bookings||[]}
  async function book(data){return api('/bookings',{method:'POST',body:JSON.stringify(data)})}
  async function cancel(id){return api('/bookings/'+encodeURIComponent(id)+'/cancel',{method:'POST'})}
  async function flights(){return (await api('/flights')).flights||[]}
  async function seatMap(flight,date){return api('/seats?flight='+encodeURIComponent(flight)+'&date='+encodeURIComponent(date))}
  window.LUPIN_CLOUD={apiBase:API_BASE,airline:AIRLINE,api,current:()=>read()?.username||'',session:read,logout:clear,register,login,account,bookings,book,cancel,flights,seatMap};
})();
