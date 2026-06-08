// content.mjs — single source of truth for seeded hub content.
// Pure data (no DOM), so BOTH the browser (rendering) and the serverless
// AI assistant (/api/ask, system prompt) import from here. When Supabase is
// connected, edited content overrides these seeds by `key`.

export const COURSE = {
  title: 'ClaudeClass',
  tagline: 'Learn to build with Claude Code — by doing.',
  blurb:
    'A hands-on, 3-part course for total beginners. No coding experience needed. ' +
    'You will type a little, build real things, and put them on the internet.',
};

// Each page is a list of editable regions. `key` is the Supabase row id.
// `html` is the seeded innerHTML (used until an instructor edits it).
export const CONTENT = {
  overview: {
    title: 'Welcome',
    nav: 'Overview',
    sections: [
      {
        key: 'overview.intro',
        html: `
          <p class="lead">Three 90-minute classes that take you from "what's a terminal?"
          to building and publishing your own app — with Claude Code doing the heavy lifting.</p>
          <p>The whole idea: <strong>jump in and experiment</strong>. You learn by doing, not by reading.
          Break things. Ask questions. The little Claude in the corner is here to help any time.</p>
        `,
      },
      {
        key: 'overview.path',
        html: `
          <h3>Your path</h3>
          <ol class="path">
            <li><strong>Office hours (before we start):</strong> get Claude Code installed.</li>
            <li><strong>Class 1:</strong> the core ideas + build a to-do app.</li>
            <li><strong>Class 2:</strong> put your app online (GitHub + Vercel).</li>
            <li><strong>Class 3:</strong> build something real, start to finish.</li>
          </ol>
        `,
      },
      {
        key: 'overview.links',
        html: `
          <h3>Key links — set these up before we start</h3>
          <ul class="links">
            <li><a href="https://claude.ai" target="_blank" rel="noopener">Claude account ↗</a>
              <span class="hint">Sign up / log in. You'll use this to log into Claude Code (a paid plan — Pro or Max — is needed).</span></li>
            <li><a href="https://code.claude.com/docs" target="_blank" rel="noopener">Claude Code — install &amp; docs ↗</a>
              <span class="hint">The tool itself. Step-by-step install is on the <a href="#/setup">Setup</a> page.</span></li>
            <li><a href="https://github.com/signup" target="_blank" rel="noopener">GitHub ↗</a>
              <span class="hint">Free account — stores your projects online (Class 2).</span></li>
            <li><a href="https://vercel.com/signup" target="_blank" rel="noopener">Vercel ↗</a>
              <span class="hint">Free — puts your app on the internet. Sign in with your GitHub account (Class 2).</span></li>
            <li><a href="https://nodejs.org" target="_blank" rel="noopener">Node.js ↗</a>
              <span class="hint">A free helper some projects need — only if Setup asks for it.</span></li>
          </ul>
        `,
      },
      {
        key: 'overview.start',
        html: `
          <h3>Start here</h3>
          <p>New? Open <a href="#/setup">Setup</a> and get Claude Code running.
          Already set up? Jump to <a href="#/class1">Class 1</a>. Stuck on a word?
          The <a href="#/reference">Reference</a> explains everything in plain English.</p>
        `,
      },
    ],
  },

  setup: {
    title: 'Setup — Office Hours',
    nav: 'Setup',
    sections: [
      {
        key: 'setup.intro',
        html: `
          <p class="lead">Goal: get Claude Code installed and logged in before Class 1.
          Pick your computer below and follow the steps. It usually takes under 5 minutes.</p>
          <p class="hint">Don't worry if the terminal looks intimidating — you'll mostly copy and paste. That's normal and allowed!</p>
          <p class="metaphor">✅ <strong>No admin password needed.</strong> Claude Code installs just for you, inside your own account (a folder called <code>.local/bin</code>) — like keeping a tool in your own desk drawer, not the building's supply closet. Great for a locked-down work laptop.</p>
        `,
      },
      {
        key: 'setup.prereq',
        html: `
          <h3>What you need first</h3>
          <ul>
            <li>A <strong>terminal</strong> — the text window for typing commands. Mac: <em>Terminal</em>. Windows: <em>PowerShell</em>.</li>
            <li>A free <strong>Claude account</strong> (Pro, Max, or Team) to log in when prompted.</li>
          </ul>
        `,
      },
      {
        // Mac/PC tabs are rendered by app.mjs from this region's data-tab markup.
        key: 'setup.install',
        html: `
          <h3>Install Claude Code</h3>
          <p class="hint">Find your computer below and follow <strong>only that side</strong>.</p>
          <div class="platforms">

            <div class="platform-card" data-os="mac">
              <div class="platform-head">🍎 Mac — use <strong>Terminal</strong> (zsh)</div>
              <p class="hint">Your Mac's Terminal uses <strong>zsh</strong> — the default shell since 2019. These steps are written for it. (The <code>| bash</code> below just runs the installer; your Terminal stays zsh.)</p>
              <ol class="steps">
                <li>Open <em>Terminal</em>: press <kbd>Cmd</kbd>+<kbd>Space</kbd>, type "Terminal", hit Enter.</li>
                <li>Paste this and press Enter:
                  <pre class="cmd"><code>curl -fsSL https://claude.ai/install.sh | bash</code></pre>
                </li>
                <li>When it finishes, start Claude Code:
                  <pre class="cmd"><code>claude</code></pre>
                </li>
                <li>A browser opens — log in with your Claude account. Done! 🎉</li>
                <li><strong>If it says "command not found":</strong> your Mac just needs to know where Claude Code lives. It's installed in a <em>hidden</em> folder inside your account: <code>~/.local/bin</code> (that's <code>/Users/your-name/.local/bin</code>). Terminal uses <em>zsh</em>, so paste these two lines to point it there:
                  <pre class="cmd"><code>echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc</code></pre>
                  Then type <code>claude</code> again. <span class="hint">(To see the hidden folder in Finder, press <kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>.</kbd>)</span>
                </li>
              </ol>
            </div>

            <div class="platform-card" data-os="win">
              <div class="platform-head">🪟 Windows — use <strong>PowerShell</strong></div>
              <ol class="steps">
                <li>Open <em>PowerShell</em>: Start menu → type "PowerShell" → Enter. <span class="hint">Not the black "CMD" window.</span></li>
                <li>Paste this and press Enter:
                  <pre class="cmd"><code>irm https://claude.ai/install.ps1 | iex</code></pre>
                  <span class="hint">(There's also <code>winget install Anthropic.ClaudeCode</code>, but it can ask for an admin password — if so, use the command above instead.)</span>
                </li>
                <li>When it finishes, start Claude Code:
                  <pre class="cmd"><code>claude</code></pre>
                </li>
                <li>A browser opens — log in with your Claude account. Done! 🎉</li>
                <li><strong>If it says "not recognized":</strong> Claude Code installed in a <em>hidden</em> folder inside your account — <code>C:\Users\your-name\.local\bin</code> — and Windows doesn't know to look there yet. Add it to your <em>personal</em> PATH (no admin needed) by pasting this in PowerShell:
                  <pre class="cmd"><code>[Environment]::SetEnvironmentVariable("PATH", "$env:PATH;$env:USERPROFILE\.local\bin", "User")</code></pre>
                  Then close PowerShell, open it again, and type <code>claude</code>. <span class="hint">(To see the hidden folder in File Explorer: View → Show → Hidden items.)</span>
                </li>
              </ol>
            </div>

          </div>
        `,
      },
      {
        key: 'setup.verify',
        html: `
          <h3>Check it worked</h3>
          <p>In the terminal, type:</p>
          <pre class="cmd"><code>claude --version</code></pre>
          <p>If you see a version number, you're ready. 🎉 If you see "command not found", see fixes below.</p>
        `,
      },
      {
        key: 'setup.troubleshoot',
        html: `
          <h3>Common snags &amp; fixes</h3>
          <ul>
            <li><strong>"command not found: claude"</strong> — fully close the terminal and open a new one (it needs to reload). Still stuck? Restart your computer.</li>
            <li><strong>"permission denied"</strong> — make sure you copied the whole command, including the start.</li>
            <li><strong>Windows blocked the script</strong> — use the <code>winget</code> command above instead.</li>
            <li><strong>Login page didn't open</strong> — type <code>claude</code> again; it will retry the browser login.</li>
          </ul>
          <p class="hint">Bring any leftover errors to office hours — we'll fix them together.</p>
        `,
      },
    ],
  },

  class1: {
    title: 'Class 1 — Concepts & Your First App',
    nav: 'Class 1',
    unlock: '2026-07-18T11:00:00Z', // Sat Jul 18, 2026, 7:00 AM New York time
    sections: [
      {
        key: 'class1.goal',
        html: `<p class="lead">Goal: learn the core words, then build a working to-do app — today.</p>`,
      },
      {
        key: 'class1.agenda',
        html: `
          <h3>Agenda <span class="dur">90 min</span></h3>
          <ul class="agenda">
            <li><span class="t">0:00</span> Welcome — what Claude Code is (you talk, it builds)</li>
            <li><span class="t">0:10</span> The core words in plain English: terminal, files &amp; folders, HTML, "app", API, MCP, git push/pull</li>
            <li><span class="t">0:30</span> Open Claude Code, open a project folder</li>
            <li><span class="t">0:40</span> Build a to-do app together (add / check off / delete)</li>
            <li><span class="t">1:15</span> See it in the browser — change a colour to feel the loop</li>
            <li><span class="t">1:25</span> Recap + homework</li>
          </ul>
        `,
      },
      {
        key: 'class1.concepts',
        html: `
          <h3>The words you'll hear</h3>
          <p>Skim these — every one has a plain-English definition <em>and a metaphor</em> in the <a href="#/reference">Reference</a>.</p>
          <ul class="chips">
            <li>terminal</li><li>files &amp; folders</li><li>HTML</li><li>app</li>
            <li>API</li><li>MCP</li><li>git</li><li>push</li><li>pull</li>
          </ul>
          <p class="metaphor">🔑 Big picture: building an app is like <strong>building with LEGO</strong>.
          HTML is the bricks, the terminal is how you ask for more bricks, and git takes a photo
          every time you finish a step so you can always go back.</p>
        `,
      },
      {
        key: 'class1.try',
        html: `
          <h3>Try it now</h3>
          <p>In Claude Code, type this and watch it build:</p>
          <pre class="cmd"><code>Build a simple to-do app in one HTML file. I can add a task, check it off, and delete it. Make it look clean.</code></pre>
          <p>Then ask it to <em>"change the background to a soft blue"</em> — that's the whole loop: ask → see → tweak.</p>
        `,
      },
      {
        key: 'class1.homework',
        html: `
          <h3>Homework</h3>
          <ul class="todo" data-checklist="class1">
            <li>Add one more feature to your to-do app (try: "let me edit a task")</li>
            <li>Change two things about how it looks</li>
            <li>Open it in your browser and screenshot it</li>
          </ul>
        `,
      },
    ],
  },

  class2: {
    title: 'Class 2 — The Tech Stack',
    nav: 'Class 2',
    unlock: '2026-07-25T11:00:00Z', // Sat Jul 25, 2026, 7:00 AM New York time
    sections: [
      {
        key: 'class2.goal',
        html: `<p class="lead">Goal: take the app on your computer and put it on the real internet, with a link you can share.</p>`,
      },
      {
        key: 'class2.agenda',
        html: `
          <h3>Agenda <span class="dur">90 min</span></h3>
          <ul class="agenda">
            <li><span class="t">0:00</span> Recap — today we go live</li>
            <li><span class="t">0:10</span> GitHub: repos, commits, push/pull (your project's save history + backup)</li>
            <li><span class="t">0:30</span> Connect your project to GitHub, first push</li>
            <li><span class="t">0:45</span> Vercel: connect the repo, deploy, get a live URL</li>
            <li><span class="t">1:05</span> The loop: edit with Claude → push → it auto-deploys</li>
            <li><span class="t">1:20</span> Recap + homework</li>
          </ul>
        `,
      },
      {
        key: 'class2.stack',
        html: `
          <h3>The three tools</h3>
          <ul>
            <li><strong>Claude Code</strong> — writes &amp; edits your app.</li>
            <li><strong>GitHub</strong> — stores your project online, keeps every version.</li>
            <li><strong>Vercel</strong> — turns your project into a live website automatically.</li>
          </ul>
          <p>Together: you change code → <code>push</code> to GitHub → Vercel publishes it. Magic loop.</p>
          <p class="metaphor">🔑 Think of a <strong>bakery</strong>: Claude Code is the baker, GitHub is the recipe archive
          (every version saved), and Vercel is the shop window where customers see what you made.</p>
        `,
      },
      {
        key: 'class2.try',
        html: `
          <h3>Try it now</h3>
          <p>Ask Claude Code:</p>
          <pre class="cmd"><code>Help me put this project on GitHub and deploy it to Vercel. Walk me through each step.</code></pre>
        `,
      },
      {
        key: 'class2.homework',
        html: `
          <h3>Homework</h3>
          <ul class="todo" data-checklist="class2">
            <li>Get your to-do app live on a Vercel URL</li>
            <li>Make a change with Claude, push it, watch it update online</li>
            <li>Share your live link with the class</li>
          </ul>
        `,
      },
    ],
  },

  class3: {
    title: 'Class 3 — Build Something Real',
    nav: 'Class 3',
    unlock: '2026-07-16T11:00:00Z', // Thu Jul 16, 2026, 7:00 AM New York time — VERIFY (earlier than Class 1?)
    sections: [
      {
        key: 'class3.goal',
        html: `<p class="lead">Goal: use everything from Class 1 &amp; 2 to build and ship a more complete app.</p>`,
      },
      {
        key: 'class3.agenda',
        html: `
          <h3>Agenda <span class="dur">90 min</span></h3>
          <ul class="agenda">
            <li><span class="t">0:00</span> Pick your app (expense tracker, habit tracker, RSVP page…)</li>
            <li><span class="t">0:10</span> Plan it with Claude (describe it → get a simple spec)</li>
            <li><span class="t">0:20</span> Build the core features, one at a time</li>
            <li><span class="t">1:00</span> Push &amp; deploy</li>
            <li><span class="t">1:15</span> Polish + one stretch feature</li>
            <li><span class="t">1:25</span> Wrap + where to go next</li>
          </ul>
        `,
      },
      {
        key: 'class3.ideas',
        html: `
          <h3>App ideas</h3>
          <ul class="chips">
            <li>Expense tracker</li><li>Habit tracker</li><li>Event RSVP page</li>
            <li>Recipe box</li><li>Reading list</li><li>Workout log</li>
          </ul>
          <p>Pick one that's useful to <em>you</em> — you'll stay motivated.</p>
        `,
      },
      {
        key: 'class3.try',
        html: `
          <h3>Try it now</h3>
          <pre class="cmd"><code>I want to build a habit tracker. Ask me a few questions, then propose a simple plan before we build.</code></pre>
        `,
      },
      {
        key: 'class3.homework',
        html: `
          <h3>Keep going</h3>
          <ul class="todo" data-checklist="class3">
            <li>Finish and deploy your app</li>
            <li>Add one feature you didn't think was possible</li>
            <li>Show someone what you made</li>
          </ul>
        `,
      },
    ],
  },

  cohorts: {
    title: 'Cohorts',
    nav: 'Cohorts',
    sections: [
      {
        key: 'cohorts.intro',
        html: `
          <p class="lead">Your cohort is your <strong>pit crew</strong> — a small team to think out loud with,
          get unstuck with, and celebrate wins with. You're grouped randomly into four teams of four.</p>
          <p class="hint">Find your name, meet your crew, and sit together. Press the 🎲 to draw new teams.</p>
        `,
      },
    ],
  },

  reference: {
    title: 'Reference',
    nav: 'Reference',
    sections: [
      {
        key: 'reference.intro',
        html: `<p class="lead">Every word you'll hear in class, in plain English — each with a metaphor to make it stick. Search below to find anything fast.</p>`,
      },
    ],
  },

  faq: {
    title: 'FAQs',
    nav: 'FAQs',
    sections: [
      {
        key: 'faq.intro',
        html: `<p class="lead">Quick answers to the questions students ask most. Tap a question to expand it.</p>`,
      },
      {
        key: 'faq.items',
        html: `
          <div class="faq">
            <details class="faq-item">
              <summary>Do I need to know how to code?</summary>
              <div><p>No. That's the whole point. You describe what you want in plain English and Claude writes the code. Think of yourself as the <strong>director</strong> and Claude as the film crew — you say "make it do this," they handle the cameras.</p></div>
            </details>

            <details class="faq-item">
              <summary>What's the difference between Claude Code in the terminal and Claude Code on the web/desktop?</summary>
              <div>
                <p><strong>Terminal</strong> (what we use in class): Claude Code lives on <em>your</em> computer and edits your real files directly. It's text-in, text-out — like texting your computer. It's included with your Claude plan.</p>
                <p><strong>Web / desktop app</strong>: a more visual version — you see a file list and coloured "before/after" changes without touching a terminal. Friendly for beginners, but the web version does its work in the cloud rather than directly on your machine, and the fuller versions can require a paid plan.</p>
                <p>Same brain, different steering wheel. We learn the terminal because it's the most powerful and it's free.</p>
              </div>
            </details>

            <details class="faq-item">
              <summary>What's the difference between Claude Code and OpenAI Codex?</summary>
              <div>
                <p>Both are AI coding assistants — like two different car brands that both get you there. <strong>Claude Code</strong> (by Anthropic) is what we use; it runs on your computer, works with your real files and your git setup, and is known for high-quality, careful edits. <strong>Codex</strong> (by OpenAI) leans more on running tasks in the cloud.</p>
                <p>In 2026 they're roughly neck-and-neck on quality. We pick Claude Code because it's beginner-friendly, local, and pairs cleanly with the tools in this course.</p>
              </div>
            </details>

            <details class="faq-item">
              <summary>What's the difference between Claude (the chat app) and Claude Code?</summary>
              <div><p><strong>Claude</strong> is the chat you talk to in a browser. <strong>Claude Code</strong> is the same intelligence but with hands — it can actually create and edit files, run commands, and build your app. Chat advises; Code does.</p></div>
            </details>

            <details class="faq-item">
              <summary>Is "vibe coding" real coding?</summary>
              <div><p>It makes real, working software — so yes. It's a different style: you guide the AI instead of typing every line. Like cooking with a meal kit vs. growing your own wheat. The dinner is still real.</p></div>
            </details>

            <details class="faq-item">
              <summary>Will I break something? Can I undo mistakes?</summary>
              <div><p>You can't break your computer, and almost everything is undoable — that's exactly what <strong>git</strong> is for (a time machine with save points). Experiment freely. Breaking things and fixing them is how you learn fastest.</p></div>
            </details>

            <details class="faq-item">
              <summary>What if the AI gets it wrong?</summary>
              <div><p>It happens. Just tell it what's wrong in plain English — "that button doesn't work, fix it" — and it tries again. The clearer you describe the problem, the better the fix.</p></div>
            </details>

            <details class="faq-item">
              <summary>How much does this cost?</summary>
              <div><p>You need a Claude account to log in. The terminal Claude Code we use is included with your plan. GitHub and Vercel both have free tiers that are plenty for this course.</p></div>
            </details>

            <details class="faq-item">
              <summary>Is my code and data private?</summary>
              <div><p>Your project files stay on your computer. When you choose to <em>deploy</em>, you're putting your app online on purpose. Never paste real passwords or secret keys into your code — store them as <a href="#/reference">environment variables</a> instead.</p></div>
            </details>

            <details class="faq-item">
              <summary>Do I have to memorize all the commands?</summary>
              <div><p>Nope. Keep the <a href="#/reference">Reference</a> open and copy-paste. You'll remember the handful you use most without trying.</p></div>
            </details>
          </div>
        `,
      },
    ],
  },
};

