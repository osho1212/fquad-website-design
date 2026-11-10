'use client';

import { Suspense } from 'react';
import { useState, FormEvent, CSSProperties } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import type { GoogleSignInConfig } from '@/lib/firebase-client';

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

// `google` is null when the Firebase web settings are not provided (see
// .env.example): the page is then the password form alone.
function LoginForm({ google }: { google: GoogleSignInConfig | null }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  function signedIn() {
    const requested = searchParams.get('from') || '';
    // Same-site admin paths only — never an outside address or a javascript: link.
    const safe = /^\/admin(\/[A-Za-z0-9\-_./]*)?$/.test(requested) && !requested.includes('..');
    router.push(safe ? requested : '/admin');
    router.refresh();
  }

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
        signedIn();
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

  async function handleGoogle() {
    if (!google) return;
    setError('');
    setGoogleLoading(true);
    try {
      // Loaded on demand so the password form stays light.
      const { googleIdToken, GoogleSignInCancelled } = await import('@/lib/firebase-client');
      let idToken: string;
      try {
        idToken = await googleIdToken(google);
      } catch (err) {
        if (err instanceof GoogleSignInCancelled) return;
        throw err;
      }
      const res = await fetch('/api/admin/login/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      if (res.ok) {
        signedIn();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Google sign-in failed.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <main className="admin-root" style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>F.QUAD</div>
        <p style={styles.subtitle}>STUDIO ADMIN</p>

        {google && (
          <>
            <button type="button" onClick={handleGoogle} disabled={googleLoading || loading} style={styles.googleButton}>
              <GoogleMark />
              {googleLoading ? 'OPENING GOOGLE…' : 'CONTINUE WITH GOOGLE'}
            </button>
            <div style={styles.divider} aria-hidden="true">
              <span style={styles.dividerLine} />
              <span style={styles.dividerText}>OR WITH A PASSWORD</span>
              <span style={styles.dividerLine} />
            </div>
          </>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={{ ...styles.label, marginTop: 0 }} htmlFor="email">EMAIL</label>
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

          {error && <p role="alert" style={styles.error}>{error}</p>}

          <button type="submit" disabled={loading || googleLoading} style={styles.button}>
            {loading ? 'SIGNING IN…' : 'SIGN IN'}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function AdminLoginForm({ google }: { google: GoogleSignInConfig | null }) {
  return (
    <Suspense fallback={null}>
      <LoginForm google={google} />
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
  form: {
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
  googleButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: '12px 10px',
    background: '#fff',
    color: '#0D0D0D',
    border: '1px solid #DEDBD4',
    borderRadius: 2,
    fontSize: 11,
    letterSpacing: '0.08em',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    margin: '22px 0 6px',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    background: '#DEDBD4',
  },
  dividerText: {
    fontSize: 10,
    letterSpacing: '0.1em',
    whiteSpace: 'nowrap',
    color: '#9C9890',
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
