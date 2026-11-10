import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { currentAdmin, type AdminSession } from './session-check';
import { requestHostAllowed } from './forms';

/** The signed-in admin for this request, or null. Route handlers only. */
export async function getAdminSession(): Promise<AdminSession | null> {
  return currentAdmin();
}

/**
 * Second lock on every admin API handler. `middleware.ts` already turns away
 * visitors without a session, but a single guard is one misconfiguration away
 * from an open CMS, so each handler checks again itself: the session must
 * still match the account (see lib/session-check.ts), any `Origin` header
 * must be this site (CSRF), and — where asked — the account must be a
 * SUPERADMIN. Handlers for team, testimonials, awards, the journal and site
 * settings ask for that, matching what the ADMIN role sees in the sidebar.
 *
 * Usage, first lines of a handler:
 *   const denied = await requireAdmin();            // any signed-in admin
 *   const denied = await requireAdmin({ superadmin: true });
 *   if (denied) return denied;
 */
export async function requireAdmin(options: { superadmin?: boolean } = {}): Promise<NextResponse | null> {
  const session = await currentAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!requestHostAllowed(await headers())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (options.superadmin && session.role !== 'SUPERADMIN') {
    return NextResponse.json({ error: 'You do not have permission to do this.' }, { status: 403 });
  }
  return null;
}
