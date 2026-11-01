// Load a local .env file if present (KEY=VALUE per line, # for comments) so keys stay in a git-ignored file.
// Imported first by server.js so every module sees the values. The real environment (e.g. Vercel settings) wins.
import { readFileSync } from 'node:fs';

try {
  const txt = readFileSync(new URL('./.env', import.meta.url), 'utf8').replace(/^\uFEFF/, '');
  for (const line of txt.split(/\r?\n/)) {
    if (/^\s*(#|$)/.test(line)) continue;
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*?)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
  }
} catch { /* no .env file — use the real environment */ }
