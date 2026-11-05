/**
 * =========================================================
 *  PROFIL DIGITAL — BACKEND (Google Apps Script + Sheets)
 * =========================================================
 *  Cara pasang (sekali sahaja):
 *   1. Buat Google Sheet baharu → Extensions → Apps Script.
 *   2. Tampal fail ini sebagai Code.gs.
 *   3. Tukar INITIAL_PIN di bawah → Save.
 *   4. Pilih fungsi `setup` → Run → benarkan akses.
 *   5. Deploy → New deployment → Web app
 *        Execute as : Me
 *        Who has access : Anyone
 *      Salin URL /exec → tampal ke PROFILE_API dalam content.js.
 *   6. (Pilihan) Kosongkan INITIAL_PIN selepas setup.
 *
 *  Data disimpan sebagai JSON dalam tab "Data".
 *  Setiap simpanan disandarkan dalam tab "Sejarah" (30 terakhir).
 *  Gambar dimuat naik ke folder Google Drive.
 * =========================================================
 */

const INITIAL_PIN = 'TUKAR-PIN-INI';

const SHEET_DATA = 'Data';
const SHEET_HIST = 'Sejarah';
const SHEET_LOG = 'Log';
const CHUNK = 45000;            // had sel Sheets = 50,000 aksara
const MAX_HISTORY = 30;
const TOKEN_TTL = 6 * 60 * 60;  // 6 jam
const MAX_FAILS = 10;           // cubaan PIN salah sebelum dikunci
const LOCK_SECONDS = 15 * 60;
const MAX_CONTENT_BYTES = 800 * 1024;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const CACHE_KEY = 'content_v1';

/* ---------------------------------------------------------
   SETUP
--------------------------------------------------------- */
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  [SHEET_DATA, SHEET_HIST, SHEET_LOG].forEach(name => {
    if (!ss.getSheetByName(name)) ss.insertSheet(name);
  });
  const hist = ss.getSheetByName(SHEET_HIST);
  if (hist.getLastRow() === 0) hist.appendRow(['Masa', 'Ringkasan', 'Bil. Bahagian', 'JSON →']);
  const log = ss.getSheetByName(SHEET_LOG);
  if (log.getLastRow() === 0) log.appendRow(['Masa', 'Tindakan', 'Butiran']);

  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty('PIN_HASH')) {
    if (!INITIAL_PIN || INITIAL_PIN === 'TUKAR-PIN-INI') {
      throw new Error('Sila tukar INITIAL_PIN dahulu sebelum menjalankan setup().');
    }
    setPin_(INITIAL_PIN);
  }
  if (!props.getProperty('FOLDER_ID')) {
    const folder = DriveApp.createFolder('Profil Digital — Gambar');
    props.setProperty('FOLDER_ID', folder.getId());
  }
  log_('setup', 'Sistem disediakan');
  Logger.log('Setup selesai. Deploy sebagai Web App sekarang.');
}

/** Jalankan manual dari editor jika PIN terlupa. */
function resetPin() {
  if (!INITIAL_PIN || INITIAL_PIN === 'TUKAR-PIN-INI') throw new Error('Isi INITIAL_PIN dengan PIN baharu dahulu.');
  setPin_(INITIAL_PIN);
  CacheService.getScriptCache().remove('pin_fails');
  log_('resetPin', 'PIN ditetapkan semula dari editor');
  Logger.log('PIN telah ditetapkan semula.');
}

/* ---------------------------------------------------------
   HTTP
--------------------------------------------------------- */
function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || 'get';
    if (action === 'get') return json_({ ok: true, content: readContentCached_() });
    if (action === 'ping') return json_({ ok: true, time: new Date().toISOString() });
    return json_({ ok: false, error: 'Tindakan tidak sah' });
  } catch (err) {
    return json_({ ok: false, error: String(err.message || err) });
  }
}

