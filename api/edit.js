// /api/edit — password gate for instructor edit mode.
// GET  -> { allowed: bool }   (allowed if no EDIT_PASSWORD set, or a valid cookie)
// POST { password } -> sets a signed cookie, { allowed: bool }
import crypto from 'node:crypto';

const SECRET = process.env.SESSION_SECRET || 'dev-insecure-secret-change-me';
const PASSWORD = process.env.EDIT_PASSWORD || '';

const hmac = (s) => crypto.createHmac('sha256', SECRET).update('edit:' + s).digest('hex');
const sign = (exp) => `${exp}.${hmac(exp)}`;

function validToken(token) {
  if (!token || !token.includes('.')) return false;
  const [exp, h] = token.split('.');
  if (!exp || !h || Date.now() > Number(exp)) return false;
  const good = hmac(exp);
  if (h.length !== good.length) return false;
  try { return crypto.timingSafeEqual(Buffer.from(h), Buffer.from(good)); } catch { return false; }
}

function samePassword(input) {
  const a = crypto.createHash('sha256').update(String(input)).digest();
  const b = crypto.createHash('sha256').update(PASSWORD).digest();
  return crypto.timingSafeEqual(a, b);
}

function cookies(req) {
  const out = {};
  (req.headers.cookie || '').split(';').forEach((c) => {
    const i = c.indexOf('=');
    if (i > -1) out[c.slice(0, i).trim()] = decodeURIComponent(c.slice(i + 1).trim());
  });
  return out;
}

export default function handler(req, res) {
  // No edit password set → editing is open (preview / local).
  if (!PASSWORD) return res.status(200).json({ allowed: true, note: 'no EDIT_PASSWORD set' });

  if (req.method === 'GET') {
    return res.status(200).json({ allowed: validToken(cookies(req).cc_edit) });
  }

  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
    const { password = '' } = body || {};
    if (password && samePassword(password)) {
      const ms = 24 * 3600 * 1000; // session day
      const exp = Date.now() + ms;
      res.setHeader('Set-Cookie', `cc_edit=${sign(exp)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${Math.floor(ms / 1000)}`);
      return res.status(200).json({ allowed: true });
    }
    return res.status(401).json({ allowed: false });
  }

  res.status(405).end();
}
