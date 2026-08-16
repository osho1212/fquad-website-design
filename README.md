# Handoff: F.QUAD Studio Website — "Cinema" Direction (Direction B)

## Overview

Marketing website for **F.QUAD Studio**, an architecture and interior design practice in Hyderabad, India (founded 2005). This package covers the **homepage** in the dark cinematic direction ("Direction B"), which is the direction selected for build. It is a long-scroll page: hero, credentials, signature project, studio intro, work grid, a scroll-driven "Four F's" philosophy takeover, services, process, awards marquee, testimonial, and a contact/footer block.

The defining characteristic is **layered CSS-3D motion**: a multi-plane parallax hero that responds to both scroll and cursor, a rotating photographic quad, and scroll-linked depth on cards and images. Motion is the product here — if the motion is dropped, the design does not land.

## About the Design Files

The files in `design/` are **design references created in HTML** — a working prototype showing intended look and behavior. They are **not production code to copy directly.**

The task is to **recreate this design in the target codebase's existing environment** (React/Next.js, Vue, Astro, etc.) using its established patterns, component conventions and libraries. If no codebase exists yet, choose the most appropriate framework and implement there. **Next.js (App Router) + TypeScript is the assumed target** unless the team decides otherwise.

Specifically, do **not** port these implementation details:
- The prototype is authored as a "Design Component" (`.dc.html` + `support.js`) with a custom template runtime. That runtime is a prototyping tool. Discard it.
- All styling in the prototype is **inline styles**, because the prototyping environment requires it. In production, use the codebase's normal styling approach (CSS Modules, Tailwind, styled-components…). The design tokens below are the source of truth.
- The prototype holds two visual directions (A "Paper", B "Cinema") plus Services and Studio pages in one file, switched by a floating pill control at bottom-left. **That control is a review affordance and must not ship.** Build only Direction B.

### How to view the reference

Open `design/F.QUAD Website.dc.html` in a browser and click **B · CINEMA** in the bottom-left control. Scroll slowly and move the cursor around the hero — much of the design only exists in motion.

## Fidelity

**High-fidelity.** Colors, type, spacing, copy and motion parameters are final and specified below. Recreate pixel-accurately at desktop widths.

Two caveats:
- **Desktop only.** No mobile or tablet layout was designed. Responsive behavior below ~1024px is an open design task — see *Responsive*.
- Certain content is deliberately marked as pending, not invented — see *Content Gaps*.

## Design Tokens

### Color

| Token | Value | Use |
|---|---|---|
| `ink` | `#0b0b0a` | Page background, and text on light surfaces |
| `bone` | `#ece9e2` | Primary text on dark; light section background |
| `bone-e4` | `#e4e0d8` | Four F's image-panel backdrop (slightly warmer than `bone`) |
| `brass` | `#c39a5f` | Accent: eyebrows, numerals, primary button, scroll progress |
| `brass-deep` | `#8a6b3d` | Accent on light backgrounds (contrast-safe), link hover |

Alpha derivatives (used verbatim; do not substitute solid greys):

