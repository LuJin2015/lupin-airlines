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
  document.querySelectorAll('[data-time]').forEach(el => { el.textContent = time; });
  updateFlightStatuses(now);
}

function updateFlightStatuses(now = new Date()) {
  const flights = { 'LP 404': '09:00', 'LP 007': '11:30', 'LP 314': '14:20', 'LP 9001': '23:59' };
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
  else if (location.pathname.endsWith('booking.html')) searchFlight();
  else window.location.href = 'booking.html';
}

function searchFlight() {
  const from = document.getElementById('from')?.value || 'Lupin International';
  const selects = document.querySelectorAll('select');
  const to = selects[0]?.value || 'Somewhere Nice';
  const date = document.querySelector('input[type="date"]')?.value || localDateString();
  const passengers = selects[1]?.value || '1 passenger';
  const result = document.getElementById('result') || createBookingResult();
  const now = new Date();
  const liveStatus = now.getMinutes() % 2 === 0 ? 'probably on time' : 'questionably on time';
  result.classList.remove('hidden');
  result.innerHTML = `✈️ <strong>Flight found!</strong><br>${from} → ${to}<br>📅 ${date} · 👤 ${passengers}<br>Departure status: <strong>${liveStatus}</strong> · Gate: <strong>???</strong><br><button class="primary" onclick="confirmBooking()">Book this flight 🎫</button>`;
  result.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function createBookingResult() {
  const result = document.createElement('div');
  result.id = 'result';
  result.className = 'quote';
  const button = document.querySelector('.primary');
  if (button) button.parentNode.appendChild(result);
  else document.querySelector('main')?.appendChild(result);
  return result;
}

function confirmBooking() {
  alert('🎫 BOOKING CONFIRMED-ISH! Your seat is somewhere on the aircraft. Please keep this screen as proof that Lupin Airlines promised something.');
}

function fakeBook() { confirmBooking(); }

// ---------------- Lupin Miles ----------------
const MILES_KEY = 'lupinMilesBalance';
const DEFAULT_MILES = 12;

function getMiles() {
  const saved = Number(localStorage.getItem(MILES_KEY));
  return Number.isFinite(saved) && saved >= 0 ? Math.floor(saved) : DEFAULT_MILES;
}

function setMiles(value) {
  const miles = Math.max(0, Math.floor(Number(value) || 0));
  localStorage.setItem(MILES_KEY, String(miles));
  updateMilesUI();
}

function getMilesTier(miles) {
  if (miles >= 25000) return { name: 'Golden Pants', next: null };
  if (miles >= 5000) return { name: 'Silver Pants', next: 25000 };
  return { name: 'Bronze Pants', next: 5000 };
}

function updateMilesUI() {
  if (document.body.dataset.page !== 'miles') return;
  const miles = getMiles();
  const tier = getMilesTier(miles);
  const balance = document.getElementById('miles-balance');
  const tierEl = document.getElementById('miles-tier');
  const nextEl = document.getElementById('miles-next');
  const progressText = document.getElementById('miles-progress-text');
  const mood = document.getElementById('miles-mood');
  if (balance) balance.textContent = miles.toLocaleString();
  if (tierEl) tierEl.textContent = tier.name;
  if (tier.next) {
    const remaining = tier.next - miles;
    if (nextEl) nextEl.textContent = remaining.toLocaleString();
    if (progressText) progressText.textContent = `${remaining.toLocaleString()} miles to ${tier.next === 5000 ? 'Silver Pants' : 'Golden Pants'}`;
  } else {
    if (nextEl) nextEl.textContent = 'MAX';
    if (progressText) progressText.textContent = 'Highest tier reached 🎉';
  }
  if (mood) mood.textContent = miles >= 25000 ? 'Suspiciously powerful' : miles >= 5000 ? 'Very committed' : 'Suspiciously loyal';
}

function earnMiles() {
  const input = document.getElementById('miles-input');
  const message = document.getElementById('miles-message');
  const amount = Number(input?.value);
  if (!Number.isFinite(amount) || amount <= 0) {
    if (message) { message.textContent = '❌ Enter a positive number of miles.'; message.classList.remove('hidden'); }
    return;
  }
  const added = Math.floor(amount);
  setMiles(getMiles() + added);
  if (input) input.value = '';
  if (message) { message.textContent = `✅ Added ${added.toLocaleString()} miles. Your new balance is ${getMiles().toLocaleString()} miles.`; message.classList.remove('hidden'); }
}

function redeemMiles(cost) {
  const rewards = { 500: 'a snack 🍪', 2500: 'priority-ish boarding 🎟️', 5000: 'a free-ish flight ✈️' };
  if (getMiles() < cost) {
    alert(`❌ Not enough miles. You have ${getMiles().toLocaleString()} and need ${cost.toLocaleString()}.`);
    return;
  }
  setMiles(getMiles() - cost);
  alert(`🎉 Redeemed ${cost.toLocaleString()} miles for ${rewards[cost] || 'a mysterious Lupin reward'}!`);
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
  setInterval(updateClock, 1000);
  updateMilesUI();
});