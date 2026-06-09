// app.mjs — ClaudeClass hub engine (vanilla ESM, no build step).
import { CONTENT, REFERENCE, NAV_ORDER, COURSE, ROSTER, COHORT_SIZE } from './content.mjs';
import { SUPABASE } from './config.mjs';

/* ---------------- tiny helpers ---------------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const el = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
const LS = {
  get: (k, d) => { try { return JSON.parse(localStorage.getItem('cc:' + k)) ?? d; } catch { return d; } },
  set: (k, v) => localStorage.setItem('cc:' + k, JSON.stringify(v)),
  del: (k) => localStorage.removeItem('cc:' + k),
};

/* ---------------- pixel Claude mascot ---------------- */
const MASCOT_MAP = [
  '..##########..',
  '..##########..',
  '..##.####.##..',
  '..##.####.##..',
  '..##########..',
  '##############',
  '..##########..',
  '..##########..',
  '..##########..',
  '...#.#..#.#...',
  '...#.#..#.#...',
];
function mascot(cls = '') {
  let rects = '';
  MASCOT_MAP.forEach((row, y) => [...row].forEach((c, x) => {
    if (c === '#') rects += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
  }));
  return `<svg class="${cls}" viewBox="0 0 14 11" fill="currentColor" shape-rendering="crispEdges" aria-hidden="true">${rects}</svg>`;
}

/* ---------------- content model ---------------- */
// Seed map: region key -> seeded html
const SEED = {};
for (const page of Object.values(CONTENT)) for (const s of page.sections) SEED[s.key] = s.html;

let overrides = {}; // key -> edited html (from Supabase or localStorage)
let sb = null;      // supabase client for READS (publishable key)

const html = (key) => overrides[key] ?? SEED[key] ?? '';

async function loadOverrides() {
  if (sb) {
    try {
      const { data, error } = await sb.from('hub_content').select('key,html');
      if (error) throw error;
      overrides = {}; (data || []).forEach((r) => (overrides[r.key] = r.html));
      LS.set('content', overrides); // cache for offline
      return;
    } catch (e) {
      console.warn('Supabase load failed, using cached/seed content', e);
      showNotice('Showing the last saved copy (offline).');
    }
  }
  overrides = LS.get('content', {}); // cache or local edits
}

async function saveOverride(key, value) {
  overrides[key] = value;
  // Save through the secure function (gated by EDIT_PASSWORD, writes with the secret key).
  try {
    const res = await fetch('/api/save', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, html: value }),
    });
    if (res.ok) { LS.set('content', overrides); return; }
    throw new Error('save status ' + res.status);
  } catch (e) {
    // No backend (local) or cloud not configured → keep a local copy so nothing is lost.
    LS.set('content', overrides);
    showNotice('Saved on this device (cloud save not available).');
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

// A page is locked if it has an `unlock` date in the future — unless edit mode is on.
function isLocked(id) {
  const p = CONTENT[id];
  if (!p || !p.unlock || editing) return false;
  return Date.now() < new Date(p.unlock).getTime();
}
function unlockLabel(iso) {
  return new Date(iso).toLocaleString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
    timeZone: 'America/New_York', timeZoneName: 'short',
  });
}

function render() {
  const id = currentPage();
  const page = CONTENT[id];
  $$('#nav a').forEach((a) => {
    a.classList.toggle('active', a.dataset.page === id);
    a.classList.toggle('locked', isLocked(a.dataset.page));
  });
  $('#nav').classList.remove('open');

  const main = $('#main');

  if (isLocked(id)) {
    main.innerHTML = `
      <header class="page-head">
        <div class="eyebrow">${page.nav}</div>
        <h1>${page.title}</h1>
      </header>
      <div class="sheet reveal locked-card">
        <div class="lock-emoji">🔒</div>
        <h3>This unlocks soon</h3>
        <p>Opens <strong>${unlockLabel(page.unlock)}</strong>.</p>
        <p class="hint">In the meantime, dive into what's open — <a href="#/setup">Setup</a> and <a href="#/overview">Overview</a> — or ask the Claude helper anything.</p>
      </div>`;
    window.scrollTo({ top: 0, behavior: 'auto' });
    return;
  }

  main.innerHTML = `
    <header class="page-head">
      <div class="eyebrow">${id === 'overview' ? 'ClaudeClass' : page.nav}</div>
      <h1>${page.title}</h1>
    </header>
    <div class="sheet reveal">
      ${page.sections.map((s) => `<div class="region" data-region="${s.key}">${html(s.key)}</div>`).join('')}
    </div>`;

  // A failing enhancement must never brick navigation — content is already shown.
  try { enhance(main, id); } catch (e) { console.error('enhance failed:', e); }
  window.scrollTo({ top: 0, behavior: 'auto' });
}

