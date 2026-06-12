# Build spec — Claude authors the VSL funnel page directly

This replaces Stitch. Claude writes ONE self-contained `index.html` for the demo, from the gathered
business brief + brand tokens, applying the premium design rules below. Deterministic, all sections,
controlled headline length and logo size, real animations.

## Inputs (from the content-gathering step)
- **Brand tokens** (Firecrawl branding): primary, secondary, neutral/text, background hex; logo URL; fonts; radius.
- **Business brief** (read directly off the SINGLE homepage `markdown` + branding scrape — no extra
  page fetches, no sub-agents): company name (full + short brand), ICP, the offer as
  A→B→timeframe→mechanism, deliverables list, current pains, the solution/mechanism, any
  proof/testimonials, founder name + bio if present, 7 plausible sales objections, the guarantee.
  Where the homepage gives no specifics (founder/testimonials/FAQ), write reasonable on-brand copy.
- **slug** (first domain label) and **partner CTA URL** `https://www.optimally.ltd/demo?partner=<slug>`.

## Tech
- Single file: Tailwind via CDN + a small `<style>` for custom CSS + a small `<script>` for scroll
  animations (IntersectionObserver) and count-ups. Brand font via Google Fonts (fallback: a premium
  geometric sans — Inter/Geist/Sora — NEVER Montserrat/Poppins/Roboto/Open Sans/Lato).
- Fully responsive: looks right at 375 / 768 / 1440px. Hero fits ~one viewport at every breakpoint.
- **NO horizontal scroll on mobile (critical):** the page must never scroll sideways at any breakpoint.
  Add `html, body { overflow-x: hidden; max-width: 100%; }`, and make every element fit the viewport — no
  fixed widths wider than the screen, images/cards `max-width: 100%`, multi-column/bento grids collapse to
  ONE column on mobile, and no floating/offset/negative-margin cards that bleed past the right edge. Verify
  at 375px: zero horizontal overflow.

## Structure — the same 9 sections, in order (do not change)
0. Banner (slim announcement strip, "watch the video below", on-brand). NO nav menu. **NOT sticky/fixed**
   — the banner AND any top bar/header scroll away with the page. Never `position: sticky` or `position: fixed`
   on the banner/header.
1. Hero — render in THIS exact vertical order: logo → "Attention: <ICP>" eyebrow → headline → guarantee →
   ONE deliverables subheadline → **the VSL placeholder** (gradient/mesh bg + big play button) → tagline →
   **then the "Learn More" CTA + small social proof, UNDERNEATH the video.** The hero CTA goes BELOW the
   video, NEVER above it. Keep the hero TIGHT: the logo + eyebrow + headline must all sit within the
   **TOP THIRD of the viewport** — no tall top padding, no big empty gap above or between them, no
   duplicate logo. The headline must be visible without scrolling.
2. Pains  3. Solution  4. Call to Action  5. Building Trust (testimonials)  6. Founder  7. FAQ (exactly 7 objection Q&As)  8. Footer
- **EVERY section has a tracked "Learn More" CTA** (with the small social-proof line beneath it) — every
  one, not just some.

## Headline (fixes the blow-out)
- **2–3 lines max on desktop, NEVER 4+. Target ≤ ~12 words / ~70 characters.** Compress the
  A→B→timeframe→mechanism ruthlessly (shorten the mechanism name, cut filler) to fit. Brevity > completeness.
- Fluid size: `clamp()` / responsive Tailwind (`text-3xl sm:text-4xl lg:text-6xl`) so it scales down on mobile.
- Highlight 2–3 key words in the brand accent colour. Medium/semi-bold weight (not heavy black).

## Logo (prominent, single, always visible)
- Use the real scraped logo ONCE at the top — placed in the hero directly under the banner. Do NOT also
  add a separate header/nav bar with a second logo (that creates a duplicate logo + a big gap). One
  prominent logo up top, one small one in the footer.
- Size: hero logo height ~56–72px desktop / ~44–52px mobile, with MINIMAL padding around it — never tiny,
  never buried in whitespace. Footer logo ~32–40px.
- **CONTRAST — critical (this broke on a black-on-black brand):** check the logo against the background it
  sits on. A dark logo on a dark section (or light-on-light) is invisible. Fix it: invert a simple
  monochrome mark with CSS (`filter: brightness(0) invert(1)` to make it white on dark, or `filter:
  brightness(0)` for black on light), OR sit it on a small contrasting chip / rounded container. The logo
  must ALWAYS read clearly — never a black logo on a black background.

## CTAs (baked in — no post-process)
- Every CTA is an identical `<a>` styled as a premium pill button, text exactly **"Learn More"**,
  `href="https://www.optimally.ltd/demo?partner=<slug>"`, `target="_blank" rel="noopener noreferrer"`.
- Small social-proof line directly beneath each (tiny avatars/stars + short proof). Consistent everywhere.

## Visual quality (the premium bar — borrowed brief, non-structural)
- **Colour — use ONLY the scraped palette; never invent an accent:** the design uses ONLY the scraped
  brand hex values (primary, secondary, neutral/text, background). The accent/highlight/CTA colour MUST be
  the scraped PRIMARY — do NOT default to your own "premium" accent (no yellow/blue/purple just because it
  looks slick). Sanity-check the brand: if it reads essentially monochrome (black/white/grey) — or the
  scraped "primary" is a stray saturated colour that clashes with an otherwise mono/dark brand — KEEP it
  monochrome and use white/near-white for highlights and CTAs. When in doubt: fewer colours, true to the brand.
- **Atmosphere:** never flat solid backgrounds — subtle gradient mesh / volumetric glow / soft lighting +
  depth, built from the BRAND colours only. Accent used sparingly (CTAs, key stats, glow). Alternate section tones; never 5 same-tone in a row.
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

## Social share / SEO — the link must unfurl beautifully when sent to a prospect
The demo link gets pasted into iMessage / Slack / WhatsApp / email, so the `<head>` must produce a rich
preview card:
- `<title>` — `<Company> — <short value prop>` (concise, specific).
- `<meta name="description">` — one sentence on the offer.
- Open Graph: `og:title`, `og:description`, `og:type=website`, `og:url=https://demos.optimally.ltd/<slug>`,
  and **`og:image` = the scraped `branding.images.ogImage`** (a proper ~1200×630 card; fall back to the
  logo URL only if no ogImage exists).
- `<meta name="twitter:card" content="summary_large_image">` plus `twitter:title` / `twitter:description` / `twitter:image`.
- **Favicon** = the scraped `branding.images.favicon` (`<link rel="icon" href="...">`).
Use real brand values, never placeholders. (place_demo.mjs injects favicon + og:image as a safety net if missing.)

## Output & quality gate
- Write the finished single `index.html` to `<deploy-root>/<slug>/index.html`.
- Before finishing, self-check: all 9 sections present; headline ≤3 lines; logo prominent; every CTA is a
  tracked "Learn More" anchor; © 2026; renders at mobile/tablet/desktop; no letter clipping; no lorem where
  real content existed; no flat backgrounds. Fix anything failing before deploy.
