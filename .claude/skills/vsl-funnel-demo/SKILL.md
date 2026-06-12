---
name: vsl-funnel-demo
description: >-
  Turn a single company URL into a fully deployed, premium VSL (video sales letter) call-funnel demo
  landing page, end to end. Use this whenever the user gives a company/website URL and wants a demo
  funnel, demo landing page, mock funnel, recreated funnel, or "build a demo for this site" — even if
  they don't say the word "skill". Trigger on phrases like "make a demo landing page for optimally.ltd",
  "spin up a VSL funnel for this URL", "build a demo funnel for <company>", "recreate this site as a
  sales funnel", or a bare URL with "do the demo". The skill scrapes the brand + business content with
  Firecrawl, then CLAUDE WRITES a self-contained premium index.html itself (no Stitch), deploys it to
  demos.optimally.ltd/<slug> on Vercel via git, logs it to Baserow, and posts a summary to Slack.
  Optimally-internal pipeline (CTAs always point back to optimally.ltd/demo).
---

# VSL Funnel Demo Builder (Claude-authored)

One company URL → a deployed, on-brand, premium VSL call-funnel demo landing page, then logged and
announced. The visitor gets a live link to send a prospect, with click tracking back to Optimally.

**Claude writes the page directly** (Tailwind + a little CSS/JS) from a rich Firecrawl scrape — no
Stitch. This is deterministic: all sections always present, controlled headline length and logo size,
real animations, CTAs tracked from the start.

Optimally-specific — hardcodes the Vercel project, domain, Baserow base, Slack channel, and the
partner CTA. Conventions also live in the user's memory files (source of truth; skim first):
`stitch-vsl-funnel-prompt-spec.md`, `stitch-project-naming.md`, `vercel-demo-deploys.md`.

## Fixed configuration (Optimally)

| Thing | Value |
|-------|-------|
| Deploy repo (git) | `ReubenShears/demos` (public), root mirrors `demos/` — one `<slug>/index.html` per demo |
| Local working copy | `D:\Claude Cowork\demos\` |
| Live domain | `https://demos.optimally.ltd/<slug>` (Vercel auto-builds on push to `main`) |
| CTA tracking base | `https://www.optimally.ltd/demo?partner=<slug>` (opens new tab) |
| Baserow database / table | `Backend` (id `453125`) / `Demo Landing Page Data` (id `1024310`) |
| Slack channel | `#5-asset-generation` (id `C0AN653QCF2`) |
| Build spec | `references/build-spec.md` — the premium design + structure rules Claude follows |

## Workflow

Work in order; short status lines as you go. Total run ~1–3 min (no Stitch generation wait).

### 0. Derive identifiers from the URL
- **slug** (king): first domain label after removing a leading `www.`, lowercased.
  `www.unorthodox.digital` → `unorthodox`; `getacme.io` → `getacme`. Drops the TLD entirely (never
  `unorthodox-digital`). Reused for the folder, URL path, and `partner=` param.
- **Brand name (short)** for display (e.g. `Unorthodox`); **Company name (full)** for Baserow Prospect
  Name + footer (e.g. `Unorthodox Systems`). Refine both after the scrape from `ogTitle`.

### 1. Scrape the site — ONE Firecrawl call (keep it lean)
Call `firecrawl_scrape` **ONCE** on the URL with `formats: ["branding","markdown"]`. That single call
(a fixed endpoint) returns BOTH the brand tokens AND the homepage copy:
- Brand: `branding.colors` (primary/secondary/textPrimary/background), `branding.images.logo`,
  `branding.images.favicon`, `branding.images.ogImage`, `branding.fonts`, `branding.spacing.borderRadius`
- Content: the homepage `markdown`

Read that markdown directly and pull the offer, ICP, deliverables, mechanism, timeframe, guarantee, and
any testimonial / founder / FAQ hints. That is your source for writing the page (the A → B → timeframe
→ mechanism for the headline comes from here).

EFFICIENCY — do NOT bloat this step (this is important — it was over-running before):
- Do NOT `firecrawl_map` the site and do NOT scrape any additional pages. The one homepage scrape is enough.
- Do NOT spawn sub-agents, and do NOT run repeated Grep/Read passes over the scrape to "extract" content
  — just read the returned markdown directly and write from it.
- If the homepage lacks founder / testimonial / FAQ specifics, write reasonable on-brand copy for those
  sections (founder = placeholder graphic + plausible bio, testimonials = neutral quotes, FAQ = 7
  plausible objections for this offer) rather than fetching more pages.

### 2. Write the page (Claude authors it — the core step)
Read `references/build-spec.md` and follow it exactly to write ONE self-contained `index.html`:
the 9-section premium VSL funnel, brand colours/fonts/logo, real copy from the business brief, headline
2–3 lines max, prominent logo, atmospheric design + subtle scroll motion, every CTA a tracked
**"Learn More"** anchor (`href="https://www.optimally.ltd/demo?partner=<slug>"`, new tab), `© 2026`.
Write it to a temp file, e.g. `/tmp/<slug>.html`. (In a routine, fetch the build spec from the raw URL:
`https://raw.githubusercontent.com/ReubenShears/demos/main/.claude/skills/vsl-funnel-demo/references/build-spec.md`.)

