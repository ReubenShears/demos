#!/usr/bin/env node
// Retarget every "Learn More" CTA to the partner tracking URL (new tab), force the real
// (Firecrawl-scraped) logo URL so the logo always renders, normalize the footer year, and
// place the generated page at <outRoot>/<slug>/index.html. Original (non-logo) image URLs are
// preserved on purpose (the user does NOT want Stitch's images localized).
//
// Handles CTAs rendered as <a> OR <button>, with or without nested spans.
//
// Usage: node place_demo.mjs <htmlPath> <slug> <outRoot> [logoUrl] [ctaBase]
//   htmlPath  path to the downloaded Stitch HTML
//   slug      partner slug, e.g. "unorthodox"
//   outRoot   the deploy root (local "D:/Claude Cowork/demos", or a cloned repo root)
//   logoUrl   the Firecrawl-scraped logo URL (branding.images.logo) — forced into the page so the
//             logo always shows. May also be supplied via the LOGO_URL env var.
//   ctaBase   optional, defaults to https://www.optimally.ltd/demo

import fs from 'node:fs';
import path from 'node:path';

const [, , htmlPath, slug, outRoot, logoArg, ctaBaseArg] = process.argv;
if (!htmlPath || !slug || !outRoot) {
  console.error('usage: node place_demo.mjs <htmlPath> <slug> <outRoot> [logoUrl] [ctaBase]');
  process.exit(1);
}
const ctaBase = ctaBaseArg || 'https://www.optimally.ltd/demo';
const target = `${ctaBase}?partner=${slug}`;
const logoUrl = (logoArg && logoArg.startsWith('http')) ? logoArg : (process.env.LOGO_URL || '');

let html = fs.readFileSync(htmlPath, 'utf8');

// --- Retarget CTAs ---------------------------------------------------------
// Match any <a> or <button> whose visible text (tags stripped) is exactly "Learn More".
// Preserve all attributes except href/target/rel/type/onclick; convert buttons to anchors.
const elRe = /<(a|button)\b([^>]*)>([\s\S]*?)<\/\1>/gi;
let count = 0;
html = html.replace(elRe, (m, _tag, attrs, inner) => {
  const text = inner.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  if (text !== 'Learn More') return m;
  count++;
  const cleaned = attrs
    .replace(/\s(href|target|rel|type|onclick)\s*=\s*"[^"]*"/gi, '')
    .replace(/\s(href|target|rel|type|onclick)\s*=\s*'[^']*'/gi, '')
    .trim();
  const sep = cleaned ? ' ' + cleaned : '';
  return `<a href="${target}" target="_blank" rel="noopener noreferrer"${sep}>${inner}</a>`;
});

// --- Force the real logo ---------------------------------------------------
// Point every logo <img> (and the first <img>, which is the header logo) at the scraped
// logo URL so the brand logo always renders, regardless of what Stitch used.
let logoCount = 0;
if (logoUrl) {
  const setSrc = (tag) =>
    /\ssrc\s*=\s*["'][^"']*["']/i.test(tag)
      ? tag.replace(/\ssrc\s*=\s*["'][^"']*["']/i, ` src="${logoUrl}"`)
      : tag.replace(/<img\b/i, `<img src="${logoUrl}"`);
  // (a) every <img> that looks like a logo (alt/class/id/src mentions "logo")
  html = html.replace(/<img\b[^>]*>/gi, (tag) => {
    if (/logo/i.test(tag)) { logoCount++; return setSrc(tag); }
    return tag;
  });
  // (b) ensure the FIRST <img> in the document (the header logo) uses it too
  html = html.replace(/<img\b[^>]*>/i, (tag) => {
    if (/logo/i.test(tag)) return tag; // already handled in (a)
    logoCount++;
    return setSrc(tag);
  });
}

// --- Normalize footer copyright year to 2026 (Stitch sometimes emits 2024/2025) ---
html = html.replace(/©\s*20\d\d/g, '© 2026');

