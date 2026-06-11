# Stitch generation prompt (VSL call funnel)

Fill the placeholders, then pass the whole thing as the `prompt` to
`mcp__stitch__generate_screen_from_text`. Placeholders:

- `{{COMPANY}}` — company name (from ogTitle), e.g. "Optimally Systems"
- `{{URL}}` — the exact source URL to scrape, e.g. https://www.optimally.ltd
- `{{SLUG}}` — the partner slug, e.g. optimally
- `{{PRIMARY}}` / `{{SECONDARY}}` — brand hex colours

The design system is already applied to the project, so colours/fonts/radius come through
automatically — the prompt just reinforces the conversion structure and the content rules.

---

Build a long-form, single-page VSL (Video Sales Letter) call-funnel landing page that recreates the offer of the company "{{COMPANY}}".

SOURCE CONTENT — IMPORTANT:
Scrape this exact URL for all real copy, offer details, deliverables, ICP, testimonial wording, founder info, and FAQ source material: {{URL}}
Pull ONLY the company LOGO as a real image from that site (use the actual {{COMPANY}} logo at the top). Do NOT pull any other photos or imagery from the site into the design, and do NOT insert decorative stock or AI photos of people. Every place that would show a person (testimonials, founder) must use a clearly empty large image-placeholder graphic (a "place image here" icon box), never a realistic AI-generated human face.

This is a direct-response VSL funnel, NOT a normal corporate website. Conversion-focused, clean, single centered column, funnelling the visitor toward ONE action: watch the VSL and click the call-to-action. Keep vertical spacing TIGHT and efficient — the hero (logo + eyebrow + headline + guarantee + single subheadline + video + first CTA) should fit within roughly a single viewport; keep the gap between the top banner and the logo small. Look premium but do not waste vertical space.

WRITING STYLE — avoid obvious AI / agency clichés. Do NOT use phrases like "No Fluff", "Real Results. No Fluff.", "Strategic Insights", "Unlock"/"Unleash", "Supercharge", "Game-changer", "Elevate", "Take it to the next level", "Seamless", "Empower". Write natural, specific, human direct-response copy grounded in the real offer. Use the brand primary colour to highlight a few key words in headlines/subheads for emphasis (a bit more than usual, tastefully).

RESPONSIVE — this is critical: the page MUST look right at mobile (~375px), tablet (~768px) AND desktop (~1440px). Use fluid, responsive typography and spacing throughout — CSS `clamp()` and/or responsive Tailwind sizes (e.g. `text-3xl sm:text-4xl lg:text-6xl`, responsive padding) — NEVER fixed desktop-only font sizes. Text and section heights must scale DOWN on smaller screens so nothing overflows or dominates. In particular the hero must fit within one viewport at each breakpoint (see hero rules). The most common failure is a headline that looks fine on desktop but is far too large on mobile — actively prevent that with smaller mobile type.

GLOBAL CTA RULES:
- NO top navigation / menu bar.
- Every call-to-action button must be IDENTICAL — same size, same brand-primary fill, same styling — and the button label must ALWAYS read exactly "Learn More". Place one in essentially every section. (The buttons will be retargeted to a tracking URL after generation; just render them as "Learn More" anchor buttons.)
- Directly beneath each "Learn More" button, add a small, subtle line of visual social proof (tiny stacked avatar row + a short proof line, or a small star rating). Keep it small and consistent everywhere.

PAGE STRUCTURE — the page MUST contain ALL NINE sections below (0–8), in this exact order. Do NOT omit, merge, abbreviate, or reorder any of them. Generations frequently drop sections 5 (Building Trust), 6 (Founder), and 7 (FAQ) and jump from the Call to Action straight to the Footer — that is WRONG. Every one of the nine must be present and fully built:

0. BANNER (above everything): a slim full-width announcement banner, on-brand colour, with a short line prompting the visitor to watch the video below (e.g. "▶ Watch the free training below to see how it works"). No nav menu; place the logo close beneath it.

