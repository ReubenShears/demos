# 13 · Meta campaign build

## Purpose
Build the campaign, ad set and ads in the client's ad account exactly to house settings, from the ad sheet, left paused for QA.

## Trigger
Launch-ready confirmation (step 12).

## Inputs
- Ad sheet and creative folder (originals and Reels-safe copies)
- Client Data: Meta Account ID, funnel URL, offer name
- Pixel ID, page ID, Instagram account ID
- Daily budget, geography and exclusions, ICP label

## Settings (as running on live accounts)

### Campaign
| Setting | Value |
|---------|-------|
| Objective | Leads (`OUTCOME_LEADS`) |
| Buying type | Auction |
| Budget | **Ad set budget (ABO)**. No campaign budget |
| Special ad categories | None, unless the offer is credit, housing, employment or political |
| Name | `ABO | <Client> <Niche> <Offer> Static | D.C. DD/MM/YYYY` |

One campaign per client offer. New batches become **new ad sets inside it**.

### Ad set
| Setting | Value |
|---------|-------|
| Conversion location | Website |
| Pixel and event | Client pixel, **Lead** |
| Performance goal | Maximise conversions (`OFFSITE_CONVERSIONS`) |
| Bid strategy | Highest volume (lowest cost, no cap) |
| Attribution | 7-day click, 1-day view |
| Budget | Daily, the agreed figure |
| Audience | **Advantage+ audience on. Broad: no interests, no lookalikes** |
| Age | 25 to 65 |
| Locations | Target country or countries; exclude regions the client named |
| Placements | Manual. Facebook: Feed, Stories, Reels, Profile feed. Instagram: Feed, Stories, Explore, Explore home, Reels, Profile feed. Nothing else (no Audience Network, Messenger, Marketplace, right column, in-stream, Threads) |
| Dynamic creative | Off |
| Name | `Static Adset #<n> | ADV+ Broad | <Geo + ICP (exclusions)> | <Offer> | Lead Event` |

### Ad (one per ad sheet row)
| Setting | Value |
|---------|-------|
| Format | Single image |
| Identity | Client's Facebook Page and Instagram account |
| Media | Original 9:16 **and** Reels-safe 9:16, using placement customisation |
| Placement rules | Reels-safe image for Facebook Reels and Instagram Reels; original for every other placement; original as fallback |
| Primary text | From the sheet, one version |
| Headline | From the sheet (same on every ad) |
| Description | The shared description line |
| Call to action | Learn More |
| Website URL | Funnel root, e.g. `https://adgeniusinstalls.com/` |
| URL parameters | The standard string (`00-conventions.md`), with `utm_campaign` set to the offer |
| Advantage+ creative enhancements | **All off** (text overlays, image touch-ups, auto-crop, animation, music, text generation, site links, and the rest) |
| Multi-advertiser ads | Off |
| Ad name | `<Mon> <D>th <Client or Offer> Batch [n] | Ad S<n> | '<Angle>'` |
| Creative name | `<Client> S<n> | original + reels-safe` |

## Steps
1. Confirm you are in the right ad account (name and ID against Client Data).
2. Upload both images for every ad. Check each upload shows the right picture.
3. Create the campaign (paused), or open the existing one for a new ad set.
4. Create the ad set (paused) with the settings above. Number it one higher than the last.
5. Create each ad (paused). Copy primary text from the sheet without edits; preserve line breaks.
6. Set the placement customisation on every ad and preview Reels, Stories and Feed for each.
7. Set the URL parameters on every ad. Confirm the macros are intact.
8. Turn off every creative enhancement on every ad. Meta re-enables some by default on new ads; check each one.
9. Leave everything paused. Hand over to step 14.

## Replacing ads on a live client
- New batch for a new audience or offer wording: build a **new ad set**; pause the old one when the new one goes live, unless Ollie says to run both.
- Corrected creative: add the corrected ads as new ads, then pause the old. Do not edit a running ad's image.

## Output and handoff
- Paused campaign, ad set and ads; IDs noted in `#delivery`
- Next: step 14

## Rules
- Ad names must be unique in the account and must not be changed after launch.
- No interest targeting, no lookalikes, no retargeting ad sets in the launch build. The qualified-only Lead event does the targeting.
- EU delivery needs the DSA payor and beneficiary set on the account.

## Not confirmed
- How many ads from a batch go live at once when a batch is larger than 15.
- Whether retargeting or lookalike ad sets are ever added later.
