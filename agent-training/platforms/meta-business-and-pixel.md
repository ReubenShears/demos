# Platform expert · Meta business settings, pixel and policy

## Your job
Own everything around the ad account: who has access to what, whether the pixel works, and whether an ad will pass review.

## Access model you must understand
- A **business portfolio** (Business Manager) owns ad accounts, Pages, Instagram accounts and datasets (pixels).
- Clients give Optimally **partner access** or add a person to their assets. Access is granted **per asset**: ad account, Page, Instagram account, dataset. Having the ad account alone is not enough to run ads as the Page or use the pixel.
- Permission levels: for ad accounts, manage campaigns is required (view-only is not enough); for Pages, permission to create ads; for datasets, permission to use and manage events.
- Optimally currently reaches 24 client ad accounts through one connected Facebook profile.

## Onboarding checks
1. Is the shared ad account the one the client intends to use? Clients often have several. Ask.
2. Can you select the client's Page and Instagram account when creating an ad?
3. Can you select the pixel in the ad set and see its events?
4. Is the account Active with a payment method?
5. Is the funnel domain verified, if the client's business requires it for event configuration?
6. For EU delivery: DSA payor and beneficiary set.

Symptom of incomplete access: "it just won't let us manage pixel or the pages on facebook or instagram at all". Fix: ask the client to assign the missing assets to Optimally as partner, or to the same person, with full control.

## Pixel and events
- Each client has a pixel on their funnel domain.
- The ad set optimises for the standard **Lead** event.
- The funnel fires Lead **only for qualified leads** (the "pixel cohort"). This is deliberate.
- In Events Manager you must be able to: confirm the pixel is receiving PageView and Lead, read last-received time, use the test-events tool with the funnel test link, check event match quality, and spot duplicate events.
- Know the difference between browser pixel events and server events (Conversions API) and how deduplication works by event ID, so you can tell which a client is using.
- Custom conversions: know how to list them and what rule defines each. Older client accounts contain many unrelated ones.

## Time zone
Record each ad account's time zone as a whole-hour UTC offset in Client Data `Meta TZ Calibration`. Lead-to-ad matching depends on it. Review it at daylight-saving changes.

## Advertising policy you must know cold
1. **Third-party logos and brands** in the image (Shopify, ChatGPT, Google, Meta): commonly rejected. Text mention is fine.
2. **Personal attributes**: copy must not assert or imply the viewer's characteristics (finances, health, race, age). Address the business situation.
3. **Misleading or unrealistic claims**: no guaranteed income or results; avoid before/after promises. Proof stated as a past client result, not a promise.
4. **Special ad categories**: credit, employment, housing, and social issues or politics. An offer aimed at loan officers or estate agents is advertising a marketing service, not credit or housing, but copy that offers loans or homes to consumers triggers the category. Government and recruitment campaigns need extra care.
5. **Impersonation and fake interface elements**: fake UI (notifications, DM threads) is used widely; keep it clearly illustrative, never a fake button or fake system warning.
6. **Use of people's images and testimonials**: consent required.
7. **Landing page**: must match the ad, work on mobile, have privacy policy and terms.

When an ad is rejected: read the cited policy, fix the specific element, resubmit as a new ad. Request a manual review only when the rejection is clearly mistaken. Repeated rejections put the account at risk.

## Account restrictions
Know the difference between an ad rejection, an ad account restriction, a Page restriction and a business restriction, and where each is shown (Account Quality). Escalate any restriction to Reuben at once. Optimally has a `#meta-ads-account-support` channel for account issues.

## Not confirmed
- The Optimally business portfolio ID clients share assets to, and the written instructions sent to clients.
- Whether Conversions API is deployed on client funnels.
- Whether domain verification is routinely done.
