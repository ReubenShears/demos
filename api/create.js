// Password-gated trigger for the demo builder.
// Checks the password server-side (env CREATE_PASSWORD), then fires the build-demo
// webhook so the page never exposes the trigger or any secret.

const BUILD_WEBHOOK = process.env.BUILD_WEBHOOK_URL || 'https://optimally.app.n8n.cloud/webhook/build-demo';

function slugFor(url) {
  try {
    return new URL(url).hostname.replace(/^www\./i, '').split('.')[0].toLowerCase() || 'demo';
  } catch {
    return 'demo';
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const expected = process.env.CREATE_PASSWORD;
  if (!expected) {
    return res.status(500).json({ error: 'Server not configured (no password set).' });
  }

  // Vercel parses JSON bodies automatically; guard for string bodies too.
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  body = body || {};

  const { password, url, action } = body;

  if (!password || password !== expected) {
    return res.status(401).json({ error: 'Wrong password.' });
  }

  // Just verifying the password (unlock screen) — don't fire anything.
  if (action === 'verify') {
    return res.status(200).json({ ok: true });
  }

  if (!url || !/^https?:\/\//i.test(url)) {
    return res.status(400).json({ error: 'Enter a valid URL (including https://).' });
  }

  try {
    const fireUrl = BUILD_WEBHOOK + '?url=' + encodeURIComponent(url);
    const r = await fetch(fireUrl, { method: 'GET' });
    if (!r.ok && r.status !== 200) {
      return res.status(502).json({ error: 'Build webhook returned ' + r.status + '. Is the n8n workflow active?' });
    }
    const slug = slugFor(url);
    return res.status(200).json({ ok: true, slug, liveUrl: 'https://demos.optimally.ltd/' + slug });
  } catch (e) {
    return res.status(502).json({ error: 'Could not reach the build webhook.' });
  }
}
