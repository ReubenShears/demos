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
