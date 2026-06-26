// Same-origin beacon proxy for demo engagement events.
// The demo pages POST here (relative /api/track) instead of calling n8n directly, so the real
// webhook URL never appears in page source. This function checks the request origin, attaches the
// real visitor IP, signs the forward with a shared secret, and relays to the private n8n webhook.

const WEBHOOK = process.env.TRACK_WEBHOOK_URL;     // private n8n webhook (server-side only)
const SECRET = process.env.TRACK_SECRET || '';     // shared secret; n8n rejects forwards without it
const ALLOWED_HOST = 'demos.optimally.ltd';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  // Origin gate: if the request advertises an origin/referer and it isn't ours, drop it silently.
  // (Same-origin beacons send our host; cross-site abuse sends someone else's.)
  const ref = req.headers.origin || req.headers.referer || '';
  if (ref && !ref.includes(ALLOWED_HOST)) return res.status(204).end();

  if (!WEBHOOK) return res.status(204).end();

  // Body: sendBeacon sends text/plain, fetch may send JSON — handle both.
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  if (!body || typeof body !== 'object') body = {};

  // Real visitor IP (the function-to-n8n hop would otherwise mask it as Vercel's IP).
  const xff = (req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  const ip = xff || req.headers['x-real-ip'] || '';
  if (ip) body.ip = ip;

  try {
    await fetch(WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-track-secret': SECRET },
      body: JSON.stringify(body),
    });
  } catch (e) { /* fire-and-forget: never block the page */ }

  return res.status(204).end();
}
