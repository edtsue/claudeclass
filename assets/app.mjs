// app.mjs — ClaudeClass hub engine (vanilla ESM, no build step).
import { CONTENT, REFERENCE, NAV_ORDER, COURSE } from './content.mjs';
import { SUPABASE, INSTRUCTOR_EMAIL } from './config.mjs';

/* ---------------- tiny helpers ---------------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const el = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
const LS = {
  get: (k, d) => { try { return JSON.parse(localStorage.getItem('cc:' + k)) ?? d; } catch { return d; } },
  set: (k, v) => localStorage.setItem('cc:' + k, JSON.stringify(v)),
  del: (k) => localStorage.removeItem('cc:' + k),
};

/* ---------------- pixel mascot ---------------- */
const MASCOT_MAP = [
  '...#####...',
  '..#######..',
  '..#######..',
  '..#.###.#..',
  '..#.###.#..',
  '###########',
  '..#######..',
  '..#######..',
  '..#######..',
  '..#.#.#.#..',
  '..#.#.#.#..',
];
function mascot(cls = '') {
  let rects = '';
  MASCOT_MAP.forEach((row, y) => [...row].forEach((c, x) => {
    if (c === '#') rects += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
  }));
  return `<svg class="${cls}" viewBox="0 0 11 11" fill="currentColor" shape-rendering="crispEdges" aria-hidden="true">${rects}</svg>`;
}

/* ---------------- content model ---------------- */
// Seed map: region key -> seeded html
const SEED = {};
for (const page of Object.values(CONTENT)) for (const s of page.sections) SEED[s.key] = s.html;

let overrides = {}; // key -> edited html (from Supabase or localStorage)
let sb = null;      // supabase client (if configured)
let instructorSession = false;

const html = (key) => overrides[key] ?? SEED[key] ?? '';

async function loadOverrides() {
  if (sb) {
    try {
      const { data } = await sb.from('hub_content').select('key,html');
      if (data) { overrides = {}; data.forEach((r) => (overrides[r.key] = r.html)); LS.set('content', overrides); return; }
    } catch (e) { console.warn('Supabase load failed, using cache/seed', e); showNotice('Showing the last saved copy (offline).'); }
    overrides = LS.get('content', {});
  } else {
    overrides = LS.get('content', {}); // local edits (preview mode)
  }
}

async function saveOverride(key, value) {
  overrides[key] = value;
  if (sb && instructorSession) {
    await sb.from('hub_content').upsert({ key, html: value, updated_at: new Date().toISOString() });
  } else {
    LS.set('content', overrides);
  }
}

