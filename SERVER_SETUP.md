# F.QUAD — Server Setup

Everything that has to happen on **pta-webblr-01** (DigitalOcean, Bangalore
BLR1) to run the site in production. The site must run on a server with a
**persistent disk** (this one): the CMS writes a SQLite database file and
saves uploaded media to disk, so serverless hosts (Vercel, Netlify) would lose
every edit and upload. Run **one** Node instance only — the database, the page
cache and the rate limiter all live inside that process.

---

## 1. System requirements

- [ ] Node.js 20 or 22 (`node -v`; the project pins `>=20 <23`, see `.nvmrc`)
- [ ] `ffmpeg` (video compression): `sudo apt install -y ffmpeg`
- [ ] `sqlite3` (used by the backup script): `sudo apt install -y sqlite3`
- [ ] Nginx and Certbot (HTTPS)
- [ ] PM2: `sudo npm install -g pm2`

`sharp` ships prebuilt Linux binaries. If `npm install` complains about it:
`sudo apt install -y build-essential python3` and reinstall.

---

## 2. Environment variables

Copy `.env.example` → **`.env`** in the project folder on the server and fill
it in. Use `.env` (not `.env.local`) on the server: the Prisma command line
reads only `.env`, so one file keeps the app and the `prisma` commands in
agreement. The file is gitignored — create it on the server, never commit it.

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | yes | `file:/var/data/fquad/app.db` — outside the project folder (§3) |
| `SESSION_SECRET` | **yes** | 32+ random characters: `openssl rand -base64 48`. The admin refuses to work without it |
| `NEXT_PUBLIC_SITE_URL` | **yes** | the live address, e.g. `https://fquad.com`. Without it the sitemap, canonical links and share cards say `localhost` |
| `RESEND_API_KEY` | yes | emails for the contact and project forms |
| `MAIL_FROM`, `ENQUIRY_TO` | no | defaults: `F.QUAD Studio <contact@fquad.com>` and `admin@fquad.com`. The sender domain must be verified in Resend (SPF + DKIM) |
| `GOOGLE_SITE_VERIFICATION` | optional | the token Google Search Console shows for the "HTML tag" method; add it, deploy, then verify and submit `/sitemap.xml` |
| `MEDIA_DIR`, `MEDIA_URL_PREFIX` | recommended | `/var/data/fquad/media` and `/uploads` — Nginx serves it (§6) |
| `PRIVATE_UPLOAD_DIR` | recommended | `/var/data/fquad/private-uploads` — plans attached to the project form; only an admin can download them |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | first run only | used by `npm run db:seed`; there is no default password; remove after |

If the Node process is ever started with the secret missing, the log shows
`SESSION_SECRET must be set…` and `/admin` returns an error instead of running
with a weak key.

---

## 3. Data folder — persistence

Three things are the site's real data and must survive redeploys and be backed
up. Keep them outside the project folder:

```bash
sudo mkdir -p /var/data/fquad/media /var/data/fquad/private-uploads
sudo chown -R <deploy-user>:<deploy-user> /var/data/fquad
sudo chmod 700 /var/data/fquad /var/data/fquad/private-uploads
```

