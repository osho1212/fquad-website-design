import Link from 'next/link';
import { fill } from '@/lib/cms/schema';

// The dark footer on the interior pages. Server component — the only dynamic
// values are the studio's own contact details, which come from Settings.
//
// The homepage/Studio/Services footer is a different design and lives in
// components/sections/ContactFooter.tsx.

interface FooterLink {
  label: string;
  href: string;
}

export interface SiteFooterSettings {
  email: string | null;
  phone: string | null;
  address: string | null;
  instagramUrl: string | null;
  whatsapp: string | null;
}

const FALLBACK_ADDRESS = 'Hyderabad, Telangana, India';

/**
 * Social rows store `instagram` / `whatsapp` rather than a URL, so the actual
 * profile and number stay in Settings and are not duplicated per page.
 * Anything else is treated as a literal href.
 */
function socialHref(href: string, settings: SiteFooterSettings): string {
  if (href === 'instagram') return settings.instagramUrl || '#';
  if (href === 'whatsapp') {
    const digits = (settings.whatsapp || '').replace(/[^0-9]/g, '');
    return digits ? `https://wa.me/${digits}` : '#';
  }
  return href;
}

export function SiteFooter({
  content,
  settings,
}: {
  content: Record<string, any>;
  settings: SiteFooterSettings;
}) {
  const columns: { title: string; links: FooterLink[] }[] = content?.columns ?? [];
  const socials: FooterLink[] = content?.socialLinks ?? [];
  const legal: FooterLink[] = content?.legalLinks ?? [];

  return (
    <footer>
      <div className="footer-grid">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={content?.logo}
            alt={content?.logoAlt}
            style={{ height: 40, width: 'auto', display: 'block', filter: 'invert(1) brightness(2)', marginBottom: 12 }}
          />
          <p className="footer-tagline">{content?.tagline}</p>
          <div className="footer-social">
            {socials.map((social, i) => (
              <a key={i} href={socialHref(social.href, settings)} target="_blank" rel="noopener noreferrer">
                {social.label}
              </a>
            ))}
          </div>
        </div>

        {columns.map((column, i) => (
          <div key={i}>
            <div className="footer-nav-heading">{column.title}</div>
            <ul className="footer-nav-links">
              {(column.links ?? []).map((link, j) => (
                <li key={j}>
                  <Link href={link.href || '#'}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <div className="footer-nav-heading">{content?.contactHeading}</div>
          <p style={{ fontSize: 13, color: '#6B6560' }}>{settings.email || ''}</p>
          <p style={{ fontSize: 13, color: '#6B6560' }}>{settings.phone || ''}</p>
          <p style={{ fontSize: 13, color: '#6B6560' }}>{settings.address || FALLBACK_ADDRESS}</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>{fill(content?.copyright ?? '', { year: new Date().getFullYear() })}</p>
        <div className="footer-bottom-links">
          {legal.map((link, i) => (
            <a key={i} href={link.href || '#'}>
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