// Reference: flat list of {category, term, def, example?} — rendered grouped,
// filtered by the search box. Plain-English, novice-first.
export const REFERENCE = [
  // Terminal & Git
  { cat: 'Terminal & Git', term: 'terminal', def: 'The text window where you type commands instead of clicking buttons.', meta: 'Like texting your computer directly instead of using buttons.' },
  { cat: 'Terminal & Git', term: 'bash', def: 'The most common "language" you type into a terminal to give commands.', ex: 'ls', meta: 'The everyday phrases your terminal understands.' },
  { cat: 'Terminal & Git', term: 'curl', def: 'A command that grabs things from the internet right in the terminal — files, web pages, APIs.', meta: 'A fishing rod that reels in things from the web.' },
  { cat: 'Terminal & Git', term: 'cron', def: 'A scheduler that runs a command automatically on a timetable — like "every night at 2am".', meta: 'An alarm clock for tasks.' },
  { cat: 'Terminal & Git', term: 'hook', def: 'Code that runs automatically when something happens — e.g. right before you save your work.', meta: 'A trip-wire: cross it and something fires automatically.' },
  { cat: 'Terminal & Git', term: 'git', def: 'The tool that saves snapshots of your project so you can go back in time and never lose work.', meta: 'A time machine with infinite save points, like a video game.' },
  { cat: 'Terminal & Git', term: 'repo (repository)', def: 'A project folder that git is keeping track of.', meta: 'A scrapbook that remembers every page you ever glued in.' },
  { cat: 'Terminal & Git', term: 'clone', def: 'Make a copy of a project from GitHub onto your own computer.', meta: 'Photocopying someone\'s notebook to write in your own copy.' },
  { cat: 'Terminal & Git', term: 'commit', def: 'A saved snapshot of your changes, with a short note describing them.', meta: 'A save point with a sticky-note saying what you did.' },
  { cat: 'Terminal & Git', term: 'push', def: 'Upload your saved changes (commits) from your computer to GitHub.', meta: 'Mailing your latest draft to the shared cloud.' },
  { cat: 'Terminal & Git', term: 'pull', def: 'Download the latest changes from GitHub down to your computer.', meta: 'Checking the mailbox for everyone else\'s updates.' },
  { cat: 'Terminal & Git', term: 'branch', def: 'A parallel copy of your project so you can try things without breaking the main one.', meta: 'A "what if?" sandbox next to your real sandcastle.' },
  { cat: 'Terminal & Git', term: 'main', def: 'The primary, "official" branch of your project — the real version everyone builds from.', meta: 'The master copy of the script everyone acts from.' },
  { cat: 'Terminal & Git', term: 'checkout', def: 'Switch which branch you\'re currently working on.', meta: 'Changing which TV channel you\'re watching.' },
  { cat: 'Terminal & Git', term: 'pull request (PR)', def: 'A proposal to merge your branch\'s changes into main, so they can be reviewed first.', meta: 'Asking "can we add my chapter to the book?" before it\'s printed.' },
  { cat: 'Terminal & Git', term: 'remote / origin', def: 'The cloud copy of your project (usually on GitHub). "origin" is its nickname.', meta: 'The home base your laptop syncs with.' },
  { cat: 'Terminal & Git', term: 'merge', def: 'Combine the changes from one branch into another.', meta: 'Blending two recipe drafts into one final dish.' },
  { cat: 'Terminal & Git', term: 'squash', def: 'Tidy up by combining several small commits into one clean commit.', meta: 'Rolling many scribbled notes into one neat summary.' },

  // Building blocks
  { cat: 'Building blocks', term: 'HTML', def: 'The building blocks of a web page — the text, buttons, and boxes you see.', meta: 'The LEGO bricks a web page is built from.' },
  { cat: 'Building blocks', term: 'app', def: 'A program you use to do something — on the web, in your browser.', meta: 'A tool, like a hammer, but it lives on a screen.' },
  { cat: 'Building blocks', term: 'JSON', def: 'A simple text format apps use to pass data around.', ex: '{ "name": "Ed", "tasks": 3 }', meta: 'A labelled lunchbox: each thing has a name and a value.' },
  { cat: 'Building blocks', term: 'API', def: 'A way for apps to talk to each other and request information.', meta: 'A waiter who takes your order to the kitchen and brings food back.' },
  { cat: 'Building blocks', term: 'environment variable', def: 'A secret or setting (like an API key) stored outside your code so it stays private.', meta: 'A house key hidden under the mat, not taped to the front door.' },
  { cat: 'Building blocks', term: 'localhost', def: 'Your own computer pretending to be a website, just for you, while you build.', meta: 'A dress rehearsal before opening night.' },
  { cat: 'Building blocks', term: 'deploy', def: 'Put your app on the internet so other people can open it.', meta: 'Opening night — the doors open to the public.' },
  { cat: 'Building blocks', term: 'framework', def: 'A ready-made starter kit that does the boring parts for you (e.g. Next.js).', meta: 'A meal kit: ingredients prepped, you just cook.' },
  { cat: 'Building blocks', term: 'package / dependency', def: 'Pre-written code your project borrows and uses.', meta: 'A store-bought sauce instead of making it from scratch.' },
  { cat: 'Building blocks', term: 'npm', def: 'The tool that installs packages into your project.', meta: 'The grocery delivery service for code.' },

  // Vibe coding
  { cat: 'Vibe coding', term: 'vibe coding', def: 'Building software by describing what you want in plain English and letting AI write the code.', meta: 'Being the director; the AI is your film crew.' },
  { cat: 'Vibe coding', term: 'prompt', def: 'What you type to the AI to tell it what you want.', meta: 'Your order at the counter — clearer order, better result.' },
  { cat: 'Vibe coding', term: 'context', def: 'Everything the AI currently remembers in your conversation.', meta: 'The AI\'s short-term memory — its desk space.' },
  { cat: 'Vibe coding', term: 'token', def: 'The little chunks of text AI reads and writes; your usage is measured in tokens.', meta: 'Syllables of thought — the AI is billed by the syllable.' },
  { cat: 'Vibe coding', term: 'model', def: 'The specific AI brain you\'re using — e.g. Opus, Sonnet, Haiku.', meta: 'Different engines: a sports car vs. an economy car.' },
  { cat: 'Vibe coding', term: 'MCP', def: 'A way to plug extra tools and data into Claude (stands for Model Context Protocol).', meta: 'USB ports for the AI — plug in new superpowers.' },
  { cat: 'Vibe coding', term: 'frontend / backend', def: 'The part you see and click vs. the part that works behind the scenes.', meta: 'The dining room vs. the kitchen of a restaurant.' },

  // Claude Code commands
  { cat: 'Claude Code commands', term: '/clear', def: 'Start a fresh conversation — wipes the current context.' },
  { cat: 'Claude Code commands', term: '/compact', def: 'Summarize the conversation to save space instead of wiping it.' },
  { cat: 'Claude Code commands', term: '/config', def: 'Open Claude Code\'s settings.' },
  { cat: 'Claude Code commands', term: '/model', def: 'Switch which AI model you\'re using.' },
  { cat: 'Claude Code commands', term: '/context', def: 'See how much of the context window you\'re currently using.' },
  { cat: 'Claude Code commands', term: '/usage', def: 'Check your usage and limits.' },
  { cat: 'Claude Code commands', term: '/help', def: 'List the available commands.' },
  { cat: 'Claude Code commands', term: '/init', def: 'Create a CLAUDE.md file that documents your project for Claude.' },
  { cat: 'Claude Code commands', term: 'statusline', def: 'The customizable info bar at the bottom of Claude Code.' },
  { cat: 'Claude Code commands', term: '! (prefix)', def: 'Run a shell command directly from the prompt.', ex: '! ls' },
];

// Student roster (seed order = the first cohort draw). The 🎲 reshuffles these.
export const ROSTER = [
  'Richard D.', 'Tiff N.', 'Lizzie M', 'Stefi P',
  'Kevyn K', 'Robin H', 'Yu T', 'Ryu N',
  'Zoe M', 'Jineen C', 'Ian F', 'Hayley M',
  'Joshua E', 'Gianfranco L', 'Christina K', 'Vale P',
];
export const COHORT_SIZE = 4;

// Order pages appear in the nav.
export const NAV_ORDER = ['overview', 'setup', 'class1', 'class2', 'class3', 'cohorts', 'reference', 'faq'];
