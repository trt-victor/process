import { FLOWS, CASES, SIGNALS, GAMES, COLORS, CHALLENGES, PRINCIPLES, PILOT, BREAKOUT } from './content.js';
import * as L from './logic.js';

const KEY = 'reimagine-v2', CKEY = 'reimagine-cases', AKEY = 'reimagine-ai';
const blank = () => ({ mode: null, name: '', caseName: '', caseId: null, brief: '', quotes: [], probe: null, ev: {}, stage: 0, f: {}, notes: [], rows: {}, steps: [], focus: null, votes: {}, scenario: null, proto: '', chat: [], score: {} });
let S = blank();
try { S = { ...S, ...JSON.parse(localStorage.getItem(KEY)) }; } catch { /* corrupt or unavailable storage: start fresh */ }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch { /* private mode */ } };
const uid = () => Math.random().toString(36).slice(2, 9);
let AI = false, PROV = {}, activeZone = 'parking', timer = { left: 0, id: null }, chatOpen = true, home = false, live = [];
let custom = [];
try { custom = JSON.parse(localStorage.getItem(CKEY)) || []; } catch { /* no saved processes */ }

// Tiny DOM builder; text always goes in as text nodes, never as HTML.
function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'class') el.className = v;
    else if (k in el && k !== 'list') el[k] = v;
    else el.setAttribute(k, v);
  }
  el.append(...kids.flat(Infinity).filter((x) => x != null && x !== false));
  return el;
}
const $ = (id) => document.getElementById(id);
const flow = () => {
  const f = FLOWS[S.mode];
  if (!f || !PILOT.hidePrioritize) return f;
  // Hide the Prioritize stage for the pilot (its voting now lives on the Scenario tab); data is kept in content.js for future sessions.
  return { ...f, stages: f.stages.filter((s) => s.id !== 'prioritize') };
};
const stage = () => { const ss = flow().stages; return ss[Math.min(S.stage, ss.length - 1)]; };
const total = () => Object.values(S.score).reduce((a, b) => a + b, 0);

// Small hover tooltip: a circled i with an accessible label and an instant CSS bubble (native title as fallback).
const info = (tip) => (tip ? h('span', { class: 'info', tabindex: '0', role: 'note', 'aria-label': tip, 'data-tip': tip, title: tip }, 'ⓘ') : null);

// The dream-state rings adapt to the chosen process: [outer, middle, inner] audiences, by sector.
const DREAM_LEVELS = [
  [/public|grant|permit|municipal|ministry|government|licen/i, ['Society & oversight', 'Applicant / citizen', 'Agency team']],
  [/insur|claim/i, ['Market & regulator', 'Policyholder / claimant', 'Claims team']],
  [/customer|service|complaint/i, ['Market & brand', 'The customer', 'Service team']],
  [/people|hire|onboard|\bhr\b/i, ['Organisation & leadership', 'New hire / manager', 'HR team']],
  [/assur|audit/i, ['Audit committee & regulator', 'The client', 'Engagement team']],
  [/finance|report|close|record-to-report|purchase|pay|cash|order|bill/i, ['Customers & partners', 'Internal / direct client', 'Finance / ops team']],
];
function dreamLabels() {
  const c = allCases().find((x) => x.id === S.caseId);
  const hay = `${c?.sub || ''} ${c?.name || ''} ${S.caseName || ''}`.toLowerCase();
  return (DREAM_LEVELS.find(([re]) => re.test(hay)) || [, ['External / stakeholder client', 'Internal / direct client', 'Internal']])[1];
}

// Extra controls appended inside specific Present Back zones.
function zoneExtra(z) {
  if (z.id === 'p_principles') return h('details', { class: 'picker' }, h('summary', {}, 'Choose from common design principles'),
    h('div', { class: 'chips' }, PRINCIPLES.map((p) => h('button', { class: 'chip', onclick: () => { addNote('p_principles', p, 'orange'); toast('Added to Design Principles.'); renderStage(); } }, '+ ' + p))));
  if (z.id === 'p_process') return h('div', { class: 'bar' }, h('button', { class: 'add', onclick: () => extractProcess(true) }, '↧ Extract from my session'), h('span', { class: 'hint' }, 'Pulled from your scenario, jobs and dream state.'));
  return null;
}
function extractProcess(force) {
  const have = new Set(S.notes.filter((n) => n.zone === 'p_process').map((n) => n.text.trim()));
  let added = 0;
  for (const t of L.reimaginedSummary(S)) if (t && !have.has(t.trim())) { addNote('p_process', t, 'green'); added++; }
  if (force) { save(); toast(added ? `Added ${added} point(s).` : 'Nothing new to extract yet.'); renderStage(); }
}

// Export a Replit build prompt as markdown (and copy it), either filled from the canvas or a blank skeleton.
async function exportReplit(mode) {
  const md = L.replitPrompt(S, flow(), mode);
  const a = h('a', { href: URL.createObjectURL(new Blob([md], { type: 'text/markdown' })), download: mode === 'blank' ? 'replit-prompt-blank.md' : 'replit-prompt.md' });
  a.click(); URL.revokeObjectURL(a.href);
  try { await navigator.clipboard.writeText(md); toast('Replit prompt downloaded and copied.'); } catch { toast('Replit prompt downloaded.'); }
  $('dlg')?.close();
}
function replitDialog() {
  dialog('Create a Replit prompt (markdown)', [
    h('p', { class: 'hint' }, 'Export a prompt to paste into Replit AI to build this prototype there. Fill it from your canvas, or start from a blank template.'),
    h('div', { class: 'bar' },
      h('button', { class: 'primary', onclick: () => exportReplit('template') }, 'From my canvas (filled)'),
      h('button', { class: 'add', onclick: () => exportReplit('blank') }, 'Blank slate template')),
  ]);
}