Self-check before placing: all 9 sections present; headline ≤3 lines; logo prominent; every CTA tracked;
`© 2026`; renders mobile/tablet/desktop; no letter clipping; no lorem where real content existed.

### 3. Place + safety net
Run the bundled script — it's now a SAFETY NET (Claude already baked CTAs/logo/year, but this guarantees
them and places the file):
```bash
FAVICON_URL="<favicon-url>" OG_IMAGE_URL="<og-image-url>" node "<skill-dir>/scripts/place_demo.mjs" /tmp/<slug>.html <slug> "<deploy-root>" "<logo-url>"
```
`<deploy-root>` = `D:/Claude Cowork/demos` locally, or the cloned/working repo root remotely. `<logo-url>`,
`<favicon-url>`, `<og-image-url>` come from step 1 (`branding.images.logo` / `.favicon` / `.ogImage`). The
script re-asserts tracked "Learn More" CTAs, forces the real logo, injects the favicon + og:image if Claude
missed them, normalizes the footer year to 2026, and writes `<slug>/index.html`. Confirm the printed CTA count is > 0.

### 4. Deploy to Vercel (git push to ReubenShears/demos)
Deploy = commit `<slug>/index.html` and push to `main`; Vercel auto-builds → `demos.optimally.ltd/<slug>`.

**Local machine:**
```bash
git -C "D:/Claude Cowork/demos" add <slug>/index.html
git -C "D:/Claude Cowork/demos" -c user.email="132842611+ReubenShears@users.noreply.github.com" -c user.name="ReubenShears" commit -m "demo: <slug>"
git -C "D:/Claude Cowork/demos" push origin main
```
**Remote / headless (cloud routine):** if already inside the repo checkout, just `git add/commit/push origin main`.

**CRITICAL — push with the git CLI, NOT GitHub MCP tools** (`push_files`/`create_or_update_file` use a
separate read-only credential → 403). If a `GITHUB_TOKEN` is provided, PREFER it:
`git remote set-url origin "https://x-access-token:${GITHUB_TOKEN}@github.com/ReubenShears/demos.git"` then push.
Commit author email MUST be `132842611+ReubenShears@users.noreply.github.com` or Vercel blocks the build.
Push directly to `main` (no feature branch). After pushing, poll until
`curl -sS -o /dev/null -w "%{http_code}" https://demos.optimally.ltd/<slug>` returns `200` (allow a couple of minutes).

### 5. Extract fields + verify completeness
From the placed `<slug>/index.html`, pull **Headline** (hero `<h1>`) and **ICP** (after "Attention:").
Verify all nine sections are present (esp. Building Trust / Founder / FAQ). If something's missing, set
Baserow Status `Needs Review` and note it.

### 6. Log to Baserow
`get_table_schema` for table `1024310`, then `create_rows` with: Prospect Name (full company), Slug,
Source URL, Live Demo URL (`https://demos.optimally.ltd/<slug>`), CTA Tracking URL, Status `Deployed`,
Headline, ICP, Primary Colour, Secondary Colour, Logo URL, Date Generated (today). Only send fields that
exist. (Stitch Project ID/URL no longer apply — leave blank or skip.)

### 7. Announce in Slack
Post to `C0AN653QCF2` with `slack_send_message` using **Slack mrkdwn** (single-asterisk `*bold*`,
`<url|label>` links, `>` quote groups, NO em dashes, valid emoji shortcodes — `:frame_with_picture:`
not `:framed_picture:`):
```
:rocket: *New Demo Landing Page*

*{{Company}}*   `{{slug}}`

> :link:  *Live:*  <https://demos.optimally.ltd/{{slug}}|demos.optimally.ltd/{{slug}}>
> :dart:  *CTA (tracked):*  <https://www.optimally.ltd/demo?partner={{slug}}|optimally.ltd/demo?partner={{slug}}>  _(new tab)_
> :globe_with_meridians:  *Source:*  <{{sourceURL}}|{{sourceURL_short}}>

> :pencil2:  *Headline:*  {{headline}}
> :busts_in_silhouette:  *ICP:*  {{icp}}
> :art:  *Brand:*  `{{primary}}`  /  `{{secondary}}`

> :white_check_mark:  *Status:*  Deployed  ·  Logged to Baserow
```

### 8. Report back
Live link first and biggest, then a compact recap (brand colours, CTA tracking param, Baserow + Slack
confirmations). Flag anything that needed a fallback.

## Failure handling
- **Firecrawl map/deep-scrape thin:** fall back to the homepage scrape; still build all sections from it.
- **Deploy 403:** ensure you used the git CLI (not GitHub MCP) and the token/permission; report the real error.
- **Live URL 404 after push:** confirm `<slug>/index.html` exists and the push landed on `main`; allow build time.
- **Baserow field mismatch:** log what you can; note skipped fields. Don't abort the run over a logging field.

## Notes on scope / side effects
Deploys a real page, writes a Baserow row, posts to Slack on every run. One URL in → one real demo out.
Don't run speculatively. Stitch is retired; if ever needed, the old Stitch-based skill is in this repo's git history.
