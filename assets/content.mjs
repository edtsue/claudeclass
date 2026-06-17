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
          The <a href="#/reference">Glossary</a> explains everything in plain English.</p>
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
                <li><strong>If it says "not recognized":</strong> Claude Code installed in a <em>hidden</em> folder inside your account — <code>C:\\Users\\your-name\\.local\\bin</code> — and Windows doesn't know to look there yet. Add it to your <em>personal</em> PATH (no admin needed) by pasting these two lines in PowerShell:
                  <pre class="cmd"><code>$p = [Environment]::GetEnvironmentVariable("PATH", "User")
[Environment]::SetEnvironmentVariable("PATH", "$p;$env:USERPROFILE\\.local\\bin", "User")</code></pre>
                  Then close PowerShell, open it again, and type <code>claude</code>. <span class="hint">(To see the hidden folder in File Explorer: View → Show → Hidden items.)</span>
                </li>
              </ol>

              <div class="snag-fix">
                <strong>🚫 Saw "blocked by a Group Policy" (Gruppenrichtlinie)? Most work laptops do — here's the fix.</strong>
                <p>Your company blocks apps from running out of the temporary download folder, so the installer gets stopped on its last step. Good news: it already finished <em>downloading</em> Claude before it was blocked — you just move that file into your own folder and run it from there. <strong>No admin password needed.</strong></p>
                <p>Paste this whole block into PowerShell and press Enter:</p>
                <pre class="cmd"><code>New-Item -ItemType Directory -Force "$env:USERPROFILE\\.local\\bin" | Out-Null
