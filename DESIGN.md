# Design System: The Brief

Personal site for **Sai Srujan Pasala**. Audience: boards and senior hiring. One sentence, the client brief "Reduce onboarding time for enterprise clients without adding headcount.", is read nine ways, from the hero to the visitor's own brief in Contact. The visual target is the client's approved mockup. Structure follows the stitch-design-taste skill; where the mockup overrides the skill's defaults, section 8 lists it.

## 1. Visual Theme & Atmosphere

A dark, editorial engineering drawing. It should read like a spec sheet pinned under a cool desk lamp: hairline grids, registration crosses, outlined panels, and thin vermilion wires that connect the ideas.

- **Density 4, "measured".** Each section has one headline, one short body and one diagram.
- **Variance 6, "offset split".** Copy sits left (5fr), the diagram right (7fr), with wider 4fr/8fr splits for Media and Ventures.
- **Motion 7, "a living drawing".** The drafting sheet itself is alive: the grid lenses around the cursor and 1px vermilion signals travel along its lines. Sections hand over to each other along an orange edge, headlines rise out of masks, and each diagram draws itself once.
- **Zero images.** No photos, portraits, stock or generated imagery. SVG is used only for wires, marks, icons and the grid.

## 2. Color Palette & Roles

| Name | Value | Role |
|---|---|---|
| Drafting Night | `#0D1016` | Page ground; the boot screen |
| Panel Slate | `#131721` | Panel fill (used translucent over the grid) |
| Hairline | `rgba(226,232,255,0.10)` | Panel borders, section rules |
| Strong Hairline | `rgba(226,232,255,0.20)` | Buttons, bracket corners, stop cards |
| Neutral Wire | `rgba(226,232,255,0.30)` | Non-accent connectors, Venn circles |
| Paper Ink | `#E8E6E1` | Headlines, primary text |
| Graphite Mute | `#9A9DA4` | Body, labels, metadata |
| **Survey Vermilion** | `#E0452B` | **The only accent.** Wires, active nav, section numbers, brief highlights, the conflict state, the caret |
| Vermilion Wash | `rgba(224,69,43,0.10)` | The fill behind highlighted brief phrases |

- One accent, used for meaning: the thing being connected, extracted or decided.
- **Background ("living blueprint"):** a fixed WebGL2 shader (`motion/field/`), one full-screen triangle with no textures. It draws:
  - the 48px grid at 3.2% and "+" registration crosses every 192px, matching the CSS fallback exactly;
  - a cursor lens (240px radius, 16% magnification) on fine pointers;
  - two slow, cool lamps and a gentle scroll parallax;
  - 1px vermilion signal pulses travelling along grid lines, denser while a section hands over;
  - the grid brightening along the nav curtain's moving edge.
- SVG grain and the edge vignette sit on top in CSS.
- **Fallback:** the same grid, crosses and lamp as static CSS layers, used under reduced motion, save-data, low memory, no WebGL2 or a slow GPU.
- Pulses are 1px lines. There is no orange glow or bloom in the background. The only glow on the site is the nav limelight (see section 4).

## 3. Typography Rules

| Role | Font | Treatment |
|---|---|---|
| Display | **Newsreader** (optical sizes) | The name in caps; headlines in sentence case at `clamp(40px, 4.3vw, 70px)`, tight leading. Headline width is capped per section (9ch by default, 11ch Ventures and Contact, 15ch Leadership) so the lines break as drawn. |
| Labels, body, panels, buttons | **IBM Plex Mono** | Labels are uppercase with 0.14em tracking; body copy is sentence case. Mono's fixed 0.6em advance lets diagram wires start exactly where a line of text ends. |
| Long statements | **Hanken Grotesk** | Only for the Experience statement, where mono would strain. |

Diagram text is sized in container units (`cqw`), so labels scale with their wires.

## 4. Component Stylings

- **Nav: a floating glass pill.**
  - Built on `components/ui/limelight-nav.tsx`, a shadcn-style component styled with Tailwind v4: theme and utilities only, with no Preflight, so the editorial reset stays in charge.
  - It floats 16px below the top, centred: the name mark · nine section icons (lucide) · "Get in touch →". The glass is translucent slate with a 14px blur and a hairline border.
  - The active section carries the **limelight**: a short vermilion bar with a soft cone of light beneath it. Its label ("03 Business") opens beside the icon, and other items show a tooltip on hover or focus.
  - It hides while you scroll down and returns when you scroll up, reach the top, move the pointer near the top, or tab into it.
  - On phones the icons move to a floating dock at the bottom, and the top pill keeps only the mark and the CTA.
- **Section header.** `0N TITLE` with the number in vermilion, a caption on the right, and a hairline rule underneath.
- **Lead.** The serif headline and mono body sit beside a 1px vermilion rule on the left.
- **Panels.**
  - A 1px hairline border, 2px corners and a translucent slate fill. No shadows.
  - The brief panel adds bracket corners drawn with gradients.
- **Diagram (`Dia`).**
  - HTML nodes and SVG wires share one fixed-aspect coordinate space, so wires meet their nodes at any width.
  - Wires are 1px, and every wire has `pathLength=1` so it can be drawn in.
- **Buttons.** Outlined and mono uppercase, with no wrapping; the border turns vermilion on hover and the arrow nudges 3px. The disabled state is at 40% opacity.
- **Brief form.**
  - The textarea has a vermilion caret and a vermilion border on focus.
  - "Send brief →" opens `mailto` only once the email is verified. Until then it is disabled, with a note saying why.
