# 14 · Launch QA and go-live

## Purpose
Verify the build against the ad sheet and the funnel, switch it on, and tell everyone.

## Trigger
Paused build complete (step 13).

## Pre-launch checks

### Against the ad sheet
1. Number of ads equals number of rows.
2. Each ad: image matches its `S<n>`; primary text matches the row character for character; headline matches.
3. Ad names follow the convention and are unique.

### Settings
4. Campaign: Leads objective, no campaign budget, no special category unless required.
5. Ad set: website, correct pixel, Lead event, 7-day click and 1-day view, daily budget equals the agreed figure, Advantage+ audience on, ages 25 to 65, correct countries and exclusions, the ten placements only.
6. Each ad: Learn More, correct URL, URL parameters present with macros, both images attached with Reels rule, all enhancements off.

### Placements
7. Preview every ad in Facebook Feed, Instagram Feed, Instagram Stories, Instagram Reels, Facebook Reels. Nothing cut off or covered. "Make sure all the formatting looks good before going live."

### Funnel
8. Click through from an ad preview. The funnel loads on the client's domain over HTTPS, on mobile.
9. The landing URL carries the parameters.
10. Run one qualified test lead through the funnel with the real parameters: it posts to `-funnel-notis` with Ad and Adset names, the pixel Lead event registers, the booking lands on the calendar.
11. Remove or mark the test lead so it is not counted.

### Account
12. Account ACTIVE, payment method valid, no spending limit that will stop delivery.

## Go-live steps
1. Final check in the client channel if anything is still unconfirmed: "just checking you're all good with the funnel and ads. If everything looks good on your end, we can get them live!"
2. Switch on campaign, ad set and ads.
3. Confirm ads move to In review, then Active. If any ad is rejected, see below.
4. **Announce in `<client>-main-chat`**: "Hello @channel, we're live! The ads are on at `<budget>`/day. 🚀"
5. **Announce in `#delivery`**: add the client to "Went live today" in the day's status update.
6. Record the launch date. Day 1 is the first full day of delivery; the 7-day learning window (step 15) counts from it.

## If an ad is rejected
1. Read the stated policy reason.
2. Common causes: third-party logo in the image, a claim about results or income, wording about personal attributes, a restricted category that needs a special ad category.
3. Fix the creative or copy (steps 06 and 09), re-upload as a new ad. Request review only if the rejection is clearly wrong.
4. Tell Ollie which ad and why, so the next batch avoids it.

## After launch (same day)
- Send the client the dashboard link if they ask ("Can you provide me a link to the dashboard?").
- Answer "will you be creating video ads as well?" with the standard plan: statics for the first 7 days, video once Meta shows which angles win.

## Output and handoff
- Live ads, launch announced, launch date recorded
- Next: step 15

## Not confirmed
- A written pre-launch checklist does not exist; this one is derived from the live builds and from launch-day messages.
- Whether launches are timed (start at midnight account time) or switched on immediately. Observed ad sets started at the moment of creation.