$src = Get-ChildItem "$env:USERPROFILE\\.claude\\downloads\\claude-*win32-x64.exe" | Sort-Object LastWriteTime | Select-Object -Last 1
Copy-Item $src.FullName "$env:USERPROFILE\\.local\\bin\\claude.exe" -Force
Unblock-File "$env:USERPROFILE\\.local\\bin\\claude.exe"
$p = [Environment]::GetEnvironmentVariable("PATH", "User")
[Environment]::SetEnvironmentVariable("PATH", "$p;$env:USERPROFILE\\.local\\bin", "User")</code></pre>
                <p class="hint">Plain English, line by line: make your personal <code>.local\\bin</code> folder → copy the Claude you already downloaded into it (renamed <code>claude.exe</code>) → clear the “downloaded from the internet” flag → add that folder to your personal PATH so the terminal can find it.</p>
                <p>Now <strong>fully close PowerShell, open a fresh window</strong>, and check it worked:</p>
                <pre class="cmd"><code>claude --version</code></pre>
                <p><strong>See a version number?</strong> 🎉 You're installed — head to <strong>“Logging in”</strong> below.</p>
                <p class="hint"><strong>Got “Cannot find path …\\.claude\\downloads”?</strong> The download never happened. Run <code>irm https://claude.ai/install.ps1 | iex</code> once more (it'll stop at the same Group-Policy step, but it leaves the file behind), then paste the block above again.</p>
                <p class="hint"><strong>Still says “blocked by a Group Policy” after all that?</strong> Then your company blocks <em>every</em> app outside the official Program Files area — there's no self-serve workaround. Send IT this one line: <em>“Please allowlist <code>%USERPROFILE%\\.local\\bin\\claude.exe</code> in AppLocker / Software Restriction Policy so I can run Claude Code.”</em> (The <code>winget</code> and Desktop-app installs usually hit the same wall.) Bring it to office hours and we'll help.</p>
              </div>
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
        key: 'setup.login',
        html: `
          <h3>Logging in — Mac &amp; Windows (same on both)</h3>
          <p>Installed? Now you connect Claude Code to your paid Claude account. <strong>This part is identical on Mac and Windows.</strong> No API key, no credit-card details in the terminal — just your normal Claude login.</p>
          <ol class="steps">
            <li>In your terminal, type <code>claude</code> and press Enter:
              <pre class="cmd"><code>claude</code></pre>
            </li>
            <li><strong>First time only:</strong> it asks a couple of quick setup questions — pick a colour theme with the <kbd>↑</kbd>/<kbd>↓</kbd> arrow keys and press <kbd>Enter</kbd>. Any choice is fine.</li>
            <li>It asks <strong>how you want to log in</strong>. Choose <strong>“Claude account with subscription”</strong> (your Pro or Max plan) and press <kbd>Enter</kbd>. <span class="hint">The other option — “Anthropic Console / API key” — is separate pay-as-you-go billing. Not what we're using.</span></li>
            <li>Your <strong>web browser opens</strong> to a Claude sign-in page. Sign in if asked, then click <strong>Authorize</strong>.</li>
            <li>The browser says you can return to Claude Code. Switch back to your terminal — it now shows you're <strong>logged in</strong>. 🎉</li>
            <li>The first time you open a project folder, Claude asks <strong>“Do you trust the files in this folder?”</strong> Choose <strong>“Yes, I trust this folder”</strong> and press <kbd>Enter</kbd>.</li>
            <li>That's it — type a message to Claude and you're working!</li>
          </ol>
          <div class="snag-fix">
            <strong>🌐 Browser didn't open, or you're not sure it signed in?</strong>
            <p>At the login prompt in the terminal, press the <kbd>c</kbd> key — that <strong>copies the sign-in link</strong>. Paste it into any browser and sign in. After you authorize, the page shows a <strong>code</strong>: copy it, return to the terminal, paste it at the <em>“Paste code here”</em> prompt, and press <kbd>Enter</kbd>.</p>
            <p class="hint">Pasting into the terminal: Mac is <kbd>Cmd</kbd>+<kbd>V</kbd>. Windows PowerShell is <strong>right-click</strong> (or <kbd>Ctrl</kbd>+<kbd>V</kbd>).</p>
          </div>
          <p class="hint"><strong>Need to log in again later?</strong> Inside Claude Code, type <code>/login</code> and press Enter. To switch accounts, type <code>/logout</code> first, then <code>/login</code>. Type <code>/status</code> to see which account you're signed in as.</p>
        `,
      },
      {
        key: 'setup.success',
        html: `
          <h3>What a successful install looks like</h3>
          <p>When it works, typing <code>claude</code> shows a welcome screen like this — the little Claude, a version number, and your folder:</p>
          <figure class="shot">
            <img src="/assets/img/install-welcome.png" alt="Claude Code welcome screen showing the version, model, and your folder" loading="lazy" />
            <figcaption>The Claude Code welcome screen 🎉</figcaption>
          </figure>
          <p>The first time you open a folder, Claude Code asks if it can trust it. Pick <strong>“Yes, I trust this folder”</strong> and press Enter:</p>
          <figure class="shot">
            <img src="/assets/img/install-trust.png" alt="Claude Code asking to trust the current folder, with Yes/No options" loading="lazy" />
            <figcaption>Choose “Yes, I trust this folder” → Enter</figcaption>
          </figure>
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
          <p class="metaphor">📷 <strong>Stuck on an error?</strong> Tap <strong>Claude</strong> (bottom-right), hit the 📎, and upload a screenshot of your screen — he'll read the error and tell you exactly what to do.</p>
        `,
      },
    ],
  },

  class1: {
    title: 'Class 1 — Concepts & Your First App',
    nav: 'Class 1',
    unlock: '2026-06-18T11:00:00Z', // Thu Jun 18, 2026, 7:00 AM New York time
    sections: [
      {
        key: 'class1.outcomes',
        html: `<div class="outcomes"><span class="outcomes-h">By the end of today you'll be able to…</span> build a working to-do app and change how it looks &amp; works — just by describing what you want to Claude.</div>`,
      },
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
        key: 'class1.slides',
        html: `
          <details class="full-steps slides-block">
            <summary>📽️ Class 1 slides — open the deck</summary>
            <div class="slides-embed">
              <iframe src="https://docs.google.com/presentation/d/1NVNsjiv1USoNBx17I1CtB1D212jmRkhwvJVSpMuzWe8/embed?start=false&amp;loop=false&amp;delayms=3000" allowfullscreen loading="lazy" title="Class 1 slides"></iframe>
            </div>
            <p class="hint">Trouble seeing it? <a href="https://docs.google.com/presentation/d/1NVNsjiv1USoNBx17I1CtB1D212jmRkhwvJVSpMuzWe8/edit" target="_blank" rel="noopener">Open the slides in a new tab</a>.</p>
          </details>
        `,
      },
      {
        key: 'class1.concepts',
        html: `
          <h3>The words you'll hear</h3>
          <p>Skim these — every one has a plain-English definition <em>and a metaphor</em> in the <a href="#/reference">Glossary</a>.</p>
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
          <h3>Prompt starters — copy &amp; paste 🗣️</h3>
          <p>Not sure what to say to Claude Code? Start with these. Hit <em>copy</em>, paste, and watch.</p>
          <pre class="cmd prompt"><code>Build a simple to-do app in one HTML file. I can add a task, check it off, and delete it. Make it look clean.</code></pre>
          <pre class="cmd prompt"><code>Change the background to a soft blue and make the buttons rounded.</code></pre>
          <pre class="cmd prompt"><code>Explain what you just built, in plain English.</code></pre>
          <pre class="cmd prompt"><code>I don't like how it looks — make it more modern.</code></pre>
          <p class="hint">That's the whole loop: ask → see → tweak. Repeat!</p>
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
    unlock: '2026-06-25T11:00:00Z', // Thu Jun 25, 2026, 7:00 AM New York time
    sections: [
      {
        key: 'class2.outcomes',
        html: `<div class="outcomes"><span class="outcomes-h">By the end of today you'll be able to…</span> put your app on the internet with a shareable link — <strong>and give it a memory, so it remembers things even after you close the tab.</strong></div>`,
      },
      {
        key: 'class2.goal',
        html: `<p class="lead">Goal: take the app on your computer, put it on the real internet, and connect it to a database so your data is saved in the cloud.</p>`,
      },
      {
        key: 'class2.agenda',
        html: `
          <h3>Agenda <span class="dur">90 min</span></h3>
          <ul class="agenda">
            <li><span class="t">0:00</span> Recap — today we go live <em>and</em> give the app a memory</li>
            <li><span class="t">0:08</span> The stack in plain English: Claude Code (builds it), GitHub (saves every version), Vercel (publishes it), Supabase (remembers your data)</li>
            <li><span class="t">0:20</span> GitHub: connect your project, first push</li>
            <li><span class="t">0:35</span> Vercel: connect the repo, deploy, get a live URL</li>
            <li><span class="t">0:48</span> The loop: edit with Claude → push → it auto-deploys</li>
            <li><span class="t">0:55</span> Supabase: what a database is, make a free project + one table</li>
            <li><span class="t">1:10</span> Connect it: one simple save — refresh the page, your data's still there 🎉</li>
            <li><span class="t">1:22</span> Recap + homework</li>
          </ul>
        `,
      },
      {
        key: 'class2.stack',
        html: `
          <h3>The four tools</h3>
          <ul>
            <li><strong>Claude Code</strong> — writes &amp; edits your app <em>(you already know this one)</em>.</li>
            <li><strong>GitHub</strong> — stores your project online, keeps every version.</li>
            <li><strong>Vercel</strong> — turns your project into a live website automatically.</li>
            <li><strong>Supabase</strong> — a database in the cloud: it <em>remembers</em> your data so it's not lost on refresh.</li>
          </ul>
          <p>Together: you change code → <code>push</code> to GitHub → Vercel publishes it → Supabase remembers your data. Magic loop.</p>
          <p class="metaphor">🔑 Think of a <strong>bakery</strong>: Claude Code is the baker, GitHub is the recipe archive
          (every version saved), Vercel is the shop window where customers see what you made, and
          <strong>Supabase is the order book</strong> — every order written down so nothing's ever forgotten.</p>
          <p class="hint">A beginner-friendly truth: <strong>you don't write database code</strong>. You tell Claude what you want saved, and it wires Supabase up for you.</p>
          <p class="hint">🔒 Safety: your database has a secret key. <strong>It never goes in your code</strong> — Claude helps you paste it into Vercel's settings.</p>
        `,
      },
      {
        key: 'class2.try',
        html: `
          <h3>Prompt starters — copy &amp; paste 🗣️</h3>
          <pre class="cmd prompt"><code>Help me put this project on GitHub. Walk me through each step.</code></pre>
          <pre class="cmd prompt"><code>Now deploy it to Vercel and give me the live link.</code></pre>
          <pre class="cmd prompt"><code>Connect this app to Supabase so my to-do items are saved and still there after I refresh.</code></pre>
          <pre class="cmd prompt"><code>The save isn't working. Here's the error: [paste it here]. What do I do?</code></pre>
        `,
      },
      {
        key: 'class2.success',
        html: `
          <h3>What success looks like</h3>
          <p>When your push works, you'll see something like this in the terminal:</p>
          <div class="term-mock"><div class="term-bar"><span></span><span></span><span></span></div><pre>$ git push
Enumerating objects: 5, done.
To github.com:you/my-app.git
   a1b2c3d..e4f5g6h  main -> main  <span class="ok">✓</span></pre></div>
          <p>And Vercel will show a green success once it's live:</p>
          <div class="term-mock"><div class="term-bar"><span></span><span></span><span></span></div><pre><span class="ok">✓ Deployment Ready</span>
Production: https://my-app.vercel.app</pre></div>
          <p class="hint">Seeing those? You just put something on the internet. 🎉</p>
        `,
      },
      {
        key: 'class2.homework',
        html: `
          <h3>Homework</h3>
          <ul class="todo" data-checklist="class2">
            <li>Get your app live on a Vercel URL</li>
            <li>Connect it to Supabase so your data survives a refresh</li>
            <li>Add one thing you want it to remember, and share your live link</li>
          </ul>
        `,
      },
    ],
  },

  class3: {
    title: 'Class 3 — Power-Ups',
    nav: 'Class 3',
    unlock: '2026-07-16T11:00:00Z', // Thu Jul 16, 2026, 7:00 AM New York time
    sections: [
      {
        key: 'class3.outcomes',
        html: `<div class="outcomes"><span class="outcomes-h">By the end of today you'll be able to…</span> add real <strong>power-ups</strong> to your app — connect outside services, import data, save settings, and even run tasks automatically.</div>`,
      },
      {
        key: 'class3.goal',
        html: `<p class="lead">Goal: level up the app you already have. Pick one or two power-ups that fit what you're building, and wire them in with Claude.</p>`,
      },
      {
        key: 'class3.agenda',
        html: `
          <h3>Agenda <span class="dur">90 min</span></h3>
          <ul class="agenda">
            <li><span class="t">0:00</span> Recap + today: bolt power-ups onto your app</li>
            <li><span class="t">0:08</span> The power-up menu — what each one is &amp; when you'd want it</li>
            <li><span class="t">0:20</span> Pick the power-up(s) that fit your app</li>
            <li><span class="t">0:26</span> Set up <strong>memory</strong> — give Claude a CLAUDE.md so it remembers your project across sessions</li>
            <li><span class="t">0:34</span> Build power-up #1 with Claude, step by step</li>
            <li><span class="t">0:55</span> Test &amp; debug — open the inspector, read the red errors, paste them to Claude</li>
            <li><span class="t">1:05</span> Push &amp; deploy</li>
            <li><span class="t">1:12</span> Stretch: add a second power-up</li>
            <li><span class="t">1:22</span> Wrap + Showcase + where to go next</li>
          </ul>
          <p class="hint">This is the most technical class — but <strong>Claude writes the code</strong>. Your job is the ideas and the steps, not memorising syntax.</p>
        `,
      },
      {
        key: 'class3.ideas',
        html: `
          <h3>The power-up menu</h3>
          <p>You don't need them all — add the ones your app actually needs.</p>
          <ul class="powerups">
            <li><strong>🔌 API keys</strong> — connect your app to an outside service (AI, weather, maps). The key is your secret pass; it lives in Vercel's settings, never in your code.</li>
            <li><strong>⚙️ Settings</strong> — let users change how the app behaves (themes, options, preferences) and remember those choices.</li>
            <li><strong>📄 Parse a CSV</strong> — let people upload a spreadsheet and pull the rows into your app (a contact list, expenses, a roster).</li>
            <li><strong>⏰ Crons</strong> — make your app do something automatically on a timer: a daily summary, a nightly cleanup, a weekly digest. Runs even when nobody's looking.</li>
            <li><strong>📝 Note-taking</strong> — add a notes panel where you can jot, edit, and save text — handy for journals, meeting notes, or scratch ideas. Saves to your database so notes are there next time.</li>
            <li><strong>…and more</strong> — search &amp; filter, export to CSV/PDF, notifications. Ask Claude what fits.</li>
          </ul>
          <p class="metaphor">🔑 Power-ups are like <strong>kitchen gadgets</strong> for the bakery: a phone line to a supplier (API), a custom-order form (settings), a bulk-ingredient intake (CSV), and a timer that fires up the ovens at 5am every day (cron). Add the ones your shop needs.</p>
        `,
      },
      {
        key: 'class3.try',
        html: `
          <h3>Prompt starters — copy &amp; paste 🗣️</h3>
          <pre class="cmd prompt"><code>Which of these power-ups makes the most sense for my app? Here's what it does: [describe it].</code></pre>
          <pre class="cmd prompt"><code>I want to add an AI/weather/maps feature. Help me get an API key, store it safely in Vercel, and call it from a serverless function.</code></pre>
          <pre class="cmd prompt"><code>Add a settings panel where I can change [theme / options], and remember my choices.</code></pre>
          <pre class="cmd prompt"><code>Let me upload a CSV file and show its rows in my app. Walk me through it.</code></pre>
          <pre class="cmd prompt"><code>Set up a scheduled job that runs once a day and [does X]. Explain how crons work on Vercel.</code></pre>
          <pre class="cmd prompt"><code>Here's the red error from the browser inspector: [paste it]. What's wrong and how do I fix it?</code></pre>
        `,
      },
      {
        key: 'class3.debug',
        html: `
          <h3>Stuck? Open the inspector 🔍</h3>
          <p>When a power-up doesn't work, your browser has a built-in tool that shows you <em>why</em>: the <strong>inspector</strong> (also called DevTools).</p>
          <ol class="steps">
            <li><strong>Open it:</strong> right-click the page → <em>Inspect</em> (or press <code>⌥⌘I</code> on Mac / <code>F12</code> on Windows).</li>
            <li><strong>Click the <em>Console</em> tab.</strong> That's where the app reports problems.</li>
            <li><strong>Look for red text.</strong> Red = an error. That message is your clue.</li>
            <li><strong>Copy the whole red message</strong> and paste it to Claude — you don't need to understand it yourself.</li>
          </ol>
          <p class="metaphor">🔑 The inspector is like <strong>lifting the hood of a car</strong>: you don't have to be a mechanic, but you can read the warning light and tell the mechanic (Claude) exactly what it says.</p>
          <p class="hint">Tip: errors often point to a line or a word — paste that context too. The more Claude sees, the faster the fix.</p>
        `,
      },
      {
        key: 'class3.homework',
        html: `
          <h3>Keep going</h3>
          <ul class="todo" data-checklist="class3">
            <li>Add at least one power-up and deploy it</li>
            <li>Keep any API keys in Vercel's settings, <strong>not</strong> in your code</li>
            <li>Add your upgraded app to the Showcase</li>
            <li>Try a second power-up you didn't think you could pull off</li>
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

  showcase: {
    title: 'Showcase',
    nav: 'Showcase',
    sections: [
      {
        key: 'showcase.intro',
        html: `
          <p class="lead">Shipped something? Add it here so the whole class can see what you built. 🎉</p>
          <p class="hint">Paste your <strong>live</strong> project link — your <strong>Vercel</strong> (<code>…vercel.app</code>) or <strong>GitHub Pages</strong> (<code>…github.io</code>) URL — and your name. It shows up for everyone instantly.</p>
          <p class="metaphor">⚠️ Use your <strong>live</strong> link, not a <code>localhost</code> address. A <code>localhost</code> link only works on <em>your</em> computer — nobody else can open it.</p>
        `,
      },
    ],
  },

  reference: {
    title: 'Glossary',
    nav: 'Glossary',
    sections: [
      {
        key: 'reference.intro',
        html: `<p class="lead">Every word you'll hear in class, in plain English — each with a metaphor to make it stick, and a link to learn more. Terms are sorted into <strong>101&nbsp;Novice</strong>, <strong>201&nbsp;Intermediate</strong>, and <strong>301&nbsp;Expert</strong> — tap a level to focus, or search to find anything fast.</p>`,
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
              <div><p>Nope. Keep the <a href="#/reference">Glossary</a> open and copy-paste. You'll remember the handful you use most without trying.</p></div>
            </details>
          </div>
        `,
      },
    ],
  },

  help: {
    title: 'Stuck? Start here',
    nav: 'Stuck?',
    sections: [
      {
        key: 'help.intro',
        html: `<p class="lead">Everyone gets stuck — it's part of building, not a sign you're doing it wrong. Here's how to get unstuck fast.</p>`,
      },
      {
        key: 'help.first',
        html: `
          <h3>Try these first (in order)</h3>
          <ol class="path">
            <li><strong>Tell Claude what's wrong, in plain English.</strong> "That button doesn't do anything — fix it." It will try again.</li>
            <li><strong>Ask Claude to explain.</strong> "What did that do, and why didn't it work?" Understanding the problem usually solves it.</li>
            <li><strong>Ask Claude</strong> (the helper in the corner) about any word or step on this hub.</li>
          </ol>
        `,
      },
      {
        key: 'help.situations',
        html: `
          <h3>Common situations</h3>
          <div class="faq">
            <details class="faq-item"><summary>"command not found" / "not recognized"</summary>
              <div><p>Your computer doesn't know where the tool is yet. See the PATH fix on the <a href="#/setup">Setup</a> page — and remember to close and reopen your terminal afterward.</p></div></details>
            <details class="faq-item"><summary>Claude changed something I didn't want</summary>
              <div><p>Just say: "undo that last change." If it already saved, <strong>git</strong> is your time machine — ask "use git to go back to before that change."</p></div></details>
            <details class="faq-item"><summary>There's a scary red error message</summary>
              <div><p>Copy the whole error and paste it to Claude with: "I got this error — what does it mean and how do I fix it?" Red text is normal; it's just the computer asking for help.</p></div></details>
            <details class="faq-item"><summary>My app looks broken / blank</summary>
              <div><p>Tell Claude exactly what you see ("the page is blank", "the button overlaps the text"). The more specific you are, the faster the fix.</p></div></details>
            <details class="faq-item"><summary>I'm totally lost</summary>
              <div><p>That's okay. Go back to the <a href="#/overview">Overview</a>, check "what's next," and take the very next small step. Or ask your instructor — that's what they're here for.</p></div></details>
          </div>
        `,
      },
      {
        key: 'help.reassure',
        html: `<p class="metaphor">🔑 Remember: you <strong>can't break your computer</strong>, and almost everything is undoable with git. Experimenting and fixing is exactly how you learn fastest.</p>`,
      },
    ],
  },
};