- Text on dark: `rgba(236,233,226,.75)` lead paragraph · `.6` body · `.5` footer body · `.45` section eyebrow · `.4` legal · `.22` process numerals
- Rules/borders on dark: `rgba(236,233,226,.14)` (section dividers, grid gaps) · `.2` (hero rule) · `.35` (secondary button) · `.16` (hero drawing frame) · `.1` (footer base rule)
- Text on light (Four F's panel): `rgba(11,11,10,.7)` body · `.5` eyebrow · `.42` caption · `.35` inactive rail · `.15` inactive rail border
- Hero gradient: `linear-gradient(180deg, rgba(11,11,10,.72) 0%, rgba(11,11,10,.3) 34%, rgba(11,11,10,.72) 62%, rgba(11,11,10,.94) 100%)`
- Hero light bloom: `radial-gradient(60% 45% at 30% 68%, rgba(195,154,95,.16), transparent 70%)` plus `radial-gradient(50% 40% at 78% 40%, rgba(236,233,226,.09), transparent 72%)`
- Card shadow (quad faces): `0 40px 90px rgba(11,11,10,.28)`

### Typography

Three families, all Google Fonts:

- **Archivo** (300, 400, 500, 600) — display and UI. Direction B's display voice is Archivo **600, uppercase, `letter-spacing: -.035em`**. Large numerals use Archivo **300** with `letter-spacing: -.04em`.
- **IBM Plex Mono** (400, 500) — all eyebrows, labels, nav, buttons, metadata. Always uppercase, small (9.5–11px), wide tracking (`.16em`–`.3em`).
- **Instrument Serif** (400) — **Direction A only.** It appears in the shared file but is *not* part of Direction B. Do not use it in the Cinema build.

Scale as used (all `clamp()` values are literal):

| Role | Spec |
|---|---|
| Hero H1 | Archivo 600 uppercase · `clamp(56px, 8.4vw, 152px)` · `line-height:.88` · `-.035em` |
| Section H2 (signature project, CTA) | Archivo 600 uppercase · `clamp(40px, 6vw, 104px)` / CTA `clamp(46px, 7vw, 122px)` · `line-height:.9` · `-.035em` / `-.04em` |
| Four F's H3 | Archivo 600 uppercase · `clamp(44px, 5.6vw, 96px)` · `line-height:.9` · `-.04em` |
| Studio lead paragraph | Archivo 300 · `clamp(26px, 2.9vw, 44px)` · `line-height:1.24` · `-.02em` |
| Testimonial | Archivo 300 · `clamp(28px, 3.7vw, 60px)` · `line-height:1.16` · `-.03em` |
| Stat numerals | Archivo 300 · `clamp(46px, 5.6vw, 88px)` · `line-height:1` · `-.04em` |
| Process numerals | Archivo 300 · `64px` · `-.04em` · color `rgba(236,233,226,.22)` |
| Service card H3 | Archivo 500 · `24px` · `-.01em` |
| Awards marquee | Archivo 500 uppercase · `26px` · `-.01em` |
| Body | Archivo 400 · `14.5–16.5px` · `line-height:1.65–1.75` |
| Eyebrow / label | IBM Plex Mono · `9.5–11px` · `letter-spacing .16em–.3em` · uppercase |

Set `text-wrap: pretty` on all multi-line body copy and headings.

### Spacing & layout

- **Page gutter: 44px** left and right (Direction B). Direction A uses 56px — do not mix them up.
- Section vertical rhythm: `110–130px` top/bottom for standard sections; hero and sticky sections are `100vh`.
- Section header pattern: `border-top: 1px solid rgba(236,233,226,.14)`, `padding-top: 24px`, then `margin-bottom: 56–70px`.
- Grid gaps: `26px` (work grid), `44px` (two-column text), `1px` (card grids, where the gap *is* the divider — parent gets `background: rgba(236,233,226,.14)` and children get `background: #0b0b0a`).
- Border radius: **0 everywhere.** No rounded corners in this design.

### Motion tokens

- Primary easing: `cubic-bezier(.22,1,.36,1)` (used for all transform settles)
- Secondary easing: `ease` for opacity
- Durations: `.4s` (hover/UI), `.6s` (panel opacity), `.8–1.1s` (transform reveals), `1.3s` (clip reveal), `1.4s` (image cross-dissolve), `1.8s` (image scale-out)
- Cursor lerp factor: `0.08` per frame
- Reveal lerp/scroll factor: `0.14` per frame (hover-follow image)

## Screens / Views

Only the **homepage** is in scope for this handoff. (Services and Studio pages exist in the prototype but are drawn in Direction A's light palette; they are not part of this build.)

Order of sections down the page:

### 1. Fixed chrome

**Grain overlay** — `position:fixed; inset:0; z-index:140; pointer-events:none; opacity:.5; mix-blend-mode:overlay`, background: two `repeating-linear-gradient`s at 0deg (`rgba(255,255,255,.05) 0 1px, transparent 1px 3px`) and 90deg (`rgba(0,0,0,.05) 0 1px, transparent 1px 3px`). Gives the whole page a fine film-grain tooth.

**Scroll progress bar** — `position:fixed; top:0; height:2px; z-index:160`. Inner bar `background:#c39a5f`, `transform-origin:left`, `scaleX` = `scrollY / (scrollHeight - innerHeight)`.

**Header** — `position:fixed; top:0; z-index:150`, `display:grid; grid-template-columns:1fr auto 1fr`, `padding:24px 44px`, transparent background at rest.
- Left: wordmark — 9×9px square with `1.5px solid #c39a5f` border, plus "F.QUAD" in Archivo 600, 15px, `letter-spacing:.2em`.
- Center: nav — WORK · SERVICES · STUDIO · JOURNAL · CONTACT. IBM Plex Mono 10px, `.18em`, `rgba(236,233,226,.72)`.
- Right: "START A PROJECT" — `background:#c39a5f; color:#0b0b0a`, Archivo 500 / Mono 10px `.18em`, `padding:12px 20px`. Hover → `background:#ece9e2`.
- **Behavior:** past 40px scroll, background becomes `rgba(11,11,10,.9)` with `backdrop-filter: blur(10px)` and `border-bottom: 1px solid rgba(236,233,226,.14)`. Past `0.9 × viewport height`, the header slides out on scroll-down (`translateY(-100%)`) and returns immediately on scroll-up. Transition `.5s cubic-bezier(.22,1,.36,1)` for transform, `.4s` for background/border.

**Intro load-in** — full-viewport `#0b0b0a` cover, `z-index:300`, centered wordmark, with a 1px `#c39a5f` rule at the bottom that scales from `scaleX(0)` to `scaleX(1)` over `1.1s cubic-bezier(.4,0,.2,1)`. Cover fades out (`opacity .8s`) at 1150ms and is removed at 2000ms. Under reduced-motion it is removed immediately.

### 2. Hero — layered 3D diorama (`100vh`)

This is the centerpiece. The section is `position:relative; height:100vh; overflow:hidden`, with **`perspective: 1200px; perspective-origin: 50% 42%`**. Inside are four independently transformed planes, each at a different Z:

| Plane | Z | Cursor factor | Contents |
|---|---|---|---|
| Photograph | `-560px` | 14 | `assets/a2.jpg`, `inset:-14%`, `object-fit:cover` |
| Drawing frames | `-300px` | 34 | Two rotated wireframe rectangles + two vertical datum lines (see below) |
| Light haze | `-140px` | -18 | The two radial-gradient blooms, `inset:-10%` |
| Type | `+90px` | -40 | Eyebrow, H1, rule, lead paragraph, buttons |

The gradient scrim sits between the photograph and the drawing frames (not transformed).

**Drawing-frame plane contents** (this is the "architectural drawing" layer that reads as depth):
- Rect A: `left:12%; top:16%; width:44%; height:52%`, `1px solid rgba(195,154,95,.34)`, `transform: rotateY(16deg) rotateX(-6deg)`
- Rect B: `left:38%; top:26%; width:50%; height:46%`, `1px solid rgba(236,233,226,.16)`, `transform: rotateY(-12deg) rotateX(4deg)`
- Datum line 1: `left:26%; top:10%; width:1px; height:74%`, `linear-gradient(180deg, transparent, rgba(195,154,95,.4), transparent)`
- Datum line 2: `left:70%; top:6%; width:1px; height:80%`, `linear-gradient(180deg, transparent, rgba(236,233,226,.22), transparent)`

**Per-frame transform for each plane** (single rAF loop, one write per element):

```
hp   = clamp(scrollY / viewportHeight, 0, 1.4)        // scroll progress through hero
mx   = (cursorX / innerWidth)  * 2 - 1                // -1..1
my   = (cursorY / innerHeight) * 2 - 1
cmx += (mx - cmx) * 0.08                              // eased cursor, per frame
cmy += (my - cmy) * 0.08

dy    = hp * (z < 0 ? -z * 0.16 : -z * 0.42)          // far planes drift slowly, near plane fast
scale = (1200 - z) / 1200                             // counteracts perspective size change

transform = translate3d(-cmx*m px, (dy - cmy*m*0.45) px, z px)
            scale(scale)
            rotateY(cmx * -1.6 deg)
            rotateX(cmy *  1.1 deg)

if (z > 0) opacity = max(0, 1 - hp * 1.15)            // type plane recedes and fades out
```

The `scale()` correction is essential — without it the pushed-back photograph does not fill the frame and the near type plane overflows.

**Hero content** (on the type plane, bottom-aligned, `padding: 0 44px 40px`):
- Eyebrow: 44×1px `#c39a5f` rule + "ARCHITECTURE · INTERIORS", Mono 11px `.28em`, `#ece9e2`, `text-shadow: 0 1px 14px rgba(11,11,10,.9)`, `margin-bottom:26px`
- H1: **"Space is our medium."**
- Below, a `1fr auto` grid with `border-top: 1px solid rgba(236,233,226,.2)`, `padding-top:26px`, `margin-top:44px`:
  - Left: **"Considered design for homes, workplaces, and hospitality."** — 16px, `rgba(236,233,226,.75)`, `max-width:40ch`
  - Right: two buttons, `gap:12px` — "EXPLORE WORK →" (`1px solid rgba(236,233,226,.35)`, hover inverts to `#ece9e2` bg / `#0b0b0a` text) and "START A PROJECT" (`background:#c39a5f; color:#0b0b0a`, hover `#ece9e2`). Both `padding:16px 24px`, Mono 10px `.18em`.
- Right edge: "SCROLL", Mono 9.5px `.3em`, `rgba(236,233,226,.5)`, rotated `90deg` with `transform-origin: right center`.

### 3. Credential band

Four-column grid, `border-bottom: 1px solid rgba(236,233,226,.14)`, each cell `padding: 54px 0 48px`, cells 2–4 with `border-left: 1px solid rgba(236,233,226,.14); padding-left:34px`.

`20+` YEARS · `500+` PROJECTS (numeral in `#c39a5f`) · `22+` AWARDS · `1` COUNTRY

Numerals **count up** when scrolled into view: 1400ms, easing `1 - (1-p)³`, rendered as `round(target * eased) + suffix`. Runs once. Under reduced-motion, snap to final value.

### 4. Signature project — scroll-scaling frame (`260vh` tall, sticky)

Section is `height:260vh`. Inside, a `position:sticky; top:0; height:100vh` stage, centered, with **`perspective:1600px; perspective-origin:50% 45%`**.

- The image frame (`assets/b21.jpg`) starts at **`52vw × 64vh`** and grows to **`100vw × 100vh`** as scroll progress `p` runs 0→1 through the section: `width = 52 + p*48 vw`, `height = 64 + p*36 vh`.
- Simultaneously it comes forward and levels out: `translate3d(0,0,-(1-p)*180 px) rotateX((1-p)*5 - cmy*1.6 deg) rotateY(cmx*-2.2 deg)`.
- Overlay text sits above at `padding:110px 44px 56px`, `pointer-events:none`:
  - Top row: "SIGNATURE PROJECT" / "01", Mono 10px `.24em`, `rgba(236,233,226,.6)`
  - H2: **"Barkatpura / Residence"** (two lines), with **`mix-blend-mode: difference`** so it stays legible as the photograph scales up behind it. This is intentional — keep it.
  - Metadata row appears once `p > 0.45`, fading and rising from `translateY(16px)`: `HYDERABAD · INTERIORS · RESIDENTIAL · COMPLETED · VIEW PROJECT →` (last item in `#c39a5f`), five auto columns, `gap:44px`, Mono 9.5px `.2em`.

`p` is computed as `clamp(-sectionTop / (sectionHeight - viewportHeight), 0, 1)`.

### 5. Studio intro

`.4fr 1fr` grid, `gap:44px`, `border-top: 1px solid rgba(236,233,226,.14)`, `padding:120px 44px`.

- Left: "THE STUDIO" eyebrow.
- Right: lead paragraph (Archivo 300, `max-width:30ch`) — *"Founded in 2005, F.Quad Studio is an award-winning architecture and interior design practice based in Hyderabad."*
- Then a two-column `1fr 1fr` block, `gap:44px`, `max-width:900px`, `margin-top:48px`, with the two body paragraphs (see *Copy*).

### 6. Work grid — 12-column, scroll-tilted

`grid-template-columns: repeat(12, 1fr); gap:26px`, with **`perspective:1500px; perspective-origin:50% 40%`** on the grid.

| Item | Column span | Notes |
|---|---|---|
| Private Residence (`a3.jpg`) | `1 / span 7` | aspect `3/2`, tilt `+7` |
| Barkatpura (`b25.jpg`) | `9 / span 4`, `align-self:end` | aspect `4/5`, tilt `-6` |
| Private Residence (`a1.jpg`) | `2 / span 5`, `margin-top:70px` | aspect `4/3`, tilt `+6` |
| Placeholder slot | `8 / span 5`, `margin-top:70px` | aspect `4/3`, hatched — see *Content Gaps* |

**Scroll-tilt behavior** (shared with service cards): as an element rises through the viewport,
```
p   = clamp(1 - (rectTop - viewportHeight*0.16) / (viewportHeight*0.78), 0, 1)
rot = (1 - p) * tiltAmount
transform = translate3d(0,0,-(1-p)*130 px) rotateX(rot deg) rotateY(rot*-0.35 deg)
```
So cards enter rotated and pushed back in Z, and settle flat. Elements that also have a clip-path reveal keep their own opacity; elements without one get `opacity = 0.25 + p*0.75`.

Each caption is a `space-between` row, `margin-top:16px`, Mono 10px `.16em`: project name left, typology right in `rgba(236,233,226,.45)`.

**Image clip reveal** (used on all work-grid figures): figure starts `clip-path: inset(0 0 100% 0)` → `inset(0 0 0 0)` over `1.3s cubic-bezier(.22,1,.36,1)`; the inner `<img>` simultaneously goes `scale(1.14)` → `scale(1)` over `1.8s`. Fires once on intersection.

**Slow image parallax** (independent of the tilt, applied to `<img>` inside the figure): `img` is `height:108–112%`, and gets `translate3d(0, -p*factor%, 0)` where `p = (rectTop + rectHeight/2 - viewportHeight/2) / viewportHeight` and factor is 6–9 depending on the image.

### 7. Four F's — scroll takeover with rotating photographic quad (`420vh`, sticky)

The philosophy section, and the second signature moment. Section is `height:420vh`, `background:#ece9e2; color:#0b0b0a` (the one light section in an otherwise dark page). A `position:sticky; top:0; height:100vh` stage holds a `.92fr 1.08fr` grid: **image quad left, copy right.**

Scroll progress `p = clamp(-sectionTop / (sectionHeight - viewportHeight), 0, 0.9999)`; state index = `floor(p * 4)` → 0..3.

**Copy column** (`padding:100px 44px 48px`, space-between):
- Top row: "WHAT'S BEHIND THE NAME" / counter reading `01 / 04` … `04 / 04`, Mono 10px `.24em`, `rgba(11,11,10,.5)`
- Middle: four absolutely-positioned panels in a `height:54vh` box, cross-faded. Active panel: `opacity:1; transform:none`. Inactive: `opacity:0`, `translateY(-26px)` if before the active index, `translateY(+26px)` if after — so panels move in a consistent direction of travel. Transition `opacity .6s ease, transform .8s cubic-bezier(.22,1,.36,1)`. Each panel: brass numeral (Mono 10.5px `.24em`, `#8a6b3d`), H3, body (`max-width:42ch`, `rgba(11,11,10,.7)`).
- Bottom: a four-column progress rail. Active item `border-top: 1px solid rgba(11,11,10,.5)`, `color:#0b0b0a`; inactive `rgba(11,11,10,.15)` / `rgba(11,11,10,.35)`. Transitions `.5s`.

**Image quad** (the 3D element): panel background `#e4e0d8` with a soft radial vignette, **`perspective:1500px; perspective-origin:52% 48%`**. Inside, a `62% × 58%` box with `transform-style: preserve-3d` holding four `<figure>` faces, each `position:absolute; inset:0; backface-visibility:hidden`, shadow `0 40px 90px rgba(11,11,10,.28)`.

Faces are laid out as a box: face *i* gets `rotateY(i*90deg) translateZ(halfWidth px)`, where `halfWidth = box.offsetWidth / 2`. **Recompute on resize** — this is why the layout function is called on mount and on every resize.

Rotation is driven by scroll, but deliberately **not** linearly:
```
t    = p * 4
idx  = min(3, floor(t))
frac = t - idx
lead = frac < 0.82 ? 0 : (frac - 0.82) / 0.18     // rotate INTO the next face late in the current state
turn = min(3, idx + lead)                          // clamped: never rotates past the 4th face

transform = translateZ(-40px)
            rotateX(3 - cmy*2.4 deg)
            rotateY(-90*turn + cmx*-3 deg)
```
The `lead` window is what keeps the photograph and the copy flipping on the same beat — the quad turns during the last 18% of each state, arriving as the new panel fades in. Under reduced-motion, use `turn = idx` (stepped, no interpolation).

Face order: `b23.jpg` (Functional) · `a1.jpg` (Futuristic) · `b21.jpg` (Friendly) · `b25.jpg` (Flexible). Caption bottom-left: "FOUR FACES · ONE PRACTICE", Mono 9.5px `.22em`, `rgba(11,11,10,.42)`.

### 8. Services — six cards

`repeat(3, 1fr)` grid, `gap:1px` on a `rgba(236,233,226,.14)` background (hairline dividers), each card `background:#0b0b0a; padding:40px 34px 46px`, and **`perspective:1600px; perspective-origin:50% 30%`** on the grid. Cards use the scroll-tilt formula above with tilt `+5` and the `0.25 + p*0.75` opacity ramp.

Card: brass numeral (Mono 10px `.2em`, `#c39a5f`) → H3 (Archivo 500, 24px, `margin-top:24px`) → body (14.5px, `rgba(236,233,226,.6)`).

Section header: "WHAT WE DO" left, "ALL SERVICES →" right in `#c39a5f`.

### 9. Process — four columns

`repeat(4, 1fr)`, cells divided by `border-right: 1px solid rgba(236,233,226,.14)` (not on the last), `padding: 0 30px` (first has none left, last has none right).

Each: large ghost numeral (Archivo 300, 64px, `rgba(236,233,226,.22)`) → label (Mono 11px `.22em`, `#c39a5f`) → body (14.5px, `rgba(236,233,226,.6)`).

Header: "HOW WE WORK" / "OUR PROCESS".

### 10. Awards marquee

Full-bleed strip, `border-top`/`border-bottom` `1px solid rgba(236,233,226,.14)`, `padding:24px 0`, `overflow:hidden`.

Inner track: `display:flex; width:max-content`, `animation: marquee 34s linear infinite` where the keyframes run `translateX(0)` → `translateX(-50%)`. The content list is duplicated exactly (second copy `aria-hidden="true"`) so the loop is seamless. Items `gap:48px`, separated by a `#c39a5f` `◇` glyph. Archivo 500 uppercase 26px.

Items: IIID · Hafele Design Awards · ELDORK India Architecture Awards · Surfaces Reporter · Times Design Icons South

### 11. Testimonial

`.4fr 1fr` grid, `gap:44px`, `padding: 0 44px 130px`. "TESTIMONIAL" eyebrow left; blockquote right (Archivo 300, `max-width:26ch`), attribution below in `#c39a5f` Mono 10px `.2em`.

### 12. CTA + footer

`border-top: 1px solid rgba(236,233,226,.14)`, `padding:150px 44px 56px`.

- CTA row: `1fr auto` grid, `align-items:end`, `padding-bottom:110px`. H2 **"Have a project / in mind?"** (two lines), supporting line 16px `rgba(236,233,226,.6)` `max-width:34ch`, and two buttons — "WHATSAPP" (outline `rgba(236,233,226,.35)`) and "START A PROJECT →" (brass fill). `padding:17px 26px`.
- Footer: `1.4fr 1fr 1fr 1fr` grid, `gap:36px`, `border-top: 1px solid rgba(236,233,226,.14)`, `padding-top:48px`.
  - Col 1: wordmark, "Architecture & Interior Design Studio, Hyderabad" (13.5px, `rgba(236,233,226,.5)`, `max-width:26ch`), INSTAGRAM / WHATSAPP links.
  - Col 2 STUDIO: About · Our Team · Awards & Recognition · Journal
  - Col 3 PROJECTS: All Projects · Upcoming · Residential · Commercial
  - Col 4 CONTACT: admin@fquad.com · Hyderabad, Telangana, India
  - Column headers Mono 9.5px `.22em` `rgba(236,233,226,.4)`, `margin-bottom:18px`; links 13.5px, `gap:10px`.
- Legal row: `border-top: 1px solid rgba(236,233,226,.1)`, `margin-top:56px`, `padding-top:20px`. "© 2026 F.QUAD STUDIO. ALL RIGHTS RESERVED." left; PRIVACY / SITEMAP right. Mono 9.5px `.16em` `rgba(236,233,226,.4)`.

## Interactions & Behavior

### The rAF loop (implementation guidance)

All scroll- and cursor-linked motion runs in **one** `requestAnimationFrame` loop, coalesced by a `queued` flag:

```
onScroll / onMouseMove → if (!queued) { queued = true; requestAnimationFrame(frame) }
frame() → queued = false; read scrollY once; write all transforms
```

Rules the prototype follows, and production should keep:
- Scroll and resize listeners are `{ passive: true }`.
- **Never read layout after writing** in the same frame — batch `getBoundingClientRect()` reads before writes where practical, and skip any element whose rect is more than 200px outside the viewport.
- Animate **transform and opacity only**. The one exception is the signature frame's `width`/`height` in `vw`/`vh`, which is intentional and cheap enough at one element.
- Every animated element gets `will-change: transform` and, where it's a 3D parent, `transform-style: preserve-3d`.
- **One writer per element.** Each element is owned by exactly one effect (tilt *or* parallax *or* reveal). Two effects writing `transform` to the same node will fight — this was a real bug during design.

In a React codebase, this belongs in a single `useLayoutEffect`-mounted controller (or a small custom hook / `<ScrollStage>` provider), *not* in per-component effects — and definitely not driven from React state. Write directly to DOM nodes via refs; a state update per frame will drop frames. If the team prefers a library, Framer Motion's `useScroll` + `useTransform` or GSAP ScrollTrigger both map onto this cleanly, but the parameters above must be preserved.

### One-shot reveals

An `IntersectionObserver` with `rootMargin: '-8% 0px -12% 0px'` triggers each reveal once, then `unobserve`s. Reveal kinds:

- **`up`** — `opacity:0; translateY(26px)` → `opacity:1; none`. Transition `opacity .9s ease, transform 1.1s cubic-bezier(.22,1,.36,1)`.
- **`clip`** — the clip-path + inner image scale described in §6.
- **`line`** — `scaleX(0)` → `scaleX(1)`, `transform-origin:left`, `1.4s`.
- **`words`** — the H1 treatment: split the heading into words, wrap each in an `overflow:hidden` inline-block, and slide each inner span from `translateY(105%)` to `0` with a **60ms stagger** (`delay = 0.06*i + 0.1s`), `1.15s cubic-bezier(.22,1,.36,1)`.
- **Counters** — as described in §3.

**Important:** there is also a deterministic first pass 60ms after mount — anything already within `0.92 × viewportHeight` of the top is revealed immediately rather than waiting for an intersection event. Without this, above-the-fold content can sit invisible on a fresh load or a client-side route change. Keep this behavior.

### Hover states

- Nav links: color → `#c39a5f` (global `a:hover`).
- Outline buttons: border → `#ece9e2`, or full inversion to `#ece9e2` background / `#0b0b0a` text where noted. `.35s`.
- Brass buttons: background → `#ece9e2`. `.35s`.
- Direction A has a cursor-following image preview on its services list; Direction B does not. Don't port it.

### Accessibility & reduced motion

`prefers-reduced-motion: reduce` must be honored, and the prototype's behavior is the spec:

- No 3D plane transforms — the hero renders as a flat, static composition.
- The quad steps between faces instead of rotating continuously.
- Counters snap to their final values.
- Reveals are skipped (content renders in its final state).
- The intro cover is removed immediately.

Also required in production, beyond the prototype:
- The marquee should pause under reduced-motion.
- All `<img>` need the real alt text (the prototype's alt strings are written and can be reused verbatim).
- Nav and buttons must be real focusable elements with a visible focus ring — the prototype's `<a href="#">` placeholders have no focus styling, which needs designing (suggest a `1px` `#c39a5f` outline with 2px offset).
- Verify contrast of `rgba(236,233,226,.45)` and `.4` text against `#0b0b0a` at small sizes; these pass AA for the 9.5–10px labels only because they're uppercase and tracked — if the build changes those sizes, re-check.

### Responsive

**Not designed.** The prototype is desktop-only and will break below roughly 1024px. Decisions needed:
- 12-column work grid → likely a single column with alternating offsets.
- Four F's split view → stacked, with the quad above the copy at reduced height, or a simpler cross-fade on small screens.
- Hero: reduce the number of Z planes on mobile (cursor parallax has no touch equivalent — scroll-only is right there).
- Sticky sections: shorten the scroll distance (`420vh`/`260vh` is a long way on a phone).
- Header nav → drawer.

Recommend disabling cursor-driven parallax entirely below the `(hover: hover)` media query, and cutting sticky section heights roughly in half at mobile widths.

## State Management

Almost none — this is a marketing page. What exists:

| State | Type | Trigger | Consumers |
|---|---|---|---|
| `scrollY` | number (imperative, not React state) | scroll | progress bar, header, hero planes, tilts, signature frame, quad |
| `cursor` (`mx`, `my` → lerped `cmx`, `cmy`) | numbers (imperative) | mousemove | hero planes, signature frame, quad |
| `activeF` | 0–3 | derived from scroll | Four F's panels, rail, counter, quad rotation |
| `navHidden` | boolean | scroll direction past `0.9vh` | header transform |
| `revealed` | per-element, one-shot | IntersectionObserver | reveal targets |
| `introDone` | boolean | timers (1150ms / 2000ms) | intro cover |

No data fetching in the design. In a real build, the work grid, services and awards should come from a CMS — the design assumes: work item = `{ title, typology, image, span }`; service = `{ number, title, body }`; award = `{ name }`; philosophy pillar = `{ number, title, body, image }`.

The prototype additionally holds `dir` (`'a' | 'b'`) and `page` (`'home' | 'services' | 'studio'`) for the review switcher. **Neither ships.** Real routing replaces `page`.

## Content Gaps

Deliberately unresolved — do not invent values:

1. **Project years / dates.** The source site contradicted itself; no year is shown in Direction B.
2. **Project names.** "Barkatpura Residence" and "Private Residence" were inferred from the supplied photo filenames. **Confirm with the client before launch.**
3. **Commercial and hospitality photography.** One work-grid slot and (in the Services page) two figures are hatched placeholders reading "IMAGERY TO BE SUPPLIED". The hatch pattern is `repeating-linear-gradient(135deg, rgba(236,233,226,.07) 0 8px, transparent 8px 16px)` with a `1px solid rgba(236,233,226,.14)` border and centered Mono 10px `.2em` label in `rgba(236,233,226,.4)`.
4. **Founder portraits** (Studio page, out of scope here) — also placeholders.
5. **Phone number.** WhatsApp links use `https://wa.me/919876543210`, which is a **placeholder**. Replace.
6. **Instagram URL** is `#`.
7. **Statistics** are the client-confirmed set: founded 2005, 20+ years, 500+ projects, 22+ awards, 1 country. The old site's "12+ years / 80+ projects" figures are wrong — do not reintroduce them.

## Copy

All body copy is the client's own, taken verbatim from their existing site. **Do not rewrite it.**

- Hero H1: "Space is our medium."
- Hero lead: "Considered design for homes, workplaces, and hospitality."
- Studio lead: "Founded in 2005, F.Quad Studio is an award-winning architecture and interior design practice based in Hyderabad."
- Studio body 1: "Over the past two decades, we have delivered more than 500 residential, commercial, hospitality, retail, and institutional projects, combining thoughtful design with practical solutions and a client-first approach."
- Studio body 2: "Built on the principles of Functionality, Futuristic thinking, Friendly collaboration, and Flexibility, we create spaces that are purposeful, timeless, and tailored to the people who use them."
- Four F's — **Functional:** "We believe every design should serve a purpose. Our spaces are planned to be efficient, comfortable, and intuitive while maintaining a strong aesthetic identity."
- **Futuristic:** "We design with longevity in mind, creating spaces that adapt to changing lifestyles, technologies, and future needs."
- **Friendly:** "Collaboration is central to our process. We value open communication, transparency, and lasting relationships with every client."
- **Flexible:** "Every project is unique. Our ability to adapt, experiment, and respond to different styles and requirements allows us to deliver truly personalized design solutions."
- Testimonial: "F.QUAD transformed our home into a space that truly reflects who we are." — CLIENT, JUBILEE HILLS RESIDENCE
- CTA: "Have a project in mind?" / "Let us design a space that works for the way you live."

Service and process descriptions are written for this design (not from the source site) and can be edited by the client — they're in the prototype markup.

## Assets

Client-supplied photography, resized to 1800px wide, JPEG q80, in `design/assets/`:

| File | Subject | Used in Direction B |
|---|---|---|
| `a1.jpg` | Residence facade, daylight | Work grid; quad face 2 (Futuristic) |
| `a2.jpg` | Residence facade at dusk | **Hero photograph plane** |
| `a3.jpg` | Deck and landscape at dusk | Work grid (lead item) |
| `b21.jpg` | Living room with folding screens | Signature project; quad face 3 (Friendly) |
| `b23.jpg` | Interior detail | Quad face 1 (Functional) |
| `b25.jpg` | Formal seating with traditional daybed | Work grid; quad face 4 (Flexible) |
| `b22.jpg`, `b49.jpg`, `b61.jpg` | Further interiors | Direction A / Services only — included for reference |

Originals are in the project's `uploads/` folder at full resolution. For production, serve responsive `srcset` (the design uses images at up to full-viewport size, so ship 2560px variants) and prefer AVIF/WebP with JPEG fallback. The hero image (`a2.jpg`) should be preloaded — it's the LCP element.

No icon set is used. The only graphic marks are the 9×9px wordmark square, `→` and `◇` glyphs, and the CSS-drawn hero wireframe.

Fonts: Archivo, IBM Plex Mono (and Instrument Serif for Direction A) via Google Fonts. Self-host in production and subset to Latin.

## Performance notes

- The `420vh` and `260vh` sticky sections mean the page is long. Lazy-load below-the-fold imagery, but **eager-load the quad's four faces** — they're all visible within one rotation and popping in mid-scroll is very noticeable.
- The grain overlay uses `mix-blend-mode: overlay` over the full fixed viewport. On low-end GPUs this can cost real frames; consider gating it behind a capability check or replacing it with a small tiled PNG at `opacity:.5`.
- `backface-visibility:hidden` on the quad faces is required, not decorative — without it you see through the box.
- Test the hero on a 4K display: `perspective:1200px` is a fixed pixel value, so the depth effect flattens as the viewport grows. Consider scaling perspective with viewport width if the team supports very large screens.

## Files

```
design_handoff_fquad_cinema/
├── README.md                      ← this document
└── design/
    ├── F.QUAD Website.dc.html     ← the prototype (open in a browser, click "B · CINEMA")
    ├── support.js                 ← prototyping runtime; NOT for production
    └── assets/                    ← photography
```

Everything visual for Direction B lives in the single HTML file, in the block guarded by `isHomeB`. The motion logic is the `wire()` method of the `Component` class in the same file — read `frame()` for the per-frame math and the `IntersectionObserver` setup above it for the reveals.
