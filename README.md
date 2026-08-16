# F.QUAD Website — Complete Project Structure

## Overview
This is a **modular, incrementally-built Next.js website** for F.QUAD Architecture & Interior Design.

**Key Features:**
- ✅ Shared design tokens (colors, typography, spacing) — ensures all pages flow together
- ✅ Reusable Navigation & Footer components — consistent across all pages
- ✅ Larger, readable fonts (16px-52px base sizes)
- ✅ Consistent margins & padding (48px desktop, 32px tablet, 20px mobile)
- ✅ Built incrementally — pages added one at a time
- ✅ Ready to deploy to DigitalOcean server

---

## Folder Structure

```
FQuad-Website-Complete/
├── app/
│   ├── components/
│   │   ├── Navigation.tsx       ← Used on ALL pages
│   │   └── Footer.tsx           ← Used on ALL pages
│   ├── api/
│   │   └── contact/
│   │       └── route.ts         ← Contact form API
│   ├── contact/
│   │   └── page.tsx             ← Contact page (READY)
│   ├── about/
│   │   └── page.tsx             ← About page (BUILD NEXT)
│   ├── services/
│   │   └── page.tsx             ← Services page (BUILD AFTER ABOUT)
│   ├── projects/
│   │   └── page.tsx             ← Projects gallery (BUILD LATER)
│   ├── layout.tsx               ← Root layout (DO NOT CHANGE)
│   └── page.tsx                 ← Homepage (BUILD SOON)
├── lib/
│   └── design-tokens.ts         ← CENTRAL: Colors, fonts, spacing
├── public/
│   └── [logos & images go here]
├── .env.local.example           ← Copy to .env.local, add API key
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── next.config.js
└── README.md                    ← This file
```

---

## Design System (Used Across ALL Pages)

**Colors** (from `lib/design-tokens.ts`):
- Black: `#0D0D0D`
- White: `#F8F8F6`
- Gold: `#C4A97D`
- Grey: `#7A7870`

**Typography** (in pixels, increased for readability):
- h1: 52px (page headers)
- h2: 40px (section headers)
- h3: 32px (sub-headers)
- body_lg: 18px (large text)
- body: 16px (normal text)
- body_sm: 14px (small text)

**Spacing** (consistent padding/margins):
- Section gap: 64px
- Section padding: 48px (desktop), 32px (tablet), 20px (mobile)
- Component gap: 24px, 16px, 12px, 8px

**All pages import from `design-tokens.ts`** → ensures perfect consistency.

---

## Current Status

### ✅ READY (Can be deployed)
- `Navigation.tsx` — Appears on all pages
- `Footer.tsx` — Appears on all pages
- `design-tokens.ts` — Used everywhere
- `contact/page.tsx` — Contact page (COMPLETE)
- `api/contact/route.ts` — Email API (COMPLETE)

### ⏳ NEXT (Building order)
1. **Homepage** (`app/page.tsx`)
2. **About/Studio** (`app/about/page.tsx`)
3. **Services** (`app/services/page.tsx`)
4. **Projects** (`app/projects/page.tsx`)
5. **Client Portal** (`app/portal/page.tsx`)

---

## Setup Instructions (One-Time)

### 1. Install Dependencies
```bash
npm install
# or
yarn install
```

### 2. Install Resend for Email
```bash
npm install resend
```

### 3. Add Environment Variables
Create `.env.local` in the root:
```
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

Get your free API key: https://resend.com

### 4. Run Locally
```bash
npm run dev
# Visit http://localhost:3000/contact to test
```

### 5. Test Contact Form
- Fill out form
- Check admin email: admin@fquad.com
- Check auto-reply in your test email
- Should see success message

---

## How Pages Flow Together

### Navigation & Footer
Every page uses the same **Navigation.tsx** and **Footer.tsx**:
- Same header/nav on all pages
- Same footer on all pages
- Consistent spacing and colors

### Design Tokens
All pages import from **design-tokens.ts**:
```typescript
import { colors, typography, spacing } from '@/lib/design-tokens';
```

This ensures:
- Same colors everywhere
- Same fonts everywhere
- Same margins/padding everywhere
- Pages look cohesive when merged

### Example: How Contact Page Uses Tokens
```typescript
// In contact/page.tsx
<h1 style={{ fontSize: typography.h1, color: colors.black, ... }}>
  Get in touch
</h1>

<section style={{ padding: `${spacing.xxl} ${spacing.page_margin_desktop}` }}>
  ...
</section>
```

When you build the About page, it will use the **exact same tokens** → pages align perfectly.

---

## Adding New Pages (Future)

When building the About page, follow this template:

```typescript
// app/about/page.tsx

import Navigation from '@/app/components/Navigation';
import Footer from '@/app/components/Footer';
import { colors, typography, spacing } from '@/lib/design-tokens';

