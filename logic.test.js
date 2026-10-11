import test from 'node:test';
import assert from 'node:assert/strict';
import * as L from './public/logic.js';
import { FLOWS, GAMES, CASES } from './public/content.js';

const S = () => ({ name: 'T', caseName: 'Order changes', brief: '', steps: [{ id: 'a', name: 'Order entry' }], focus: 'a', f: {}, rows: {}, notes: [], votes: {}, chat: [], scenario: null, proto: '' });

test('pitch and open-question detection', () => {
  assert.ok(L.isPitch('Have you tried AI for this?'));
  assert.ok(L.isPitch('We could use Copilot'));
  assert.ok(!L.isPitch('Who maintains the daily overview?'));
  assert.ok(L.isOpen('How long does it take?'));
  assert.ok(!L.isOpen('Is it slow?'));
});

test('signal scoring', () => {
  assert.equal(L.scoreSignals([2, 3], [2, 3]), 2);
  assert.equal(L.scoreSignals([2, 5], [2, 3]), 0);
  assert.equal(L.scoreSignals([1, 4, 6], [2]), 0);
});

test('probe game: facts, closed questions, yellow card, close', () => {
  const g = GAMES.probe, seen = new Set();
  const a = L.probeReply(g, 'How long does it take?', seen);
  assert.equal(a.points, 2); seen.add(a.reveal);
  assert.equal(L.probeReply(g, 'How long does it take?', seen).points, 0); // no double points
  assert.equal(L.probeReply(g, 'Is it slow?', seen).points, 0);
  assert.equal(L.probeReply(g, 'What if an AI did this?', seen).points, -2);
  assert.ok(L.probeReply(g, 'May I share this with our partner?', seen).done);
});

test('scenario, prototype and summary are built from the board', () => {
  const s = S();
  s.rows.jtbd = [{ job: 'First time right at entry', who: 'ai', why: 'Less rework' }, { job: 'Approve exceptions', who: 'human', why: '' }];
  s.notes = [{ id: 'n', zone: 'fr:a', text: 'Changes arrive late </script><b>x', color: 'yellow' }];
  const sc = L.buildScenario(s);
  assert.equal(sc.steps.length, 4);
  assert.equal(sc.steps[1].human, null);
  assert.equal(sc.steps[2].agent, null);
  s.scenario = sc; s.f.usecase = 'Late </script> changes';
  const html = L.buildPrototype(s);
  assert.match(html, /^<!doctype html>/);
  assert.equal(html.split('</script>').length, 2); // board text cannot close the script tag
  assert.match(L.summaryMd(s, FLOWS.full), /Changes arrive late/);
  assert.match(L.snapshot(s, FLOWS.full), /Friction at "Order entry"/);
  assert.ok(L.nudges(FLOWS.full.stages[0], s).length);
  assert.ok(L.coachReply(FLOWS.full.stages[0], s, 'suggest sticky notes').includes('- '));
});

test('model output parsing is defensive', () => {
  assert.equal(L.parseScenario('sorry'), null);
  assert.equal(L.parseScenario('```json\n{"title":"T","steps":[{"name":"A"}]}\n```').steps[0].name, 'A');
  assert.equal(L.stripFences('```html\n<!doctype html>\n```'), '<!doctype html>');
});

test('content is consistent', () => {
  for (const flow of Object.values(FLOWS)) {
    const zones = flow.stages.flatMap((s) => s.widgets.flatMap((w) => (w.zones || []).map((z) => z.id)));
    const fields = flow.stages.flatMap((s) => s.widgets.flatMap((w) => (w.fields || []).map((f) => f.id)));
    assert.equal(new Set(zones).size, zones.length);
    assert.equal(new Set(fields).size, fields.length);
    for (const s of flow.stages) assert.equal(s.steps.reduce((a, x) => a + x.mins, 0), s.mins, s.id);
  }
  assert.ok(CASES.every((c) => c.steps.length));
});

test('SPOT Lab: hunt scoring, strong-spot bar, case probe', () => {
  assert.equal(L.huntCard([], []), 1);
  assert.equal(L.huntCard([3], []), 0);
  assert.equal(L.huntCard([2, 4], [2, 4]), 2);
  const s = S();
  assert.equal(L.strongSpot(s).filter((x) => x[1]).length, 0);
  s.f = { q_process: 'Close', sc_signals: '2 and 3', sc_words: '"chasing"', q_number: '10 days', q_owner: 'Group controller' };
  assert.ok(L.strongSpot(s).every((x) => x[1]));
  s.f.sc_signals = '3, 3'; assert.ok(!L.strongSpot(s)[1][1]);
  for (const c of CASES.filter((x) => x.probe)) {
    const g = L.caseProbe(GAMES.probe, c.probe);
    assert.equal(g.opening, c.probe.open);
    assert.equal(L.probeReply(g, 'How long does it take?', new Set()).reply, c.probe.time);
    assert.ok(c.quotes.every((q) => q.s.every((n) => n >= 1 && n <= 6)));
  }
  assert.equal(L.caseProbe(GAMES.probe, null), GAMES.probe);
});

test('a prompted process becomes steps', () => {
  const p = L.processFromText('Travel expense claims: employee submits, manager approves, finance checks and then payment');
  assert.equal(p.name, 'Travel expense claims');
  assert.deepEqual(p.steps, ['Employee submits', 'Manager approves', 'Finance checks', 'Payment']);
  assert.equal(L.processFromText('Supplier onboarding').steps.length, 6);
  assert.equal(L.parseProcess('nope'), null);
  const ok = L.parseProcess('{"name":"X","steps":["a","b","c"],"quotes":[{"q":"hi","s":[2,9]}],"probe":{"open":"o"}}');
  assert.deepEqual(ok.quotes[0].s, [2]); assert.equal(ok.probe, null);
});