/* ---------------- per-render enhancements ---------------- */
function enhance(root, pageId) {
  // copy buttons on command blocks
  $$('.cmd', root).forEach(addCopyBtn);

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
        const items = $$('li', list);
        if (items.length && items.every((x) => x.classList.contains('checked'))) celebrate(list);
      });
    });
  });

  // reference page: inject search + grouped list
  if (pageId === 'reference') buildReference(root);

  // cohorts page: dynamic board + dice reshuffle
  if (pageId === 'cohorts') buildCohorts(root);

  // showcase page: submit + gallery of class projects
  if (pageId === 'showcase') buildShowcase(root);

  // overview: progress stepper
  if (pageId === 'overview') buildProgress(root);

  // setup: interactive wizard on top; collapse the written steps below the intro
  if (pageId === 'setup') { buildWizard(root); if (!editing) collapseSetup(root); }

  // hover-to-define jargon (view mode only, so it never gets saved into content)
  if (!editing && pageId !== 'reference') glossarize($('.sheet', root));

  // "Ask Claude about this" button on each content heading (view mode only)
  if (!editing) addAskButtons(root);

  if (editing) makeEditable(root);
}

/* ---------------- "Ask Claude about this" ---------------- */
function openChatWith(question) {
  $('#mascot-tip')?.classList.remove('show');
  $('#chat-panel').classList.add('open');
  const input = $('#chat-text');
  input.value = question;
  sendChat();
}
function addAskButtons(root) {
  $$('.region h3', root).forEach((h) => {
    if (h.querySelector('.ask-btn')) return;
    const topic = h.textContent.replace(/\s+/g, ' ').trim();
    const b = el(`<button class="ask-btn" type="button" title="Ask Claude about this">ask Claude</button>`);
    b.addEventListener('click', () => openChatWith(`In simple, beginner-friendly terms, explain: "${topic}"`));
    h.appendChild(b);
  });
}

/* ---------------- shared copy button ---------------- */
function addCopyBtn(pre) {
  if (pre.querySelector('.copy-btn')) return;
  const btn = el(`<button class="copy-btn" type="button">copy</button>`);
  btn.addEventListener('click', () => {
    navigator.clipboard.writeText(pre.querySelector('code').innerText.trim());
    btn.textContent = 'copied!'; btn.classList.add('done');
    setTimeout(() => { btn.textContent = 'copy'; btn.classList.remove('done'); }, 1400);
  });
  pre.appendChild(btn);
}

/* ---------------- setup wizard (Gemini-guided) ---------------- */
const WIZ = {
  mac: {
    os: 'Mac', shell: 'Terminal',
    steps: [
      { title: 'Open Terminal', body: 'Press <kbd>Cmd</kbd>+<kbd>Space</kbd>, type "Terminal", and press Enter.' },
      { title: 'Install Claude Code', body: 'Paste this and press Enter. <strong>No admin password needed</strong> — it installs into your own account. <em>You do not need to type "zsh" first</em> (your Terminal already uses zsh), and <strong>don\'t use "sudo".</strong> If something pops up asking for an admin password, you can cancel it — this installer never needs one.', cmd: 'curl -fsSL https://claude.ai/install.sh | bash' },
      { title: 'Start it up', body: 'Launch Claude Code by typing:', cmd: 'claude' },
      { title: "Didn't start? Point your Mac to it (no admin)", body: 'If you saw the Claude welcome screen, tap "It worked" to skip this. If it said <strong>"command not found"</strong>, Claude installed into a hidden folder in your account (<code>~/.local/bin</code>), and your Terminal — which uses <em>zsh</em> — just needs to be told where. No admin password needed. Paste <strong>both</strong> lines, then type <code>claude</code> again:', cmd: `echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc\nsource ~/.zshrc` },
      { title: 'Trust the folder & log in', body: 'Choose <strong>"Yes, I trust this folder"</strong> and press Enter, then log in with your Claude account in the browser window that opens.' },
      { title: 'Check it worked', body: 'Confirm the install — you should see a version number:', cmd: 'claude --version' },
    ],
  },
  pc: {
    os: 'Windows PC', shell: 'PowerShell',
    steps: [
      { title: 'Open PowerShell', body: 'Click Start, type "PowerShell", press Enter. (Not the black "CMD" window.)' },
      { title: 'Install Claude Code', body: 'Paste this and press Enter. No admin password needed.', cmd: 'irm https://claude.ai/install.ps1 | iex' },
      { title: 'Start it up', body: 'Launch Claude Code by typing:', cmd: 'claude' },
      { title: "Didn't start? Add it to your PATH (no admin)", body: 'If you saw the Claude welcome screen, tap "It worked" to skip this. If it said <strong>"not recognized"</strong>, Claude installed into a hidden folder in your account (<code>C:\\Users\\you\\.local\\bin</code>). Add it to your <em>personal</em> PATH — no admin needed — then <strong>close &amp; reopen PowerShell</strong> and type <code>claude</code> again:', cmd: `[Environment]::SetEnvironmentVariable("PATH", "$env:PATH;$env:USERPROFILE\\.local\\bin", "User")` },
      { title: 'Trust the folder & log in', body: 'Choose <strong>"Yes, I trust this folder"</strong> and press Enter, then log in with your Claude account in the browser window that opens.' },
      { title: 'Check it worked', body: 'Confirm the install — you should see a version number:', cmd: 'claude --version' },
    ],
  },
};

