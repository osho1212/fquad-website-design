# F.QUAD Studio website

Website and content system for **F.QUAD Studio**, an architecture, interior design, interior styling and farmhouse practice in Hyderabad, India.

- **Public site:** a scroll-driven home page (a hero film, featured projects, a 3D "What We Do" stage), studio, services, projects, team, awards, testimonials, journal and contact pages, plus Privacy and Terms.
- **Admin (`/admin`):** edit every page's text and images, manage the media library, projects, team, testimonials, awards and the journal, change site settings, and read enquiries from the contact and Start a Project forms.

**Stack:** Next.js 15 (App Router) · React 19 · TypeScript · Tailwind · Firebase (Firestore for data, Cloud Storage for pictures and plans) · GSAP, Lenis and three.js for motion · Resend for email · hosted on Vercel.

## Run it locally

You need Node.js 20 or 22 (`.nvmrc` pins 22) and Java (the Firebase emulators use it). Nothing needs a real Firebase project: the emulators run Firestore and Cloud Storage on your machine.

```bash
npm install
cp .env.example .env.local        # then uncomment the "emulators" block in it
npm run emulators                  # terminal 1: Firestore + Storage emulators (keeps data in .firebase-data)
ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='a-unique-12+-character-password' npm run db:seed   # terminal 2, once
npm run dev                        # http://localhost:3002
```

The admin is at `/admin/login`. There is deliberately no default password. Change it any time under **Admin → Account**; forgot it? `ADMIN_EMAIL=… ADMIN_PASSWORD=… npm run admin:password`.

To start with the studio's real content instead of an empty site, import the old SQLite database and its pictures: `npm run db:import -- <path>/dev.db --uploads <path>/uploads` (see [DEPLOY.md](DEPLOY.md) part B).

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server on port 3002 |
| `npm run build` / `npm start` | Production build and server (port 3002) |
| `npm run typecheck` | Generates route types, then runs the TypeScript compiler |
| `npm run emulators` | Local Firestore and Cloud Storage emulators |
| `npm run db:seed` | Creates the first admin and the default site settings |
| `npm run db:import` | Imports the old SQLite database and pictures into Firebase |
| `npm run admin:password` | Creates an admin or resets a password |
| `npm run hero:avif` | Re-encodes the hero film's frames to AVIF |
| `bash scripts/smoke-test.sh [url]` | Quick checks of a running site (pages, admin closed to visitors, health, headers) |
| `bash scripts/e2e-test.sh [url]` | End-to-end checks against the emulators (sign-in, roles, uploads, rate limits) |

CI (`.github/workflows/ci.yml`) runs the type check, a production build, the smoke test and the end-to-end test on every pull request, against the emulators.

## Where things are

| Folder | Contents |
|---|---|
| `app/` | Pages and API routes (`app/api/admin/*` is the admin API, `app/uploads` serves the media library from Storage) |
| `components/` | Page sections, UI pieces, 3D scenes (`components/three`), motion helpers |
| `lib/` | Content defaults and CMS schema (`lib/cms`), the Firestore data layer (`lib/db`), Firebase and Storage (`lib/firebase.ts`, `lib/storage.ts`), auth and sessions, forms, SEO, image processing |
| `firebase/`, `firebase.json`, `*.rules` | Emulator settings, locked-down security rules, bucket CORS and cleanup rules |
| `public/` | Static assets: the hero film's frames, images, fonts |
| `scripts/` | Seed, import, admin password, hero encoding, smoke and end-to-end tests |

Editable page content lives in `lib/cms/pages/*` as defaults; anything saved in the admin is merged over them.

## Going live

See **[DEPLOY.md](DEPLOY.md)** for the Firebase project, Vercel, the domain, backups and email DNS.

## Design references

`design/`, `coming-soon/` and `preview/` hold earlier HTML prototypes. They are not part of the site. The original design handoff notes are in [design/HANDOFF.md](design/HANDOFF.md).