1. HERO (must fit within roughly ONE viewport at EVERY breakpoint — mobile, tablet, and desktop — centered):
   - The {{COMPANY}} logo centered at top (not a nav bar).
   - A small eyebrow line ABOVE the headline reading "Attention:" followed by who the ICP is (from the site, e.g. "Attention: Coaches, Consultants & Service Businesses").
   - MAIN HEADLINE in this format: "We'll take you from [point A / current pain] to [point B / desired outcome] in [X timeframe] using [unique mechanism]" — populated from the real offer. SIZE IT TO FIT RESPONSIVELY: the headline and the whole hero must fit within ONE viewport at every breakpoint, not just desktop. Use fluid type — CSS `clamp()` or responsive Tailwind sizes (e.g. `text-3xl sm:text-4xl lg:text-6xl`) — so the headline scales DOWN on smaller screens. On MOBILE the headline must be noticeably smaller so the logo, eyebrow, headline, guarantee, single subheadline, video and first CTA all fit within roughly one mobile screen without the headline dominating. Longer headlines get smaller sizes. Fitting the hero inside each breakpoint's viewport always takes priority over large text.
   - A risk-reversal / guarantee line right after the headline (e.g. "...or you don't pay").
   - EXACTLY ONE subheadline (never two). It must clearly LIST the actual tangible deliverables a client gets from the service (e.g. conversion funnels, automated systems, booked qualified calls) — pulled from the site. Do not add a second generic subheadline.
   - The VSL: a large 16:9 VIDEO PLACEHOLDER (not a real embed) — a big centered play button over an aesthetic background made of a gradient laid on top of an appropriate image (gradient + image), on-brand.
   - A short action-driving tagline below the video.
   - The identical "Learn More" CTA, with the small social-proof element directly beneath it.

2. PAINS — the current pains/frustrations the ICP feels right now (from the site's problem framing), as a clean list or card grid. Identical "Learn More" CTA + small social proof.

3. SOLUTION — introduce {{COMPANY}}'s system as the solution; explain the mechanism and what makes it different. Identical "Learn More" CTA + small social proof.

4. CALL TO ACTION — a dedicated punchy conversion section: strong headline, the identical "Learn More" CTA, small social proof.

5. BUILDING TRUST (REQUIRED — do not skip) — social proof presented as TESTIMONIAL BLOCKS (quote cards). Use real testimonial wording from the site if present; otherwise use neutral lorem-ipsum placeholder quotes. Do NOT use decorative people photos — if an avatar is shown, use the small placeholder graphic. Optionally a results/stats strip. Identical "Learn More" CTA + small social proof.

6. FOUNDER SECTION (REQUIRED — do not skip) — a personal section introducing the founder to build authority. Use a large empty image-PLACEHOLDER graphic for the photo (never an AI-generated persona). Include the founder's name/bio text from the site if available. Identical "Learn More" CTA + small social proof.

7. FAQ (REQUIRED — do not skip) — an accordion with EXACTLY SEVEN (7) questions. Each must be a realistic SALES OBJECTION this specific offer would face (price, time commitment, "does this work for my niche", "what if it doesn't work", trust/credibility, contract length, how fast results come), and each answer must directly overcome that objection. A final identical "Learn More" CTA + small social proof after the FAQ.

8. FOOTER — clean and tidy: the {{COMPANY}} logo, a final identical "Learn More" CTA, basic links (privacy/terms/contact), and a copyright line reading "© 2026 {{COMPANY}}" (use 2026). No stray decorative images in the footer.

FINAL CHECK before you finish: confirm (a) the page includes every one of these nine sections in order — (0) Banner, (1) Hero, (2) Pains, (3) Solution, (4) Call to Action, (5) Building Trust / testimonials, (6) Founder, (7) FAQ with exactly 7 objection Q&As, (8) Footer; and (b) it renders cleanly at mobile / tablet / desktop with the hero fitting one viewport at each. Fix anything missing or overflowing before finishing.

Make it feel like a high-converting, professionally designed VSL funnel — cohesive, trustworthy, on-brand, space-efficient, responsive, and free of AI-marketing clichés.
