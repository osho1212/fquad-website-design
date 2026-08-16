'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    setLoading(true);
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      style={{
        padding: '10px 12px',
        background: 'transparent',
        color: '#9C9890',
        border: '0.5px solid #2A2A2A',
        borderRadius: 2,
        fontSize: 11,
        letterSpacing: '0.14em',
        fontWeight: 600,
        cursor: 'pointer',
        fontFamily: 'inherit',
        width: '100%',
      }}
    >
      {loading ? 'SIGNING OUT…' : 'SIGN OUT'}
    </button>
  );
}
