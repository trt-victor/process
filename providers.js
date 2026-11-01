// Model providers for the coach. To add one, add an entry with:
//   status()  -> { ok, models, ... } shown in the app's AI settings
//   stream()  -> async generator of text chunks, given { system, messages, model, effort, json, key }
const OLLAMA = (process.env.OLLAMA_URL || 'http://127.0.0.1:11434').replace(/\/$/, '');
const CLAUDE_MODEL = process.env.MODEL || 'claude-opus-5-5';
const serverKey = () => !!(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN || process.env.ANTHROPIC_PROFILE);
let Anthropic = null;
try { Anthropic = (await import('@anthropic-ai/sdk')).default; } catch { /* SDK not installed: Claude is unavailable, the rest works */ }

export const providers = {
  // A model running on this machine through Ollama (https://ollama.com). Nothing leaves the computer.
  ollama: {
    async status() {
      if (process.env.VERCEL && !process.env.OLLAMA_URL) return { ok: false, models: [] }; // no local model in the cloud
      try {
        const r = await fetch(OLLAMA + '/api/tags', { signal: AbortSignal.timeout(1500) });
        return { ok: r.ok, models: ((await r.json()).models || []).map((m) => m.name) };
      } catch { return { ok: false, models: [] }; }
    },
    async *stream({ system, messages, model, json }) {
      const r = await fetch(OLLAMA + '/api/chat', { method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ model: model || process.env.OLLAMA_MODEL || 'mistral', stream: true, format: json ? 'json' : undefined, messages: [{ role: 'system', content: system }, ...messages] }) });
      if (!r.ok) throw new Error(`Ollama ${r.status}: ${(await r.text()).slice(0, 200)}`);
      const dec = new TextDecoder();
      let buf = '';
      for await (const chunk of r.body) { // newline-delimited JSON
        buf += dec.decode(chunk, { stream: true });
        for (let i; (i = buf.indexOf('\n')) >= 0;) {
          const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
          if (!line) continue;
          const j = JSON.parse(line);
          if (j.error) throw new Error(j.error);
          if (j.message?.content) yield j.message.content;
        }
      }
    },
  },

  // Claude through the Anthropic API: the server's key (env) or a key the user entered in the app for this request.
  anthropic: {
    async status() { return { ok: !!Anthropic, server: !!Anthropic && serverKey(), models: [CLAUDE_MODEL] }; },
    async *stream({ system, messages, effort, key }) {
      if (!Anthropic || !(key || serverKey())) throw new Error('No Anthropic credentials');
      const client = key ? new Anthropic({ apiKey: key }) : new Anthropic();
      const s = client.beta.messages.stream({
        model: CLAUDE_MODEL, max_tokens: 32000, system, messages,
        output_config: { effort: effort === 'medium' ? 'medium' : 'low' },
        betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default', // on a safety refusal, the API retries on a fallback model
      });
      for await (const ev of s) if (ev.type === 'content_block_delta' && ev.delta.type === 'text_delta') yield ev.delta.text;
      if ((await s.finalMessage()).stop_reason === 'refusal') throw new Error('The model declined this request');
    },
    // Read a handwritten sticky note (PNG data URL from the pen pad) and return plain text.
    async transcribe({ image, key }) {
      if (!Anthropic || !(key || serverKey())) throw new Error('No Anthropic credentials');
      const client = key ? new Anthropic({ apiKey: key }) : new Anthropic();
      const [, media_type, data] = image.match(/^data:(image\/(?:png|jpeg|webp));base64,(.+)$/) || [];
      if (!data) throw Object.assign(new Error('Bad image'), { status: 400 });
      const r = await client.messages.create({
        model: process.env.HANDWRITING_MODEL || CLAUDE_MODEL, max_tokens: 400,
        system: 'You transcribe handwriting from workshop sticky notes. Reply with only the words written on the note, keeping line breaks. Fix obvious letter-shape ambiguity using context, but do not add, summarise or translate anything. If nothing legible is written, reply with an empty string.',
        messages: [{ role: 'user', content: [{ type: 'image', source: { type: 'base64', media_type, data } }, { type: 'text', text: 'Transcribe this sticky note.' }] }],
      });
      return r.content.filter((b) => b.type === 'text').map((b) => b.text).join('').trim().replace(/^"(.*)"$/s, '$1');
    },
  },
};
