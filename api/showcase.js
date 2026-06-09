// /api/showcase — students submit their live project link.
// Reads are public (client uses the publishable key). POST is gated by the entry
// cookie (cc_gate) and writes with the Supabase secret key (bypasses RLS).
import crypto from 'node:crypto';
import { SUPABASE } from '../assets/config.mjs';

const SECRET = process.env.SESSION_SECRET || 'dev-insecure-secret-change-me';
const HUB_PASSWORD = process.env.HUB_PASSWORD || '';
const SUPA_SECRET = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const hmac = (s) => crypto.createHmac('sha256', SECRET).update(String(s)).digest('hex');
function validGate(req) {
  if (!HUB_PASSWORD) return true; // gate open in preview → allow submits
  const jar = {};
  (req.headers.cookie || '').split(';').forEach((c) => { const i = c.indexOf('='); if (i > -1) jar[c.slice(0, i).trim()] = decodeURIComponent(c.slice(i + 1).trim()); });
  const t = jar.cc_gate; if (!t || !t.includes('.')) return false;
  const [exp, h] = t.split('.');
  if (!exp || !h || Date.now() > Number(exp)) return false;
  const good = hmac(exp);
  if (h.length !== good.length) return false;
  try { return crypto.timingSafeEqual(Buffer.from(h), Buffer.from(good)); } catch { return false; }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!validGate(req)) return res.status(401).json({ error: 'enter the class first' });
  if (!SUPA_SECRET || !SUPABASE.url) return res.status(503).json({ error: 'not configured' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  let { name = '', title = '', url = '' } = body || {};
  name = String(name).trim().slice(0, 60);
  title = String(title).trim().slice(0, 100);
  url = String(url).trim().slice(0, 300);
  if (!name) return res.status(400).json({ error: 'add your name' });
  if (!/^https?:\/\/.+\..+/.test(url)) return res.status(400).json({ error: 'add a valid link starting with https://' });
  let host = '';
  try { host = new URL(url).hostname.toLowerCase(); } catch { return res.status(400).json({ error: 'that link doesn\'t look valid' }); }
  if (host === 'localhost' || host === '0.0.0.0' || host === '::1' || host.startsWith('127.') || host.endsWith('.local')) {
    return res.status(400).json({ error: 'That looks like a localhost link — it only works on your computer. Paste your live Vercel or GitHub Pages URL.' });
  }

  try {
    const r = await fetch(`${SUPABASE.url}/rest/v1/showcase`, {
      method: 'POST',
      headers: { apikey: SUPA_SECRET, Authorization: `Bearer ${SUPA_SECRET}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({ name, title: title || null, url }),
    });
    if (!r.ok) { console.error('showcase insert', r.status, await r.text()); return res.status(502).json({ error: 'save failed' }); }
    return res.status(200).json({ ok: true });
  } catch (e) { console.error(e); return res.status(500).json({ error: 'save failed' }); }
}
