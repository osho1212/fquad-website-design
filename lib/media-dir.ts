import path from 'path';

// Where uploaded media lives on disk, and the URL prefix it is served under.
// Dev default: public/uploads. Production: point MEDIA_DIR at a persistent
// folder outside the project (see SERVER_SETUP.md). Kept apart from
// lib/media.ts so a route that only serves files does not load sharp and ffmpeg.
export const MEDIA_DIR = process.env.MEDIA_DIR || path.join(process.cwd(), 'public', 'uploads');
export const MEDIA_URL_PREFIX = process.env.MEDIA_URL_PREFIX || '/uploads';
