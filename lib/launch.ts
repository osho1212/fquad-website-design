/**
 * The launch moment.
 *
 * Everything public is held behind the launch gate (components/launch) until
 * this instant passes; after it, the gate never shows again — there is no flag
 * to clear, the clock does the work.
 *
 * Override it without a code change by setting NEXT_PUBLIC_LAUNCH_AT to an ISO
 * 8601 string that carries its own offset (e.g. "2026-11-11T11:11:00+05:30").
 * Keep the offset: a bare local time means something different on every device.
 *
 * 11:11 on 11/11 — the date and the time are the same number, which is the
 * whole point of the gate's closing mark. Changing one without the other
 * loses it.
 */
const DEFAULT_LAUNCH_AT = "2026-11-11T11:11:00+05:30";

const configured = process.env.NEXT_PUBLIC_LAUNCH_AT?.trim();

/** ISO instant the site goes live. */
export const LAUNCH_AT_ISO =
  configured && !Number.isNaN(Date.parse(configured)) ? configured : DEFAULT_LAUNCH_AT;

/** Same instant as epoch milliseconds. */
export const LAUNCH_AT_MS = Date.parse(LAUNCH_AT_ISO);

/** The studio's own timezone — the launch is announced in Hyderabad time. */
export const LAUNCH_TIMEZONE = "Asia/Kolkata";

const launchDate = new Date(LAUNCH_AT_MS);

const part = (options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-IN", { timeZone: LAUNCH_TIMEZONE, ...options }).format(launchDate);

/** "11:11 AM" — fixed to the studio's timezone, so server and client agree. */
export const LAUNCH_TIME_LABEL = part({ hour: "2-digit", minute: "2-digit", hour12: true }).toUpperCase();

/** "Thu 12 Nov 2026" */
export const LAUNCH_DATE_LABEL = part({ weekday: "short", day: "2-digit", month: "short", year: "numeric" })
  .replace(/,/g, "")
  .toUpperCase();

/** The one line the gate prints under the countdown. */
export const LAUNCH_STAMP = `${LAUNCH_TIME_LABEL} IST · ${LAUNCH_DATE_LABEL}`;

/**
 * Runs in <head>, before first paint, next to the theme script.
 *
 * Marks the document `data-launch="locked"` while the launch is still ahead so
 * the gate's own CSS paints the overlay in the very first frame — a visitor
 * never catches a flash of the site behind it, and a visitor arriving after
 * 11:11 never catches a flash of the gate.
 *
 * `?skiplaunch` (any value) lets the studio walk the finished site today, and
 * /admin is never gated so content can still be edited.
 */
export const launchGateScript = `(function(){try{var d=document.documentElement;if(location.pathname.indexOf('/admin')===0)return;if(location.search.indexOf('skiplaunch')>-1)return;if(Date.now()<${LAUNCH_AT_MS})d.setAttribute('data-launch','locked');}catch(e){}})();`;
