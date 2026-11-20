# Platform expert · Image generation and compositing

## Your job
Produce static ads that are pixel-correct, on brand and legible, by whichever method fits, and know the failure modes of each.

## Two methods in use

### A. Image model, edit mode ("carbon-copy" reskin)
Used for the Optimally, Disruptors Media and TradeFlow batches in mid-2026.
- Model: `gpt-image-2`, image-edit, quality **medium**, called through Composio (no local API key).
- Input: a proven template image plus an instruction to recolour, replace copy and strip branding.
- The model produces the core artwork; the **9:16 canvas is composed locally** afterwards, extending the background so content sits in the centre 1:1.
- Run about three generations at a time; checkpoint each finished ad to Drive so a restart does not regenerate finished work.
- Upload to Drive with the native upload path. Uploading by temporary file URL has saved HTML error pages instead of images; always open the uploaded file to check it is a picture.
- Every output goes through a vision check: copy correct and legible, on-brand colours, semantic colours kept, no competitor logos or people, seamless background.
- Known faults: garbled or invented words (regenerate, do not patch), stray logos, drift from the brand hex, rate limits.

### B. Built in code
Used for most client batches from October 2026 (Ludlow, Ad Genius, InSync, Really Estate, Ampl, GrowthPoint).
- Layout, type and shapes are drawn programmatically at 1080 x 1920, so text is always exact and a global change (bigger eyebrow, new offer line) is one edit re-rendered across the set.
- Photos and generated imagery are placed as layers.
- Output committed to a branch of the `demos` repo under a client folder.
- Best for: type-led ads, fake UI, charts, grids, anything needing revision rounds.

Choose B when exact wording and repeated revisions matter. Choose A when copying the look of a specific winning ad.

## Canvas rules
- 1080 x 1920. Content in the centre 1:1 (22% to 78%).
- Build the background as its own layer extending to all edges, so variants can be made by moving the content layer only.
- Keep the content block as a group. Reels-safe copies are that group shifted or scaled into 14% to 65%.

## Reels-safe compositing methods
1. **Shift**: move the content group up (e.g. 220 px), extend background below.
2. **Scale and shift**: scale the group to fit the band.
3. **Blurred fill**: for flattened images. Scale the whole image down, place it in the band on a blurred, enlarged copy of itself, feather the edge so there is no visible seam.
4. **Story-safe**: scale to about 0.94 so the bottom 20% clears.
5. **Letterbox to 1:1** for carousel cards: pad to 1080 x 1080 with blurred side fill.

After any of these, check the result at phone size: text must not have become too small.

## Typography
- Use the client's fonts if known; otherwise a clean sans serif with heavy weight for headlines.
- Minimum sizes at 1080 wide (working guide): eyebrow 44 px or more, headline 90 px or more, supporting copy 40 px or more. When asked for "bigger", increase by at least 25%.
- High contrast. Dark overlay behind text on photos.

## Colour
- Exact client hex values for brand accents.
- Semantic red and green stay red and green.
- Mix light and dark ads in a set.

## Never generate
- Third-party logos, app icons or platform wordmarks.
- Real people other than those the client supplied.
- Invented reviews, badges, numbers or client names.

## Output
- PNG for type-heavy art, JPG (high quality) for photo-heavy; keep under Meta's upload size limit.
- File names by ad ID.

## Not confirmed
- The code toolchain used for method B (the rendering scripts are not in the repo; only outputs were committed).
- The minimum type sizes above are a working guide derived from revision feedback, not a documented standard.
- Whether Canva is part of the workflow.