- `/var/data/fquad/app.db` — the SQLite database (CMS content, admin accounts,
  enquiries with visitors' names, emails and phone numbers)
- `/var/data/fquad/media` — the CMS media library
- `/var/data/fquad/private-uploads` — customers' plans and drawings

---

## 4. First-time setup commands

From the project folder, after `.env` is in place:

```bash
npm ci
npx prisma generate
npx prisma db push        # creates the tables from prisma/schema.prisma
ADMIN_EMAIL=you@fquad.com ADMIN_PASSWORD='a-long-unique-password' npm run db:seed
npm run build
```

Remove `ADMIN_PASSWORD` from your shell history afterwards, then sign in at
`/admin/login` and change it under **Admin → Account** if you like.

To reset a forgotten password, or add the first admin to a new database:

```bash
ADMIN_EMAIL=you@fquad.com ADMIN_PASSWORD='a-long-unique-password' npm run admin:password
```

---

## 5. Running the app

The app listens on port **3002** (`npm start`).

```bash
pm2 start npm --name fquad -- start
pm2 save
pm2 startup                 # run the command it prints, so it starts on boot
pm2 install pm2-logrotate   # keeps logs from filling the disk
```

Redeploy:

```bash
git pull
npm ci
npx prisma db push          # only if prisma/schema.prisma changed
npm run build
pm2 restart fquad
```

---

## 6. Nginx

The proxy must tell the app who is really visiting — the rate limits on the
login and forms rely on `X-Real-IP`, and the admin's cross-site protection
relies on `Host`. `X-Forwarded-For` is **overwritten** (not appended) so a
visitor cannot invent addresses.

```nginx
# http { } context (e.g. /etc/nginx/conf.d/fquad-limits.conf)
limit_req_zone $binary_remote_addr zone=fquad_sensitive:10m rate=10r/m;

server {
    server_name fquad.com www.fquad.com;
    # listen 443 ssl … is added by Certbot

    client_max_body_size 32m;            # project plans are up to 30 MB

    # CMS media, straight from disk (matches MEDIA_DIR)
    location /uploads/ {
        alias /var/data/fquad/media/;
        access_log off;
        add_header Cache-Control "public, max-age=31536000, immutable";
        add_header X-Content-Type-Options nosniff;
    }

    # Extra brake on login and the public forms, on top of the app's own limits
    location ~ ^/api/(admin/login|contact|start-project)$ {
        limit_req zone=fquad_sensitive burst=5 nodelay;
        include /etc/nginx/snippets/fquad-proxy.conf;
    }

    location / {
        include /etc/nginx/snippets/fquad-proxy.conf;
    }
}
```

`/etc/nginx/snippets/fquad-proxy.conf`:

```nginx
proxy_pass http://127.0.0.1:3002;
proxy_http_version 1.1;
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $remote_addr;
proxy_set_header X-Forwarded-Host $host;
proxy_set_header X-Forwarded-Proto $scheme;
```

Then `sudo nginx -t && sudo systemctl reload nginx`, and
`sudo certbot --nginx -d fquad.com -d www.fquad.com` for HTTPS (it renews
itself). Pick one of `fquad.com` / `www.fquad.com` as the main address and
redirect the other to it; set `NEXT_PUBLIC_SITE_URL` to the main one.

---

## 7. Admin and what protects it

- `/admin/login` is public; everything else under `/admin` and `/api/admin`
  needs a session. This is enforced twice: by `middleware.ts` and again inside
  every admin API handler (`lib/admin-guard.ts`).
- Sessions last 24 hours. Login allows 5 wrong passwords per account and 10 per
  address per 15 minutes, then blocks for the rest of the window.
- The contact and project forms allow 5 submissions per address per 10 minutes,
  and have a hidden honeypot field: a submission that fills it is treated as a
  bot and silently dropped. (A captcha such as Cloudflare Turnstile would be a
  further step; it needs a free Cloudflare account and is not required.)
- Plans attached to the project form are checked (PDF, JPG, PNG, DWG, DXF only,
  30 MB, contents must match), stored outside the web folder under random names,
  and only downloadable by a signed-in admin from **Admin → Enquiries**.

---

## 8. Backups

`scripts/backup.sh` writes a consistent copy of the database plus the media and
private uploads, keeps 30 days, and (optionally) copies them off the server.

```bash
sudo apt install -y sqlite3
chmod +x scripts/backup.sh
crontab -e
# every night at 02:15
15 2 * * * /srv/fquad/scripts/backup.sh >> /var/log/fquad-backup.log 2>&1
```

Off-server copy (strongly recommended — a backup on the same disk does not
survive losing the server): install `rclone`, configure a remote for
DigitalOcean Spaces or Cloudflare R2 with `rclone config`, and set
`BACKUP_REMOTE=spaces:fquad-backups` in the cron line's environment.

**Test a restore once** before launch: copy a `.db.gz` to a temp folder,
`gunzip` it, and open it with `sqlite3 file.db "select count(*) from Enquiry;"`.

---

## 9. Monitoring

- [ ] **Uptime:** add a free UptimeRobot or Better Stack monitor on
      `https://fquad.com/api/health` — it answers `200 {"status":"ok"}` only when
      the app can reach its database (the home page is cached, so it would still
      load with the database down) — and a second one on `https://fquad.com/`,
      alerting the studio by email.
- [ ] **Logs:** `pm2 logs fquad`; `pm2-logrotate` (§5) caps their size.
- [ ] **Errors (optional):** Sentry (free tier) — `npx @sentry/wizard@latest -i nextjs`
      after creating a project and DSN. Not installed yet.
- [ ] **Server:** firewall allowing only 22/80/443 (`sudo ufw allow OpenSSH &&
      sudo ufw allow 'Nginx Full' && sudo ufw enable`), SSH keys only
      (`PasswordAuthentication no`), `sudo apt install unattended-upgrades`.

---

## Still open

- [ ] Email DNS for fquad.com and a test enquiry (see "Email DNS" below)
- [ ] Domain / DNS cut-over (Adroit domain transfer pending)
- [ ] Sentry (optional, §9)

---

## Email DNS (Resend) — needed before the forms can email reliably

Checked against the live DNS on 10 Nov 2026: `fquad.com` has Google Workspace mail
(`MX smtp.google.com`) and a DMARC record with **policy `quarantine`**, but **no SPF
record, no Google DKIM key and no Resend records**. With a `quarantine` policy,
mail that fails SPF and DKIM goes to spam, so enquiry notifications (and the
studio's normal mail) can be quarantined until this is fixed.

1. In Resend → **Domains** → add `fquad.com`. It lists the exact records to create:
   a DKIM `TXT` at `resend._domainkey`, and an SPF `TXT` plus an `MX` on the `send`
   subdomain. Add them at the DNS host (the DMARC report address points at
   GoDaddy / `secureserver.net`, so the DNS is probably there) and click **Verify**.
2. Add an SPF record for the root so the studio's Google mail passes too:
   `TXT  @  "v=spf1 include:_spf.google.com ~all"`
3. In Google Admin → Apps → Google Workspace → Gmail → **Authenticate email**,
   generate the DKIM key, add the `google._domainkey` record it shows, and turn
   authentication on.
4. Send a test enquiry from the live site; confirm it arrives in the inbox (not
   spam) and that Admin → Enquiries shows it. Look at the message's "Show original"
   to see SPF, DKIM and DMARC all say PASS.

---

## Other open items

- [ ] Pick the main domain (`fquad.com` or `www.fquad.com`) and set `NEXT_PUBLIC_SITE_URL`
