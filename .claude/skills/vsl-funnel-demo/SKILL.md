---
name: vsl-funnel-demo
description: >-
  Turn a single company URL into a fully deployed VSL (video sales letter) call-funnel demo
  landing page, end to end. Use this whenever the user gives a company/website URL and wants a
  demo funnel, demo landing page, mock funnel, recreated funnel, or "build a demo for this site" —
  even if they don't say the word "skill". Trigger on phrases like "make a demo landing page for
  optimally.ltd", "spin up a VSL funnel for this URL", "build a demo funnel for <company>", "recreate
  this site as a sales funnel", or just a bare URL accompanied by "do the demo". The skill scrapes
  the brand, generates the page in Google Stitch, rewrites the CTAs with partner tracking, deploys
  it to demos.optimally.ltd/<slug> on Vercel, logs it to Baserow, and posts a summary to Slack.
  This is an Optimally-internal pipeline (CTAs always point back to optimally.ltd/demo).
---

# VSL Funnel Demo Builder

Turn one company URL into a deployed, on-brand VSL call-funnel demo landing page, then log and
announce it. The whole point: the user pastes a URL and gets back a live link to send to that
prospect, with click tracking so Optimally can see who engaged.

This skill is **Optimally-specific** — it hardcodes Optimally's Vercel project, custom domain,
Baserow base, Slack channel, and the partner-tracking CTA. The full rationale for every design
decision lives in the user's memory files; treat them as the source of truth and skim them first:
- `stitch-vsl-funnel-prompt-spec.md` — every copy/layout/imagery rule for the generated page
- `stitch-project-naming.md` — Stitch project naming convention
- `vercel-demo-deploys.md` — the Vercel project + domain + deploy command

If a convention here ever conflicts with those memory files, the memory files win (they get updated
as the user gives new feedback).

## Fixed configuration (Optimally)

| Thing | Value |
|-------|-------|
| Vercel project root (local) | `D:\Claude Cowork\demos\` |
| Live domain | `https://demos.optimally.ltd/<slug>` |
| Deploy command | `vercel deploy --prod --yes --cwd "D:/Claude Cowork/demos"` |
| CTA tracking base | `https://www.optimally.ltd/demo?partner=<slug>` (opens new tab) |
| Baserow database | `Backend` (id `453125`) |
| Baserow table | `Demo Landing Page Data` (discover id at runtime) |
| Slack channel | `#5-asset-generation` (id `C0AN653QCF2`) |
| Stitch model | `GEMINI_3_1_PRO`, device `DESKTOP` |

## Workflow

Work through these in order. Most steps are a single tool call. Tell the user what you're doing in
short status lines — this pipeline takes several minutes (Stitch generation alone is ~3-5 min).

### 0. Derive identifiers from the URL

Three identifiers used in different places — keep them straight:
- **slug** (king): the FIRST domain label after removing a leading `www.` — i.e. the text before the
  first dot, lowercased. `https://www.unorthodox.digital` → `unorthodox`; `https://getacme.io` →
  `getacme`; `https://www.optimally.ltd` → `optimally`. Drop the TLD entirely and NEVER hyphenate it
  into the slug (`.digital` / `.io` / `.ltd` are not part of the slug — `unorthodox`, never
  `unorthodox-digital`). Reused for the folder, URL path, and `partner=` param — keep it short and clean.
- **Brand name (short)**: the concise brand, used ONLY for the Stitch project title, e.g. `Optimally`.
  Derive it after the scrape from `ogTitle` / logo: take the brand root and drop suffixes like
  "Systems", anything after a `|` or `-` separator, and entity tags ("Ltd" / "Inc").
- **Company name (full)**: the fuller real company name, used for the Baserow `Prospect Name` and the
  page copy, e.g. `Optimally Systems` (from `ogTitle`, before any `|` / `-` separator).

### 1. Brand scrape (Firecrawl)

Call `firecrawl_scrape` with `formats: ["branding"]` on the URL. From the result keep:
- `branding.colors.primary`, `.secondary`, `.textPrimary` (→ neutral), `.background`
- `branding.fonts` / `branding.typography.fontFamilies` (map to a Stitch font enum; default `INTER`)
- `branding.images.logo`
- `metadata.ogTitle` (company name) and `metadata.ogDescription` / `description` (offer + ICP hints)
- `branding.spacing.borderRadius` (→ roundness; 8px → `ROUND_EIGHT`)

