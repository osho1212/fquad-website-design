/**
 * Browser-side helpers for sending files straight to Cloud Storage.
 *
 * Vercel functions refuse request bodies over 4.5 MB, so a file never goes
 * through the app on its way in: the app hands out a short-lived upload address
 * (lib/storage.ts createUploadTarget), the browser sends the file there, and the
 * app is told afterwards. Safe to import from client components.
 */

export interface UploadTarget {
  method: 'PUT' | 'POST';
  url: string;
  headers: Record<string, string>;
}

/** Sends `file` to an upload address, reporting progress as a fraction 0..1. */
export function sendFile(target: UploadTarget, file: Blob, onProgress?: (fraction: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(target.method, target.url);
    for (const [name, value] of Object.entries(target.headers)) xhr.setRequestHeader(name, value);
    if (onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(e.loaded / e.total);
      };
    }
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`The upload was refused (${xhr.status}).`)));
    xhr.onerror = () => reject(new Error('The upload failed — check your connection and try again.'));
    xhr.send(file);
  });
}

async function postJson(url: string, body: unknown): Promise<any> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status}).`);
  return data;
}

/**
 * Adds an image to the media library (admin): asks for an upload address, sends
 * the file, then asks the server to make the sizes and record it.
 */
export async function uploadMedia(
  file: File,
  opts: { folderId?: string | null; alt?: string | null; background?: boolean; onProgress?: (fraction: number) => void } = {}
): Promise<{ media: any }> {
  const ticket = await postJson('/api/admin/media/upload-url', {
    filename: file.name,
    contentType: file.type,
    size: file.size,
  });
  await sendFile(ticket.upload, file, opts.onProgress);
  return postJson('/api/admin/media', {
    uploadId: ticket.uploadId,
    filename: file.name,
    alt: opts.alt ?? null,
    folderId: opts.folderId ?? null,
    background: Boolean(opts.background),
  });
}