- **Preloader.**
  - A large Newsreader odometer counts 000→100 while the name is unmasked letter by letter, then the sheet lifts away with a clip-path curtain.
  - **The count is honest.** It eases toward the sum of real loading milestones (Document, Type, Script, Motion, Field, Assets) and a legend lights each one as it settles. It never shows 100 before everything has loaded; if the time cap is reached, it lifts at its real value.
  - Full on a first-ever visit, short in a later session, skipped on reload, deep links and reduced motion. Any input skips it.
- **Curtain.** Nav jumps of more than one section cover the page with the grid sheet, scramble the target's `0N TITLE`, jump, then lift. Adjacent jumps glide instead.

## 5. Layout Principles

- Sections are at least `100svh` tall; Experience, Education and Contact are `84svh`. Padding is 104px to clear the floating nav.
- **Footer:**
  - A closing line, "Have a brief?", in huge Newsreader ending in the vermilion caret (its third appearance after the hero brief and the Contact field);
  - a "Write your brief" button;
  - email and LinkedIn, only once they are verified;
  - an index of the nine sections and back-to-top;
  - a full-width outlined wordmark cut at its baseline;
  - a bottom bar with © year and colophon.
- The gutter is `clamp(20px, 3.4vw, 56px)`.
- The copy and diagram split uses CSS Grid.
- Diagrams keep their aspect ratio. Text never overlaps a wire: wires start after the end of a line and end before a label.

## 6. Responsive Rules

- **Below 900px,** every split becomes one column: copy first, then the diagram.
- The hero stacks in this order: status, name, title, brief, lifecycle.
- **Wide diagrams** (Parser, Business, Media, Leadership, Ventures) keep their proportions at a minimum width of 640–720px and scroll sideways. A fade on the trailing edge signals that more is off-screen.
- **The Experience rail** turns vertical: year and role on the left, the verb on the right.
- Mobile brief text is 15px, so the brief's three lines stay intact at 390px.

## 7. Motion & Interaction

- **One controller** (`motion/chapters/draw.ts`) runs every section. Elements carry `data-step`, and steps play 0.22s apart in this order:
  1. nodes fade in (0.5s, opacity only);
  2. wires draw (0.7s);
  3. marks switch on;
  4. the final accent arrives.
- **Section-specific moments:**
  - Technology's counter ticks from 0/4 to 4/4 as each requirement lands.
  - Business's conflict badge arrives last.
- Each section's diagram draws once, starting when the section's top crosses 72% of the viewport.
- A fast scroll or a jump skips straight to the final state.
- The hero waits for the preloader to lift.
- **Entrances** (`motion/chapters/enter.ts`): section numbers and captions decode with a scramble; the accent rule grows; serif headlines rise line by line out of masks; body copy fades up. The hero name rises letter by letter and the brief panel wipes open.
- **Smooth scroll** (`motion/smooth.ts`): Lenis on the wheel (lerp 0.1), driven by GSAP's ticker so ScrollTrigger stays in sync. Touch scrolling stays native. Scroll speed feeds the field, so its vermilion pulses quicken while you move.
- **Soft parallax** (`motion/chapters/drift.ts`, desktop with a fine pointer): copy columns and diagram columns drift a few dozen pixels at different rates. The footer wordmark rises into place as the page bottoms out. No pinning and no sticky sections.
- **Nav** (`motion/curtain.ts`): far jumps play the curtain; adjacent jumps glide.
- **Mobile and touch:** native scrolling, one-shot entrances, no parallax. The field runs at 30fps with no lens.
- **Reduced motion and no-JS** show every diagram fully drawn, with a static field and no preloader. The caret stops blinking.
- **Never:** particles, custom cursors, pinned or sticky scroll scenes, or scroll-jacking on touch.

## 8. Deliberate overrides of the skill's defaults

| Skill default | Built as | Why |
|---|---|---|
| Serif limited to Fraunces, Instrument and similar | Newsreader | The client's mockup; a distinctive optical-size serif, not a generic one |
| No horizontal scroll on mobile | Wide diagrams scroll sideways | Shrinking a wire diagram to 350px makes it unreadable. The approved spec chose scroll, with a fade cue |
| Perpetual micro-interactions | Only the living field | The background is the one ambient element; components stay still once drawn |
| Inline image typography in the hero | None | The client banned all images |
| Three equal cards banned | Business shows three stakeholder panels | They are branches of one requirement, joined by wires, not a feature row |

## 9. Anti-Patterns (Banned)

- **Facts:**
  - Invented facts of any kind: dates, cities, titles, company descriptions, metrics, quotes, or investor and advisor relationships.
  - Unverified copy is a `draft` or `pending` fact, which blocks the production build.
- **Images:** any `<img>`, `next/image`, `/media/` or image file. The test suite enforces this.
- **Colour:**
  - A second accent colour, gradient text, neon or outer glows, pure black.
  - Orange glow or bloom in the background (the nav limelight is the single, deliberate exception).
- **Fake signals:** a loading counter not driven by real milestones, fake diagnostics, "INITIALIZING".
- **Generic UI:** emojis, Inter, AI copy clichés ("elevate", "seamless", "unleash").
- **Diagram text:** text crossed by a wire; labels sized in px inside diagrams.
