# FQuad Website - Getting Started Checklist

Follow these steps in order. Check them off as you complete each one!

---

## 📋 Pre-Setup Checklist

- [ ] You have the `FQuad-Website-Complete/` folder
- [ ] You have Node.js installed (v18+)
  - Check: `node --version`
- [ ] You have npm installed
  - Check: `npm --version`

---

## 🚀 Setup (First Time Only)

### Step 1: Enter Project Folder
```bash
cd FQuad-Website-Complete
```
- [ ] Folder opened in terminal

### Step 2: Install Dependencies
```bash
npm install
```
- [ ] All packages installed (takes 2-3 minutes)
- [ ] No error messages

### Step 3: Create Environment File
```bash
cp .env.local.example .env.local
```
- [ ] `.env.local` file created in root folder

### Step 4: Add API Key
1. Go to https://resend.com/api-keys
2. Sign up or log in
3. Copy your API key
4. Open `.env.local` in text editor
5. Paste key after `RESEND_API_KEY=`

Example:
```
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

- [ ] API key added to `.env.local`
- [ ] File saved

---

## 💻 Run Locally

### Step 1: Start Development Server
```bash
npm run dev
```

You should see:
```
> ready started server on 0.0.0.0:3000, url: http://localhost:3000
```

- [ ] Server running without errors

### Step 2: Visit Contact Page
Open browser and go to:
```
http://localhost:3000/contact
```

You should see:
- Navigation bar with "F.QUAD" logo
- "Get in touch" heading
- Contact form with fields
- Google Maps
- Instagram/WhatsApp links
- Footer

- [ ] Page loads correctly
- [ ] Layout looks good on your screen

---

## ✉️ Test Contact Form

### Step 1: Fill Form
1. Enter name: "Test User"
2. Enter email: your@email.com (use a real email you can check)
3. Enter message: "This is a test message"
4. Check the WhatsApp checkbox
5. Click "SEND MESSAGE"

- [ ] Form submitted
- [ ] Success message appeared on page

### Step 2: Check Admin Email
Check your email at **admin@fquad.com** (you won't actually receive it, but that's where it would go in production)

Instead, check if form processing worked:
- [ ] No error in browser console (F12)
- [ ] Success message appeared

### Step 3: Verify Email Setup (Important!)
For production, you need to set up email properly in Resend:
1. Go to https://resend.com/emails
2. Verify your email domain
3. Update `admin@fquad.com` and `contact@fquad.com` in the code

- [ ] Understand email will need domain verification for production

---

## 📚 Read Documentation

Read these in order:
1. [ ] `README.md` — Understand project structure
2. [ ] `PROJECT_SUMMARY.md` — See what's included
3. [ ] `SETUP_GUIDE.md` — Learn deployment options

---

## 🎨 Explore Design System

Open these files to understand the design:

1. [ ] `lib/design-tokens.ts` — All colors, fonts, spacing
2. [ ] `app/contact/page.tsx` — How a page is built
3. [ ] `app/components/Navigation.tsx` — Shared header
4. [ ] `app/components/Footer.tsx` — Shared footer

Notice how they all use values from `design-tokens.ts` → this ensures consistency!

---

## 📝 Study Patterns

Open `QUICK_REFERENCE.md` and try copy-pasting patterns:

- [ ] Understand page template structure
- [ ] Understand two-column layout pattern
- [ ] Understand button patterns
- [ ] Understand card patterns

These will help when building new pages!

---

## 🛑 Stop & Confirm

Before moving to next step, confirm:
- [ ] `npm run dev` works without errors
- [ ] http://localhost:3000/contact loads
- [ ] Page displays correctly
- [ ] Form submits without errors
- [ ] You've read README.md

If anything above doesn't work:
1. Check `.env.local` has API key
2. Check no typos in filenames
3. Restart dev server: `npm run dev`
4. Clear browser cache (Ctrl+Shift+Delete)

---

## 🚀 Next: Building More Pages

When ready to build the next page (like About or Homepage):

1. [ ] Create new folder: `app/pagename/`
2. [ ] Create `page.tsx` inside
3. [ ] Open `QUICK_REFERENCE.md`
4. [ ] Copy "Page Template" from it
5. [ ] Customize with your content
6. [ ] Test at http://localhost:3000/pagename

All pages will:
- Have same nav & footer
- Use same colors, fonts, spacing
- Look cohesive together

---

## 🌐 Deploy to Production

When pages are complete:

1. [ ] Build: `npm run build` (test locally)
2. [ ] Follow `SETUP_GUIDE.md` deployment section
3. [ ] Copy to DigitalOcean server
4. [ ] Restart Nginx
5. [ ] Visit https://fquad.com to confirm

---

## 📋 Final Checklist

- [ ] Project folder opened
- [ ] `npm install` completed
- [ ] `.env.local` created with API key
- [ ] `npm run dev` works
- [ ] Contact page loads at http://localhost:3000/contact
- [ ] Contact form submits
- [ ] README.md read
- [ ] Design tokens understood
- [ ] Ready to build more pages

---

## 🎉 You're Ready!

You now have:
✅ A organized Next.js project
✅ Shared design system (colors, fonts, spacing)
✅ Working contact page with email
✅ Documentation for everything
✅ Templates for building new pages

**Next Step:** Read `PROJECT_SUMMARY.md` then start building the Homepage or About page!

---

## 💬 Need Help?

1. Check the documentation files
2. Look at `app/contact/page.tsx` as an example
3. Copy patterns from `QUICK_REFERENCE.md`
4. Verify `.env.local` has correct API key

Everything is documented! You've got this! 🚀