function buildWizard(root) {
  const sheet = $('.sheet', root); if (!sheet) return;
  const wrap = el(`<div class="wizard"></div>`);
  sheet.insertBefore(wrap, sheet.firstChild);
  const state = LS.get('wizard', { os: null, step: 0 });
  let shot = null;
  const save = () => LS.set('wizard', { os: state.os, step: state.step });

  async function ask(text, image, outEl) {
    outEl.innerHTML = `<p class="wiz-thinking">Claude is looking…</p>`;
    const cfg = WIZ[state.os]; const step = cfg && cfg.steps[state.step];
    const prompt = `I'm a beginner installing Claude Code on ${cfg ? cfg.os : 'my computer'}. I'm on this step: "${step ? step.title : ''}". ${text ? 'My problem: ' + text : 'I attached a screenshot of my screen.'} Tell me in simple steps what is wrong and exactly what to do next.`;
    try {
      const res = await fetch('/api/ask', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', text: prompt }], page: 'setup', image: image ? { data: image.base64, mimeType: image.mimeType } : undefined }),
      });
      const data = await res.json();
      outEl.textContent = data.text || "I couldn't read that — try describing what you see.";
    } catch { outEl.textContent = "I'm having trouble connecting right now. Try office hours or your instructor."; }
  }

  function renderPick() {
    wrap.innerHTML = `
      <div class="wiz-head"><span class="wiz-badge">Setup Wizard</span></div>
      <h3>Let's get you installed</h3>
      <p class="hint">I'll walk you through it one step at a time — and if you get stuck, show me a screenshot.</p>
      <p><strong>First — which computer are you on?</strong></p>
      <div class="wiz-os">
        <button class="wiz-osbtn" data-os="mac">🍎<span>Mac</span></button>
        <button class="wiz-osbtn" data-os="pc">🪟<span>Windows PC</span></button>
      </div>`;
    wrap.querySelectorAll('.wiz-osbtn').forEach((b) => (b.onclick = () => { state.os = b.dataset.os; state.step = 0; save(); renderStep(); }));
  }

  function renderDone() {
    wrap.innerHTML = `
      <div class="wiz-head"><span class="wiz-badge">All done</span></div>
      <h3>🎉 You're set up!</h3>
      <p>Claude Code is installed and you're logged in. That's the hard part — nice work.</p>
      <div class="wiz-actions"><button class="btn ghost" id="wiz-restart">Start over</button><a class="btn" href="#/class1">Go to Class 1 →</a></div>`;
    $('#wiz-restart', wrap).onclick = () => { state.os = null; state.step = 0; save(); renderPick(); };
    celebrate(wrap, "🎉 Claude Code installed — you're ready for class!");
  }

  function renderStep() {
    const cfg = WIZ[state.os]; if (!cfg) return renderPick();
    const n = cfg.steps.length;
    if (state.step >= n) return renderDone();
    const i = state.step; const step = cfg.steps[i]; shot = null;
    wrap.innerHTML = `
      <div class="wiz-head">
        <span class="wiz-badge">${cfg.os} · ${cfg.shell}</span>
        <div class="wiz-progress">${cfg.steps.map((s, k) => `<span class="wiz-dot ${k < i ? 'done' : ''} ${k === i ? 'now' : ''}"></span>`).join('')}</div>
      </div>
      <h3>Step ${i + 1} of ${n}: ${step.title}</h3>
      <p>${step.body}</p>
      ${step.cmd ? `<pre class="cmd"><code>${step.cmd}</code></pre>` : ''}
      <div class="wiz-actions">
        ${i > 0 ? `<button class="btn ghost" id="wiz-back">← Back</button>` : ''}
        <button class="btn" id="wiz-next">${i === n - 1 ? 'It worked — finish 🎉' : 'It worked →'}</button>
        <button class="btn ghost" id="wiz-stuck">I'm stuck 🆘</button>
      </div>
      <div class="wiz-help" id="wiz-help" hidden>
        <p class="hint">Tell Claude what happened, or upload a screenshot of your screen:</p>
        <div class="wiz-help-row">
          <button class="chat-attach" id="wiz-attach" title="Attach a screenshot" type="button">📎</button>
          <input type="file" id="wiz-file" accept="image/*" hidden />
          <input type="text" id="wiz-msg" placeholder="e.g. it says command not found" />
          <button class="btn" id="wiz-send" type="button">Ask</button>
        </div>
        <div class="wiz-preview" id="wiz-preview"></div>
        <div class="wiz-answer" id="wiz-answer"></div>
      </div>`;
    $$('.cmd', wrap).forEach(addCopyBtn);
    if (i > 0) $('#wiz-back', wrap).onclick = () => { state.step--; save(); renderStep(); };
    $('#wiz-next', wrap).onclick = () => { state.step++; save(); renderStep(); };
    $('#wiz-stuck', wrap).onclick = () => { const h = $('#wiz-help', wrap); h.hidden = !h.hidden; };
    $('#wiz-attach', wrap).onclick = () => $('#wiz-file', wrap).click();
    $('#wiz-file', wrap).onchange = async (e) => {
      const f = e.target.files[0]; if (!f) return;
      try { shot = await processImage(f); $('#wiz-preview', wrap).innerHTML = `<img src="${shot.dataUrl}" alt="attachment">`; } catch { showNotice('Could not read that image.'); }
      e.target.value = '';
    };
    $('#wiz-send', wrap).onclick = () => {
      const msg = $('#wiz-msg', wrap).value.trim();
      if (!msg && !shot) { $('#wiz-answer', wrap).textContent = 'Type what happened or attach a screenshot first.'; return; }
      ask(msg, shot, $('#wiz-answer', wrap));
    };
  }

  // Always start by asking Mac or PC.
  state.os = null; state.step = 0;
  renderPick();
}

