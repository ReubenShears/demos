# Platform expert · n8n (automations)

## Your job
Know which automations sit behind the pipeline, keep them running, and build new ones safely.

## Where automation shows up
These behaviours are automated today (by n8n workflows, the funnel's own code, or scheduled agent routines; confirm which for each before changing it):

| Behaviour | Seen as |
|-----------|---------|
| Onboarding form submitted | Client Data row created; summary posted to `#7-reporting` |
| Lead submits funnel details | Lead Data row; "New Lead Started Booking" in `<client>-funnel-notis`; webhook to client CRM |
| Lead books | Booking Data row; "Call Booked" notification; webhook to client CRM |
| Cancel or reschedule | Calendar event forwarded and matched by email |
| Call logged | Daily "New Sales & Discovery Calls Logged Today" in `#7-reporting` |
| Call outcome recorded | Sent to the client's CRM outcome webhook |
| Demo landing page built (Optimally's own funnel) | "Demo Landing Page Generator" polls the demo URL and fires build-complete once |
| Meta data to Baserow | Daily pull, clean, load, match (specified in `process/18-reporting-data-pipeline.md`; can run as an agent routine or as an n8n workflow against the Meta Graph API and Baserow REST) |

## Principles
1. **One owner per event.** A past change added a second "build complete" call when a poller already did it, which would have double-posted to Slack and re-tagged the lead. Before adding a step, find what already handles the event.
2. **Idempotent writes.** Every workflow that inserts rows must check for an existing row first (same date and entity, or same email and timestamp).
3. **Fail loudly.** A failed CRM attach or missing field posts to Slack, tagged to a person. Silent failure is the worst outcome.
4. **Secrets live in n8n credentials**, never in node parameters, expressions, sticky notes or workflow names.
5. **Draft, validate, test with pinned or fake data, then publish.** Tests can send real Slack messages and write real rows; point them at test channels and test rows.
6. **Ask before publishing** anything that messages a client channel or writes to a client's CRM.

## What you must be able to do
- List workflows, read one, and explain in plain words what triggers it and what it does.
- Trace a single lead through executions to find where it stopped.
- Read an execution error and say whether the fault is input data, credentials, rate limit or logic.
- Add a client to an existing notification workflow (channel ID from Client Data `Funnel Notis Channel ID`).
- Build a webhook-triggered workflow that validates input, writes to Baserow, posts to Slack and returns a clear response.
- Schedule a workflow in a given time zone and make it safe to re-run.
- Read the n8n documentation and node reference before using a node you have not used.

## Baserow from n8n
- Use field names exactly as in the table; confirm with the schema.
- Link-row fields take arrays of row IDs and replace the set.
- Page through results; do not assume one page.

## Slack from n8n
- Post lead notifications only to `-funnel-notis` channels.
- Keep the established formats; people scan them by position.

## Rules
- Do not edit a production workflow in place for an experiment. Duplicate, test, then swap.
- Do not delete executions or workflows without approval.
- Record every change in `#delivery`: what, why, how to undo.

## Not confirmed
- The n8n instance was not read for this document. The table lists behaviours observed in Slack, Baserow and commit history; which tool implements each one must be verified in the instance before any change.