/* ---------- setup ---------- */
const allCases = () => [...CASES.filter((c) => c.id !== 'own'), ...custom, CASES.find((c) => c.id === 'own')];
// Steps may be plain strings (built-in cases) or { name, desc } objects (once edited). Read either shape safely.
const stepName = (x) => (typeof x === 'string' ? x : x.name || '');
const stepDesc = (x) => (typeof x === 'string' ? '' : x.desc || '');
// Normalise a case's steps to editable { name, desc } objects, in place, so edits flow straight into the session.
const editableSteps = (c) => (c.steps = c.steps.map((x) => (typeof x === 'string' ? { name: x, desc: '' } : x)));
// Persist step edits: custom processes to storage, built-in edits last for the current session.
function persistSteps(c) {
  if (custom.some((x) => x.id === c.id)) { try { localStorage.setItem(CKEY, JSON.stringify(custom)); } catch { /* private mode */ } }
}
// Choosing a process replaces the steps (and the case evidence) everywhere.
function applyCase(c) {
  Object.assign(S, { caseId: c.id, caseName: c.name, brief: c.brief || '', quotes: c.quotes || [], probe: c.probe || null, steps: c.steps.map((n) => ({ id: uid(), name: stepName(n), desc: stepDesc(n) })), focus: null, ev: {} });
  S.notes = S.notes.filter((n) => !n.zone.startsWith('fr:')); delete S.score.hunt;
  save();
}
async function createProcess(text, status) {
  let c = null;
  if (AI) try { status.textContent = 'Designing your process…'; let t = ''; await stream({ system: 'You design realistic, fictional business process cases as strict JSON.', messages: [{ role: 'user', content: L.processPrompt(text) }], effort: 'low', json: true }, (d) => { t += d; }); c = L.parseProcess(t); } catch { /* fall back to the offline split */ }
  c ||= L.processFromText(text);
  Object.assign(c, { id: 'c' + uid(), sub: 'Your process' });
  custom.push(c);
  try { localStorage.setItem(CKEY, JSON.stringify(custom)); } catch { /* private mode */ }
  return c;
}
function renderSetup() {
  let mode = FLOWS[S.mode] ? S.mode : 'full', caseId = S.caseId || CASES[0].id;
  const cur = () => allCases().find((c) => c.id === caseId) || CASES[0];
  const name = h('input', { placeholder: 'Your or your team\'s name', value: S.name, 'aria-label': 'Your (team) name' });
  const modes = h('div', { class: 'cards' }), cases = h('div', { class: 'cards small' }), preview = h('div', { class: 'preview' });
  const card = (on, click, ...kids) => h('button', { class: 'card' + (on ? ' on' : ''), 'aria-pressed': String(on), onclick: click }, ...kids);
  const draw = () => {
    modes.replaceChildren(...Object.entries(FLOWS).map(([k, f]) => card(mode === k, () => { mode = k; draw(); }, h('small', { class: 'tag' }, f.tag), h('b', {}, f.name), h('span', {}, f.sub))));
    cases.replaceChildren(...allCases().map((c) => card(caseId === c.id, () => { caseId = c.id; draw(); }, h('b', {}, c.name), h('span', {}, c.sub))));
    const c = cur();
    editableSteps(c);
    const flowEl = h('div', { class: 'flow' });
    const list = h('div', { class: 'stepedit' });
    const drawFlow = () => flowEl.replaceChildren(...c.steps.flatMap((st, i) => [
      i ? h('span', { class: 'flowarrow', 'aria-hidden': 'true' }, '→') : null,
      h('div', { class: 'flowbox' }, h('span', { class: 'flownum' }, String(i + 1)), h('span', {}, st.name || `Step ${i + 1}`)),
    ].filter(Boolean)));
    const drawSteps = () => { drawFlow(); list.replaceChildren(...c.steps.map((st, i) => h('div', { class: 'steprow' },
      h('span', { class: 'stepnum' }, String(i + 1)),
      h('div', { class: 'stepfields' },
        h('input', { class: 'stepname', value: st.name, placeholder: 'Step title', 'aria-label': `Step ${i + 1} title`, oninput: (e) => { st.name = e.target.value; persistSteps(c); }, onblur: drawFlow }),
        h('textarea', { class: 'stepdesc', rows: 2, value: st.desc, placeholder: 'A short explanation of this step (1–2 sentences)', 'aria-label': `Step ${i + 1} explanation`, oninput: (e) => { st.desc = e.target.value; persistSteps(c); } })),
      h('button', { class: 'stepdel', title: 'Remove step', 'aria-label': `Remove step ${i + 1}`, onclick: () => { c.steps.splice(i, 1); persistSteps(c); drawSteps(); } }, '×')))); };
    drawSteps();
    preview.replaceChildren(
      h('b', {}, c.name + ' · process steps'),
      h('p', { class: 'hint' }, 'How this process runs today, step by step:'),
      flowEl,
      h('p', { class: 'hint' }, 'Edit the steps below: change a title, write a short explanation, add or remove steps. Your changes carry into the session.'),
      c.brief && h('p', {}, c.brief),
      list,
      h('button', { class: 'add', onclick: () => { c.steps.push({ name: 'New step', desc: '' }); persistSteps(c); drawSteps(); } }, '+ step'));
  };
  const prompt = h('textarea', { rows: 2, 'aria-label': 'Describe a new process', placeholder: 'e.g. "Travel expense claims: employee submits, manager approves, finance checks, payment"' });
  const pstatus = h('span', { class: 'hint', role: 'status' });
  const create = h('button', { class: 'add', onclick: async () => {
    if (!prompt.value.trim()) return;
    create.disabled = true;
    const c = await createProcess(prompt.value.trim(), pstatus);
    caseId = c.id; prompt.value = ''; create.disabled = false; pstatus.textContent = 'Added and selected. You can still rename the steps in the session.'; draw();
  } }, 'Create process');
  const start = () => {
    if (S.mode && (S.notes.length || Object.keys(S.f).length) && !confirm('Start a new session? This clears your current board.')) return;
    clearInterval(timer.id); timer = { left: 0, id: null }; home = false;
    S = { ...blank(), mode, name: name.value.trim() }; applyCase(cur()); render();
  };
  draw();
  $('app').replaceChildren(h('div', { class: 'setup glass' },
    h('div', { class: 'brand' }, 'EY.ai Lab'),
    h('h1', {}, 'Process Reimagination'),
    h('p', { class: 'lead' }, 'A self-guided session: map today\'s reality, reimagine the process with people and AI side by side, and leave with a working prototype. A coach is with you all the way.'),
    FLOWS[S.mode] && h('div', { class: 'resume' }, h('span', {}, `Session in progress: ${flow().name} · ${S.caseName}`), h('button', { class: 'primary', onclick: () => { home = false; render(); } }, 'Continue →')),
    h('label', { class: 'who-plays' }, 'Your (team) name', name),
    h('p', { class: 'hint' }, 'Coach: ' + aiLabel() + ' · ', h('button', { class: 'aibtn', onclick: aiSettings }, '⚙ AI settings')),
    h('h2', {}, h('i', {}, '1'), 'Choose your session'), modes,
    h('h2', {}, h('i', {}, '2'), 'Choose a process'), cases,
    h('div', { class: 'newproc' }, h('b', {}, 'Or describe a new process'), prompt, h('div', { class: 'bar' }, create, pstatus)),
    preview,
    h('button', { class: 'primary big', onclick: start }, FLOWS[S.mode] ? 'Start a new session →' : 'Start the session →')));
}

/* ---------- sticky notes ---------- */
function sticky(n, redraw) {
  const ta = h('textarea', { value: n.text, placeholder: 'Type here…', 'aria-label': 'Sticky note', oninput: (e) => { n.text = e.target.value; save(); } });
  const el = h('div', { class: 'sticky c-' + n.color, draggable: true, ondragstart: (e) => e.dataTransfer.setData('text/plain', n.id) },
    h('div', { class: 'grip' },
      h('button', { title: 'Change colour', 'aria-label': 'Change colour', onclick: () => { n.color = COLORS[(COLORS.indexOf(n.color) + 1) % COLORS.length]; save(); redraw(); } }, '◐'),
      h('button', { title: 'Delete note', 'aria-label': 'Delete note', onclick: () => { S.notes = S.notes.filter((x) => x !== n); delete S.votes[n.id]; save(); redraw(); } }, '×')),
    ta);
  return el;
}
function addNote(zoneId, text = '', color = 'yellow') { const n = { id: uid(), zone: zoneId, text, color }; S.notes.push(n); save(); return n; }
function zoneEl(z, inner) {
  const body = h('div', { class: 'znotes' });
  const el = h('section', { class: 'zone', 'data-zone': z.id,
    onclick: () => { activeZone = z.id; document.querySelectorAll('.zone.active').forEach((x) => x.classList.remove('active')); el.classList.add('active'); },
    ondragover: (e) => { e.preventDefault(); el.classList.add('over'); }, ondragleave: () => el.classList.remove('over'),
    ondrop: (e) => { e.preventDefault(); e.stopPropagation(); el.classList.remove('over'); const n = S.notes.find((x) => x.id === e.dataTransfer.getData('text/plain')); if (n) { n.zone = z.id; save(); renderStage(); } } },
    h('header', {}, h('b', {}, z.label, z.tip && info(z.tip)), z.hint && h('small', {}, z.hint),
      h('button', { class: 'add', 'aria-label': 'Add sticky note to ' + z.label, onclick: () => { const n = addNote(z.id, '', z.color); draw(); body.querySelector(`[data-id="${n.id}"] textarea`)?.focus(); } }, '+ note')),
    body, inner);
  if (activeZone === z.id) el.classList.add('active');
  const draw = () => body.replaceChildren(...S.notes.filter((n) => n.zone === z.id).map((n) => { const s = sticky(n, draw); s.dataset.id = n.id; return s; }));
  draw();
  return el;
}

