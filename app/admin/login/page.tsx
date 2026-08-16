
'use client';

import { Suspense } from 'react';
import { useState, FormEvent, CSSProperties } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const from = searchParams.get('from') || '/admin';
        router.push(from);
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Invalid email or password.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="admin-root" style={styles.page}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <div style={styles.logo}>F.QUAD</div>
        <p style={styles.subtitle}>STUDIO ADMIN</p>

        <label style={styles.label} htmlFor="email">EMAIL</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
          autoComplete="username"
          required
        />

        <label style={styles.label} htmlFor="password">PASSWORD</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          autoComplete="current-password"
          required
        />

        {error && <p style={styles.error}>{error}</p>}

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'SIGNING IN…' : 'SIGN IN'}
        </button>
      </form>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0D0D0D',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    background: '#F8F8F6',
    padding: '40px 36px',
    borderRadius: 4,
    display: 'flex',
    flexDirection: 'column',
  },
  logo: {
    fontSize: 24,
    fontWeight: 700,
    letterSpacing: '0.14em',
    color: '#0D0D0D',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#7A7870',
    letterSpacing: '0.18em',
    marginBottom: 28,
  },
  label: {
    fontSize: 12,
    letterSpacing: '0.14em',
    color: '#7A7870',
    marginTop: 16,
    marginBottom: 6,
    fontWeight: 600,
  },
  input: {
    padding: '12px 14px',
    border: '1px solid #DEDBD4',
    borderRadius: 2,
    fontSize: 15,
    fontFamily: 'inherit',
    background: '#fff',
    color: '#0D0D0D',
    outline: 'none',
  },
  error: {
    color: '#B3434A',
    fontSize: 13,
    marginTop: 14,
    marginBottom: 0,
  },
  button: {
    marginTop: 28,
    padding: '13px',
    background: '#0D0D0D',
    color: '#F8F8F6',
    border: 'none',
    borderRadius: 2,
    fontSize: 12,
    letterSpacing: '0.16em',
    fontWeight: 600,
    cursor: 'pointer',
  },
};
