const cfg=()=>window.LUPIN_CONFIG||{};
const apiBase=()=>String(cfg().apiBase||'').replace(/\/$/,'');
let flightCache=[];

async function getFlights(){
  if(flightCache.length)return flightCache;
  const r=await fetch(apiBase()+'/flights');
  if(!r.ok)throw new Error('Could not load flight data.');
  const d=await r.json();
  flightCache=Array.isArray(d.flights)?d.flights:[];
  return flightCache;
}
function statusFor(time){
  const now=new Date(),[h,m]=time.split(':').map(Number),d=new Date(now);
  d.setHours(h,m,0,0);
  const diff=d-now,total=Math.abs(diff),minutes=Math.floor(total/60000),seconds=Math.floor(total%60000/1000),ms=total%1000;
  const clock=`${minutes}m ${String(seconds).padStart(2,'0')}s ${String(ms).padStart(2,'0')}ms`;
  if(diff>180*60000)return '🟢 Scheduled · '+clock;
  if(diff>30*60000)return '🟡 Boarding in '+clock;
  if(diff>=0)return '🟠 Boarding NOW · '+clock;
  const countries=['Singapore','Japan','Australia','Canada','Iceland','France','Brazil','Norway','New Zealand','United Kingdom','Germany','South Korea','Italy','Spain','India','Mexico'];
  const stable=Math.abs(time.split(':').join(''))%countries.length;
  return '🔴 Flight is over '+countries[stable]+' airspace · '+clock+' ago';
}
function renderFlights(flights){
  const grid=document.getElementById('route-grid'),map=document.getElementById('flight-map');
  if(!grid)return;
  grid.innerHTML=flights.map(f=>`<article data-flight="${f.flight}"><b>${f.flight}</b><h2>Lupin International → ${f.destination}</h2><p>${f.departure} · Gate ${f.gate}</p><div class="flight-bottom"><strong>${f.status||'Scheduled'}</strong><span class="price">${Number(String(f.price).replace(/[^0-9]/g,''))===0?'FREE*':f.price}</span></div><a class="primary" href="../booking/?destination=${encodeURIComponent(f.destination)}">Book this flight ✈️</a></article>`).join('');
  if(map)map.innerHTML=flights.map((f,i)=>`<span class="airport a${i+1}">✈️ ${f.flight}</span><span class="map-label l${i+1}">${f.destination}</span>`).join('');
  update(flights);
}
function update(flights){flights.forEach(f=>{const card=document.querySelector('[data-flight="'+CSS.escape(f.flight)+'"]');const s=card?.querySelector('.flight-bottom strong');if(s)s.textContent=statusFor(f.departure)})}
document.addEventListener('DOMContentLoaded',async()=>{try{const flights=await getFlights();renderFlights(flights);setInterval(()=>update(flights),1000)}catch(e){const grid=document.getElementById('route-grid');if(grid)grid.innerHTML='<p>⚠️ Flight data is temporarily unavailable.</p>'}});
