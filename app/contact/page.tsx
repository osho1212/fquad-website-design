'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface SiteSettings {
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  instagramUrl: string | null;
  mapLat: number | null;
  mapLng: number | null;
}

export default function ContactPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [whatsappPref, setWhatsappPref] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetch('/api/site-settings')
      .then((res) => res.json())
      .then((data) => setSettings(data.settings));
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const hamburger = document.querySelector('[data-toggle-nav]');
    const mobileMenu = document.getElementById('mobile-menu');
    if (!hamburger || !mobileMenu) return;
    const handleToggle = () => {
      const isOpen = mobileMenu.classList.toggle('open');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    };
    hamburger.addEventListener('click', handleToggle);
    return () => hamburger.removeEventListener('click', handleToggle);
  }, []);

async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !message.trim()) {
      setStatus('error');
      setErrorMsg('Please fill in your name, email, and message.');
      return;
    }

    setErrorMsg('');
    setStatus('sending');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, message, whatsapp: whatsappPref }),
      });

      if (res.ok) {
        setStatus('success');
        setName('');
        setEmail('');
        setPhone('');
        setMessage('');
        setWhatsappPref(false);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    } finally {
      setStatus((s) => s === 'sending' ? 'error' : s);
    }
  }

  const whatsappNumber = settings?.whatsapp?.replace(/[^0-9]/g, '') || '919876543210';
  const instagramUrl = settings?.instagramUrl || '#';
  const email_ = settings?.email || 'admin@fquad.com';

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CONTACT_STYLES }} />

      <div className="page-fade">
      <nav className="nav nav-solid" id="site-nav">
        <Link href="/" className="nav-logo" style={{display:'flex',alignItems:'center'}}><img src="/assets/images/fquad-white-logo.svg" alt="F.QUAD" className="site-logo" style={{height:48,width:'auto',display:'block'}} /></Link>
        <ul className="nav-links">
          <li><Link href="/">HOME</Link></li>
          <li><Link href="/about">ABOUT</Link></li>
          <li className="nav-item">
            <Link href="/projects">PROJECTS</Link>
            <div className="nav-dropdown">
              <Link href="/projects">All Projects</Link>
              <Link href="/upcoming">Upcoming</Link>
            </div>
          </li>
          <li className="nav-item">
            <Link href="/team">STUDIO</Link>
            <div className="nav-dropdown">
              <Link href="/team">Our Team</Link>
              <Link href="/awards">Awards</Link>
            </div>
          </li>
          <li><Link href="/blog">JOURNAL</Link></li>
          <li><Link href="/testimonials">TESTIMONIALS</Link></li>
          <li><Link href="/contact" className="active">CONTACT</Link></li>
        </ul>
        <button className="hamburger nav-toggle" data-toggle-nav aria-label="Toggle menu">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round"/></svg>
        </button>
        <button className="btn-enquire">ENQUIRE</button>
      </nav>

      <div className="mobile-menu" id="mobile-menu">
        <Link href="/">HOME</Link>
        <Link href="/about">ABOUT</Link>
        <Link href="/projects">PROJECTS</Link>
        <Link href="/upcoming">UPCOMING</Link>
        <Link href="/team">TEAM</Link>
        <Link href="/awards">AWARDS</Link>
        <Link href="/blog">JOURNAL</Link>
        <Link href="/testimonials">TESTIMONIALS</Link>
        <Link href="/contact">CONTACT</Link>
      </div>

      <section className="hero">
        <h1>Get in touch</h1>
        <p>Have a project in mind? Let's start a conversation. We'd love to hear about your vision.</p>
      </section>

      <div className="content">
        <div className="content-grid">
          <div className="reveal">
            <h2 className="section-title">Send us a message</h2>
            <div className="gold-line" />

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="name">Name</label>
                <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
              </div>

             <div className="field">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required />
              </div>

              <div className="field">
                <label htmlFor="phone">Phone</label>
                <input type="tel" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" required />
              </div>

              <div className="field">
                <label htmlFor="message">Message</label>
                <textarea id="message" rows={6} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell us about your project..." required />
              </div>

              <label className="checkbox-row">
                <input type="checkbox" checked={whatsappPref} onChange={(e) => setWhatsappPref(e.target.checked)} />
                <span>Prefer to chat on WhatsApp</span>
              </label>

              {status === 'success' && (
                <div className="status-msg success">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round"/><polyline points="22 4 12 14.01 9 11.01" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <p>Thank you! We&apos;ll be in touch within 24 hours.</p>
                </div>
              )}

              {status === 'error' && (
                <div className="status-msg error">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12" strokeLinecap="round"/><line x1="12" y1="16" x2="12.01" y2="16" strokeLinecap="round"/></svg>
                  <p>Something went wrong. Please try again or contact us directly.</p>
                </div>
              )}

              {errorMsg && status === 'error' && (
                <div style={{ color: '#B3434A', fontSize: 13, marginBottom: 12 }}>{errorMsg}</div>
              )}

              <button type="submit" className="btn-submit" disabled={status === 'sending'}>
                {status === 'sending' ? 'SENDING…' : 'SEND MESSAGE'}
              </button>
            </form>
          </div>

          <div className="reveal">
            <h2 className="section-title">Contact details</h2>
            <div className="gold-line" />

            <div className="info-row">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" strokeLinecap="round" strokeLinejoin="round"/><polyline points="22,6 12,13 2,6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <div>
                <div className="info-label">EMAIL</div>
                <a href={`mailto:${email_}`} className="info-value">{email_}</a>
              </div>
            </div>

            <div className="info-row">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="10" r="3"/></svg>
              <div>
                <div className="info-label">LOCATION</div>
                <div className="info-value">{settings?.address || 'Hyderabad, Telangana, India'}</div>
              </div>
            </div>

            <div className="info-row">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <div>
                <div className="info-label">WHATSAPP</div>
                <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="info-value">{settings?.whatsapp || '+91 98765 43210'}</a>
              </div>
            </div>

            {settings?.instagramUrl && (
              <div className="info-row">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeLinecap="round"/></svg>
                <div>
                  <div className="info-label">INSTAGRAM</div>
                  <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="info-value">@fquadstudio</a>
                </div>
              </div>
            )}

            {settings?.mapLat && settings?.mapLng && (
              <div className="map-wrap">
                <iframe
                  width="100%"
                  height="320"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${settings.mapLng - 0.02},${settings.mapLat - 0.02},${settings.mapLng + 0.02},${settings.mapLat + 0.02}&layer=mapnik&marker=${settings.mapLat},${settings.mapLng}`}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <section className="cta-strip">
        <div className="cta-strip-inner reveal">
          <div>
            <h3>Quick response guaranteed</h3>
            <p>We typically respond to inquiries within 24 hours during business days.</p>
          </div>
          <div className="cta-buttons">
            <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="btn-outline">WHATSAPP</a>
            <a href={`mailto:${email_}`} className="btn-gold">EMAIL US</a>
          </div>
        </div>
      </section>

      <footer>
        <div className="footer-grid">
          <div>
            <img src="/assets/images/fquad-white-logo.svg" alt="F.QUAD" style={{height:40,width:'auto',display:'block',filter:'invert(1) brightness(2)',marginBottom:12}} />
            <p className="footer-tagline">Architecture &amp; Interior Design Studio, Hyderabad</p>
            <div className="footer-social">
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer">INSTAGRAM</a>
              <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer">WHATSAPP</a>
            </div>
          </div>
          <div>
            <div className="footer-nav-heading">STUDIO</div>
            <ul className="footer-nav-links">
              <li><Link href="/about">About</Link></li>
              <li><Link href="/team">Our Team</Link></li>
              <li><Link href="/awards">Awards &amp; Recognition</Link></li>
              <li><Link href="/blog">Journal</Link></li>
            </ul>
          </div>
          <div>
            <div className="footer-nav-heading">PROJECTS</div>
            <ul className="footer-nav-links">
              <li><Link href="/projects">All Projects</Link></li>
              <li><Link href="/upcoming">Upcoming</Link></li>
              <li><Link href="/projects?category=residential">Residential</Link></li>
              <li><Link href="/projects?category=commercial">Commercial</Link></li>
            </ul>
          </div>
          <div>
            <div className="footer-nav-heading">CONTACT</div>
            <p style={{ fontSize: 13, color: '#6B6560' }}>{email_}</p>
            <p style={{ fontSize: 13, color: '#6B6560' }}>{settings?.phone || ''}</p>
            <p style={{ fontSize: 13, color: '#6B6560' }}>{settings?.address || 'Hyderabad, Telangana, India'}</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 F.QUAD Studio. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#">PRIVACY</a>
            <a href="#">SITEMAP</a>
          </div>
        </div>
      </footer>
      </div>
    </>
  );
}

const CONTACT_STYLES = `
  :root {
    --black: #2C2C2C; --white: #FAFAF8; --gold: #6B6560; --gold-dark: #9C9488;
    --grey-dark: #6B6560; --grey-light: #9C9488; --grey-bg: #F5F0EA; --border: #E2DDD8;
    --bg-darker: #1E1E1E;
    --font-goodtimes: 'Good Times', sans-serif;
    --h1: 64px; --h2: 40px; --h3: 28px; --h4: 24px;
    --body-lg: 18px; --body: 16px; --body-sm: 15px; --eyebrow: 11px;
    --margin-desktop: 48px; --margin-tablet: 32px; --margin-mobile: 20px;
    --gap-xxl: 48px; --gap-xl: 32px; --gap-lg: 24px; --gap-md: 16px; --gap-sm: 12px; --gap-xs: 8px;
  }
  body { background: var(--white); color: var(--black); line-height: 1.5; }
  a { color: inherit; text-decoration: none; }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  .page-fade { animation: fadeIn 0.4s ease; }
  .reveal { opacity: 0; transform: translateY(30px); transition: opacity 0.7s cubic-bezier(0.25, 0.1, 0.25, 1), transform 0.7s cubic-bezier(0.25, 0.1, 0.25, 1); }
  .reveal.visible { opacity: 1; transform: translateY(0); }

  .nav { display: flex; align-items: center; justify-content: space-between; padding: var(--gap-lg) var(--margin-desktop); border-bottom: 0.5px solid var(--border); position: sticky; top: 0; background: var(--white); z-index: 50; }
  .nav-logo { font-family: var(--font-goodtimes); font-size: var(--h4); font-weight: 700; letter-spacing: 0.14em; color: var(--black); }
  .nav-links { display: flex; gap: var(--gap-xxl); list-style: none; }
  .nav-links a { font-size: 12px; letter-spacing: 0.12em; color: var(--grey-dark); transition: color 0.25s ease; }
  .nav-links a:hover, .nav-links a.active { color: var(--black); font-weight: 600; }
  .btn-enquire { padding: var(--gap-sm) var(--gap-lg); background: var(--black); color: var(--white); border: 0.5px solid var(--black); font-size: var(--eyebrow); letter-spacing: 0.12em; font-weight: 600; cursor: pointer; font-family: inherit; }
  .btn-enquire:hover { background: transparent; color: var(--black); }

  .nav-item { position: relative; display: inline-block; }
  .nav-dropdown {
    position: absolute; top: 100%; left: 50%;
    transform: translateX(-50%) translateY(-8px);
    background: #1E1E1E; min-width: 180px; padding: 8px 0;
    opacity: 0; visibility: hidden;
    transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s;
    border: 0.5px solid #2C2C2C; z-index: 200; pointer-events: none;
  }
  .nav-item:hover .nav-dropdown {
    opacity: 1; visibility: visible;
    transform: translateX(-50%) translateY(0); pointer-events: auto;
  }
  .nav-dropdown a {
    display: block; padding: 10px 20px; color: #9C9488;
    font-size: 11px; letter-spacing: 0.1em; text-decoration: none;
    transition: color 0.2s ease;
  }
  .nav-dropdown a:hover, .nav-dropdown a.active { color: #FAFAF8; }
  .mobile-menu {
    position: fixed; inset: 0; background: #1E1E1E; z-index: 500;
    display: flex; flex-direction: column; justify-content: center;
    align-items: center; gap: 28px;
    opacity: 0; visibility: hidden;
    transition: opacity 0.3s ease, visibility 0.3s;
  }
  .mobile-menu.open { opacity: 1; visibility: visible; }
  .mobile-menu a { font-size: 20px; color: #FAFAF8; letter-spacing: 0.1em; text-decoration: none; }
  .hamburger { display: none; background: none; border: none; cursor: pointer; padding: 4px; color: inherit; }
  .hamburger svg { width: 28px; height: 28px; }

  .hero { background: var(--grey-bg); padding: var(--gap-xxl) var(--margin-desktop); }
  .hero h1 { font-family: var(--font-goodtimes); font-size: var(--h1); font-weight: 500; margin-bottom: var(--gap-lg); letter-spacing: 0.01em; }
  .hero p { font-size: var(--body-lg); color: var(--grey-dark); max-width: 640px; line-height: 1.7; }

  .content { max-width: 1920px; margin: 0 auto; padding: var(--gap-xxl) var(--margin-desktop); }
  .content-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--gap-xxl); align-items: start; }

  .section-title { font-family: var(--font-goodtimes); font-size: var(--h2); font-weight: 500; letter-spacing: 0.01em; margin-bottom: var(--gap-sm); }
  .gold-line { width: 60px; height: 2px; background: var(--gold); margin-bottom: var(--gap-xxl); }

  form { display: flex; flex-direction: column; gap: var(--gap-xl); }
  .field label { display: block; font-size: var(--body-sm); font-weight: 600; margin-bottom: var(--gap-md); }
  .field input, .field textarea { width: 100%; padding: var(--gap-md) var(--gap-lg); border: 0.5px solid var(--border); font-size: var(--body); font-family: inherit; outline: none; background: var(--white); color: var(--black); transition: box-shadow 0.2s ease; }
  .field textarea { resize: vertical; min-height: 150px; line-height: 1.7; }
  .field input:focus, .field textarea:focus { box-shadow: 0 0 0 2px var(--gold); }

  .checkbox-row { display: flex; align-items: center; gap: var(--gap-md); cursor: pointer; }
  .checkbox-row input { width: 20px; height: 20px; cursor: pointer; accent-color: var(--gold); }
  .checkbox-row span { font-size: var(--body-sm); color: var(--grey-dark); }

  .status-msg { display: flex; align-items: flex-start; gap: var(--gap-md); padding: var(--gap-lg); border: 0.5px solid var(--gold); background: #f5f1e8; font-size: var(--body-sm); }
  .status-msg.success { color: #166534; border-color: #86efac; background: #f0fdf4; }
  .status-msg.error { color: #991b1b; border-color: #fca5a5; background: #fef2f2; }
  .status-msg svg { width: 20px; height: 20px; flex-shrink: 0; margin-top: 2px; }

  .btn-submit { width: 100%; background: var(--black); color: var(--white); font-weight: 600; padding: var(--gap-lg); font-size: var(--body-sm); letter-spacing: 0.12em; border: none; cursor: pointer; font-family: inherit; }
  .btn-submit:hover:not(:disabled) { background: transparent; color: var(--black); border: 0.5px solid var(--black); }
  .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

  .info-row { display: flex; gap: var(--gap-lg); margin-bottom: var(--gap-xxl); }
  .info-row svg { width: 26px; height: 26px; color: var(--gold); flex-shrink: 0; margin-top: 4px; }
  .info-label { font-size: var(--eyebrow); font-weight: 600; color: var(--grey-light); letter-spacing: 0.16em; margin-bottom: var(--gap-sm); }
  .info-value { font-size: var(--body); }

  .map-wrap { border-radius: 2px; overflow: hidden; border: 0.5px solid var(--border); margin-top: var(--gap-xl); }

  .cta-strip { background: var(--bg-darker); color: var(--white); padding: var(--gap-xl) var(--margin-desktop); }
  .cta-strip-inner { max-width: 1920px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: var(--gap-xl); align-items: center; }
  .cta-strip h3 { font-size: var(--h3); font-weight: 500; margin-bottom: var(--gap-md); font-family: var(--font-goodtimes); }
  .cta-strip p { font-size: var(--body); color: var(--grey-light); line-height: 1.7; }
  .cta-buttons { display: flex; gap: var(--gap-lg); justify-content: flex-end; flex-wrap: wrap; }
  .btn-outline { padding: var(--gap-md) var(--gap-lg); border: 0.5px solid var(--white); color: var(--white); font-weight: 600; font-size: var(--body-sm); letter-spacing: 0.12em; }
  .btn-outline:hover { background: var(--white); color: var(--black); }
  .btn-gold { padding: var(--gap-md) var(--gap-lg); background: var(--gold); color: var(--black); font-weight: 600; font-size: var(--body-sm); letter-spacing: 0.12em; }
  .btn-gold:hover { background: var(--gold-dark); color: var(--white); }

  footer { background: var(--bg-darker); color: var(--white); padding: var(--gap-xxl) var(--margin-desktop); }
  .footer-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--gap-xxl); margin-bottom: var(--gap-xxl); }
  .footer-brand { font-family: var(--font-goodtimes); font-size: 22px; font-weight: 400; letter-spacing: 0.14em; margin-bottom: var(--gap-lg); }
  .footer-tagline { font-size: 13px; color: #6B6560; line-height: 1.7; }
  .footer-nav-heading { font-size: 11px; letter-spacing: 0.16em; color: #9C9488; margin-bottom: 20px; font-weight: 400; }
  .footer-nav-links { list-style: none; display: flex; flex-direction: column; gap: 12px; }
  .footer-nav-links a { font-size: 13px; color: #6B6560; text-decoration: none; transition: color 0.25s ease; }
  .footer-nav-links a:hover { color: #FAFAF8; }
  .footer-social { display: flex; gap: 16px; margin-top: 20px; }
  .footer-social a { font-size: 12px; color: #6B6560; letter-spacing: 0.08em; text-decoration: none; transition: color 0.25s ease; }
  .footer-social a:hover { color: #FAFAF8; }
  .footer-bottom { border-top: 0.5px solid #2C2C2C; padding-top: var(--gap-lg); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--gap-lg); font-size: 11px; color: #6B6560; letter-spacing: 0.08em; }
  .footer-bottom-links { display: flex; gap: var(--gap-xxl); }
  .footer-bottom-links a { color: #6B6560; }

  @media (max-width: 1024px) {
    :root { --margin-desktop: var(--margin-tablet); --h1: 42px; --h2: 32px; }
    .nav-links { gap: var(--gap-lg); }
    .content-grid { grid-template-columns: 1fr; gap: var(--gap-xxl); }
    .cta-strip-inner { grid-template-columns: 1fr; text-align: left; }
    .cta-buttons { justify-content: flex-start; }
  }
  @media (max-width: 720px) {
    :root { --margin-desktop: var(--margin-mobile); --h1: 40px; --h2: 28px; --h4: 20px; --body-lg: 16px; }
    .nav { padding: var(--gap-md) var(--margin-mobile); flex-wrap: wrap; }
    .footer-grid { grid-template-columns: 1fr; }
    .footer-bottom { flex-direction: column; align-items: flex-start; }
  }
  @media (max-width: 768px) {
    .hamburger { display: block; }
    .nav-links { display: none !important; }
    .btn-enquire { display: none; }
  }
`;