/* ---------- widgets ---------- */
const W = {
  brief: (w) => h('div', { class: 'panel brief' },
    h('div', { class: 'bar' }, h('h3', {}, 'Case brief'), h('select', { 'aria-label': 'Process', onchange: (e) => {
      const c = allCases().find((x) => x.id === e.target.value);
      if (!c || (S.notes.some((n) => n.zone.startsWith('fr:')) && !confirm('Switch process? The steps are replaced and their friction notes removed.'))) { e.target.value = S.caseId; return; }
      applyCase(c); S.scenario = null; save(); renderStage();
    } }, allCases().map((c) => h('option', { value: c.id, selected: c.id === S.caseId }, c.name)))),
    S.brief && h('p', {}, S.brief), !w.noQuotes && S.quotes.length > 0 && h('ul', {}, S.quotes.map((q) => h('li', {}, `"${q.q}"`)))),
  info: (w) => h('div', { class: 'panel' }, h('h3', {}, w.title), h('div', { class: 'igrid' }, w.items.map(([a, b], i) => h('div', { class: 'icard' }, w.numbered && h('i', {}, String(i + 1)), h('b', {}, a), h('p', {}, b))))),

  evidence: () => {
    const own = S.quotes.filter((q) => q.s), cards = own.length ? own : GAMES.signals.cards.map((c) => ({ q: c.q, s: c.a })), done = S.score.hunt != null;
    return h('div', { class: 'panel' }, h('h3', {}, 'Evidence cards'),
      h('p', { class: 'hint' }, (own.length ? '' : 'Generic practice quotes (fictional), because this process has no case evidence yet. ') + 'Tag each card with the signal(s) it shows; some show none. +1 per correct signal, −1 per wrong one, +1 for rightly leaving a card empty.'),
      h('ol', { class: 'legend' }, SIGNALS.map((x) => h('li', {}, x.name))),
      h('div', { class: 'evs' }, cards.map((c, i) => {
        const picked = new Set(S.ev[i] || []);
        return h('div', { class: 'ev' }, h('blockquote', {}, `"${c.q}"`),
          h('div', { class: 'sigs' }, SIGNALS.map((x) => h('button', { title: x.name, 'aria-label': `Signal ${x.n}: ${x.name}`, 'aria-pressed': String(picked.has(x.n)), class: (picked.has(x.n) ? 'on' : '') + (done && c.s.includes(x.n) ? ' right' : ''), disabled: done, onclick: (e) => {
            picked.has(x.n) ? picked.delete(x.n) : picked.add(x.n); S.ev[i] = [...picked]; save();
            e.currentTarget.classList.toggle('on'); e.currentTarget.setAttribute('aria-pressed', String(picked.has(x.n)));
          } }, String(x.n)))),
          done && h('p', { class: 'fb ' + (L.huntCard([...picked], c.s) > 0 ? 'ok' : 'no') }, c.s.length ? `Signal ${c.s.join(' and ')}. Ask: "${SIGNALS[c.s[0] - 1].ask}"` : 'No signal: a fact, not an opportunity.'));
      })),
      h('div', { class: 'bar' }, done
        ? [h('b', { class: 'pts' }, `Round S: ${S.score.hunt} points`), h('button', { class: 'add', onclick: () => { delete S.score.hunt; S.ev = {}; save(); renderStage(); } }, 'Play again')]
        : h('button', { class: 'primary', onclick: () => { S.score.hunt = cards.reduce((a, c, i) => a + L.huntCard(S.ev[i] || [], c.s), 0); save(); renderStage(); } }, 'Check my round')));
  },

  spotbar: () => {
    const el = h('div', { class: 'panel' });
    const draw = () => { const r = L.strongSpot(S); S.score.card = r.filter((x) => x[1]).length; save(); el.replaceChildren(h('h3', {}, 'Strong-spot bar · ', h('b', { class: 'pts' }, `${S.score.card}/5`)), h('div', { class: 'bars' }, r.map(([t, ok]) => h('span', { class: ok ? 'ok' : '' }, (ok ? '✓ ' : '○ ') + t)))); };
    live.push(draw); draw();
    return el;
  },

  tell: () => {
    const el = h('div', { class: 'panel' }), board = h('div');
    let t = null;
    const draw = () => {
      S.score.tell = L.strongSpot(S).every((x) => x[1]) && (S.f.mail_checks || '').split('|').filter(Boolean).length === 2 ? 3 : 0; save();
      const rows = [['S · Signal Hunt', 'hunt'], ['P · Probe', 'probe'], ['O · Opportunity note', 'card'], ['T · Tell', 'tell']], sum = rows.reduce((a, r) => a + (S.score[r[1]] || 0), 0);
      const badges = [S.score.hunt >= 5 && 'Sharpest Signal', S.score.probe >= 6 && 'Best Probe', S.score.card === 5 && 'Strongest Spot'].filter(Boolean);
      board.replaceChildren(h('table', { class: 'rows lead-t' }, h('thead', {}, h('tr', {}, rows.map((r) => h('th', {}, r[0])), h('th', {}, 'Total'))), h('tbody', {}, h('tr', {}, rows.map((r) => h('td', {}, String(S.score[r[1]] ?? '–'))), h('td', { class: 'pts' }, String(sum))))),
        h('p', { class: 'hint' }, 'Round T scores +3 when the card meets the full strong-spot bar and both guardrail checks below are ticked: that is a card a panel would take to Shape.'),
        badges.length > 0 && h('div', { class: 'bars' }, badges.map((b) => h('span', { class: 'ok' }, '🏅 ' + b))));
    };
    live.push(draw); draw();
    el.append(h('h3', {}, 'Leaderboard'), board, h('div', { class: 'bar' }, h('button', { class: 'primary', onclick: (e) => {
      const b = e.currentTarget; let n = 60; b.textContent = '⏱ 60s'; clearInterval(t);
      t = setInterval(() => { n--; b.textContent = n > 0 ? `⏱ ${n}s` : 'Time. Run it again?'; if (n <= 0) clearInterval(t); }, 1000);
    } }, 'Start my 60-second tell'), h('span', { class: 'hint' }, 'Say it out loud: process, signals, the client\'s words, the number, the owner, why now.')));
    return el;
  },
  promptcanvas: (w) => {
    if (!S.f.__pcSeeded) { const d = L.promptDefaults(S); for (const f of w.fields) if (!(S.f[f.id] || '').trim() && d[f.id]) S.f[f.id] = d[f.id]; S.f.__pcSeeded = 1; save(); }
    const out = h('textarea', { class: 'mail', rows: 7, readOnly: true, 'aria-label': 'Assembled prompt' });
    const status = h('span', { class: 'hint', role: 'status' });
    const assemble = () => { if (document.activeElement !== out) out.value = L.solutionPrompt(S); };
    const improve = async () => {
      const base = L.solutionPrompt(S);
      if (!base.trim()) return toast('Fill a few blanks first.');
      if (!AI) { out.value = base; return toast('Assembled. Connect a model (⚙ in the coach) to expand it into a full prompt.'); }
      status.textContent = 'Writing the full prompt…'; out.value = ''; let t = '';
      try { await stream({ system: 'You turn a few filled-in fragments into one clear, complete build prompt for an AI app builder. Keep the user\'s intent and wording; add only what is needed to make it buildable. Reply with only the prompt.', messages: [{ role: 'user', content: base }], effort: 'low' }, (d) => { t += d; out.value = t; }); } catch { out.value = base; }
      status.textContent = '';
    };
    const lines = w.fields.map((f) => h('label', { class: 'pcrow' }, h('b', {}, f.lead),
      h('textarea', { rows: 1, placeholder: f.ph || 'Type here…', value: S.f[f.id] || '', 'aria-label': f.label, oninput: (e) => { S.f[f.id] = e.target.value; save(); live.forEach((fn) => fn()); } })));
    live.push(assemble); assemble();
    return h('div', { class: 'panel' }, h('h3', {}, w.title, w.tip && info(w.tip)),
      w.intro && h('p', { class: 'hint' }, w.intro),
      h('div', { class: 'pcanvas' }, lines),
      h('p', { class: 'hint' }, 'Your prompt so far — it fills in as you type:'),
      out,
      h('div', { class: 'bar' }, h('button', { class: 'primary', onclick: improve }, AI ? '✶ Build full prompt with AI' : 'Assemble prompt'),
        h('button', { class: 'add', onclick: async () => { out.value = L.solutionPrompt(S); try { await navigator.clipboard.writeText(out.value); toast('Prompt copied.'); } catch { out.select(); } } }, 'Copy prompt'), status));
  },
  game: (w) => h('button', { class: 'gamecta', onclick: () => openGame(w.game) }, '🎲 ' + w.label, h('small', {}, S.score[w.game] != null ? `best: ${S.score[w.game]} pts` : 'earn points')),
  challenges: () => h('details', { class: 'panel' }, h('summary', {}, 'Challenge cards: test your "human" answers'), CHALLENGES.map((c) => h('div', { class: 'chal' }, h('b', {}, c.q), h('p', {}, 'Why it matters: ' + c.why), h('p', {}, '✓ Strong answer: ' + c.strong), h('p', {}, '⚑ Red flag: ' + c.flag)))),

  fields: (w) => h('div', { class: 'panel' }, h('h3', {}, w.title, w.tip && info(w.tip)), h('div', { class: w.cols ? 'fgrid' : 'fstack' }, w.fields.map((f) => {
    const warn = h('span', { class: 'warn', role: 'status' });
    const check = () => { warn.textContent = f.lint && L.isPitch(S.f[f.id]) ? '🟨 Yellow card: no "AI" or tool names. Ask about their work.' : f.lint && S.f[f.id] && !L.isOpen(S.f[f.id]) ? 'Tip: start with what, how, who or which.' : ''; };
    check();
    return h('label', { class: 'field' }, h('b', {}, f.label, f.tip && info(f.tip)), h('textarea', { rows: w.cols ? 4 : 2, placeholder: f.ph || 'Type here…', value: S.f[f.id] || '', oninput: (e) => { S.f[f.id] = e.target.value; save(); check(); live.forEach((fn) => fn()); } }), warn);
  }))),

  rows: (w) => {
    const rows = (S.rows[w.id] ||= Array.from({ length: w.min }, () => ({ who: 'both' })));
    const body = h('tbody');
    const cell = (r, c) => {
      if (c.type === 'who') { const box = h('div', { class: 'who' }); const draw = () => box.replaceChildren(...[['human', '👤 Human'], ['both', '🤝 Both'], ['ai', '🤖 AI']].map(([v, l]) => h('button', { class: r.who === v ? 'on' : '', 'aria-pressed': String(r.who === v), onclick: () => { r.who = v; save(); draw(); } }, l))); draw(); return box; }
      if (c.type === 'signal') return h('select', { 'aria-label': c.label, onchange: (e) => { r.signal = e.target.value; save(); } }, h('option', { value: '' }, '–'), SIGNALS.map((s) => h('option', { value: String(s.n), selected: r.signal === String(s.n) }, `${s.n} · ${s.name}`)));
      return h('textarea', { rows: 2, 'aria-label': c.label, placeholder: 'Type here…', value: r[c.id] || '', oninput: (e) => { r[c.id] = e.target.value; save(); } });
    };
    const draw = () => body.replaceChildren(...rows.map((r) => h('tr', {}, w.cols.map((c) => h('td', {}, cell(r, c))), h('td', {}, h('button', { class: 'x', 'aria-label': 'Remove row', onclick: () => { rows.splice(rows.indexOf(r), 1); save(); draw(); } }, '×')))));
    draw();
    return h('div', { class: 'panel' }, h('h3', {}, w.title, w.tip && info(w.tip)), h('table', { class: 'rows' }, h('thead', {}, h('tr', {}, w.cols.map((c) => h('th', {}, c.label, c.tip && info(c.tip))), h('th'))), body),
      h('button', { class: 'add', onclick: () => { rows.push({ who: 'both' }); save(); draw(); } }, '+ row'));
  },

  notes: (w) => {
    if (w.layout === 'arcs') {
      const dyn = w.zones[0]?.id.startsWith('dream_') ? dreamLabels() : null;
      const zs = dyn ? w.zones.map((z, i) => ({ ...z, label: dyn[i] || z.label })) : w.zones;
      return h('div', { class: 'panel' }, h('h3', {}, w.title, w.tip && info(w.tip)), h('div', { class: 'arcs' }, zs.reduceRight((inner, z) => zoneEl(z, inner), null)));
    }
    return h('div', { class: 'panel' }, h('h3', {}, w.title, w.tip && info(w.tip)), h('div', { class: 'zgrid' }, w.zones.map((z) => zoneEl(z, zoneExtra(z)))));
  },

  process: (w) => h('div', { class: 'panel' }, h('h3', {}, w.title, w.tip && info(w.tip)), h('p', { class: 'hint' }, 'Rename steps and add friction points under each. This process may not be your own — use the context box to note what actually happens at each step.'),
    h('div', { class: 'proc' }, S.steps.map((s) => h('div', { class: 'pcol' },
      h('div', { class: 'pill' + (S.focus === s.id ? ' focus' : '') },
        PILOT.stepFocusStar && h('button', { title: 'Make this the focus', 'aria-label': 'Focus on ' + s.name, 'aria-pressed': String(S.focus === s.id), onclick: () => { S.focus = S.focus === s.id ? null : s.id; save(); renderStage(); } }, S.focus === s.id ? '★' : '☆'),
        h('input', { value: s.name, 'aria-label': 'Step name', oninput: (e) => { s.name = e.target.value; save(); } }),
        h('button', { title: 'Remove step', 'aria-label': 'Remove step ' + s.name, onclick: () => { if (!confirm(`Remove "${s.name}" and its notes?`)) return; S.steps = S.steps.filter((x) => x !== s); S.notes = S.notes.filter((n) => n.zone !== 'fr:' + s.id); save(); renderStage(); } }, '×')),
      s.desc && h('p', { class: 'stepnote' }, s.desc),
      zoneEl({ id: 'fr:' + s.id, label: 'Friction points', color: 'white', tip: 'Friction is where time, effort, information or quality is lost in this step — anything slow, manual, error-prone, duplicated or unclear.' }),
      h('label', { class: 'stepctx' }, h('span', {}, 'Context'),
        h('textarea', { rows: 2, placeholder: 'What actually happens here: systems, who does it, inputs/outputs…', 'aria-label': 'Context for ' + s.name, value: s.context || '', oninput: (e) => { s.context = e.target.value; save(); } })))),
    h('button', { class: 'add', onclick: () => { S.steps.push({ id: uid(), name: 'New step', desc: '' }); save(); renderStage(); } }, '+ step'))),

  vote: () => {
    const left = () => 2 - Object.values(S.votes).reduce((a, b) => a + b, 0);
    const pull = () => { const have = new Set(S.notes.filter((n) => n.zone === 'usecases').map((n) => n.text)); const jobs = (S.rows.jtbd || []).filter((r) => r.who !== 'human' && (r.job || '').trim()).map((r) => r.job.trim()); const src = jobs.length ? jobs : S.scenario ? S.scenario.steps.slice(1, -1).map((s) => s.name) : []; src.filter((t) => t && t.trim() && !have.has(t)).forEach((t) => addNote('usecases', t, 'purple')); renderStage(); };
    const cards = S.notes.filter((n) => n.zone === 'usecases');
    const top = [...cards].sort((a, b) => (S.votes[b.id] || 0) - (S.votes[a.id] || 0))[0];
    return h('div', { class: 'panel' }, h('h3', {}, 'Use cases'), h('p', { class: 'hint' }, `You have ${left()} of 2 votes left. Tap a star to vote, tap again to take it back.`),
      h('div', { class: 'ucs' }, cards.map((n) => h('div', { class: 'uc' },
        h('textarea', { value: n.text, rows: 2, 'aria-label': 'Use case', oninput: (e) => { n.text = e.target.value; save(); } }),
        h('div', {}, [1, 2].map((i) => h('button', { class: 'star' + ((S.votes[n.id] || 0) >= i ? ' on' : ''), 'aria-label': `Vote ${i}`, onclick: () => { const v = S.votes[n.id] || 0; if (v >= i) S.votes[n.id] = i - 1; else if (left() >= i - v) S.votes[n.id] = i; save(); renderStage(); } }, '★')),
          h('button', { class: 'x', 'aria-label': 'Delete use case', onclick: () => { S.notes = S.notes.filter((x) => x !== n); delete S.votes[n.id]; save(); renderStage(); } }, '×'))))),
      h('div', { class: 'bar' }, h('button', { class: 'add', onclick: () => { addNote('usecases', '', 'purple'); renderStage(); } }, '+ use case'), h('button', { class: 'add', onclick: pull }, 'Pull from my scenario / jobs'),
        top && (S.votes[top.id] || 0) > 0 && h('button', { class: 'primary', onclick: () => { S.f.usecase = top.text; save(); toast('Top pick set as the use case for the deep dive.'); } }, 'Take the winner forward →')));
  },

  scenario: () => {
    const box = h('div', { class: 'panel scen' });
    const gen = async (useAI) => {
      status.textContent = 'Drafting…';
      let sc = null;
      if (useAI) try { let t = ''; await stream({ system: 'You write concise process scenarios as strict JSON.', messages: [{ role: 'user', content: L.scenarioPrompt(S, flow()) }], effort: 'medium', json: true }, (d) => { t += d; status.textContent = `Drafting… ${t.length} chars`; }); sc = L.parseScenario(t); } catch { /* fall through to the offline draft */ }
      if (!sc && useAI) toast('The coach model did not answer, so this is the offline draft.');
      S.scenario = sc || L.buildScenario(S); save(); renderStage();
    };
    const status = h('span', { class: 'hint', role: 'status' });
    const bar = h('div', { class: 'bar' }, AI && h('button', { class: 'primary', onclick: () => gen(true) }, S.scenario ? 'Regenerate with AI' : 'Generate with AI'), h('button', { class: AI ? 'add' : 'primary', onclick: () => gen(false) }, S.scenario ? 'Redraft from my board' : 'Draft from my board'), status);
    const sc = S.scenario;
    if (!sc) {
      const presets = L.scenarioPresets(S);
      box.append(h('h3', {}, 'Your reimagined scenario'), h('p', { class: 'hint' }, 'Start from a ready-made pattern for this process, or draft one from your board.'),
        h('div', { class: 'scards' }, presets.map((p) => h('button', { class: 'scard', onclick: () => { S.scenario = p; save(); toast('Loaded a scenario you can now edit or redraft.'); renderStage(); } },
          h('b', {}, p.title), h('span', {}, p.tagline)))),
        h('p', { class: 'hint' }, 'Or build one yourself:'), bar);
      return box;
    }
    // ponytail: whiteboard-lite — edit any box, reorder/delete/add steps; AI "organises" via Regenerate. Full freeform canvas later; the "Make it your own" sticky zones below already give free notes.
    const reorder = (i, d) => { const j = i + d; if (j < 0 || j >= sc.steps.length) return; [sc.steps[i], sc.steps[j]] = [sc.steps[j], sc.steps[i]]; save(); renderStage(); };
    const orch = (s) => [h('input', { class: 'loname', value: s.name, 'aria-label': 'Step name', oninput: (e) => { s.name = e.target.value; save(); } }),
      h('textarea', { class: 'lodoes', rows: 2, value: s.does || '', placeholder: 'What happens here…', 'aria-label': 'What happens', oninput: (e) => { s.does = e.target.value; save(); } })];
    const slot = (key, ph) => (s) => h('input', { class: 'lslot', value: s[key] || '', placeholder: ph, 'aria-label': ph, oninput: (e) => { s[key] = e.target.value || null; save(); } });
    const lane = (label, pick, cls) => [h('div', { class: 'lname' }, label), ...sc.steps.map((s) => h('div', { class: 'lcell' }, h('div', { class: cls }, pick(s))))];
    const controls = [h('div', { class: 'lname' }, ''), ...sc.steps.map((s, i) => h('div', { class: 'lcell lctl' },
      h('button', { class: 'x', title: 'Move left', 'aria-label': 'Move step left', onclick: () => reorder(i, -1) }, '◀'),
      h('button', { class: 'x', title: 'Delete step', 'aria-label': 'Delete step', onclick: () => { sc.steps.splice(i, 1); save(); renderStage(); } }, '×'),
      h('button', { class: 'x', title: 'Move right', 'aria-label': 'Move step right', onclick: () => reorder(i, 1) }, '▶')))];
    box.append(h('h3', {}, sc.title), h('p', { class: 'hint' }, sc.tagline),
      h('p', { class: 'hint sop' }, 'Your reimagined SOP flow. The yellow Orchestration row is the new, AI-powered backbone bolted onto the classical steps — agents prepare the work, people decide where it matters. Edit any box, reorder with ◀ ▶, add or delete steps, then press "Regenerate with AI" to let the coach reorganise it.'),
      h('div', { class: 'lanes', style: `grid-template-columns:auto repeat(${sc.steps.length},minmax(130px,1fr))` },
        lane('Human', slot('human', '+ human'), 'lh'), lane('Orchestration', orch, 'lo'), lane('Agents', slot('agent', '+ agent'), 'la'), ...controls),
      h('button', { class: 'add', onclick: () => { sc.steps.push({ name: 'New step', does: '', agent: null, human: null }); save(); renderStage(); } }, '+ step'),
      h('div', { class: 'fgrid' }, h('div', {}, h('b', {}, 'Opportunity'), h('p', {}, sc.opportunity)), h('div', {}, h('b', {}, 'Why does this matter?'), h('p', {}, sc.value))),
      h('button', { class: 'add', onclick: () => { S.scenario = null; save(); renderStage(); } }, '↩ See other options'), bar);
    return box;
  },

  prototype: () => {
    const status = h('span', { class: 'hint', role: 'status' });
    const change = h('input', { placeholder: 'Describe a change, e.g. "add a filter for high-risk cases"', 'aria-label': 'Change request' });
    const build = async (req) => {
      status.textContent = 'Building…';
      let html = '';
      if (AI) try { await stream({ system: 'You build small, self-contained HTML prototypes.', messages: [{ role: 'user', content: L.protoPrompt(S, flow(), req, req && S.proto) }], effort: 'medium' }, (d) => { html += d; status.textContent = `Building… ${html.length} chars`; }); html = L.stripFences(html); } catch { html = ''; }
      if (!/<html|<!doctype/i.test(html)) { if (AI) toast('The model did not return a prototype, so this is the built-in simulation.'); html = L.buildPrototype(S); }
      S.proto = html; save(); renderStage();
    };
    const dl = (name, text, type) => { const a = h('a', { href: URL.createObjectURL(new Blob([text], { type })), download: name }); a.click(); URL.revokeObjectURL(a.href); };
    return h('div', { class: 'panel' }, h('h3', {}, 'Working prototype'),
      h('div', { class: 'bar' }, h('button', { class: 'primary', onclick: () => build() }, S.proto ? 'Rebuild from canvas' : '⚡ Build my prototype'),
        S.proto && h('button', { class: 'add', onclick: () => dl('prototype.html', S.proto, 'text/html') }, 'Download .html'),
        h('button', { class: 'add', onclick: replitDialog }, '⬇ Replit prompt (.md)'), status),
      h('p', { class: 'hint' }, '“Build my prototype” creates a clickable preview right here in your browser (sandboxed, no internet) that you can download as an .html file — it does not create a Replit project. To build in Replit, use “Replit prompt (.md)” and paste it into Replit AI.'),
      // Sandboxed without same-origin, and no network: generated code cannot reach this app's storage or the internet.
      S.proto && h('iframe', { class: 'proto', title: 'Prototype preview', sandbox: 'allow-scripts', srcdoc: `<meta http-equiv="Content-Security-Policy" content="default-src 'unsafe-inline' data: blob:">` + S.proto }),
      S.proto && AI && h('div', { class: 'bar' }, change, h('button', { class: 'add', onclick: () => change.value.trim() && build(change.value.trim()) }, 'Apply change')),
      S.proto && !AI && h('p', { class: 'hint' }, 'This is the built-in simulation of your scenario. Connect a model (⚙ in the coach panel) to generate custom screens and request changes in plain language.'));
  },

  mail: () => {
    const asks = ['30 minutes to spar', 'prepare the next client conversation together', 'propose a Reimagination session with the client', 'a quick prototype to show'];
    const checks = ['fits within our assignment', 'independence checked with the engagement partner'];
    const out = h('textarea', { class: 'mail', readOnly: true, rows: 16, 'aria-label': 'Mail draft' });
    const on = (k) => (S.f[k] || '').split('|').filter(Boolean);
    const upd = () => { out.value = L.mailText(S, on('mail_asks'), on('mail_checks')); };
    const boxes = (k, list) => list.map((t) => h('label', { class: 'chk' }, h('input', { type: 'checkbox', checked: on(k).includes(t), onchange: (e) => { const s = new Set(on(k)); e.target.checked ? s.add(t) : s.delete(t); S.f[k] = [...s].join('|'); save(); upd(); live.forEach((fn) => fn()); } }), t));
    upd(); live.push(upd);
    return h('div', { class: 'panel' }, h('h3', {}, 'Tell: our mail to the AI lab and the engagement partner'),
      h('label', { class: 'field' }, h('b', {}, 'Client'), h('input', { value: S.f.mail_client || '', placeholder: 'Client name', oninput: (e) => { S.f.mail_client = e.target.value; save(); upd(); } })),
      h('p', {}, h('b', {}, 'Our ask')), boxes('mail_asks', asks), h('p', {}, h('b', {}, 'Check')), boxes('mail_checks', checks),
      h('div', { class: 'bar' }, h('button', { class: 'add', onclick: upd }, 'Refresh from board'), h('button', { class: 'primary', onclick: async () => { upd(); try { await navigator.clipboard.writeText(out.value); toast('Mail copied.'); } catch { out.select(); toast('Select all and copy.'); } } }, 'Copy mail')), out);
  },

  summary: () => h('div', { class: 'panel' }, h('h3', {}, 'Take it with you'), h('div', { class: 'bar' },
    h('button', { class: 'primary', onclick: () => { const a = h('a', { href: URL.createObjectURL(new Blob([L.summaryMd(S, flow())], { type: 'text/markdown' })), download: 'reimagination-summary.md' }); a.click(); URL.revokeObjectURL(a.href); } }, 'Download summary (.md)'),
    h('button', { class: 'add', onclick: () => window.print() }, 'Print this board'),
    PROV.builder && h('button', { class: 'add', title: 'Opens AI Builder with this session as a draft build', onclick: toBuilder }, 'Continue to Build →'))),
};
// Hands this session to the AI Builder app: it opens there, says it is ready, and only then receives the board.
function toBuilder() {
  const w = window.open(PROV.builder + '/#import');
  if (!w) return toast('Allow pop-ups for this page to open AI Builder.');
  const on = (e) => {
    if (e.origin !== PROV.builder || e.data !== 'builder-ready') return;
    removeEventListener('message', on);
    w.postMessage({ type: 'reimagination-session', session: S }, PROV.builder);
    toast('Sent to AI Builder as a draft build.');
  };
  addEventListener('message', on);
}

