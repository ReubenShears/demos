# Platform expert · CRM and calendar integrations

## Your job
Get leads and bookings from the funnel into whatever CRM and calendar the client uses, with the fewest requests to the client.

## Systems in use
Client Data records the client's CRM as one of: GoHighLevel, HubSpot, Salesforce, Notion, Close, Other, No CRM. Calendars seen: Calendly, HubSpot meetings, GoHighLevel calendars, Google Calendar.

## GoHighLevel (most common)
What to ask for, once:
1. **Location ID** (sub-account ID).
2. An API key or private integration token for that location, or an inbound webhook URL.
3. The pipeline and stage new leads should enter.
4. The calendar to book into, if GHL handles booking.
5. The account time zone (stored as `GHL Timezone` on Client Data).

What you set up: contact create or update on lead, tags from the funnel's tag list, opportunity in the right stage, appointment on booking, and the outcome webhook for call results.

The missing Location ID is a recurring blocker. Ask for it in the first access message.

## HubSpot
Ask for a **private app access token** (a service key, not a personal key) with scopes:
- `scheduler.meetings.meeting-link.read`
- `crm.objects.contacts.read`
- `crm.objects.contacts.write`
- `crm.objects.owners.read`
- `crm.objects.appointments.read`
- `crm.objects.appointments.write`

Plus the **meeting link** to use for the funnel's call. Check the meeting title template renders fully in a test booking (seen: a title ending in a bare `|` because a company-name token was empty). Ask the client to use the dedicated meeting link so bookings can be tracked.

## Calendly
Ask for a **personal access token including the `users:read` scope**, and the event type to book. A token without that scope has to be re-issued. Record expected event names in Client Data `Expected Calendly Event Names`. Calendly sends cancellations and reschedules; these are matched to leads by email.

## Other CRMs
Offer the funnel's webhook: send the client a sample lead payload and a sample booked payload with fake details, ask for the URL to POST to and whether they want a secret header. Clients with developers usually prefer this.

## Handling credentials
- Request keys through a one-time secret link.
- If a client pastes a key in Slack, use it, store it only where the integration needs it, and ask them to delete the message.
- Never write a key into Baserow notes, a sheet, a doc, a commit or a log.
- Ask for the narrowest scopes that work, and say what each is for.

## Tests before launch
1. Qualified test lead appears in the CRM with the right tags and source fields.
2. Test booking appears on the right person's calendar with a correct title and join link.
3. Cancel the test booking; confirm the cancellation is received.
4. Remove test records or mark them clearly.

## What may launch without
A client can go live with CRM sync pending if leads still reach Slack and Baserow. Calendar booking must work.

## What you must be able to do
- Read each platform's current API documentation before building; scopes and endpoints change.
- Map the funnel's fields to the CRM's fields and list anything that has no home.
- Tell a client exactly where in their tool to create the key, in three steps or fewer.
- Diagnose a failed sync from the response code.

## Not confirmed
- The exact GoHighLevel scopes requested, and whether integrations are built in n8n or in the funnel's own code.
- Salesforce, Close and Notion integrations: listed as options, no working example found.
