# 12 · Budget and launch readiness

## Purpose
Confirm that every gate is closed before anything is built or switched on. A client is "ready to go live" only when all gates below are green.

## Trigger
Ads approved (step 10) or funnel approved (step 04), whichever is second.

## The gates

| Gate | Evidence required |
|------|-------------------|
| 1. Ads approved | Written yes in `-main-chat` |
| 2. Funnel approved | Client reviewed the `/test` link and said yes |
| 3. Daily budget confirmed | A number, in the account currency, in writing |
| 4. Meta access complete | Ad account, page, Instagram, pixel all manageable; account ACTIVE; payment method valid |
| 5. Domain live | DNS resolved, funnel loads on the client's domain |
| 6. Calendar connected | Test booking lands on the client's calendar with the right title |
| 7. CRM connected | Test lead and booking received (or agreed to launch without) |
| 8. Tracking verified | Test lead shows ad, ad set, campaign and tier in `-funnel-notis` |
| 9. Ad sheet handed over | Sheet and creative folder links in `#delivery` |
| 10. Reels-safe variants exist | Two files per ad |

## Steps

1. **Ask for the budget early**, in the same message as the funnel test link: "Could you also confirm what the daily ad budget will be before we go live?"
2. **Budget guidance**
   - Daily budgets seen at launch: 50, 100 and 150 per day in the account currency, set on the ad set.
   - The budget must be enough for the ad set to produce conversions in the first week. If a client proposes a figure too low to learn anything, say so and give the reason.
   - Record the agreed figure in `#delivery` (e.g. "150 for Brent").
3. **Check each gate** and write the status line for the client in the fulfilment update (step 19). Use the standard blocker phrases: "waiting for funnel approval", "ads approval + budget", "waiting for DNS set up", "new Calendly token", "GHL location ID".
4. **Decide what may launch without**
   - CRM not yet connected: may launch if leads reach `-funnel-notis` and Baserow ("ready to go live, no GHL yet, but can launch without it").
   - New calendar token pending: may launch if the current booking path works.
   - Never launch without gates 1, 2, 3, 4, 5, 8.
5. **When all required gates are green**, post in `#delivery`: "`<Client>` ready to launch: budget `<n>`/day, ad sheet `<link>`", tagged to Rey.
6. **If the client is eager and waiting on us**, say so in `#delivery`. Clients asking "can we go live?" get a same-day answer.

## Output and handoff
- Launch-ready confirmation with budget
- Next: step 13

## Rules
- Bump blocked clients daily; a client should never be the one to discover they are the blocker.
- A backlog of approved-but-not-live clients is the top delivery priority.

## Not confirmed
- A minimum daily budget policy and how budget is chosen per niche. Only observed figures are listed.
- Whether clients ever pay ad spend through Optimally. Evidence points to clients funding their own ad accounts.
