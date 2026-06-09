// /api/waitlist — instructor adds/removes waitlist names. Gated by the edit cookie
// (cc_edit / EDIT_PASSWORD); writes with the Supabase secret key. Reads are public.
import crypto from 'node:crypto';
import { SUPABASE } from '../assets/config.mjs';

const SECRET = process.env.SESSION_SECRET || 'dev-insecure-secret-change-me';
const EDIT_PASSWORD = process.env.EDIT_PASSWORD || '';
const SUPA_SECRET = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const hmac = (s) => crypto.createHmac('sha256', SECRET).update('edit:' + s).digest('hex');
function validEdit(req) {
  if (!EDIT_PASSWORD) return true; // open in preview
  const jar = {};
  (req.headers.cookie || '').split(';').forEach((c) => { const i = c.indexOf('='); if (i > -1) jar[c.slice(0, i).trim()] = decodeURIComponent(c.slice(i + 1).trim()); });
  const t = jar.cc_edit; if (!t || !t.includes('.')) return false;
  const [exp, h] = t.split('.');
  if (!exp || !h || Date.now() > Number(exp)) return false;
  const good = hmac(exp);
  if (h.length !== good.length) return false;
  try { return crypto.timingSafeEqual(Buffer.from(h), Buffer.from(good)); } catch { return false; }
}

const supa = (path, opts) => fetch(`${SUPABASE.url}/rest/v1/${path}`, {
  ...opts,
  headers: { apikey: SUPA_SECRET, Authorization: `Bearer ${SUPA_SECRET}`, 'Content-Type': 'application/json', Prefer: 'return=minimal', ...(opts.headers || {}) },
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!validEdit(req)) return res.status(401).json({ error: 'edit mode required' });
  if (!SUPA_SECRET || !SUPABASE.url) return res.status(503).json({ error: 'not configured' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  const action = body?.action;

  try {
    if (action === 'add') {
      const name = String(body.name || '').trim().slice(0, 60);
      if (!name) return res.status(400).json({ error: 'name required' });
      const r = await supa('waitlist', { method: 'POST', body: JSON.stringify({ name }) });
      if (!r.ok) throw new Error(await r.text());
      return res.status(200).json({ ok: true });
    }
    if (action === 'remove') {
      const id = parseInt(body.id, 10);
      if (!id) return res.status(400).json({ error: 'id required' });
      const r = await supa(`waitlist?id=eq.${id}`, { method: 'DELETE' });
      if (!r.ok) throw new Error(await r.text());
      return res.status(200).json({ ok: true });
    }
    return res.status(400).json({ error: 'unknown action' });
  } catch (e) { console.error('waitlist', e); return res.status(502).json({ error: 'save failed' }); }
}
