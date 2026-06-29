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
| CRM (GoHighLevel) | LeadConnector MCP server `2a59a55b-bfd6-44e2-bc09-85d430112b39` (via ghl-proxy). Custom field **Demo Landing Page URL** id `6dtdKnKMkB659ZVlsRof` |
| Engagement tracking | Beacon → same-origin `/api/track` (`api/track.js` proxy, env `TRACK_WEBHOOK_URL`/`TRACK_SECRET`) → n8n **Demo Engagement Tracker** (`mkjbBhNAh3HHHH3U`, webhook `demo-event`) → Baserow **Demo Engagement Data** (id `1047489`) + Slack **#6-demo-notifications** (`C0B0NGYQ71P`). Microsoft Clarity id `xd2h3tb6o4`. All universal — injected by `place_demo.mjs`, no per-demo setup. |
| Meta Pixel | Central loader `api/pixel.js` served at `/api/pixel`; pixel ID in env `META_PIXEL_ID` (NEVER in the page). Change the env var + redeploy `demos` to swap the pixel across every active demo — no page edits. Fires PageView + ViewContent + maps beacon actions (`book_click`→`Lead`, rest custom incl. `bot_message`→`DemoChat`). |
| Concierge chat | "The Optimally Team" AI FAB (bottom-right). Backend `api/chat.js` at `/api/chat` → Anthropic Messages API, model `CHAT_MODEL` (default `claude-haiku-4-5`); needs Vercel env **`ANTHROPIC_API_KEY`** (user-set). Buttons: Book a walkthrough (partner link) + Leave a review (Trustpilot `optimally.ltd`). Price-blind, ends every reply with a question, pushes the walkthrough, pivots to a review if not interested. Logs each exchange as a `bot_message` event (Q+A in Detail, heat 3). Injected by `place_demo.mjs`. |
| Build spec | `references/build-spec.md` — the premium design + structure rules Claude follows |

## Workflow

Work in order; short status lines as you go. Total run ~1–3 min (no Stitch generation wait).

> **Be patient for the input URL (cloud routine).** The routine that fires this skill sometimes starts a
> moment *before* the company URL has actually arrived in your input/trigger context — the URL can come
> through a little after the routine fires (timing race). **If the URL you need is missing or empty when you
> begin, do NOT abort.** Wait ~30 seconds (`sleep 30`) and re-check your input/trigger payload (and any
> source you were told to read it from, e.g. the latest relevant Baserow row), and keep retrying for up to
> ~5 minutes. Only report "no URL provided" if it is still absent after ~5 minutes. Never fail the run on a
> missing URL the instant you start.

> **⚠️ You are running AUTONOMOUSLY — finish the job, never just narrate the next step.** No human is
> watching this run, so nothing will nudge you to continue. **NEVER end a turn with a plan or a statement of
> intent** like "Now I'll author the page", "Let me write the index.html", or "Now authoring the page" —
> that is exactly where past runs silently died. When you say you are about to do something, **do it in the
> SAME turn with the actual tool call.** The two MUST-COMPLETE deliverables are (1) the written
> `index.html` and (2) the `git push` that deploys it; do not stop until BOTH are done (then Baserow +
> Slack + CRM). If you ever notice your latest message is a plan rather than an action, execute that action
> immediately instead of ending the turn. Work economically so you reach the authoring step with budget to
> spare: minimise narration, don't re-read files you've already read, and do **NOT** `curl`/verify image
> URLs (the network proxy blocks them and the scraped URLs render fine in the browser anyway).

### 0. Derive identifiers from the URL
- **slug** (king): first domain label after removing a leading `www.`, lowercased.
  `www.unorthodox.digital` → `unorthodox`; `getacme.io` → `getacme`. Drops the TLD entirely (never
  `unorthodox-digital`). Reused for the folder, URL path, and `partner=` param.
- **Brand name (short)** for display (e.g. `Unorthodox`); **Company name (full)** for Baserow Prospect
  Name + footer (e.g. `Unorthodox Systems`). Refine both after the scrape from `ogTitle`.

