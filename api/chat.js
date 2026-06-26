// AI concierge for demo pages. The widget POSTs { messages, context } and gets back a short reply.
// Calls the Anthropic Messages API directly (keeps the demos repo dependency-free — no SDK/package.json).
// Goal of the assistant: explain Optimally, speak to the prospect's company, and drive a walkthrough booking.

const ALLOWED_HOST = 'demos.optimally.ltd';
const MODEL = process.env.CHAT_MODEL || 'claude-haiku-4-5';  // cheap + fast; the system prompt does the heavy lifting. Swap via env, no code edit.
const API_KEY = process.env.ANTHROPIC_API_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Same-origin gate (demo pages only)
  const ref = req.headers.origin || req.headers.referer || '';
  if (ref && !ref.includes(ALLOWED_HOST)) return res.status(403).json({ error: 'Forbidden' });

  // Always answer gracefully so the widget never shows a hard error.
  const fallback = (msg) => res.status(200).json({ reply: msg });

  if (!API_KEY) return fallback("I'm not fully switched on yet — tap Book a walkthrough below and the team will help you directly.");

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  body = body || {};

  const ctx = body.context || {};
  const company = (ctx.company || 'this business').toString().slice(0, 80);
  const title = (ctx.title || '').toString().slice(0, 200);
  const description = (ctx.description || '').toString().slice(0, 400);
  const bookingUrl = (ctx.bookingUrl || 'https://www.optimally.ltd/demo').toString().slice(0, 300);

  let msgs = Array.isArray(body.messages) ? body.messages : [];
  msgs = msgs
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }))
    .slice(-12);
  if (!msgs.length || msgs[0].role !== 'user') {
    return fallback('Ask me anything about this demo, how it would work for ' + company + ', or tap Book a walkthrough below.');
  }

  const system = `You are Optimally's AI assistant, embedded in a live demo landing page that Optimally built for ${company}.

Optimally is a growth agency that builds done-for-you client-acquisition systems — VSL sales funnels, landing pages, and automations — for B2B businesses. This page is a free preview Optimally created to show ${company} what is possible.
Demo context: ${title}${description ? ' — ' + description : ''}.

Your job, in priority order:
1. Be genuinely helpful and concise — 2 to 4 short sentences. No fluff, no hype, no emoji spam.
2. Speak to ${company}'s situation specifically where you can; explain how a funnel like this would work for them.
3. Guide the visitor toward the next step: booking a free walkthrough where the team shows the strategy behind this and exactly how it would run for ${company}. When they show interest or ask what is next, point them to book here: ${bookingUrl}

Rules: never invent specific facts about ${company} you were not given — speak generally or ask. Do not quote prices or make guarantees; for specifics, recommend the walkthrough. You are an AI assistant, not a human — say so if asked. Keep it warm, sharp and direct. Stay on topic and gently steer back if the conversation drifts.`;

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: MODEL, max_tokens: 500, system, messages: msgs }),
    });
    if (!r.ok) return fallback("I'm having a moment — tap Book a walkthrough below and the team will pick it up.");
    const data = await r.json();
    if (data.stop_reason === 'refusal') {
      return fallback("Let's keep it to the demo and how Optimally can help " + company + '. Want to book a quick walkthrough?');
    }
    const text = Array.isArray(data.content)
      ? data.content.filter((b) => b.type === 'text').map((b) => b.text).join('').trim()
      : '';
    return fallback(text || ('Happy to help — what would you like to know about how this would work for ' + company + '?'));
  } catch (e) {
    return fallback("I'm having trouble connecting right now. Tap Book a walkthrough below and we'll take it from there.");
  }
}
