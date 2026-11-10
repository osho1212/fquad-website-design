import Link from 'next/link';
import { pageContent } from '@/lib/db';
import { pagesByGroup } from '@/lib/cms/schema';

export const dynamic = 'force-dynamic';

const GROUP_BLURB: Record<string, string> = {
  Homepage: 'Every band of the landing page, in the order a visitor scrolls through them.',
  Global: 'Chrome that repeats on every page.',
  Pages: 'One entry per route. Records — projects, team, awards, testimonials, journal — are edited in their own sections.',
};

export default async function CmsIndexPage() {
  // How many sections of each page have been edited away from the shipped copy.
  const editedByPage = await pageContent.editedCounts().catch(() => new Map<string, number>());

  return (
    <div style={{ maxWidth: 980 }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Website Content</h1>
      <p style={{ color: '#7A7870', fontSize: 15, marginBottom: 36, lineHeight: 1.7, maxWidth: 640 }}>
        Every heading, paragraph, label and image on the public site, grouped by
        the page it appears on. Sections save one at a time, and any section can
        be reset to the original copy.
      </p>

      {pagesByGroup().map(({ group, pages }) => (
        <section key={group} style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 4 }}>
            <h2 style={{ fontSize: 12, letterSpacing: '0.16em', color: '#0D0D0D', fontWeight: 700, margin: 0, textTransform: 'uppercase' }}>
              {group}
            </h2>
            <span style={{ fontSize: 12, color: '#9C9890' }}>
              {pages.length} {pages.length === 1 ? 'entry' : 'entries'}
            </span>
          </div>
          {GROUP_BLURB[group] && (
            <p style={{ fontSize: 13, color: '#9C9890', margin: '0 0 16px', lineHeight: 1.6, maxWidth: 620 }}>
              {GROUP_BLURB[group]}
            </p>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {pages.map((page) => {
              const edited = editedByPage.get(page.key) ?? 0;
              return (
                <Link
                  key={page.key}
                  href={`/admin/cms/${page.key}`}
                  className="cms-card"
                  style={{
                    display: 'block',
                    padding: 18,
                    background: '#fff',
                    border: '0.5px solid #DEDBD4',
                    borderRadius: 4,
                    textDecoration: 'none',
                    color: '#0D0D0D',
                    transition: 'border-color 0.15s ease, transform 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span aria-hidden style={{ fontSize: 15, color: '#8A7B5C', width: 18, textAlign: 'center' }}>
                      {page.icon ?? '▪'}
                    </span>
                    <span style={{ fontSize: 15, fontWeight: 700 }}>{page.label}</span>
                  </div>
                  <p style={{ fontSize: 13, color: '#7A7870', margin: '0 0 12px', lineHeight: 1.55, minHeight: 40 }}>
                    {page.description}
                  </p>
                  <div style={{ display: 'flex', gap: 12, fontSize: 11, letterSpacing: '0.08em', color: '#9C9890' }}>
                    <span>{page.sections.length} SECTIONS</span>
                    {edited > 0 && <span style={{ color: '#8A7B5C', fontWeight: 600 }}>{edited} EDITED</span>}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ))}

      <style>{`.cms-card:hover { border-color: #0D0D0D !important; transform: translateY(-1px); }`}</style>
    </div>
  );
}