/* ---------------- collapse the written setup steps ---------------- */
function collapseSetup(root) {
  const sheet = $('.sheet', root); if (!sheet) return;
  const regions = $$('.region', sheet);
  if (regions.length < 2) return; // keep the intro (no-admin box) visible
  const details = el(`<details class="full-steps"><summary>📖 Prefer written steps? Open the full guide</summary><div class="full-steps-body"></div></details>`);
  const body = $('.full-steps-body', details);
  regions.slice(1).forEach((r) => body.appendChild(r));
  sheet.appendChild(details);
}

/* ---------------- progress stepper (overview) ---------------- */
function checklistInfo(pageId) {
  const page = CONTENT[pageId]; if (!page) return null;
  for (const s of page.sections) {
    const m = s.html.match(/data-checklist="([^"]+)"/);
    if (m) {
      const total = (s.html.match(/<li/g) || []).length;
      const state = LS.get('check:' + m[1], {});
      const done = Object.values(state).filter(Boolean).length;
      return { total, done };
    }
  }
  return null;
}
function buildProgress(root) {
  const sheet = $('.sheet', root); if (!sheet) return;
  const steps = [{ id: 'setup', label: 'Setup' }, ...['class1', 'class2', 'class3'].map((id) => ({ id, label: CONTENT[id].nav }))];
  let next = null;
  const rows = steps.map((s) => {
    let state = 'open', sub = 'Open';
    if (s.id === 'setup') { sub = 'Get ready'; }
    else if (isLocked(s.id)) { state = 'locked'; sub = 'Locked'; }
    else { const info = checklistInfo(s.id); if (info && info.total) { if (info.done >= info.total) { state = 'done'; sub = 'Done ✓'; } else sub = `${info.done}/${info.total}`; } }
    if (!next && state !== 'done' && state !== 'locked') next = s;
    return { s, state, sub };
  });
  if (next) rows.forEach((r) => { if (r.s.id === next.id) r.state = (r.state === 'done' ? r.state : 'next'); });
  const block = el(`
    <div class="progress">
      <div class="progress-steps">
        ${rows.map((r) => `<a class="pstep ${r.state}" href="#/${r.s.id}"><span class="plabel">${r.s.label}</span><span class="psub">${r.sub}</span></a>`).join('')}
      </div>
      ${next ? `<a class="btn next-cta" href="#/${next.id}">Continue → ${next.label}</a>` : `<p class="hint">🎉 You've finished everything that's open — nice work!</p>`}
    </div>`);
  sheet.insertBefore(block, sheet.firstChild);
}

