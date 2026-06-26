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
    if(!el || modal.contains(el)) return;
    var isCta = el.matches('a[href*="optimally.ltd/demo?partner"]') || el.tagName === 'BUTTON';
    if(!isCta) return;
    e.preventDefault(); e.stopPropagation(); open();
  }, true);
  setTimeout(function(){ if(!seen) open(); }, 10000);
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

if (!/id=["']om-beacon["']/.test(html)) {
  const beacon = `
<!-- ============ OPTIMALLY ENGAGEMENT BEACON (posts to same-origin /api/track) ============ -->
<script id="om-beacon">
(function(){
  var WEBHOOK = "/api/track";
  var COMPANY = ${omCompanyJs};
  var SLUG = ${omSlugJs};
  function uid(){ try{ if(window.crypto && crypto.randomUUID) return crypto.randomUUID(); }catch(e){} return 'v-' + Date.now() + '-' + Math.random().toString(16).slice(2); }
  var vid = '', visits = 1;
  try{
    vid = localStorage.getItem('om_vid') || '';
    if(!vid){ vid = uid(); localStorage.setItem('om_vid', vid); }
    visits = (parseInt(localStorage.getItem('om_visits') || '0', 10) || 0) + 1;
    localStorage.setItem('om_visits', String(visits));
  }catch(e){ if(!vid) vid = uid(); }
  function send(event, loc, detail){
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
  if (visits === 1) send('page_open', '', '');                                  // first view only
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
})();
</script>`;
  html = /<\/body>/i.test(html) ? html.replace(/<\/body>/i, () => beacon + '\n</body>') : (html + beacon);
  console.log(`Beacon injected: company="${companyName()}", slug=${slug}`);
} else {
  console.log('Beacon already present — skipped.');
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
