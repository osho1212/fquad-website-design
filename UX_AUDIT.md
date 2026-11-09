# F.QUAD — UX / UI audit

Audited 9 Nov 2026 against the local build, desktop (1280×720) and mobile (375×812),
every public route plus the 404, `robots.txt`, `sitemap.xml` and the share/icon assets.
Each page was measured with the same in-browser script: metadata, landmarks, heading
order, alt text, accessible names, form labels, target sizes, text size, WCAG contrast,
horizontal overflow, dead links, request count and transfer size.

Status key — **Fixed** (done in this pass) · **Open** (needs a decision or content from the studio).

---

## 1. The headline finding

**The site was two different websites.** Home, Services, Studio, Projects and Contact
used one design system (floating pill nav, Tailwind, theme tokens). About, Team, Awards,
Journal and Testimonials used a second, hand-pasted one: a ~100-line inline `<style>`
block per page, hard-coded hex colours, a different nav, a different footer, and inline
`<script>`s. Visitors crossing between them felt the seam; the legacy pages also broke
in ways the modern ones didn't (below). Every page now sits in one frame:
`PageShell` (navbar + `<main>` + footer) → `PageHero` → `Section`.

## 2. Scorecard (before → after)

| Measure | Before | After |
| --- | --- | --- |
| Home: transferred on arrival | 19.8 MB · 211 requests | 6–9 MB · 33–80 requests |
| Home: off-screen images not lazy | 26 | 0 |
| Home: undersized tap targets (<24px) | 9 | 0 |
| Home: text under 11px | 36 | 2 |
| Home: dead `href="#"` links | 2 | 0 |
| Contact: form fields without a label | 7 of 7 | 0 |
| Contact: text under 11px | 47 | 2 |
| `<main>` landmark / skip link | none on any page | every page |
| Canonical + Open Graph | none | every page |
| Own `<title>` / description | 5 of 12 pages | all pages |
| `robots.txt`, `sitemap.xml`, manifest, favicon, share image | all 404 | all 200 (sitemap lists 22 URLs) |
| 404 page | bare "404" text, no nav, no links | branded, with the 3 places people want |
| Mobile menu | links tabbable while hidden, no state announced, no Escape | hidden = not focusable, `aria-expanded`, Escape closes |

### Final re-audit, every route (desktop 1280, then mobile 375 on the rebuilt pages)

