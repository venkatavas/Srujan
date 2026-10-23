# Design System: Sai Srujan Pasala

Personal site for **Sai Srujan Pasala, Digital Health Strategist**. Calm, light and quietly colourful: a warm off-white page, one indigo accent with a small family of meaning colours, editorial serif headings, and restrained motion. The previous dark build is preserved at the git tag `dark-brief-final`.

## Page

One page, eight sections, each at least one screen tall with its content centred:

| # | Section | id | Built from |
|---|---|---|---|
| | Hero | `top` | `components/home/Hero.tsx` |
| 01 | About | `about` | `components/home/Story.tsx` |
| 02 | How I work | `work` | wave timeline with the "Insight to impact" centre |
| 03 | Path | `path` | wave timeline ending in an arrow |
| 04 | Ventures | `ventures` | verified roles and public-record links |
| 05 | Experience | `experience` | every verified role, newest first |
| 06 | Education | `education` | cards with a decorative orbit drawing |
| 07 | Let's connect | `connect` | contact routes and the dark "Let's build together" card |

The floating nav (`components/nav/Nav.tsx`, the limelight bar) has one item per section, in this order (`components/nav/sections.ts`). Every refresh starts at the hero.

## Colour

Tokens live in `components/home/tokens.css` (base) and `story.css` (section accents). All text pairs are WCAG AA, computed against the canvas, white and each tint.

- **Canvas** `#faf9f7`, **ink** `#1b1a2e`, **ink-2** `#4c4a66`, **ink-3** `#625f7e`.
- **Indigo** `#4d4ad0`, the one accent: links, active states, the title word "Strategist", decisions.
- **Meaning colours**, each with a light tint for fills: coral `#c83c34`, teal `#0c766a`, blue `#2259c0`, grey `#5f5d72`. Used for numbers, dots, tags and rules, never as large fills.
- Soft radial glows (lavender, peach, sky, blush) only behind the hero and Let's connect.
- The one dark element is the "Let's build together" card in Let's connect.

## Type

- **Outfit** (`--f-y`): the hero, body text and UI.
- **Newsreader** (`--f-serif`): every section heading, step and card titles. Headings end with an accent-coloured full stop; a short indigo-to-coral rule sits under the section label.
- **Geist Mono** (`--f-code`): section labels ("01 / ABOUT"), dates, step numbers.

## Motion

Calm and purposeful (`components/home/Motion.tsx`, `site.css`, `story.css`, `scroll.css`): the hero settles once on load; sections rise in as they enter; wave lines, rails and rules draw; cards lift on hover; the hero glow and edge rails follow the pointer. Nothing moves on its own. Reduced motion and no-JavaScript show everything at rest.

- **Preloader** (`Preloader.tsx`, `preloader.css`): about 1.7s on every load of the home page. The hero's line draws from its point, the name rises letter by letter, the title fades in and a 0–100% counter fills; then the screen wipes up and the hero's own entrance plays. Any key, click, tap or wheel skips it. It is switched on before first paint by the layout's boot script (`html[data-pre]`), never shown under reduced motion or without JavaScript, and hidden by a CSS failsafe after 6s whatever happens.
- **Smooth scrolling** (`Smooth.tsx`, Lenis): momentum scrolling and gliding nav jumps; paused during the preloader; native scrolling under reduced motion.
- **Scroll-linked** (`scroll.css`, CSS scroll-driven animations where supported): a 2px indigo-to-coral reading-progress line at the top (JavaScript fallback in `Motion.tsx`); headings rise word by word from behind a mask; the waves and the Experience and Education rails draw as you scroll and undraw on the way back; the hero drifts up and fades as you leave it, its light and the orbit drawings move at a slower depth. Only transform, opacity and stroke offsets animate.

## Content rules

- Every fact comes from `content/profile.ts` and `content/site.ts`, verified with a source. New wording lives in `content/page.ts` as **drafts**: the production build is blocked until Sai approves them (`npm run check-content`, `/review`).
- Open questions and conflicts between reference images and the record: `lib/content/review.ts`, listed on `/review`.
- No images of any kind: type, CSS and inline SVG only.

## Tools

- `npm run shoot`: section screenshots at desktop and phone size. `npm run fps`: frame-time probe.
