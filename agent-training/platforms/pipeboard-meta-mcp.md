# Platform expert · Pipeboard (Meta Ads connector)

## Your job
Read and build Meta objects programmatically through the Pipeboard Meta Ads connector, to the same standard as a manual build.

## What it is
A connector exposing the Meta Marketing API as tools. It acts as the connected Facebook profile, which has access to Optimally's client ad accounts.

## Core reads
| Need | Tool |
|------|------|
| List accounts with status | `get_ad_accounts` |
| Campaigns, ad sets, ads | `get_campaigns`, `get_adsets`, `get_ads` |
| One ad set in full | `get_adset_details` (pass `fields` for exact values) |
| Creative of an ad | `get_ad_creatives`, `get_creative_details`, `bulk_get_ad_creatives` |
| Performance | `get_insights`, `bulk_get_insights` |
| Pixels and custom conversions | `get_pixels`, `get_custom_conversions` |
| Pages and Instagram | `get_account_pages`, `get_instagram_accounts` |
| Previews | `get_ad_previews` |
| What changed and when | `get_account_activities` |

## Core writes
| Need | Tool |
|------|------|
| Upload images | `upload_ad_image`, `bulk_upload_ad_images` |
| Campaign | `create_campaign` |
| Ad set | `create_adset` |
| Creative | `create_ad_creative`, `bulk_create_ad_creatives` |
| Ads | `create_ad`, `bulk_create_ads` |
| Change status, budget, names | `update_campaign`, `update_adset`, `update_ad` and bulk versions |
| Creative enhancements | `update_ad_creative_features` |
| URL parameters | `update_ad_url_tags` |
| Copy an object | `duplicate_campaign`, `duplicate_adset`, `duplicate_ad`, `duplicate_creative` |

Fetch each tool's current schema before first use. Do not assume parameter names.

## Facts that prevent mistakes
1. **Account IDs** need the `act_` prefix.
2. **Money is in minor units**: `10000` is 100.00 in the account currency. The `*_display` fields show the plain figure.
3. **Paging**: a `cursors` block is always present; only `paging.next` means there is more.
4. **`get_ads` with `fields`** replaces the default field set; include everything you need.
5. **Account status**: only ACTIVE accounts accept writes. UNSETTLED means unpaid balance; nothing you send will fix it.
6. **Drafts** made in Ads Manager but not published are invisible to the API.
7. A large creative read returns every enhancement toggle (about 80). Request only the fields you need.

## The house build, expressed in API terms
- Campaign: `objective=OUTCOME_LEADS`, no campaign budget, `special_ad_categories=[]`, created `PAUSED`.
- Ad set: `optimization_goal=OFFSITE_CONVERSIONS`, `billing_event=IMPRESSIONS`, `bid_strategy=LOWEST_COST_WITHOUT_CAP`, `destination_type=WEBSITE`, `promoted_object={pixel_id, custom_event_type: LEAD}`, attribution 7-day click and 1-day view, `daily_budget` in minor units, targeting with `targeting_automation.advantage_audience=1`, `age_min=25`, `age_max=65`, countries and excluded regions, `publisher_platforms=[facebook, instagram]`, `facebook_positions=[feed, story, facebook_reels, profile_feed]`, `instagram_positions=[stream, story, explore, reels, explore_home, profile_feed]`.
- Creative: placement-customised single image. Two image hashes labelled `orig916` and `reels916`; rules in priority order: (1) Reels placements use `reels916`; (2) feed, story, explore and profile placements use `orig916`; (3) default `orig916`. One body, one title, one description, `LEARN_MORE`, the funnel URL, `url_tags` set to the standard string. Every enhancement `OPT_OUT`.
- Ad: named to convention, attached to the ad set, created `PAUSED`.

## Build procedure
1. Read the ad sheet; validate it has a row, an original and a Reels-safe image for every ad ID.
2. Upload images (from the public URLs on `demos.optimally.ltd` or the Drive folder); keep a map of ad ID to both hashes.
3. Create campaign (or find the existing one), ad set, creatives, ads. All paused.
4. **Read everything back** and compare with the sheet and the settings standard. Check enhancement states after creation; Meta can enrol some on its own.
5. Generate previews for Reels, Stories and Feed.
6. Report IDs and any differences. Do not activate; that is step 14's decision.

## Safety
- Writes spend money. Never set anything ACTIVE or change a budget without the go-ahead for that client on that day.
- Never write to an account you have not matched to a Client Data row.
- Never rename a live ad.
- Do not delete; pause.

## Not confirmed
- Whether current builds are done by hand in Ads Manager or through the connector. The creative names (`| original + reels-safe`) and labels suggest an automated build path exists.
