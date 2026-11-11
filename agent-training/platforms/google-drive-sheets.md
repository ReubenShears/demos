# Platform expert · Google Drive and Sheets

## Your job
Keep creative folders and ad sheets in an order anyone can launch from, and be able to find the right version of anything in seconds.

## What lives in Drive
- **Creative batch folders**: one per batch per client. These are the links posted to clients for review and to Rey for launch.
- **Ad sheets**: one Google Sheet per ad set.
- **Client-supplied files**: logos, headshots, case studies, footage, b-roll.
- **Reference packs**: e.g. Optimally's top statics ranked by lifetime impressions, shared with clients to pick styles from.
- **Docs**: offers, scripts, proposals.

## Folder standard
```
<Client>/
  Brand/                     logo, colours, fonts, photos
  Batch 001 - <Offer>/
    S1.png ... S12.png       originals, the files the client reviews
    Reels-safe/              S1_reels.png ...
    Not selected/            drafts that were cut
    v1/ v2/                  superseded versions
  Batch 002 - <Offer>/
  Video/
    Raw/  Edits/
```
The review link sent to a client should open on the originals only.

## Ad sheet standard
- Title: `Adset <n> Ad Sheet - <count> Statics`
- Tab: `Static ads`
- Columns, in order: `Ad #`, `Angle / Desire`, `Graphic`, `Headline`, `Primary text`, `Creative notes`
- One row per ad; `Ad #` equals the image file name without extension
- `Graphic` holds `In google drive`; the folder link travels with the sheet in Slack
- Primary text keeps its line breaks inside the cell
- Headline identical on every row

Add a `Video ads` tab in the same shape when video is added.

## Sharing
- Review folders and ad sheets: "anyone with the link" as viewer. Clients comment in Drive as well as Slack; read comments on the folder and on each file before a revision.
- Client-supplied material stays restricted to the team.
- Never put keys, logins or lead data in a sheet or doc.

## What you must be able to do
1. Create a batch folder and ad sheet to the standard.
2. Check a batch for launch: every sheet row has an original and a Reels-safe file; no extra files in the review folder; file names match.
3. Read all Drive comments on a batch and turn them into a change list.
4. Find the newest ad sheet for a client and say which ad set it belongs to.
5. Export a sheet's rows as structured data for the build agent.
6. Know Sheets behaviour that bites: smart quotes and apostrophes carried into Meta, leading `=` or `+` treated as a formula, trailing spaces in `Ad #`, merged cells, hidden rows.

## Rules
- Do not rename or move a folder whose link is already in a client channel.
- When a batch is revised, keep the same folder link if you can and move old files into a version subfolder, so the client's link still shows the current set.
- One ad sheet per ad set. Do not append a new batch to an old sheet.

## Not confirmed
- The real top-level folder structure in the Optimally Drive was not read; the standard above is a proposal consistent with the file names seen. Align it with the existing structure before enforcing it.
