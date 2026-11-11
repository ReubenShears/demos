# 18 · Reporting and data pipeline

## Purpose
Keep one truthful record of spend, leads, bookings and outcomes per client per day, with every lead tied to the ad that produced it.

## Trigger
Daily, for the previous day in each ad account's time zone. Also on demand ("pull yesterday's numbers for `<client>`").

## Where the data lives (Baserow "Backend", database 453125)

| Table | ID | Grain |
|-------|----|-------|
| Client Data | 1000911 | one row per client |
| Lead Data | 1000548 | one row per lead |
| Booking Data | 1051030 | one row per booking |
| Campaign Data | 1001942 | campaign per day |
| Adset Data | 1001979 | ad set per day |
| Ad Data | 1001990 | ad per day |
| Daily Call Funnel KPI Tracker | 1075558 | client per day |
| Sales Call Data | 1028550 | one row per call |

## Daily routine

1. **Find pullable accounts**: list ad accounts; keep ACTIVE ones that map to a client. Skip and report UNSETTLED accounts.
2. **Resolve account to client**: match on Client Data `Meta Account ID`. If missing and the match by name is confident, write the ID back. If ambiguous, ask.
3. **Pull yesterday** at campaign, ad set and ad level, split by day: name, status, spend, impressions, CPM, link clicks, leads (pixel), cost per result; objective on campaigns.
4. **Clean**: strip currency symbols and commas; treat "Not available" as empty. Derive `Link CTR = link clicks / impressions x 100`. For lead campaigns set `Cost Per Result = spend / leads`.
5. **Load** into the three ad tables. Before inserting, check whether a row already exists for that date and entity; update instead of duplicating. Set `Client Data` on ad rows at creation.
6. **Link** campaign rows to the client (and to the upcoming webinar for webinar clients).
7. **Match leads to ad-days**: for each lead, `meta_day = (registered time in UTC + Meta TZ Calibration hours)`; match `Ad Name == lead's ad_id` and `Date == meta_day`. If that day has no row, use the nearest day the ad ran. Leads with no ad_id, or the literal `{{ad.name}}`, stay unlinked.
8. **Sanity checks**: totals reconcile to Ads Manager; ad rows sum to the campaign's leads; no two ad rows share the same name and date (a collision means the naming convention slipped: stop and fix).
9. **Update the Daily Call Funnel KPI Tracker** for each call-funnel client: Adspend, Av CPMs, Av CTR, Impressions, Link Clicks, LP Views, Opt-Ins, Survey Complete, Qualified, Bookings, Cancellations. The table computes Load Rate, Opt-In Rate, Survey Complete Rate, Qualified Rate, Booking Rate and True Qual Booking Rate.
10. **Post a summary** to `#7-reporting`: per client spend, qualified leads, bookings, cost per booked call, and any failure.

## What the ad row then shows
Attributed Leads, Applications, Booked Calls, Shown Calls, Purchased, and the leads' answers to the three funnel questions. This is the table step 16 reads.

## Standing reports
- `<client>-funnel-notis`: every lead ("New Lead Started Booking") and booking ("Call Booked"), with tier, answers, source, campaign, ad and ad set.
- `#7-reporting`: new onboarding forms; daily list of sales and discovery calls logged with Fathom links.
- Client dashboard: the client's view of the same numbers; send the link on request.
- Weekly: the client message and call (step 19).

## Reading the funnel when results are poor

| Symptom | Look at |
|---------|---------|
| High CPM | Creative, audience size, callout too narrow |
| Low link CTR | Hook and image |
| Low load rate | Page speed, domain, broken link |
| Low opt-in rate | Landing page and offer match with the ad |
| Low qualified rate | Who the creative is calling out |
| Low booking rate from qualified | Calendar availability, page after the form |
| Booked but not shown | Reminders and confirmation page |

## Rules
- Write rows at full precision through the API. Never import by CSV; it rounds.
- Deleting rows needs Reuben's confirmation.
- Flag a blank `Meta TZ Calibration` rather than assuming one.

## Not confirmed
- Which parts already run unattended and which are still run by hand.
- The source of LP Views in the KPI tracker (per-day landing-page views are not reliably available from Meta's API; the funnel may supply them).