export default function AboutPage() {
  return (
    <main style={{ backgroundColor: colors.white }}>
      <Navigation /> {/* Same nav as all pages */}
      
      {/* Hero Section */}
      <section style={{ padding: `${spacing.xxl} ${spacing.page_margin_desktop}` }}>
        <h1 style={{ fontSize: typography.h1, color: colors.black }}>
          About F.QUAD
        </h1>
      </section>

      {/* More sections... */}

      <Footer /> {/* Same footer as all pages */}
    </main>
  );
}
```

**Key Points:**
- Always import Navigation & Footer
- Always use `colors`, `typography`, `spacing` from design-tokens
- Always use `padding: ${spacing.page_margin_desktop}` for desktop margins
- This ensures pages look identical in style and flow

---

## Color Palette Reference

Use these in all pages:

```typescript
colors.black         // #0D0D0D - Primary text/backgrounds
colors.white         // #F8F8F6 - Light backgrounds
colors.gold          // #C4A97D - Accents, hover states
colors.gold_dark     // #8B6F47 - Darker gold for hovers
colors.grey_dark     // #7A7870 - Secondary text
colors.grey_light    // #9C9890 - Muted text
colors.border        // #DEDBD4 - Dividers & borders
colors.bg_light      // #F8F8F6 - Light section backgrounds
colors.bg_dark       // #141414 - Dark hero backgrounds
colors.bg_darker     // #0D0D0D - Footer backgrounds
```

---

## Typography Reference

All font sizes (in pixels):

```typescript
typography.h1          // 52px - Page titles
typography.h2          // 40px - Section headers
typography.h3          // 32px - Sub-headers
typography.h4          // 24px - Card titles
typography.body_lg     // 18px - Large text
typography.body        // 16px - Default text
typography.body_sm     // 14px - Small text
typography.label       // 12px - Labels
typography.eyebrow     // 11px - Tiny section labels
```

---

## Spacing Reference

All padding/margins (consistent across pages):

```typescript
spacing.xs             // 8px
spacing.sm             // 12px
spacing.md             // 16px
spacing.lg             // 24px
spacing.xl             // 32px
spacing.xxl            // 48px

// For sections:
spacing.section_gap    // 64px (vertical gap between sections)
spacing.section_padding // 48px (horizontal padding)

// For pages:
spacing.page_margin_desktop  // 48px (left/right on desktop)
spacing.page_margin_tablet   // 32px (left/right on tablet)
spacing.page_margin_mobile   // 20px (left/right on mobile)
```

---

## Deployment Checklist

Before deploying to production:

- [ ] All 5 pages built (Home, About, Services, Projects, Contact)
- [ ] `.env.local` set with `RESEND_API_KEY`
- [ ] Domain verified in Resend (for email sending)
- [ ] All links tested (Navigation menu, footer links, CTAs)
- [ ] Contact form tested (emails sending correctly)
- [ ] Mobile responsive checked (use DevTools)
- [ ] Page load speed checked (use Lighthouse)

---

## Deploying to DigitalOcean

1. **Build for production:**
   ```bash
   npm run build
   ```

2. **Copy to server:**
   ```bash
   scp -r .next root@168.144.20.105:/var/www/fquad/html/
   ```

3. **Restart Nginx:**
   ```bash
   ssh root@168.144.20.105
   sudo systemctl restart nginx
   ```

4. **Check it's live:**
   ```
   Visit https://fquad.com
   ```

---

## Support & Customization

### Need to change colors?
Edit `lib/design-tokens.ts` → changes apply to ALL pages.

### Need to change font sizes?
Edit `typography` in `lib/design-tokens.ts` → all pages update.

### Need to change margins?
Edit `spacing` in `lib/design-tokens.ts` → all pages update.

### Need to add a new page?
1. Create new folder: `app/newpage/`
2. Create `page.tsx` inside
3. Import Navigation, Footer, design-tokens
4. Follow the template structure
5. Done! It flows with all other pages.

---

## File Locations

| File | Purpose |
|------|---------|
| `lib/design-tokens.ts` | Colors, fonts, spacing (CENTRAL) |
| `app/components/Navigation.tsx` | Header nav (shared) |
| `app/components/Footer.tsx` | Footer (shared) |
| `app/contact/page.tsx` | Contact page (READY) |
| `app/api/contact/route.ts` | Contact form API (READY) |
| `.env.local` | API keys (CREATE this) |
| `public/` | Images, logos, media |

---

## Next Steps

1. ✅ Contact page is READY
2. ⏳ Next: Build Homepage
3. ⏳ Then: Build About page
4. ⏳ Then: Build Services page
5. ⏳ Then: Build Projects gallery
6. ⏳ Finally: Build Client Portal

All pages will use the same design tokens, navigation, footer → they'll flow perfectly together.

---

## Questions?

Check individual page docs when created, or refer back to this README.

All files are organized, all pages will be built incrementally, and at the end you'll have one complete, production-ready website folder to deploy.

Ready to move forward? Let me know which page to build next! 🎯