/* ---------------- hover-to-define glossary ---------------- */
function glossarize(rootEl) {
  if (!rootEl) return;
  const remaining = new Map();
  for (const r of REFERENCE) { const t = r.term.toLowerCase(); if (/^[a-z]+$/.test(t)) remaining.set(t, r.def); }
  if (!remaining.size) return;
  const skip = new Set(['PRE', 'CODE', 'A', 'BUTTON', 'H1', 'H2', 'H3', 'SUMMARY', 'KBD', 'TEXTAREA', 'INPUT']);
  const walker = document.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      let p = node.parentElement;
      while (p && p !== rootEl) { if (skip.has(p.tagName) || p.classList.contains('gloss') || p.classList.contains('wizard')) return NodeFilter.FILTER_REJECT; p = p.parentElement; }
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  const nodes = []; let n; while ((n = walker.nextNode())) nodes.push(n);
  for (const tn of nodes) {
    if (!remaining.size) break;
    for (const [term, def] of remaining) {
      const re = new RegExp(`\\b(${term})\\b`, 'i');
      const m = re.exec(tn.nodeValue);
      if (!m) continue;
      const before = tn.nodeValue.slice(0, m.index);
      const after = tn.nodeValue.slice(m.index + m[0].length);
      const span = document.createElement('span');
      span.className = 'gloss'; span.tabIndex = 0; span.textContent = m[0];
      const pop = document.createElement('span'); pop.className = 'gloss-pop'; pop.textContent = def;
      span.appendChild(pop);
      const frag = document.createDocumentFragment();
      if (before) frag.appendChild(document.createTextNode(before));
      frag.appendChild(span);
      if (after) frag.appendChild(document.createTextNode(after));
      tn.parentNode.replaceChild(frag, tn);
      remaining.delete(term);
      break;
    }
  }
}

/* ---------------- cohorts + dice ---------------- */
function shuffle(arr) { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
// Number of teams: aim for ~COHORT_SIZE per team, but keep teams balanced.
const NUM_COHORTS = Math.max(1, Math.floor(ROSTER.length / COHORT_SIZE)); // 18 → 4 teams (5,5,4,4)
function splitInto(arr, n) {
  const out = Array.from({ length: n }, () => []);
  arr.forEach((x, i) => out[i % n].push(x)); // round-robin → sizes differ by at most 1
  return out;
}

function buildCohorts(root) {
  const sheet = $('.sheet', root);
  const wrap = el(`
    <div class="cohort-wrap">
      <div id="cohort-board" class="cohorts"></div>
      <p class="hint" style="margin:.8rem 0 0">👑 = your cohort captain (the top name on each team).</p>
      <div class="dice-wrap">
        <button class="btn" id="dice" title="Draw new teams"><span class="die">🎲</span> Reshuffle cohorts</button>
        <p class="hint" style="margin:.5rem 0 0">Saved in this browser. (Project it on screen to draw teams live.)</p>
      </div>
    </div>`);
  sheet.appendChild(wrap);
  const board = $('#cohort-board', wrap);

  const draw = (groups) => {
    board.innerHTML = groups.map((g, i) => `
      <div class="cohort-card" data-c="${i + 1}">
        <h3>Cohort ${i + 1}</h3>
        <ul>${g.map((n, idx) => idx === 0
          ? `<li class="captain" title="Cohort captain">👑 ${n}</li>`
          : `<li>${n}</li>`).join('')}</ul>
      </div>`).join('');
  };

  let groups = LS.get('cohorts', null);
  // Regenerate if there's no saved draw, or the roster/team count changed (e.g. old 5-team cache).
  if (!groups || groups.length !== NUM_COHORTS || groups.flat().length !== ROSTER.length) {
    groups = splitInto(ROSTER, NUM_COHORTS);
  }
  draw(groups);

  $('#dice', wrap).addEventListener('click', () => {
    groups = splitInto(shuffle(ROSTER), NUM_COHORTS);
    LS.set('cohorts', groups);
    draw(groups);
    board.classList.remove('rolled'); void board.offsetWidth; board.classList.add('rolled');
    const die = $('#dice .die', wrap); die.classList.remove('spin'); void die.offsetWidth; die.classList.add('spin');
  });
}

/* ---------------- delight + personality ---------------- */
function motionOn() { return document.documentElement.dataset.motion !== 'off'; }

function celebrate(anchor, message) {
  showNotice(message || '🎉 Crew goal complete — nice work!');
  if (!motionOn()) return;
  const emojis = ['🎉', '✨', '🧡', '⭐', '🟠', '🎊', '💥', '🟧'];
  const N = 70;
  for (let i = 0; i < N; i++) {
    const s = document.createElement('span');
    s.className = 'confetti';
    s.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    s.style.left = (Math.random() * 100) + 'vw';
    s.style.fontSize = (0.9 + Math.random() * 1.5) + 'rem';
    s.style.animationDelay = (Math.random() * 0.7) + 's';
    s.style.animationDuration = (1.8 + Math.random() * 1.6) + 's';
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 3600);
  }
}

