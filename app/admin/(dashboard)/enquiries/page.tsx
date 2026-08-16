'use client';

import { useEffect, useState } from 'react';

interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  whatsapp: boolean;
  status: string;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  NEW: '#8B6F47',
  CONTACTED: '#5B7FA3',
  CLOSED: '#9C9890',
};

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');

  async function load() {
    setLoading(true);
    const res = await fetch('/api/admin/enquiries');
    const data = await res.json();
    setEnquiries(data.enquiries || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/admin/enquiries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setEnquiries((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this enquiry? This cannot be undone.')) return;
    const res = await fetch(`/api/admin/enquiries/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setEnquiries((prev) => prev.filter((e) => e.id !== id));
    }
  }

  const filtered = filter === 'ALL' ? enquiries : enquiries.filter((e) => e.status === filter);
  const newCount = enquiries.filter((e) => e.status === 'NEW').length;

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  return (
    <div style={{ maxWidth: 900 }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Enquiries</h1>
      <p style={{ color: '#7A7870', fontSize: 15, marginBottom: 24, lineHeight: 1.7 }}>
        Every contact form submission lands here, even if the notification email fails.
        {newCount > 0 && <strong style={{ color: '#8B6F47' }}> {newCount} new.</strong>}
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['ALL', 'NEW', 'CONTACTED', 'CLOSED'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              padding: '8px 16px',
              fontSize: 11,
              letterSpacing: '0.1em',
              fontWeight: 600,
              border: '1px solid #DEDBD4',
              borderRadius: 2,
              background: filter === s ? '#0D0D0D' : 'transparent',
              color: filter === s ? '#F8F8F6' : '#7A7870',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: '#9C9890' }}>Loading…</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: '#9C9890' }}>No enquiries here yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((enquiry) => (
            <div
              key={enquiry.id}
              style={{
                background: '#fff',
                border: '0.5px solid #DEDBD4',
                borderRadius: 4,
                padding: 20,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{enquiry.name}</div>
                  <div style={{ fontSize: 13, color: '#9C9890', marginTop: 2 }}>{formatDate(enquiry.createdAt)}</div>
                </div>
                <span
                  style={{
                    fontSize: 10,
                    letterSpacing: '0.08em',
                    fontWeight: 700,
                    color: STATUS_COLORS[enquiry.status] || '#9C9890',
                    border: `1px solid ${STATUS_COLORS[enquiry.status] || '#9C9890'}`,
                    borderRadius: 2,
                    padding: '4px 8px',
                  }}
                >
                  {enquiry.status}
                </span>
              </div>

              <div style={{ display: 'flex', gap: 20, marginBottom: 12, flexWrap: 'wrap' }}>
                <a href={`mailto:${enquiry.email}`} style={{ fontSize: 14, color: '#0D0D0D' }}>{enquiry.email}</a>
                <a href={`tel:${enquiry.phone}`} style={{ fontSize: 14, color: '#0D0D0D' }}>{enquiry.phone}</a>
                {enquiry.whatsapp && (
                  <a
                    href={`https://wa.me/${enquiry.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: 14, color: '#8B6F47', fontWeight: 600 }}
                  >
                    Prefers WhatsApp →
                  </a>
                )}
              </div>

              <p style={{ fontSize: 14, color: '#4A4844', lineHeight: 1.6, marginBottom: 16, whiteSpace: 'pre-wrap' }}>
                {enquiry.message}
              </p>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['NEW', 'CONTACTED', 'CLOSED'].map((s) => (
                  <button
                    key={s}
                    onClick={() => updateStatus(enquiry.id, s)}
                    disabled={enquiry.status === s}
                    style={{
                      fontSize: 11,
                      letterSpacing: '0.08em',
                      padding: '6px 12px',
                      border: '1px solid #DEDBD4',
                      borderRadius: 2,
                      background: enquiry.status === s ? '#F0EEE8' : 'transparent',
                      color: enquiry.status === s ? '#9C9890' : '#0D0D0D',
                      cursor: enquiry.status === s ? 'default' : 'pointer',
                      fontFamily: 'inherit',
                      fontWeight: 600,
                    }}
                  >
                    MARK {s}
                  </button>
                ))}
                <button
                  onClick={() => handleDelete(enquiry.id)}
                  style={{
                    fontSize: 11,
                    letterSpacing: '0.08em',
                    padding: '6px 12px',
                    border: '1px solid #DEDBD4',
                    borderRadius: 2,
                    background: 'transparent',
                    color: '#B3434A',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontWeight: 600,
                    marginLeft: 'auto',
                  }}
                >
                  DELETE
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