/* ---------- stage ---------- */
// The clock element is rebuilt on every render, so the interval looks it up by id.
function showClock() { const c = $('clock'); if (c) c.textContent = `${String(Math.floor(timer.left / 60)).padStart(2, '0')}:${String(timer.left % 60).padStart(2, '0')} ${timer.id ? '⏸' : '▶'}`; }
function tick() { timer.left = Math.max(0, timer.left - 1); if (!timer.left) { clearInterval(timer.id); timer.id = null; toast('Time is up for this stage. Wrap up and move on.'); } showClock(); }
function renderStage() {
  const st = stage(), n = flow().stages.length, y = scrollY;
  if (st.id === 'present' && !S.f.__procDone && !S.notes.some((nn) => nn.zone === 'p_process')) { S.f.__procDone = 1; extractProcess(false); save(); }
  live = [];
  const zones = st.widgets.flatMap((w) => w.zones || []).map((z) => z.id), proc = st.widgets.some((w) => w.type === 'process');
  if (!zones.includes(activeZone) && !(proc && activeZone.startsWith('fr:'))) activeZone = zones[0] || (proc && S.steps[0] ? 'fr:' + S.steps[0].id : 'parking');
  const clock = h('button', { id: 'clock', class: 'clock', title: 'Start / pause timer', 'aria-label': 'Stage timer, start or pause', onclick: () => {
    if (timer.id) { clearInterval(timer.id); timer.id = null; } else timer.id = setInterval(tick, 1000);
    showClock(); } });
  const go = (d) => { S.stage = Math.min(n - 1, Math.max(0, S.stage + d)); save(); clearInterval(timer.id); timer = { left: stage().mins * 60, id: null }; renderStage(); scrollTo(0, 0); };
  const jump = (i) => { if (i === S.stage) return; S.stage = Math.min(n - 1, Math.max(0, i)); save(); clearInterval(timer.id); timer = { left: stage().mins * 60, id: null }; renderStage(); scrollTo(0, 0); };
  // Pilot visibility: hide warm-up games/steps and the Design-questions box, but keep the data and code (see PILOT in content.js).
  const widgets = st.widgets.filter((w) => !(PILOT.hideWarmup && w.type === 'game' && /warm-?up/i.test(w.label || '')) && !(PILOT.hideDesignQuestions && w.type === 'fields' && /^design questions/i.test(w.title || '')));
  const steps = PILOT.hideWarmup ? st.steps.filter((s) => !/warm-?up/i.test(s.t)) : st.steps;
  const bkIcon = (b) => ({ Individual: '👤', Pairs: '👥', Groups: '👪', Plenary: '🗣' }[b] || '👥');
  const bkBadge = (b) => b && h('span', { class: 'breakout' }, `${bkIcon(b)} ${b}`);
  const crumbs = h('nav', { class: 'crumbs', 'aria-label': 'Stages' }, flow().stages.flatMap((stg, i) => [
    i ? h('span', { class: 'crumbsep', 'aria-hidden': 'true' }, '→') : null,
    h('button', { class: 'crumb' + (i === S.stage ? ' on' : i < S.stage ? ' done' : ''), 'aria-current': i === S.stage ? 'step' : null, title: stg.title, onclick: () => jump(i) }, stg.title.split('·').pop().trim()),
  ].filter(Boolean)));
  $('app').replaceChildren(
    h('header', { class: 'top' },
      h('div', { class: 'ttl' }, h('div', { class: 'brand' }, 'EY.ai Lab'), crumbs, h('div', { class: 'prog', role: 'progressbar', 'aria-valuenow': S.stage + 1, 'aria-valuemax': n }, h('i', { style: `width:${(100 * (S.stage + 1)) / n}%` })), h('span', { class: 'round' }, `${st.badge || 'Stage'} · ${S.stage + 1} of ${n}`), h('h1', {}, st.title)),
      h('div', { class: 'obj' }, h('b', {}, 'Objective'), h('p', {}, st.objective)),
      h('div', { class: 'tools' }, h('button', { title: 'Back to the start screen; your board is kept', onclick: () => { home = true; render(); } }, '⌂ Home'), clock, h('span', { class: 'score', title: 'Points from games' }, `★ ${total()}`),
        !PILOT.hideSignalsArcade && h('button', { onclick: () => dialog('Six signals that there is an opportunity', SIGNALS.map((s) => h('div', { class: 'sig' }, h('b', {}, `${s.n} · ${s.name}`), h('p', {}, 'Listen for: ' + s.listen), h('p', {}, 'Ask: "' + s.ask + '"')))) }, 'Signals'),
        !PILOT.hideSignalsArcade && h('button', { onclick: () => dialog('Arcade', Object.entries(GAMES).map(([k, g]) => h('button', { class: 'gamecta', onclick: () => openGame(k) }, '🎲 ' + g.title, h('small', {}, S.score[k] != null ? `best: ${S.score[k]} pts` : g.intro)))) }, 'Arcade'),
        h('button', { onclick: () => dialog('Parking lot', [h('p', { class: 'hint' }, 'Anything important that does not fit the current stage.'), zoneEl({ id: 'parking', label: 'Notes', color: 'white' })]) }, 'Parking lot'),
        h('button', { onclick: () => { chatOpen = !chatOpen; renderStage(); } }, chatOpen ? 'Hide coach' : 'Coach'),
        h('button', { onclick: () => { if (confirm('Start over? This clears your whole board.')) { S = blank(); save(); render(); } } }, 'Restart'))),
    h('div', { class: 'layout' + (chatOpen ? '' : ' nochat') },
      h('aside', { class: 'steps' },
        h('div', { class: 'blob start' }, h('b', {}, 'Where to start'), h('p', {}, `Begin with step 1 below${steps[0] ? `: ${steps[0].t}` : ''}. Open a step to read its explanation. The coach on the right can help any time.`)),
        steps.map((s, i) => h('details', { class: 'glass step' }, h('summary', {}, h('small', {}, `◷ ${s.mins} min`), h('b', {}, `${i + 1}. ${s.t}`), bkBadge(s.bk || BREAKOUT[st.id])), h('p', {}, s.d))),
        h('details', { class: 'blob' }, h('summary', {}, h('b', {}, 'Questions along the way')), h('ul', {}, st.ask.map((q) => h('li', {}, q)))),
        h('div', { class: 'bar' }, S.stage > 0 && h('button', { class: 'add', onclick: () => go(-1) }, '← Back'), S.stage < n - 1 && h('button', { class: 'primary', onclick: () => go(1) }, 'Next stage →'))),
      h('main', { class: 'glass board' }, widgets.map((w) => W[w.type](w))),
      chatOpen && chatPanel()));
  showClock(); scrollTo(0, y);
}