/* ---------------- routing + render ---------------- */
function currentPage() {
  const id = (location.hash.replace(/^#\//, '') || 'overview');
  return CONTENT[id] ? id : 'overview';
}

function renderNav() {
  const nav = $('#nav');
  nav.innerHTML = NAV_ORDER.map((id) => {
    const p = CONTENT[id]; if (!p) return '';
    return `<a href="#/${id}" data-page="${id}">${p.nav}</a>`;
  }).join('');
}

function render() {
  const id = currentPage();
  const page = CONTENT[id];
  $$('#nav a').forEach((a) => a.classList.toggle('active', a.dataset.page === id));
  $('#nav').classList.remove('open');

  const main = $('#main');
  main.innerHTML = `
    <header class="page-head">
      <div class="eyebrow">${id === 'overview' ? 'ClaudeClass' : page.nav}</div>
      <h1>${page.title}</h1>
    </header>
    <div class="sheet glass reveal">
      ${page.sections.map((s) => `<div class="region" data-region="${s.key}">${html(s.key)}</div>`).join('')}
    </div>`;

  enhance(main, id);
  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
}

/* ---------------- per-render enhancements ---------------- */
function enhance(root, pageId) {
  // copy buttons on command blocks
  $$('.cmd', root).forEach((pre) => {
    const btn = el(`<button class="copy-btn" type="button">copy</button>`);
    btn.addEventListener('click', () => {
      navigator.clipboard.writeText(pre.querySelector('code').innerText.trim());
      btn.textContent = 'copied!'; btn.classList.add('done');
      setTimeout(() => { btn.textContent = 'copy'; btn.classList.remove('done'); }, 1400);
    });
    pre.appendChild(btn);
  });

  // tabs (Mac/PC)
  $$('.tabs', root).forEach((tabs) => {
    $$('.tab', tabs).forEach((tab) => tab.addEventListener('click', () => {
      $$('.tab', tabs).forEach((t) => t.classList.remove('is-active'));
      $$('.tabpane', tabs).forEach((p) => p.classList.remove('is-active'));
      tab.classList.add('is-active');
      $(`.tabpane[data-pane="${tab.dataset.tab}"]`, tabs).classList.add('is-active');
    }));
  });

  // checklists (persist per browser)
  $$('ul.todo', root).forEach((list) => {
    const key = 'check:' + list.dataset.checklist;
    const state = LS.get(key, {});
    $$('li', list).forEach((li, i) => {
      if (state[i]) li.classList.add('checked');
      li.addEventListener('click', () => {
        li.classList.toggle('checked');
        state[i] = li.classList.contains('checked');
        LS.set(key, state);
      });
    });
  });

  // reference page: inject search + grouped list
  if (pageId === 'reference') buildReference(root);

  if (editing) makeEditable(root);
}

/* ---------------- reference search ---------------- */
function buildReference(root) {
  const sheet = $('.sheet', root);
  const wrap = el(`
    <div class="ref-wrap">
      <div class="search-wrap">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
        <input type="search" id="ref-search" placeholder="Search terms & commands…" autocomplete="off">
      </div>
      <div id="ref-list"></div>
    </div>`);
  sheet.appendChild(wrap);
  const listEl = $('#ref-list', wrap);

  const draw = (q = '') => {
    const term = q.toLowerCase().trim();
    const items = REFERENCE.filter((r) =>
      !term || r.term.toLowerCase().includes(term) || r.def.toLowerCase().includes(term) || (r.meta || '').toLowerCase().includes(term));
    if (!items.length) { listEl.innerHTML = `<p class="no-results">No matches for "${q}". Try a simpler word, or ask the Claude helper.</p>`; return; }
    const cats = [...new Set(items.map((i) => i.cat))];
    listEl.innerHTML = cats.map((cat) => `
      <div class="ref-cat">
        <h3>${cat}</h3>
        ${items.filter((i) => i.cat === cat).map((i) => `
          <div class="ref-item">
            <div class="term">${i.term}</div>
            <div class="def">${i.def}</div>
            ${i.meta ? `<div class="ref-meta">🔑 ${i.meta}</div>` : ''}
            ${i.ex ? `<div class="ref-ex">${i.ex}</div>` : ''}
          </div>`).join('')}
      </div>`).join('');
  };
  draw();
  $('#ref-search', sheet).addEventListener('input', (e) => draw(e.target.value));
}

/* ---------------- settings ---------------- */
const SETTINGS = { theme: 'system', text: 'medium', motion: 'on' };
function applySettings() {
  const s = { ...SETTINGS, ...LS.get('settings', {}) };
  document.documentElement.dataset.theme = s.theme;
  document.documentElement.dataset.textSize = s.text;
  document.documentElement.dataset.motion = s.motion;
  return s;
}
function buildSettingsPanel() {
  const s = applySettings();
  const seg = (label, name, opts, val) => `
    <div class="set-group"><label>${label}</label>
      <div class="segmented" data-set="${name}">
        ${opts.map((o) => `<button data-val="${o[0]}" class="${val === o[0] ? 'on' : ''}">${o[1]}</button>`).join('')}
      </div></div>`;
  $('#settings-body').innerHTML =
    seg('Theme', 'theme', [['light', 'Light'], ['dark', 'Dark'], ['system', 'System']], s.theme) +
    seg('Text size', 'text', [['small', 'A'], ['medium', 'A'], ['large', 'A']], s.text) +
    seg('Reduce motion', 'motion', [['on', 'Off'], ['off', 'On']], s.motion) +
    `<div class="set-group"><label>Your data</label>
       <button class="btn-danger" id="reset-data">Reset my notes, progress &amp; settings</button></div>`;

  $$('#settings-body .segmented').forEach((grp) => grp.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    const cur = LS.get('settings', {}); cur[grp.dataset.set] = b.dataset.val; LS.set('settings', cur);
    $$('button', grp).forEach((x) => x.classList.remove('on')); b.classList.add('on');
    applySettings();
  }));
  $('#reset-data').addEventListener('click', () => {
    if (confirm('Clear your notes, checklist progress and settings? This only affects you.')) {
      Object.keys(localStorage).filter((k) => k.startsWith('cc:')).forEach((k) => localStorage.removeItem(k));
      location.reload();
    }
  });
}