const TIPS = [
  "Tip: you can't break anything — that's what git is for!",
  'Stuck on a word? The <strong>Reference</strong> explains everything in plain English.',
  "Don't know how to ask? Just describe what you want — I'll help shape the prompt.",
  'Best way to learn: try it, see what happens, tweak, repeat.',
  "Don't memorize commands — copy-paste them from the cheat-sheets.",
  "Lost? Tap me anytime — I know this whole class.",
];
function showMascotTip() {
  const tip = $('#mascot-tip');
  $('#tip-text').innerHTML = TIPS[Math.floor(Math.random() * TIPS.length)];
  tip.classList.add('show');
  const hide = () => tip.classList.remove('show');
  $('#tip-x').onclick = hide;
  clearTimeout(showMascotTip._t);
  showMascotTip._t = setTimeout(hide, 9000);
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
  if (!chatHistory.length) addMsg('bot', "Hi, I'm Claude — your class helper. Ask me anything: a word you don't get, what a command does, or just what to try next!");
}
function addMsg(role, text, cls = '') {
  const log = $('#chat-log');
  const m = el(`<div class="msg ${role} ${cls}"></div>`); m.textContent = text;
  log.appendChild(m); log.scrollTop = log.scrollHeight; return m;
}
let pendingImage = null; // { dataUrl, base64, mimeType }
function clearPending() { pendingImage = null; $('#chat-preview').innerHTML = ''; }
function showPreview() {
  $('#chat-preview').innerHTML = `<div class="att"><img src="${pendingImage.dataUrl}" alt="attachment"><button id="att-x" aria-label="Remove">×</button></div>`;
  $('#att-x').onclick = clearPending;
}
function processImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 1100; let w = img.width, h = img.height;
        if (w > max || h > max) { const r = Math.min(max / w, max / h); w = Math.round(w * r); h = Math.round(h * r); }
        const c = document.createElement('canvas'); c.width = w; c.height = h;
        c.getContext('2d').drawImage(img, 0, 0, w, h);
        const dataUrl = c.toDataURL('image/jpeg', 0.82);
        resolve({ dataUrl, base64: dataUrl.split(',')[1], mimeType: 'image/jpeg' });
      };
      img.onerror = reject; img.src = reader.result;
    };
    reader.onerror = reject; reader.readAsDataURL(file);
  });
}

