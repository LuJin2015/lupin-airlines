const TOKEN_KEY='lupinAccountToken',USER_KEY='lupinAccountUsername';
const getToken=()=>localStorage.getItem(TOKEN_KEY)||'',getUsername=()=>localStorage.getItem(USER_KEY)||'';
const apiBase=()=>String(window.LUPIN_CONFIG?.apiBase||'').replace(/\/$/,'');
let flightList=[];
const flightForDestination=d=>flightList.find(f=>f.destination===d);
async function loadFlights(){
  const r=await fetch(apiBase()+'/flights');
  if(!r.ok)throw new Error('Could not load flight data.');
  const d=await r.json();
  flightList=Array.isArray(d.flights)?d.flights:[];
  return flightList;
}
async function api(path,options={}){
  const headers={'Content-Type':'application/json',...(options.headers||{})},token=getToken();
  if(token)headers.Authorization='Bearer '+token;
  const r=await fetch(apiBase()+path,{...options,headers});
  const d=await r.json();
  if(!r.ok)throw new Error(d.error||'Request failed');
  return d;
}
function searchFlight(){
  const name=document.getElementById('passengerName'),destination=document.getElementById('destination'),date=document.getElementById('flightDate'),passengers=document.getElementById('passengers'),result=document.getElementById('result');
  if(!destination||!result)return;
  if(!getToken()){result.innerHTML='<strong>🔐 Please log in first.</strong><p>You need a Lupin Airlines account before booking.</p><p><a class="primary" href="../account/">Log in / Create account</a></p>';return}
  const flight=flightForDestination(destination.value);
  if(!flight){result.innerHTML='<strong>⚠️ Please choose a destination first.</strong>';return}
  const pax=passengers?.value||'1 passenger',chosenDate=date?.value||new Date().toISOString().slice(0,10);
  if(name&&!name.value)name.value=getUsername();
  result.innerHTML=`<small>✈️ FLIGHT FOUND · PROBABLY</small><h3>${flight.flight} · ${flight.destination}</h3><p>🕒 Departure: <strong>${flight.departure}</strong> · 🚪 Gate <strong>${flight.gate}</strong></p><p>📅 Date: <strong>${chosenDate}</strong> · 👤 <strong>${pax}</strong></p><p class="fare">💰 Fare: <strong>${flight.price}</strong></p><button type="button" class="primary" id="confirm-flight">🎫 Book this flight</button>`;
  document.getElementById('confirm-flight').onclick=()=>confirmBooking(flight,chosenDate,pax);
}
async function confirmBooking(flight,date,passengers){
  const result=document.getElementById('result'),name=(document.getElementById('passengerName')?.value||getUsername()).trim();
  if(!name){result.innerHTML='<strong>⚠️ Please enter your name or nickname.</strong>';return}
  try{
    const d=await api('/bookings',{method:'POST',body:JSON.stringify({name,flight:flight.flight,date,passengers})});
    result.innerHTML=`<small>🎫 BOOKING CONFIRMED</small><h3>${d.bookingId}</h3><p><strong>${name}</strong> · ${flight.flight} · ${flight.destination}</p><p>📅 ${date} · 🕒 ${flight.departure} · 🚪 Gate ${flight.gate}</p><p>👤 ${passengers} · 💰 ${flight.price}</p><p>⭐ <strong>+${Number(d.milesEarned||500).toLocaleString()} Lupin Miles</strong></p><p><strong>Your booking has been added to your Lupin Airlines account.</strong></p><p><a href="../account/">View / cancel my bookings →</a> · <a href="../miles/">View Lupin Miles →</a></p>`;
  }catch(e){result.innerHTML='<strong>❌ Booking failed.</strong><p>'+e.message+'</p>'}
}
document.addEventListener('DOMContentLoaded',async()=>{
  const destination=document.getElementById('destination'),date=document.getElementById('flightDate'),name=document.getElementById('passengerName'),button=document.getElementById('searchButton'),requested=new URLSearchParams(location.search).get('destination');
  try{
    await loadFlights();
    if(destination){destination.innerHTML=flightList.map(f=>`<option>${f.destination}</option>`).join('');if(requested&&flightForDestination(requested))destination.value=requested}
    if(date&&!date.value)date.value=new Date().toISOString().slice(0,10);
    if(name&&!name.value)name.value=getUsername();
    button?.addEventListener('click',searchFlight);
  }catch(e){if(destination)destination.innerHTML='<option>Flight data unavailable</option>';if(button)button.disabled=true}
});