/* ---------------- notes ---------------- */
const TINTS = ['', 'yellow', 'green', 'blue'];
function renderNotes() {
  const body = $('#notes-body');
  const notes = LS.get('notes', []);
  body.innerHTML = notes.length ? '' : `<p class="hint">No notes yet. Tap “New note” to start scribbling.</p>`;
  notes.forEach((n) => {
    const card = el(`
      <div class="note" data-tint="${n.tint || ''}" data-id="${n.id}">
        <textarea placeholder="Type a note…">${escapeHtml(n.text || '')}</textarea>
        <div class="note-bar">
          ${TINTS.map((t) => `<span class="tint-dot" data-tint="${t}" style="background:${tintColor(t)}"></span>`).join('')}
          <button class="note-del">delete</button>
        </div>
      </div>`);
    card.querySelector('textarea').addEventListener('input', (e) => updateNote(n.id, { text: e.target.value }));
    card.querySelectorAll('.tint-dot').forEach((d) => d.addEventListener('click', () => {
      updateNote(n.id, { tint: d.dataset.tint }); card.dataset.tint = d.dataset.tint;
    }));
    card.querySelector('.note-del').addEventListener('click', () => { deleteNote(n.id); card.remove(); if (!LS.get('notes', []).length) renderNotes(); });
    body.appendChild(card);
  });
}
function tintColor(t) { return ({ '': 'var(--accent)', yellow: '#e0b250', green: '#6ba368', blue: '#5b8fb0' })[t]; }
function newNote() {
  const notes = LS.get('notes', []);
  notes.unshift({ id: 'n' + Date.now() + Math.floor(performance.now()), text: '', tint: '' });
  LS.set('notes', notes); renderNotes(); $('#notes-body textarea')?.focus();
}
function updateNote(id, patch) { const n = LS.get('notes', []); const i = n.findIndex((x) => x.id === id); if (i > -1) { n[i] = { ...n[i], ...patch }; LS.set('notes', n); } }
function deleteNote(id) { LS.set('notes', LS.get('notes', []).filter((x) => x.id !== id)); }
function escapeHtml(s) { return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

/* ---------------- assistant (Gemini via /api/ask) ---------------- */
const chatHistory = [];
const SUGGESTIONS = [
  "What's a terminal?",
  'Terminal vs web Claude Code?',
  'How do I deploy to Vercel?',
];
function buildChat() {
  $('#chat-suggest').innerHTML = SUGGESTIONS.map((s) => `<button>${s}</button>`).join('');
  $$('#chat-suggest button').forEach((b) => b.addEventListener('click', () => { $('#chat-text').value = b.textContent; sendChat(); }));
  if (!chatHistory.length) addMsg('bot', "Hi! I'm your Claude helper 🦀 Ask me anything about the class — concepts, commands, or what to do next.");
}
function addMsg(role, text, cls = '') {
  const log = $('#chat-log');
  const m = el(`<div class="msg ${role} ${cls}"></div>`); m.textContent = text;
  log.appendChild(m); log.scrollTop = log.scrollHeight; return m;
}
async function sendChat() {
  const input = $('#chat-text'); const q = input.value.trim(); if (!q) return;
  input.value = ''; addMsg('user', q); chatHistory.push({ role: 'user', text: q });
  $('#chat-suggest').style.display = 'none';
  const thinking = addMsg('bot', 'thinking…', 'thinking');
  try {
    const res = await fetch('/api/ask', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: chatHistory.slice(-10), page: currentPage() }),
    });
    if (!res.ok) throw new Error('bad status ' + res.status);
    const data = await res.json();
    thinking.remove();
    const text = data.text || data.fallback || "I couldn't get an answer just now.";
    addMsg('bot', text); chatHistory.push({ role: 'model', text });
  } catch (e) {
    thinking.remove();
    addMsg('bot', "I'm offline right now (the AI key may not be set up yet). Try the Reference page, or ask your instructor!");
  }
}

