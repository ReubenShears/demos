#!/usr/bin/env node
// Retarget every "Learn More" CTA to the partner tracking URL (new tab) and place the
// generated page at <outRoot>/<slug>/index.html. Original image URLs are preserved on purpose
// (the user does NOT want Stitch's images localized).
//
// Usage: node place_demo.mjs <htmlPath> <slug> <outRoot> [ctaBase]
//   htmlPath  path to the downloaded Stitch HTML
//   slug      partner slug, e.g. "optimally"
//   outRoot   the Vercel project root, e.g. "D:/Claude Cowork/demos"
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

// Match any anchor whose visible text is exactly "Learn More" (whitespace-tolerant).
// Preserve all existing attributes except href/target/rel, then set our tracking href + new tab.
const anchorRe = /<a\b([^>]*)>(\s*Learn More\s*)<\/a>/gi;
let count = 0;
html = html.replace(anchorRe, (_m, attrs, label) => {
  count++;
  // Drop any existing href / target / rel so we don't duplicate them.
  const cleaned = attrs
    .replace(/\shref\s*=\s*"[^"]*"/gi, '')
    .replace(/\starget\s*=\s*"[^"]*"/gi, '')
    .replace(/\srel\s*=\s*"[^"]*"/gi, '')
    .trim();
  const sep = cleaned ? ' ' + cleaned : '';
  return `<a href="${target}" target="_blank" rel="noopener noreferrer"${sep}>${label}</a>`;
});

const outDir = path.join(outRoot, slug);
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, 'index.html');
fs.writeFileSync(outFile, html, 'utf8');

console.log(`CTAs retargeted: ${count} -> ${target}`);
console.log(`Wrote: ${outFile}`);
if (count === 0) {
  console.error('WARNING: 0 CTAs matched. Inspect the HTML — the CTA text may not be exactly "Learn More".');
  process.exit(2);
}
