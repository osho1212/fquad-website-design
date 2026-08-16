// app/components/Footer.tsx
// Reusable footer - appears on all pages

import Link from 'next/link';
import { spacing, typography, colors } from '@/lib/design-tokens';

export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: colors.bg_darker,
        color: colors.white,
        padding: `${spacing.xxl} ${spacing.page_margin_desktop}`,
      }}
    >
      {/* Main Footer Content */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: spacing.xxl,
          marginBottom: spacing.xxl,
        }}
      >
        {/* Brand Column */}
        <div>
          <div
            style={{
              fontSize: typography.h4,
              fontWeight: 700,
              marginBottom: spacing.lg,
              letterSpacing: '0.14em',
            }}
          >
            F.QUAD
          </div>
          <p
            style={{
              fontSize: typography.body_sm,
              color: colors.grey_light,
              lineHeight: 1.7,
            }}
          >
            Architecture & interior design studio based in Hyderabad.
          </p>
        </div>

        {/* Pages Column */}
        <div>
          <p
            style={{
              fontSize: typography.eyebrow,
              letterSpacing: '0.16em',
              color: colors.gold,
              marginBottom: spacing.lg,
              fontWeight: 600,
            }}
          >
            PAGES
          </p>
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: spacing.md,
            }}
          >
            {[
              { href: '/', label: 'Home' },
              { href: '/about', label: 'About' },
              { href: '/projects', label: 'Projects' },
              { href: '/services', label: 'Services' },
              { href: '/contact', label: 'Contact' },
            ].map(link => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  style={{
                    fontSize: typography.body_sm,
                    color: colors.grey_light,
                    textDecoration: 'none',
                    transition: 'color 0.25s ease',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.color = colors.white;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.color = colors.grey_light;
                  }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Social Column */}
        <div>
          <p
            style={{
              fontSize: typography.eyebrow,
              letterSpacing: '0.16em',
              color: colors.gold,
              marginBottom: spacing.lg,
              fontWeight: 600,
            }}
          >
            FOLLOW
          </p>
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: spacing.md,
            }}
          >
            {[
              { href: 'https://instagram.com/fquadstudio', label: 'Instagram' },
              { href: 'https://wa.me/919876543210', label: 'WhatsApp' },
            ].map(link => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: typography.body_sm,
                    color: colors.grey_light,
                    textDecoration: 'none',
                    transition: 'color 0.25s ease',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.color = colors.white;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.color = colors.grey_light;
                  }}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Column */}
        <div>
          <p
            style={{
              fontSize: typography.eyebrow,
              letterSpacing: '0.16em',
              color: colors.gold,
              marginBottom: spacing.lg,
              fontWeight: 600,
            }}
          >
            CONTACT
          </p>
          <p
            style={{
              fontSize: typography.body_sm,
              color: colors.grey_light,
              marginBottom: spacing.md,
            }}
          >
            <a
              href="mailto:admin@fquad.com"
              style={{
                color: colors.grey_light,
                textDecoration: 'none',
                transition: 'color 0.25s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = colors.white;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = colors.grey_light;
              }}
            >
              admin@fquad.com
            </a>
          </p>
          <p style={{ fontSize: typography.body_sm, color: colors.grey_light }}>
            Hyderabad, India
          </p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div
        style={{
          borderTop: `0.5px solid #2A2A2A`,
          paddingTop: spacing.lg,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: spacing.lg,
        }}
      >
        <p style={{ fontSize: typography.eyebrow, color: colors.grey_light }}>
          © 2026 F.QUAD. All rights reserved.
        </p>
        <div
          style={{
            display: 'flex',
            gap: spacing.xxl,
            fontSize: typography.eyebrow,
            color: colors.grey_light,
          }}
        >
          <a href="#" style={{ color: colors.grey_light, textDecoration: 'none' }}>
            PRIVACY
          </a>
          <a href="#" style={{ color: colors.grey_light, textDecoration: 'none' }}>
            SITEMAP
          </a>
        </div>
      </div>
    </footer>
  );
}