function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const action = body.action;

    if (action === 'login') return json_(login_(body.pin));

    // Semua tindakan di bawah memerlukan token sah
    if (!validToken_(body.token)) return json_({ ok: false, error: 'Sesi tamat. Sila log masuk semula.', auth: false });

    switch (action) {
      case 'load':      return json_({ ok: true, content: readContent_() });
      case 'save':      return json_(save_(body.content, body.summary));
      case 'upload':    return json_(upload_(body));
      case 'history':   return json_({ ok: true, items: listHistory_() });
      case 'restore':   return json_(restore_(body.row));
      case 'changePin': return json_(changePin_(body.oldPin, body.newPin));
      case 'logout':    CacheService.getScriptCache().remove('tok_' + body.token); return json_({ ok: true });
      default:          return json_({ ok: false, error: 'Tindakan tidak sah' });
    }
  } catch (err) {
    return json_({ ok: false, error: String(err.message || err) });
  }
}

/* ---------------------------------------------------------
   AUTH
--------------------------------------------------------- */
function login_(pin) {
  const cache = CacheService.getScriptCache();
  const fails = Number(cache.get('pin_fails') || 0);
  if (fails >= MAX_FAILS) return { ok: false, error: 'Terlalu banyak cubaan. Cuba lagi selepas 15 minit.' };

  if (!pin || !checkPin_(String(pin))) {
    cache.put('pin_fails', String(fails + 1), LOCK_SECONDS);
    log_('login gagal', 'Cubaan ke-' + (fails + 1));
    Utilities.sleep(800);
    return { ok: false, error: 'PIN salah.' };
  }
  cache.remove('pin_fails');
  const token = Utilities.getUuid() + Utilities.getUuid().replace(/-/g, '');
  cache.put('tok_' + token, '1', TOKEN_TTL);
  log_('login', 'Berjaya');
  return { ok: true, token: token, ttl: TOKEN_TTL };
}

function validToken_(token) {
  if (!token || typeof token !== 'string' || token.length < 30) return false;
  const cache = CacheService.getScriptCache();
  if (!cache.get('tok_' + token)) return false;
  cache.put('tok_' + token, '1', TOKEN_TTL); // lanjutkan sesi
  return true;
}

function changePin_(oldPin, newPin) {
  if (!checkPin_(String(oldPin || ''))) return { ok: false, error: 'PIN lama salah.' };
  newPin = String(newPin || '');
  if (newPin.length < 6) return { ok: false, error: 'PIN baharu mesti sekurang-kurangnya 6 aksara.' };
  setPin_(newPin);
  log_('changePin', 'PIN ditukar');
  return { ok: true };
}

function setPin_(pin) {
  const salt = Utilities.getUuid();
  const props = PropertiesService.getScriptProperties();
  props.setProperty('PIN_SALT', salt);
  props.setProperty('PIN_HASH', hash_(salt + pin));
}

function checkPin_(pin) {
  const props = PropertiesService.getScriptProperties();
  const salt = props.getProperty('PIN_SALT');
  const stored = props.getProperty('PIN_HASH');
  if (!salt || !stored) return false;
  return hash_(salt + pin) === stored;
}

function hash_(s) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, s, Utilities.Charset.UTF_8)
    .map(b => ('0' + (b & 0xff).toString(16)).slice(-2)).join('');
}

/* ---------------------------------------------------------
   KANDUNGAN
--------------------------------------------------------- */
function readContentCached_() {
  const cache = CacheService.getScriptCache();
  const hit = cache.get(CACHE_KEY);
  if (hit) return JSON.parse(hit);
  const content = readContent_();
  const str = JSON.stringify(content);
  if (str.length < 95000) cache.put(CACHE_KEY, str, 21600);
  return content;
}

function readContent_() {
  const sh = sheet_(SHEET_DATA);
  const last = sh.getLastRow();
  if (last === 0) return null;
  const str = unchunk_(sh.getRange(1, 1, last, 1).getValues().map(r => r[0]));
  return str ? JSON.parse(str) : null;
}

function writeContent_(content) {
  const str = JSON.stringify(content);
  const sh = sheet_(SHEET_DATA);
  sh.clear();
  const rows = chunk_(str).map(c => [c]);
  sh.getRange(1, 1, rows.length, 1).setValues(rows);
  CacheService.getScriptCache().remove(CACHE_KEY);
}

function save_(content, summary) {
  validateContent_(content);
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const prev = readContent_();
    if (prev) backup_(prev, 'Sebelum: ' + (summary || 'simpanan'));
    content.updatedAt = new Date().toISOString();
    content.version = (Number(prev && prev.version) || 0) + 1;
    writeContent_(content);
    log_('save', summary || 'Kandungan dikemas kini');
    return { ok: true, updatedAt: content.updatedAt, version: content.version };
  } finally {
    lock.releaseLock();
  }
}

