# MindSmack — Design System & Build Guide

This repo is a marketing site for **MindSmack**, an agency shipping production software **since 1999**. The flagship artifact is `mindsmack-landing-v1.html` — a single, self-contained file (inline `<style>` + tiny vanilla `<script>`, Google Fonts, no build step). Treat that file as the source of truth; this document is the contract any new page, section, or edit must honor.

The aesthetic is **engineered, not decorative**: dark instrument-panel UI, one electric accent, hairlines instead of shadows, monospace where the system "talks to you." It should read like a tool built by people who run things in production — confident and a little gritty, **never whisper-quiet minimalism**.

---

## 1. Core Principles (read before editing)

1. **One accent, used sparingly.** `--signal` teal is the *only* chromatic color. It marks the live, the interactive, the "this matters." If everything is teal, nothing is — keep it scarce. No second accent hue, no gradients-as-decoration beyond the signature elements below.
2. **Structure with hairlines, not shadows.** Separation comes from 1px lines (`--line`, `--line-soft`), backgrounds stepping through the ink ramp, and dashed dividers. Avoid drop shadows / glows except where this doc explicitly sanctions them (the signature elements). No soft elevation, no material cards.
3. **Soft 14px radius, everywhere structural.** `--r: 14px` for cards/panels/bordered grids. Smaller controls use 8–10px (nav CTA 8px, buttons 10px, inputs 9px). Never go fully rounded except the small status dots/nodes (circles).
4. **Typography carries the brand.** Three families, each with a fixed job (§3). Headlines are tight, dense, slightly negative-tracked. Anything the machine says is mono.
5. **Motion is signal, not spectacle.** Subtle, purposeful, slow. The traveling sync line, the brand pulse, the marquee, scroll-reveal. All must respect `prefers-reduced-motion` (already wired globally).
6. **Production voice.** Copy is direct, earned, a touch defiant. "The hard parts, handled." "Still shipping." Keep the 1999 lineage and the under-NDA-discretion pride. Don't sand it down into generic SaaS politeness.

---

## 2. Color Tokens

All color lives in `:root` CSS variables. **Never hardcode hex** outside `:root` — extend the palette by adding a token, not inlining a value.

```
--ink:        #0B0E14   /* page background, primary dark */
--ink-2:      #11161F   /* raised bands, marquee strip, cap cells */
--panel:      #151B26   /* card surfaces (wedge, form) */
--line:       #243140   /* hairline borders (stronger) */
--line-soft:  #1B2430   /* hairline borders / dividers (quieter) */
--fog:        #8A97A8   /* muted body / list text */
--fog-2:      #5E6B7C   /* faintest text, captions, footer legal */
--paper:      #EDF1F6   /* primary text on dark */
--paper-dim:  #C5CEDA   /* secondary text, lead paragraphs */
--signal:     #4DE0C8   /* THE accent — teal. live/interactive/active */
--signal-dim: #2A8C7E   /* accent at rest: idle nodes, marquee dashes */
--warn:       #F2B24B   /* amber — held back; the ONLY sanctioned use is the hero sphere's warm rim (§6) */
--horizon:    linear-gradient(to top, rgba(77,224,200,0.10), rgba(77,224,200,0.03) 38%, transparent 70%)
              /* atmospheric teal wash — the footer glow (signature, §6) */
--bloom:      radial-gradient(ellipse 60% 65% at 88% 26%, rgba(77,224,200,0.16), rgba(77,224,200,0.05) 42%, transparent 72%)
              /* hero light-source bloom — glows in from the right (signature, §6) */
```