/* ---------- coach ---------- */
// Which model answers: the user's choice in AI settings, else the server's Claude key, else a local Ollama model, else none (guide mode).
let cfg = { provider: 'auto', model: '', key: '' };
try { cfg = { ...cfg, ...JSON.parse(localStorage.getItem(AKEY)) }; } catch { /* defaults */ }
function active() {
  const o = PROV.ollama || {}, a = PROV.anthropic || {};
  const ollama = o.ok && o.models.length ? { provider: 'ollama', model: o.models.includes(cfg.model) ? cfg.model : o.models.find((m) => /mistral/i.test(m)) || o.models[0] } : null;
  const claude = a.ok && (cfg.key || a.server) ? { provider: 'anthropic', model: a.models[0] } : null;
  return cfg.provider === 'guide' ? null : cfg.provider === 'ollama' ? ollama : cfg.provider === 'anthropic' ? claude : (a.server && claude) || ollama || claude;
}
const aiLabel = () => { const m = active(); return !m ? 'guide mode' : m.provider === 'ollama' ? `local · ${m.model}` : 'Claude'; };
async function loadStatus() { try { PROV = await (await fetch('/api/status')).json(); } catch { PROV = {}; } AI = !!active(); }
function aiSettings() {
  const o = PROV.ollama || { models: [] }, a = PROV.anthropic || {};
  const key = h('input', { type: 'password', autocomplete: 'off', value: cfg.key, placeholder: 'sk-ant-…', 'aria-label': 'Anthropic API key' });
  const model = h('select', { 'aria-label': 'Local model' }, o.models.map((m) => h('option', { value: m, selected: m === (active()?.provider === 'ollama' ? active().model : cfg.model) }, m)));
  const opt = (v, title, note, extra) => h('label', { class: 'aiopt' }, h('input', { type: 'radio', name: 'prov', value: v, checked: cfg.provider === v }), h('span', {}, h('b', {}, title), h('small', {}, note), extra));
  dialog('AI settings', [
    opt('auto', 'Automatic', 'Use the server\'s Claude key if there is one, otherwise a local model, otherwise guide mode.'),
    opt('ollama', 'Local model (Ollama)', o.ok ? (o.models.length ? 'Runs on the machine hosting this app. Nothing leaves it.' : 'Ollama is running but has no models. Run: ollama pull mistral') : 'Ollama is not running on the host. Install it from ollama.com, then: ollama pull mistral', o.models.length > 0 && model),
    opt('anthropic', 'Claude with my own API key', a.ok ? (a.server ? 'This server already has a key; leave the field empty to use it.' : 'Your key is kept in this browser only and sent with each request. Board text goes to the Anthropic API.') : 'The Anthropic SDK is not installed on the server (npm install).', a.ok && key),
    opt('guide', 'Guide mode (no AI)', 'Scripted coach, offline scenario and built-in prototype.'),
    h('div', { class: 'bar' }, h('button', { class: 'primary', onclick: async () => {
      cfg = { provider: document.querySelector('input[name=prov]:checked')?.value || 'auto', model: model.value || '', key: key.value.trim() };
      try { localStorage.setItem(AKEY, JSON.stringify(cfg)); } catch { /* private mode: applies to this visit only */ }
      await loadStatus(); $('dlg').close(); render(); toast('Coach: ' + aiLabel());
    } }, 'Save'), h('span', { class: 'hint' }, 'Now: ' + aiLabel())),
  ]);
}
async function stream(body, onText) {
  const m = active();
  if (!m) throw new Error('No model');
  const r = await fetch('/api/chat', { method: 'POST', headers: { 'content-type': 'application/json', ...(m.provider === 'anthropic' && cfg.key ? { 'x-api-key': cfg.key } : {}) }, body: JSON.stringify({ ...body, provider: m.provider, model: m.model }) });
  if (!r.ok) throw new Error(await r.text());
  const rd = r.body.getReader(), dec = new TextDecoder();
  for (;;) { const { done, value } = await rd.read(); if (done) break; onText(dec.decode(value, { stream: true })); }
}
function chatPanel() {
  const log = h('div', { class: 'log', 'aria-live': 'polite' });
  const draw = () => {
    const sgs = (PILOT.hideWarmup ? stage().steps.filter((s) => !/warm-?up/i.test(s.t)) : stage().steps), first = sgs[0];
    const hello = `Hi${S.name ? ' ' + S.name : ''}, I'm your coach. Not sure where to start? Begin with step 1 on the left${first ? `: "${first.t}" — ${first.d}` : '.'} Ask me anything, or tap a button below when you're stuck.`;
    const msgs = S.chat.length ? S.chat : [{ role: 'assistant', content: hello }];
    log.replaceChildren(...msgs.map((m) => h('div', { class: 'msg ' + m.role }, m.content.split('\n').map((line) => {
      const b = m.role === 'assistant' && line.match(/^\s*(?:[-*•]|\d+[.)])\s+"?(.+?)"?\s*$/);
      return b ? h('div', { class: 'sug' }, h('span', {}, b[1]), h('button', { title: 'Add as sticky note', 'aria-label': 'Add as sticky note: ' + b[1], onclick: () => { addNote(activeZone, b[1].replace(/\*\*/g, '')); toast(activeZone === 'parking' ? 'Added to the parking lot.' : 'Added to the selected area.'); renderStage(); } }, '+')) : h('p', {}, line);
    }))));
    log.scrollTop = log.scrollHeight;
  };
  const ask = async (text) => {
    if (!text.trim()) return;
    const m = { role: 'assistant', content: '' };
    S.chat.push({ role: 'user', content: text }, m); draw();
    if (AI) try {
      let hist = S.chat.slice(0, -1).filter((x) => x.content).slice(-12); while (hist[0]?.role !== 'user') hist.shift();
      await stream({ system: L.systemPrompt(stage(), S, flow()), messages: hist, effort: 'low' }, (d) => { m.content += d; draw(); });
    } catch { m.content = ''; }
    if (!m.content) m.content = L.coachReply(stage(), S, text);
    save(); draw();
  };
  const input = h('textarea', { rows: 2, placeholder: 'Ask the coach…', 'aria-label': 'Message the coach', onkeydown: (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask(input.value); input.value = ''; } } });
  draw();
  return h('aside', { class: 'glass chat' }, h('h3', {}, 'Coach ', h('button', { class: 'aibtn', title: 'AI settings', onclick: aiSettings }, '⚙ ' + aiLabel())),
    log,
    h('div', { class: 'chips' }, ['What should I do here?', 'Challenge my board', 'Suggest sticky notes'].map((c) => h('button', { onclick: () => ask(c) }, c))),
    h('div', { class: 'bar' }, input, h('button', { class: 'primary', 'aria-label': 'Send', onclick: () => { ask(input.value); input.value = ''; } }, '↑')));
}

