// Static files + a thin streaming proxy to Claude for the coach. Without credentials the app runs in guide mode.
import http from 'node:http';
import { readFile } from 'node:fs/promises';

const PORT = process.env.PORT || 4173;
const MODEL = process.env.MODEL || 'claude-opus-5-5';
const FILES = { '/': ['index.html', 'text/html'], '/app.js': ['app.js', 'text/javascript'], '/logic.js': ['logic.js', 'text/javascript'], '/content.js': ['content.js', 'text/javascript'], '/style.css': ['style.css', 'text/css'] };

let client = null;
if (process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN || process.env.ANTHROPIC_PROFILE) {
  try { client = new (await import('@anthropic-ai/sdk')).default(); } catch (e) { console.warn('Coach AI disabled:', e.message); }
}

async function chat(req, res) {
  let raw = '';
  for await (const c of req) { raw += c; if (raw.length > 400_000) return res.writeHead(413).end('Too large'); }
  let b;
  try { b = JSON.parse(raw); } catch { return res.writeHead(400).end('Bad JSON'); }
  const ok = typeof b.system === 'string' && Array.isArray(b.messages) && b.messages.length && b.messages.every((m) => ['user', 'assistant'].includes(m.role) && typeof m.content === 'string' && m.content);
  if (!ok) return res.writeHead(400).end('Bad request');
  try {
    const stream = client.beta.messages.stream({
      model: MODEL, max_tokens: 32000, system: b.system, messages: b.messages,
      output_config: { effort: b.effort === 'medium' ? 'medium' : 'low' },
      betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default', // on a safety refusal, the API retries on a fallback model
    });
    for await (const ev of stream) {
      if (ev.type === 'content_block_delta' && ev.delta.type === 'text_delta') { if (!res.headersSent) res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' }); res.write(ev.delta.text); }
    }
    if ((await stream.finalMessage()).stop_reason === 'refusal' && !res.headersSent) return res.writeHead(502).end('Declined');
    res.end();
  } catch (e) {
    console.error('Claude API error:', e.status ?? '', e.message);
    if (!res.headersSent) res.writeHead(502);
    res.end();
  }
}

http.createServer((req, res) => {
  const path = new URL(req.url, 'http://x').pathname;
  if (req.method === 'POST' && path === '/api/chat') return client ? chat(req, res) : res.writeHead(503).end('No model connected');
  if (path === '/api/status') return res.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify({ ai: !!client }));
  const f = FILES[path];
  if (!f || req.method !== 'GET') return res.writeHead(404).end('Not found');
  readFile(new URL('./public/' + f[0], import.meta.url)).then((d) => res.writeHead(200, { 'content-type': f[1] + '; charset=utf-8', 'cache-control': 'no-store' }).end(d), () => res.writeHead(500).end());
}).listen(PORT, '127.0.0.1', () => console.log(`Process Reimagination on http://localhost:${PORT} · coach: ${client ? 'AI (' + MODEL + ')' : 'guide mode (set ANTHROPIC_API_KEY for AI)'}`));
