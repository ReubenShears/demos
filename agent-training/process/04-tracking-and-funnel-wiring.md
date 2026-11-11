# 04 · Tracking and funnel wiring

## Purpose
Make sure a click on any ad can be followed to a lead, a tier, a booking and a call outcome, and that Meta only learns from the leads worth having.

## Trigger
Access collected (step 03) and the funnel build is under way.

## How attribution works

1. Every ad carries the standard URL parameters (`00-conventions.md`).
2. The funnel reads `utm_*`, `ad_id` (the ad **name**), `adset_id` (the ad set **name**), `campaign_id` and `fbclid` from the URL and stores them on the lead.
3. The visitor answers three qualification questions, then enters details.
4. The funnel assigns a **tier**:
   - `qualified`: sees the calendar; `pixel_cohort = true`
   - `unqualified`: may still book; `pixel_cohort = false`
   - capture-only reasons (`low-revenue`, `not-a-fit`, niche-specific ones such as `no-capacity`): details saved, calendar never shown
5. **The pixel Lead event fires only for the pixel cohort.** This is the core of the buying strategy: the ad set optimises for Lead, so Meta is trained on qualified leads only.
6. The funnel sends a `lead` payload, then a `booked` payload a few seconds later if they book, plus `cancelled` and `rescheduled` from the calendar. Match on email.
7. The bot posts each event to `<client>-funnel-notis`.
8. The lead is written to Baserow Lead Data, and later matched to the ad-day row in Ad Data by literal ad name (step 18).

## Steps

1. **Pixel**
   1. Confirm the pixel ID and that it is installed on the funnel domain.
   2. Confirm the Lead event is wired to the qualified tier only.
   3. Check the pixel's last-fired time after a test.
2. **Qualification mapping**: write out, per question and answer, which tier results. Get Reuben's sign-off on the mapping; it decides who Meta optimises for.
3. **Calendar**: connect the qualified calendar; confirm the meeting title renders fully (seen: title showing `Discovery Mtg | ` with nothing after the bar).
4. **CRM**: send lead and booking payloads to the client's webhook or CRM. Send a sample payload with fake details first.
5. **Funnel-notis**: confirm the client's `Funnel Notis Channel ID` is on Client Data and a test lead posts there.
6. **Test run**
   1. Use the funnel test link (`https://<funnel-domain>/test`) with full test parameters, for example `?utm_source=Meta&utm_medium=Paid&utm_campaign=<Offer>&utm_content=Static+Ad&ad_id=Test+Ad&adset_id=Manual+Test`.
   2. Complete one qualified and one unqualified run.
   3. Verify: notification in `-funnel-notis` shows Source, Medium, Campaign, Content, Ad and Adset; tier is right; pixel cohort is Yes only for the qualified run; booking lands on the client's calendar; CRM received both payloads.
   4. Tell the client how to test: through the test link, not the live site. A client testing on the live site creates real-looking leads and confuses everyone.
7. **Send the test link to the client** for funnel approval, and ask for the daily budget in the same message (step 12).

## Output and handoff
- Working funnel, verified end to end, test link sent
- Pixel ID and conversion event recorded for step 13
- Next: step 12 gates launch

## Rules
- If more than a few percent of leads arrive without `utm_content` or `ad_id`, creative-level attribution is dead. Fix link templates before the next launch.
- Clients emailing no-shows a raw calendar link does not break Meta tracking, but those bookings will carry no ad attribution.

## Not confirmed
- Whether the Conversions API is in use alongside the browser pixel.
- Whether call outcomes (shown, closed) are sent back to Meta. Outcomes are sent to client CRMs; nothing found showing them returned to Meta.
