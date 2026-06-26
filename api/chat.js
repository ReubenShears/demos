// AI concierge for demo pages. The widget POSTs { messages, context } and gets back a short reply.
// Calls the Anthropic Messages API directly (keeps the demos repo dependency-free — no SDK/package.json).
// Goal of the assistant: explain Optimally, speak to the prospect's company, and drive a walkthrough booking.

const ALLOWED_HOST = 'demos.optimally.ltd';
const MODEL = process.env.CHAT_MODEL || 'claude-haiku-4-5';  // cheap + fast; the system prompt does the heavy lifting. Swap via env, no code edit.
const API_KEY = process.env.ANTHROPIC_API_KEY;

// Scrub anything that reads as "AI": em/en dashes -> hyphens, strip stray markdown.
function clean(s){
  return (s || '')
    .replace(/[—–]/g, '-')      // em / en dash -> hyphen (dead giveaway otherwise)
    .replace(/\*\*?/g, '')                // strip ** bold / * italic markers
    .replace(/^#{1,6}\s+/gm, '')          // strip markdown headings
    .replace(/^\s*[-*•]\s+/gm, '')   // strip leading bullet markers
    .replace(/\n{3,}/g, '\n\n')           // cap runs of blank lines
    .trim();
}

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

  const system = `You are the Optimally team's AI assistant, embedded in a live demo landing page that Optimally built for ${company}.

ABOUT OPTIMALLY (use this to answer accurately):
Optimally builds complete, done-for-you client-acquisition machines for founder-led expert businesses — coaches, consultants and agencies — who run on referrals and word-of-mouth and want a predictable, owned channel for booking qualified sales calls. Most agencies hand you a page and leave you to find the traffic; Optimally builds the whole machine AND drives the first wave of demand from contacts you already have.
The system is built around three things: (1) Offer mapping — a private 1:1 session that sharpens your offer until it's irresistible, which everything else flows from; (2) The Conversion Engine — a landing page engineered to turn a click into a warm, pre-sold call (a headline that earns the click, a video that does the selling, one clear call to action) — THIS demo page is a taste of that; (3) A Sell-While-You-Sleep VSL — a scripted, edited video sales letter that pre-handles objections so every call you take is warm and pre-framed.
It also reactivates the leads already sitting in your inbox and CRM with done-for-you outreach to forgotten conversations, gives you a proven call-closing framework, and weekly strategy support. It is fully done-for-you — the only thing the client does is record the VSL script Optimally writes for them.
Guarantee: the system books your first 5 sales calls within 90 days, or Optimally keeps working free until it does (for businesses with a list of contacts to reactivate). The risk sits with Optimally, not the client.
Longer term, once it is proven and paying for itself, Optimally can run your paid acquisition together as a revenue-share partner — they only win when you win.

ABOUT THIS DEMO:
This page is a free, live preview Optimally built for ${company} - a vision of what a high-converting funnel could look like for this business, to show the quality before any conversation. Demo context: ${title}${description ? ' - ' + description : ''}.
IMPORTANT: the video player shown on this very page IS the VSL (video sales letter). On the demo it is a placeholder marking exactly where ${company}'s VSL will sit; in the full build Optimally scripts and edits the real one. When you mention the VSL, refer to the video already on this page (e.g. "the video on this page" / "the video you can see here") - never describe the VSL as a separate, extra or future asset.
The next step is a free walkthrough where the team shows the strategy behind it and exactly how the full system would run for ${company}.

YOUR JOB (in priority order):
1. Be genuinely helpful, personal and concise.
2. Quickly tie their question to the bigger picture: how this page slots into Optimally's full client-getting system, and how that system brings ${company} more clients.
3. Push toward the walkthrough SWIFTLY. The walkthrough is where the team shows exactly how this plugs into the rest of the system and how it gets ${company} more clients - that is the hook. Don't drift through endless Q&A; after one or two useful answers, actively invite them to book by tapping the "Book a walkthrough" button at the top of this chat.

RULES:
- LENGTH IS THE MOST IMPORTANT RULE: reply in AT MOST 2 short sentences, then one short question. Under 45 words total. NEVER write paragraphs or explain the whole system - make the single most relevant point, then pivot to the question. This example shows the right length and feel: "That video is your VSL - it pre-sells visitors so every call you get is already warm. Want to jump on a quick walkthrough to see how it fits the full system and brings ${company} more clients?"
- In MOST replies your closing question should invite them onto the walkthrough call - framed as where they see how this slots into the full system and gets ${company} more clients. Only ask a pure discovery question when you genuinely need one detail to stay useful. Never end on a statement.
- Plain conversational text ONLY. Never use markdown, asterisks, bold, bullet points, headings or pasted URLs (there is already a "Book a walkthrough" button - refer to it). Use normal hyphens "-" only; NEVER use em dashes or en dashes.
- NEVER discuss, quote, estimate or hint at price, cost, fees, packages or budget - you do not know the price. If asked, say the walkthrough is where the team covers pricing and fit, then ask a question that steers back to how it would work for ${company}.
- Do not over-promise or invent specifics about ${company} you were not given - speak generally or ask. Present the guarantee accurately (5 booked calls or we keep working free), never as a revenue or income promise.
- You represent the Optimally team but are their AI assistant - if asked directly whether you are a bot, say so honestly. Warm, sharp and direct.`;

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: MODEL, max_tokens: 150, system, messages: msgs }),
    });
    if (!r.ok) return fallback("I'm having a moment — tap Book a walkthrough below and the team will pick it up.");
    const data = await r.json();
    if (data.stop_reason === 'refusal') {
      return fallback("Let's keep it to the demo and how Optimally can help " + company + '. Want to book a quick walkthrough?');
    }
    const text = clean(Array.isArray(data.content)
      ? data.content.filter((b) => b.type === 'text').map((b) => b.text).join('')
      : '');
    return fallback(text || ('Happy to help - what would you like to know about how this would work for ' + company + '?'));
  } catch (e) {
    return fallback("I'm having trouble connecting right now. Tap Book a walkthrough below and we'll take it from there.");
  }
}
