// Pure logic (no DOM) so it runs in the browser and in `node --test`.

const PITCH = /\b(a\.?i\.?|artificial intelligence|agents?|agentic|llms?|gpt|chatgpt|copilot|claude|gemini|machine learning|rpa|bots?|chatbots?)\b/i;
export const isPitch = (t) => PITCH.test(t || '');
export const isOpen = (t) => /^\s*(what|how|who|which|why|where|when|tell me|walk me)\b/i.test(t || '');

export function scoreSignals(picked, answer) {
  const hit = picked.filter((n) => answer.includes(n)).length;
  return Math.max(0, hit - (picked.length - hit));
}

// Scripted client for the probe game. `seen` is the set of fact indexes already revealed.
export function probeReply(game, text, seen) {
  const t = (text || '').toLowerCase();
  if (isPitch(t)) return { reply: 'Hm. I was not asking for a solution yet.', points: -2, card: true };
  const i = game.facts.findIndex((f, n) => !seen.has(n) && f.k.some((k) => t.includes(k)));
  const fact = game.facts[i];
  if (fact?.share) return { reply: fact.a, points: 1, reveal: i, done: true };
  if (!isOpen(t)) return { reply: t.includes('?') ? 'Yes, I suppose so.' : 'Mm.', points: 0, hint: 'Closed question. Start with what, how, who or which.' };
  if (!fact) return { reply: 'I am not sure what you mean. Could you ask it differently?', points: 0 };
  return { reply: fact.a, points: fact.number ? 2 : 1, reveal: i };
}

const short = (s, n = 34) => { s = (s || '').trim().split(/[.;\n]/)[0]; return s.length > n ? s.slice(0, n - 1).trim() + '…' : s; };
const zone = (S, id) => S.notes.filter((n) => n.zone === id && n.text.trim()).map((n) => n.text.trim());
const zonesLike = (S, prefix) => S.notes.filter((n) => n.zone.startsWith(prefix) && n.text.trim()).map((n) => n.text.trim());
export const focusName = (S) => S.steps.find((s) => s.id === S.focus)?.name || S.f.q_process || S.caseName || 'the process';

// Offline scenario: one orchestration step per job-to-be-done, with a human and/or agent lane.
export function buildScenario(S) {
  let jobs = (S.rows.jtbd || []).filter((r) => (r.job || '').trim());
  if (!jobs.length) jobs = (S.f.q_now ? S.f.q_now.split('\n').filter((l) => l.trim()) : S.steps.map((s) => s.name)).map((job) => ({ job, who: 'both', why: '' }));
  const mid = jobs.slice(0, 5).map((j) => ({
    name: short(j.job, 28), does: (j.why || j.job).trim(),
    agent: j.who !== 'human' ? short(j.job, 22) + ' agent' : null,
    human: j.who === 'human' ? 'Does this step' : j.who === 'both' ? 'Reviews exceptions' : null,
  }));
  const friction = zonesLike(S, 'fr:'), dream = zonesLike(S, 'dream_');
  return {
    title: `${focusName(S)}: reimagined flow`,
    tagline: S.f.vb1 || dream[0] || 'Agents prepare, people decide.',
    steps: [{ name: 'Trigger', does: `A new ${focusName(S).toLowerCase()} event arrives`, agent: 'Intake agent', human: null }, ...mid, { name: 'Finish', does: 'Outcome confirmed, audit trail stored', agent: null, human: null }],
    opportunity: friction.slice(0, 3).join(' · ') || S.f.q_pain || 'Add friction points in the first stage to sharpen this.',
    value: dream.slice(0, 3).join(' · ') || S.f.vb1 || 'Add dream-state notes to sharpen this.',
  };
}

export function parseScenario(text) {
  try {
    const o = JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1));
    if (!o.title || !Array.isArray(o.steps) || !o.steps.length) return null;
    const s = (v) => (v == null ? null : String(v));
    return { title: s(o.title), tagline: s(o.tagline) || '', opportunity: s(o.opportunity) || '', value: s(o.value) || '', steps: o.steps.slice(0, 8).map((x) => ({ name: s(x.name) || 'Step', does: s(x.does) || '', agent: s(x.agent), human: s(x.human) })) };
  } catch { return null; }
}

