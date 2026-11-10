import { randomBytes } from 'crypto';

/**
 * Plans and drawings that visitors attach to the Start a Project form.
 *
 * They are customer files from the open internet, so they are kept private in
 * Cloud Storage and only a logged-in admin can fetch one, as a download (see
 * app/api/admin/enquiry-files).
 *
 *   private/pending/<name>   sent by the browser, not yet attached to an enquiry
 *   private/plans/<name>     checked and attached to an enquiry
 *
 * A visitor's file never passes through the app on the way in (Vercel refuses
 * request bodies over 4.5 MB): the browser sends it straight to storage using a
 * short-lived address, and the enquiry then names it.
 */

export const PENDING_PREFIX = 'private/pending/';
export const PLAN_PREFIX = 'private/plans/';

export const MAX_PLAN_BYTES = 30 * 1024 * 1024;
export const PLAN_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.dwg', '.dxf'] as const;
export const PLAN_FILE_ROUTE = '/api/admin/enquiry-files';

const SAFE_NAME = /^[a-f0-9]{24}\.(pdf|jpg|jpeg|png|dwg|dxf)$/;

/** True only for names this module generated — blocks any path tricks. */
export function isSafePlanName(name: string): boolean {
  return SAFE_NAME.test(name);
}

export function newPlanName(ext: string): string {
  return `${randomBytes(12).toString('hex')}${ext}`;
}

function startsWith(buf: Buffer, bytes: number[]): boolean {
  return buf.length >= bytes.length && bytes.every((b, i) => buf[i] === b);
}

/**
 * Checks that the file's contents are what its extension claims. The browser's
 * own idea of a file's type is chosen by the visitor and proves nothing.
 */
export function looksLikePlan(buf: Buffer, ext: string): boolean {
  switch (ext) {
    case '.pdf':
      return buf.subarray(0, 5).toString('latin1') === '%PDF-';
    case '.jpg':
    case '.jpeg':
      return startsWith(buf, [0xff, 0xd8, 0xff]);
    case '.png':
      return startsWith(buf, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    case '.dwg':
      // DWG files open with a version tag such as AC1027 (or AC1.50 on very old ones).
      return /^AC[0-9.]{4}/.test(buf.subarray(0, 6).toString('latin1'));
    case '.dxf': {
      if (buf.subarray(0, 18).toString('latin1') === 'AutoCAD Binary DXF') return true;
      const head = buf.subarray(0, 4096);
      // ASCII DXF is plain text made of SECTION blocks.
      return !head.includes(0) && head.toString('latin1').includes('SECTION');
    }
    default:
      return false;
  }
}
