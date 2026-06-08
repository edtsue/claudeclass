# ClaudeClass Hub — Design Spec

**Date:** 2026-06-08
**Repo:** edtsue/claudeclass
**Status:** Approved design → ready for implementation plan

## 1. Purpose

A central hub for a 3-part course teaching complete beginners how to use Claude Code.
Each class is 90 minutes. The hub holds the course agendas, plain-English concept
explanations, copy-paste command cheat-sheets, homework, a glossary, and a pre-class
setup guide. The instructor edits all content **directly on the website** and saves —
no Claude Code or terminal needed to update content. Edits appear for every student
instantly.

## 2. Audience & constraints

- **Students:** complete beginners. Never used a terminal, git, or written code.
  Tone is plain English, generous with copy-paste and "how to check it worked" steps.
- **Instructor (single author):** the user. Edits content live on the site.
- **Access model (decided):** *always-live*. Content lives in a cloud database
  (Supabase). The site is also runnable locally by students (a class exercise in
  git/terminal), but a local copy reads the same cloud content and therefore needs
  internet to show the latest. A local cache softens this (see §6).

## 3. Stack (simple tier — no build step)

- **Frontend:** vanilla HTML/CSS/JS. Tailwind via CDN. No bundler, no framework.
- **Data + auth:** Supabase (`@supabase/supabase-js` via CDN), browser talks to
  Supabase directly. No custom backend / Vercel functions required.
- **Hosting:** GitHub + Vercel. Push to `main` auto-deploys production. Canonical
  address is the Vercel-provided `.vercel.app` URL (no custom domain).
- **Pattern reuse:** mirrors the DEsolo26 approach (vanilla + Supabase + magic-link
  auth + RLS) and the Bento rich-editor pattern (B/I/U + colour + font-size + clear).
- **Visual design direction:** simple + premium, "Apple glass" (glassmorphism):
  frosted translucent panels with backdrop blur, thin light borders, soft shadows,
  rounded corners, system font (San Francisco-style), generous whitespace, calm
  palette. Applied consistently across the hub, with the sticky notes (§7) as the
  most expressive showcase of the aesthetic.

## 4. Pages & structure

Shared header/nav + shared CSS/JS across a small set of pages:

| Page | Path | Contents |
|---|---|---|
| Setup (Office Hours) | `/setup` | Mac tab + Windows/PC tab: prerequisites, step-by-step Claude Code install, "check it worked", common errors + fixes |
| Overview | `/` (index) | Course intro, "what you'll learn", three class cards linking to each class |
| Class 1 | `/class1` | Agenda (timed), concepts in plain English, command cheat-sheet, homework, links |
| Class 2 | `/class2` | Same shape, tech-stack content |
| Class 3 | `/class3` | Same shape, build-a-real-app content |
| Glossary | `/glossary` | Plain-English term list with live search filter |

Navigation is consistent on every page. Mobile-friendly (students may follow along
on a phone/tablet while typing on their laptop).

## 5. Content & editing model

### Editable regions
Each page is a static HTML shell containing named **editable regions** (e.g.
`class1.agenda`, `class1.cheatsheet`, `setup.mac`, `setup.pc`, `glossary.terms`).
Each region's HTML is stored in Supabase and injected on load.

### Data model — table `hub_content`
| column | type | notes |
|---|---|---|
| `key` | text, PK | region id, e.g. `class1.agenda` |
| `html` | text | the region's innerHTML |
| `updated_at` | timestamptz | set on save |

(Student progress checklists and the glossary search are **not** in the DB — see §6/§7.)

### Read flow
On page load: fetch all `hub_content` rows → inject each region by key → cache the
result in `localStorage`. If a region has no row yet, render the seeded starting
content shipped in the HTML.

### Edit flow (instructor only)
1. A subtle "Instructor" link → enter email → Supabase **magic link** → returns
   authenticated (session persisted by supabase-js).
2. When authenticated, an **Edit** toggle appears. Toggling on makes regions
   `contenteditable` and shows a floating rich-text toolbar: **bold, italic,
   underline, text colour, font size, clear formatting** (the Bento editor set).
3. **Save** upserts changed regions (`key`, `html`, `updated_at`) to Supabase.
4. Anonymous visitors never see the edit UI, and the write path is rejected
   server-side regardless (see §8).