### 1. Scrape the site — ONE Firecrawl call (keep it lean)
Call `firecrawl_scrape` **ONCE** on the URL with `formats: ["branding","markdown"]`. That single call
(a fixed endpoint) returns BOTH the brand tokens AND the homepage copy:
- Brand: `branding.colors` (primary/secondary/textPrimary/background), `branding.colorScheme` (light/dark
  — the page must match this), `branding.images.logo`, `branding.images.favicon`,
  `branding.images.ogImage`, `branding.fonts`, `branding.spacing.borderRadius`
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
**Do this as your VERY NEXT action after the scrape — actually write the file now, in one `Write` call.
Do not stop to plan, summarise the brand brief, or "prepare" first; the run dies here if you narrate
instead of writing.** Read `references/build-spec.md` and follow it exactly to write ONE self-contained `index.html`:
the 9-section premium VSL funnel, brand colours/fonts/logo, real copy from the business brief, headline
2–3 lines max, prominent logo, atmospheric design + subtle scroll motion, every CTA a tracked
**"Learn More"** anchor (`href="https://www.optimally.ltd/demo?partner=<slug>"`, new tab), `© 2026`.
Write it to a temp file, e.g. `/tmp/<slug>.html`. (In a routine, fetch the build spec from the raw URL:
`https://raw.githubusercontent.com/ReubenShears/demos/main/.claude/skills/vsl-funnel-demo/references/build-spec.md`.)

Self-check before placing: all 9 sections present; headline ≤3 lines; logo prominent; every CTA tracked;
`© 2026`; renders mobile/tablet/desktop; no letter clipping; no lorem where real content existed.

### 3. Place + safety net (also injects the Optimally interstitial)
Run the bundled script — it's now a SAFETY NET (Claude already baked CTAs/logo/year, but this guarantees
them and places the file) AND it injects the standard Optimally demo interstitial modal. ALWAYS pass the
modal's parameters explicitly so it personalises and themes correctly:
```bash
FAVICON_URL="<favicon-url>" OG_IMAGE_URL="<og-image-url>" \
COMPANY_NAME="<short brand, e.g. Trust Relations>" \
BRAND_COLOR="<scraped primary hex>" ACCENT_COLOR="<scraped secondary/accent hex>" \
node "<skill-dir>/scripts/place_demo.mjs" /tmp/<slug>.html <slug> "<deploy-root>" "<logo-url>"
```
`<deploy-root>` = `D:/Claude Cowork/demos` locally, or the cloned/working repo root remotely. `<logo-url>`,
`<favicon-url>`, `<og-image-url>` come from step 1 (`branding.images.logo` / `.favicon` / `.ogImage`).
`COMPANY_NAME` = the SHORT brand (nicer in the modal copy). `BRAND_COLOR`/`ACCENT_COLOR` = the scraped
palette (primary + secondary/accent) — the modal tints itself from these via `color-mix`. The script
re-asserts tracked "Learn More" CTAs, forces the real logo, injects favicon + og:image if Claude missed
them, normalizes the footer year to 2026, **injects the interstitial modal + Microsoft Clarity + the
engagement beacon**, and writes `<slug>/index.html`. Confirm the printed CTA count is > 0 and the
`Interstitial injected:` / `Clarity injected.` / `Beacon injected:` lines show the right company + colours.

