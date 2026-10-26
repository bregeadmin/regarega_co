// Vercel serverless function: booking REQUEST from a flat page on regarega.co.
// Two jobs: (1) write the request into Rega OS via the create_booking_request RPC
// (anon-granted, status hard-locked to 'request'/'pending' — never revenue);
// (2) send a duplicate alert to the operator Telegram. Honeypot + light rate limit.
//
// Env (Vercel):
//   TELEGRAM_BOT_TOKEN  — @regarega_contact_bot (same bot as /contact)
//   TELEGRAM_CHAT_ID    — operator chat the bot posts to
//   PUBLIC_SUPABASE_URL / PUBLIC_SUPABASE_ANON_KEY — optional; fall back to the
//                         publishable values shipped in the client (safe to embed).

const SB_URL = process.env.PUBLIC_SUPABASE_URL || 'https://qkzinjawtumhjbezlyog.supabase.co';
const SB_KEY = process.env.PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_R0NeSmTwX9qt0bxlHYj1AA_JIVRqsqU';

// naive in-memory rate limit (per warm instance) — same spirit as contact.js
const HITS = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const win = 60 * 1000, max = 5;
  const arr = (HITS.get(ip) || []).filter((t) => now - t < win);
  arr.push(now);
  HITS.set(ip, arr);
  return arr.length > max;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const KNOWN_ERR = new Set(['no_profile', 'bad_dates', 'unavailable', 'unknown_apartment', 'no_contact']);

// Same request alert as the website form, sent best-effort.
async function notifyTelegram({ aptTitle, apartment_id, ci, co, adults, amount, currency, name, contactLine }) {
  const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT = process.env.TELEGRAM_CHAT_ID;
  if (!(TOKEN && CHAT)) return;
  const nights = (() => {
    const a = new Date(ci + 'T00:00:00'), b = new Date(co + 'T00:00:00');
    return Math.max(0, Math.round((b - a) / 86400000));
  })();
  const sum = (Number.isFinite(amount) && amount) ? `${currency === 'gel' ? '₾' : '$'}${amount}` : '—';
  const text =
    'regarega.co — booking request\n\n' +
    'flat: ' + (aptTitle || apartment_id) + '\n' +
    'dates: ' + ci + ' → ' + co + ' (' + nights + ' nights)\n' +
    'guests: ' + adults + '\n' +
    'quote: ' + sum + '\n\n' +
    'name: ' + name + '\n' +
    contactLine + '\n\n' +
    '→ confirm or decline in Rega OS';
  try {
    await fetch('https://api.telegram.org/bot' + TOKEN + '/sendMessage', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT, text, disable_web_page_preview: true }),
    });
  } catch (e) { /* ignore — the request is already saved */ }
}