Only the **logo** is used as a real image in the page — see the imagery rule in the prompt. Map the
detected body/heading font to the closest Stitch enum value; if it isn't in the Stitch font list,
fall back to `INTER`. (The Stitch font enum is large — Inter, Manrope, DM Sans, Sora, Geist,
Plus Jakarta Sans, etc. Use `INTER` when unsure.)

### 2. Create the Stitch project

`mcp__stitch__create_project` with `title` set EXACTLY to `<Brand name (short)> | Demo Landing Page`
— e.g. `Unorthodox | Demo Landing Page`, `Optimally | Demo Landing Page`. The ` | Demo Landing Page`
suffix is REQUIRED. Do NOT name the project just the brand (`Unorthodox`), the full company name, a
tagline, or anything ending in `… VSL Funnel` (that is the auto-generated SCREEN title, not the
project title). Use the short brand. Save the numeric project id (strip the `projects/` prefix).

### 3. Create + apply the design system

`mcp__stitch__create_design_system` with `projectId` and a theme built from the brand:
`colorMode: LIGHT`, `headlineFont`/`bodyFont`/`labelFont` = mapped font, `roundness` from radius,
`customColor` = primary, `colorVariant: FIDELITY`, and `overridePrimaryColor` / `overrideSecondaryColor`
/ `overrideNeutralColor` = primary / secondary / text colors. Put a short brand `designMd` in it
(see the design-system block in the prompt reference). Save the returned `assets/<id>` name, then
**immediately** call `mcp__stitch__update_design_system` with the same payload to apply it (Stitch
requires the update call to make the system active for the project).

### 4. Generate the page

Read `references/generation-prompt.md`, fill in the placeholders (`{{COMPANY}}` = the full company
name, `{{URL}}`, `{{SLUG}}`, and the brand colors), and call `mcp__stitch__generate_screen_from_text` with
`projectId`, `designSystem: assets/<id>`, `deviceType: DESKTOP`, `modelId: GEMINI_3_1_PRO`, and the
filled prompt.

**Expect this call to time out** — that's normal, the generation keeps running server-side. Do NOT
retry it. Instead poll (next step).

### 5. Poll for the finished screen

Poll `mcp__stitch__list_screens` for the project until a screen titled like
`"<Company> VSL Funnel"` (or similar) appears **with a populated `htmlCode.downloadUrl`**. Generation
typically takes 3-5 minutes, so wait in chunks: start a background `sleep 75` (Bash,
`run_in_background: true`), and on each wake re-list. Keep going for up to ~8 minutes before treating
it as failed. From the finished screen capture:
- `htmlCode.downloadUrl` (the generated HTML)
- `screenshot.downloadUrl` (preview image)
- the project id (for the Stitch project URL)

### 6. Retrieve the HTML, retarget CTAs, place the file