## 6. Resilience & the "needs internet" tradeoff

- On every successful load, content is cached to `localStorage`.
- If the Supabase fetch fails (offline, or a local copy with no internet), the site
  shows a friendly banner ("Couldn't load the latest content — showing the last
  saved copy") and renders cached content, falling back to seeded HTML if no cache.
- If a **save** fails, show an error toast and keep the edits in the editor so
  nothing is lost; the instructor can retry.

## 7. Student-local features (browser-only)

Both features below are private to each student, stored in their browser
(`localStorage`). No accounts, no database, never visible to the instructor or
other students. They work even with no internet.

### 7a. Progress checklists
Each class page has a small checklist of "things to do / things you learned".
Checked state persists per student. Purely a personal progress aid.

### 7b. Sticky notes (premium glass)
A private scratchpad students use to take notes during class.
- **Access:** a floating button present on every page opens a slide-out notes panel
  (a single shared collection of notes, available anywhere — not per-page).
- **Notes:** students can create multiple sticky-note cards, edit each card's text
  inline, and delete cards. Changes auto-save to `localStorage` as they type.
- **Optional:** a small set of glass colour tints per card (kept minimal).
- **Design:** the showcase of the "Apple glass" aesthetic — frosted translucent
  cards with backdrop blur, soft shadows, rounded corners, subtle light borders.
  Simple and premium; no drag-and-drop, no rich formatting (plain editable text)
  to keep it clean and reliable.

### 7c. Settings
A gear button (present on every page) opens a glass settings panel. All settings
persist per student in `localStorage` and apply across the whole hub:
- **Theme:** Light / Dark / System (glass treatment adapts to each; default System).
- **Text size:** Small / Medium / Large (scales base font; aids readability for
  beginners following along).
- **Reduce motion:** toggles off blur/animation flourishes for performance or
  comfort.
- **Reset my data:** clears this student's notes, checklist progress, and settings
  (with a confirm step). Does not touch course content.

## 8. Security

- Only the Supabase **anon key** lives in the repo — safe under RLS.
- **RLS policies on `hub_content`:**
  - `SELECT`: allowed for anon + authenticated (content is public).
  - `INSERT`/`UPDATE`: allowed only for the instructor's authenticated identity
    (matched by the instructor's email/user id). Everyone else is rejected at the
    database, independent of the UI.
- No instructor secret, service-role key, or GitHub token is ever in the repo.
- Single trusted author → innerHTML rich text is acceptable; no heavy sanitization
  needed.

## 9. Starting content (instructor refines live in the edit UI — dogfoods the feature)

### Setup — Office Hours (Mac & PC)
Prerequisites (terminal, Node.js) in plain English; separate Mac and Windows install
steps for Claude Code; a verification step; common PATH/permission errors + fixes.
*Exact install commands confirmed against current Claude Code docs at build time;
editable live afterward.*

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

## 10. Features summary

- Overview page with three class cards
- Per-class pages: timed agenda, plain-English concepts, command cheat-sheet with
  **copy buttons**, homework, links
- Setup page with **Mac/PC tabs**
- Glossary with **live search**
- Student **progress checklists** (browser-local)
- Student **sticky notes** — private glass scratchpad, available on every page (browser-local)
- **Settings panel** — light/dark/system theme, text size, reduce motion, reset data (browser-local)
- **Instructor edit mode**: magic-link login + inline rich-text editing + save
- Offline/local **cache fallback**
- **Premium "Apple glass" aesthetic**: mobile-friendly, beginner-clean

## 11. Non-goals (YAGNI)

- No student accounts, submissions, or grading.
- No instructor analytics/dashboard.
- No multi-author editing or conflict resolution (single trusted author).
- No content versioning/undo beyond the browser session.
- No media uploads (images embedded via URL if needed).

## 12. Testing & verification

- **RLS check:** confirm an anonymous client can read but cannot write `hub_content`;
  confirm the instructor identity can write.
- **Manual verification plan:** load each page; instructor logs in via magic link;
  toggle edit, change a region, save; reload and confirm the change persists and is
  visible to a logged-out browser; copy buttons copy correct command text; glossary
  search filters; checklists persist per browser; offline fallback shows cached
  content with the banner.
- Pure helper functions (e.g. region-merge/render, cache read/write) extracted so
  they can be unit-tested where it adds value.
