# Shared conventions (every agent loads this)

## People and roles

| Slack name | Role | Owns |
|------------|------|------|
| Reubs (Reuben) | Founder | Sales, onboarding calls, strategy, final say |
| Ollie - Lead Generation | Media buyer and creative lead | Creative batches, ad copy, ad sheets, client creative approval, optimisation calls |
| Rey - Funnel Architect | Funnel and launch | Funnel build, integrations, building ads in Meta from the ad sheet, go-live |
| Jed Tan - Fulfillment Manager | Delivery tracking | Blocker chasing, status updates, unanswered-client-question sweeps |
| JJ - Head Of Growth | Client success | Day-to-day client contact, weekly updates |
| Rey - Lead Designer (Reyshel) | Design and video | Video edits, 4:5 resizes, design fixes |
| Optimally OS | Bot | Lead, booking and onboarding notifications |

## Identifiers

- **Client ID**: upper snake case, e.g. `AMPL`, `DSQUARED`, `AI_BLACK_OPS`, `TRADEFLOW`. It is the join key across Baserow, funnel payloads and reports.
- **Meta Account ID**: numeric, stored on the Client Data row. In API calls prefix with `act_`.
- **Baserow base**: "Backend", database `453125`.

## Slack channels

- `<client>-main-chat`: the shared channel with the client. Creative review, approvals, questions.
- `<client>-funnel-notis`: bot-only lead and booking notifications for that client.
- `#delivery`: all internal fulfilment talk, ad sheet handoffs, status updates.
- `#7-reporting`: bot reports (onboarding forms, daily call logs, pipeline results).
- `#4-design`, `#3-team`, `#ops`: internal.

## Naming conventions (literal, do not vary)

**Campaign**

```
ABO | <Client> <Niche> <Offer> Static | D.C. DD/MM/YYYY
```
Example: `ABO | Ad Genius HVAC Pay Per Booked Job Static | D.C. 23/10/2026`

**Ad set**

```
Static Adset #<n> | ADV+ Broad | <Geo + ICP (exclusions)> | <Offer> | Lead Event
```
Examples:
- `Static Adset #1 | ADV+ Broad | Pay Per Shown Call | UK+US Coaches | Lead Event`
- `Static Adset #2 | ADV+ Broad | US HVAC 3+ Trucks (no HI/AK/TX) | Pay Per Booked Job | Lead Event`

**Ad**

```
<Mon> <D>th <Client or Offer> Batch [n] | Ad <ID> | '<hook or angle in a few words>'
```
Examples:
- `Oct 12th Pay Per Shown Call Batch | Ad S1 | Pay per shown appointment`
- `Nov 9th Ad Genius HVAC Batch 2 | Ad S16 | 'Stop buying leads'`

An ad name must be unique within the account at any one time. The funnel passes the ad name as `ad_id`, and the lead-to-ad match in Baserow is a literal string match on it. Never rename a live ad.

**Creative (Meta creative object)**: `<Client> S<n> | original + reels-safe`

**Ad IDs inside a batch**: `S1, S2 ...` for statics. `V1, V2 ...` for video. When a batch belongs to a later ad set, either continue the numbering (S9 to S16) or prefix (`A2 S1`). Match whatever the ad sheet uses.

**Files**: `S1.png`, `S1_reels.png`, `S1_reels_v2.png`, `S1_1x1.png`. Client-designed sets keep their prefix: `cp-post-01.jpg`, `cp-story-01.jpg`, `cp-reels-01.jpg`, `cp-storysafe-01.jpg`.

**Ad sheet**: `Adset <n> Ad Sheet - <count> Statics`, tab `Static ads`.

**Creative batch (Baserow)**: `<Client> Batch 00n | <Campaign offer>`

## URL parameters (set on every ad)

```
utm_source=Meta&utm_medium=Direct%20Page%20Booking&utm_campaign=<Offer%20Name>&utm_content=Static+Ad&ad_id={{ad.name}}&adset_id={{adset.name}}&campaign_id={{campaign.id}}
```

- `utm_campaign` is the offer name, e.g. `Pay%20Per%20Booked%20Job`.
- `utm_content` is `Static+Ad` or `Video+Ad`.
- The three `{{...}}` values are Meta macros. Leave them as macros.
- A lead whose `ad_id` arrives as the literal text `{{ad.name}}` did not come from an ad.

## Creative canvas and safe zones

- Master canvas: **9:16, 1080 x 1920**.
- All readable content (headline, eyebrow, offer, logo, proof) sits inside the **centre 1:1 square**, roughly **22% to 78%** of the height. Meta crops to square in feed.
- Background is extended to fill the top and bottom; nothing important lives there.
- **Reels-safe copy**: content moved or scaled into the **14% to 65%** band (top 14% and bottom 35% left clear for Reels interface).
- **Story-safe copy**: scale content to about 0.94 so logo and CTA clear the bottom 20%.
- Other sizes only when asked: 4:5 feed version, 1:1 carousel cards at 1080 x 1080.

## Glossary

- **Ad sheet**: the Google Sheet that hands a batch from creative to launch.
- **Pixel cohort**: leads who qualified on the funnel. Only these fire the pixel Lead event.
- **Tier**: funnel qualification result: `qualified`, `unqualified`, or a capture-only reason such as `low-revenue`.
- **CPBC**: cost per booked call.
- **Winner**: an ad Meta has concentrated spend on that is also producing qualified leads or bookings.
- **D.C.**: date created, in the campaign name.
