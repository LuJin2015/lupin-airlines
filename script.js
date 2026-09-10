// Lupin Airlines runs on REAL time. Unfortunately, so does the chaos. ✈️

function localDateString(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function updateClock() {
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateText = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  let clock = document.querySelector('.live-clock');
  if (!clock) {
    clock = document.createElement('div');
    clock.className = 'live-clock';
    clock.style.cssText = 'font-size:11px;font-weight:800;white-space:nowrap;color:#69707d;';
    const nav = document.querySelector('.topbar nav');
    if (nav) nav.parentNode.insertBefore(clock, nav.nextSibling);
  }
  clock.textContent = `🕒 ${dateText} · ${time}`;

  const date = document.getElementById('date');
  if (date && !date.value) date.value = localDateString(now);

  document.querySelectorAll('[data-time]').forEach(el => {
    el.textContent = time;
  });

  updateFlightStatuses(now);
}

function updateFlightStatuses(now = new Date()) {
  const flights = {
    'LP 404': '09:00',
    'LP 007': '11:30',
    'LP 314': '14:20',
    'LP 9001': '23:59'
  };

  document.querySelectorAll('.route-grid article').forEach(card => {
    const code = card.querySelector('b')?.textContent.trim();
    if (!flights[code]) return;
    const [hour, minute] = flights[code].split(':').map(Number);
    const departure = new Date(now);
    departure.setHours(hour, minute, 0, 0);
    const diff = Math.round((departure - now) / 60000);
    const status = card.querySelector('strong');
    if (!status) return;
    if (diff > 180) status.textContent = '🟢 Scheduled · ' + formatCountdown(diff);
    else if (diff > 30) status.textContent = '🟡 Boarding in ' + formatCountdown(diff);
    else if (diff >= 0) status.textContent = '🟠 Boarding NOW · Please panic calmly';
    else if (diff > -60) status.textContent = '🔴 Departed ' + formatCountdown(Math.abs(diff)) + ' ago';
    else status.textContent = '⚪ Flight has left the building';
  });
}

function formatCountdown(minutes) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins ? `${hours}h ${mins}m` : `${hours}h`;
}

function scrollToFlights() {
  const flights = document.getElementById('flights');
  if (flights) flights.scrollIntoView({ behavior: 'smooth' });
  else window.location.href = 'flights.html';
}

function showNotice() {
  alert('Because we are Lupin Airlines. That is the entire explanation. 🐊');
}

function bookNow() {
  if (document.getElementById('flights')) scrollToFlights();
  else window.location.href = 'booking.html';
}

function searchFlight() {
  const from = document.getElementById('from')?.value || 'somewhere';
  const to = document.getElementById('to')?.value || 'somewhere nice';
  const result = document.getElementById('result');
  if (!result) return;
  result.classList.remove('hidden');
  const now = new Date();
  const liveStatus = now.getMinutes() % 2 === 0 ? 'probably on time' : 'questionably on time';
  result.innerHTML = `✈️ <strong>Flight found!</strong> ${from} → ${to}. Departure status: <strong>${liveStatus}</strong>. Gate: <strong>???</strong>. <button onclick="fakeBook()" style="margin-left:10px;border:0;border-radius:999px;padding:8px 13px;font-weight:800">Book it</button>`;
}

function fakeBook() {
  alert('Excellent choice. Your booking is confirmed-ish. Please arrive at the airport sometime before the flight. 🎫');
}

// -------------------- LUPIN MILES --------------------

const MILES_KEY = 'lupinAirlinesMiles';

function getMiles() {
  return Number(localStorage.getItem(MILES_KEY) || 12);
}

function setMiles(value) {
  const miles = Math.max(0, Math.floor(value));
  localStorage.setItem(MILES_KEY, miles);
  updateMilesUI();
  return miles;
}

function getMilesTier(miles) {
  if (miles >= 25000) return { name: 'Golden Pants', next: null, target: 25000 };
  if (miles >= 5000) return { name: 'Silver Pants', next: 'Golden Pants', target: 25000 };
  return { name: 'Bronze Pants', next: 'Silver Pants', target: 5000 };
}

