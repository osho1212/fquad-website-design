import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { CMS_PAGES } from '@/lib/cms/schema';

export const dynamic = 'force-dynamic';

const cardStyle: React.CSSProperties = {
  display: 'block',
  padding: 20,
  background: '#fff',
  border: '0.5px solid #DEDBD4',
  borderRadius: 4,
  textDecoration: 'none',
  color: '#0D0D0D',
};

async function counts() {
  try {
    const [media, enquiriesNew, team, testimonials, awards, posts] = await Promise.all([
      prisma.media.count(),
      prisma.enquiry.count({ where: { status: 'NEW' } }),
      prisma.teamMember.count(),
      prisma.testimonial.count(),
      prisma.award.count(),
      prisma.blogPost.count(),
    ]);
    return { media, enquiriesNew, team, testimonials, awards, posts };
  } catch {
    return null;
  }
}

export default async function AdminDashboard() {
  const stats = await counts();
  const sectionCount = CMS_PAGES.reduce((total, page) => total + page.sections.length, 0);

  const tiles: { href: string; label: string; value: string; note: string }[] = [
    {
      href: '/admin/cms',
      label: 'WEBSITE CONTENT',
      value: `${sectionCount}`,
      note: `editable sections across ${CMS_PAGES.length} pages`,
    },
    {
      href: '/admin/media',
      label: 'MEDIA LIBRARY',
      value: stats ? String(stats.media) : '—',
      note: 'images & video',
    },
    {
      href: '/admin/enquiries',
      label: 'NEW ENQUIRIES',
      value: stats ? String(stats.enquiriesNew) : '—',
      note: 'awaiting a reply',
    },
    {
      href: '/admin/team',
      label: 'TEAM',
      value: stats ? String(stats.team) : '—',
      note: 'people published',
    },
    {
      href: '/admin/testimonials',
      label: 'TESTIMONIALS',
      value: stats ? String(stats.testimonials) : '—',
      note: 'client quotes',
    },
    {
      href: '/admin/awards',
      label: 'AWARDS',
      value: stats ? String(stats.awards) : '—',
      note: 'recognitions',
    },
    {
      href: '/admin/blog',
      label: 'JOURNAL',
      value: stats ? String(stats.posts) : '—',
      note: 'articles',
    },
  ];

  return (
    <div style={{ maxWidth: 900 }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Dashboard</h1>
      <p style={{ color: '#7A7870', marginBottom: 32, fontSize: 15, maxWidth: 600, lineHeight: 1.7 }}>
        Wording and imagery live under <strong style={{ fontWeight: 600 }}>Website Content</strong>,
        including the project portfolio. Everything that behaves like a record —
        team, testimonials, awards, journal — has its own section below.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
        {tiles.map((tile) => (
          <Link key={tile.href} href={tile.href} className="dash-tile" style={cardStyle}>
            <div style={{ fontSize: 10, letterSpacing: '0.16em', color: '#7A7870', fontWeight: 600, marginBottom: 10 }}>
              {tile.label}
            </div>
            <div style={{ fontSize: 30, lineHeight: 1, fontWeight: 300 }}>{tile.value}</div>
            <div style={{ fontSize: 12.5, color: '#9C9890', marginTop: 8 }}>{tile.note}</div>
          </Link>
        ))}
      </div>

      {!stats && (
        <p style={{ marginTop: 24, fontSize: 13, color: '#B3434A' }}>
          Counts are unavailable — the database could not be reached. Content
          editing still works from the schema defaults.
        </p>
      )}

      <style>{`.dash-tile:hover { border-color: #0D0D0D !important; }`}</style>
    </div>
  );
}
