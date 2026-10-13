const cloud=()=>window.LUPIN_CLOUD;let flightList=[];let seatState={flight:"",date:"",count:1,occupied:[],selected:[]};
async function loadFlights(){const r=await fetch(window.LUPIN_CONFIG.cloud.apiBase+'/api/'+encodeURIComponent(window.LUPIN_CONFIG.cloud.airline)+'/flights',{cache:'no-store'});if(!r.ok)throw new Error('Could not load flight data.');flightList=(await r.json()).flights||[]}
const flightForDestination=d=>flightList.find(f=>f.destination===d);
async function getAccount(){return cloud().account()}
function passengerCount(value){const n=Number(String(value||'1').match(/\d+/)?.[0]||1);return Math.max(1,Math.min(6,n))}
function esc(value){return String(value==null?'':value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function seatButton(code,occupied,selected){const status=occupied?'occupied':selected?'selected':'available';return '<button type="button" class="seat '+status+'" data-seat="'+code+'" '+(occupied?'disabled aria-label="Seat '+code+' occupied"':'aria-pressed="'+selected+'" aria-label="Seat '+code+' '+status+'"')+'>'+code+'</button>'}
function renderSeatMap(){
 const result=document.getElementById('result'),count=seatState.count,chosen=seatState.selected;
 const rows=[];
 for(let row=1;row<=30;row++){
  let cells='';
  for(const col of ['A','B','C','D','E','F']){
   if(col==='D')cells+='<span class="seat-aisle" aria-hidden="true"></span>';
   const code=String(row)+col;
   cells+=seatButton(code,seatState.occupied.includes(code),chosen.includes(code));
  }
  rows.push('<div class="seat-row"><span class="row-number">'+row+'</span>'+cells+'</div>');
 }
 const remaining=Math.max(0,count-chosen.length);
 const summary=chosen.length===count?'You have selected all '+count+' seat'+(count===1?'':'s')+'.':'Select '+remaining+' more seat'+(remaining===1?'':'s')+' for your party.';
 result.querySelector('#seat-picker').innerHTML='<div class="seat-heading"><div><small>YOUR FLIGHT · YOUR SEAT</small><h4>Choose your seats</h4><p>'+summary+'</p></div><span class="seat-counter">'+chosen.length+' / '+count+'</span></div><div class="seat-legend"><span><i class="available-key"></i> Available</span><span><i class="selected-key"></i> Selected</span><span><i class="occupied-key"></i> Occupied</span></div><div class="plane-map"><div class="plane-front">✈ FRONT · COCKPIT</div><div class="seat-column-labels"><span></span><span>A</span><span>B</span><span>C</span><span></span><span>D</span><span>E</span><span>F</span></div><div class="seat-rows">'+rows.join('')+'</div><div class="plane-rear">REAR OF AIRCRAFT</div></div><p class="seat-help">Seat availability is checked against the Lupin cloud. Occupied seats cannot be selected.</p>';
 result.querySelectorAll('[data-seat]').forEach(button=>button.addEventListener('click',()=>{
  const code=button.dataset.seat;
  if(seatState.occupied.includes(code))return;
  if(seatState.selected.includes(code))seatState.selected=seatState.selected.filter(x=>x!==code);
  else if(seatState.selected.length<seatState.count)seatState.selected=[...seatState.selected,code];
  renderSeatMap();
 }));
 const confirm=result.querySelector('#confirm-flight');
 confirm.disabled=chosen.length!==count;
 confirm.textContent=chosen.length===count?'🎫 Confirm booking · '+chosen.join(', '):'Choose '+remaining+' more seat'+(remaining===1?'':'s');
}
async function loadSeatMap(flight,date,count){
 seatState={flight:flight.flight,date,count,occupied:[],selected:[]};
 const result=document.getElementById('result');
 result.innerHTML='<small>✈️ FLIGHT FOUND · PROBABLY</small><h3>'+esc(flight.flight)+' · '+esc(flight.destination)+'</h3><p>🕒 Departure: <strong>'+esc(flight.departure)+'</strong> · 🚪 Gate <strong>'+esc(flight.gate)+'</strong></p><p>📅 Date: <strong>'+esc(date)+'</strong> · 👤 <strong>'+count+' passenger'+(count===1?'':'s')+'</strong></p><p class="fare">💰 Fare per booking: <strong>'+esc(flight.price)+'</strong></p><section id="seat-picker" class="seat-picker"><p>Loading seat availability…</p></section><button type="button" class="primary" id="confirm-flight" disabled>Choose a seat first</button>';
 try{
  const map=await cloud().seatMap(flight.flight,date);
  seatState.occupied=Array.isArray(map.occupied)?map.occupied:[];
  renderSeatMap();
  result.querySelector('#confirm-flight').addEventListener('click',()=>confirmBooking(flight,date,count+' passenger'+(count===1?'':'s'),[...seatState.selected]));
 }catch(e){result.querySelector('#seat-picker').innerHTML='<p class="seat-error">Could not load seat availability: '+esc(e.message)+'</p><button type="button" class="secondary" id="retry-seats">Retry seat map</button>';result.querySelector('#retry-seats').addEventListener('click',()=>loadSeatMap(flight,date,count))}
}
async function searchFlight(){
 const name=document.getElementById('passengerName'),destination=document.getElementById('destination'),date=document.getElementById('flightDate'),passengers=document.getElementById('passengers'),result=document.getElementById('result');
 if(!destination||!result)return;
 if(!await getAccount()){result.innerHTML='<strong>🔐 Please log in first.</strong><p><a class="primary" href="../account/">Log in / Create account</a></p>';return}
 const flight=flightForDestination(destination.value);
 if(!flight){result.innerHTML='<strong>⚠️ Please choose a destination first.</strong>';return}
 const count=passengerCount(passengers?.value),chosenDate=date?.value||new Date().toISOString().slice(0,10);
 if(name&&!name.value)name.value=cloud().current();
 result.className='booking-result';
 await loadSeatMap(flight,chosenDate,count);
}
async function confirmBooking(flight,date,passengers,seats){
 const result=document.getElementById('result'),name=(document.getElementById('passengerName')?.value||cloud().current()).trim(),account=await getAccount();
 if(!account){result.innerHTML='<strong>🔐 Please log in first.</strong>';return}
 if(!name){result.innerHTML='<strong>⚠️ Please enter your name or nickname.</strong>';return}
 if(!Array.isArray(seats)||seats.length!==passengerCount(passengers)){result.querySelector('#seat-picker')?.scrollIntoView({behavior:'smooth',block:'center'});return}
 const bookingId='LUP-'+Math.random().toString(16).slice(2,8).toUpperCase(),b={bookingId,username:account.username,name,flight:flight.flight,destination:flight.destination,date,time:flight.departure,gate:flight.gate,passengers,fare:Number(String(flight.price).replace(/[^0-9]/g,''))||0,seats,status:'Confirmed',bookedAt:new Date().toISOString(),milesEarned:500};
 try{
  const confirm=result.querySelector('#confirm-flight');if(confirm){confirm.disabled=true;confirm.textContent='☁️ Saving seats and booking…'}
  const saved=await cloud().book(b);
  const assigned=Array.isArray(saved.seats)?saved.seats:seats;
  result.innerHTML='<small>🎫 BOOKING CONFIRMED · SEATS SAVED TO CLOUD</small><h3>'+esc(saved.bookingId||bookingId)+'</h3><p><strong>'+esc(name)+'</strong> · '+esc(flight.flight)+' · '+esc(flight.destination)+'</p><p>📅 '+esc(date)+' · 🕒 '+esc(flight.departure)+' · 🚪 Gate '+esc(flight.gate)+'</p><p>👤 '+esc(passengers)+' · 💺 <strong>'+assigned.map(esc).join(', ')+'</strong></p><p>💰 '+esc(flight.price)+'</p><p>⭐ <strong>+500 Lupin Miles</strong></p><p><a href="../account/">View / cancel my bookings →</a></p>';
 }catch(e){
  if(e.status===409){result.innerHTML='<strong>⚠️ A seat was just taken.</strong><p>'+esc(e.message)+'</p><button type="button" class="primary" id="refresh-seat-map">Refresh seat map and choose again</button>';document.getElementById('refresh-seat-map').addEventListener('click',()=>loadSeatMap(flight,date,passengerCount(passengers)));return}
  result.innerHTML='<strong>❌ Booking failed.</strong><p>'+esc(e.message)+'</p><button type="button" class="secondary" id="retry-booking-seats">Return to seat selection</button>';document.getElementById('retry-booking-seats').addEventListener('click',()=>loadSeatMap(flight,date,passengerCount(passengers)));
 }
}
document.addEventListener('DOMContentLoaded',async()=>{
 const destination=document.getElementById('destination'),date=document.getElementById('flightDate'),name=document.getElementById('passengerName'),button=document.getElementById('searchButton'),requested=new URLSearchParams(location.search).get('destination');
 try{
  await loadFlights();
  if(destination){destination.innerHTML=flightList.map(f=>'<option>'+esc(f.destination)+'</option>').join('');if(requested&&flightForDestination(requested))destination.value=requested}
  if(date&&!date.value)date.value=new Date().toISOString().slice(0,10);
  if(name&&!name.value)name.value=cloud().current();
  button?.addEventListener('click',searchFlight);
 }catch(e){if(destination)destination.innerHTML='<option>Flight data unavailable</option>';if(button)button.disabled=true}
});