# Build spec — Claude authors the VSL funnel page directly

This replaces Stitch. Claude writes ONE self-contained `index.html` for the demo, from the gathered
business brief + brand tokens, applying the premium design rules below. Deterministic, all sections,
controlled headline length and logo size, real animations.

## Inputs (from the content-gathering step)
- **Brand tokens** (Firecrawl branding): primary, secondary, neutral/text, background hex; logo URL; fonts; radius.
- **Business brief** (distilled from homepage + about + offer + testimonials + FAQ pages):
  company name (full + short brand), ICP, the offer as A→B→timeframe→mechanism, deliverables list,
  current pains, the solution/mechanism, real proof/testimonials/results, founder name + bio, 7 likely
  sales objections, the guarantee/risk-reversal.
- **slug** (first domain label) and **partner CTA URL** `https://www.optimally.ltd/demo?partner=<slug>`.

## Tech
- Single file: Tailwind via CDN + a small `<style>` for custom CSS + a small `<script>` for scroll
  animations (IntersectionObserver) and count-ups. Brand font via Google Fonts (fallback: a premium
  geometric sans — Inter/Geist/Sora — NEVER Montserrat/Poppins/Roboto/Open Sans/Lato).
- Fully responsive: looks right at 375 / 768 / 1440px. Hero fits ~one viewport at every breakpoint.

## Structure — the same 9 sections, in order (do not change)
0. Banner (slim, "watch the video below", on-brand) — NO nav menu, NO sticky header
1. Hero — logo, "Attention: <ICP>" eyebrow, headline, guarantee, ONE deliverables subheadline, VSL placeholder (gradient/mesh bg + big play button), tagline, CTA + small social proof
2. Pains  3. Solution  4. Call to Action  5. Building Trust (testimonials)  6. Founder  7. FAQ (exactly 7 objection Q&As)  8. Footer
- A CTA in essentially every section.

## Headline (fixes the blow-out)
- **2–3 lines max on desktop, NEVER 4+. Target ≤ ~12 words / ~70 characters.** Compress the
  A→B→timeframe→mechanism ruthlessly (shorten the mechanism name, cut filler) to fit. Brevity > completeness.
- Fluid size: `clamp()` / responsive Tailwind (`text-3xl sm:text-4xl lg:text-6xl`) so it scales down on mobile.
- Highlight 2–3 key words in the brand accent colour. Medium/semi-bold weight (not heavy black).

## Logo (fixes the tiny logo)
- Header logo PROMINENT: height ~44–56px desktop / ~36–40px mobile, with MINIMAL padding around it
  (don't bury it in whitespace). Footer logo similar (~32–40px). Use the real scraped logo URL.
- The logo should read clearly at a glance — it's the brand anchor, not a tiny afterthought.

## CTAs (baked in — no post-process)
- Every CTA is an identical `<a>` styled as a premium pill button, text exactly **"Learn More"**,
  `href="https://www.optimally.ltd/demo?partner=<slug>"`, `target="_blank" rel="noopener noreferrer"`.
- Small social-proof line directly beneath each (tiny avatars/stars + short proof). Consistent everywhere.

## Visual quality (the premium bar — borrowed brief, non-structural)
- **Atmosphere:** never flat solid backgrounds — subtle gradient mesh / volumetric glow / soft lighting +
  depth. Accent colour used sparingly (CTAs, key stats, glow). Alternate section tones; never 5 same-tone in a row.
- **Typography:** headline 2–3× subhead size; body 16–18px, 1.5–1.7 line-height, ~65–75 char lines.
  **NO letter clipping** — line-height ≥1.15–1.25 on big type, extra top/bottom padding on any
  gradient/clipped text so descenders (g, j, p, q, y) and ascenders never crop.
- **Icons, not numbers:** inline SVG line/duotone icons (Lucide/Phosphor/Tabler style), consistent stroke,
  brand-tinted — one unique icon per pain/feature/step. NEVER bracketed `[01]/[02]` markers, never emoji.
- **Grids:** tasteful bento / varied card grids for the card sections (pains, deliverables, solution) —
  tessellate fully (no gaps/empty cells), MAX 4 columns. Don't reuse the same grid 3× in a row.
- **Buttons:** consistent pill radius, subtle glow under primary CTA, hover scale + glow. One line, always.
- **Motion (subtle, performant):** sections fade-and-slide in on scroll (IntersectionObserver); hover states
  on every interactive element; soft glow on featured cards; count-up on REAL stats only; logo marquee for a
  trust strip. Respect `prefers-reduced-motion`.
- **Avoid AI-slop:** no purple-pink gradients, no sparkle emojis, no Bootstrap blue, no mixed corner radii,
  no centered-everything monotony.

## People & imagery (KEEP our rules — do NOT use the brief's AI-faces rule)
- Only the real scraped LOGO is a real image. NO other site photos, NO stock, NO AI-generated people.
- Founder photo + every testimonial avatar = a clean placeholder graphic (icon in a tasteful framed box),
  never an AI face, never a plain coloured circle. Testimonials = quote cards (real wording if scraped, else
  neutral lorem). 5-star rating is fine where the element's job is reviews.
- VSL "video" = a styled 16:9 placeholder: gradient/mesh background + large centered play button + a small
  caption — not a real embed.

## Copy
- Write every section from the BUSINESS BRIEF in specific, confident, active, 8th-grade copy — real
  numbers/names/outcomes from the scrape, never lorem where real content exists.
- No AI/agency clichés ("No Fluff", "Supercharge", "Unlock", "Game-changer", "Elevate", "Seamless").
- FAQ = exactly 7 real sales objections (price, time, "works for my niche?", "what if it doesn't work",
  trust, contract length, speed of results) with answers that overcome them.

## Footer
- Real logo, final "Learn More" CTA, basic links (privacy/terms/contact), copyright **"© 2026 <Company>"**.

## Output & quality gate
- Write the finished single `index.html` to `<deploy-root>/<slug>/index.html`.
- Before finishing, self-check: all 9 sections present; headline ≤3 lines; logo prominent; every CTA is a
  tracked "Learn More" anchor; © 2026; renders at mobile/tablet/desktop; no letter clipping; no lorem where
  real content existed; no flat backgrounds. Fix anything failing before deploy.