Both `--horizon` and `--bloom` are **adapted from the xAI design system** (the page's lineage), recolored to signal-teal — xAI's are the only sanctioned ambient glows there, and we hold the same restraint: glows live only in the hero bloom, the footer horizon, and the orchestration live-node / input focus ring. No glows elsewhere.

**Accent discipline:** `--signal` is for eyebrows, the active hero word, primary button fill, focus rings, live orchestration nodes, link hovers in the footer, and `::selection`. `--signal-dim` is the "at rest / queued / idle" state of the same idea. `--warn` is **not** general-purpose — its single sanctioned appearance is the warm rim of the hero sphere (§6), the one place the design admits a teal/warm duality. Don't introduce `--warn` anywhere else (no warning states, badges, or accents) without a deliberate decision.

The ink ramp (`--ink` → `--ink-2` → `--panel`) is how you create depth: step the background up one level for a raised surface instead of reaching for a shadow.

---

## 3. Typography

```
--display: 'Space Grotesk'   — headlines, brand, stats, card titles
--body:    'Inter'           — body copy, buttons, form fields
--mono:    'JetBrains Mono'  — eyebrows, tags, status, captions, "machine voice"
```

Loaded weights: Space Grotesk 400/500/600/700 · Inter 400/450/500/600 · JetBrains Mono 400/500.

**Space Grotesk** — display. **Headlines are 600** (the brand mark itself is the one 700). Always tight: `letter-spacing` between `-0.01em` and `-0.03em`, `line-height` 1.02–1.10. Hero h1 uses `font-weight: 600`, `clamp(2.6rem, 6vw, 5rem)`, `line-height: 1.02`, `letter-spacing: -0.025em`, capped at `max-width: 16ch` so it stacks into a dense block. Accented words inside headlines: wrap in `<em>` with `font-style: normal; color: var(--signal)`.

**JetBrains Mono** — the system's voice. Used for **bracketed eyebrows**, card tags, the marquee, orchestration rows, stat-free captions, form-section labels, and footer legal. The eyebrow pattern is signature: mono, 12px, `letter-spacing: 0.18em`, uppercase, teal, **wrapped in literal `[ ]` brackets** via `::before { content: "[" }` / `::after { content: "]" }` colored `--signal-dim` (8px inline-flex gap). The text sits inside the dim brackets like a terminal token. Reuse `.eyebrow` — don't reinvent it. Mono captions often lead with `//` (e.g. `// Opens cal.com · routed to a delivery lead`) to reinforce the terminal register.

**Inter** — body. 17px base, line-height 1.6. Secondary/lead text steps to `--paper-dim`; muted detail to `--fog`.

Type scale leans on `clamp()` for fluid headings — match existing clamps when adding sections rather than fixed px.

---

## 4. Layout & Spacing

- **`.wrap`** — `max-width: var(--maxw)` (1180px), centered, `padding: 0 28px`. Every content row lives in a `.wrap`.
- **`.pad`** — vertical section rhythm: `padding: 96px 0`. Use it for standard sections.
- **`.sec-head`** — section intro block: `max-width: 60ch`, `margin-bottom: 56px`, holds an `.eyebrow` + `h2` + lead `p`.
- **Grids** snap to `repeat(N, 1fr)` with ~22px gaps, collapsing to single column at `max-width: 860px` (the standard breakpoint; nav collapses at 800px). Honor these two breakpoints — don't invent new ones casually.
- **Bordered grids** (the capabilities block) use a 1px-gap technique: `gap: 1px; background: var(--line-soft)` so the cell gutters read as hairlines. Reuse this rather than per-cell borders.

---

## 5. Components (existing vocabulary — reuse before inventing)

- **Buttons** `.btn` + `.btn-primary` (teal fill, ink text) / `.btn-ghost` (hairline border). 10px radius, `font-weight: 600`. Primary hover lightens to `#6BEAD5`; `.arrow` nudges +3px on hover; `:active` drops 1px. Keep these interactions.
- **Cards** `.wedge-card` / `.form-card` — `--panel` bg, `--line-soft` border, `--r` radius. Hover: border brightens to `--line` and lifts `translateY(-3px)`. Corner index numerals (`.num`) in mono.
- **List markers** — `--signal` 7px square rotated 45° (a teal diamond), not bullets/checks.
- **Capabilities cells** `.cap` — flat ink-2 cells in the hairline-gap grid; hover steps bg to `--panel`.
- **Stats** `.stat` — left hairline rule + big Space Grotesk numeral (`--paper`) + mono-ish label (`--fog`). Used for the 1999 / 20+ / 100% / 24/7 proof row.
- **Process steps** `.step` — 2px top rule, mono step number in teal, display h4.
- **Form** dark `--ink` inputs, `--line` borders. Focus → `--signal` border **plus a soft 3px ambient ring** (`box-shadow: 0 0 0 3px rgba(77,224,200,0.15)`) — the one sanctioned input glow, adapted from xAI's focus ring.
- **Nav** — sticky, translucent ink with `backdrop-filter: blur(14px)`, bottom hairline. Pill CTA with mono label, border brightens to teal on hover.

---

## 6. Signature Elements — PROTECTED

These are the brand's recognizable moves. **Do not remove, restyle into something generic, or dilute them.** Refine carefully; replace only with deliberate intent.

1. **The hero arc + bloom** — `.hero-grid`: a 64px engineering grid (`--line-soft` lines) faded by a radial `mask-image` (`radial-gradient(ellipse 70% 60% at 70% 20%, …)`) so it arcs in from the top-right and dissolves. This off-center radial fade is the signature, not a full grid — keep the asymmetry. Beneath it, **`.hero::before` paints `--bloom`**, a teal light-source glow radiating from the right edge (paint order: bloom → grid → content; all `pointer-events: none`). The two layers read as one luminous corner. Keep them stacked and right-weighted; don't center the bloom. The diagonal signal path in `.hero-art` (`#heroLine`) carries **travelling pulses** — `.traveller` groups (a bright dot + faint halo) animated up the line toward the node via SVG `<animateMotion>`/`<mpath>`, fading in/out at the ends. SMIL isn't covered by the CSS reduced-motion guard, so the inline script **removes `.traveller` elements** under `prefers-reduced-motion`. The line sits *behind* the orb and shows through its transparent centre — a deliberate "signal passing through the glass" read; keep that layering.
2. **The hero organic sphere** — `#orbCanvas` inside `.hero-orb`: a real-time **WebGL** orb (our own Three.js build), right-weighted, layered over the arc/bloom and behind the headline. A high-detail icosahedron displaced by simplex noise in a vertex shader (normals recomputed from neighbours so the rim tracks the morph). It has two render modes, both pausing under `prefers-reduced-motion` (one static pose) and when the hero scrolls out of view:
   - **`glass`** — *the production default*. A solid dark glass ball (body ≈ `--ink`) with an internal **iridescent energy band** (blue→cyan→white→amber→red spectrum, waving over time), a soft rim light, and a glossy specular highlight — Siri-orb register, recolored so the warm end lands on brand. Opaque, so it occludes the signal line behind it.
   - **`ring`** — an **additive** fresnel rim: broad glow + white-hot edge, dark transparent interior so the hero (and the signal line) shows *through*. The `--signal` teal / `--warn` amber angular gradient lives here — the sanctioned teal+warm duality.

   Idle drift only (slow noise morph + gentle rotation). All tunables live in `orb.js` (`BASE` + `PRESETS`); see §9 for the `?style=` testing harness. **Legal note:** inspired by Bruno Simon's `organic-sphere` (UNLICENSED / all-rights-reserved) but contains **none of his code** — built from scratch on MIT Three.js + public-domain Ashima simplex noise. Do not paste in his source.
3. **The orchestration panel** — `.orch` + `.orch-row`: the live agent-pipeline readout (Orchestrator → agents → CI → **Human engineer · in control** → Deploy). `.live` rows get a teal node with `box-shadow: 0 0 12px var(--signal)` (this glow is *sanctioned here*); idle rows use `--signal-dim`. Dashed `--line-soft` row dividers. This is the literal picture of "AI-augmented, human-in-control" — it must stay legible and stay making that point.
4. **Footer glow** — the page closes warm, not flat, via an **explicit** rule: `footer::before` is a full-width absolutely-positioned layer (`height: 320px`, pinned to the bottom) painting `--horizon`, the atmospheric teal wash. The `footer` is `position: relative; overflow: hidden` and its `.wrap` sits `z-index: 1` above the glow. Reinforced by the `.cta-band` lead-in gradient, the pulsing teal **`.dot`** in the footer brand mark, and teal link hovers. (Lineage note in the source: the discipline is borrowed from xAI's footer glow, recolored to MindSmack signal-teal.) Keep the `footer::before` / `--horizon` glow intact — don't flatten the close.

Supporting motifs that reinforce the above (keep consistent):
- **`.sync`** traveling signal line — a 1px hairline with a teal gradient sweep (`animation: travel 7s`) used as a section divider. The "signal" leitmotif.
- **Brand `.dot`** — 9px teal dot with an expanding `pulse` ring (2.6s). The living heartbeat of the mark; appears in nav and footer.
- **`.marquee`** capabilities ticker — mono, `--fog`, dash-led spans (`::before "—"` in `--signal-dim`), 34s loop, duplicated track for seamless scroll.

---

## 7. Motion

- Global: scroll-behavior smooth; **`prefers-reduced-motion` already kills animations/transitions** — keep any new animation inside that guard's reach (use CSS animation/transition, not JS-driven loops, so it's auto-disabled).
- **Scroll reveal** — add class `.reveal` to elements; the `IntersectionObserver` fades+rises them in (staggered by `(i % 4) * 60ms`). Use `.reveal` on new content blocks for consistency.
- Durations are slow and calm (0.7s reveals, 7s sync, 34s marquee). Don't introduce fast/bouncy easing — it breaks the instrument-panel composure.
- The **hero sphere** (§6) is JS-driven WebGL, so it can't rely on the global reduced-motion CSS guard — it checks `matchMedia('(prefers-reduced-motion: reduce)')` itself and renders a single static frame instead of looping, and pauses its `requestAnimationFrame` loop when the hero is offscreen. Any future JS animation must do the same (honor reduced-motion + pause when not visible).

---

## 8. Brand Voice (copy)

Write like a senior team that has been doing this since 1999 and has nothing to prove but says it anyway.

- **Direct and earned.** Short, declarative. "Ship faster, break less." "Confidence in every release." "The proof is in production."
- **Gritty, not corporate.** A little edge is on-brand. "The hard parts, handled." "Still shipping." "We tell you, honestly, where we'd start." Avoid hype words (transformation, synergy, revolutionary) — the site explicitly mocks "bolting a chatbot on and calling it transformation."
- **Discretion as a flex.** The track record is white-label / under NDA, and that's pitched as a feature ("the discretion is the point"). Keep that posture — no fake logo walls.
- **Human-in-control on AI.** Always frame AI as augmentation under senior judgment: "AI-augmented. Not AI-improvised." Never let copy imply the agents make the calls.
- **Register cues:** mono captions can use `//` and `·` separators; numbers are concrete (20+, 1999, 100%, 24/7). Keep it confident, lightly defiant — **not** minimalist-precious.

---

## 9. Working in this repo

- It's a **single static HTML file**, no framework, no build, no package manager. Open it in a browser to preview. Keep new work in the same self-contained style (inline `<style>`, vanilla JS) unless a real reason forces a build step — and raise that before introducing one.
- **One sanctioned external dependency:** Three.js for the hero sphere (§6). The orb code lives in its **own file, `orb.js`** (an ES module with a `BASE` config + named `PRESETS` at the top — tweak shape/colour/motion there, never in the GLSL). It has two render modes — `glass` (solid Siri-style ball with an internal iridescent band + gloss, the **production default**) and `ring` (additive warm/cool see-through ring) — selectable for **local testing** via `?style=NAME` (glass|glossy|ring|ice|ember|aurora), with any config key overridable as a URL query param (e.g. `?style=glass&gloss=2&colorWarm=ff4632`). No query param → `glass`. Three is loaded via an **import map** pinned to `three@0.160.0` on unpkg; the import map **must stay inline** in the HTML `<head>`/body (import maps can't be external), and the orb is pulled in with `<script type="module" src="./orb.js">`. This stays "no-build" (no bundler) but it *is* a runtime CDN dependency (~150KB gzipped) — the single exception to self-containment. The sphere fails gracefully: no WebGL → the canvas is hidden and the CSS bloom/arc remain. Don't add further CDN deps casually; if you bump the Three version, re-pin the import-map URL.
- **Serving:** because `orb.js` is an external ES module, the page can no longer be opened via `file://` (Chrome blocks local module scripts as a CORS/opaque-origin issue) — **serve it over http** (`python3 -m http.server 5500` from the project root, then `http://localhost:5500/mindsmack-landing-v1.html`). Everything else (CSS, the inline scroll-reveal script) still works from `file://`; only the orb needs the server.
- When adding a section: wrap in `<section class="pad">` → `.wrap` → `.sec-head` (eyebrow + h2 + lead) → content grid, give blocks `.reveal`, and reach for existing tokens/components before writing new CSS.
- Before adding any color, shadow, radius, or font: check §2/§3 first. Extend via tokens; preserve the single-accent, hairline, soft-radius, mono-voice discipline.
