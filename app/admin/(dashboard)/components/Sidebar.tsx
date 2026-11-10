'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LogoutButton from './LogoutButton';
import { canAccessSection, type AdminSection } from '@/lib/admin-roles';

interface NavItem {
  href: string;
  label: string;
  /** Which admin section this opens; the role decides whether it is listed. */
  section: AdminSection;
  /** Also highlight this item on nested routes, e.g. /admin/cms/home. */
  nested?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

// Grouped so the sidebar reads as four short lists rather than one long one:
// what visitors read, who the studio is, what came in, and the settings
// behind it all. Each role sees only the items it may open
// (lib/admin-roles.ts): an ADMIN is left with Enquiries and Account.
const NAV: NavGroup[] = [
  {
    title: 'Overview',
    items: [{ href: '/admin', label: 'Dashboard', section: 'dashboard' }],
  },
  {
    title: 'Content',
    items: [
      { href: '/admin/cms', label: 'Website Content', section: 'cms', nested: true },
      { href: '/admin/media', label: 'Media Library', section: 'media' },
      { href: '/admin/blog', label: 'Journal', section: 'blog' },
    ],
  },
  {
    title: 'People & Proof',
    items: [
      { href: '/admin/team', label: 'Team', section: 'team' },
      { href: '/admin/testimonials', label: 'Testimonials', section: 'testimonials' },
      { href: '/admin/awards', label: 'Awards', section: 'awards' },
    ],
  },
  {
    title: 'Studio',
    items: [
      { href: '/admin/enquiries', label: 'Enquiries', section: 'enquiries' },
      { href: '/admin/settings', label: 'Settings', section: 'settings' },
      { href: '/admin/users', label: 'Admin Team', section: 'users' },
      { href: '/admin/account', label: 'Account', section: 'account' },
    ],
  },
];

const sidebarLinkHoverStyles = `
  .sidebar-link:hover {
    transform: translateX(2px);
    color: #F8F8F6 !important;
  }
`;

function isActive(item: NavItem, pathname: string): boolean {
  if (item.nested) {
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  }
  return pathname === item.href;
}

export default function Sidebar({ email, role }: { email: string; role: string }) {
  const pathname = usePathname();
  const isSuper = role === 'SUPERADMIN';
  // A group with nothing left in it for this role is dropped, heading and all.
  const groups = NAV.map((group) => ({
    ...group,
    items: group.items.filter((item) => canAccessSection(isSuper ? 'SUPERADMIN' : 'ADMIN', item.section)),
  })).filter((group) => group.items.length > 0);

  return (
    <aside
      style={{
        width: 240,
        flexShrink: 0,
        background: '#0D0D0D',
        color: '#F8F8F6',
        padding: '32px 20px',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <style>{sidebarLinkHoverStyles}</style>
      <div>
        <img src="/assets/images/fquad-white-logo.svg" alt="F.QUAD" style={{ height: 36, width: 'auto', display: 'block', filter: 'invert(1) brightness(2)', marginBottom: 4, paddingLeft: 12 }} />
        <div style={{ fontSize: 11, letterSpacing: '0.18em', color: '#7A7870', marginBottom: 4, paddingLeft: 12 }}>
          STUDIO ADMIN
        </div>
        <div style={{ fontSize: 10, letterSpacing: '0.14em', color: '#444', marginBottom: 28, paddingLeft: 12 }}>
          {role === 'SUPERADMIN' ? 'SUPERADMIN' : 'ADMIN'}
        </div>
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 22 }}>
        {groups.map((group) => (
          <div key={group.title}>
            <div
              style={{
                fontSize: 9.5,
                letterSpacing: '0.2em',
                color: '#5A5852',
                fontWeight: 600,
                padding: '0 12px 8px',
                textTransform: 'uppercase',
              }}
            >
              {group.title}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {group.items.map((item) => {
                const active = isActive(item, pathname);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="sidebar-link"
                    style={{
                      padding: '8px 12px',
                      borderRadius: 2,
                      fontSize: 13,
                      letterSpacing: '0.04em',
                      textDecoration: 'none',
                      color: active ? '#0D0D0D' : '#DEDBD4',
                      background: active ? '#DEDBD4' : 'transparent',
                      fontWeight: active ? 600 : 400,
                      display: 'block',
                      transition: 'transform 0.15s ease, color 0.15s ease',
                    }}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div style={{ fontSize: 12, color: '#7A7870', margin: '24px 0 12px', paddingLeft: 12, wordBreak: 'break-all' }}>
        {email}
      </div>
      <LogoutButton />
    </aside>
  );
}
