// Static files + a thin streaming proxy to the coach's model (see providers.js). With no model the app runs in guide mode.
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { providers } from './providers.js';

const PORT = process.env.PORT || 4173;
const FILES = { '/': ['index.html', 'text/html'], '/app.js': ['app.js', 'text/javascript'], '/logic.js': ['logic.js', 'text/javascript'], '/content.js': ['content.js', 'text/javascript'], '/style.css': ['style.css', 'text/css'] };

async function chat(req, res) {
  let raw = '';
  for await (const c of req) { raw += c; if (raw.length > 400_000) return res.writeHead(413).end('Too large'); }
  let b;
  try { b = JSON.parse(raw); } catch { return res.writeHead(400).end('Bad JSON'); }
  const p = Object.hasOwn(providers, b.provider) && providers[b.provider];
  const ok = p && typeof b.system === 'string' && Array.isArray(b.messages) && b.messages.length && b.messages.every((m) => ['user', 'assistant'].includes(m.role) && typeof m.content === 'string' && m.content)
    && (b.model == null || /^[\w.:\/-]{1,80}$/.test(b.model));
  if (!ok) return res.writeHead(400).end('Bad request');
  // A key typed into the app arrives per request in a header; it is passed on and never stored or logged.
  const key = b.provider === 'anthropic' && typeof req.headers['x-api-key'] === 'string' ? req.headers['x-api-key'] : undefined;
  try {
    for await (const text of p.stream({ system: b.system, messages: b.messages, model: b.model, effort: b.effort, json: !!b.json, key })) {
      if (!res.headersSent) res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' });
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

// `builder` is where the AI Builder app runs: the last stage hands the session over to it.
const BUILDER = (process.env.BUILDER_URL || 'http://localhost:4280').replace(/\/$/, '');
const status = async () => ({ ...Object.fromEntries(await Promise.all(Object.entries(providers).map(async ([k, p]) => [k, await p.status()]))), builder: BUILDER });

http.createServer((req, res) => {
  const path = new URL(req.url, 'http://x').pathname;
  if (req.method === 'POST' && path === '/api/chat') return chat(req, res);
  if (path === '/api/status') return status().then((j) => res.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify(j)));
  const f = FILES[path];
  if (!f || req.method !== 'GET') return res.writeHead(404).end('Not found');
  readFile(new URL('./public/' + f[0], import.meta.url)).then((d) => res.writeHead(200, { 'content-type': f[1] + '; charset=utf-8', 'cache-control': 'no-store' }).end(d), () => res.writeHead(500).end());
}).listen(PORT, '127.0.0.1', async () => {
  const st = await status();
  console.log(`Process Reimagination on http://localhost:${PORT}\n  local model (Ollama): ${st.ollama.ok ? st.ollama.models.join(', ') || 'running, no models pulled' : 'not running'}\n  Claude: ${st.anthropic.server ? 'server key set' : 'no server key (users can add their own in the app)'}`);
});