export function snapshot(S, flow) {
  const out = [`Participant: ${S.name || 'n/a'} · Case: ${S.caseName} · Focus: ${focusName(S)}`];
  if (S.brief) out.push('Case brief: ' + S.brief);
  if (S.steps.length) out.push('Process steps: ' + S.steps.map((s) => s.name).join(' → '));
  for (const st of flow.stages) for (const w of st.widgets) {
    if (w.type === 'fields') for (const f of w.fields) if ((S.f[f.id] || '').trim()) out.push(`${f.label}: ${S.f[f.id].trim()}`);
    if (w.type === 'rows') for (const r of S.rows[w.id] || []) { const v = w.cols.map((c) => r[c.id]).filter(Boolean); if (v.length > 1 || (v[0] && v[0] !== 'both')) out.push(`${w.title}: ${w.cols.map((c) => `${c.label}=${r[c.id] || '-'}`).join(' | ')}`); }
    if (w.type === 'notes') for (const z of w.zones) { const n = zone(S, z.id); if (n.length) out.push(`${z.label}: ${n.join(' · ')}`); }
  }
  for (const s of S.steps) { const n = zone(S, 'fr:' + s.id); if (n.length) out.push(`Friction at "${s.name}": ${n.join(' · ')}`); }
  const uc = S.notes.filter((n) => n.zone === 'usecases' && n.text.trim()).map((n) => `${n.text.trim()} (${S.votes[n.id] || 0} votes)`);
  if (uc.length) out.push('Use cases: ' + uc.join(' · '));
  if (S.scenario) out.push(`Scenario "${S.scenario.title}": ` + S.scenario.steps.map((s) => s.name).join(' → '));
  const park = zone(S, 'parking'); if (park.length) out.push('Parking lot: ' + park.join(' · '));
  return out.join('\n');
}

export function systemPrompt(stage, S, flow) {
  return `You are the facilitator-coach inside a self-guided Process Reimagination session (${flow.name}). The participant works alone; you replace the workshop facilitator.
Method: understand today's reality, find jobs-to-be-done and split them human / AI / both, imagine the dream state, shape one AI-powered scenario, prioritise, prototype, present back. In Spot stages the rule is "notice and tell, don't pitch": client questions must be open and never mention AI or tools.
Style: warm, direct, at most 120 words. Ask one sharp question at a time; do not fill the board for them. When you suggest sticky notes, put each on its own line starting with "- " (max 9 words each) so they can add it with one click. Challenge anything that calls data gathering, copying or comparison "human judgement".
Current stage: ${stage.title}. Objective: ${stage.objective}
Stage steps: ${stage.steps.map((s) => s.t + ' — ' + s.d).join(' | ')}
Their board so far:
${snapshot(S, flow)}`;
}

// What is still missing on this stage, in plain words.
export function nudges(stage, S) {
  const out = [];
  for (const w of stage.widgets) {
    if (w.type === 'fields') { const e = w.fields.filter((f) => !(S.f[f.id] || '').trim()); if (e.length) out.push(`"${e[0].label}" is still blank${e.length > 1 ? ` (and ${e.length - 1} more)` : ''}.`); for (const f of w.fields) if (f.lint && isPitch(S.f[f.id])) out.push(`Yellow card: "${f.label}" mentions AI or a tool. Ask about their work instead.`); }
    if (w.type === 'rows') { const n = (S.rows[w.id] || []).filter((r) => (r[w.cols[0].id] || '').trim()).length; if (n < 2) out.push(`"${w.title}" has ${n} filled row${n === 1 ? '' : 's'}. Aim for at least 3.`); }
    if (w.type === 'notes') { const e = w.zones.filter((z) => !zone(S, z.id).length); if (e.length) out.push(`No notes yet under "${e[0].label}"${e.length > 1 ? ` (and ${e.length - 1} more areas)` : ''}.`); }
    if (w.type === 'process') { if (!zonesLike(S, 'fr:').length) out.push('No friction points yet. Where is time, effort or quality lost?'); if (!S.focus) out.push('Pick a focus step: tap the star on the step with the most opportunity.'); }
    if (w.type === 'evidence' && S.score.hunt == null) out.push('Tag the evidence cards, then check your round.');
    if (w.type === 'spotbar') { const m = strongSpot(S).filter((x) => !x[1]).map((x) => x[0].toLowerCase()); if (m.length) out.push('The Spot card still needs: ' + m.join(', ') + '.'); }
    if (w.type === 'vote' && !Object.values(S.votes).some(Boolean)) out.push('You still have 2 votes to place.');
    if (w.type === 'scenario' && !S.scenario) out.push('Draft the scenario from your board first.');
    if (w.type === 'prototype' && !S.proto) out.push('No prototype yet. Fill the canvas, then press Build.');
  }
  return out;
}

