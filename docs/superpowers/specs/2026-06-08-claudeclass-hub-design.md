# ClaudeClass Hub — Design Spec

**Date:** 2026-06-08
**Repo:** edtsue/claudeclass
**Status:** Approved design (evolving) → ready for implementation plan

## 1. Purpose

A central hub for a 3-part course teaching complete beginners how to use Claude Code.
Each class is 90 minutes. The hub holds course agendas, plain-English concept
explanations, copy-paste command cheat-sheets, homework, a glossary, and a pre-class
setup guide. The instructor edits all content **directly on the website** and saves —
no Claude Code or terminal needed. A friendly, Gemini-powered Claude mascot answers
student questions about the class. Students also get private notes, checklists, and
settings. The whole hub sits behind a shared access gate.

## 2. Audience & constraints

- **Students:** complete beginners — never used a terminal, git, or written code.
  Plain English, generous copy-paste, "how to check it worked" steps.
- **Instructor (single author):** the user. Edits content live on the site.
- **Access model:** *always-live* — content lives in the cloud (Supabase) so the
  instructor's edits appear for everyone instantly. The site is also runnable locally
  by students (a class exercise), reading the same cloud content; a local cache
  softens the "needs internet" tradeoff (§9).

## 3. Stack

- **Frontend:** vanilla HTML/CSS/JS, Tailwind via CDN. No bundler / build step.
- **Backend:** a few **Vercel serverless functions** (Node) under `/api` — only for
  things that must hide a secret (Gemini calls, the entry-gate check). Mirrors the
  DEsolo26 pattern (vanilla + Vercel functions + Supabase).
- **Data + instructor auth:** Supabase (`@supabase/supabase-js` via CDN). Browser
  reads content directly; instructor writes directly (RLS-protected).
- **AI assistant:** Google Gemini via a serverless proxy (key stays server-side).
- **Hosting:** GitHub + Vercel; push to `main` auto-deploys prod. Canonical address
  is the Vercel `.vercel.app` URL (no custom domain).

### Environment variables (set in Vercel dashboard — never in repo)
| Var | Used by | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | `/api/ask` | Calls Gemini (user provides) |
| `HUB_PASSWORD` | `/api/gate` | Shared access code to enter the hub (user provides) |
| `SESSION_SECRET` | `/api/gate` | Signs the entry session cookie |