All 13 routes now have `<main>`, a skip link, a canonical URL, Open Graph tags, a page-specific
title and description, zero unlabeled controls, zero dead links, zero horizontal overflow and
zero contrast failures (the one flagged item on Home is a false positive: the metallic button's
gradient background isn't visible to the checker). Remaining undersized targets are the contact
page's 16px checkbox (its label is the real hit area) and nothing else. The production build
(`next build`) compiles and prerenders every route.

| Page | Was | Now |
| --- | --- | --- |
| `/about` | horizontal overflow, 20 low-contrast, 18 tiny targets, generic title | no overflow, 0 / 0, own title + description |
| `/team` | 1,034px "coming soon" | 2,742px: founders as the team, intro request, CTA |
| `/awards` | 1,278px "coming soon" | 2,521px: recognitions as a typographic list, by-year when rows exist |
| `/blog` | 1,166px "coming soon" | 2,943px: editorial note, four topic cards, CTA; full article template ready |
| `/testimonials` | 1,118px "coming soon" | 1,945px: featured quote, list when rows exist, invitation |

## 3. Findings

### Critical
1. **Two design systems** (above). *Fixed.*
2. **Dead-end "coming soon" pages.** `/team`, `/awards`, `/blog` and `/testimonials` each rendered a
   ~1,000px page that was a heading and the words "coming soon", linked from the footer.
   *Fixed* — each now falls back to real CMS content (founders, recognitions, the featured
   quote, editorial topics) with a clear next action, and fills out automatically when
   rows are added in Admin.
3. **Legacy reveal script never re-ran on client-side navigation**, so content marked
   `.reveal` could stay at `opacity: 0` after navigating from another page. *Fixed* by
   removing the inline scripts; reveals now run from React.
4. **`/about` overflowed horizontally on desktop** and had 20 text elements below WCAG
   contrast (2.6–3.3:1). *Fixed* — rebuilt on theme tokens.
5. **Production build failed on 3 routes** (`/about`, `/testimonials`, `/api/site-settings`).
   Cause: a stale generated Prisma client in `node_modules` still asked for a column the
   pulled schema removed (`siteName`). The database was fine. *Fixed* by regenerating the client
   (`npx prisma generate`, which `postinstall` already runs); no data was touched.

### High
6. **No SEO plumbing.** No canonical URLs, Open Graph/Twitter cards, `robots.txt`,
   `sitemap.xml`, manifest, favicon or share image; six pages inherited the site-wide title
   and description, so every search result and share looked identical. *Fixed* —
   `pageMetadata()` on every page, generated 1200×630 share card, sitemap built from
   services/projects/posts, `ProfessionalService` JSON-LD site-wide plus `Service`,
   `CreativeWork`, `Article` and `BreadcrumbList` on detail pages.
7. **Accessibility gaps.** No landmark or skip link; contact form labels not bound to their
   inputs (all 7); option buttons didn't expose selected state; the file drop-zone was
   mouse-only; mobile drawer links stayed in the tab order while hidden; slider dots were
   5×5px; many 15–20px-tall links. *Fixed* (details in §4).
8. **Page weight.** The hero preloaded all 190 frames (11 MB) alongside everything else.
   *Fixed* — look-ahead window around the scroll position, 6 requests in flight, a small
   mobile frame set, thinner set on data-saver / 2g / 3g, one-week cache on the frames.
9. **Footer was inconsistent** — three different endings across the site, and the shared
   logo was white-on-white in light theme. *Fixed* — one footer, monochrome logo in both themes.

### Medium
10. **Micro-typography.** 95 labels set at 8–10.5px. *Fixed* — floor is 11px.
11. **Legacy contrast.** Grey-on-cream at 2.6–3.3:1 across the legacy pages. *Fixed* by token migration.
12. **`next/image` is configured but unused**; the projects index ships 32 raw images (~7 MB).
    *Open* — recommend migrating gallery images to `next/image` with `sizes`, using the
    variants the media library already generates.
13. **Security headers.** *Fixed* — `nosniff`, `Referrer-Policy`, `X-Frame-Options`,
    `Permissions-Policy`. No CSP yet: the boot scripts and Maps embed need nonces first. *Open*.

### Content & data — needs the studio
14. **Placeholder phone number is public.** The contact page falls back to `+919876543210`
    when Settings has no WhatsApp number. Set the real number in Admin → Settings.
15. **Two different emails** are in use (`admin@fquad.com` in code, `admin@fquad.co` in the database).
    Pick one; the code fallback is now a single constant in `lib/site.ts`.
16. **No Privacy / Terms pages.** The footer previously linked `#`. Those links are now hidden
    until real pages exist. The enquiry form collects name, phone, email and plan files, so a
    privacy notice is worth having — it needs the studio's own wording.
17. **Journal, Team and Testimonials are empty in the database**, so they show fallback content.
    Real portraits, posts and client quotes will lift these pages most.

## 4. What changed (by area)

- **System:** `PageShell`, `PageHero`, `Section`, `Footer` (`components/layout`); `lib/site.ts`
  (one source for studio details), `lib/seo.ts`; `app/not-found.tsx`, `app/error.tsx`.
- **Hero:** new sketch → clay → render film (190 frames, 1440px desktop / 800px phone, WebP,
  34 MB → 16 MB on disk), ink-on-paper then white-on-render type, F.QUAD cut-out finale with a
  separate portrait composition so the title is never cropped.
- **Interior-design 3D:** furniture kit (sofa, armchair, bed, lamps, plant, shelving, rug, art) with
  procedural wood/rug/art textures — a living room that furnishes itself on scroll, a bedroom that
  moves brief → clay massing → real furniture → styled, and a lounge corner that reacts to the pointer.
- **Accessibility:** landmarks + skip link (focus follows the scroll), bound form labels,
  `aria-pressed` option groups, keyboard-operable upload, 28×32px dot hit areas, 24–44px targets,
  11px type floor, announced error banner, accessible mobile drawer.
- **Performance:** windowed hero loading, lazy gallery images, cached hero frames, cached
  site settings (one query per request instead of three).
- **Housekeeping:** removed the legacy `SiteNav`, `SiteFooter`, `FourPillars` and `CountUp`
  (now unused), the replaced 114-frame hero sequence (34 MB), and the `framer-motion`
  dependency; `RevealOnScroll` now runs on the shared reveal system instead of its own.
- **Known shared-code limits** (documented, not bugs on current content): the `fq-link`
  underline sits at the bottom of its box, so put it on an inner span when the link is taller
  than ~32px; `.btn-metallic` sets its own padding after Tailwind's utilities, so size
  utilities need `!`; `PageHero` can't colour a second headline line differently.

## 5. Recommended next
1. Real photography for Team, a first three Journal posts, and 3–5 client quotes.
2. `next/image` for the projects gallery (largest remaining weight).
3. A privacy notice, then a CSP with nonces.
4. Analytics + Core Web Vitals reporting, so the next audit has field data, not lab data.
5. A reduced-motion review on a real device (the code path is in place and was tested only via emulation).
