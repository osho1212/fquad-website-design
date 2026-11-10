'use client';

import { CSSProperties, useEffect, useState } from 'react';

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: 'ADMIN' | 'SUPERADMIN';
  hasPassword: boolean;
  lastLoginAt: string | null;
  createdAt: string | null;
}

const ROLE_HELP: Record<AdminUser['role'], string> = {
  ADMIN: 'Can read and manage enquiries, and change their own password. No access to website content, the media library or anything else.',
  SUPERADMIN: 'Everything: website content, media library, journal, team, testimonials, awards, settings, enquiries and this page.',
};

function when(iso: string | null) {
  if (!iso) return 'Never';
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export default function AdminTeamPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [me, setMe] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<AdminUser['role']>('ADMIN');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function load() {
    const res = await fetch('/api/admin/users');
    if (res.status === 403) {
      setForbidden(true);
    } else if (res.ok) {
      const data = await res.json();
      setUsers(data.users || []);
      setMe(data.currentUserId ?? null);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd() {
    setError('');
    setNotice('');
    setAdding(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, role }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Could not add this teammate.');
      } else {
        setNotice(
          `${data.user.email} now has access. Ask them to open ${window.location.origin}/admin/login and choose “Continue with Google” with that address.`
        );
        setEmail('');
        setName('');
        setRole('ADMIN');
        await load();
      }
    } finally {
      setAdding(false);
    }
  }

  async function handleRole(user: AdminUser, next: AdminUser['role']) {
    if (next === user.role) return;
    if (user.id === me && !confirm('You are changing your own role. If you make yourself ADMIN you will lose access to this page. Continue?')) {
      return;
    }
    setError('');
    setNotice('');
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: next }),
    });
    if (res.ok) {
      await load();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Could not change the role.');
    }
  }

  async function handleRemove(user: AdminUser) {
    if (!confirm(`Remove access for ${user.email}? They will be signed out right away and can no longer sign in.`)) return;
    setError('');
    setNotice('');
    const res = await fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' });
    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Could not remove this teammate.');
    }
  }

  if (loading) return <p style={{ color: '#9C9890' }}>Loading…</p>;

  if (forbidden) {
    return (
      <div style={{ maxWidth: 720 }}>
        <h1 style={{ fontSize: 28, marginBottom: 8 }}>Admin Team</h1>
        <p style={{ color: '#7A7870', fontSize: 15, lineHeight: 1.7 }}>Only a SUPERADMIN can manage who has access to the admin.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 820 }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Admin Team</h1>
      <p style={{ color: '#7A7870', fontSize: 15, marginBottom: 24, lineHeight: 1.7 }}>
        The people who can sign in to this admin. Add a teammate&rsquo;s Google email address and they sign in with{' '}
        <strong style={{ color: '#0D0D0D' }}>Continue with Google</strong>; no password is created. To change who is shown on
        the website&rsquo;s Team page, use <strong style={{ color: '#0D0D0D' }}>Team</strong> instead.
      </p>

      <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Google email address"
            aria-label="Google email address"
            style={{ ...inputStyle, flex: 2, minWidth: 220 }}
          />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name (optional)"
            aria-label="Name"
            style={{ ...inputStyle, flex: 1, minWidth: 140 }}
          />
          <select value={role} onChange={(e) => setRole(e.target.value as AdminUser['role'])} aria-label="Role" style={{ ...inputStyle, width: 150 }}>
            <option value="ADMIN">Admin</option>
            <option value="SUPERADMIN">Superadmin</option>
          </select>
        </div>
        <p style={{ color: '#9C9890', fontSize: 13, margin: 0 }}>{ROLE_HELP[role]}</p>
        {error && <p role="alert" style={{ color: '#B3434A', fontSize: 14, margin: 0 }}>{error}</p>}
        {notice && <p role="status" style={{ color: '#3F7A4A', fontSize: 14, margin: 0, lineHeight: 1.6 }}>{notice}</p>}
        <button onClick={handleAdd} disabled={adding || !email.trim()} style={{ ...primaryButton, opacity: adding || !email.trim() ? 0.6 : 1 }}>
          {adding ? 'ADDING…' : '+ ADD TEAMMATE'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {users.map((user) => (
          <div key={user.id} style={{ ...card, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ fontSize: 15, fontWeight: 600, wordBreak: 'break-all' }}>
                {user.email} {user.id === me && <span style={youBadge}>YOU</span>}
              </div>
              <div style={{ fontSize: 13, color: '#7A7870', marginTop: 2 }}>
                {user.name ? `${user.name} · ` : ''}
                {user.hasPassword ? 'Password or Google' : 'Google only'} · Last sign-in: {when(user.lastLoginAt)}
              </div>
            </div>
            <select
              value={user.role}
              onChange={(e) => handleRole(user, e.target.value as AdminUser['role'])}
              aria-label={`Role for ${user.email}`}
              style={{ ...inputStyle, width: 150 }}
            >
              <option value="ADMIN">Admin</option>
              <option value="SUPERADMIN">Superadmin</option>
            </select>
            <button
              onClick={() => handleRemove(user)}
              disabled={user.id === me}
              title={user.id === me ? 'You cannot remove your own access' : 'Remove access'}
              style={{ ...removeButton, opacity: user.id === me ? 0.4 : 1, cursor: user.id === me ? 'not-allowed' : 'pointer' }}
            >
              REMOVE
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

const card: CSSProperties = {
  background: '#fff',
  border: '0.5px solid #DEDBD4',
  borderRadius: 4,
  padding: 20,
};

const inputStyle: CSSProperties = {
  padding: '10px 12px',
  border: '1px solid #D5D3CC',
  background: '#FFFFFF',
  fontSize: 15,
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  borderRadius: 2,
};

const primaryButton: CSSProperties = {
  alignSelf: 'flex-start',
  padding: '11px 20px',
  background: '#0D0D0D',
  color: '#F8F8F6',
  border: 'none',
  borderRadius: 2,
  fontSize: 12,
  letterSpacing: '0.1em',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'inherit',
};

const removeButton: CSSProperties = {
  padding: '9px 14px',
  background: 'transparent',
  color: '#B3434A',
  border: '1px solid #E3C3C6',
  borderRadius: 2,
  fontSize: 11,
  letterSpacing: '0.1em',
  fontWeight: 600,
  fontFamily: 'inherit',
};

const youBadge: CSSProperties = {
  fontSize: 10,
  letterSpacing: '0.12em',
  background: '#DEDBD4',
  color: '#0D0D0D',
  padding: '2px 6px',
  borderRadius: 2,
  marginLeft: 6,
  verticalAlign: 'middle',
};
