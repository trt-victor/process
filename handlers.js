// API handlers shared by the local server (server.js) and the Vercel functions (api/*.js).
// They take plain Node (req, res), so they run the same on a laptop, on Vercel, or behind Azure App Service.
import { providers } from './providers.js';
import { store, ID } from './store.js';

const send = (res, code, body, type = 'text/plain') => { res.writeHead(code, { 'content-type': type + '; charset=utf-8', 'cache-control': 'no-store' }); res.end(body); };
const json = (res, code, obj) => send(res, code, JSON.stringify(obj), 'application/json');
const userKey = (req) => (typeof req.headers['x-api-key'] === 'string' && req.headers['x-api-key']) || undefined;

// Vercel pre-parses JSON into req.body; the plain Node server gives us the raw stream.
async function body(req, limit) {
  if (req.body !== undefined) return typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  let raw = '';
  for await (const c of req) { raw += c; if (raw.length > limit) throw Object.assign(new Error('Too large'), { status: 413 }); }
  return JSON.parse(raw);
}
async function read(req, res, limit) {
  try { return await body(req, limit); } catch (e) { send(res, e.status || 400, e.status ? 'Too large' : 'Bad JSON'); return null; }
}

export async function chat(req, res) {
  if (req.method !== 'POST') return send(res, 405, 'POST only');
  const b = await read(req, res, 400_000); if (!b) return;
  const p = Object.hasOwn(providers, b.provider) && providers[b.provider];
  const ok = p && typeof b.system === 'string' && Array.isArray(b.messages) && b.messages.length && b.messages.every((m) => ['user', 'assistant'].includes(m.role) && typeof m.content === 'string' && m.content)
    && (b.model == null || /^[\w.:\/-]{1,80}$/.test(b.model));
  if (!ok) return send(res, 400, 'Bad request');
  // A key typed into the app arrives per request in a header; it is passed on and never stored or logged.
  const key = b.provider === 'anthropic' ? userKey(req) : undefined;
  try {
    for await (const text of p.stream({ system: b.system, messages: b.messages, model: b.model, effort: b.effort, json: !!b.json, key })) {
      if (!res.headersSent) res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' });
      res.write(text);
    }
    if (!res.headersSent) res.writeHead(502);
    res.end();
  } catch (e) {
    console.error(`${b.provider} error:`, e.status ?? '', e.message);
    if (!res.headersSent) res.writeHead(e.status === 401 ? 401 : 502);
    res.end();
  }
}

// Handwritten sticky note (PNG from the pen pad) -> text, with Claude vision.
export async function handwriting(req, res) {
  if (req.method !== 'POST') return send(res, 405, 'POST only');
  const b = await read(req, res, 3_000_000); if (!b) return;
  if (typeof b.image !== 'string') return send(res, 400, 'Bad request');
  try { json(res, 200, { text: await providers.anthropic.transcribe({ image: b.image, key: userKey(req) }) }); } catch (e) {
    console.error('handwriting error:', e.status ?? '', e.message);
    send(res, e.status === 400 || e.status === 401 ? e.status : 502, 'Could not read the note');
  }
}

// Session board + chat history: GET ?id=<uuid> loads, PUT { id, state } saves.
export async function state(req, res) {
  if (!store) return send(res, 501, 'No server storage configured');
  try {
    if (req.method === 'GET') {
      const id = new URL(req.url, 'http://x').searchParams.get('id');
      if (!ID.test(id || '')) return send(res, 400, 'Bad id');
      const s = await store.get(id);
      return s ? json(res, 200, { state: s }) : send(res, 404, 'Not found');
    }
    if (req.method === 'PUT' || req.method === 'POST') {
      const b = await read(req, res, 4_000_000); if (!b) return;
      if (!ID.test(b.id || '') || !b.state || typeof b.state !== 'object' || Array.isArray(b.state)) return send(res, 400, 'Bad request');
      await store.put(b.id, b.state);
      return send(res, 204, '');
    }
    send(res, 405, 'GET or PUT');
  } catch (e) {
    console.error('storage error:', e.message);
    send(res, 502, 'Storage error');
  }
}

// `builder` is where the AI Builder app runs: the last stage hands the session over to it.
export const BUILDER = (process.env.BUILDER_URL || 'http://localhost:4280').replace(/\/$/, '');
export const statusData = async () => ({
  ...Object.fromEntries(await Promise.all(Object.entries(providers).map(async ([k, p]) => [k, await p.status()]))),
  builder: BUILDER, storage: store?.kind || null,
});
export async function status(req, res) { json(res, 200, await statusData()); }