(Supabase URL + **anon** key are safe to ship in client JS — they're protected by RLS.)

## 4. Access & auth — two independent layers

1. **Hub entry gate (everyone).** First visit shows a glass "Enter the class" screen
   asking for a shared access code. Submit → `POST /api/gate` checks it against
   `HUB_PASSWORD` → on success sets a signed, httpOnly session cookie and reveals the
   hub. Keeps casual passers-by out. A **"Remember me for 5 days"** checkbox sets the
   cookie's lifetime to 5 days (persists across browser restarts); unchecked = a
   session cookie that expires when the browser closes.
   - *Security note (default = soft gate):* because content is read with the Supabase
     anon key, a determined person who finds the API could read content directly even
     without the code. For a class hub this is acceptable. If stronger privacy is
     wanted later, we harden by serving content only through an authenticated function
     and locking RLS behind the session (flagged as an option, not built by default).
2. **Instructor edit auth (instructor only).** Separate from the gate: the instructor
   logs in by email (Supabase **magic link**). Only the instructor identity can write
   content; RLS rejects all other writes server-side, independent of the UI.

## 5. Pages & structure

Shared header/nav + shared CSS/JS across a small set of pages:

| Page | Path | Contents |
|---|---|---|
| Setup (Office Hours) | `/setup` | Mac + PC tabs: prerequisites, step-by-step Claude Code install, "check it worked", common errors/fixes |
| Overview | `/` | Course intro, "what you'll learn", three class cards |
| Class 1 / 2 / 3 | `/class1…3` | Timed agenda, plain-English concepts, command cheat-sheet (copy buttons), homework, links |
| Glossary | `/glossary` | Plain-English terms with live search |

Consistent nav everywhere; mobile-friendly.

## 6. Content & editing model (Supabase)

- Each page is a static HTML shell with named **editable regions** (e.g.
  `class1.agenda`, `setup.mac`, `glossary.terms`). Each region's HTML is stored in
  Supabase and injected on load.
- **Table `hub_content`:** `key` (text PK), `html` (text), `updated_at` (timestamptz).
- **Read:** fetch all rows → inject by key → cache to `localStorage`. Missing rows
  fall back to seeded starting content shipped in the HTML.
- **Edit (instructor):** toggle Edit → regions become `contenteditable` with a
  floating rich-text toolbar (bold, italic, underline, colour, font size, clear — the
  Bento editor set) → Save upserts changed regions. Anonymous users never see edit UI.

## 7. Claude assistant — Gemini-powered, pixel mascot ("Clippy"-style)

- **Persona/UI:** the Claude Code pixel mascot (orange critter) sits in a corner. Tap
  it to open a glass chat panel. Friendly, encouraging, beginner-appropriate tone.
- **Backend:** `POST /api/ask` proxies to Gemini using `GEMINI_API_KEY`. The function
  assembles the assistant's knowledge **server-side from the current Supabase
  content** (agendas, concepts, cheat-sheets, homework, glossary, setup) plus a fixed
  system prompt, so the assistant always knows the latest class material. Returns the
  answer (streamed if feasible).
- **Model:** a current Gemini Flash model (e.g. `gemini-2.5-flash` /
  `gemini-flash-latest`) — exact id confirmed at build time.
- **Scope guardrails:** answers class/Claude-Code questions; gently redirects
  off-topic asks. No persistence of chats server-side (privacy); recent chat kept in
  the student's browser only.
- Respects the "reduce motion" setting (no bouncing/idle animation when set).

## 8. Student-local features (browser-only)

Private to each student, stored in `localStorage`. No accounts, no DB, never seen by
the instructor or other students. Work offline.

- **8a. Progress checklists** — per-class "things to do / learned"; checked state persists.
- **8b. Sticky notes (premium glass)** — a floating button opens a slide-out panel
  (one shared collection, available on every page). Create / edit / delete note cards;
  auto-save as you type; plain text; optional minimal glass colour tints. No
  drag-and-drop, no rich formatting — clean and reliable.
- **8c. Settings** — gear button opens a glass settings panel:
  - **Theme:** Light / Dark / System (glass adapts; default System).
  - **Text size:** Small / Medium / Large.
  - **Reduce motion:** disables blur/animation flourishes.
  - **Reset my data:** clears this student's notes, progress, settings (with confirm).

## 9. Visual design & branding

- **Aesthetic:** simple + premium "Apple glass" (glassmorphism) — frosted translucent
  panels, backdrop blur, thin light borders, soft shadows, rounded corners, system
  font, generous whitespace, calm palette. Works in light and dark.
- **Claude Code branding:** calm glass palette accented with Claude Code brand
  orange/terracotta (~`#D97757`); small Claude Code wordmark in the header.
- **Mascot:** the pixel Claude critter is the signature motif and the face of the §7
  assistant — the one deliberate, playful departure from the minimal glass, used
  sparingly so it delights without clutter.

## 10. Resilience & offline

- Content cached to `localStorage` on every successful load; if the Supabase fetch
  fails (offline / local copy), show a friendly banner and render cached → seeded
  content. Save failures keep edits in the editor and show a retry toast.
- If `/api/ask` fails (no key / network), the assistant shows a friendly fallback
  ("I'm offline right now — try the cheat-sheet or ask your instructor").

## 11. Security & secrets

- Secrets (`GEMINI_API_KEY`, `HUB_PASSWORD`, `SESSION_SECRET`) live only in Vercel
  env vars and are read only inside `/api` functions — never shipped to the client,
  never committed.
- Only the Supabase **anon** key ships in client JS (safe under RLS).
- **RLS on `hub_content`:** SELECT for all; INSERT/UPDATE only for the instructor
  identity.
- Single trusted author → innerHTML rich text is fine; no heavy sanitization needed.

## 12. Non-goals (YAGNI)

- No student accounts, submissions, or grading.
- No instructor analytics/dashboard.
- No multi-author editing or conflict resolution.
- No content versioning/undo beyond the browser session.
- No media uploads (images via URL if needed).
- No server-side chat history.
- Hard content-privacy gate not built by default (see §4 note).

## 13. Testing & verification

- **RLS check:** anon can read but not write `hub_content`; instructor can write.
- **Gate check:** wrong code rejected; correct code sets session and reveals hub;
  `/api/ask` and content load behave with/without a valid session as designed.
- **Assistant check:** `/api/ask` returns class-grounded answers; off-topic redirect;
  graceful failure with no key.
- **Manual plan:** load each page; instructor magic-link login; edit a region + save +
  reload persists and shows logged-out; copy buttons; glossary search; checklists +
  notes persist per browser; settings (theme/text size/motion/reset) apply; offline
  fallback banner; assistant answers a sample question.
- Pure helpers (region render/merge, cache read/write) unit-tested where it adds value.

## 14. Starting content (instructor refines live in the edit UI — dogfoods editing)

### Setup — Office Hours (Mac & PC)
Prerequisites (terminal, Node.js) in plain English; separate Mac and Windows install
steps for Claude Code; a verification step; common PATH/permission errors + fixes.
*Exact install commands confirmed against current Claude Code docs at build time.*

### Class 1 — Concepts & Your First App (90 min)
- 0:00 Welcome: what Claude Code is (you talk, it builds)
- 0:10 Concepts in plain English: terminal, files/folders, HTML, what an "app" is, API, MCP, git push/pull
- 0:30 Setup: open Claude Code, open a project folder
- 0:40 Build a to-do app live (add / check off / delete)
- 1:15 See it in the browser; change a colour to feel the loop
- 1:25 Recap + homework

### Class 2 — The Tech Stack: Claude Code + GitHub + Vercel (90 min)
- 0:00 Recap; today = getting your app online
- 0:10 GitHub: repos, commits, push/pull (save history + backup)
- 0:30 Connect your project to GitHub, first push
- 0:45 Vercel: connect repo, deploy, get a live URL
- 1:05 The loop: edit with Claude → push → auto-deploys live
- 1:20 Recap + homework: deploy your to-do app, share the URL

### Class 3 — Build Something Real (90 min)
- 0:00 Pick the app (expense/habit tracker, RSVP page…)
- 0:10 Plan it with Claude (brainstorm → spec)
- 0:20 Build core features iteratively
- 1:00 Push & deploy
- 1:15 Polish + one stretch feature
- 1:25 Wrap + where to go next