/* ---------------- edit mode ---------------- */
let editing = false;
function toggleEdit(on) {
  editing = on ?? !editing;
  document.body.classList.toggle('editing', editing);
  $('#edit-banner').style.display = editing ? 'flex' : 'none';
  if (editing) makeEditable(document); else { $('#edit-toolbar').classList.remove('show'); render(); }
}
function makeEditable(root) {
  $$('[data-region]', root).forEach((r) => {
    r.setAttribute('contenteditable', 'true');
    r.addEventListener('focus', showToolbar);
    r.addEventListener('blur', () => saveOverride(r.dataset.region, r.innerHTML));
  });
}
function showToolbar(e) {
  const tb = $('#edit-toolbar'); tb.classList.add('show');
  const rect = e.target.getBoundingClientRect();
  tb.style.top = Math.max(8, rect.top - 46) + 'px';
  tb.style.left = rect.left + 'px';
}
function exec(cmd, val = null) { document.execCommand(cmd, false, val); }

/* ---------------- gate ---------------- */
async function checkGate() {
  const gate = $('#gate');
  try {
    const res = await fetch('/api/gate', { method: 'GET' });
    // Only an explicit { open:false } from a live backend shows the gate.
    // A 404/500 (no function, e.g. running locally) means nothing to gate → open.
    const d = res.ok ? await res.json() : { open: true };
    if (d.open) { gate.style.display = 'none'; return; }
    showGate();
  } catch {
    // No server (running locally) → nothing to gate, just open.
    gate.style.display = 'none';
  }
}
function showGate() {
  const gate = $('#gate'); gate.style.display = 'grid';
  const form = $('#gate-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const pw = $('#gate-pw').value; const remember = $('#gate-remember').checked;
    $('#gate-err').textContent = '';
    try {
      const res = await fetch('/api/gate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw, remember }),
      });
      if (res.ok) gate.style.display = 'none';
      else $('#gate-err').textContent = 'That code didn\'t work — try again.';
    } catch { $('#gate-err').textContent = 'Something went wrong. Try again.'; }
  }, { once: false });
}

/* ---------------- panels ---------------- */
function openPanel(sel) { $(sel).classList.add('open'); $('#dim').classList.add('show'); }
function closePanels() { $$('.panel').forEach((p) => p.classList.remove('open')); $('#dim').classList.remove('show'); }

/* ---------------- boot ---------------- */
async function boot() {
  // Supabase (optional)
  if (SUPABASE.url && SUPABASE.anonKey && window.supabase) {
    sb = window.supabase.createClient(SUPABASE.url, SUPABASE.anonKey);
    const { data } = await sb.auth.getSession();
    instructorSession = !!data?.session && (!INSTRUCTOR_EMAIL || data.session.user.email === INSTRUCTOR_EMAIL);
  }

  $$('[data-mascot]').forEach((e) => (e.innerHTML = mascot()));
  applySettings();
  renderNav();
  await loadOverrides();
  render();
  buildSettingsPanel();
  buildChat();
  checkGate();

  // events
  window.addEventListener('hashchange', render);
  $('#menu-toggle').addEventListener('click', () => $('#nav').classList.toggle('open'));
  $('#btn-settings').addEventListener('click', () => openPanel('#settings-panel'));
  $('#btn-notes').addEventListener('click', () => { renderNotes(); openPanel('#notes-panel'); });
  $('#btn-assistant').addEventListener('click', () => $('#chat-panel').classList.toggle('open'));
  $('#chat-close').addEventListener('click', () => $('#chat-panel').classList.remove('open'));
  $('#new-note').addEventListener('click', newNote);
  $('#dim').addEventListener('click', closePanels);
  $$('.panel-close').forEach((b) => b.addEventListener('click', closePanels));
  $('#chat-send').addEventListener('click', sendChat);
  $('#chat-text').addEventListener('keydown', (e) => { if (e.key === 'Enter') sendChat(); });
  $('#btn-edit').addEventListener('click', () => toggleEdit());
  $('#edit-done').addEventListener('click', () => toggleEdit(false));
  $$('#edit-toolbar [data-cmd]').forEach((b) => b.addEventListener('mousedown', (e) => {
    e.preventDefault();
    if (b.dataset.cmd === 'color') exec('foreColor', b.dataset.val);
    else if (b.dataset.cmd === 'size') exec('fontSize', b.dataset.val);
    else exec(b.dataset.cmd);
  }));
}

/* ---------------- status notice ---------------- */
let noticeTimer;
function showNotice(text) {
  const n = $('#notice'); n.textContent = text; n.classList.add('show');
  clearTimeout(noticeTimer); noticeTimer = setTimeout(() => n.classList.remove('show'), 5000);
}

document.addEventListener('DOMContentLoaded', boot);

// expose mascot for index.html inline use
window.__mascot = mascot;
export { mascot };