async function sendChat() {
  const input = $('#chat-text'); const q = input.value.trim();
  if (!q && !pendingImage) return;
  input.value = '';
  const userMsg = addMsg('user', q || '📷 (screenshot)');
  if (pendingImage) { const im = document.createElement('img'); im.src = pendingImage.dataUrl; im.className = 'msg-img'; userMsg.appendChild(im); }
  chatHistory.push({ role: 'user', text: q || "Here's a screenshot of my screen — what's happening and how do I fix it?" });
  $('#chat-suggest').style.display = 'none';
  const imageToSend = pendingImage; clearPending();
  const thinking = addMsg('bot', 'Claude is thinking…', 'thinking');
  try {
    const res = await fetch('/api/ask', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: chatHistory.slice(-10), page: currentPage(), image: imageToSend ? { data: imageToSend.base64, mimeType: imageToSend.mimeType } : undefined }),
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
async function ensureEditAuth() {
  try {
    const res = await fetch('/api/edit', { method: 'GET' });
    if (!res.ok) return true; // no backend (running locally) → allow
    if ((await res.json()).allowed) return true;
  } catch {
    return true; // local / offline → allow
  }
  // Need the password — show the in-hub panel (no browser popup).
  return new Promise((resolve) => {
    const modal = $('#edit-gate'), form = $('#edit-gate-form');
    const input = $('#edit-pw'), err = $('#edit-gate-err');
    err.textContent = ''; input.value = '';
    modal.style.display = 'grid';
    setTimeout(() => input.focus(), 60);
    const close = (val) => { modal.style.display = 'none'; form.onsubmit = null; $('#edit-gate-cancel').onclick = null; resolve(val); };
    form.onsubmit = async (e) => {
      e.preventDefault(); err.textContent = '';
      try {
        const p = await fetch('/api/edit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: input.value }) });
        if (p.ok && (await p.json()).allowed) return close(true);
        err.textContent = "That password didn't work.";
      } catch { err.textContent = 'Something went wrong — try again.'; }
    };
    $('#edit-gate-cancel').onclick = () => close(false);
  });
}
function toggleEdit(on) {
  editing = on ?? !editing;
  document.body.classList.toggle('editing', editing);
  $('#edit-banner').style.display = editing ? 'flex' : 'none';
  $('#edit-toolbar').classList.remove('show');
  render(); // re-render so locked sections appear in edit mode (and re-lock on exit)
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
// Add a new checklist item: append an <li> to the nearest homework list (or start one).
function addChecklistItem() {
  const sel = window.getSelection(); if (!sel.rangeCount) { exec('insertHTML', '<ul class="todo"><li>New task</li></ul>'); return; }
  let node = sel.anchorNode;
  let ul = node && (node.nodeType === 1 ? node : node.parentElement);
  while (ul && !(ul.tagName === 'UL' && ul.classList.contains('todo'))) ul = ul.parentElement;
  if (ul) {
    const li = document.createElement('li'); li.textContent = 'New task';
    ul.appendChild(li);
    const r = document.createRange(); r.selectNodeContents(li); sel.removeAllRanges(); sel.addRange(r);
  } else {
    exec('insertHTML', '<ul class="todo"><li>New task</li></ul>');
  }
}

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

/* ---------------- showcase (class project gallery) ---------------- */
async function buildShowcase(root) {
  const sheet = $('.sheet', root); if (!sheet) return;
  const wrap = el(`
    <div class="showcase-wrap">
      <form class="showcase-form" id="sc-form">
        <input type="text" id="sc-name" placeholder="Your name" maxlength="60" autocomplete="off" />
        <input type="text" id="sc-title" placeholder="What is it? (optional)" maxlength="100" autocomplete="off" />
        <input type="url" id="sc-url" placeholder="https://… your GitHub Pages or Vercel link" autocomplete="off" />
        <button class="btn" type="submit">Add mine</button>
      </form>
      <div class="sc-msg" id="sc-msg"></div>
      <div class="showcase-grid" id="sc-grid"><p class="hint">Loading projects…</p></div>
    </div>`);
  sheet.appendChild(wrap);
  const grid = $('#sc-grid', wrap);

  const load = async () => {
    if (!sb) { grid.innerHTML = `<p class="hint">The showcase turns on once the class database is connected.</p>`; return; }
    try {
      const { data, error } = await sb.from('showcase').select('name,title,url,created_at').order('created_at', { ascending: false }).limit(200);
      if (error) throw error;
      if (!data || !data.length) { grid.innerHTML = `<p class="hint">No projects yet — be the first! 🚀</p>`; return; }
      grid.innerHTML = data.map((d) => {
        const safe = /^https?:\/\//.test(d.url) ? d.url : '#';
        return `<a class="sc-card" href="${escapeHtml(safe)}" target="_blank" rel="noopener">
          <span class="sc-title">${escapeHtml(d.title || 'My project')}</span>
          <span class="sc-by">by ${escapeHtml(d.name)}</span>
          <span class="sc-link">${escapeHtml(d.url.replace(/^https?:\/\//, ''))} ↗</span>
        </a>`;
      }).join('');
    } catch { grid.innerHTML = `<p class="hint">Couldn't load projects right now — try again in a moment.</p>`; }
  };
  load();

  $('#sc-form', wrap).addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = $('#sc-msg', wrap);
    const name = $('#sc-name', wrap).value.trim();
    const title = $('#sc-title', wrap).value.trim();
    const url = $('#sc-url', wrap).value.trim();
    if (!name || !url) { msg.textContent = 'Add your name and a link.'; return; }
    msg.textContent = 'Adding…';
    try {
      const res = await fetch('/api/showcase', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, title, url }) });
      const d = await res.json().catch(() => ({}));
      if (res.ok) {
        msg.textContent = '';
        $('#sc-name', wrap).value = ''; $('#sc-title', wrap).value = ''; $('#sc-url', wrap).value = '';
        await load(); celebrate(wrap, '🎉 Added to the showcase!');
      } else msg.textContent = d.error || 'Could not add — try again.';
    } catch { msg.textContent = "Couldn't connect — try again."; }
  });
}