**The interstitial (don't author it yourself — the script owns it):** a dismissable popup that auto-surfaces
after 10s AND intercepts every CTA/button as a contextual midpoint before booking. It tells the visitor this
is a live demo by Optimally, invites them to book a walkthrough to see the strategy + how it fits a full
client-generating funnel for THEIR business (personalised with `COMPANY_NAME`), and injects 7-day urgency
(live countdown from the build date; after 7 days it softens to "live for a limited time, about to expire —
act now" since demos aren't actually taken down). Its button points to the same partner CTA as the page.
`CREATED_DATE` defaults to today (the build date) — only override if back-dating.

**Engagement tracking (also injected by the script — don't author it):** Clarity (universal id) for session
replay/heatmaps, plus a beacon that posts to the same-origin `/api/track` proxy (the real n8n webhook URL
never appears in page source). Five events fire — `page_open` (first view only), `cta_click`, `vsl_play`,
`scroll_50`, `book_click` — each logged to Baserow **Demo Engagement Data** with IP-geo (city/region/ISP)
and pinged to **#6-demo-notifications**. Nothing per-demo to configure: the proxy, env vars, and n8n
workflow are universal (see the Engagement tracking row above). Just ensure the page has the VSL play
control as `.play-btn` so `vsl_play` registers.

**Meta Pixel (also injected — don't author it):** the script injects a central pixel loader
(`<script async src="/api/pixel">`) plus an inline `window.OM_PIXEL={slug,company}`. The pixel ID lives
ONLY in the `META_PIXEL_ID` env var (never in the page), so the pixel can be swapped across every demo by
changing that one env var + redeploying — no page edits. It fires PageView + ViewContent and mirrors the
beacon's actions to Meta (`book_click`→standard `Lead`, others custom) for retargeting.

**Concierge chat (also injected — don't author it):** "The Optimally Team" AI chat FAB (bottom-right).
Backend `api/chat.js` (`/api/chat`) calls the Anthropic API and needs the Vercel env var **`ANTHROPIC_API_KEY`**
(Reuben sets it; without it the widget shows a graceful fallback). The system prompt is price-blind (it does
not know the price), keeps replies short and always ends on a question, knows the on-page video IS the VSL,
pushes the walkthrough quickly, and if the visitor isn't interested it pivots to asking for a Trustpilot
review. Every exchange fires a `bot_message` engagement event (the user's question + the reply are logged in
the Detail field). On open it shows 3 tappable suggested-question chips (one personalised to the company)
that prime the conversation and vanish once the visitor sends anything. Themed from the brand palette; goes
fullscreen on mobile.

`page_open` fires **once per 30-min session** (a refresh within 30 min is deduped client-side, so it never
hits the proxy or n8n — real execution savings); bots, link-preview crawlers, and prefetches are filtered
server-side at `/api/track` (centralized bot list), and the proxy forwards the real visitor UA so `Device`
logs correctly. `visitNumber` (localStorage) tracks how many sessions a visitor has had.

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

### 7. Attach the demo link to the CRM lead (GoHighLevel — conditional, best-effort)
Try to find the prospect in the Optimally GHL CRM and write the live demo URL into their **Demo Landing
Page URL** custom field. This is BEST-EFFORT and silent on miss: if no lead matches, do nothing (do not
error, do not create a contact, do not block the run). Use the LeadConnector/GHL MCP (server
`2a59a55b-bfd6-44e2-bc09-85d430112b39`, via the ghl-proxy):
1. **Find:** `contacts_get-contacts` with `query=<demo domain>` (e.g. `trustrelations.agency`).
2. **Pick:** if one or more contacts return, take the best match — prefer an exact email-domain match;
   if several, the most recently updated. If zero return, STOP this step silently and continue to Slack.
3. **Write:** `contacts_update-contact` with `path_contactId=<id>` and
   `body_customFields=[{"id":"6dtdKnKMkB659ZVlsRof","field_value":"https://demos.optimally.ltd/<slug>"}]`.
   **CRITICAL: use the field ID `6dtdKnKMkB659ZVlsRof`, NOT the field key
   `contact.demo_landing_page_url`** — the key returns `succeeded: true` but silently fails to persist
   (`customFields` stays `[]`). Confirm the returned `customFields` array shows the URL, then continue.

### 8. Announce in Slack
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

### 9. Report back
Live link first and biggest, then a compact recap (brand colours, CTA tracking param, Baserow + Slack
confirmations, and whether the CRM lead was found + updated or not matched). Flag anything that needed a fallback.

## Failure handling
- **Firecrawl map/deep-scrape thin:** fall back to the homepage scrape; still build all sections from it.
- **Deploy 403:** ensure you used the git CLI (not GitHub MCP) and the token/permission; report the real error.
- **Live URL 404 after push:** confirm `<slug>/index.html` exists and the push landed on `main`; allow build time.
- **Baserow field mismatch:** log what you can; note skipped fields. Don't abort the run over a logging field.
- **GHL lead not found / write fails:** skip silently — the CRM step is best-effort and must never block the
  deploy/Baserow/Slack steps. If the write returns success but `customFields` is empty, you used the field
  key instead of the ID `6dtdKnKMkB659ZVlsRof` — retry with the ID. (Needs the GHL connector enabled.)

## Notes on scope / side effects
Deploys a real page, writes a Baserow row, posts to Slack on every run. One URL in → one real demo out.
Don't run speculatively. Stitch is retired; if ever needed, the old Stitch-based skill is in this repo's git history.