function validateContent_(c) {
  if (!c || typeof c !== 'object' || Array.isArray(c)) throw new Error('Format kandungan tidak sah.');
  if (!c.profile || typeof c.profile !== 'object') throw new Error('Bahagian profil tiada.');
  ['stats', 'career', 'education', 'achievements', 'gallery', 'testimonials', 'community'].forEach(k => {
    if (c[k] != null && !Array.isArray(c[k])) throw new Error('Bahagian ' + k + ' tidak sah.');
  });
  const size = Utilities.newBlob(JSON.stringify(c)).getBytes().length;
  if (size > MAX_CONTENT_BYTES) throw new Error('Kandungan terlalu besar (' + Math.round(size / 1024) + ' KB).');
}

/* ---------------------------------------------------------
   SEJARAH (sandaran)
--------------------------------------------------------- */
function backup_(content, summary) {
  const sh = sheet_(SHEET_HIST);
  const parts = chunk_(JSON.stringify(content));
  sh.appendRow([new Date(), summary, parts.length].concat(parts));
  const dataRows = sh.getLastRow() - 1;
  if (dataRows > MAX_HISTORY) sh.deleteRows(2, dataRows - MAX_HISTORY);
}

function listHistory_() {
  const sh = sheet_(SHEET_HIST);
  const last = sh.getLastRow();
  if (last < 2) return [];
  const vals = sh.getRange(2, 1, last - 1, 2).getValues();
  return vals.map((r, i) => ({ row: i + 2, time: new Date(r[0]).toISOString(), summary: String(r[1]) })).reverse();
}

function restore_(row) {
  row = Number(row);
  const sh = sheet_(SHEET_HIST);
  if (!row || row < 2 || row > sh.getLastRow()) return { ok: false, error: 'Sandaran tidak dijumpai.' };
  const n = Number(sh.getRange(row, 3).getValue());
  const str = unchunk_(sh.getRange(row, 4, 1, n).getValues()[0]);
  const content = JSON.parse(str);
  const res = save_(content, 'Pulih sandaran ' + Utilities.formatDate(new Date(sh.getRange(row, 1).getValue()), 'Asia/Kuala_Lumpur', 'dd/MM/yyyy HH:mm'));
  res.content = content;
  return res;
}

/* ---------------------------------------------------------
   MUAT NAIK GAMBAR
--------------------------------------------------------- */
function upload_(body) {
  const mime = String(body.mimeType || '');
  if (!/^image\/(jpeg|png|webp|gif)$/.test(mime)) return { ok: false, error: 'Hanya fail gambar dibenarkan.' };
  const bytes = Utilities.base64Decode(String(body.data || ''));
  if (bytes.length > MAX_IMAGE_BYTES) return { ok: false, error: 'Gambar terlalu besar (maks 8MB).' };
  const name = String(body.filename || 'gambar').replace(/[^\w.\- ]+/g, '_').slice(0, 80);
  const folder = DriveApp.getFolderById(PropertiesService.getScriptProperties().getProperty('FOLDER_ID'));
  const file = folder.createFile(Utilities.newBlob(bytes, mime, Date.now() + '_' + name));
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  log_('upload', file.getName());
  return { ok: true, id: file.getId(), url: 'https://lh3.googleusercontent.com/d/' + file.getId() };
}

/* ---------------------------------------------------------
   UTIL
--------------------------------------------------------- */
function sheet_(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

// Setiap bahagian diawali '~' supaya Sheets tidak tafsir sebagai formula/nombor/tarikh.
function chunk_(str) {
  const out = [];
  for (let i = 0; i < str.length; i += CHUNK) out.push('~' + str.slice(i, i + CHUNK));
  return out.length ? out : ['~'];
}

function unchunk_(parts) {
  return parts.map(p => { p = String(p); return p.charAt(0) === '~' ? p.slice(1) : p; }).join('');
}

function log_(action, detail) {
  try { sheet_(SHEET_LOG).appendRow([new Date(), action, detail]); } catch (e) {}
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
