// app/components/Navigation.tsx
// Reusable navigation - appears on all pages

import Link from 'next/link';
import { spacing, typography, colors } from '@/lib/design-tokens';

export default function Navigation() {
  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: `${spacing.lg} ${spacing.page_margin_desktop}`,
        borderBottom: `0.5px solid ${colors.border}`,
        position: 'sticky',
        top: 0,
        backgroundColor: colors.white,
        zIndex: 50,
      }}
    >
      {/* Logo */}
      <Link href="/" style={{ textDecoration: 'none' }}>
        <div
          style={{
            fontSize: typography.h4,
            fontWeight: 700,
            color: colors.black,
            cursor: 'pointer',
            letterSpacing: '0.14em',
          }}
        >
          F.QUAD
        </div>
      </Link>

      {/* Links */}
      <div
        style={{
          display: 'flex',
          gap: spacing.xxl,
          listStyle: 'none',
          margin: 0,
          padding: 0,
        }}
      >
        {[
          { href: '/', label: 'HOME' },
          { href: '/about', label: 'ABOUT' },
          { href: '/projects', label: 'PROJECTS' },
          { href: '/services', label: 'SERVICES' },
          { href: '/contact', label: 'CONTACT' },
        ].map(link => (
          <Link
            key={link.href}
            href={link.href}
            style={{
              fontSize: typography.eyebrow,
              letterSpacing: '0.12em',
              color: colors.grey_dark,
              textDecoration: 'none',
              transition: 'color 0.25s ease',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = colors.black;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = colors.grey_dark;
            }}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Enquire Button */}
      <button
        style={{
          padding: `${spacing.sm} ${spacing.lg}`,
          backgroundColor: colors.black,
          color: colors.white,
          border: `0.5px solid ${colors.black}`,
          fontSize: typography.eyebrow,
          letterSpacing: '0.12em',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
          (e.currentTarget as HTMLElement).style.color = colors.black;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.backgroundColor = colors.black;
          (e.currentTarget as HTMLElement).style.color = colors.white;
        }}
      >
        ENQUIRE
      </button>
    </nav>
  );
}
