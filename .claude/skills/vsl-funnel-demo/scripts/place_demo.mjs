#!/usr/bin/env node
// Retarget every "Learn More" CTA to the partner tracking URL (new tab) and place the
// generated page at <outRoot>/<slug>/index.html. Original image URLs are preserved on purpose
// (the user does NOT want Stitch's images localized).
//
// Handles CTAs rendered as <a> OR <button>, with or without nested spans
// (e.g. <button><span>Learn More</span></button>). Buttons are converted to anchors so the
// tracking link works.
//
// Usage: node place_demo.mjs <htmlPath> <slug> <outRoot> [ctaBase]
//   htmlPath  path to the downloaded Stitch HTML
//   slug      partner slug, e.g. "unorthodox"
//   outRoot   the deploy root (local "D:/Claude Cowork/demos", or a cloned repo root)
//   ctaBase   optional, defaults to https://www.optimally.ltd/demo

import fs from 'node:fs';
import path from 'node:path';

const [, , htmlPath, slug, outRoot, ctaBaseArg] = process.argv;
if (!htmlPath || !slug || !outRoot) {
  console.error('usage: node place_demo.mjs <htmlPath> <slug> <outRoot> [ctaBase]');
  process.exit(1);
}
const ctaBase = ctaBaseArg || 'https://www.optimally.ltd/demo';
const target = `${ctaBase}?partner=${slug}`;

let html = fs.readFileSync(htmlPath, 'utf8');

// Match any <a> or <button> whose visible text (tags stripped) is exactly "Learn More".
// Preserve all attributes except href/target/rel/type/onclick; convert buttons to anchors.
// Non-CTA elements are returned untouched.
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

// Normalize the footer copyright year to 2026 (Stitch sometimes emits 2024/2025).
html = html.replace(/©\s*20\d\d/g, '© 2026');

const outDir = path.join(outRoot, slug);
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, 'index.html');
fs.writeFileSync(outFile, html, 'utf8');

console.log(`CTAs retargeted: ${count} -> ${target}`);
console.log(`Wrote: ${outFile}`);
if (count === 0) {
  console.error('WARNING: 0 CTAs matched. Inspect the HTML — CTA text may not be exactly "Learn More".');
  process.exit(2);
}