// In-app path: the guest's own access token makes auth.uid() the guest inside the RPC.
async function handleGuest(req, res, token, q) {
  const { apartment_id, ci, co, adults, amount, currency, aptTitle } = q;
  if (!UUID_RE.test(apartment_id) || !DATE_RE.test(ci) || !DATE_RE.test(co)) {
    return res.status(400).json({ ok: false, error: 'missing' });
  }
  const headers = { apikey: SB_KEY, Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' };
  let out;
  try {
    const r = await fetch(SB_URL + '/rest/v1/rpc/create_my_booking_request', {
      method: 'POST', headers,
      body: JSON.stringify({
        p_apartment: apartment_id, p_ci: ci, p_co: co, p_adults: adults,
        p_amount: Number.isFinite(amount) ? amount : null, p_currency: currency,
      }),
    });
    if (r.status === 401 || r.status === 403) return res.status(401).json({ ok: false, error: 'auth' });
    if (!r.ok) return res.status(400).json({ ok: false, error: 'rejected' });   // raised DB error — never echoed
    out = await r.json();
  } catch (e) {
    return res.status(502).json({ ok: false, error: 'db' });
  }
  if (!out || out.ok !== true || !out.guest_token) {
    const code = out && KNOWN_ERR.has(out.error) ? out.error : 'rejected';
    return res.status(code === 'no_profile' ? 409 : 400).json({ ok: false, error: code });
  }

  // name/contact for the operator alert come from the guest's profile (best-effort)
  let name = '—', contactLine = 'contact: —';
  try {
    const pr = await fetch(SB_URL + '/rest/v1/rpc/my_guest_profile', { method: 'POST', headers, body: '{}' });
    if (pr.ok) {
      const p = await pr.json();
      if (p) {
        name = String(p.name || '—').slice(0, 120);
        const bits = [p.email && 'email: ' + p.email, p.phone && 'phone: ' + p.phone].filter(Boolean);
        if (bits.length) contactLine = bits.join('\n').slice(0, 300);
      }
    }
  } catch (e) { /* alert still goes out */ }

  await notifyTelegram({ aptTitle, apartment_id, ci, co, adults, amount, currency, name, contactLine });
  return res.status(200).json({ ok: true, id: out.booking_id, guest_token: out.guest_token });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  body = body || {};

  // honeypot — bots fill the hidden field; pretend success, do nothing
  if (String(body.company || '').trim()) return res.status(200).json({ ok: true });

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (rateLimited(ip)) return res.status(429).json({ ok: false, error: 'rate' });

  const clip = (v, n) => String(v == null ? '' : v).trim().slice(0, n);
  const apartment_id = clip(body.apartment_id, 64);
  const ci = clip(body.ci, 10);          // YYYY-MM-DD
  const co = clip(body.co, 10);
  const adults = Math.max(1, Math.min(20, parseInt(body.adults, 10) || 1));
  const name = clip(body.name, 120);
  const channel = clip(body.channel, 16).toLowerCase();
  const contact = clip(body.contact, 160);
  const amount = body.amount == null ? null : Number(body.amount);
  const currency = clip(body.currency, 8).toLowerCase() || 'usd';
  const aptTitle = clip(body.apt_title, 160);

  // signed-in guest (in-app booking): identity comes from the token, not the body
  const authz = String(req.headers.authorization || '');
  const bearer = /^Bearer\s+(\S+)$/i.exec(authz);
  if (bearer) return handleGuest(req, res, bearer[1], { apartment_id, ci, co, adults, amount, currency, aptTitle });

  if (!apartment_id || !ci || !co || !name || !contact) {
    return res.status(400).json({ ok: false, error: 'missing' });
  }
  if (!['telegram', 'whatsapp', 'email'].includes(channel)) {
    return res.status(400).json({ ok: false, error: 'channel' });
  }

  // 1) write the request via the whitelisted RPC (anon-granted, SECURITY DEFINER)
  let bookingId = null;
  try {
    const r = await fetch(SB_URL + '/rest/v1/rpc/create_booking_request', {
      method: 'POST',
      headers: { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        p_apartment: apartment_id, p_ci: ci, p_co: co, p_adults: adults,
        p_guest: name, p_channel: channel, p_contact: contact,
        p_amount: Number.isFinite(amount) ? amount : null, p_currency: currency,
      }),
    });
    if (!r.ok) {
      const t = await r.text();
      return res.status(502).json({ ok: false, error: 'db', detail: t.slice(0, 200) });
    }
    bookingId = await r.json();   // bigint id
  } catch (e) {
    return res.status(502).json({ ok: false, error: 'db' });
  }

  // 2) duplicate alert to the operator Telegram (best-effort — never blocks success)
  const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT = process.env.TELEGRAM_CHAT_ID;
  if (TOKEN && CHAT) {
    const nights = (() => {
      const a = new Date(ci + 'T00:00:00'), b = new Date(co + 'T00:00:00');
      return Math.max(0, Math.round((b - a) / 86400000));
    })();
    const sum = (Number.isFinite(amount) && amount) ? `${currency === 'gel' ? '₾' : '$'}${amount}` : '—';
    const text =
      'regarega.co — booking request\n\n' +
      'flat: ' + (aptTitle || apartment_id) + '\n' +
      'dates: ' + ci + ' → ' + co + ' (' + nights + ' nights)\n' +
      'guests: ' + adults + '\n' +
      'quote: ' + sum + '\n\n' +
      'name: ' + name + '\n' +
      channel + ': ' + contact + '\n\n' +
      '→ confirm or decline in Rega OS';
    try {
      await fetch('https://api.telegram.org/bot' + TOKEN + '/sendMessage', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ chat_id: CHAT, text, disable_web_page_preview: true }),
      });
    } catch (e) { /* ignore — the request is already saved */ }
  }

  return res.status(200).json({ ok: true, id: bookingId });
}
