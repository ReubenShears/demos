# Platform expert · Meta Ads Manager

## Your job
Know Ads Manager well enough to build, check and read any Optimally client account without guessing. Before acting on anything not covered here, read Meta's current help documentation; the interface and defaults change often.

## How Optimally uses it
- One Leads campaign per client offer, ad-set budgets (ABO).
- One ad set per creative batch, broad Advantage+ audience, optimised for the pixel **Lead** event on the client's funnel.
- 8 to 15 single-image ads per ad set, each with an original and a Reels-safe image.
- The full settings table is in `process/13-meta-campaign-build.md`. Treat it as the standard.

## What you must be expert in

### Structure
- Campaign, ad set, ad; what lives at each level; campaign budget versus ad-set budget.
- Objectives: Leads with website conversion location is the house choice. Know why Engagement and Traffic campaigns found in older client accounts are not used.
- Learning phase: what resets it (budget jumps, creative edits, audience edits, pausing for long periods) and why the first week is left alone.

### Ad set
- Performance goals and what "maximise number of conversions" optimises for.
- Attribution settings (7-day click, 1-day view) and how they change reported leads.
- Advantage+ audience versus original audience options; what age and location controls still bind.
- Location types and region exclusions.
- Manual placements: exactly which boxes correspond to Facebook Feed, Stories, Reels, Profile feed and Instagram Feed, Stories, Explore, Explore home, Reels, Profile feed.
- Budget scheduling, spend limits, daily budget overspend behaviour (a day can exceed the daily figure; the week averages out).

### Ad
- Single image, carousel, video formats.
- **Placement customisation**: assigning a different image per placement group. In the API this appears as labelled images (`orig916`, `reels916`) with rules: Reels placements first, then the rest, then a fallback.
- **Advantage+ creative enhancements**: where every toggle is, and that new ones appear without notice. All off.
- Multi-advertiser ads toggle: off.
- URL parameters field and dynamic macros `{{ad.name}}`, `{{adset.name}}`, `{{campaign.id}}`.
- Call-to-action options; Learn More is standard.
- Ad preview per placement.
- Ad review states: In review, Active, Rejected, With issues; how to read a rejection and request review.

### Reading results
- Column presets and custom columns: amount spent, impressions, CPM, link clicks, CTR (link click-through), landing page views, leads, cost per lead, frequency.
- Breakdowns by placement, age, region and day.
- Difference between "leads" Meta reports (pixel, attribution window) and leads in Baserow (actual, with tier). Baserow is the truth for quality; Meta is the truth for spend.
- Account time zone: Meta buckets days in the account's time zone.

### Account health
- Account status: Active, Unsettled, Disabled, In grace period; what each blocks.
- Billing, payment failures, spending limits.
- Account-level and page-level ad limits.

## Things that go wrong
- Wrong ad account selected in the dropdown.
- Enhancements silently enabled on a duplicated ad.
- Duplicating an ad carries its old name; rename before publishing or attribution collides.
- Editing a live ad's creative resets learning and loses social proof.
- URL parameters dropped when an ad is duplicated across accounts.
- A new ad set created with a campaign budget switched on.

## Not confirmed
- Use of rules (automated rules), bid caps, cost caps, lookalikes, retargeting, lead forms. None observed in current client builds.
