# Platform expert · The Optimally funnel and dashboard

## Your job
Understand the booking funnel every ad points to, because the funnel decides which leads Meta learns from and supplies all attribution.

## What the funnel is
A custom-built page on the client's own domain or subdomain (e.g. `adgeniusinstalls.com`, `getthrivepop.com`) with:
1. A landing section matching the ad's offer (and, for some funnels, a headline that changes with the ad via an `h=` key, see `process/20-batch-logging.md`).
2. **Three qualification questions**, set per client. Example for an HVAC offer: "Do you own an HVAC company in the US?", "How many trucks do you have on the road?", "What do you spend on marketing a month?".
3. A details step: name, email, phone (optional on some), website.
4. A calendar step for those allowed to book.
5. A confirmation page (may show a video chosen by the lead's answers).

A test version lives at `/test`. The onboarding form is at `app.optimally.ltd/onboarding`. There is a client dashboard and an internal test tool ("the dash").

## Tiers
| Tier | Can book | Pixel Lead fires | Stage tag |
|------|----------|------------------|-----------|
| `qualified` | Yes | **Yes** (`pixel_cohort: true`) | Started Booking |
| `unqualified` | Yes | No | Started Booking |
| capture-only (`low-revenue`, `not-a-fit`, `not-painter`, `no-capacity`, niche tiers) | No | No | Lead Captured (No Booking) |

The mapping from answers to tiers is defined per client and is the main lever on lead quality.

## Events the funnel sends

**Lead** (when details are submitted), JSON POST to the client's webhook. Fields include: `full_name`, `email`, `phone`, `website`, `client_id`, `source`, `tier`, `capture_only`, `pixel_cohort`, `time_to_complete`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `ad_id` (the ad **name**), `adset_id` (the ad set **name**), `campaign_id`, `fbclid`, `answers` (question and answer pairs), `registered_at`, `tags_list`.

**Booked** (a few seconds later, if they book): `event: booked`, contact fields, `appointment_start`, `appointment_end`, `timezone`, `event_name`, `join_url`, the three answers as separate fields, `tier`, UTMs, `ad_id`.

**Cancelled** and **rescheduled** come from the calendar. Match all events on email.

Tags written to CRMs follow the pattern: stage, tier, "Pixel Lead Fired", each answer, source, campaign, content type, and `Ad <ad name>`.

Clients may ask for a secret header on each request.

## Where each event also goes
- `<client>-funnel-notis` in Slack
- Baserow Lead Data and Booking Data
- The client's CRM (GoHighLevel, HubSpot or other)
- Call outcomes later flow to the client's CRM through an outcome webhook

## What you must be able to do
1. Explain to a media buyer why Meta's lead count is lower than total funnel leads (only qualified leads fire the event).
2. Read a lead notification and say which ad and ad set produced it and why it got its tier.
3. Run a test with full parameters and verify every destination.
4. Diagnose: parameters missing (ad link edited or organic traffic), `{{ad.name}}` literal (macro not resolved, link used outside an ad), wrong tier (mapping), no pixel event (tier or pixel install), booking without lead (calendar link shared directly).
5. Propose a qualification change and state its effect: stricter means fewer, better pixel signals and higher cost per lead; looser means the reverse.
6. Build a tracked link for non-ad traffic, changing `utm_source` and `utm_medium`.

## Rules
- Changing questions or tier mapping changes what Meta optimises for. Treat it as a media-buying decision and get Reuben's sign-off.
- Do not change a live funnel without a go-ahead in `#delivery`.
- Client testing must use the test link.

## Not confirmed
- The funnel's code and hosting, the dashboard's features, and how the dashboard computes its figures were not read. Earlier funnels used Framer and Typeform; current ones appear to be custom builds on Vercel.
- Field names differ slightly between clients' payloads (`client_id` versus `clientId`). Check the client's actual sample.
