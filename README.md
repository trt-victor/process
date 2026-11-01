# Process Reimagination

A self-guided version of the reimagination workshop: sticky-note boards, a coach chat, warm-up games, and a working prototype at the end.

```bash
npm install
npm start        # http://localhost:4173
npm test
```

**Three sessions**

- **Full Reimagination** (7 stages): Today's Reality → Jobs-to-be-Done (human / AI / both) → Dream State → AI-Powered Scenario → Prioritize → Deep Dive & Prototype → Present Back.
- **Quick Spot & Rethink** (3 stages, the group template): Spot (goal, six signals, one process) → Rethink and Tell (Value Blueprint, three client questions, mail draft) → Prototype.
- **SPOT Lab** (5 rounds, 90 min, the SPOT training method as a game): Why Spot → Round S Signal Hunt → Round P Probe without pitching → Round O Spot card against the strong-spot bar → Round T Tell, leaderboard and Spot Sprint. No prototype: a spot is not a solution.

**Processes.** Twelve fictional cases, a blank board, or describe your own on the home screen (split into steps offline; a full case with evidence and client brief when a model is connected). Changing the process, on the home screen or in the case brief, replaces the steps.

**Coach and AI.** The app works without any model (guide mode: scripted hints, offline scenario, built-in prototype). People choose their model in the app under ⚙ AI settings:

- **Local model (Ollama):** runs on the machine hosting the app; nothing leaves it. Install [Ollama](https://ollama.com), then `ollama pull mistral`. The app lists whatever models are pulled.
- **Claude with your own API key:** each person enters their key in the app. It is kept in that browser and sent with each request; the server passes it on and never stores or logs it.
- **Claude with a server key:** the host sets `ANTHROPIC_API_KEY` (in `.env` locally, or in Vercel's environment variables) and everyone uses it.

Server settings: `PORT` (4173), `OLLAMA_URL` (`http://127.0.0.1:11434`), `MODEL` (`claude-opus-5-5`). To add another provider, add an entry to `providers.js`.

**Where things live**

- `public/content.js`: all stages, cases, questions and games. Edit here to change the exercise.
- `public/logic.js`: pure logic (coach fallback, scenario and prototype builders, game scoring), covered by `logic.test.js`.
- `public/app.js`, `style.css`: UI. `server.js`: local server. `handlers.js`: the API (coach proxy, handwriting, session storage), shared with the Vercel functions in `api/`. `providers.js`: the model providers (Ollama, Claude). `store.js`: session storage (Supabase or local files).

**Handwriting (touchscreens).** Every board zone has a ✎ button and every sticky note a ✎ in its corner: write with a finger or stylus on the big note, then tap **Convert to text**. It uses the browser's own handwriting recognizer where there is one, otherwise Claude (vision). Without AI the drawing is kept on the note and can be converted later. Once a stylus touches the pad, finger/palm touches are ignored.

**Saving sessions.** Progress is always saved in the browser. With server storage, every board and its coach chat are also saved on the server, and the URL becomes `…/?s=<session id>`: refresh, switch tab or open that link (⇄ Session link) on another device to continue.

- **Vercel + Supabase:** set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (the secret key). Run `supabase/schema.sql` once in the Supabase SQL editor.
- **Locally:** without Supabase settings, sessions go to `data/sessions/*.json` (git-ignored). Supabase settings in `.env` work locally too.

**Deploy on Vercel.** Import the GitHub repo in Vercel (framework: Other; `vercel.json` already serves `public/` and turns `api/*.js` into functions). Under Settings → Environment Variables add `ANTHROPIC_API_KEY`, `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`, then redeploy. Locally, the same names go in `.env` (see `.env.example`). On Azure App Service, run `npm start` with the same settings as App Settings.

**Continue to Build.** The last stage of the Full and Quick sessions has a "Continue to Build" button. It opens the AI Builder app (`../ai-builder`, `BUILDER_URL`, default `http://localhost:4280`) and hands the session over as a draft build.

Sample cases are fictional.
