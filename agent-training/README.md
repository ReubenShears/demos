# Optimally agent training: media buying and creative setup

One file per agent. Each process agent owns one step of the client ads pipeline; each platform agent is the expert on one tool. Every agent should load `00-conventions.md` as well as its own file.

## How this was built

Reconstructed on 11 Nov 2026 from the work itself, not from chat history (the Claude chat export could not be read):

- this repo's 165 commits across 14 branches (creative batches, revision rounds, copy sheets)
- Baserow "Backend" base (Client Data, Creative Batch Data, Ad Hooks, Campaign/Adset/Ad Data, Daily Call Funnel KPI Tracker)
- live Meta ad accounts read through Pipeboard (campaign, ad set, ad and creative settings)
- Slack (`#delivery`, client `-main-chat` and `-funnel-notis` channels, `#7-reporting`)
- Google Sheets ad sheets and the saved `meta-ads-baserow-pipeline` skill

Every file ends with a **Not confirmed** section. Anything listed there was not found in writing and is a proposed default. Do not let an agent treat it as house policy until Reuben confirms it.

## The pipeline

| # | Step | File | Human owner today |
|---|------|------|-------------------|
| 01 | Client intake and onboarding form | `process/01-client-intake.md` | Reuben / Optimally OS bot |
| 02 | Onboarding call and offer lock | `process/02-onboarding-call-offer-lock.md` | Reuben |
| 03 | Access and asset collection | `process/03-access-and-assets.md` | Rey (Funnel Architect) |
| 04 | Tracking and funnel wiring | `process/04-tracking-and-funnel-wiring.md` | Rey (Funnel Architect) |
| 05 | Creative strategy and angle plan | `process/05-creative-strategy.md` | Ollie (Lead Generation) |
| 06 | Static creative production | `process/06-static-creative-production.md` | Ollie |
| 07 | Creative quality control | `process/07-creative-qc.md` | Ollie |
| 08 | Placement variants (Reels-safe, story-safe) | `process/08-placement-variants.md` | Ollie / Reuben |
| 09 | Ad copy and the ad sheet | `process/09-ad-copy-and-ad-sheet.md` | Ollie |
| 10 | Client creative approval | `process/10-client-approval.md` | Ollie |
| 11 | Revision handling | `process/11-revisions.md` | Ollie |
| 12 | Budget and launch readiness | `process/12-budget-and-launch-readiness.md` | Rey / Jed |
| 13 | Meta campaign build | `process/13-meta-campaign-build.md` | Rey |
| 14 | Launch QA and go-live | `process/14-launch-qa-go-live.md` | Rey |
| 15 | First 7 days monitoring | `process/15-first-7-days.md` | Ollie / JJ |
| 16 | Optimisation and new ad sets | `process/16-optimisation.md` | Ollie / Reuben |
| 17 | Video ad phase | `process/17-video-phase.md` | Ollie / Rey (Lead Designer) |
| 18 | Reporting and data pipeline | `process/18-reporting-data-pipeline.md` | Optimally OS bot / Reuben |
| 19 | Client comms and fulfilment status | `process/19-client-comms-status.md` | JJ / Jed |
| 20 | Creative batch and hook logging | `process/20-batch-logging.md` | Ollie |

## Platform experts

| File | Covers |
|------|--------|
| `platforms/meta-ads-manager.md` | Campaign, ad set, ad and creative settings as Optimally uses them |
| `platforms/meta-business-and-pixel.md` | Business portfolio access, pages, Instagram, pixel, events, policy |
| `platforms/pipeboard-meta-mcp.md` | Building and reading Meta objects through the Pipeboard connector |
| `platforms/baserow.md` | The Backend base, tables, fields, write rules |
| `platforms/slack.md` | Channel scheme, bots, message formats |
| `platforms/google-drive-sheets.md` | Creative folders, ad sheets |
| `platforms/image-generation.md` | Generating and compositing statics |
| `platforms/github-vercel-assets.md` | The `demos` repo as creative store and public image host |
| `platforms/optimally-funnel-and-dash.md` | The booking funnel, tiers, webhooks, dashboard |
| `platforms/crm-and-calendar.md` | GoHighLevel, HubSpot, Calendly connections |
| `platforms/fathom-and-zoom.md` | Call recordings as a source of offer, proof and voice |
| `platforms/n8n.md` | Automations behind the bot and data routines |

## Rules every agent follows

1. Never post, launch, spend or message a client without the approval gate named in your step.
2. Never copy an API key, token or password into a file, sheet, Slack message or log. Clients sometimes paste keys in Slack; do not repeat them.
3. Lead details (names, emails, phones) stay in Baserow and the `-funnel-notis` channels. Do not put them in reports, ad sheets or prompts.
4. Use the naming conventions exactly. Attribution depends on literal ad-name matching.
5. If an input you need is missing, stop and name the blocker in `#delivery`. Do not invent offers, results, numbers or testimonials.
6. Record what you did where the next agent will look for it (the handoff section of each file).
