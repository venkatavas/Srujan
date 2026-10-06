# DESIGN.md — THROUGH-LINE

Personal site for **Sai Srujan Pasala**. Audience: boards and senior hiring. The career is told as **one continuous line with a different physical behaviour in each chapter**. Structure follows the stitch-design-taste skill. Where that skill's defaults conflict with the approved direction, the overrides are listed at the end.

The previous file here (a Vercel/Geist analysis) is kept at `docs/reference/vercel-geist-analysis.md` for reference only.

## 1. Atmosphere

- **Density 3, "art gallery airy".** A frame has four to six elements. Emptiness carries the Leadership and Contact chapters.
- **Variance 8, "offset asymmetric".** Everything is flush-left on a 12-column grid. Nothing is centred.
- **Motion 6, "cinematic but still".** Motion is caused only by scroll or the pointer. When idle, the page is still.
- **Governing rule:** one line and one horizon at **62% of the viewport height**. Display type sits **on** the line or hangs **from** it. Nothing floats.

## 2. Colour

| Name | Hex | Role |
|---|---|---|
| Night | `#0B0B0A` | Ground for Overture, Hero, Technology, Business and Media |
| Night 2 | `#121211` | Business chapter, right half (the second grammar) only |
| Night ink | `#E9E9E4` | Text and line on night |
| Night mute | `#8E8E88` | Secondary text on night (5.8:1) |
| Drafting film | `#E7E7E2` | Ground from Leadership onward (neutral, not cream) |
| Day ink | `#0E0E0D` | Text and line on day |
| Day mute | `#5E5E59` | Secondary text on day (5.3:1) |
| Survey vermilion | `#D9381E` | **Non-text only**: the point, the active lineage and focus rings (≈4.2:1 on night, ≈3.7:1 on day) |

- There is one environment change: night to day, the "exposure" at Leadership. The page does not return to night.
- The warm-paper, clay and espresso family is banned. It is the most common AI-default palette, so keep colours ΔE > 6 away from it.

## 3. Typography

**Approved direction:** **ABC Arizona** (Dinamo) as one superfamily.
- Sans: technical text and specs.
- Serif: intention.
- Flare: the display voice and the name.

**Backup:** GT Alpina (Standard + Typewriter).

**Development placeholders, not to ship:** IBM Plex Sans, Plex Serif and Plex Mono via `next/font/google`. These are swapped at gate G2 via `next/font/local` once a licence is purchased.

| Role | Spec |
|---|---|
| Name (display) | 500, uppercase, `min(13.4vw, 25svh)`, tracking −0.035em, cap-trimmed so the baseline sits on the horizon |
| Chapter display | 300–400, 3.6–10.4vw, tracking −0.02 to −0.035em |
| Body | 18px / 1.55, maximum 52ch |
| Metadata (mono) | 12–13px minimum, tracking +0.06em, uppercase. Use sparingly. |

The full stop of the name is the vermilion point. That pairing, name plus point on a hairline, is the mark. The favicon is a 2px bar with a 6px vermilion square.

## 4. Components

- **Nav:** wordmark on the left (appears once the hero name hands off to it). On the right, the current chapter in plain words, which takes on that chapter's physics, then **Index**. There are no numeric counters and no scroll cues.
- **Record (Index):** a native `<dialog>`, also opened with `?`. It contains:
  - jump links (keys 1–6),
  - a to-scale line of verified periods,
  - a chronology table with sources,
  - print and reduce-motion controls.
- **Lineage:** four fixed strata (Person, Roles, Companies, Industries) with octilinear 45° edges in the Harry Beck style.
  - Ventures use solid nodes; career organisations use hollow nodes.
  - Hovering a company draws its lineage top-down; hovering an industry draws it bottom-up.
  - On small screens it becomes a vertical list: ventures first, tap to expand.
- **Facts:** every fact is `verified`, `draft` or `pending`. Pending facts render as a dashed "Content required" tag, shown only outside production.
- **Buttons:** plain text with an underline. No pills, cards, glass or shadows.

## 5. Layout

- 12 columns, 4vw outer margins (20px on mobile).
- Every chapter is a tall section holding a sticky 100svh stage for `len` of scroll. ScrollTrigger only scrubs; it never pins.
- **Poster frames:** each chapter's server-rendered still is the design. It doubles as the JS-off, reduced-motion and screenshot state, so motion is only the transition between stills.

## 6. Motion

- **Scroll moves geometry** (scrubbed, reversible). **Thresholds fire events** (timed, played once).
- Text is never scrubbed.
- The pointer moves only the hero line (≤8px) and the lineage.

**Physics per chapter:**

| Chapter | Physics | Scrub |
|---|---|---|
| Technology | Quantised. The trace snaps cell by cell and leaves registration marks. | `true` |
| Business | Two halves lag on separate scrubs and settle at 45°. | 0.6 / 1.0 |
| Media | Oscillatory. Noise resolves to a sine; velocity drives amplitude, then settles. | 0.6 |
| Leadership | Slowest. Daylight opens from the horizon, the grid tilts into a perspective floor, a 2D dolly-in. | 1.2 |
| Ventures | Propagation. The line contracts to a point, then a breadth-first cascade. | 0.8 |
| Contact | Departure (ease-in). A timed 1.1s hold, then the line returns as the underline. | — |

**Rules:**
- **Velocity skip:** above 3000px/s, and after keyboard jumps, timed beats complete instantly.
- **Overture:** ≤5s on first visit only. It is skippable by any input before hydration, and it hands off pixel-exactly to the painted `<h1>`.
- **Reduced motion**, from the OS or the Index toggle: poster frames in normal flow, no overture.

## 7. Anti-patterns (banned)

- **Layout:** standard navbar; hero with three cards; centred hero; generic timeline; skill badges; contact form.
- **Styling:** glassmorphism; purple or neon gradients; blobs; rounded cards; random 3D; particles; custom cursor.
- **Motion:** bouncing or springs; ambient loops; parallax layers.
- **Navigation chrome:** `NN / NN` counters; "scroll" cues; locale or time strips; middle-dot decoration strips.
- **Content:** fake stats or any number that isn't a verified quantity; odometers on years; "The X." headlines without client approval; copy a board chair wouldn't say aloud.

### Overrides of stitch-design-taste defaults

These overrides are deliberate, decided in the team critique:
- **No "perpetual micro-motion"**, because idle means still.
- **No inline-image hero**, because there is no photography.
- **None of its suggested serifs** (Fraunces, Instrument Serif, Editorial New), because they are overused.
- **No `max-width` container**: the layout is a full-bleed grid with margins.
- **Absolute positioning is allowed inside stages** so type can sit on the horizon.
