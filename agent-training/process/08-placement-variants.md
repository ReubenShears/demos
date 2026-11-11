# 08 · Placement variants (Reels-safe, story-safe, feed)

## Purpose
Give every approved static a second copy that survives the Reels interface, so the ad can use Meta's placement customisation: one image for Reels, the original everywhere else.

## Trigger
Batch passed QC (step 07). Also when a client supplies their own creative.

## Why
Meta crops to square in feed and covers the bottom 20% to 35% of the screen with its own interface in Stories and Reels, plus a strip at the top. A static designed to the centre 1:1 zone is safe in feed and Stories. Reels needs content higher still.

## Zones

| Variant | Top clear | Bottom clear | Content band |
|---------|-----------|--------------|--------------|
| Original 9:16 | 22% | 22% | 22% to 78% |
| Reels-safe | 14% | 35% | 14% to 65% |
| Story-safe | n/a | 20% | scale to about 0.94 |

## Steps

1. **Start from the approved original.** Never change wording, colours or layout. The Reels copy is the same ad, repositioned.
2. **Make the Reels-safe copy**, choosing the gentlest method that clears the zones:
   1. **Shift**: move the art block up (one set was moved up 220 px). Use when the content block is short enough to fit 14% to 65% after shifting.
   2. **Scale and shift**: scale the content down until it fits the band, then position it. Use when the content is taller than 51% of the canvas.
   3. **Scale onto a blurred fill**: place the scaled original on a blurred, extended copy of itself with a feathered edge, so there are no hard borders. Use for client-supplied full-bleed designs.
3. **Fill the vacated area** with the extended background so the image is still a full 1080 x 1920 with no bars.
4. **Check**: overlay the zone guides. Nothing readable above 14% or below 65%. Logo and offer line fully inside.
5. **Story-safe copy** (only when the original has a logo or CTA near the bottom): scale content to about 0.94 so the bottom 20% is clear.
6. **Feed 4:5 copy**: only if the client asks or their designers supply one. Then the build uses 4:5 for feeds and 9:16 for Stories and Reels.
7. **Carousel cards**: pad to 1080 x 1080 with blurred side fill if the source is not square.
8. **Name the files**
   - `S1.png` original, `S1_reels.png` Reels-safe
   - a second attempt at the zones is `S1_reels_v2.png`; keep the first
   - client-prefixed sets: `cp-post-01`, `cp-story-01`, `cp-reels-01`, `cp-storysafe-01`
9. **Commit** originals and variants to the client folder in the `demos` repo (`<client>-ads/` or `<client>-reels/`) with a message stating client, ad range and method, e.g. `Calculated Solutions: Reels-safe ad images S1-S15 (art moved up 220px)`. Once on `main` they are reachable at `https://demos.optimally.ltd/<folder>/<file>` for upload to Meta.
10. **Upload** the variants to the Drive batch folder next to the originals.

## Output and handoff
- Two files per ad (original, Reels-safe), plus story-safe or 4:5 where needed
- Public URLs for step 13
- Next: step 09 and step 10

## Rules
- If a correction lands after variants exist (a spelling fix), regenerate every variant of that ad: post, story and Reels-safe.
- If an ad cannot be made Reels-safe without becoming unreadable, flag it. The build can exclude Reels for that one ad.

## Not confirmed
- Whether story-safe copies are assigned to Story placements in the build. Live ads inspected use only two labels: `reels916` and `orig916`.