// Coach used when no model is connected.
export function coachReply(stage, S, text) {
  const t = (text || '').toLowerCase(), gaps = nudges(stage, S);
  if (/sticky|stickies|suggest|idea|example/.test(t)) return `A few starters. Keep the ones that are true for you and rewrite them in your own words:\n${stage.ideas.map((i) => '- ' + i).join('\n')}`;
  if (/challenge|critique|review|check|feedback/.test(t)) return gaps.length ? `Here is what I would tighten:\n${gaps.map((g) => '• ' + g).join('\n')}` : 'This stage looks complete. Read it back once: is every note a fact or a quote, not a judgement about people? If yes, move on.';
  const q = stage.ask[S.chat.filter((m) => m.role === 'user').length % stage.ask.length];
  return `${stage.steps.map((s, i) => `${i + 1}. ${s.t} (${s.mins} min)`).join('\n')}\n\n${gaps[0] ? 'Next: ' + gaps[0] : 'You have covered the basics here.'}\n\nA question to think about: ${q}`;
}

export function summaryMd(S, flow) {
  const out = [`# ${flow.name}: ${S.caseName}`, `_${S.name || 'Participant'} · focus: ${focusName(S)}_`];
  for (const st of flow.stages) {
    const body = [];
    for (const w of st.widgets) {
      if (w.type === 'process') for (const s of S.steps) body.push(`- **${s.name}**${s.id === S.focus ? ' (focus)' : ''}${zone(S, 'fr:' + s.id).map((n) => `\n  - ${n}`).join('')}`);
      if (w.type === 'fields') for (const f of w.fields) if ((S.f[f.id] || '').trim()) body.push(`- **${f.label}** ${S.f[f.id].trim().replace(/\n/g, ' / ')}`);
      if (w.type === 'rows') for (const r of S.rows[w.id] || []) if ((r[w.cols[0].id] || '').trim()) body.push('- ' + w.cols.map((c) => r[c.id]).filter(Boolean).join(' — '));
      if (w.type === 'notes') for (const z of w.zones) { const n = zone(S, z.id); if (n.length) body.push(`- **${z.label}**${n.map((x) => `\n  - ${x}`).join('')}`); }
      if (w.type === 'vote') for (const n of S.notes.filter((x) => x.zone === 'usecases' && x.text.trim())) body.push(`- ${n.text.trim()} ${'★'.repeat(S.votes[n.id] || 0)}`);
      if (w.type === 'scenario' && S.scenario) body.push(`- **${S.scenario.title}**: ${S.scenario.steps.map((s) => s.name).join(' → ')}`, `- Opportunity: ${S.scenario.opportunity}`, `- Value: ${S.scenario.value}`);
    }
    if (body.length) out.push(`\n## ${st.title}`, ...body);
  }
  const park = zone(S, 'parking'); if (park.length) out.push('\n## Parking lot', ...park.map((p) => '- ' + p));
  return out.join('\n') + '\n';
}

