const GOOGLE_APPS_SCRIPT_URL='https://script.google.com/macros/s/AKfycbxzs6RlsQifibE1HCJypNFefgCuKz0o3DDFNO7xglYkKuPxhisFAz5w1Eizy_Etzj8Ieg/exec';
const flights={
  "Lupin's House":{code:'LP 001',time:'08:15',gate:'L',price:101},
  "Mdm Wrong-Wrong's House":{code:'LP 002',time:'09:45',gate:'WW',price:202},
  "Somewhere Good":{code:'LP 003',time:'11:00',gate:'G',price:303},
  "Somewhere Better":{code:'LP 004',time:'12:30',gate:'B',price:404},
  "Somewhere Even Better":{code:'LP 005',time:'14:00',gate:'EB',price:505},
  "Somewhere Best":{code:'LP 006',time:'16:20',gate:'BEST',price:606},
  "Somewhere Worst":{code:'LP 000',time:'23:59',gate:'WORST',price:0},
  "Somewhere Nice":{code:'LP 404',time:'09:00',gate:'???',price:404},
  "Scraggy's House":{code:'LP 007',time:'11:30',gate:'7¾',price:79},
  "Singapore, Probably":{code:'LP 314',time:'14:20',gate:'12',price:314},
  "The Moon":{code:'LP 9001',time:'23:59',gate:'space',price:9001}
};
const TOKEN_KEY='lupinAccountToken',USER_KEY='lupinAccountUsername';
function getToken(){return localStorage.getItem(TOKEN_KEY)||''}
function getUsername(){return localStorage.getItem(USER_KEY)||''}
async function api(body){const response=await fetch(GOOGLE_APPS_SCRIPT_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(body)});return await response.json()}
function searchFlight(){
  const name=document.getElementById('passengerName'),destination=document.getElementById('destination'),date=document.getElementById('flightDate'),passengers=document.getElementById('passengers'),result=document.getElementById('result');
  if(!destination||!result)return;
  if(!getToken()){result.className='booking-result';result.innerHTML='<strong>🔐 Please log in first.</strong><p>You need a Lupin Airlines account before booking.</p><p><a class="primary" href="../account/">Log in / Create account</a></p>';return;}
  const flight=flights[destination.value];
  if(!flight){result.className='booking-result';result.innerHTML='<strong>⚠️ Please choose a destination first.</strong>';return;}
  const pax=passengers?passengers.value:'1 passenger';
  const chosenDate=date&&date.value?date.value:new Date().toISOString().slice(0,10);
  if(name&&!name.value)name.value=getUsername();
  result.className='booking-result';
  result.innerHTML=`<small>✈️ FLIGHT FOUND · PROBABLY</small><h3>${flight.code} · ${destination.value}</h3><p>🕒 Departure: <strong>${flight.time}</strong> · 🚪 Gate <strong>${flight.gate}</strong></p><p>📅 Date: <strong>${chosenDate}</strong> · 👤 <strong>${pax}</strong></p><p class="fare">💰 Fare: <strong>S$${flight.price.toLocaleString()}</strong></p><button type="button" class="primary" id="confirm-flight">🎫 Book this flight</button>`;
  document.getElementById('confirm-flight').addEventListener('click',()=>confirmBooking(flight,destination.value,chosenDate,pax));
  result.scrollIntoView({behavior:'smooth',block:'nearest'});
}
async function confirmBooking(flight,destination,date,passengers){
  const result=document.getElementById('result'),nameInput=document.getElementById('passengerName'),name=(nameInput?.value||getUsername()).trim();
  if(!getToken()){result.innerHTML='<strong>🔐 Please log in again.</strong>';return;}
  if(!name){result.innerHTML='<strong>⚠️ Please enter your name or nickname.</strong>';return;}
  const button=document.getElementById('confirm-flight');if(button){button.disabled=true;button.textContent='Booking… ✈️';}
  try{
    const data=await api({action:'book',token:getToken(),name,flight:flight.code,destination,date,time:flight.time,gate:flight.gate,passengers,price:flight.price});
    if(!data.ok)throw new Error(data.error||'Booking failed');
    const k='lupinMilesBalance',n=Number(localStorage.getItem(k));localStorage.setItem(k,String((Number.isFinite(n)?n:12)+500));
    result.innerHTML=`<small>🎫 BOOKING CONFIRMED</small><h3>${data.bookingId}</h3><p><strong>${name}</strong> · ${flight.code} · ${destination}</p><p>📅 ${date} · 🕒 ${flight.time} · 🚪 Gate ${flight.gate}</p><p>👤 ${passengers} · 💰 S$${flight.price.toLocaleString()}</p><p><strong>Your booking has been added to your Lupin Airlines account.</strong></p><p><a href="../account/">View / cancel my bookings →</a></p>`;
  }catch(error){if(button){button.disabled=false;button.textContent='🎫 Book this flight'}result.innerHTML=`<strong>❌ Booking failed.</strong><p>${error.message||'Please try again.'}</p>`}
}
document.addEventListener('DOMContentLoaded',()=>{const destination=document.getElementById('destination'),date=document.getElementById('flightDate'),name=document.getElementById('passengerName'),searchButton=document.getElementById('searchButton'),requested=new URLSearchParams(window.location.search).get('destination');if(destination&&requested&&flights[requested])destination.value=requested;if(date&&!date.value)date.value=new Date().toISOString().slice(0,10);if(name&&!name.value)name.value=getUsername();if(searchButton)searchButton.addEventListener('click',searchFlight);const accountLink=document.getElementById('account-link');if(accountLink)accountLink.textContent=getUsername()?`Account (${getUsername()})`:'Account'});