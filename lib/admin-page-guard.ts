import { redirect } from 'next/navigation';
import { adminHome, canAccessSection, type AdminSection } from './admin-roles';
import { currentAdmin, type AdminSession } from './session-check';

/**
 * Server-side lock for an admin page: send visitors without a session to the
 * login, and an ADMIN who types the address of a section that is not theirs
 * (say /admin/cms) back to their own home. Hiding the sidebar link is only
 * cosmetic; this is what actually keeps the page closed. The data behind each
 * page is guarded again in its API routes (lib/admin-guard.ts).
 *
 * Put it in a layout.tsx inside the section's folder, or at the top of a
 * server page:  await requireSection('cms');
 */
export async function requireSection(section: AdminSection): Promise<AdminSession> {
  const session = await currentAdmin();
  if (!session) redirect('/admin/login');
  if (!canAccessSection(session.role, section)) redirect(adminHome(session.role));
  return session;
}