export function mailText(S, asks, checks) {
  const rows = (S.rows.signals || []).filter((r) => (r.quote || '').trim()).map((r) => `signal ${r.signal || '?'}: ${r.quote.trim()}`).join('; ');
  const sig = rows || [S.f.sc_signals && 'signal ' + S.f.sc_signals, S.f.sc_words].filter(Boolean).join(': ');
  return `Subject: Opportunity at ${S.f.mail_client || '[client]'}: ${S.f.q_process || '[process]'} — can you think along?

Hi,

The client and our assignment: ${S.f.mail_client || '…'} — ${S.f.q_goal || '…'}
The opportunity: ${S.f.vb1 || S.f.sc_q || '…'}
What we saw (signals + the client's words): ${sig || '…'}
The number: ${S.f.cq_number || S.f.q_number || 'still to ask'}
Owner at the client: ${S.f.q_owner || '…'}
Why now: ${S.f.q_why || '…'}

Our ask: ${asks.join(', ') || '…'}
Check: ${checks.join(', ') || 'not yet checked'}

Regards,
${S.name || '…'}`;
}

export const stripFences = (t) => { const m = t.match(/```(?:html)?\s*([\s\S]*?)```/); return (m ? m[1] : t).trim(); };

export function protoConfig(S) {
  const sc = S.scenario || buildScenario(S);
  return { title: S.f.usecase || sc.title, user: S.f.user || 'Process specialist', outcome: S.f.outcome || sc.tagline, value: S.f.value || sc.value, data: S.f.data || '', steps: sc.steps.map((s) => ({ name: s.name, agent: s.agent, human: !!s.human })) };
}