**Get the generated HTML reliably — this is the step that fails most often if done naively.** The
finished screen's `htmlCode.downloadUrl` is a `contribution.usercontent.google.com` link. A plain
`curl` / WebFetch of it works on a local machine but is frequently **BLOCKED in headless / cloud
routine environments** (that's why naive runs flail through get_screen → WebFetch → etc.). Use this
order and stop at the first that returns a full HTML document:

1. **Firecrawl (use this first in a routine):** `firecrawl_scrape` with `url: <htmlCode.downloadUrl>`
   and `formats: ["rawHtml"]`; use the returned `rawHtml` — it's the generated page source and
   Firecrawl fetches server-side, so it isn't blocked.
2. **curl (local machine):** `curl -sL "<htmlCode.downloadUrl>" -o /tmp/<slug>.html`.

Write the HTML to a temp file (e.g. `/tmp/<slug>.html`) and VERIFY it's a complete document — it must
contain `<html` and the hero headline text. Never proceed with empty/truncated HTML; if every method
fails, post a FAILURE to Slack rather than deploying a blank page.

Then run the bundled script to rewrite every "Learn More" CTA to the partner tracking URL (new tab)
and place the file:
```bash
node "<skill-dir>/scripts/place_demo.mjs" /tmp/<slug>.html <slug> "<deploy-root>"
```
`<deploy-root>` is `D:/Claude Cowork/demos` locally, or the cloned/working repo root remotely.
`place_demo.mjs` handles BOTH `<a>` and `<button>` CTAs, preserves the original image URLs (the user
does **not** want Stitch images localized), writes `<slug>/index.html`, and prints how many CTAs it
retargeted. Sanity-check that the printed count is > 0.

### 7. Deploy to Vercel

Deploy = commit the new `<slug>/index.html` to the **`ReubenShears/demos`** repo (private) and push
to `main`. That repo is connected to the Vercel `demos` project, so Vercel auto-builds and serves it
at `demos.optimally.ltd/<slug>`. The local `demos/` folder IS the git working copy of this repo, so
local and remote use the same mechanism — push to git. Always push (don't rely on CLI-only deploys),
so the repo never drifts behind and a later remote run sees every demo.

**Local machine.** Step 6 already wrote `demos/<slug>/index.html` into the working copy. Commit + push:
```bash
git -C "D:/Claude Cowork/demos" add <slug>/index.html
git -C "D:/Claude Cowork/demos" -c user.email="132842611+ReubenShears@users.noreply.github.com" -c user.name="ReubenShears" commit -m "demo: <slug>"
git -C "D:/Claude Cowork/demos" push origin main
```
(Optional, for an instant preview without waiting on the git build: `vercel deploy --prod --yes --cwd "D:/Claude Cowork/demos"`.)

**Remote / headless (cloud routine).** Two sub-cases:

- *Already inside a checkout of this repo* (the common case — this skill lives in `ReubenShears/demos`
  under `.claude/skills/`, so a routine pointed at this repo is already in the working copy). Write the
  page at the repo root and push — no clone needed:
  ```bash
  node "<skill-dir>/scripts/place_demo.mjs" /tmp/<slug>.html <slug> "<repo-root>"   # writes <slug>/index.html
  git add <slug>/index.html \
    && git -c user.email="132842611+ReubenShears@users.noreply.github.com" -c user.name="ReubenShears" commit -m "demo: <slug>" \
    && git push origin main
  ```
- *No checkout available* — clone first, then write into it:
  ```bash
  git clone https://x-access-token:$GITHUB_TOKEN@github.com/ReubenShears/demos.git repo
  node "<skill-dir>/scripts/place_demo.mjs" /tmp/<slug>.html <slug> "repo"   # writes repo/<slug>/index.html
  cd repo && git add <slug>/index.html \
    && git -c user.email="132842611+ReubenShears@users.noreply.github.com" -c user.name="ReubenShears" commit -m "demo: <slug>" \
    && git push origin main
  ```

For pushing, the routine needs git write access to `ReubenShears/demos`. If the routine already has
GitHub write access via Claude's GitHub connection (it's operating on the repo), no extra credential
is needed. Otherwise provide a `GITHUB_TOKEN` with push access in the environment. If neither is
present, report it clearly rather than failing silently.

**Do not change the commit author email.** Vercel BLOCKS a git deploy if the commit author email
can't be matched to a GitHub account. `132842611+ReubenShears@users.noreply.github.com` is the
account's verified noreply address and is what unblocks the build — keep using it for every commit
(local and remote). A "real-looking" email like `reuben@optimally.ltd` will silently block the deploy.

**After pushing**, the Vercel build is async — poll until
`curl -sS -o /dev/null -w "%{http_code}" https://demos.optimally.ltd/<slug>` returns `200` (allow a
couple of minutes).

### 8. Extract fields + verify completeness

From the generated `<slug>/index.html`, pull:
- **Headline**: the hero `<h1>` text (collapse whitespace).
- **ICP**: the text after "Attention:" in the hero eyebrow.

Also VERIFY the page is complete before logging it as done. Confirm it contains all nine sections —
the ones generations tend to drop are **Building Trust / testimonials, Founder, and FAQ**. Quick
check: the HTML should have an FAQ accordion (~7 question entries), a Founder / "Meet the …" section,
and testimonial quote blocks. If any required section is missing, set the Baserow **Status** to
`Needs Review` and note what's missing in Baserow + the Slack post — do not present an incomplete page
as finished.

These fields go into Baserow + Slack so the user can scan them without opening the page.

### 9. Log to Baserow

Find the table: `mcp__...baserow...list_tables` (database `453125`) → locate `Demo Landing Page Data`,
then `get_table_schema` to confirm the exact field names at runtime (the user may tweak them) and only
send fields that exist. Confirmed schema for `Demo Landing Page Data` (table id `1024310`):

| Field | Value |
|-------|-------|
| Prospect Name | full company name, e.g. `Optimally Systems` (primary field — NOT the short brand) |
| Slug | `<slug>` |
| Source URL | the input URL |
| Live Demo URL | `https://demos.optimally.ltd/<slug>` |
| CTA Tracking URL | `https://www.optimally.ltd/demo?partner=<slug>` |
| Status | `Deployed` (single-select; options: Generated, Deployed, Sent, Live, Needs Review, Archived) |
| Headline | extracted headline |
| ICP | extracted ICP |
| Primary Colour | brand primary hex (British spelling) |
| Secondary Colour | brand secondary hex (British spelling) |
| Logo URL | scraped logo url |
| Stitch Project ID | the numeric project id |
| Stitch Project URL | `https://stitch.withgoogle.com/projects/<projectId>` |
| Preview Screenshot | the screenshot downloadUrl |
| Date Generated | today's date (from context) |
| Notes | optional — anything notable / fallbacks used |

The slug is not stored separately (it lives inside the URLs). Re-confirm the schema with
`get_table_schema` at runtime in case the user tweaks it, and only send fields that exist.

### 10. Announce in Slack

Post to channel `C0AN653QCF2` with `slack_send_message` using the **exact** format below so every
demo reads consistently.

CRITICAL — use **Slack mrkdwn**, not Markdown, or it renders broken:
- Bold is single asterisks `*like this*` — NEVER `**like this**` (Slack shows the literal `**`).
- Links are `<url|label>` — NEVER `[label](url)`. Always label links so no giant raw URLs appear.
- Group lines with `>` blockquotes; a blank line starts a new quote block (gives the 3-group UI).
- No em dashes (`—`) anywhere. Use `:`, `/`, or `·`.
- Shorten the displayed link labels (e.g. `demos.optimally.ltd/optimally`, `optimally.ltd/demo?partner=optimally`).

```
:rocket: *New Demo Landing Page*

*{{Company}}*   `{{slug}}`

> :link:  *Live:*  <{{liveURL}}|{{liveURL_short}}>
> :dart:  *CTA (tracked):*  <{{ctaURL}}|{{ctaURL_short}}>  _(new tab)_
> :globe_with_meridians:  *Source:*  <{{sourceURL}}|{{sourceURL_short}}>

> :pencil2:  *Headline:*  {{headline}}
> :busts_in_silhouette:  *ICP:*  {{icp}}
> :art:  *Brand:*  `{{primary}}`  /  `{{secondary}}`

> :hammer_and_wrench:  *Stitch project:*  <{{stitchURL}}|Open in Stitch>
> :white_check_mark:  *Status:*  Deployed
> :card_index_dividers:  *Baserow:*  Logged

:frame_with_picture:  <{{screenshotURL}}|View preview screenshot>
```

Omit a line only if its value is truly unavailable. Use only valid **Slack** emoji shortcodes (the
template above is verified) — note Slack uses `:frame_with_picture:` for 🖼️, NOT `:framed_picture:`.

### 11. Report back to the user

Give the user the live link first and biggest, then a compact recap (brand colors, CTA tracking
param, Stitch project, Baserow + Slack confirmations). Flag anything that needed a fallback (e.g.
font not in Stitch's list, a Baserow field that didn't exist).

## Failure handling

- **Stitch generate times out**: expected — never retry the generate call; poll `list_screens`.
- **Screen never appears after ~8 min**: report it; the Stitch project still exists, so the user can
  retry generation without recreating the project/design system.
- **Deploy fails / domain 404**: re-run the deploy command; confirm `demos/<slug>/index.html` exists.
  The custom domain only serves paths that exist as folders.
- **Baserow field mismatch**: log what you can, tell the user which fields you skipped — don't abort
  the whole run over a logging field.
- **CTA count is 0** after `place_demo.mjs`: the generated markup may differ; open the HTML, find the
  CTA anchors, and adjust (the script targets anchors whose visible text is "Learn More").

## Notes on scope / side effects

This skill **deploys real pages, writes a Baserow row, and posts to Slack** on every run. Don't run
it speculatively or in a test/eval loop that would spam those systems. One URL in → one real demo
out.
