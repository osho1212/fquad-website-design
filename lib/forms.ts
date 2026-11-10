/** Helpers shared by the public forms and the admin API: escaping, limits, origin checks. */

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/** Escapes text for safe use inside HTML email bodies. */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]);
}

/** Escapes, then turns line breaks into <br> (for multi-line message bodies). */
export function escapeHtmlMultiline(value: string): string {
  return escapeHtml(value).replace(/\r?\n/g, '<br>');
}

/** Trims, drops control characters and caps the length. Anything non-text becomes ''. */
export function cleanText(value: unknown, max: number): string {
  if (typeof value !== 'string') return '';
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, max);
}

/** Like cleanText but collapses line breaks — for subjects, names and file names. */
export function cleanLine(value: unknown, max: number): string {
  return cleanText(value, max * 2)
    .replace(/[\r\n]+/g, ' ')
    .slice(0, max)
    .trim();
}

export function isEmail(value: string): boolean {
  return value.length <= 254 && /^[^\s@<>"',;:()[\]\\]+@[^\s@<>"',;:()[\]\\]+\.[^\s@<>"',;:()[\]\\]{2,}$/.test(value);
}

type HeaderBag = { get(name: string): string | null };

/**
 * The visitor's address as seen by Nginx. `X-Real-IP` is set by our own proxy
 * (see SERVER_SETUP.md); `X-Forwarded-For` is only trusted from its last entry,
 * because earlier entries are whatever the client chose to send.
 */
export function clientIp(headers: HeaderBag): string {
  const real = headers.get('x-real-ip');
  if (real) return real.trim();
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    const parts = forwarded.split(',');
    return parts[parts.length - 1].trim();
  }
  return 'unknown';
}

/**
 * Rejects requests that another website made through a visitor's browser: if
 * an Origin header is present it must be this site. Requests with no Origin
 * (curl, server-to-server) pass — the rate limits cover those.
 */
export function requestHostAllowed(headers: HeaderBag): boolean {
  const origin = headers.get('origin');
  if (!origin) return true;
  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    return false;
  }
  const allowed = new Set<string>();
  const forwardedHost = headers.get('x-forwarded-host');
  const host = headers.get('host');
  if (forwardedHost) allowed.add(forwardedHost.split(',')[0].trim());
  if (host) allowed.add(host);
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  if (site) {
    try {
      allowed.add(new URL(site).host);
    } catch {
      /* ignore a malformed setting */
    }
  }
  return allowed.has(originHost);
}
