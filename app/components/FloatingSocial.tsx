'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, type Variants } from 'framer-motion';

interface Settings {
  whatsapp: string | null;
  instagramUrl: string | null;
}

const fanVariants: Variants = {
  hidden: { opacity: 0, y: 12, scale: 0.6 },
  visible: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { delay: i * 0.05, duration: 0.25, ease: 'easeOut' },
  }),
  exit: { opacity: 0, y: 12, scale: 0.6, transition: { duration: 0.15 } },
};

const inputStyle: React.CSSProperties = {
  padding: '10px 12px', border: '0.5px solid #E2DDD8', borderRadius: 4, fontSize: 13,
  outline: 'none', background: '#fff', color: '#2C2C2C',
};

export default function FloatingSocial() {
  const pathname = usePathname();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>({ whatsapp: null, instagramUrl: null });

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  useEffect(() => {
    fetch('/api/site-settings')
      .then((res) => res.json())
      .then((data) => setSettings({ whatsapp: data.settings?.whatsapp ?? null, instagramUrl: data.settings?.instagramUrl ?? null }))
      .catch(() => {});
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setFormOpen(false);
      }
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
        setFormOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onEscape);
    };
  }, []);

  if (pathname?.startsWith('/admin')) return null;

  const whatsappNumber = settings.whatsapp?.replace(/[^0-9]/g, '') || '919876543210';
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hi F.QUAD, I'd like to discuss a project.")}`;
  const instagramHref = settings.instagramUrl || 'https://instagram.com/fquadstudio';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, message, whatsapp: false }),
      });
      if (res.ok) {
        setStatus('success');
        setName(''); setPhone(''); setEmail(''); setMessage('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  return (
    <div ref={rootRef} style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 998 }}>
      <AnimatePresence>
        {open && (
          <>
            <motion.a
              key="whatsapp"
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              custom={2}
              variants={fanVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              aria-label="WhatsApp"
              style={{
                position: 'absolute', bottom: 184, right: 2, width: 44, height: 44, borderRadius: '50%',
                background: '#25D366', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2zm0 18.13a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.22 8.22 0 1 1 6.98 3.86zm4.5-6.16c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.78.97-.14.17-.29.19-.53.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.36-.77-1.86-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31s-.87.86-.87 2.09.89 2.42 1.02 2.59c.12.17 1.75 2.67 4.25 3.74.59.26 1.06.41 1.42.52.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.1-.23-.16-.48-.28z"/></svg>
            </motion.a>

            <motion.a
              key="instagram"
              href={instagramHref}
              target="_blank"
              rel="noopener noreferrer"
              custom={1}
              variants={fanVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              aria-label="Instagram"
              style={{
                position: 'absolute', bottom: 124, right: 2, width: 44, height: 44, borderRadius: '50%',
                background: '#1E1E1E', color: '#FAFAF8', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeLinecap="round"/></svg>
            </motion.a>

            <motion.button
              key="enquiry"
              type="button"
              custom={0}
              variants={fanVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              aria-label="Quick enquiry"
              onClick={() => setFormOpen((v) => !v)}
              style={{
                position: 'absolute', bottom: 64, right: 2, width: 44, height: 44, borderRadius: '50%',
                background: '#FAFAF8', color: '#2C2C2C', border: '0.5px solid #E2DDD8', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 20h9" strokeLinecap="round"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </motion.button>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {formOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{
              position: 'fixed', bottom: 88, right: 28, width: 300,
              background: '#FAFAF8', border: '0.5px solid #E2DDD8', borderRadius: 6, padding: 20,
              boxShadow: '0 8px 40px rgba(0,0,0,0.1)',
            }}
          >
            {status === 'success' ? (
              <p style={{ fontSize: 13, color: '#2C2C2C', textAlign: 'center', padding: '20px 0' }}>
                Thanks — we&apos;ll be in touch within 24 hours.
              </p>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 400, color: '#2C2C2C', marginBottom: 4 }}>Quick enquiry</div>
                <input type="text" required placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
                <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
                <input type="tel" required placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} />
                <textarea rows={3} placeholder="Message" value={message} onChange={(e) => setMessage(e.target.value)} style={{ ...inputStyle, resize: 'vertical' }} />
                {status === 'error' && (
                  <p style={{ fontSize: 11, color: '#B3261E' }}>Something went wrong — please try again.</p>
                )}
                <button
                  type="submit"
                  disabled={status === 'sending'}
                  style={{
                    background: '#1E1E1E', color: '#FAFAF8', border: 'none', borderRadius: 4,
                    padding: '10px 0', fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase',
                    cursor: status === 'sending' ? 'not-allowed' : 'pointer', opacity: status === 'sending' ? 0.6 : 1,
                  }}
                >
                  {status === 'sending' ? 'SENDING…' : 'SEND'}
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        aria-label={open ? 'Close menu' : 'Open contact menu'}
        onClick={() => { setOpen((v) => !v); if (open) setFormOpen(false); }}
        style={{
          position: 'relative', width: 48, height: 48, borderRadius: '50%',
          background: '#1E1E1E', color: '#FAFAF8', border: 'none', cursor: 'pointer',
          fontSize: 20, lineHeight: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
          transition: 'transform 0.3s ease',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        }}
      >
        +
      </button>
    </div>
  );
}