// Offline prototype: a self-contained work-queue simulation of the scenario (agents process, people handle exceptions).
export function buildPrototype(S) {
  const cfg = JSON.stringify(protoConfig(S)).replace(/</g, '\\u003c');
  return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Prototype</title>
<style>body{font:14px system-ui,sans-serif;margin:0;background:#f4f3fa;color:#1b1b3a}header{background:#1A1A24;color:#fff;padding:14px 20px;border-bottom:4px solid #FFE600}h1{font-size:18px;margin:0 0 4px}header p{margin:0;opacity:.8;font-size:13px}main{padding:16px 20px;display:grid;gap:14px}
.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.kpi{background:#fff;border-radius:10px;padding:10px 12px}.kpi b{display:block;font-size:22px}.bar{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
button{font:inherit;border:0;border-radius:8px;padding:7px 12px;background:#1A1A24;color:#fff;cursor:pointer}button.alt{background:#e4e2f3;color:#1b1b3a}
.pipe{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(120px,1fr);gap:8px;overflow:auto}.col{background:#fff;border-radius:10px;padding:8px;min-height:120px}.col h3{font-size:12px;margin:0 0 2px}.col small{color:#6b6b8a;display:block;margin-bottom:6px;min-height:15px}
.case{background:#FFE600;border-radius:6px;padding:4px 6px;margin:4px 0;font-size:12px}.case.wait{background:#ffb3c1}.case.done{background:#b9f0c3}
.cols{display:grid;grid-template-columns:1fr 1fr;gap:14px}.panel{background:#fff;border-radius:10px;padding:12px}.panel h2{font-size:14px;margin:0 0 8px}.rev{display:flex;justify-content:space-between;gap:8px;align-items:center;border-top:1px solid #eee;padding:6px 0}#log{max-height:180px;overflow:auto;font-size:12px;color:#44446a}@media(max-width:700px){.cols,.kpis{grid-template-columns:1fr 1fr}}</style>
<header><h1 id="t"></h1><p id="sub"></p></header><main>
<div class="kpis"><div class="kpi"><b id="k1">0</b>cases processed</div><div class="kpi"><b id="k2">–</b>touchless</div><div class="kpi"><b id="k3">0</b>waiting for a person</div><div class="kpi"><b id="k4">0</b>human touches</div></div>
<div class="bar"><button id="add">+ New case</button><button id="add5" class="alt">+ 5 cases</button><label>Autonomy: agent acts alone above <b id="thv"></b>% confidence <input id="th" type="range" min="50" max="99" value="80"></label></div>
<div class="pipe" id="pipe"></div>
<div class="cols"><div class="panel"><h2>Review queue · <span id="who"></span></h2><div id="queue"></div></div><div class="panel"><h2>Audit trail</h2><div id="log"></div></div></div></main>
<script>
const C=${cfg},$=id=>document.getElementById(id);let cases=[],n=0,touches=0;
$('t').textContent=C.title;$('sub').textContent=C.outcome;$('who').textContent=C.user;
function log(m){const d=document.createElement('div');d.textContent=new Date().toLocaleTimeString()+' · '+m;$('log').prepend(d)}
function add(){n++;cases.push({id:'C-'+String(n).padStart(3,'0'),at:0,wait:false,touched:false,conf:0});log('C-'+String(n).padStart(3,'0')+' received')}
function tick(){const th=+$('th').value;for(const c of cases){if(c.wait||c.at>=C.steps.length-1)continue;const s=C.steps[c.at+1];c.conf=Math.round(55+Math.random()*45);
if(s.human&&(!s.agent||c.conf<th)){c.wait=true;c.at++;log(c.id+' routed to '+C.user+' at "'+s.name+'" ('+c.conf+'% confidence)')}else{c.at++;log(c.id+' · '+(s.agent||'system')+' completed "'+s.name+'"'+(s.agent?' ('+c.conf+'%)':''))}}draw()}
function decide(c,ok){c.wait=false;c.touched=true;touches++;if(!ok)c.at=Math.max(0,c.at-1);log(c.id+(ok?' approved by ':' sent back by ')+C.user);draw()}
function draw(){$('thv').textContent=$('th').value;const P=$('pipe');P.textContent='';C.steps.forEach((s,i)=>{const col=document.createElement('div');col.className='col';const h=document.createElement('h3');h.textContent=s.name;const sm=document.createElement('small');sm.textContent=(s.agent||'')+(s.human?' · human review':'');col.append(h,sm);
cases.filter(c=>c.at===i).forEach(c=>{const d=document.createElement('div');d.className='case'+(c.wait?' wait':i===C.steps.length-1?' done':'');d.textContent=c.id;col.append(d)});P.append(col)});
const Q=$('queue');Q.textContent='';const w=cases.filter(c=>c.wait);if(!w.length)Q.textContent='Nothing needs you right now.';w.forEach(c=>{const r=document.createElement('div');r.className='rev';const t=document.createElement('span');t.textContent=c.id+' · '+C.steps[c.at].name+' · '+c.conf+'% confident';const a=document.createElement('button');a.textContent='Approve';a.onclick=()=>decide(c,true);const b=document.createElement('button');b.className='alt';b.textContent='Send back';b.onclick=()=>decide(c,false);const g=document.createElement('span');g.append(a,' ',b);r.append(t,g);Q.append(r)});
const done=cases.filter(c=>c.at===C.steps.length-1&&!c.wait);$('k1').textContent=done.length;$('k2').textContent=done.length?Math.round(100*done.filter(c=>!c.touched).length/done.length)+'%':'–';$('k3').textContent=w.length;$('k4').textContent=touches}
$('add').onclick=()=>{add();draw()};$('add5').onclick=()=>{for(let i=0;i<5;i++)add();draw()};$('th').oninput=draw;for(let i=0;i<3;i++)add();draw();setInterval(tick,1500);
</script></html>`;
}

export const protoPrompt = (S, flow, change, prev) => `Build a working, clickable prototype for the use case below as ONE self-contained HTML file (inline CSS and JS, no external resources, no network calls, realistic sample data, usable at 900px wide). Show the primary user's main screen, what the AI/agents prepare, where the person decides, and the one number that proves the value. Keep it simple and realistic as a first prototype. Reply with only the HTML, starting with <!doctype html>.

${snapshot(S, flow)}
Prototype config: ${JSON.stringify(protoConfig(S))}${change ? `\n\nRequested change: ${change}\n\nCurrent prototype to modify:\n${prev}` : ''}`;

export const scenarioPrompt = (S, flow) => `From the board below, write one reimagined AI-powered scenario for the focus step. Reply with only JSON: {"title": string, "tagline": string, "steps": [{"name": short orchestration step, "does": one sentence, "agent": agent name or null, "human": what a person does here or null}], "opportunity": 1-2 sentences, "value": 1-2 sentences}. 5 to 7 steps, starting with a trigger and ending with a finish state. Use only facts from the board; do not invent numbers.

${snapshot(S, flow)}`;

/* ---------- SPOT Lab ---------- */
export const huntCard = (picked, answer) => (answer.length ? scoreSignals(picked, answer) : picked.length ? 0 : 1);
export function strongSpot(S) {
  const f = S.f, has = (k) => !!(f[k] || '').trim();
  return [['One process', has('q_process')], ['Two or more signals', new Set((f.sc_signals || '').match(/[1-6]/g)).size >= 2], ['A quote in the client\'s words', has('sc_words')], ['One number', /\d/.test(f.q_number || '')], ['An owner', has('q_owner')]];
}
// The probe game's facts are ordered: share, who, time, systems, volume, owner.
export const caseProbe = (base, p) => (p ? { ...base, opening: p.open, facts: base.facts.map((f, i) => (i ? { ...f, a: [p.who, p.time, p.sys, p.vol, p.owner][i - 1] } : f)) } : base);

/* ---------- prompt a new process ---------- */
const GENERIC = ['Request / trigger', 'Intake & validation', 'Processing', 'Review & approval', 'Delivery of the result', 'Follow-up & reporting'];
export function processFromText(text) {
  const t = text.trim(), [head, ...rest] = t.split(/:\s+/);
  const body = rest.length ? rest.join(': ') : t;
  const parts = body.split(/\s*(?:→|->|=>|>|\n|;|,|\band then\b|\bthen\b)\s*/i).map((x) => x.trim().replace(/^and\s+/i, '').replace(/\.$/, '')).filter(Boolean);
  const cap = (x) => x.charAt(0).toUpperCase() + x.slice(1);
  return { name: cap(short(rest.length ? head : t, 44)), brief: t, quotes: [], probe: null, steps: parts.length >= 3 ? parts.slice(0, 10).map((x) => cap(short(x, 40))) : GENERIC };
}
export const processPrompt = (text) => `Design a realistic but fictional process case for a workshop, from this description: "${text}"
Reply with only JSON: {"name": short process name, "brief": 2 sentences describing the situation, "steps": 5 to 7 short process step names in order, "quotes": 4 objects {"q": something a client employee would say about this process, "s": array of matching signal numbers, [] for one neutral fact}, "probe": {"open": client's opening line, "who": who does the work today, "time": how long it takes (with a number), "sys": which systems (with a number), "vol": what happens if volume doubles, "owner": which role owns it and why now}}.
Signals: 1 a goal without a how; 2 lots of measuring, no single answer; 3 people joining things up by hand; 4 an outcome nobody can steer; 5 volume must grow, headcount can't; 6 peers are moving or leaders ask a 10-year question.
No real company names. Never mention AI or tools.`;
export function parseProcess(text) {
  try {
    const o = JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1)), str = (v) => (typeof v === 'string' ? v : '');
    const steps = (o.steps || []).map(str).filter(Boolean).slice(0, 10);
    if (!str(o.name) || steps.length < 3) return null;
    const quotes = (o.quotes || []).filter((q) => q && str(q.q)).slice(0, 8).map((q) => ({ q: q.q, s: (Array.isArray(q.s) ? q.s : []).map(Number).filter((n) => n >= 1 && n <= 6) }));
    const p = o.probe || {}, probe = ['open', 'who', 'time', 'sys', 'vol', 'owner'].every((k) => str(p[k])) ? { open: p.open, who: p.who, time: p.time, sys: p.sys, vol: p.vol, owner: p.owner } : null;
    return { name: str(o.name), brief: str(o.brief), steps, quotes, probe };
  } catch { return null; }
}
