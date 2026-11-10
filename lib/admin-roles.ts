// lib/admin-roles.ts
// Which parts of the admin each role may open. Plain data and two small
// functions, safe in the browser: the sidebar uses it to choose what to show,
// and the server uses the same facts to turn the rest away (page guards in
// lib/admin-page-guard.ts, API guards in lib/admin-guard.ts).
//
// An ADMIN works the enquiries inbox and manages their own account. Everything
// else is for a SUPERADMIN. To add an admin section: add it here, give it a
// sidebar entry, and put `await requireSection('<name>')` in a layout.tsx
// inside its folder (see app/admin/(dashboard)/cms/layout.tsx).

export type AdminRole = 'SUPERADMIN' | 'ADMIN';

export type AdminSection =
  | 'dashboard'
  | 'cms'
  | 'media'
  | 'blog'
  | 'team'
  | 'testimonials'
  | 'awards'
  | 'enquiries'
  | 'settings'
  | 'users'
  | 'account';

/** What an ADMIN may open. A SUPERADMIN may open everything. */
const ADMIN_SECTIONS: readonly AdminSection[] = ['enquiries', 'account'];

export function canAccessSection(role: AdminRole, section: AdminSection): boolean {
  return role === 'SUPERADMIN' || ADMIN_SECTIONS.includes(section);
}

/** Where a role lands after signing in, and where a page it may not open sends it. */
export function adminHome(role: AdminRole): string {
  return role === 'SUPERADMIN' ? '/admin' : '/admin/enquiries';
}