/* ---------------- global search ---------------- */
function stripText(s) { return s.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim(); }
const SEARCH_INDEX = (() => {
  const idx = [];
  for (const id of Object.keys(CONTENT)) {
    const p = CONTENT[id];
    const raw = p.sections.map((s) => stripText(s.html)).join(' ');
    idx.push({ id, title: p.title, nav: p.nav, raw, text: (p.title + ' ' + p.nav + ' ' + raw).toLowerCase() });
  }
  for (const r of REFERENCE) {
    idx.push({ id: 'reference', title: r.term, nav: 'Reference', raw: r.def, text: (r.term + ' ' + r.def + ' ' + (r.meta || '')).toLowerCase() });
  }
  return idx;
})();
function searchRender(q) {
  const term = q.toLowerCase().trim();
  const out = $('#search-results');
  if (!term) { out.innerHTML = `<p class="hint" style="padding:1rem">Type to search pages, concepts, and commands.</p>`; return; }
  const hits = SEARCH_INDEX.filter((e) => e.text.includes(term)).slice(0, 25);
  if (!hits.length) { out.innerHTML = `<p class="hint" style="padding:1rem">No matches for "${escapeHtml(q)}". Try a simpler word — or ask Claude.</p>`; return; }
  out.innerHTML = hits.map((h) => {
    const i = h.raw.toLowerCase().indexOf(term);
    let snip = h.raw.slice(0, 90);
    if (i > -1) { const s = Math.max(0, i - 30); snip = (s > 0 ? '…' : '') + h.raw.slice(s, i + term.length + 55); }
    return `<a class="search-hit" href="#/${h.id}"><span class="sh-title">${escapeHtml(h.title)}</span> <span class="sh-nav">${h.nav}</span><span class="sh-snip">${escapeHtml(snip)}…</span></a>`;
  }).join('');
}
function openSearch() { const m = $('#search-modal'); m.style.display = 'flex'; const i = $('#search-input'); searchRender(i.value); setTimeout(() => i.focus(), 40); }
function closeSearch() { $('#search-modal').style.display = 'none'; }

/* ---------------- boot ---------------- */
async function boot() {
  // Supabase client for reads (publishable key, RLS public-read)
  if (SUPABASE.url && SUPABASE.anonKey && window.supabase) {
    sb = window.supabase.createClient(SUPABASE.url, SUPABASE.anonKey);
  }

  $$('[data-mascot]').forEach((e) => (e.innerHTML = mascot()));
  applySettings();
  renderNav();
  await loadOverrides();
  render();
  buildSettingsPanel();
  buildChat();
  checkGate();

  // Claude says hi once per session (only if the gate is already open)
  setTimeout(() => {
    if ($('#gate').style.display === 'none' && !sessionStorage.getItem('cc:tip')) {
      showMascotTip();
      sessionStorage.setItem('cc:tip', '1');
    }
  }, 2600);

  // events
  window.addEventListener('hashchange', render);
  $('#menu-toggle').addEventListener('click', () => $('#nav').classList.toggle('open'));
  $('#btn-settings').addEventListener('click', () => openPanel('#settings-panel'));
  $('#btn-search').addEventListener('click', openSearch);
  $('#search-close').addEventListener('click', closeSearch);
  $('#search-input').addEventListener('input', (e) => searchRender(e.target.value));
  $('#search-modal').addEventListener('click', (e) => { if (e.target.id === 'search-modal') closeSearch(); });
  $('#search-results').addEventListener('click', (e) => { if (e.target.closest('.search-hit')) closeSearch(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSearch();
    else if (e.key === '/' && !/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName) && !document.activeElement.isContentEditable) { e.preventDefault(); openSearch(); }
  });
  $('#btn-notes').addEventListener('click', () => { renderNotes(); openPanel('#notes-panel'); });
  $('#btn-assistant').addEventListener('click', () => { $('#mascot-tip').classList.remove('show'); $('#chat-panel').classList.toggle('open'); });
  $('#chat-close').addEventListener('click', () => $('#chat-panel').classList.remove('open'));
  $('#new-note').addEventListener('click', newNote);
  $('#dim').addEventListener('click', closePanels);
  $$('.panel-close').forEach((b) => b.addEventListener('click', closePanels));
  $('#chat-send').addEventListener('click', sendChat);
  $('#chat-text').addEventListener('keydown', (e) => { if (e.key === 'Enter') sendChat(); });
  $('#chat-attach').addEventListener('click', () => $('#chat-file').click());
  $('#chat-file').addEventListener('change', async (e) => {
    const f = e.target.files[0]; if (!f) return;
    try { pendingImage = await processImage(f); showPreview(); } catch { showNotice('Could not read that image.'); }
    e.target.value = '';
  });
  $('#btn-edit').addEventListener('click', async () => {
    if (editing) { toggleEdit(false); return; }
    if (await ensureEditAuth()) toggleEdit(true);
  });
  $('#edit-done').addEventListener('click', () => toggleEdit(false));
  $$('#edit-toolbar [data-cmd]').forEach((b) => b.addEventListener('mousedown', (e) => {
    e.preventDefault();
    const c = b.dataset.cmd;
    if (c === 'color') exec('foreColor', b.dataset.val);
    else if (c === 'size') exec('fontSize', b.dataset.val);
    else if (c === 'addtask') addChecklistItem();
    else if (c === 'createLink') { const url = prompt('Link address (https://…):'); if (url) exec('createLink', url); }
    else exec(c);
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
