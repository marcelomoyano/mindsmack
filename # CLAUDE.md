# CLAUDE.md — MindSmack Site

This file tells you (Claude Code) how to work on this project so design edits stay on-brand and don't drift. Read it before making visual changes.

## What this is

The MindSmack marketing site. MindSmack is an agency that has been building software since 1999 — websites, mobile apps, applications. The revamp pushes a new offer: **DevOps & QA** as the entry-point services, backed by **AI orchestration / augmented-intelligence** delivery. The brand voice is confident and a little gritty ("we smack out projects," "we know the hard stuff, we're not improvising") — NOT a whisper-quiet frontier-lab. Keep the teeth.

The primary conversion action is **booking a call** (cal.com), with a **brief form** as the backup.

## Files

- `index.html` — the home page. Self-contained: CSS in `<style>`, JS at the bottom. No build step.
- `index_v1_backup.html` — the very first version, kept for reference. Don't edit.
- Interior pages (when they exist): `devops.html`, `qa.html` — should reuse the exact same `:root` tokens and component classes.

## Design system — the rules

These are derived from the brand, with disciplined touches borrowed from the xAI/Grok "cosmic void" style (hairline structure, atmospheric glow, mono-as-metadata) but recolored and kept warmer. **When in doubt, change tokens — not hardcoded values.**

### Colors (all defined as CSS variables in `:root`)
- `--ink` `#0B0E14` — page canvas. The base everything floats on.
- `--ink-2` `#11161F` — alternating section background.
- `--panel` `#151B26` — card fills.
- `--line` / `--line-soft` — hairline borders. Structure comes from 1px borders, NOT shadows.
- `--signal` `#4DE0C8` — the ONE accent (signal-teal). Used with restraint: eyebrows, key words, active states, the arc illustration. Do not flood the page with it.
- `--signal-dim` `#2A8C7E` — quieter teal for brackets, secondary marks.
- `--paper` / `--paper-dim` / `--fog` / `--fog-2` — text tiers, brightest to most muted.
- `--horizon` — atmospheric teal wash gradient, used ONLY as the footer glow. Don't repeat it as a section background.

### Type
- Display: **Space Grotesk** (headlines). Weight 600 is the brand weight — keep it. Do NOT drop to all-400; that mutes the voice.
- Body: **Inter**.
- Mono: **JetBrains Mono** — used for "technical metadata": eyebrows, captions, stats labels, `// console-style` notes.
- Big display type uses tight tracking (around -0.038em) to pull letters into a solid mass.

### Eyebrows
Bracketed mono, uppercase, teal: renders as `[ LIKE THIS ]`. The brackets come from `.eyebrow::before/::after` — just write the text inside `<span class="eyebrow">`.

### Shape & structure
- Card radius: `--r` (14px). Keep the soft radius — it's friendlier than zero-radius and on-brand for an agency. (This is a deliberate departure from the xAI reference, which uses 0px. Don't "correct" it.)
- Separate things with hairline borders and the animated `.sync` divider line, not drop shadows.
- Section rhythm: `.pad` = 96px vertical. Big whitespace is intentional.

### Motion
- Subtle only. Scroll reveals (`.reveal` + IntersectionObserver), the traveling `.sync` line, the pulsing brand dot, the marquee. All respect `prefers-reduced-motion` (see the media query — keep it that way).
- Don't add bouncy/flashy animation. Touches, not fireworks.

### Signature elements (the things that make this page memorable — protect them)
1. The **hero hairline arc** (`.hero-art` SVG) — concentric orbits + a signal arc sweeping to a glowing node. Reads as "a signal finding its path / orchestration."
2. The **orchestration status panel** in the AI section — a live control-room readout with "Human engineer — in control" lit up. This is the brand thesis made visual. Keep it.
3. The **footer horizon glow**.

## Quality floor (don't regress these)
- Responsive to mobile (~380px). Test narrow.
- Visible keyboard focus on all interactive elements.
- `prefers-reduced-motion` respected.
- Color contrast stays legible (muted text is muted, not invisible).

## Things to AVOID
- Don't paste back the original ExoMindset source copy verbatim — all service copy is deliberately reworded to avoid a duplicate-content fingerprint. Keep rewording in MindSmack's voice.
- Don't name specific past clients on the page (NDA / white-label). The "track record without logos" framing is intentional — it's a selling point, not a gap to fill.
- Don't add a logo wall.
- Don't introduce a second accent color. One signal color, used sparingly.
- Don't switch the whole page to weight-400 minimalism. Borrow the xAI *discipline*, not its mute.

## Common tasks & how to approach them
- "Add a custom background to section X" → prefer a subtle hairline SVG or a faint gradient using existing tokens. Match the hero-art / horizon vocabulary.
- "Build the QA interior page" → clone the structure of `index.html`, strip to QA content, reuse all tokens and classes. Lead with the QA wedge content already written in the QA card.
- "Wire up the form" → the `submitBrief()` function is a front-end stub. Connect to the user's chosen endpoint (cal.com webhook, Formspree, or their inbox). Never invent an endpoint — ask.
- "Change the cal.com link" → it's a placeholder `cal.com/mindsmack/intro`; search the file for it.

## Before you finish any visual change
Take a screenshot if you can, look at it, and remove one thing that isn't earning its place. Restraint is the brand.