// Local server: static files from public/ plus the API (handlers.js). On Vercel the same handlers run as api/*.js functions.
import './env.js';
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { chat, handwriting, state, status, statusData } from './handlers.js';

const PORT = process.env.PORT || 4173;
const HOST = process.env.HOST || '127.0.0.1';
const FILES = { '/': ['index.html', 'text/html'], '/app.js': ['app.js', 'text/javascript'], '/logic.js': ['logic.js', 'text/javascript'], '/content.js': ['content.js', 'text/javascript'], '/style.css': ['style.css', 'text/css'] };
const API = { '/api/chat': chat, '/api/handwriting': handwriting, '/api/state': state, '/api/status': status };

http.createServer((req, res) => {
  const path = new URL(req.url, 'http://x').pathname;
  if (API[path]) return API[path](req, res);
  const f = FILES[path];
  if (!f || req.method !== 'GET') return res.writeHead(404).end('Not found');
  readFile(new URL('./public/' + f[0], import.meta.url)).then((d) => res.writeHead(200, { 'content-type': f[1] + '; charset=utf-8', 'cache-control': 'no-store' }).end(d), () => res.writeHead(500).end());
}).listen(PORT, HOST, async () => {
  const st = await statusData();
  console.log(`Process Reimagination on http://localhost:${PORT}\n  local model (Ollama): ${st.ollama.ok ? st.ollama.models.join(', ') || 'running, no models pulled' : 'not running'}\n  Claude: ${!st.anthropic.ok ? 'SDK not installed (npm install)' : st.anthropic.server ? 'server key set' : 'no server key (users can add their own in the app)'}\n  Storage: ${st.storage === 'supabase' ? 'Supabase' : st.storage === 'file' ? 'local files in data/sessions' : 'browser only'}`);
});