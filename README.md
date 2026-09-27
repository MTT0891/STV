# STV Election Simulator (self-hosted on Netlify)

A ranked-choice / single transferable vote classroom simulator. Teacher creates
a room, students join with a code and submit ranked ballots on their own
devices, and the teacher steps through the STV count round by round.

This version has no dependency on Claude at all — it's a static frontend
(`public/index.html`) plus two small serverless functions
(`netlify/functions/doc.js` and `collection.js`) that store election and
ballot data in **Netlify Blobs** (Netlify's built-in key-value store — no
external database or API keys needed). The frontend polls every 2 seconds,
so all connected devices stay in sync.

## Deploy it

**Option A — Netlify CLI (recommended, works from this folder as-is):**

```bash
npm install -g netlify-cli   # if you don't have it
cd stv-election-app
npm install
netlify deploy --prod
```

Follow the prompts to link/create a site. `npm install` matters here — it's
what makes `@netlify/blobs` available for the functions to bundle.

**Option B — Git + Netlify's dashboard:**

1. Push this folder to a new GitHub/GitLab repo.
2. In Netlify: "Add new site" → "Import an existing project" → pick the repo.
3. Build settings should auto-fill from `netlify.toml` (publish dir `public`,
   functions dir `netlify/functions`). Deploy.

Netlify Blobs works automatically once the site is actually deployed on
Netlify — no setup, no keys. (It won't work with `netlify dev` running purely
offline, but a real deploy handles it out of the box.)

**Option C — drag-and-drop in the Netlify dashboard:** only reliably deploys
the static files, not the functions/dependencies — use A or B instead.

## Using it

- Open your deployed site's URL as the teacher, click **Create a new
  election**, add candidates and set the number of winners, then **Start
  voting**.
- Share the same URL + the 5-character room code with students. They open
  the same site, enter the code and their name, and rank candidates.
- When you close voting, it computes the full STV count (Droop quota,
  fractional surplus transfer, elimination each round) and you can click
  through the rounds — synced live to every student's screen.

## Notes / limits

- Data lives in Netlify Blobs scoped to this site — it's not encrypted for
  privacy beyond normal HTTPS, so don't use it for anything sensitive.
- There's no auth: anyone with the room code can join, and anyone who guesses
  a teacher's room code could technically also open `/.netlify/functions/doc`
  directly. Fine for a classroom, not hardened for anything adversarial.
- Sync is 2-second polling, not push — fine for a class-sized room, not
  built for huge scale.
