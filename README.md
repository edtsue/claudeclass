# ClaudeClass Hub

A hands-on, beginner-friendly hub for a 3-part course on learning Claude Code.
Vanilla HTML/CSS/JS (no build step) + a couple of Vercel serverless functions +
optional Supabase. Premium "glass" design with a pixel-Claude AI helper.

Design spec: [`docs/superpowers/specs/2026-06-08-claudeclass-hub-design.md`](docs/superpowers/specs/2026-06-08-claudeclass-hub-design.md)

## What works right now (no setup)
Open the site and everything visible works on seeded content: all pages, search,
copy buttons, checklists, sticky notes, settings (theme / text size / motion),
and the entry gate **opens automatically** until you set a password.

## Go live (you do this once)
1. In the **Vercel dashboard**, "Add New… → Project" and import `edtsue/claudeclass`.
2. Deploy. You'll get a preview URL immediately.
3. Add the environment variables below (Project → Settings → Environment Variables),
   then redeploy.

## Environment variables (set in Vercel, never in the repo)
| Variable | What it does | Needed for |
|---|---|---|
| `HUB_PASSWORD` | The shared access code students type to enter | The entry gate |
| `EDIT_PASSWORD` | Password to unlock instructor edit mode (✏️) | Edit mode |
| `SESSION_SECRET` | Any long random string; signs the login cookies | Gate + edit mode |
| `GEMINI_KEY` | Your Google Gemini API key | The Claude helper chat |
| `GEMINI_MODEL` | *(optional)* defaults to `gemini-2.5-flash` | The Claude helper chat |
| `SUPABASE_SECRET_KEY` | Supabase **secret** key (`sb_secret_…`) — server-only | Saving edits to the cloud |

Until `HUB_PASSWORD` is set the gate stays open; until `GEMINI_KEY` is set the
helper shows a friendly "not connected yet" message. Nothing breaks.

## Editing content
Click the ✏️ button in the top bar, enter `EDIT_PASSWORD`, click any text, and type.
- **Cloud (Supabase):** `assets/config.mjs` holds the project URL + publishable key
  (reads), the `hub_content` table exists with public-read RLS, and saves go through
  `/api/save` using `SUPABASE_SECRET_KEY` (server-only, bypasses RLS). Set that env
  var in Vercel to turn on shared saving.
- **Fallback:** if the secret key isn't set, edits save in your browser only and the
  hub shows a "saved on this device" notice — nothing is lost.

## Custom domain
Recommended: a subdomain like **`class.edtsue.com`**. In Vercel → Project → Domains,
add the subdomain; Vercel gives you a DNS record (a CNAME) to add wherever
`edtsue.com` is managed. (Subdomain is simpler than a path — see the design notes.)

## Run locally (a class exercise)
This site uses JS modules, so open it through a tiny local server, not by
double-clicking the file:
```
npx serve .
```
Then visit the printed `localhost` URL. (The gate auto-opens and the AI helper is
offline locally — both by design.)
