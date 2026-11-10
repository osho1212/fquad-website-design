# Deploying: Vercel + Firebase

Where things live:

| What | Where |
|---|---|
| The website (pages, admin, forms) | **Vercel** (runs the Next.js app) |
| Records: page text, settings, team, awards, journal, enquiries, admin accounts | **Firestore** (Firebase's database) |
| Pictures and the plans visitors attach | **Cloud Storage** (Firebase's file storage) |
| Email from the forms | **Resend** |

Nothing is stored on Vercel itself, which is what makes it work: Vercel runs short-lived functions with no permanent disk.

Do the parts in order: **A** Firebase, **B** your existing content, **C** Vercel, **D** check it works, then **E** email DNS.

---

## A. Create the Firebase project (once)

1. **Create the project** at the [Firebase console](https://console.firebase.google.com/) → *Add project*. Name it (for example `fquad-prod`). Google Analytics is not needed.

2. **Switch it to the Blaze (pay-as-you-go) plan.** Cloud Storage for Firebase [requires it](https://firebase.google.com/docs/storage/faqs-storage-changes-announced-sept-2024) (Spark-plan projects have no access to their storage buckets), and Firestore backups need billing too. Blaze has no monthly fee: you pay only for use, and a site this size should use very little. I have not measured it, so set a **budget alert** (Google Cloud console → [Billing](https://console.cloud.google.com/billing) → *Budgets & alerts*) so a surprise cannot go unnoticed.

3. **Create Firestore.** *Build → Firestore Database → Create database.* Choose **Native mode** and the location **asia-south1 (Mumbai)**, which suits visitors in India and **cannot be changed later**. Start in *production mode* (everyone locked out of the database directly; the website uses a server key instead).

4. **Create Cloud Storage.** *Build → Storage → Get started.* Use the same location. Note the **bucket name** it shows (for example `fquad-prod.firebasestorage.app`): it becomes `FIREBASE_STORAGE_BUCKET`.

5. **Make a server key.** *Project settings (gear) → Service accounts → Generate new private key.* A JSON file downloads. **Keep it secret and never commit it**: it can read and change everything in the project.

6. **Apply four settings with Google's command-line tool.** The easiest way is [Cloud Shell](https://console.cloud.google.com/) (the `>_` button at the top right of the Google Cloud console, signed in with the same Google account, project selected). Upload `firebase/storage-cors.json` and `firebase/storage-lifecycle.json` from this repo (Cloud Shell menu ⋮ → *Upload*), open `storage-cors.json` and make sure the `origin` list has your real domain, then run, replacing `BUCKET` with the bucket name from step 4:

   ```bash
   # Lets the browser send photos and plans straight to the bucket (see "Why" below)
   gcloud storage buckets update gs://BUCKET --cors-file=storage-cors.json

   # Deletes unfinished uploads after a day
   gcloud storage buckets update gs://BUCKET --lifecycle-file=storage-lifecycle.json

   # Removes expired rate-limit records automatically (within about a day of expiry)
   gcloud firestore fields ttls update expiresAt --collection-group=rateLimits --enable-ttl

   # A daily backup of the database, kept for 14 weeks (the maximum for a daily schedule)
   gcloud firestore backups schedules create --database='(default)' --recurrence=daily --retention=14w
   ```

   References: [CORS](https://docs.cloud.google.com/storage/docs/using-cors), [lifecycle rules](https://docs.cloud.google.com/storage/docs/managing-lifecycles), [TTL](https://docs.cloud.google.com/firestore/docs/ttl), [backups](https://docs.cloud.google.com/firestore/docs/backups).

   *Why the CORS rule:* Vercel's functions refuse request bodies over 4.5 MB, so photos and plans never pass through the site. The site gives the browser a short-lived address and the browser sends the file to Cloud Storage directly; that needs the bucket to allow your domain.

7. **Security rules.** The rules in this repo (`firestore.rules`, `storage.rules`) refuse every direct request, which is what you want because only the website's server talks to Firebase. A project created in production mode already has the same lock; nothing more to do.

---

## B. Bring your existing content in (once)

This copies the old SQLite database and its pictures into Firebase. Do it on a computer that has the old `dev.db` and `public/uploads` (a copy was saved in `fquad-content-backup-2026-11-10`).

1. Create `.env.local` in the project folder from `.env.example`. Fill in `FIREBASE_SERVICE_ACCOUNT` (paste the whole JSON from step A5) and `FIREBASE_STORAGE_BUCKET`.

2. Try it first without writing anything (needs Node 22):

   ```bash
   npm run db:import -- "<path>/dev.db" --uploads "<path>/uploads" --skip-admin --dry-run
   ```

   It should report 88 images, 12 folders, 2 content sections, 1 settings record and 352 files.

3. Run it for real (drop `--dry-run`). It prints a check at the end comparing what it imported with what is now in Firestore and Storage. It is safe to run again.

4. Create the admin account with a new password (the old one still used the default):

   ```bash
   ADMIN_EMAIL=admin@fquad.com ADMIN_PASSWORD='a-long-unique-password' npm run db:seed
   ```

   (`--skip-admin` above left the old account behind on purpose.)

To start with an empty site instead, skip steps 2 and 3 and just seed.

---

## C. Put the site on Vercel

1. **Plan.** Vercel's free *Hobby* plan is for non-commercial use only ([fair-use rules](https://vercel.com/docs/limits/fair-use-guidelines)); a studio's website needs the **Pro** plan ([pricing](https://vercel.com/pricing)).

2. **Import the repository** at [vercel.com/new](https://vercel.com/new) → pick `osho1212/fquad-website-design`. Next.js is detected; keep the default build settings. Every push to `main` then deploys to production, and every pull request gets its own preview address.

3. **Environment variables** (*Project → Settings → Environment Variables*; mark the secrets *Sensitive*). Names and meanings are in `.env.example`:

   | Variable | Value |
   |---|---|
   | `FIREBASE_SERVICE_ACCOUNT` | the whole JSON file from step A5 |
   | `FIREBASE_STORAGE_BUCKET` | the bucket name from step A4 |
   | `SESSION_SECRET` | 32+ random characters: `openssl rand -base64 48` |
   | `NEXT_PUBLIC_SITE_URL` | `https://fquad.com` (or the `www` form you choose) |
   | `RESEND_API_KEY`, `MAIL_FROM`, `ENQUIRY_TO` | from [Resend](https://resend.com/api-keys) |
   | `GOOGLE_SITE_VERIFICATION` | optional, from Search Console |

   Add the Firebase variables to **Production only**. A preview deployment without them still shows the site with its shipped copy, but cannot reach your real data, so a test pull request can never change it.

4. **Region.** `vercel.json` already sets the functions to `bom1` (Mumbai), next to the database.

5. **Deploy**, then open `https://<your-project>.vercel.app/api/health`: it should say `{"status":"ok"}`. (Vercel's default protection hides the `.vercel.app` addresses behind a Vercel login; the real domain in the next step is public, but check *Settings → Deployment Protection* so Production is not protected.)

6. **Domain.** *Project → Settings → Domains* → add `fquad.com` and `www.fquad.com`, pick one as the main address and redirect the other to it. Vercel shows the exact DNS records to create at your DNS provider ([guide](https://vercel.com/docs/domains/set-up-custom-domain)). **Leave the MX records alone**: they carry your email. HTTPS is set up automatically.

   If you change the domain later, update `NEXT_PUBLIC_SITE_URL` and the `origin` list in the bucket's CORS rule (step A6).

---

## D. Check it works

- `bash scripts/smoke-test.sh https://fquad.com` — about 40 quick checks: pages, the admin closed to visitors, forms, headers, health.
- Sign in at `/admin/login`.
- **Admin → Media Library:** upload a photo, open it, delete it.
- **Contact → Start a Project:** send a test brief **with a plan attached**, then find it in **Admin → Enquiries** and download the plan.
- Check the notification email arrived (after part E).
- Add an uptime monitor ([UptimeRobot](https://uptimerobot.com/)) on `https://fquad.com/api/health`; it answers 200 only when Firestore is reachable.

---

## E. Email DNS (Resend)

Needed before the forms can email reliably. A live DNS check on 10 Nov 2026 found that `fquad.com` has Google Workspace mail (`MX smtp.google.com`) and a DMARC record with **policy `quarantine`**, but **no SPF record, no Google DKIM key and no Resend records**. With a `quarantine` policy, mail that fails SPF and DKIM goes to spam, so enquiry notifications (and the studio's normal mail) can be quarantined until this is fixed.

1. In [Resend → Domains](https://resend.com/domains) add `fquad.com`. It lists the exact records to create: a DKIM `TXT` at `resend._domainkey`, and an SPF `TXT` plus an `MX` on the `send` subdomain ([how it works](https://resend.com/docs/dashboard/domains/introduction)). Add them at your DNS provider (the DMARC report address points at GoDaddy / `secureserver.net`, so the DNS is probably there) and click **Verify**.
2. Add an [SPF record](https://support.google.com/a/answer/33786) for the root so the studio's Google mail passes too: `TXT  @  "v=spf1 include:_spf.google.com ~all"`.
3. In Google Admin → Apps → Google Workspace → Gmail → **Authenticate email**, generate the [DKIM key](https://support.google.com/a/answer/180504), add the `google._domainkey` record it shows, and turn authentication on.
4. Send a test enquiry; confirm it lands in the inbox (not spam). In Gmail, *Show original* should say SPF, DKIM and DMARC all **PASS**.

---

## Running it

- **Updates:** push to `main` and Vercel deploys. CI (type check, build, smoke test and end-to-end test against the emulators) runs on every pull request.
- **Backups:** Firestore keeps a daily backup (step A6). Pictures live in Cloud Storage; the upload keeps the processed sizes (up to 1920 px, watermarked), **not the original file**, so keep the original photos somewhere too.
- **Costs:** Vercel Pro (per seat per month), Firebase Blaze (usage-based) and Resend (free tier for low volume). Watch the first month's bills.
- **Logs and errors:** Vercel dashboard → *Logs*. Error alerts (Sentry) are not set up.

## What changed from the old server setup

- There is no server to look after: no Nginx, no PM2, no cron backups, no disk.
- **Video uploads in the media library are not available** (images only). The library had no video in it; the hero film and background video are ordinary files in the site.
- Rate limits (login, forms) now live in Firestore, because in-memory counts do not work across Vercel's short-lived functions.
- The old droplet guide (`SERVER_SETUP.md`) and the SQLite version of the code are in git history, in the commits before this change.

## Local development

See [README.md](README.md). The Firebase emulators run Firestore and Cloud Storage on your machine, so nothing touches the real project.
