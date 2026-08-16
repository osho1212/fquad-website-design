import Link from 'next/link';

const cardStyle: React.CSSProperties = {
  display: 'block',
  padding: 24,
  background: '#fff',
  border: '0.5px solid #DEDBD4',
  borderRadius: 4,
  textDecoration: 'none',
  color: '#0D0D0D',
};

export default function AdminDashboard() {
  return (
    <div>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Dashboard</h1>
      <p style={{ color: '#7A7870', marginBottom: 32, fontSize: 15, maxWidth: 560, lineHeight: 1.7 }}>
        Phase 2 — media library is live. Upload images and video here; everything gets
        auto-resized and is ready to attach to projects and page content once those
        editors land in the next phases.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, maxWidth: 700 }}>
        <Link href="/admin/media" style={cardStyle}>
          <div style={{ fontSize: 12, letterSpacing: '0.14em', color: '#8B6F47', marginBottom: 8, fontWeight: 600 }}>
            MEDIA LIBRARY
          </div>
          <div style={{ fontSize: 15, color: '#7A7870' }}>Upload and manage images &amp; video</div>
        </Link>
      </div>
    </div>
  );
}
