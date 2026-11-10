# F.QUAD Studio website

Website and content system for **F.QUAD Studio**, an architecture, interior design, interior styling and farmhouse practice in Hyderabad, India.

- **Public site:** a scroll-driven home page (a hero film, featured projects, a 3D "What We Do" stage), studio, services, projects, team, awards, testimonials, journal and contact pages, plus Privacy and Terms.
- **Admin (`/admin`):** edit every page's text and images, manage the media library, projects, team, testimonials, awards and the journal, change site settings, and read enquiries from the contact and Start a Project forms.

**Stack:** Next.js 15 (App Router) · React 19 · TypeScript · Tailwind · Prisma with SQLite · GSAP, Lenis and three.js for motion · Resend for email.

## Run it locally

You need Node.js 20 or 22 (`.nvmrc` pins 22).

```bash
npm install
cp .env.example .env.local        # then fill in what you need (see the file's comments)
npx prisma db push                 # creates the database file from prisma/schema.prisma
ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='a-unique-12+-character-password' npm run db:seed
npm run dev                        # http://localhost:3002
```

The admin is at `/admin/login`. There is deliberately no default password. Change it any time under **Admin → Account**; forgot it? `ADMIN_EMAIL=… ADMIN_PASSWORD=… npm run admin:password`.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server on port 3002 |
| `npm run build` / `npm start` | Production build and server (port 3002) |
| `npm run typecheck` | Generates route types, then runs the TypeScript compiler |
| `npm run db:seed` | Creates the first admin and the default site settings |
| `npm run admin:password` | Creates an admin or resets a password |
| `npm run hero:avif` | Re-encodes the hero film's frames to AVIF |
| `bash scripts/smoke-test.sh [url]` | Quick checks of a running site (pages, admin closed to visitors, health, headers) |

CI (`.github/workflows/ci.yml`) runs the type check, a production build and the smoke test on every pull request.

## Where things are

| Folder | Contents |
|---|---|
| `app/` | Pages and API routes (`app/api/admin/*` is the admin API, `app/uploads` serves the media library) |
| `components/` | Page sections, UI pieces, 3D scenes (`components/three`), motion helpers |
| `lib/` | Content defaults and CMS schema (`lib/cms`), auth and session checks, forms, SEO, media processing |
| `prisma/` | Database schema and seed |
| `public/` | Static assets: the hero film's frames, images, fonts |
| `scripts/` | Server backup, admin password, hero encoding, smoke test |

Editable page content lives in `lib/cms/pages/*` as defaults; anything saved in the admin is merged over them.

## Going live

See **[SERVER_SETUP.md](SERVER_SETUP.md)** for the server, environment variables, Nginx, backups, monitoring and email DNS. The site must run on a host with a persistent disk (the database and uploads are files), as a single Node process.

## Design references

`design/`, `coming-soon/` and `preview/` hold earlier HTML prototypes. They are not part of the site. The original design handoff notes are in [design/HANDOFF.md](design/HANDOFF.md).