/* ---------- dialogs, games, toast ---------- */
function dialog(title, kids) {
  const d = $('dlg');
  d.replaceChildren(h('header', {}, h('h2', {}, title), h('button', { 'aria-label': 'Close', onclick: () => d.close() }, '×')), h('div', { class: 'dbody' }, kids));
  if (!d.open) d.showModal();
  d.onclose = () => S.mode && !home && renderStage();
}
function toast(t) { const el = $('toast'); el.textContent = t; el.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('on'), 3200); }
function finish(key, pts, body) { S.score[key] = Math.max(S.score[key] ?? 0, pts); save(); body.replaceChildren(h('h3', {}, `Done: ${pts} points`), h('p', {}, `Your best: ${S.score[key]} points.`), h('button', { class: 'primary', onclick: () => openGame(key) }, 'Play again')); }

function openGame(key) {
  const g = key === 'probe' ? L.caseProbe(GAMES.probe, S.probe) : GAMES[key], body = h('div', { class: 'game' });
  let i = 0, pts = 0;
  dialog(g.title, [h('p', { class: 'hint' }, g.intro), body]);
  if (key === 'probe') {
    const seen = new Set(), log = h('div', { class: 'log' }, h('div', { class: 'msg assistant' }, h('p', {}, 'Client: ' + g.opening))), sc = h('b', {}, '0 points');
    const input = h('input', { placeholder: 'Your question…', 'aria-label': 'Your question', onkeydown: (e) => e.key === 'Enter' && send() });
    const send = () => {
      const t = input.value.trim(); if (!t) return; input.value = '';
      const r = L.probeReply(g, t, seen); if (r.reveal != null) seen.add(r.reveal); pts += r.points; i++;
      log.append(h('div', { class: 'msg user' }, h('p', {}, t)), h('div', { class: 'msg assistant' }, h('p', {}, (r.card ? '🟨 ' : '') + 'Client: ' + r.reply), r.hint && h('p', { class: 'hint' }, r.hint)));
      log.scrollTop = log.scrollHeight; sc.textContent = `${pts} points · ${seen.size}/${g.facts.length} facts`;
      if (r.done || i >= 10) finish(key, Math.max(0, pts), body);
    };
    body.append(log, h('div', { class: 'bar' }, input, h('button', { class: 'primary', onclick: send }, 'Ask')), sc);
    return;
  }
  const next = () => {
    if (i >= g.cards.length) return finish(key, pts, body);
    const c = g.cards[i], fb = h('p', { class: 'fb', role: 'status' }), nextBtn = h('button', { class: 'primary', hidden: true, onclick: () => { i++; next(); } }, 'Next →');
    const answer = (ok, gain, text) => { pts += gain; fb.textContent = (ok ? '✓ ' : '✗ ') + text; fb.className = 'fb ' + (ok ? 'ok' : 'no'); nextBtn.hidden = false; body.querySelectorAll('.opts button').forEach((b) => (b.disabled = true)); };
    let opts;
    if (key === 'signals') {
      const picked = new Set();
      opts = h('div', {}, h('div', { class: 'opts' }, SIGNALS.map((s) => h('button', { 'aria-pressed': 'false', onclick: (e) => { picked.has(s.n) ? picked.delete(s.n) : picked.add(s.n); e.currentTarget.classList.toggle('on'); e.currentTarget.setAttribute('aria-pressed', String(picked.has(s.n))); } }, `${s.n} · ${s.name}`))),
        h('button', { class: 'add', onclick: (e) => { if (!picked.size) return; e.currentTarget.disabled = true; const gain = L.scoreSignals([...picked], c.a); answer(gain === c.a.length, gain, `Signal ${c.a.join(' and ')}. Ask: "${SIGNALS[c.a[0] - 1].ask}"`); } }, 'Check'));
    } else opts = h('div', { class: 'opts' }, [['human', '👤 Judgement'], ['both', '🤝 Both'], ['ai', '🤖 Legwork']].map(([v, l]) => h('button', { onclick: () => answer(v === c.a, v === c.a ? 1 : 0, c.why) }, l)));
    body.replaceChildren(h('small', {}, `${i + 1} / ${g.cards.length} · ${pts} points`), h('blockquote', {}, c.q), opts, fb, nextBtn);
  };
  next();
}

function render() { if (home || !FLOWS[S.mode]) return renderSetup(); timer.left ||= stage().mins * 60; renderStage(); }
loadStatus().then(render);
