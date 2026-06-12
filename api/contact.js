// Vercel serverless function: forwards the /contact form to a Telegram bot.
// Token + chat id live in Vercel env (never in client code):
//   TELEGRAM_BOT_TOKEN  — from @BotFather
//   TELEGRAM_CHAT_ID    — operator chat/group the bot can post to
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false });

  const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT = process.env.TELEGRAM_CHAT_ID;
  if (!TOKEN || !CHAT) return res.status(500).json({ ok: false, error: 'not_configured' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  body = body || {};

  // honeypot — bots fill hidden field; pretend success, send nothing
  if (String(body.company || '').trim()) return res.status(200).json({ ok: true });

  const clip = (v, n) => String(v == null ? '' : v).trim().slice(0, n);
  const name = clip(body.name, 120);
  const contact = clip(body.contact, 160);
  const subject = clip(body.subject, 160);
  const message = clip(body.message, 4000);
  if (!name || !contact || !message) return res.status(400).json({ ok: false, error: 'missing' });

  const text =
    'regarega.co — new message\n\n' +
    'name: ' + name + '\n' +
    'contact: ' + contact + '\n' +
    'subject: ' + (subject || '—') + '\n\n' +
    message;

  try {
    const r = await fetch('https://api.telegram.org/bot' + TOKEN + '/sendMessage', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT, text, disable_web_page_preview: true }),
    });
    if (!r.ok) return res.status(502).json({ ok: false });
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(502).json({ ok: false });
  }
}
