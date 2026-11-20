# 06 · Static creative production

## Purpose
Produce the batch of static ad images from the angle plan, on brand, at the right size, ready for quality control.

## Trigger
Angle plan posted (step 05).

## Inputs
- Angle plan table
- Brand: logo, hex colours, fonts (from Client Data `Brand Uploads`, the client's site, or files in `-main-chat`)
- Photos and headshots the client supplied; screenshots of real results
- Template source: Optimally winners or the template library (named `<Format> - <angle> - <nn>`, e.g. `Bold Statement - contrarian - 03`)

## Output spec
- **1080 x 1920 (9:16)**, PNG or high-quality JPG
- All readable content inside the centre 1:1 square (22% to 78% of height); background extended seamlessly above and below
- One file per ad named by its ad ID: `S1.png` ... `S12.png`

## Steps

1. **Set the brand kit**
   1. Take colours from the client's own material. Use exact hex values ("exact brand navy").
   2. Use the client's fonts where known (examples seen: Poppins; Mulish with Noto Serif).
   3. Place the client logo on every ad unless the template is logo-free.
2. **Build each ad from its row in the plan**
   1. Eyebrow (ICP callout) at the top of the safe zone, large.
   2. Headline: short. When in doubt, cut words and enlarge.
   3. Supporting line: only if it adds the mechanism or the offer. It must be readable on a phone; "larger sub-copy" is the most common revision request.
   4. Offer line or bar: same wording on every ad.
   5. Visual: per the plan.
3. **Method A: reskin a proven template ("carbon-copy method")**
   1. Recolour brand accents to the client palette.
   2. **Keep semantic colours**: red crosses and green ticks stay red and green. Only recolour a contrast that is decorative.
   3. Strip every competitor logo, wordmark, person and platform icon; replace with generic equivalents.
   4. Swap any person for a clearly different generic person, or remove them.
   5. Generate with the image model in edit mode at medium quality, then compose the 9:16 canvas locally (see `platforms/image-generation.md`).
4. **Method B: build from scratch** (current default in Claude Code sessions): render each static to the spec, commit to a branch of the `demos` repo under a client folder, and review the rendered images.
5. **Imagery rules**
   1. Use imagery from the client's world: model homes for a home-builder marketer, vans and condensers for HVAC, restaurant scenes for restaurant marketing. Generic stock that misses the niche gets rejected ("model-home imagery instead of kitchens").
   2. Prefer graphics over stock photos when the photo adds nothing; a whole set has been rebuilt to "remove photos".
   3. Founder photos and real result screenshots outperform invented scenes when available.
   4. Fake UI must look native: real-looking DM threads, lock screens, calendars, ad previews.
6. **Carousels**: 1:1 cards at 1080 x 1080. If built at 9:16, keep each card's content in the centred 1:1 zone or pad with a blurred fill so nothing is cropped.
7. **Version control**: when revising, keep superseded files in `v1/`, `v2/` subfolders. Never overwrite the only copy of an approved file. Unselected ads go in a `Not selected` subfolder.
8. **Upload** the finals to the client's Drive batch folder and record the folder link.

## Output and handoff
- N statics at spec, in Drive and in the repo client folder
- Next: step 07

## Rules
- Meta-safe on the image: no third-party logos (Shopify, ChatGPT, Google, Meta). Naming a company in text is fine; its logo gets ads rejected.
- No price in the image unless it is the offer itself ("$0 upfront"). No income or results promises; proof, not promise.
- Do not invent numbers, reviews, badges or client names.
- When the client's own designers supply creative (as with CreativePixels), do not redesign. Check it against step 07, produce the placement variants in step 08, and send notes back to their designer.

## Not confirmed
- The location of the template library and whether Canva is used. Recent batches were built in code; earlier ones with an image model.
