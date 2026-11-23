# 20 · Creative batch and hook logging

## Purpose
Record every batch so the next one can avoid repeats, reuse what worked, and be traced from ad name back to brief.

## Trigger
A batch is finalised (after step 10) and again when ads from it go live (step 14).

## A. Creative Batch Data (Baserow table 1040349)

One row per batch.

| Field | What to write |
|-------|---------------|
| Batch Name | `<Client> Batch 00n | <Campaign offer>` |
| Client ID | Upper snake case |
| Date Created | Date finalised |
| Campaign Offer | The front-end offer the ads sell |
| Backend / Call Offer | What is sold on the call. Not shown in ads |
| ICP / Audience | One line, with size filter and geography |
| Pain Points Used | Semicolon-separated |
| Brand Colours | Hex values with role, and where they came from |
| Ad Count | Number of ads in the final set |
| Formats Used | e.g. `Bold Statement; This vs That; Fake UI; Stat Guarantee` |
| Angles Used | e.g. `pain; contrarian; reframe; proof` |
| Output Spec | `9:16 (1080x1920), all content in centred 1:1 safe-zone, background extended` plus light/dark mix |
| Source Templates | Template or winner each ad was built from |
| Drive Folder | Link to the batch folder |
| Feedback / Notes | See below |

**Feedback / Notes** must contain:
1. Who gave feedback, on what date, and the instruction in their words.
2. The final pick: which drafts became which ad IDs, and how many were made versus selected.
3. Rules applied (semantic colours kept, logos stripped, claims removed).
4. Production method and any regenerations.
5. The ad sheet link.
6. After launch: campaign and ad set names the batch went into, and launch date.

## B. Ad Hooks (Baserow table 1199061)

Used where the landing page changes its headline to match the ad (the URL carries `h=<key>`).

| Field | What to write |
|-------|---------------|
| Hook Key | `v1`, `v2` ... or `default` |
| Headline | Landing-page headline. Wrap the highlighted phrase in `*asterisks*` |
| Subheadline | Supporting line |
| Angle | The pain or desire the ad led with |
| Ads Using It | Which ads carry this key |
| Active | Tick to serve it |
| Sort | Order |
| Notes | Date and reasoning |

Rule for these headlines: **promise the outcome; do not repeat the ad's hook.** The ad earns the click with the pain; the page headline states what they get.

The `default` row is shown when the URL has no `h=` or the key is unknown or switched off.

## C. Repo and Drive hygiene
1. Drive: one folder per batch; originals and Reels-safe copies; `Not selected` subfolder; nothing else.
2. Repo: client folder with final files; commit message states client, ad range and what changed.
3. Ad sheet title matches the ad set number it was launched in.

## Steps
1. Create or update the batch row when the client approves.
2. After launch, add campaign, ad set and date to the notes.
3. At each review (step 16), add one line: winners and losers by ad ID.
4. Before planning a new batch (step 05), read all earlier rows for the client and list used format-and-angle pairs.

## Rules
- Write through the API. You cannot create tables or fields that way; if a field is missing, ask.
- Do not store client contact details or keys in batch notes.

## Not confirmed
- This table has six rows, the latest from September 2026; later batches were not logged. Logging is currently inconsistent, which is the gap this agent closes.
- Whether per-ad hook keys are used for client funnels or only for Optimally's own.
