'use client';

import { useState, FormEvent, CSSProperties } from 'react';

const MIN_LENGTH = 12;

export default function AccountPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (newPassword.length < MIN_LENGTH) {
      setMessage({ kind: 'error', text: `Use at least ${MIN_LENGTH} characters for the new password.` });
      return;
    }
    if (newPassword !== confirm) {
      setMessage({ kind: 'error', text: 'The new password and its confirmation do not match.' });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setMessage({ kind: 'ok', text: 'Password changed. Use the new one the next time you sign in.' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirm('');
      } else {
        setMessage({ kind: 'error', text: data.error || 'Could not change the password.' });
      }
    } catch {
      setMessage({ kind: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ maxWidth: 480 }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Account</h1>
      <p style={{ color: '#7A7870', fontSize: 15, marginBottom: 28, lineHeight: 1.7 }}>
        Change the password you use to sign in. Use at least {MIN_LENGTH} characters, and a password
        you do not use anywhere else.
      </p>

      <form onSubmit={handleSubmit}>
        <label style={styles.label} htmlFor="current">CURRENT PASSWORD</label>
        <input
          id="current"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          style={styles.input}
          autoComplete="current-password"
          required
        />

        <label style={styles.label} htmlFor="new">NEW PASSWORD</label>
        <input
          id="new"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          style={styles.input}
          autoComplete="new-password"
          minLength={MIN_LENGTH}
          required
        />

        <label style={styles.label} htmlFor="confirm">CONFIRM NEW PASSWORD</label>
        <input
          id="confirm"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          style={styles.input}
          autoComplete="new-password"
          required
        />

        {message && (
          <p
            role={message.kind === 'error' ? 'alert' : 'status'}
            style={{ fontSize: 14, marginBottom: 16, color: message.kind === 'error' ? '#B3402F' : '#3F7A4A' }}
          >
            {message.text}
          </p>
        )}

        <button type="submit" disabled={saving} style={styles.button}>
          {saving ? 'SAVING…' : 'CHANGE PASSWORD'}
        </button>
      </form>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  label: {
    display: 'block',
    fontSize: 11,
    letterSpacing: '0.14em',
    color: '#7A7870',
    marginBottom: 6,
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    marginBottom: 20,
    border: '1px solid #D5D3CC',
    background: '#FFFFFF',
    fontSize: 15,
    boxSizing: 'border-box',
  },
  button: {
    padding: '12px 24px',
    background: '#0D0D0D',
    color: '#F8F8F6',
    border: 'none',
    fontSize: 12,
    letterSpacing: '0.16em',
    cursor: 'pointer',
  },
};