// --- Social / favicon safety net: ensure the link unfurls with a favicon + og:image ---
const faviconUrl = process.env.FAVICON_URL || '';
const ogImageUrl = process.env.OG_IMAGE_URL || logoUrl || '';
if (faviconUrl && !/<link[^>]+rel=["'][^"']*icon[^"']*["']/i.test(html)) {
  html = html.replace(/<\/head>/i, `  <link rel="icon" href="${faviconUrl}">\n</head>`);
}
if (ogImageUrl && !/property=["']og:image["']/i.test(html)) {
  html = html.replace(/<\/head>/i,
    `  <meta property="og:image" content="${ogImageUrl}">\n  <meta name="twitter:card" content="summary_large_image">\n  <meta name="twitter:image" content="${ogImageUrl}">\n</head>`);
}

// --- Mobile safety net: hard-stop horizontal scroll/overflow ---
if (!/overflow-x\s*:\s*hidden/i.test(html)) {
  html = html.replace(/<\/head>/i, `  <style>html,body{overflow-x:hidden;max-width:100%}</style>\n</head>`);
}

// --- Optimally demo interstitial (auto @10s + contextual midpoint on every CTA/button) ---
// Deterministic — injected here so every demo gets the SAME, proven modal regardless of what
// Claude authored. Per-demo values come from env (preferred) or are parsed from the page.
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function companyName() {
  if (process.env.COMPANY_NAME) return process.env.COMPANY_NAME.trim();
  const t = (html.match(/<title>([^<]*)<\/title>/i) || [])[1] || '';
  const base = t.split(/[—|\-–:·]/)[0].trim();
  return base || (slug.charAt(0).toUpperCase() + slug.slice(1));
}
function pickColor(name, env, def) {
  if (process.env[env] && /^#[0-9a-fA-F]{3,8}$/.test(process.env[env].trim())) return process.env[env].trim();
  const m = html.match(new RegExp(name + "\\s*:\\s*['\"](#[0-9a-fA-F]{3,8})['\"]"));
  return m ? m[1] : def;
}
const COMPANY = esc(companyName());
const omBrand = pickColor('brand', 'BRAND_COLOR', '#1f2433');
const omAccent = pickColor('accent', 'ACCENT_COLOR', omBrand);
const omCreated = (process.env.CREATED_DATE && /^\d{4}-\d{2}-\d{2}$/.test(process.env.CREATED_DATE))
  ? process.env.CREATED_DATE
  : new Date().toISOString().slice(0, 10);

if (!/id=["']om-modal["']/.test(html)) {
  const modalBlock = `
<!-- ============ OPTIMALLY DEMO INTERSTITIAL (auto @10s + CTA midpoint) ============ -->
<div id="om-modal" aria-hidden="true">
  <div class="om-card" role="dialog" aria-modal="true" aria-labelledby="om-title">
    <button class="om-x" data-om-close aria-label="Close">&times;</button>
    <div class="om-head">
      <span class="om-badge"><span class="om-dot"></span> Live demo</span>
      <img class="om-logo" src="https://framerusercontent.com/images/hUMFc5uZTevF0122Bkpv9kgZDI.png" alt="Optimally" />
    </div>
    <h2 id="om-title" class="om-title">Like what you see, <span class="om-accent">${COMPANY}</span>?</h2>
    <p class="om-body">A live demo <strong>Optimally</strong> built for ${COMPANY}. Book a quick walkthrough to see the strategy behind it &mdash; and how it powers a full funnel that brings <strong>${COMPANY}</strong> new clients.</p>
    <div class="om-urgency">
      <span class="om-pill" id="om-days">7 days left</span>
      <span class="om-urgency-text" id="om-utext"></span>
    </div>
    <a id="om-book" class="om-cta" href="${target}" target="_blank" rel="noopener noreferrer">Book my free walkthrough &rarr;</a>
    <button class="om-later" data-om-close>Maybe later</button>
  </div>
</div>
<style>
  #om-modal{
    --om-brand:${omBrand}; --om-accent:${omAccent};
    position:fixed; inset:0; z-index:9999; display:none;
    align-items:center; justify-content:center; padding:20px;
    background:rgba(18,14,28,.55); backdrop-filter:blur(6px); -webkit-backdrop-filter:blur(6px);
    font-family:inherit;
  }
  #om-modal.open{display:flex; animation:om-fade .25s ease both}
  @keyframes om-fade{from{opacity:0}to{opacity:1}}
  #om-modal .om-card{
    position:relative; width:100%; max-width:440px; background:#fff; border-radius:22px;
    padding:30px 28px 26px; text-align:center;
    max-height:92vh; max-height:92dvh; overflow-y:auto; -webkit-overflow-scrolling:touch;
    box-shadow:0 30px 80px -20px rgba(18,14,28,.6); border:1px solid color-mix(in srgb, var(--om-brand) 12%, transparent);
    animation:om-rise .35s cubic-bezier(.2,.8,.2,1) both;
  }
  @keyframes om-rise{from{opacity:0; transform:translateY(18px) scale(.98)}to{opacity:1; transform:none}}
  #om-modal .om-x{position:absolute; top:12px; right:14px; width:34px; height:34px; border:0; cursor:pointer; background:transparent; color:#9b96a8; font-size:26px; line-height:1; border-radius:9px; transition:.15s;}
  #om-modal .om-x:hover{background:color-mix(in srgb, var(--om-brand) 8%, transparent); color:#5b5668}
  #om-modal .om-head{display:flex; align-items:center; justify-content:center; gap:12px; margin-bottom:16px}
  #om-modal .om-badge{display:inline-flex; align-items:center; gap:7px; font-size:11px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:var(--om-brand); background:color-mix(in srgb, var(--om-brand) 10%, transparent); padding:6px 12px; border-radius:999px;}
  #om-modal .om-dot{width:7px; height:7px; border-radius:50%; background:#3fbf6a; box-shadow:0 0 0 0 rgba(63,191,106,.5); animation:om-blink 1.8s ease-in-out infinite}
  @keyframes om-blink{0%,100%{box-shadow:0 0 0 0 rgba(63,191,106,.5)}50%{box-shadow:0 0 0 5px rgba(63,191,106,0)}}
  #om-modal .om-logo{height:20px; width:auto; opacity:.9}
  #om-modal .om-title{font-size:24px; font-weight:700; line-height:1.2; margin:0 0 12px; color:#16151f}
  #om-modal .om-accent{color:var(--om-accent)}
  #om-modal .om-body{font-size:15px; line-height:1.6; color:#4a4658; margin:0 0 18px}
  #om-modal .om-body strong{color:#16151f}
  #om-modal .om-urgency{display:flex; align-items:flex-start; gap:11px; text-align:left; background:color-mix(in srgb, var(--om-brand) 6%, #fff); border:1px solid color-mix(in srgb, var(--om-brand) 12%, transparent); border-radius:14px; padding:13px 14px; margin-bottom:22px;}
  #om-modal .om-pill{flex:0 0 auto; font-size:11.5px; font-weight:700; color:#fff; background:var(--om-brand); padding:5px 10px; border-radius:999px; white-space:nowrap; margin-top:1px;}
  #om-modal .om-urgency-text{font-size:12.5px; line-height:1.5; color:#5b5668}
  #om-modal .om-urgency-text strong{color:var(--om-brand)}
  #om-modal .om-cta{display:block; width:100%; background:var(--om-brand); color:#fff; font-weight:600; font-size:16px; text-decoration:none; padding:15px; border-radius:999px; transition:.18s; box-shadow:0 12px 30px -8px color-mix(in srgb, var(--om-brand) 55%, transparent);}
  #om-modal .om-cta:hover{background:var(--om-accent); transform:translateY(-1px); box-shadow:0 16px 38px -8px color-mix(in srgb, var(--om-accent) 60%, transparent)}
  #om-modal .om-later{display:block; width:100%; margin-top:10px; background:transparent; border:0; cursor:pointer; color:#9b96a8; font-size:13.5px; font-weight:500; padding:8px; border-radius:8px; transition:.15s;}
  #om-modal .om-later:hover{color:#5b5668}
  @media (max-width:420px){ #om-modal .om-card{padding:26px 20px 22px} #om-modal .om-title{font-size:21px} }
</style>
<script>
(function(){
  var CREATED = "${omCreated}";
  var LIVE_DAYS = 7;
  var BOOK_URL = "${target}";
  var modal = document.getElementById('om-modal');
  if(!modal) return;
  var book = document.getElementById('om-book');
  var seen = false;
  function refreshUrgency(){
    var created = new Date(CREATED + "T00:00:00");
    var expiry  = new Date(created.getTime() + LIVE_DAYS*86400000);
    var left    = Math.ceil((expiry - new Date())/86400000);
    var pill = document.getElementById('om-days');
    var txt  = document.getElementById('om-utext');
    if(left > 0){
      if(pill) pill.textContent = left === 1 ? "1 day left" : left + " days left";
      if(txt)  txt.innerHTML = "Only live for 7 days \\u2014 book before <strong>" + expiry.toLocaleDateString(undefined,{month:'long', day:'numeric'}) + "</strong>.";
    } else {
      if(pill) pill.textContent = "Expiring soon";
      if(txt)  txt.innerHTML = "Live for a limited time and about to expire \\u2014 <strong>act now</strong>.";
    }
  }
  function open(){
    if(modal.classList.contains('open')) return;
    refreshUrgency();
    modal.classList.add('open'); modal.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden'; seen = true;
    if(book) book.focus();
  }
  function close(){
    modal.classList.remove('open'); modal.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
  }
  modal.addEventListener('click', function(e){
    if(e.target === modal || (e.target.closest && e.target.closest('[data-om-close]'))){ e.preventDefault(); close(); }
  });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && modal.classList.contains('open')) close(); });
  if(book) book.addEventListener('click', function(){ setTimeout(close, 120); });
  document.addEventListener('click', function(e){
    var el = e.target.closest('a, button');
    if(!el || modal.contains(el) || el.closest('#om-chat')) return;
    var isCta = el.matches('a[href*="optimally.ltd/demo?partner"]') || el.tagName === 'BUTTON';
    if(!isCta) return;
    e.preventDefault(); e.stopPropagation(); open();
  }, true);
  setTimeout(function(){ if(!seen && !window.__omChatEngaged) open(); }, 10000);
})();
</script>
`;
  html = /<\/body>/i.test(html) ? html.replace(/<\/body>/i, modalBlock + '\n</body>') : (html + modalBlock);
  console.log(`Interstitial injected: company="${COMPANY}", brand=${omBrand}, accent=${omAccent}, created=${omCreated}`);
} else {
  console.log('Interstitial already present — skipped.');
}

// --- Microsoft Clarity (universal) + engagement beacon (per-demo, posts to same-origin /api/track) ---
// The beacon NEVER contains the n8n webhook URL — it posts to /api/track (api/track.js proxy), which
// holds the real webhook + secret in Vercel env. Events: page_open (first view), cta_click, vsl_play,
// scroll_50, book_click. Both injections are idempotent.
const CLARITY_ID = 'xd2h3tb6o4';
const omCompanyJs = JSON.stringify(companyName());
const omSlugJs = JSON.stringify(slug);

if (!/clarity\.ms\/tag/i.test(html)) {
  const clarity = `
<!-- Microsoft Clarity (universal) -->
<script type="text/javascript">
    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "${CLARITY_ID}");
    try{ if(window.clarity){ window.clarity("identify", ${omSlugJs}); window.clarity("set", "slug", ${omSlugJs}); } }catch(e){}
</script>`;
  html = /<head[^>]*>/i.test(html) ? html.replace(/<head[^>]*>/i, (m) => m + clarity) : (clarity + html);
  console.log('Clarity injected.');
} else {
  console.log('Clarity already present — skipped.');
}

// Meta Pixel — central loader. The ID lives ONLY in /api/pixel (env META_PIXEL_ID); the page carries
// just its slug/company. Swap the pixel across every active demo by changing that one env var — no page edits.
if (!/src=["']\/api\/pixel["']/.test(html)) {
  const pixel = `
<!-- Meta Pixel (central loader — ID swappable via /api/pixel, no page edits) -->
<script>window.OM_PIXEL={slug:${omSlugJs},company:${omCompanyJs}};</script>
<script async src="/api/pixel"></script>`;
  html = /<head[^>]*>/i.test(html) ? html.replace(/<head[^>]*>/i, (m) => m + pixel) : (pixel + html);
  console.log('Meta Pixel loader injected.');
} else {
  console.log('Meta Pixel loader already present — skipped.');
}

if (!/id=["']om-beacon["']/.test(html)) {
  const beacon = `
<!-- ============ OPTIMALLY ENGAGEMENT BEACON (posts to same-origin /api/track) ============ -->
<script id="om-beacon">
(function(){
  try{ if(navigator.webdriver) return; if(document.visibilityState === 'prerender' || document.prerendering) return; }catch(e){}
  var WEBHOOK = "/api/track";
  var COMPANY = ${omCompanyJs};
  var SLUG = ${omSlugJs};
  function uid(){ try{ if(window.crypto && crypto.randomUUID) return crypto.randomUUID(); }catch(e){} return 'v-' + Date.now() + '-' + Math.random().toString(16).slice(2); }
  var vid = '', visits = 1, newSession = true;
  try{
    vid = localStorage.getItem('om_vid') || '';
    if(!vid){ vid = uid(); localStorage.setItem('om_vid', vid); }
    var now = Date.now();
    var last = parseInt(localStorage.getItem('om_lastopen') || '0', 10) || 0;
    visits = parseInt(localStorage.getItem('om_visits') || '0', 10) || 0;
    newSession = !last || (now - last) >= 1800000;          // 30 min inactivity = a new visit
    if(newSession){ visits = visits + 1; localStorage.setItem('om_visits', String(visits)); }
    if(visits < 1) visits = 1;
    localStorage.setItem('om_lastopen', String(now));
  }catch(e){ if(!vid) vid = uid(); }
  function send(event, loc, detail){
    try{ if(window.omPixel) window.omPixel(event); }catch(e){}
    var payload = { company: COMPANY, slug: SLUG, event: event, location: loc || '', detail: detail || '', visitorId: vid, visitNumber: visits, referrer: document.referrer || '', pageUrl: window.location.href, ts: new Date().toISOString() };
    var body = JSON.stringify(payload);
    try{ if(navigator.sendBeacon){ navigator.sendBeacon(WEBHOOK, new Blob([body], {type:'text/plain'})); return; } }catch(e){}
    try{ fetch(WEBHOOK, {method:'POST', body:body, keepalive:true, mode:'no-cors', headers:{'Content-Type':'text/plain'}}); }catch(e){}
  }
  function sectionLabel(el){
    var sec = el.closest ? el.closest('section, header, footer') : null;
    if(!sec) return '';
    if(sec.tagName === 'HEADER') return 'hero';
    if(sec.tagName === 'FOOTER') return 'footer';
    var h = sec.querySelector('h1, h2, h3');
    var t = h ? (h.textContent || '').replace(/\\s+/g, ' ').trim() : '';
    return t.slice(0, 60);
  }
  if (newSession) send('page_open', '', '');                                    // one per 30-min session (dedupes refreshes -> fewer n8n runs); visitNumber tracks returns
  document.addEventListener('click', function(e){
    var t = e.target;
    if(!t || !t.closest) return;
    if(t.closest('#om-book')){ send('book_click', 'popup', ''); return; }        // Book a Walkthrough (popup)
    if(t.closest('.play-btn, [class~="play"], [aria-label*="Play"], [aria-label*="play"]')){ send('vsl_play', 'hero', ''); return; }
    var cta = t.closest('a[href*="optimally.ltd/demo?partner"]');
    if(cta){ send('cta_click', sectionLabel(cta), ''); return; }                 // Learn More
  }, true);
  var passed50 = false;
  window.addEventListener('scroll', function(){
    if(passed50) return;
    var st = window.scrollY || document.documentElement.scrollTop || 0;
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var dh = document.documentElement.scrollHeight;
    if(dh > vh && (st + vh) / dh >= 0.5){ passed50 = true; send('scroll_50', '', ''); }
  }, {passive:true});

  window.omTrack = function(event, loc, detail){ try{ send(event, loc, detail); }catch(e){} };  // lets the chat concierge log events through this beacon
})();
</script>`;
  html = /<\/body>/i.test(html) ? html.replace(/<\/body>/i, () => beacon + '\n</body>') : (html + beacon);
  console.log(`Beacon injected: company="${companyName()}", slug=${slug}`);
} else {
  console.log('Beacon already present — skipped.');
}

// --- Optimally concierge: AI chat widget (Book + Review + Claude via /api/chat). Logs each exchange as a bot_message event. ---
if (!/id=["']om-chat["']/.test(html)) {
  const chat = `
<!-- ============ OPTIMALLY DEMO CONCIERGE (AI chat + book + review) ============ -->
<div id="om-chat" data-state="closed">
  <button class="oc-fab" aria-label="Chat with Optimally">
    <svg class="oc-fab-ic" viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.4 8.5 8.5 0 0 1-3.6-.8L3 21l1.9-5.7a8.38 8.38 0 0 1-.8-3.6A8.5 8.5 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5z"/></svg>
    <span class="oc-fab-dot"></span>
  </button>
  <div class="oc-panel" role="dialog" aria-label="Optimally demo assistant">
    <div class="oc-head">
      <img class="oc-logo" src="https://assets.cdn.filesafe.space/pQhFS1dPlI6DlNuTjOdQ/media/69fd30913f4447300c0bce45.png" alt="Optimally" />
      <div class="oc-head-t"><span class="oc-title">The Optimally Team</span><span class="oc-sub"><span class="oc-on"></span> Usually replies instantly</span></div>
      <button class="oc-x" aria-label="Close">&times;</button>
    </div>
    <div class="oc-actions">
      <a class="oc-chip oc-chip-go" href="${target}" target="_blank" rel="noopener noreferrer">&#128197; Book a walkthrough</a>
      <a class="oc-chip" href="https://www.trustpilot.com/evaluate/optimally.ltd" target="_blank" rel="noopener noreferrer">&#11088; Leave a review</a>
    </div>
    <div class="oc-msgs" id="oc-msgs"></div>
    <form class="oc-input" id="oc-form">
      <input id="oc-text" type="text" autocomplete="off" placeholder="Ask how this would work for you..." />
      <button type="submit" class="oc-send" aria-label="Send">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
      </button>
    </form>
  </div>
</div>
<style>
  #om-chat{ --oc-brand:${omBrand}; --oc-accent:${omAccent}; position:fixed; right:20px; bottom:20px; z-index:9000; font-family:inherit; }
  #om-chat .oc-fab{ width:60px; height:60px; border-radius:50%; border:0; cursor:pointer; position:relative; display:flex; align-items:center; justify-content:center; background:linear-gradient(180deg,var(--oc-brand),var(--oc-accent)); box-shadow:0 14px 34px -8px color-mix(in srgb, var(--oc-brand) 65%, transparent); transition:transform .16s ease, box-shadow .16s ease; }
  #om-chat .oc-fab:hover{ transform:translateY(-2px) scale(1.04); }
  #om-chat .oc-fab-dot{ position:absolute; top:11px; right:11px; width:11px; height:11px; border-radius:50%; background:#3fbf6a; border:2px solid #fff; }
  #om-chat[data-state="open"] .oc-fab{ transform:scale(.9); opacity:.92; }
  #om-chat .oc-panel{ position:absolute; right:0; bottom:78px; width:404px; max-width:calc(100vw - 32px); height:660px; max-height:calc(100dvh - 96px); background:#fff; border-radius:20px; overflow:hidden; display:none; flex-direction:column; box-shadow:0 30px 80px -20px rgba(20,12,8,.5); border:1px solid color-mix(in srgb, var(--oc-brand) 12%, #e7e2dc); animation:oc-rise .28s cubic-bezier(.2,.8,.2,1) both; }
  #om-chat[data-state="open"] .oc-panel{ display:flex; }
  @keyframes oc-rise{ from{opacity:0; transform:translateY(16px)} to{opacity:1; transform:none} }
  @keyframes oc-fade{ from{opacity:0} to{opacity:1} }
  #om-chat .oc-head{ display:flex; align-items:center; gap:11px; padding:14px 16px; border-bottom:1px solid #efeae4; }
  #om-chat .oc-logo{ width:28px; height:28px; border-radius:7px; object-fit:cover; flex:0 0 auto; }
  #om-chat .oc-head-t{ display:flex; flex-direction:column; line-height:1.25; margin-right:auto; }
  #om-chat .oc-title{ font-size:14px; font-weight:700; color:#1c1a18; }
  #om-chat .oc-sub{ font-size:11.5px; color:#8a847c; display:flex; align-items:center; gap:5px; }
  #om-chat .oc-on{ width:7px; height:7px; border-radius:50%; background:#3fbf6a; display:inline-block; }
  #om-chat .oc-x{ border:0; background:transparent; cursor:pointer; font-size:24px; line-height:1; color:#b3aca3; padding:2px 4px; border-radius:8px; }
  #om-chat .oc-x:hover{ background:#f4f0eb; color:#6b655d; }
  #om-chat .oc-actions{ display:flex; gap:8px; padding:12px 14px 4px; flex-wrap:wrap; }
  #om-chat .oc-chip{ font-size:12.5px; font-weight:600; text-decoration:none; color:var(--oc-brand); background:color-mix(in srgb, var(--oc-brand) 8%, #fff); border:1px solid color-mix(in srgb, var(--oc-brand) 22%, transparent); padding:7px 11px; border-radius:999px; transition:.15s; }
  #om-chat .oc-chip:hover{ background:color-mix(in srgb, var(--oc-brand) 14%, #fff); }
  #om-chat .oc-chip-go{ color:#fff; background:var(--oc-brand); border-color:var(--oc-brand); }
  #om-chat .oc-chip-go:hover{ background:var(--oc-accent); }
  #om-chat .oc-msgs{ flex:1; overflow-y:auto; padding:14px; display:flex; flex-direction:column; gap:10px; }
  #om-chat .oc-b{ max-width:84%; padding:10px 13px; border-radius:14px; font-size:13.5px; line-height:1.5; white-space:pre-wrap; word-wrap:break-word; }
  #om-chat .oc-b.bot{ align-self:flex-start; background:#f5f1ec; color:#2a2722; border-bottom-left-radius:5px; }
  #om-chat .oc-b.me{ align-self:flex-end; background:var(--oc-brand); color:#fff; border-bottom-right-radius:5px; }
  #om-chat .oc-typing{ display:inline-flex; gap:5px; align-items:center; padding:14px 15px; }
  #om-chat .oc-typing span{ width:7px; height:7px; border-radius:50%; background:#b8b1a8; animation:oc-bounce 1.2s infinite ease-in-out; }
  #om-chat .oc-typing span:nth-child(2){ animation-delay:.16s; }
  #om-chat .oc-typing span:nth-child(3){ animation-delay:.32s; }
  @keyframes oc-bounce{ 0%,60%,100%{ transform:translateY(0); opacity:.45 } 30%{ transform:translateY(-5px); opacity:1 } }
  #om-chat .oc-input{ display:flex; gap:8px; padding:12px 14px; border-top:1px solid #efeae4; }
  #om-chat .oc-input input{ flex:1; border:1px solid #e3ddd6; background:#faf8f5; border-radius:999px; padding:12px 16px; font:inherit; font-size:16px; outline:none; transition:.15s; }
  #om-chat .oc-input input:focus{ border-color:var(--oc-brand); background:#fff; box-shadow:0 0 0 3px color-mix(in srgb, var(--oc-brand) 14%, transparent); }
  #om-chat .oc-send{ flex:0 0 auto; width:42px; height:42px; border:0; border-radius:50%; cursor:pointer; background:var(--oc-brand); display:flex; align-items:center; justify-content:center; transition:.15s; }
  #om-chat .oc-send:hover{ background:var(--oc-accent); }
  #om-chat .oc-send:disabled{ opacity:.5; cursor:default; }
  @media (max-width:560px){
    #om-chat{ right:14px; bottom:14px; }
    #om-chat .oc-panel{ position:fixed; inset:0; right:0; bottom:0; width:100%; max-width:100%; height:100dvh; max-height:100dvh; border-radius:0; border:0; animation:oc-fade .2s ease both; }
    #om-chat[data-state="open"] .oc-fab{ display:none; }
    #om-chat .oc-msgs{ padding:16px; }
    #om-chat .oc-b{ font-size:15px; }
  }
</style>
<script>
(function(){
  var COMPANY = ${omCompanyJs};
  var SLUG = ${omSlugJs};
  var BOOK_URL = "${target}";
  var root = document.getElementById('om-chat'); if(!root) return;
  var fab = root.querySelector('.oc-fab');
  var msgsEl = document.getElementById('oc-msgs');
  var form = document.getElementById('oc-form');
  var input = document.getElementById('oc-text');
  var sendBtn = root.querySelector('.oc-send');
  var history = [];
  var greeted = false, busy = false;
  function ctx(){
    var d = (document.querySelector('meta[name="description"]')||{}).content || '';
    return { company: COMPANY, slug: SLUG, title: document.title || '', description: d, bookingUrl: BOOK_URL };
  }
  function bubble(text, who){
    var b = document.createElement('div'); b.className = 'oc-b ' + who; b.textContent = text;
    msgsEl.appendChild(b); msgsEl.scrollTop = msgsEl.scrollHeight; return b;
  }
  function typeOut(el, text, done){
    el.textContent = ''; var i = 0;
    (function step(){
      if(i >= text.length){ if(done) done(); return; }
      el.textContent += text.slice(i, i + 2); i += 2;
      msgsEl.scrollTop = msgsEl.scrollHeight;
      setTimeout(step, 14);
    })();
  }
  function open(){
    window.__omChatEngaged = true;
    root.setAttribute('data-state','open');
    if(!greeted){ greeted = true; bubble("Hi! I'm the Optimally team's assistant. I can explain how a funnel like this would work for " + COMPANY + ", or get you booked in for a quick walkthrough. What would you like to know?", 'bot'); }
    setTimeout(function(){ input.focus(); }, 60);
  }
  function close(){ root.setAttribute('data-state','closed'); }
  fab.addEventListener('click', function(){ root.getAttribute('data-state')==='open' ? close() : open(); });
  root.querySelector('.oc-x').addEventListener('click', close);
  form.addEventListener('submit', function(e){
    e.preventDefault();
    var text = (input.value||'').trim();
    if(!text || busy) return;
    input.value = '';
    bubble(text, 'me');
    history.push({ role:'user', content:text });
    busy = true; sendBtn.disabled = true;
    var typingEl = null;
    var showT = setTimeout(function(){
      typingEl = document.createElement('div'); typingEl.className = 'oc-b bot oc-typing';
      typingEl.innerHTML = '<span></span><span></span><span></span>';
      msgsEl.appendChild(typingEl); msgsEl.scrollTop = msgsEl.scrollHeight;
    }, 500);
    var clearTyping = function(){ clearTimeout(showT); if(typingEl){ typingEl.remove(); typingEl = null; } };
    var done = function(){ busy = false; sendBtn.disabled = false; input.focus(); };
    fetch('/api/chat', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ messages: history, context: ctx() }) })
      .then(function(r){ return r.json(); })
      .then(function(d){
        clearTyping();
        var reply = (d && d.reply) ? d.reply : "Tap Book a walkthrough above and the team will help you directly.";
        history.push({ role:'assistant', content: reply });
        try{ if(window.omTrack) window.omTrack('bot_message', 'chat', ('Q: ' + text + '\\nA: ' + reply).slice(0, 1200)); }catch(e){}
        typeOut(bubble('', 'bot'), reply, done);
      })
      .catch(function(){
        clearTyping();
        typeOut(bubble('', 'bot'), "I'm having trouble connecting. Tap Book a walkthrough above and we'll take it from there.", done);
      });
  });
})();
</script>`;
  html = /<\/body>/i.test(html) ? html.replace(/<\/body>/i, () => chat + '\n</body>') : (html + chat);
  console.log(`Concierge chat injected: company=${JSON.stringify(companyName())}, book=${target}`);
} else {
  console.log('Concierge chat already present — skipped.');
}

const outDir = path.join(outRoot, slug);
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, 'index.html');
fs.writeFileSync(outFile, html, 'utf8');

console.log(`CTAs retargeted: ${count} -> ${target}`);
console.log(`Logo <img>s forced to scraped URL: ${logoCount}${logoUrl ? '' : ' (no logoUrl provided)'}`);
console.log(`Wrote: ${outFile}`);
if (count === 0) {
  console.error('WARNING: 0 CTAs matched. Inspect the HTML — CTA text may not be exactly "Learn More".');
  process.exit(2);
}
