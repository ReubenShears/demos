# 11 · Revision handling

## Purpose
Apply feedback precisely, keep history, and stop one comment turning into five rounds.

## Trigger
Feedback from the client (Slack, Drive comments, a call), from Reuben, or from QC.

## Steps

1. **Collect all feedback first.** Read the Slack thread, every Drive comment on the folder and files, and any call notes. Do not start on the first comment.
2. **Write a change list**: one line per change, with the ad IDs affected and the exact new wording. Classify each:
   - **Global**: applies to every ad (eyebrow size, colour, logo, an offer phrase to remove)
   - **Per ad**: wording, image, layout on named ads
   - **Drop**: remove an ad
   - **Add**: a new ad
3. **Check for conflicts** with the offer lock, Meta policy or legibility. If the client asks for something that will hurt (a third-party logo, a revenue tag on the image, copy below the safe zone), do it only after explaining the cost once and offering the alternative.
4. **Apply the changes**
   1. Global changes: apply to all, then verify every ad, not a sample.
   2. "Bigger" means clearly bigger. Feedback escalated across rounds from "bigger" to "exaggerated: yellow highlight, underline, larger". Go far enough the first time.
   3. "Larger sub-copy" means enlarge the existing words. Do not rewrite copy unless asked; one round had to "restore original copy, just larger".
   4. Wording changes: change exactly the words asked for, everywhere they appear (image, story version, Reels-safe copy, ad sheet).
5. **Version it**
   1. Bump the set version (`v2`, `v3` ...) or move superseded files to `v1/`.
   2. When ads are dropped or added, **renumber** so the set runs `01..N` in order, and update the ad sheet and file names together.
   3. Keep a one-line changelog per version: what changed and why. This is the commit message.
6. **Re-run QC** (step 07) on changed ads; regenerate placement variants (step 08) for every changed ad.
7. **Update the ad sheet**: primary text or headline if the offer wording changed, creative notes if the visual changed.
8. **Return to step 10** with a summary of what changed.

## Patterns seen (use these to pre-empt feedback)
- Make the audience callout bigger.
- Make the offer clearer and bigger on every ad.
- Use the founder's own photos and words.
- Anonymise clients ("one client").
- Replace a case study with one the client prefers.
- Remove photos; use graphics.
- Remove a claim the client is not comfortable with ("No Shared Leads").
- Loosen or tighten the ICP wording ("restaurant groups" to "restaurant owners").
- Spelling in the target market's English.

## Output and handoff
- Revised set, versioned, with changelog
- Updated ad sheet
- Next: step 10

## Rules
- If ads are already live and the client wants changes, the live ads are **replaced**: new creative, new ad sheet, tell Rey to swap them. Do not edit the image on a running ad.
- More than three rounds on one batch: stop and ask Reuben to reset expectations with the client.

## Not confirmed
- A limit on revision rounds in client agreements. None found.
