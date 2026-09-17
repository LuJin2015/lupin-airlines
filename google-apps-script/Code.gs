const SPREADSHEET_ID = '1CGWCDA_blvF_1D2OXnoB3Z6Kn_pMVuMahx8xU_nf8co';
const SHEET_NAME = 'flights';
const ACCOUNTS_SHEET_NAME = 'accounts';
const ADMIN_KEY = 'lupin-air-2026';
const SESSION_DAYS = 30;

function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function getSpreadsheet_() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function getSheet_() {
  const ss = getSpreadsheet_();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error('Could not find the sheet named "flights".');

  const headers = ['Booking ID','Booked At','Passenger','Flight','Destination','Date','Time','Gate','Passengers','Fare','Account','Status'];
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  } else {
    const current = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), headers.length)).getDisplayValues()[0];
    for (let i = 0; i < headers.length; i++) {
      if (current[i] !== headers[i]) sheet.getRange(1, i + 1).setValue(headers[i]);
    }
  }
  return sheet;
}

function getAccountsSheet_() {
  const ss = getSpreadsheet_();
  let sheet = ss.getSheetByName(ACCOUNTS_SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(ACCOUNTS_SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Username','Password Hash','Salt','Created At','Session Token Hash','Session Created At']);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function hash_(value) {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(value), Utilities.Charset.UTF_8);
  return bytes.map(function(b) {
    const n = b < 0 ? b + 256 : b;
    return ('0' + n.toString(16)).slice(-2);
  }).join('');
}

function newToken_() {
  return Utilities.getUuid() + '-' + Utilities.getUuid();
}

function findAccountRow_(username) {
  const sheet = getAccountsSheet_();
  const values = sheet.getDataRange().getValues();
  const wanted = String(username).toLowerCase();
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]).toLowerCase() === wanted) return { sheet: sheet, row: i + 1, values: values[i] };
  }
  return null;
}

function accountFromToken_(token) {
  if (!token) return null;
  const sheet = getAccountsSheet_();
  const values = sheet.getDataRange().getValues();
  const wanted = hash_(token);
  const now = Date.now();
  for (let i = 1; i < values.length; i++) {
    const tokenHash = String(values[i][4] || '');
    const created = values[i][5] ? new Date(values[i][5]).getTime() : 0;
    if (tokenHash && tokenHash === wanted && created && now - created <= SESSION_DAYS * 86400000) {
      return { username: String(values[i][0]), row: i + 1, sheet: sheet };
    }
  }
  return null;
}

function register_(body) {
  const username = String(body.username || '').trim();
  const password = String(body.password || '');
  if (!/^[A-Za-z0-9_-]{3,20}$/.test(username)) throw new Error('Username must be 3–20 letters, numbers, _ or -.');
  if (password.length < 6) throw new Error('Password must be at least 6 characters.');
  if (findAccountRow_(username)) throw new Error('That username is already taken.');

  const salt = Utilities.getUuid();
  const token = newToken_();
  const sheet = getAccountsSheet_();
  sheet.appendRow([username, hash_(salt + '|' + password), salt, new Date(), hash_(token), new Date()]);
  return { ok: true, username: username, token: token };
}

function login_(body) {
  const username = String(body.username || '').trim();
  const password = String(body.password || '');
  const account = findAccountRow_(username);
  if (!account) throw new Error('Incorrect username or password.');
  const storedHash = String(account.values[1] || '');
  const salt = String(account.values[2] || '');
  if (hash_(salt + '|' + password) !== storedHash) throw new Error('Incorrect username or password.');

  const token = newToken_();
  account.sheet.getRange(account.row, 5, 1, 2).setValues([[hash_(token), new Date()]]);
  return { ok: true, username: String(account.values[0]), token: token };
}

function bookingsForAccount_(username) {
  const sheet = getSheet_();
  const values = sheet.getDataRange().getDisplayValues();
  const result = [];
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][10] || '').toLowerCase() === String(username).toLowerCase()) {
      result.push({
        bookingId: values[i][0], bookedAt: values[i][1], passenger: values[i][2], flight: values[i][3],
        destination: values[i][4], date: values[i][5], time: values[i][6], gate: values[i][7],
        passengers: values[i][8], fare: values[i][9], status: values[i][11] || 'Confirmed'
      });
    }
  }
  return result.reverse();
}

function book_(body, account) {
  if (!body.flight || !body.destination || !body.date) throw new Error('Missing booking information.');
  const name = String(body.name || '').trim().slice(0, 40);
  if (!name) throw new Error('Passenger name is required.');
  const id = 'LUP-' + Utilities.getUuid().replace(/-/g, '').slice(0, 6).toUpperCase();
  getSheet_().appendRow([
    id, new Date(), name, String(body.flight), String(body.destination), String(body.date), String(body.time || ''),
    String(body.gate || ''), String(body.passengers || ''), Number(body.price) || 0, account.username, 'Confirmed'
  ]);
  return { ok: true, bookingId: id };
}

function cancel_(body, account) {
  const bookingId = String(body.bookingId || '').trim();
  if (!bookingId) throw new Error('Booking ID is required.');
  const sheet = getSheet_();
  const values = sheet.getDataRange().getDisplayValues();
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === bookingId) {
      if (String(values[i][10]).toLowerCase() !== String(account.username).toLowerCase()) throw new Error('That booking does not belong to your account.');
      if ((values[i][11] || 'Confirmed') === 'Cancelled') throw new Error('This booking is already cancelled.');
      sheet.getRange(i + 1, 12).setValue('Cancelled');
      return { ok: true, bookingId: bookingId, status: 'Cancelled' };
    }
  }
  throw new Error('Booking not found.');
}

function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const action = String(body.action || 'book');
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      if (action === 'register') return json_(register_(body));
      if (action === 'login') return json_(login_(body));
      if (action === 'book') {
        const account = accountFromToken_(String(body.token || ''));
        if (!account) return json_({ ok: false, error: 'Please log in before booking.' });
        return json_(book_(body, account));
      }
      if (action === 'myBookings') {
        const account = accountFromToken_(String(body.token || ''));
        if (!account) return json_({ ok: false, error: 'Your session has expired. Please log in again.' });
        return json_({ ok: true, username: account.username, bookings: bookingsForAccount_(account.username) });
      }
      if (action === 'cancel') {
        const account = accountFromToken_(String(body.token || ''));
        if (!account) return json_({ ok: false, error: 'Your session has expired. Please log in again.' });
        return json_(cancel_(body, account));
      }
      return json_({ ok: false, error: 'Unknown action.' });
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    return json_({ ok: false, error: String(err.message || err) });
  }
}

function doGet(e) {
  try {
    const key = String((e.parameter && e.parameter.key) || '');
    if (key !== ADMIN_KEY) return json_({ ok: false, error: 'Unauthorized.' });
    const sheet = getSheet_();
    const values = sheet.getDataRange().getDisplayValues();
    return json_({ ok: true, bookings: values.length > 1 ? values.slice(1).reverse() : [] });
  } catch (err) {
    return json_({ ok: false, error: String(err.message || err) });
  }
}
