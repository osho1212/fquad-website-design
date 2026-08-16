# FQuad Website - Setup & Deployment Guide

## Quick Start (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Create Environment File
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Resend API key:
```
RESEND_API_KEY=re_xxxxxxxxxxxxxx
```

Get free key at: https://resend.com/api-keys

### 3. Run Locally
```bash
npm run dev
```

Visit: http://localhost:3000/contact

### 4. Test Contact Form
- Fill form and submit
- Check admin@fquad.com for submission
- Check your email for auto-reply
- Confirm success message appears

---

## Project Structure

```
FQuad-Website-Complete/
├── app/
│   ├── components/          ← Shared Nav & Footer
│   ├── api/contact/route.ts ← Email API
│   ├── contact/page.tsx     ← Contact page (READY)
│   └── layout.tsx           ← Root layout
├── lib/
│   └── design-tokens.ts     ← Colors, fonts, spacing (CENTRAL!)
├── public/                  ← Images, logos
├── package.json
├── .env.local              ← Create this (API keys)
├── .env.local.example      ← Template
└── README.md
```

---

## Design System (Critical!)

All pages use `lib/design-tokens.ts`:

**Colors:**
- `colors.black` = #0D0D0D
- `colors.white` = #F8F8F6
- `colors.gold` = #C4A97D
- `colors.grey_dark` = #7A7870

**Typography:**
- `typography.h1` = 52px
- `typography.h2` = 40px
- `typography.body` = 16px
- `typography.body_sm` = 14px

**Spacing:**
- `spacing.page_margin_desktop` = 48px
- `spacing.section_gap` = 64px
- `spacing.xl` = 32px

**When building new pages, ALWAYS import:**
```typescript
import { colors, typography, spacing } from '@/lib/design-tokens';
```

This ensures all pages look cohesive.

---

## Building Pages (Future)

### Template for New Pages

```typescript
// app/about/page.tsx

import Navigation from '@/app/components/Navigation';
import Footer from '@/app/components/Footer';
import { colors, typography, spacing } from '@/lib/design-tokens';

export default function AboutPage() {
  return (
    <main style={{ backgroundColor: colors.white }}>
      <Navigation />
      
      <section style={{ padding: `${spacing.xxl} ${spacing.page_margin_desktop}` }}>
        <h1 style={{ fontSize: typography.h1, color: colors.black }}>
          About Us
        </h1>
      </section>

      <Footer />
    </main>
  );
}
```

**Key Rules:**
1. Always import Navigation & Footer
2. Always import design-tokens
3. Always use colors/typography/spacing from tokens
4. Always set `backgroundColor: colors.white` on main
5. Always use `padding: spacing.page_margin_desktop` for side margins

---

## Deployment to DigitalOcean

### Prerequisites
- SSH access to server (root@168.144.20.105)
- API key in `.env.local`

### Step 1: Build for Production
```bash
npm run build
```

### Step 2: Test Build Locally
```bash
npm run start
```
Visit http://localhost:3000 to confirm it works.

### Step 3: Copy to Server

**Option A: Using Git (Recommended)**
```bash
# On your machine
git add .
git commit -m "Site updates"
git push

# On server
cd /var/www/fquad/html
git pull origin main
npm install
npm run build
sudo systemctl restart nginx
```

**Option B: Direct Copy**
```bash
# Build locally
npm run build

# Copy to server
scp -r .next root@168.144.20.105:/var/www/fquad/html/
scp -r node_modules root@168.144.20.105:/var/www/fquad/html/
scp package.json root@168.144.20.105:/var/www/fquad/html/

# On server
ssh root@168.144.20.105
cd /var/www/fquad/html
npm install
npm run build
sudo systemctl restart nginx
```

### Step 4: Verify Live
```
Visit https://fquad.com
```

---

## Environment Variables

### Create `.env.local`
```bash
cp .env.local.example .env.local
```

### Fill In Values
```
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

### NEVER commit to Git
Add to `.gitignore` (already done):
```
.env.local
.env*.local
```

---

## Troubleshooting

### "Cannot find module '@/lib/design-tokens'"
- Check `tsconfig.json` has paths configured
- Verify `design-tokens.ts` exists in `lib/` folder
- Restart dev server: `npm run dev`

### "RESEND_API_KEY is undefined"
- Check `.env.local` file exists in root
- Verify API key is set correctly
- Restart dev server

### Contact form not sending emails
- Check API key is valid at https://resend.com
- Verify domain is set up in Resend dashboard
- Check email format is correct in code
- Look at browser console (F12) for errors

### Pages don't look aligned
- Check all pages import from `design-tokens.ts`
- Verify `spacing.page_margin_desktop` is used for margins
- Check colors match `colors.black`, `colors.gold`, etc.

---

## Maintenance

### Adding New Pages
1. Create folder: `app/pagename/`
2. Create `page.tsx` using template above
3. Import Navigation, Footer, design-tokens
4. Follow spacing/color conventions
5. Test locally: `npm run dev`
6. Deploy to server

### Updating Colors
Edit `lib/design-tokens.ts`:
```typescript
export const colors = {
  black: '#0D0D0D',  // Change here
  white: '#F8F8F6',  // Change here
  // etc
};
```
Changes apply to ALL pages automatically.

### Updating Fonts
Edit `lib/design-tokens.ts`:
```typescript
export const typography = {
  h1: '52px',    // Change here
  body: '16px',  // Change here
  // etc
};
```
Changes apply to ALL pages automatically.

---

## Performance Optimization

### Enable Image Optimization
Edit `next.config.js`:
```javascript
images: {
  unoptimized: false,  // Use optimized images
  formats: ['image/avif', 'image/webp'],
},
```

### Check Lighthouse Score
```bash
npm run build
npm run start
# Open DevTools (F12) → Lighthouse → Analyze page load
```

### Cache Control
Already set in `next.config.js`:
```javascript
'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
```
(1 hour cache, 1 day fallback if server down)

---

## Version Control (Git)

### Initialize Repository
```bash
git init
git add .
git commit -m "Initial commit - FQuad website"
git remote add origin https://your-repo-url
git push -u origin main
```

### Before Committing
- Never commit `.env.local`
- Never commit `node_modules/`
- Never commit `.next/` build folder
- `.gitignore` handles this automatically

---

## Questions?

Refer to:
1. `README.md` — Project overview
2. `lib/design-tokens.ts` — All colors/fonts/spacing
3. `app/contact/page.tsx` — Example page structure
4. `app/components/` — Reusable components

All files are organized for easy maintenance and incrementally building pages.

Ready to build the next page! 🚀
