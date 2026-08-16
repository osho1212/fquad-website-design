'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LogoutButton from './LogoutButton';

const SUPERADMIN_NAV = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/hero-slides', label: 'Hero Slides' },
  { href: '/admin/projects', label: 'Projects' },
  { href: '/admin/media', label: 'Media Library' },
  { href: '/admin/enquiries', label: 'Enquiries' },
  { href: '/admin/testimonials', label: 'Testimonials' },
  { href: '/admin/awards', label: 'Awards' },
  { href: '/admin/team', label: 'Team' },
  { href: '/admin/blog', label: 'Blog' },
  { href: '/admin/content/home', label: 'Home Content' },
  { href: '/admin/content/projects', label: 'Projects Content' },
  { href: '/admin/settings', label: 'Settings' },
];

const ADMIN_NAV = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/projects', label: 'Projects' },
  { href: '/admin/enquiries', label: 'Enquiries' },
];

const sidebarLinkHoverStyles = `
  .sidebar-link:hover {
    transform: translateX(2px);
    color: #F8F8F6 !important;
  }
`;

export default function Sidebar({ email, role }: { email: string; role: string }) {
  const pathname = usePathname();
  const navItems = role === 'SUPERADMIN' ? SUPERADMIN_NAV : ADMIN_NAV;

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
        <img src="/fquad-logo.png" alt="F.QUAD" style={{ height: 36, width: 'auto', display: 'block', filter: 'invert(1) brightness(2)', marginBottom: 4, paddingLeft: 12 }} />
        <div style={{ fontSize: 11, letterSpacing: '0.18em', color: '#7A7870', marginBottom: 4, paddingLeft: 12 }}>
          STUDIO ADMIN
        </div>
        <div style={{ fontSize: 10, letterSpacing: '0.14em', color: '#444', marginBottom: 36, paddingLeft: 12 }}>
          {role === 'SUPERADMIN' ? 'SUPERADMIN' : 'ADMIN'}
        </div>
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="sidebar-link"
              style={{
                padding: '10px 12px',
                borderRadius: 2,
                fontSize: 13,
                letterSpacing: '0.04em',
                textDecoration: 'none',
                color: active ? '#0D0D0D' : '#DEDBD4',
                background: active ? '#C4A97D' : 'transparent',
                fontWeight: active ? 600 : 400,
                display: 'block',
                transition: 'transform 0.15s ease, color 0.15s ease',
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div style={{ fontSize: 12, color: '#7A7870', marginBottom: 12, paddingLeft: 12, wordBreak: 'break-all' }}>
        {email}
      </div>
      <LogoutButton />
    </aside>
  );
}