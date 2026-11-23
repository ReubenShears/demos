# 01 · Client intake and onboarding form

## Purpose
Turn a signed client into a complete Client Data record and a pair of Slack channels, so every later agent has one place to read the client's business facts.

## Trigger
A client has paid or signed. Reuben says so in Slack, or a new onboarding form arrives in `#7-reporting`.

## Inputs
- Client company name, main contact, contact email
- The onboarding form link: `https://app.optimally.ltd/onboarding` (fallback `https://app.getoptimally.com/onboarding?c=<code>`; the old domain is blocked on some US networks, same form and saved answers)

## Steps

1. **Create the Slack channels**
   1. Create `<client>-main-chat` and `<client>-funnel-notis`, both private. Use lower-case hyphenated client name (`thrivepop-main-chat`).
   2. Invite the client contact(s) to `-main-chat` only.
   3. Invite both Optimally OS bots to both channels.
   4. Add Ollie, Rey (Funnel Architect), Jed and JJ to `-main-chat`.
   5. One main chat per client. If a client already has one under another name (their agency name versus their own name), reuse it and only create the missing `-funnel-notis`.
2. **Send the onboarding form**
   1. Post the form link in `-main-chat` with a one-line welcome.
   2. If the client reports "error fetching" on submit, send the fallback domain link. Their answers are saved against the same code.
   3. If the client asks to add teammates, ask them to list the emails, then invite those people.
3. **Wait for the form notification**
   The bot posts `New onboarding form: <Company>` in `#7-reporting` with: industry, team size, B2B/B2C, current revenue, target revenue, bottleneck, CRM, calendar tool, whether they have an ad account, calls per month, who sells, onboarding call time, add-ons, referrals, second contact, uploads (logo, photos), and a link to the new Client Data row.
4. **Check the Client Data row** (table `1000911`)
   1. Confirm exactly one row exists for the client. The bot has been seen creating two rows seconds apart; if so, flag the duplicate to Reuben (deleting rows needs his confirmation).
   2. Set `Client ID` in upper snake case if blank.
   3. Confirm these are filled, and list any that are empty: Company, Contact Full Name, Contact Email, Industry, B2C/B2B, Offer, Best Product/Service, Pricing, ICP Examples, Consistent Client Persona, Pain Points, Frequent Objections, Case Studies, Extra Social Proof, Guarantee, Geographical Constraints, Website URL, Socials, CRM, Brand Uploads, Competitors.
   4. Write `Slack Channel ID` and `Funnel Notis Channel ID` to the row.
5. **Confirm the onboarding call is booked** and tick `Onboarding Call Booked`.

## Output and handoff
- Client Data row complete enough to brief creative, with a list of gaps
- Two Slack channels, client invited
- Post in `#delivery`: `<Client> onboarded. Call: <date>. Missing: <fields>`
- Next: step 02

## Rules
- Do not start creative from the form alone. The onboarding call (step 02) is where the offer is agreed.
- The `Logins` field on Client Data is off limits. Never read it into a prompt or output.

## Not confirmed
- Who creates the channels today (Reuben has done it by hand). The exact welcome message wording is not written down anywhere found.
