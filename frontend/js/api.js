/* ============================================================
   NOVA SALUD — api.js
   ============================================================ */
const API = 'http://localhost:3000/api';

async function request(method, endpoint, body = null) {
  const token = localStorage.getItem('ns_token');
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
  };
  if (body) opts.body = JSON.stringify(body);
  const res  = await fetch(`${API}${endpoint}`, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Error en la petición');
  return data;
}

const api = {
  get:    (ep)       => request('GET',    ep),
  post:   (ep, body) => request('POST',   ep, body),
  put:    (ep, body) => request('PUT',    ep, body),
  delete: (ep)       => request('DELETE', ep),
};

function getUser()    { try { return JSON.parse(localStorage.getItem('ns_user')); } catch { return null; } }
function getToken()   { return localStorage.getItem('ns_token'); }
function isLoggedIn() { return !!getToken(); }

function logout() {
  localStorage.removeItem('ns_token');
  localStorage.removeItem('ns_user');
  window.location.href = '/login.html';
}

function requireAuth() {
  if (!isLoggedIn()) { window.location.href = '/login.html'; return false; }
  return true;
}

function toast(msg, type = 'success', ms = 3500) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = `show ${type}`;
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.className = ''; }, ms);
}

const fmt = {
  money: v => `S/ ${parseFloat(v || 0).toFixed(2)}`,
  date:  v => v ? new Date(v).toLocaleDateString('es-PE') : '—',
  dt:    v => v ? new Date(v).toLocaleString('es-PE')     : '—',
  num:   v => parseInt(v || 0).toLocaleString('es-PE'),
};

function renderTable(tbodyId, rows, cols) {
  const tb = document.getElementById(tbodyId);
  if (!tb) return;
  if (!rows.length) {
    tb.innerHTML = `<tr><td colspan="${cols.length}" style="text-align:center;padding:24px;color:var(--gray-3)">Sin resultados</td></tr>`;
    return;
  }
  tb.innerHTML = rows.map(r => `<tr>${cols.map(c => `<td>${c(r)}</td>`).join('')}</tr>`).join('');
}

function openModal(id)  { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }
function confirmAction(msg) { return confirm(msg); }