function updateMilesUI() {
  const balance = getMiles();
  const tier = getMilesTier(balance);
  const balanceEl = document.getElementById('miles-balance');
  const tierEl = document.getElementById('miles-tier');
  const nextEl = document.getElementById('miles-next');
  const progressEl = document.getElementById('miles-progress-text');
  const moodEl = document.getElementById('miles-mood');

  if (!balanceEl) return;
  balanceEl.textContent = balance.toLocaleString();
  if (tierEl) tierEl.textContent = tier.name;

  if (!tier.next) {
    if (nextEl) nextEl.textContent = 'MAX';
    if (progressEl) progressEl.textContent = 'You have achieved maximum pants.';
  } else {
    const remaining = tier.target - balance;
    if (nextEl) nextEl.textContent = tier.target.toLocaleString();
    if (progressEl) progressEl.textContent = `${remaining.toLocaleString()} miles to ${tier.next}`;
  }

  if (moodEl) {
    moodEl.textContent = balance >= 25000 ? 'Extremely suspiciously loyal' : balance >= 5000 ? 'Suspiciously loyal' : 'New-ish passenger';
  }
}

function earnMiles() {
  const input = document.getElementById('miles-input');
  const message = document.getElementById('miles-message');
  const amount = Number(input?.value);
  if (!Number.isFinite(amount) || amount <= 0) {
    if (message) {
      message.classList.remove('hidden');
      message.textContent = '❌ Please enter a positive number of miles. Even Lupin Airlines needs numbers.';
    }
    return;
  }

  const oldBalance = getMiles();
  const newBalance = setMiles(oldBalance + amount);
  if (message) {
    message.classList.remove('hidden');
    message.textContent = `🎉 +${Math.floor(amount).toLocaleString()} miles! Your balance is now ${newBalance.toLocaleString()} miles. We have no idea where you flew, but congratulations.`;
  }
  input.value = '';
}

function redeemMiles(cost) {
  const balance = getMiles();
  if (balance < cost) {
    alert(`❌ Not enough Lupin Miles. You need ${cost.toLocaleString()} miles, but only have ${balance.toLocaleString()}. Please fly somewhere questionable first.`);
    return;
  }
  setMiles(balance - cost);
  alert(`🎁 Redeemed ${cost.toLocaleString()} Lupin Miles! Your new balance is ${getMiles().toLocaleString()} miles. Enjoy your questionable reward.`);
}

const mdmRemarks = {
  'index.html': 'This airline looks expensive. I am suspicious.',
  'flights.html': 'LP 404 is the most honest flight number I have ever seen.',
  'destinations.html': 'I asked where we were going. They said “probably”.',
  'booking.html': 'I booked a flight. The website congratulated me. Nobody knows why.',
  'experience.html': 'The snacks were good. The Wi-Fi was emotionally unavailable.',
  'baggage.html': 'My suitcase arrived before me. I am now worried.',
  'contact.html': 'I called customer service. Scraggy answered. Very professional.',
  'about.html': 'Scraggy has no qualifications. Finally, a relatable executive.',
  'miles.html': 'I have 12 miles. Apparently this is enough for one biscuit.',
  'status.html': 'The flight status changed three times while I was reading it.',
  'fleet.html': 'If the plane has wings, I suppose that is encouraging.',
  'cabins.html': 'Scraggy First sounds luxurious. I demand pants.',
  'careers.html': 'I applied for Delay Optimist. I have extensive experience waiting.',
  'airport-map.html': 'The map says Gate ???. Excellent. Very clear.'
};

const page = location.pathname.split('/').pop() || 'index.html';
const remark = mdmRemarks[page];

if (remark && !document.querySelector('.mdm-remark')) {
  const footer = document.querySelector('footer');
  if (footer) {
    const box = document.createElement('section');
    box.className = 'mdm-remark';
    box.innerHTML = `<span>REMARK OF THE DAY</span><p>“${remark}”</p><strong>— Mdm Wrong-Wrong</strong>`;
    footer.parentNode.insertBefore(box, footer);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  updateClock();
  updateMilesUI();
  setInterval(updateClock, 1000);
});
