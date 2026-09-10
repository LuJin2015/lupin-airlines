const date = document.getElementById('date');
if (date) date.value = new Date().toISOString().slice(0,10);

function scrollToFlights(){document.getElementById('flights').scrollIntoView({behavior:'smooth'});}
function showNotice(){alert('Because we are Lupin Airlines. That is the entire explanation. 🐊');}
function bookNow(){scrollToFlights();}
function searchFlight(){
  const from=document.getElementById('from').value || 'somewhere';
  const to=document.getElementById('to').value;
  const result=document.getElementById('result');
  result.classList.remove('hidden');
  result.innerHTML=`✈️ <strong>Flight found!</strong> ${from} → ${to}. Departure status: <strong>probably on time</strong>. Gate: <strong>???</strong>. <button onclick="fakeBook()" style="margin-left:10px;border:0;border-radius:999px;padding:8px 13px;font-weight:800">Book it</button>`;
}
function fakeBook(){alert('Excellent choice. Your booking is confirmed-ish. Please arrive at the airport sometime before the flight. 🎫');}
