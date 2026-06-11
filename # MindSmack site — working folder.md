# MindSmack site — working folder

A self-contained marketing site. No build step, no dependencies — `index.html` opens directly in a browser.

## Files
- `index.html` — the home page (enhanced v2).
- `index_v1_backup.html` — original first draft, for reference.
- `CLAUDE.md` — design constitution. Claude Code reads this automatically to stay on-brand.
- `README.md` — this file.

## See it
Double-click `index.html`, or from this folder run a tiny local server so links/fonts behave:
```
python3 -m http.server 8000
```
Then open http://localhost:8000

---

## Setting up Claude Code (the design-polish loop)

Claude Code runs in your terminal (or as a desktop app) on this actual folder, so you can prompt small changes and see them live instead of regenerating the whole file.

**1. Install** (native installer — no Node.js needed):
- macOS / Linux: `curl -fsSL https://claude.ai/install.sh | bash`
- Windows PowerShell: `irm https://claude.ai/install.ps1 | iex`

(Requires a paid Claude plan — Pro, Max, Team, or Console. Prefer not to use a terminal? There's a desktop app version too.)

**2. Run it** from inside this folder:
```
cd path/to/mindsmack
claude
```
Authenticate in the browser when prompted. That's it.

**3. Keep a preview open** — run the `http.server` command above in a second terminal tab, and refresh the browser after each change.

---

## Starter prompts to try

Design touches:
- "Add a faint hairline circuit illustration behind the Capabilities section, same vocabulary as the hero arc — keep it under 0.4 opacity."
- "Give the two wedge cards a subtle teal glow on hover, very restrained."
- "The orchestration panel — make the lit nodes gently pulse on a loop, respecting reduced-motion."

Build-out:
- "Create devops.html — clone index.html's structure but make it a dedicated DevOps landing page. Reuse every token and class. Lead with the Cloud & DevOps wedge content."
- "Create qa.html the same way for Quality Engineering."

Wiring:
- "Replace the cal.com placeholder link everywhere with <your real URL>."
- "Wire the brief form to <Formspree / webhook / inbox> — ask me for the endpoint."

Content:
- "Tighten the hero subhead to one sentence, keep the voice."
- (You'll confirm final wording before launch — tell Claude Code your edits and it'll apply them in place.)

---

## Before launch — checklist
- [ ] Real cal.com booking URL swapped in (currently `cal.com/mindsmack/intro`)
- [ ] Brief form connected to a real endpoint
- [ ] Final copy confirmed (you wanted to sign off on wording)
- [ ] Interior pages built if you want them (DevOps / QA)
- [ ] Quick pass on mobile width