import type { Readable } from 'stream';
import { bucket, usingEmulator } from './firebase';

/**
 * File storage on Firebase Cloud Storage.
 *
 * Layout of the bucket:
 *   uploads/<mediaId>/<file>      the CMS media library (public images)
 *   incoming/<mediaId>/<file>     an admin upload waiting to be processed
 *   private/pending/<name>        a visitor's plan, uploaded but not yet submitted
 *   private/plans/<name>          a plan attached to an enquiry (admin-only)
 *
 * Nothing here is public: images reach visitors through app/uploads, which
 * streams `uploads/` only, and plans reach admins through
 * app/api/admin/enquiry-files.
 */

export interface UploadTarget {
  method: 'PUT' | 'POST';
  url: string;
  /** Headers the browser must send with the upload, exactly as given. */
  headers: Record<string, string>;
}

/**
 * A short-lived address the browser can send a file to directly. Vercel
 * functions refuse request bodies over 4.5 MB, so files never pass through
 * the app on their way in. The signed address fixes the content type and caps
 * the size (enforced by Google, not by the browser).
 */
export async function createUploadTarget(opts: {
  path: string;
  contentType: string;
  maxBytes: number;
  expiresInSeconds?: number;
}): Promise<UploadTarget> {
  const { path, contentType, maxBytes } = opts;

  if (usingEmulator() || process.env.FIREBASE_STORAGE_EMULATOR_HOST) {
    // The emulator does not check signatures; this is its plain upload endpoint.
    const host = process.env.FIREBASE_STORAGE_EMULATOR_HOST || '127.0.0.1:9199';
    return {
      method: 'POST',
      url: `http://${host}/v0/b/${bucket().name}/o?name=${encodeURIComponent(path)}`,
      // "Bearer owner" marks an admin request, which the emulator lets through its rules.
      headers: { 'Content-Type': contentType, Authorization: 'Bearer owner' },
    };
  }

  const sizeRange = `0,${maxBytes}`;
  const [url] = await bucket()
    .file(path)
    .getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + (opts.expiresInSeconds ?? 15 * 60) * 1000,
      contentType,
      extensionHeaders: { 'x-goog-content-length-range': sizeRange },
    });
  return {
    method: 'PUT',
    url,
    headers: { 'Content-Type': contentType, 'x-goog-content-length-range': sizeRange },
  };
}

export async function putObject(path: string, data: Buffer, contentType: string, cacheControl?: string) {
  await bucket()
    .file(path)
    .save(data, {
      resumable: false,
      contentType,
      metadata: cacheControl ? { cacheControl } : undefined,
    });
}

/** Size and type of an object, or null if it does not exist. */
export async function statObject(path: string): Promise<{ size: number; contentType: string } | null> {
  const file = bucket().file(path);
  const [exists] = await file.exists();
  if (!exists) return null;
  const [meta] = await file.getMetadata();
  return { size: Number(meta.size ?? 0), contentType: String(meta.contentType ?? 'application/octet-stream') };
}

export async function readObject(path: string): Promise<Buffer> {
  const [data] = await bucket().file(path).download();
  return data;
}

/** The first `bytes` bytes of an object — enough to check what a file really is. */
export async function readHead(path: string, bytes: number): Promise<Buffer> {
  const [data] = await bucket()
    .file(path)
    .download({ start: 0, end: Math.max(0, bytes - 1) });
  return data;
}


export async function moveObject(from: string, to: string) {
  await bucket().file(from).move(to);
}

export async function deleteObject(path: string) {
  await bucket().file(path).delete({ ignoreNotFound: true });
}

export async function deletePrefix(prefix: string) {
  await bucket().deleteFiles({ prefix, force: true });
}
