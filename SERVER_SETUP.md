# F.QUAD — Server Setup Notes

Running checklist of everything that needs to happen on **pta-webblr-01**
(DigitalOcean, Bangalore BLR1) to get the CMS-powered site live. I'll keep
adding to this as each build phase lands — by the time we deploy, this
should be a complete step-by-step.

Status: **Phase 1 (auth + database) done.** Sections below marked
`[ ]` are not needed yet but are listed so nothing gets missed later.

---

## 1. System requirements

- [x] Node.js 18.18+ (Next.js 14 requirement) — check with `node -v`
- [x] npm (comes with Node)
- [ ] `ffmpeg` — needed from Phase 2 (video compression/poster frames).
      Install with: `sudo apt update && sudo apt install -y ffmpeg`
- [x] SQLite — no install needed, Prisma bundles its own driver. The
      database is just a file (`prisma/dev.db` by default).

`sharp` (image resizing, Phase 2) ships prebuilt binaries for Linux x64,
so a plain `npm install` on the droplet should work without extra build
tools. If `npm install` complains about sharp, run:
`sudo apt install -y build-essential python3` and reinstall.

---

## 2. Environment variables

Copy `.env.local.example` → `.env.local` on the server and fill in:

| Variable | Notes |
|---|---|
| `RESEND_API_KEY` | from the contact-form phase, unchanged |
| `DATABASE_URL` | `file:./prisma/dev.db` (or an absolute path — see §3) |
| `SESSION_SECRET` | generate with `openssl rand -base64 32`, keep this secret |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | only used once by the seed script to create the first admin — **change the password from the admin panel after first login**, then these can stay as-is or be removed |

`.env.local` is gitignored — it has to be created directly on the server,
not pulled from the repo.

---

## 3. Database file — persistence

The SQLite file is the entire CMS database (projects, page text, settings).
**This file must survive redeploys and be backed up.**

Recommended: point `DATABASE_URL` at a path *outside* the app's deploy
directory, e.g. `file:/var/data/fquad/app.db`, so that redeploying the app
code never touches it. Make sure the directory exists and is writable by
whichever user runs the Node process:

```bash
sudo mkdir -p /var/data/fquad
sudo chown <deploy-user>:<deploy-user> /var/data/fquad
```

Back up this file regularly (a simple nightly `cp` to a dated filename, or
add it to whatever backup routine the droplet already has).

---

## 4. First-time setup commands

From the project directory on the server, after `.env.local` is in place:

```bash
npm install
npx prisma generate
npx prisma db push      # creates tables from schema.prisma
npm run db:seed         # creates first admin user + default content
npm run build
```

Then log in at `https://fquad.com/admin/login` with `ADMIN_EMAIL` /
`ADMIN_PASSWORD` from `.env.local`, and **change the password immediately**
(password-change UI lands in a later phase — until then, update it by
re-running the seed with a new `ADMIN_PASSWORD` and deleting the old
`AdminUser` row, or ask me for a one-off script when we get there).

---

## 5. Running the app (process manager)

Next.js needs to run as a persistent process behind Nginx. Recommended:
PM2.

```bash
sudo npm install -g pm2
pm2 start npm --name fquad -- start
pm2 save
pm2 startup    # follow the printed instructions to enable on boot
```

To redeploy after changes:

```bash
git pull                # or however code gets onto the server
npm install
npx prisma db push       # only if schema.prisma changed
npm run build
pm2 restart fquad
```

---

## 6. Nginx

Existing Nginx config (from earlier setup) should reverse-proxy to the
Next.js port (default 3000). No changes needed for Phase 1.

**[ ] Phase 2 note:** once media uploads exist, uploaded files will live
on disk (e.g. `/var/data/fquad/media`). We'll add an Nginx location block
to serve that directory directly (faster than proxying through Node) —
I'll provide the exact config when we get there.

---

## 7. Admin routes

- `/admin/login` — public
- `/admin` and everything under `/admin/*` — requires login, enforced by
  `middleware.ts`. Nothing extra needed in Nginx; this is handled by the
  app itself.

---

## Open items for later phases

- [ ] `ffmpeg` install (Phase 2 — video processing)
- [ ] `/var/data/fquad/media` directory + Nginx static serving (Phase 2)
- [ ] Password-change UI (so the seed password doesn't need to linger)
- [ ] Backup routine for `app.db` and `/var/data/fquad/media`
- [ ] SSL/domain (separate, already tracked elsewhere — Adroit domain
      transfer pending)
