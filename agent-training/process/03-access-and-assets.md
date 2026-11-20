# 03 · Access and asset collection

## Purpose
Get every permission, key and file needed to build the funnel and launch ads, in as few client messages as possible. Back-and-forth over calendar keys, CRM keys and ad spend is the most common source of delay and client frustration.

## Trigger
Offer lock posted (step 02).

## The checklist

Ask for everything in **one** message in `-main-chat`, then track each item.

### Meta
1. **Ad account**: partner access with permission to create and manage campaigns. Confirm which account. Clients often have more than one; an invite can land on the wrong one or arrive read-only. Reply with the account name and ask "is this the one you want to use?".
2. **Facebook Page**: access to create ads as the page.
3. **Instagram account**: connected to the page or shared separately.
4. **Pixel (dataset)**: access to manage it, or permission to create one in their business.
5. Verify all four before building. Failure seen: "we're making the adsets and it just won't let us manage pixel or the pages on facebook or instagram at all".
6. Record the numeric ad account ID in Client Data `Meta Account ID`, and the account time zone offset in `Meta TZ Calibration`.
7. Check the account is ACTIVE with a working payment method. An UNSETTLED account cannot launch.

### Funnel domain
8. The domain or subdomain the funnel will live on (e.g. `getthrivepop.com`, `adgeniusinstalls.com`).
9. DNS records for the client to add. Proxy/DNS changes on the client side are a frequent blocker; send exact records and offer a call.

### Calendar
10. **Calendly**: a personal access token including the `users:read` scope, and the event to book. Tokens without that scope have had to be re-requested.
11. **HubSpot meetings**: the meeting link to use, plus a private app (service) key, not a personal key, with scopes: `scheduler.meetings.meeting-link.read`, `crm.objects.contacts.read`, `crm.objects.contacts.write`, `crm.objects.owners.read`, `crm.objects.appointments.read`, `crm.objects.appointments.write`.
12. **GoHighLevel**: the Location ID and an API key or webhook.

### CRM
13. Where leads should go: CRM name, and either a webhook URL or API access. Offer the sample lead payload (see `platforms/optimally-funnel-and-dash.md`) and ask whether they want a secret header on each request.

### Brand and proof
14. Logo files, brand colours and fonts, headshots, photos of the team or work.
15. Case studies, review screenshots, results dashboards.
16. Existing ads and anything that has worked before.

### Commercial
17. **Daily ad budget** and who pays Meta (the client's card on their account).

## Handling keys
- Ask clients to send keys through a one-time secret link, not pasted in Slack. If a key is pasted in the channel, store it where the funnel build needs it and ask the client to delete the message. Never repeat it.

## Tracking
Keep one status line per client in the fulfilment update format (step 19): `<Contact> (<Client>) - <blocker>`. Chase open items daily. If a client is blocked for more than two working days, tag Reuben, who will "jump on a call to get it running".

## Output and handoff
- All items received and verified, or a named blocker list
- Client Data updated: Meta Account ID, Meta TZ Calibration, Base Funnel Domain, calendar URLs, CRM, CRM Webhook
- Next: step 04

## Not confirmed
- The exact partner-access instructions sent to clients (which Optimally business ID they share to) were not found in writing.
- Whether a standard "access request" message template exists.
