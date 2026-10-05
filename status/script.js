const apiBase=()=>String(window.LUPIN_CONFIG?.apiBase||'').replace(/\/$/,'');
const countries=['Singapore','Japan','Australia','Canada','Iceland','France','Brazil','Norway','New Zealand','United Kingdom','Germany','South Korea','Italy','Spain','India','Mexico'];
let flights=[];
async function loadFlights(){
  const r=await fetch(apiBase()+'/flights');
  if(!r.ok)throw new Error('Could not load flight data.');
  const d=await r.json();
  flights=Array.isArray(d.flights)?d.flights:[];
  const cards=document.getElementById('status-cards');
  if(cards)cards.innerHTML=flights.map(f=>`<article data-flight="${f.flight}"><h2>${f.flight}</h2><p>${f.destination}</p><strong>Watching the clock...</strong></article>`).join('');
}
function tick(){
  const now=new Date();
  document.querySelectorAll('#status-cards article').forEach((c,i)=>{
    const f=flights[i]; if(!f)return;
    const [h,m]=f.departure.split(':').map(Number),d=new Date(now);d.setHours(h,m,0,0);
    const diff=d-now,totalSeconds=Math.abs(diff)/1000,minutes=Math.floor(totalSeconds/60),seconds=Math.floor(totalSeconds%60),milliseconds=now.getMilliseconds(),s=c.querySelector('strong');
    if(!s)return;
    if(diff>30*60*1000)s.textContent=`🟢 Scheduled · ${minutes}m ${String(seconds).padStart(2,'0')}s ${String(milliseconds).padStart(3,'0')}ms`;
    else if(diff>=0)s.textContent=`🟠 Boarding NOW · ${minutes}m ${String(seconds).padStart(2,'0')}s ${String(milliseconds).padStart(3,'0')}ms`;
    else s.textContent=`🔴 Flight is over ${countries[i%countries.length]} airspace · ${minutes}m ${String(seconds).padStart(2,'0')}s ${String(milliseconds).padStart(3,'0')}ms ago`;
  });
}
document.addEventListener('DOMContentLoaded',async()=>{try{await loadFlights();tick();setInterval(tick,50)}catch(e){const c=document.getElementById('status-cards');if(c)c.innerHTML='<p>⚠️ Flight data is temporarily unavailable.</p>'}});
