// /api/ask — the Claude-mascot helper, powered by Google Gemini.
// The assistant's knowledge is assembled from the same content the site shows,
// so it always knows the current class material.
import { CONTENT, REFERENCE, COURSE } from '../assets/content.mjs';

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const KEY = process.env.GEMINI_KEY || process.env.GEMINI_API_KEY || '';

const strip = (s) => s.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

function knowledge() {
  let k = `${COURSE.title}: ${COURSE.tagline}\n${COURSE.blurb}\n\n`;
  for (const page of Object.values(CONTENT)) {
    k += `## ${page.title}\n`;
    for (const sec of page.sections) k += strip(sec.html) + '\n';
    k += '\n';
  }
  k += '## Glossary\n';
  for (const r of REFERENCE) k += `- ${r.term}: ${r.def}${r.meta ? ' (Metaphor: ' + r.meta + ')' : ''}\n`;
  return k;
}

const SYSTEM = `You are the friendly "Claude helper" mascot for ClaudeClass, a hands-on course that teaches COMPLETE BEGINNERS how to use Claude Code.

Voice & rules:
- Warm, encouraging, plain English. Assume zero coding knowledge.
- Keep answers short (2-4 sentences). Use a simple metaphor when it helps.
- Encourage "learn by doing" — nudge them to try things.
- Only answer questions about this class, Claude Code, or beginner coding/web concepts. If asked something off-topic, gently steer back.
- If you don't know, say so and suggest asking the instructor.

Everything you know about this class:
${knowledge()}`;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  if (!KEY) {
    return res.status(200).json({
      text: "I'm not connected to my brain yet — the GEMINI_KEY hasn't been added. Meanwhile, the Reference and FAQ pages have great answers!",
    });
  }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  const messages = Array.isArray(body?.messages) ? body.messages : [];

  const contents = messages.map((m) => ({
    role: m.role === 'model' ? 'model' : 'user',
    parts: [{ text: String(m.text || '').slice(0, 2000) }],
  }));

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`;
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM }] },
        contents,
        generationConfig: { maxOutputTokens: 600, temperature: 0.6 },
      }),
    });
    if (!r.ok) {
      const err = await r.text();
      console.error('Gemini error', r.status, err);
      return res.status(200).json({ text: "I hit a snag reaching my brain. Try again in a moment, or check the Reference page.", _debug: { status: r.status, model: MODEL, err: err.slice(0, 400) } });
    }
    const data = await r.json();
    const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') ||
      "Hmm, I didn't catch that — could you rephrase?";
    return res.status(200).json({ text });
  } catch (e) {
    console.error(e);
    return res.status(200).json({ text: "I'm having trouble connecting right now. The Reference and FAQ pages can help in the meantime!", _debug: { caught: String(e).slice(0, 400), model: MODEL } });
  }
}
