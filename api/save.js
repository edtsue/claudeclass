// /api/save — writes content to Supabase. Gated by the EDIT_PASSWORD cookie
// (cc_edit) and uses the Supabase SECRET key server-side (bypasses RLS), so the
// public/publishable key can never write. POST { key, html }.
import crypto from 'node:crypto';
import { SUPABASE } from '../assets/config.mjs';

const SECRET = process.env.SESSION_SECRET || 'dev-insecure-secret-change-me';
const SUPA_SECRET = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const hmac = (s) => crypto.createHmac('sha256', SECRET).update('edit:' + s).digest('hex');

function validEditCookie(req) {
  const jar = {};
  (req.headers.cookie || '').split(';').forEach((c) => {
    const i = c.indexOf('='); if (i > -1) jar[c.slice(0, i).trim()] = decodeURIComponent(c.slice(i + 1).trim());
  });
  const token = jar.cc_edit;
  if (!token || !token.includes('.')) return false;
  const [exp, h] = token.split('.');
  if (!exp || !h || Date.now() > Number(exp)) return false;
  const good = hmac(exp);
  if (h.length !== good.length) return false;
  try { return crypto.timingSafeEqual(Buffer.from(h), Buffer.from(good)); } catch { return false; }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  // If EDIT_PASSWORD is set, require a valid edit session. (If unset, editing is open in preview.)
  if (process.env.EDIT_PASSWORD && !validEditCookie(req)) return res.status(401).json({ error: 'not authorized' });
  if (!SUPA_SECRET || !SUPABASE.url) return res.status(503).json({ error: 'cloud save not configured' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  const { key, html } = body || {};
  if (!key || typeof html !== 'string') return res.status(400).json({ error: 'missing key/html' });

  try {
    const r = await fetch(`${SUPABASE.url}/rest/v1/hub_content?on_conflict=key`, {
      method: 'POST',
      headers: {
        apikey: SUPA_SECRET,
        Authorization: `Bearer ${SUPA_SECRET}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify({ key, html, updated_at: new Date().toISOString() }),
    });
    if (!r.ok) {
      const err = await r.text();
      console.error('Supabase save error', r.status, err);
      return res.status(502).json({ error: 'save failed' });
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'save failed' });
  }
}
