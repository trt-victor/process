// Where session boards and coach chat are kept on the server, so nothing is lost when people switch device or refresh.
//   Supabase  — when SUPABASE_URL and a server key are set (Vercel, Azure, or locally). Table: supabase/schema.sql
//   Local file — otherwise, when running on your own machine: data/sessions/<id>.json (git-ignored)
//   None      — on Vercel without Supabase (read-only disk); the browser's localStorage still keeps everything.
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const URL_ = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_KEY || '';
const TABLE = process.env.SUPABASE_TABLE || 'sessions';
const DIR = new URL('./data/sessions/', import.meta.url);

export const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// The chat goes in its own column so it is easy to read in the Supabase table editor; the rest of the board is `state`.
const split = (s) => { const { chat = [], ...state } = s; return { state, chat }; };
const row = (id, s) => ({ id, team: s.name || null, mode: s.mode || null, process: s.caseName || null, stage: Number.isInteger(s.stage) ? s.stage : null, ...split(s), updated_at: new Date().toISOString() });

const supabase = {
  kind: 'supabase',
  headers() {
    // Legacy service_role keys are JWTs and also go in Authorization; new sb_secret_ keys only go in apikey.
    return { apikey: KEY, ...(KEY.startsWith('eyJ') ? { authorization: 'Bearer ' + KEY } : {}), 'content-type': 'application/json' };
  },
  async get(id) {
    const r = await fetch(`${URL_}/rest/v1/${TABLE}?id=eq.${id}&select=state,chat,updated_at`, { headers: this.headers() });
    if (!r.ok) throw new Error(`Supabase ${r.status}: ${(await r.text()).slice(0, 200)}`);
    const [x] = await r.json();
    return x ? { ...x.state, chat: x.chat || [] } : null;
  },
  async put(id, s) {
    const r = await fetch(`${URL_}/rest/v1/${TABLE}?on_conflict=id`, { method: 'POST', headers: { ...this.headers(), prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify(row(id, s)) });
    if (!r.ok) throw new Error(`Supabase ${r.status}: ${(await r.text()).slice(0, 200)}`);
  },
};

const file = {
  kind: 'file',
  async get(id) {
    try { const x = JSON.parse(await readFile(new URL(id + '.json', DIR), 'utf8')); return { ...x.state, chat: x.chat || [] }; } catch { return null; }
  },
  async put(id, s) {
    await mkdir(DIR, { recursive: true });
    await writeFile(new URL(id + '.json', DIR), JSON.stringify(row(id, s), null, 1));
  },
};

export const store = URL_ && KEY ? supabase : process.env.VERCEL ? null : file;
