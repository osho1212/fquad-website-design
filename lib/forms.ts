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

/**
 * True for a link that is safe to put in an href: empty, a page of this site
 * ("/contact"), an in-page anchor ("#work"), or http(s), mailto: and tel:
 * addresses. Rejects javascript:, data: and the like.
 */
export function isSafeHref(value: string): boolean {
  const v = value.trim();
  if (v === '') return true;
  if (/[\u0000-\u001F\u007F]/.test(v)) return false;
  if (v.startsWith('/')) return !v.startsWith('//') && !v.startsWith('/\\');
  if (v.startsWith('#')) return true;
  return /^(https?:\/\/|mailto:|tel:)/i.test(v);
}

export const HREF_HELP =
  'must be a web address (https://…), an email link (mailto:), a phone link (tel:) or a page of this site (/page)';

export function isEmail(value: string): boolean {
  return value.length <= 254 && /^[^\s@<>"',;:()[\]\\]+@[^\s@<>"',;:()[\]\\]+\.[^\s@<>"',;:()[\]\\]{2,}$/.test(value);
}

type HeaderBag = { get(name: string): string | null };

/**
 * The visitor's address. On Vercel, `X-Real-IP` and `X-Forwarded-For` both carry the
 * real client address and Vercel overwrites anything a visitor sends in them
 * (https://vercel.com/docs/headers/request-headers). Behind some other proxy the
 * last `X-Forwarded-For` entry is the one to trust: earlier entries are whatever
 * the client chose to send.
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
