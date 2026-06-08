// /api/gate — shared access gate for the hub.
// GET  -> { open: bool }   (open if no password configured, or a valid cookie)
// POST { password, remember } -> sets a signed cookie, { open: bool }
import crypto from 'node:crypto';

const SECRET = process.env.SESSION_SECRET || 'dev-insecure-secret-change-me';
const PASSWORD = process.env.HUB_PASSWORD || '';

const hmac = (s) => crypto.createHmac('sha256', SECRET).update(String(s)).digest('hex');
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
  // No password set → the hub is open (preview / local / pre-config).
  if (!PASSWORD) return res.status(200).json({ open: true, note: 'no HUB_PASSWORD set' });

  if (req.method === 'GET') {
    return res.status(200).json({ open: validToken(cookies(req).cc_gate) });
  }

  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
    const { password = '', remember = false } = body || {};
    if (password && samePassword(password)) {
      const ms = remember ? 5 * 24 * 3600 * 1000 : 24 * 3600 * 1000;
      const exp = Date.now() + ms;
      const base = `cc_gate=${sign(exp)}; HttpOnly; Secure; SameSite=Lax; Path=/`;
      // remember -> persistent (Max-Age 5d); otherwise a session cookie.
      res.setHeader('Set-Cookie', remember ? `${base}; Max-Age=${Math.floor(ms / 1000)}` : base);
      return res.status(200).json({ open: true });
    }
    return res.status(401).json({ open: false });
  }

  res.status(405).end();
}