// Reference: flat list of {cat, level, term, def, url, example?, meta?} —
// rendered grouped by LEVEL (101 novice / 201 intermediate / 301 expert), with
// the topical `cat` shown as a chip, filterable by level pills + the search box.
// `level` is 101 | 201 | 301. `url` points to a plain-English "learn more" page.
export const REFERENCE = [
  // ── Terminal & Git ──
  { cat: 'Terminal & Git', level: 101, term: 'terminal', def: 'The text window where you type commands instead of clicking buttons.', meta: 'Like texting your computer directly instead of using buttons.', url: 'https://en.wikipedia.org/wiki/Terminal_emulator' },
  { cat: 'Terminal & Git', level: 101, term: 'bash', def: 'The most common "language" you type into a terminal to give commands.', ex: 'ls', meta: 'The everyday phrases your terminal understands.', url: 'https://en.wikipedia.org/wiki/Bash_(Unix_shell)' },
  { cat: 'Terminal & Git', level: 101, term: 'files & folders', def: 'The documents (files) and the labelled drawers (folders) your project is made of.', meta: 'A filing cabinet for your project.', url: 'https://en.wikipedia.org/wiki/Computer_file' },
  { cat: 'Terminal & Git', level: 101, term: 'git', def: 'The tool that saves snapshots of your project so you can go back in time and never lose work.', meta: 'A time machine with infinite save points, like a video game.', url: 'https://en.wikipedia.org/wiki/Git' },
  { cat: 'Terminal & Git', level: 101, term: 'repo (repository)', def: 'A project folder that git is keeping track of.', meta: 'A scrapbook that remembers every page you ever glued in.', url: 'https://en.wikipedia.org/wiki/Repository_(version_control)' },
  { cat: 'Terminal & Git', level: 101, term: 'commit', def: 'A saved snapshot of your changes, with a short note describing them.', meta: 'A save point with a sticky-note saying what you did.', url: 'https://en.wikipedia.org/wiki/Commit_(version_control)' },
  { cat: 'Terminal & Git', level: 101, term: 'push', def: 'Upload your saved changes (commits) from your computer to GitHub.', meta: 'Mailing your latest draft to the shared cloud.', url: 'https://docs.github.com/en/get-started/using-git/pushing-commits-to-a-remote-repository' },
  { cat: 'Terminal & Git', level: 201, term: 'pull', def: 'Download the latest changes from GitHub down to your computer.', meta: 'Checking the mailbox for everyone else\'s updates.', url: 'https://github.com/git-guides/git-pull' },
  { cat: 'Terminal & Git', level: 201, term: 'clone', def: 'Make a copy of a project from GitHub onto your own computer.', meta: 'Photocopying someone\'s notebook to write in your own copy.', url: 'https://github.com/git-guides/git-clone' },
  { cat: 'Terminal & Git', level: 201, term: 'branch', def: 'A parallel copy of your project so you can try things without breaking the main one.', meta: 'A "what if?" sandbox next to your real sandcastle.', url: 'https://en.wikipedia.org/wiki/Branching_(version_control)' },
  { cat: 'Terminal & Git', level: 201, term: 'main', def: 'The primary, "official" branch of your project — the real version everyone builds from.', meta: 'The master copy of the script everyone acts from.', url: 'https://git-scm.com/book/en/v2/Git-Branching-Branches-in-a-Nutshell' },
  { cat: 'Terminal & Git', level: 201, term: 'checkout', def: 'Switch which branch you\'re currently working on.', meta: 'Changing which TV channel you\'re watching.', url: 'https://git-scm.com/docs/git-checkout' },
  { cat: 'Terminal & Git', level: 201, term: 'curl', def: 'A command that grabs things from the internet right in the terminal — files, web pages, APIs.', meta: 'A fishing rod that reels in things from the web.', url: 'https://en.wikipedia.org/wiki/CURL' },
  { cat: 'Terminal & Git', level: 201, term: 'cron', def: 'A scheduler that runs a command automatically on a timetable — like "every night at 2am".', meta: 'An alarm clock for tasks.', url: 'https://en.wikipedia.org/wiki/Cron' },
  { cat: 'Terminal & Git', level: 201, term: '.gitignore', def: 'A list telling git which files to never save — like secrets or junk it should skip.', meta: 'A "do not pack" list for your suitcase.', url: 'https://git-scm.com/docs/gitignore' },
  { cat: 'Terminal & Git', level: 201, term: 'PATH', def: 'The list of folders your terminal searches to find a command like claude.', meta: 'The terminal\'s address book for tools.', url: 'https://en.wikipedia.org/wiki/PATH_(variable)' },
  { cat: 'Terminal & Git', level: 301, term: 'hook', def: 'Code that runs automatically when something happens — e.g. right before you save your work.', meta: 'A trip-wire: cross it and something fires automatically.', url: 'https://docs.claude.com/en/docs/claude-code/hooks' },
  { cat: 'Terminal & Git', level: 301, term: 'pull request (PR)', def: 'A proposal to merge your branch\'s changes into main, so they can be reviewed first.', meta: 'Asking "can we add my chapter to the book?" before it\'s printed.', url: 'https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests' },
  { cat: 'Terminal & Git', level: 301, term: 'remote / origin', def: 'The cloud copy of your project (usually on GitHub). "origin" is its nickname.', meta: 'The home base your laptop syncs with.', url: 'https://git-scm.com/book/en/v2/Git-Basics-Working-with-Remotes' },
  { cat: 'Terminal & Git', level: 301, term: 'merge', def: 'Combine the changes from one branch into another.', meta: 'Blending two recipe drafts into one final dish.', url: 'https://git-scm.com/docs/git-merge' },
  { cat: 'Terminal & Git', level: 301, term: 'squash', def: 'Tidy up by combining several small commits into one clean commit.', meta: 'Rolling many scribbled notes into one neat summary.', url: 'https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/about-pull-request-merges' },
  { cat: 'Terminal & Git', level: 301, term: 'rebase', def: 'Replay your changes on top of the latest main for a tidy, straight history.', meta: 'Re-shooting your scene so it cuts in cleanly.', url: 'https://git-scm.com/docs/git-rebase' },
  { cat: 'Terminal & Git', level: 301, term: 'stash', def: 'Temporarily shelve unfinished changes so you can switch tasks, then bring them back.', meta: 'Sweeping your desk into a drawer to clear space.', url: 'https://git-scm.com/docs/git-stash' },

  // ── Building blocks ──
  { cat: 'Building blocks', level: 101, term: 'HTML', def: 'The building blocks of a web page — the text, buttons, and boxes you see.', meta: 'The LEGO bricks a web page is built from.', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML' },
  { cat: 'Building blocks', level: 101, term: 'CSS', def: 'The styling that makes a web page look good — colours, spacing, fonts.', meta: 'The paint and furniture for your HTML house.', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS' },
  { cat: 'Building blocks', level: 101, term: 'app', def: 'A program you use to do something — on the web, in your browser.', meta: 'A tool, like a hammer, but it lives on a screen.', url: 'https://en.wikipedia.org/wiki/Web_application' },
  { cat: 'Building blocks', level: 101, term: 'localhost', def: 'Your own computer pretending to be a website, just for you, while you build.', meta: 'A dress rehearsal before opening night.', url: 'https://en.wikipedia.org/wiki/Localhost' },
  { cat: 'Building blocks', level: 101, term: 'deploy', def: 'Put your app on the internet so other people can open it.', meta: 'Opening night — the doors open to the public.', url: 'https://en.wikipedia.org/wiki/Software_deployment' },
  { cat: 'Building blocks', level: 201, term: 'JavaScript', def: 'The language that makes web pages do things — respond to clicks, update live.', meta: 'The electricity that makes the house\'s switches work.', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript' },
  { cat: 'Building blocks', level: 201, term: 'JSON', def: 'A simple text format apps use to pass data around.', ex: '{ "name": "Ed", "tasks": 3 }', meta: 'A labelled lunchbox: each thing has a name and a value.', url: 'https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/JSON' },
  { cat: 'Building blocks', level: 201, term: 'API', def: 'A way for apps to talk to each other and request information.', meta: 'A waiter who takes your order to the kitchen and brings food back.', url: 'https://en.wikipedia.org/wiki/API' },
  { cat: 'Building blocks', level: 201, term: 'environment variable', def: 'A secret or setting (like an API key) stored outside your code so it stays private.', meta: 'A house key hidden under the mat, not taped to the front door.', url: 'https://en.wikipedia.org/wiki/Environment_variable' },
  { cat: 'Building blocks', level: 201, term: 'framework', def: 'A ready-made starter kit that does the boring parts for you (e.g. Next.js).', meta: 'A meal kit: ingredients prepped, you just cook.', url: 'https://en.wikipedia.org/wiki/Software_framework' },
  { cat: 'Building blocks', level: 201, term: 'package / dependency', def: 'Pre-written code your project borrows and uses.', meta: 'A store-bought sauce instead of making it from scratch.', url: 'https://docs.npmjs.com/about-packages-and-modules' },
  { cat: 'Building blocks', level: 201, term: 'npm', def: 'The tool that installs packages into your project.', meta: 'The grocery delivery service for code.', url: 'https://en.wikipedia.org/wiki/Npm_(software)' },
  { cat: 'Building blocks', level: 201, term: 'database', def: 'An organized store for your app\'s information so it\'s there next time.', meta: 'A super-powered spreadsheet your app reads and writes.', url: 'https://en.wikipedia.org/wiki/Database' },
  { cat: 'Building blocks', level: 301, term: 'serverless function', def: 'A small piece of backend code that runs on demand without you managing a server.', meta: 'A vending machine: it springs to life only when someone presses the button.', url: 'https://en.wikipedia.org/wiki/Serverless_computing' },
  { cat: 'Building blocks', level: 301, term: 'webhook', def: 'An automatic message one app sends another the moment something happens.', meta: 'A doorbell that rings the other app for you.', url: 'https://en.wikipedia.org/wiki/Webhook' },

  // ── Vibe coding ──
  { cat: 'Vibe coding', level: 101, term: 'vibe coding', def: 'Building software by describing what you want in plain English and letting AI write the code.', meta: 'Being the director; the AI is your film crew.', url: 'https://en.wikipedia.org/wiki/Vibe_coding' },
  { cat: 'Vibe coding', level: 101, term: 'Claude Code', def: 'Claude with hands — it edits your real files and runs commands, not just chat.', meta: 'The chat you know, but it can actually build.', url: 'https://docs.claude.com/en/docs/claude-code/overview' },
  { cat: 'Vibe coding', level: 101, term: 'prompt', def: 'What you type to the AI to tell it what you want.', meta: 'Your order at the counter — clearer order, better result.', url: 'https://en.wikipedia.org/wiki/Prompt_engineering' },
  { cat: 'Vibe coding', level: 101, term: 'model', def: 'The specific AI brain you\'re using — e.g. Opus, Sonnet, Haiku.', meta: 'Different engines: a sports car vs. an economy car.', url: 'https://docs.claude.com/en/docs/about-claude/models/overview' },
  { cat: 'Vibe coding', level: 201, term: 'context', def: 'Everything the AI currently remembers in your conversation.', meta: 'The AI\'s short-term memory — its desk space.', url: 'https://docs.claude.com/en/docs/build-with-claude/context-windows' },
  { cat: 'Vibe coding', level: 201, term: 'token', def: 'The little chunks of text AI reads and writes; your usage is measured in tokens.', meta: 'Syllables of thought — the AI is billed by the syllable.', url: 'https://en.wikipedia.org/wiki/Large_language_model' },
  { cat: 'Vibe coding', level: 201, term: 'CLAUDE.md', def: 'A notes file in your project that tells Claude how you like to work — its memory.', meta: 'A briefing sheet Claude reads before every job.', url: 'https://docs.claude.com/en/docs/claude-code/memory' },
  { cat: 'Vibe coding', level: 201, term: 'frontend / backend', def: 'The part you see and click vs. the part that works behind the scenes.', meta: 'The dining room vs. the kitchen of a restaurant.', url: 'https://en.wikipedia.org/wiki/Frontend_and_backend' },
  { cat: 'Vibe coding', level: 201, term: 'rate limit', def: 'A cap on how many requests you can make in a window, so a service isn\'t overwhelmed.', meta: 'A "take a number" line at the deli.', url: 'https://en.wikipedia.org/wiki/Rate_limiting' },
  { cat: 'Vibe coding', level: 301, term: 'MCP', def: 'A way to plug extra tools and data into Claude (stands for Model Context Protocol).', meta: 'USB ports for the AI — plug in new superpowers.', url: 'https://modelcontextprotocol.io/' },
  { cat: 'Vibe coding', level: 301, term: 'subagent', def: 'A helper Claude spins up to handle a side task on its own, then report back.', meta: 'Delegating a chore to an assistant so you keep your focus.', url: 'https://docs.claude.com/en/docs/claude-code/sub-agents' },

  // ── Tools & services ──
  { cat: 'Tools & services', level: 101, term: 'GitHub', def: 'The website where your projects (repos) live in the cloud and others can see them.', meta: 'Google Drive for code.', url: 'https://en.wikipedia.org/wiki/GitHub' },
  { cat: 'Tools & services', level: 101, term: 'VS Code', def: 'A popular free code editor — a nicer window for viewing and editing your files.', meta: 'A word processor built for code.', url: 'https://code.visualstudio.com/docs' },
  { cat: 'Tools & services', level: 101, term: 'Vercel', def: 'A service that puts your app online (deploys it) with one push to GitHub.', meta: 'The printing press that publishes your site to the web.', url: 'https://vercel.com/docs' },
  { cat: 'Tools & services', level: 201, term: 'Supabase', def: 'A ready-made backend: a database, logins, and storage your app can use.', meta: 'A backend-in-a-box so you don\'t build one from scratch.', url: 'https://supabase.com/docs' },
  { cat: 'Tools & services', level: 301, term: 'RLS (row-level security)', def: 'Database rules deciding who is allowed to see or change each row of data.', meta: 'A bouncer checking IDs at every table.', url: 'https://supabase.com/docs/guides/database/postgres/row-level-security' },

  // ── Claude Code commands ──
  { cat: 'Claude Code commands', level: 101, term: '/clear', def: 'Start a fresh conversation — wipes the current context.', url: 'https://docs.claude.com/en/docs/claude-code/slash-commands' },
  { cat: 'Claude Code commands', level: 101, term: '/help', def: 'List the available commands.', url: 'https://docs.claude.com/en/docs/claude-code/slash-commands' },
  { cat: 'Claude Code commands', level: 101, term: '/config', def: 'Open Claude Code\'s settings.', url: 'https://docs.claude.com/en/docs/claude-code/slash-commands' },
  { cat: 'Claude Code commands', level: 101, term: '/model', def: 'Switch which AI model you\'re using.', url: 'https://docs.claude.com/en/docs/claude-code/slash-commands' },
  { cat: 'Claude Code commands', level: 101, term: '/usage', def: 'Check your usage and limits.', url: 'https://docs.claude.com/en/docs/claude-code/slash-commands' },
  { cat: 'Claude Code commands', level: 201, term: '/compact', def: 'Summarize the conversation to save space instead of wiping it.', url: 'https://docs.claude.com/en/docs/claude-code/slash-commands' },
  { cat: 'Claude Code commands', level: 201, term: '/context', def: 'See how much of the context window you\'re currently using.', url: 'https://docs.claude.com/en/docs/claude-code/slash-commands' },
  { cat: 'Claude Code commands', level: 201, term: '/init', def: 'Create a CLAUDE.md file that documents your project for Claude.', url: 'https://docs.claude.com/en/docs/claude-code/slash-commands' },
  { cat: 'Claude Code commands', level: 201, term: '! (prefix)', def: 'Run a shell command directly from the prompt.', ex: '! ls', url: 'https://docs.claude.com/en/docs/claude-code/slash-commands' },
  { cat: 'Claude Code commands', level: 301, term: 'statusline', def: 'The customizable info bar at the bottom of Claude Code.', url: 'https://docs.claude.com/en/docs/claude-code/statusline' },
  { cat: 'Claude Code commands', level: 301, term: '/agents', def: 'Create and manage subagents — specialized helpers for specific kinds of work.', url: 'https://docs.claude.com/en/docs/claude-code/sub-agents' },
  { cat: 'Claude Code commands', level: 301, term: '/mcp', def: 'Connect and manage MCP servers that give Claude extra tools.', url: 'https://docs.claude.com/en/docs/claude-code/mcp' },
];

// Student roster (seed order = the first cohort draw). The 🎲 reshuffles these.
export const ROSTER = [
  'Richard D.', 'Tiff N.', 'Lizzie M', 'Stefi P',
  'Kevyn K', 'Robin H', 'Yu T', 'Ryu N',
  'Zoe M', 'Jineen C', 'Ian F', 'Hayley M',
  'Joshua E', 'Gianfranco L', 'Christina K', 'Vale P',
  'Ross M.', 'Anna T.',
  'Hugh F.', 'Dennis B.', 'Berna Y.',
  'Olivia N.',
];
export const COHORT_SIZE = 4;

// Order pages appear in the nav.
export const NAV_ORDER = ['overview', 'setup', 'class1', 'class2', 'class3', 'cohorts', 'showcase', 'reference', 'faq'];
