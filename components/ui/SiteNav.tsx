import Link from 'next/link';

// The solid header used on the interior pages (About, Past Projects, Team,
// Awards, Journal, Testimonials). It is a server component: the open/close
// behaviour comes from each page's inline nav script, which toggles
// `#mobile-menu` via the `data-toggle-nav` button.
//
// The floating pill header on the homepage and the /services–/studio family
// is a different component — components/ui/mini-navbar.tsx.

interface NavLink {
  label: string;
  href: string;
}

interface NavItem extends NavLink {
  children?: NavLink[];
}

export function SiteNav({
  content,
  active,
  solid = true,
}: {
  content: Record<string, any>;
  /** Path of the current page, used to mark the matching links. */
  active?: string;
  /** The Journal page sits under a transparent bar. */
  solid?: boolean;
}) {
  const items: NavItem[] = content?.items ?? [];
  const mobileItems: NavLink[] = content?.mobileItems ?? [];

  const isActive = (href: string) => Boolean(active) && href === active;
  const hasActiveChild = (item: NavItem) =>
    (item.children ?? []).some((child) => isActive(child.href));

  return (
    <>
      <nav className={solid ? 'nav nav-solid' : 'nav'} id="site-nav">
        <Link href="/" className="nav-logo" style={{ display: 'flex', alignItems: 'center' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={content?.logo}
            alt={content?.logoAlt}
            className="site-logo"
            style={{ height: 48, width: 'auto', display: 'block' }}
          />
        </Link>

        <ul className="nav-links">
          {items.map((item, i) => {
            const children = item.children ?? [];
            const activeHere = isActive(item.href) || hasActiveChild(item);

            if (children.length === 0) {
              return (
                <li key={i}>
                  <Link href={item.href} className={activeHere ? 'active' : undefined}>
                    {item.label}
                  </Link>
                </li>
              );
            }

            return (
              <li className="nav-item" key={i}>
                <Link href={item.href} className={activeHere ? 'active' : undefined}>
                  {item.label}
                </Link>
                <div className="nav-dropdown">
                  {children.map((child, j) => (
                    <Link
                      key={j}
                      href={child.href}
                      className={isActive(child.href) ? 'active' : undefined}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>

        <button className="hamburger nav-toggle" data-toggle-nav aria-label="Toggle menu">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
          </svg>
        </button>

        {/* Opened by the global data-start-project listener in
            StartProjectModalContext, so no client component is needed here. */}
        <button className="btn-enquire" data-start-project="true" type="button">
          {content?.ctaLabel}
        </button>
      </nav>

      <div className="mobile-menu" id="mobile-menu">
        {mobileItems.map((item, i) => (
          <Link key={i} href={item.href}>
            {item.label}
          </Link>
        ))}
      </div>
    </>
  );
}
