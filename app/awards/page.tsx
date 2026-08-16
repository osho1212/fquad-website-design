import Link from 'next/link';
import { getAwards, getSiteSettings } from '@/lib/public-content';

export const revalidate = 0;

export default async function AwardsPage() {
  const awards = await getAwards();
  const settings = await getSiteSettings();
  const whatsappNumber = settings?.whatsapp?.replace(/[^0-9]/g, '') || '919876543210';
  const instagramUrl = settings?.instagramUrl || '#';
  const email_ = settings?.email || 'admin@fquad.com';

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: AWARDS_STYLES }} />

      <div className="page-fade">
      <nav className="nav nav-solid" id="site-nav">
        <Link href="/" className="nav-logo" style={{display:'flex',alignItems:'center'}}><img src="/fquad-logo.png" alt="F.QUAD" className="site-logo" style={{height:48,width:'auto',display:'block'}} /></Link>
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
            <Link href="/team" className="active">STUDIO</Link>
            <div className="nav-dropdown">
              <Link href="/team">Our Team</Link>
              <Link href="/awards" className="active">Awards</Link>
            </div>
          </li>
          <li><Link href="/blog">JOURNAL</Link></li>
          <li><Link href="/testimonials">TESTIMONIALS</Link></li>
          <li><Link href="/contact">CONTACT</Link></li>
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

      <section className="awards-hero">
        <div className="awards-hero-content reveal">
          <div className="eyebrow">RECOGNITION</div>
          <h1>Work that speaks for itself</h1>
        </div>
      </section>

      <section className="awards-timeline">
        {awards.length > 0 ? (
          awards.map((award) => (
            <div className="award-row reveal" key={award.id}>
              <div className="award-year">{award.year}</div>
              <div>
                <div className="award-title">{award.title}</div>
                <p className="award-body">{award.body}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="awards-empty">Awards &amp; recognition coming soon</p>
        )}
      </section>

      <footer>
        <div className="footer-grid">
          <div>
            <img src="/fquad-logo.png" alt="F.QUAD" style={{height:40,width:'auto',display:'block',filter:'invert(1) brightness(2)',marginBottom:12}} />
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
            <div className="footer-contact-info">
              <p>{email_}</p>
              <p>{settings?.phone || ''}</p>
              <p>{settings?.address || 'Hyderabad, Telangana, India'}</p>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 F.QUAD Studio. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#">PRIVACY</a>
            <a href="#">SITEMAP</a>
          </div>
        </div>
      </footer>
      </div>

      <script dangerouslySetInnerHTML={{ __html: AWARDS_SCRIPT }} />
    </>
  );
}

const AWARDS_SCRIPT = `
(function() {
  var nav = document.getElementById('site-nav');
  if (nav) {
    window.addEventListener('scroll', function() {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    });
  }
  var toggle = document.querySelector('[data-toggle-nav]');
  var mobileMenu = document.getElementById('mobile-menu');
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', function() {
      var isOpen = mobileMenu.classList.toggle('open');
      document.body.style.overflow = isOpen ? 'hidden' : '';
      toggle.classList.toggle('active');
    });
    mobileMenu.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function() {
        mobileMenu.classList.remove('open');
        toggle.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(function(el) { observer.observe(el); });
})();
`;

const AWARDS_STYLES = `
  :root {
    --black: #2C2C2C; --white: #FAFAF8; --grey-dark: #6B6560; --grey-light: #9C9488;
    --grey-bg: #F5F0EA; --border: #E2DDD8; --bg-dark: #1E1E1E; --bg-darker: #1E1E1E;
    --font-goodtimes: 'Good Times', sans-serif;
    --h1: 64px; --h2: 40px; --h3: 28px; --h4: 24px;
    --body-lg: 18px; --body: 16px; --body-sm: 15px; --eyebrow: 11px;
    --margin-desktop: 48px; --margin-tablet: 32px; --margin-mobile: 20px;
    --gap-xxl: 48px; --gap-xl: 32px; --gap-lg: 24px; --gap-md: 16px; --gap-sm: 12px; --gap-xs: 8px;
    --nav-h: 84px;
  }
  html { scroll-behavior: smooth; }
  body { background: var(--white); color: var(--black); line-height: 1.5; -webkit-font-smoothing: antialiased; }
  a { color: inherit; text-decoration: none; }
  img, video { display: block; max-width: 100%; }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  .page-fade { animation: fadeIn 0.4s ease; }
  .reveal { opacity: 0; transform: translateY(30px); transition: opacity 0.7s cubic-bezier(0.25, 0.1, 0.25, 1), transform 0.7s cubic-bezier(0.25, 0.1, 0.25, 1); }
  .reveal.visible { opacity: 1; transform: translateY(0); }
  .stagger > .reveal:nth-child(2) { transition-delay: 0.08s; }
  .stagger > .reveal:nth-child(3) { transition-delay: 0.16s; }
  .stagger > .reveal:nth-child(4) { transition-delay: 0.24s; }
  .stagger > .reveal:nth-child(5) { transition-delay: 0.32s; }
  .stagger > .reveal:nth-child(6) { transition-delay: 0.40s; }

  .eyebrow { font-size: var(--eyebrow); letter-spacing: 0.22em; color: var(--grey-light); margin-bottom: var(--gap-md); text-transform: uppercase; }

  .nav { position: fixed; top: 0; left: 0; right: 0; display: flex; align-items: center; justify-content: space-between; padding: var(--gap-lg) var(--margin-desktop); height: var(--nav-h); background: rgba(248, 248, 246, 0.92); backdrop-filter: blur(8px); border-bottom: 0.5px solid var(--border); z-index: 100; }
  .nav-logo { font-family: var(--font-goodtimes); font-size: var(--h4); font-weight: 700; letter-spacing: 0.14em; color: var(--black); }
  .nav-links { display: flex; align-items: center; gap: var(--gap-xxl); list-style: none; }
  .nav-links a { font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--grey-dark); transition: color 0.25s ease; }
  .nav-links a:hover, .nav-links a.active { color: var(--black); font-weight: 600; }
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
  .btn-enquire { padding: var(--gap-sm) var(--gap-lg); background: var(--black); color: var(--white); border: 0.5px solid var(--black); font-size: var(--eyebrow); letter-spacing: 0.12em; font-weight: 600; cursor: pointer; font-family: inherit; }
  .btn-enquire:hover { background: transparent; color: var(--black); }
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
  @media (max-width: 768px) {
    .hamburger { display: block; }
    .nav-links { display: none !important; }
    .btn-enquire { display: none; }
  }

  .awards-hero { background: var(--bg-darker); min-height: 50vh; display: flex; align-items: center; justify-content: center; text-align: center; padding: calc(var(--nav-h) + var(--gap-xxl)) var(--margin-desktop) var(--gap-xxl); }
  .awards-hero-content { max-width: 720px; margin: 0 auto; color: var(--white); }
  .awards-hero-content .eyebrow { justify-content: center; }
  .awards-hero-content h1 { font-family: var(--font-goodtimes); font-size: var(--h1); font-weight: 500; letter-spacing: 0.01em; color: var(--white); }

  .awards-timeline { max-width: 900px; margin: 0 auto; padding: 80px var(--margin-desktop); }
  .award-row { display: grid; grid-template-columns: 120px 1fr; gap: 40px; border-bottom: 0.5px solid var(--border); padding: 40px 0; }
  .award-year { font-size: 40px; font-weight: 500; color: var(--border); }
  .award-title { font-size: 20px; font-weight: 500; color: var(--black); }
  .award-body { font-size: 14px; color: var(--grey-dark); line-height: 1.7; margin-top: 8px; }
  .awards-empty { text-align: center; color: var(--grey-light); padding: 120px 0; font-size: var(--body); }

  footer { background: var(--bg-darker); color: var(--white); padding: var(--gap-xxl) var(--margin-desktop); }
  .footer-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--gap-xxl); margin-bottom: var(--gap-xxl); }
  .footer-wordmark { font-family: var(--font-goodtimes); font-size: 22px; font-weight: 400; letter-spacing: 0.14em; margin-bottom: var(--gap-md); }
  .footer-tagline { font-size: 13px; color: var(--grey-dark); line-height: 1.7; }
  .footer-nav-heading { font-size: 11px; letter-spacing: 0.16em; color: #9C9488; margin-bottom: 20px; font-weight: 400; }
  .footer-nav-links { list-style: none; display: flex; flex-direction: column; gap: 12px; }
  .footer-nav-links a { font-size: 13px; color: #6B6560; text-decoration: none; transition: color 0.25s ease; }
  .footer-nav-links a:hover { color: #FAFAF8; }
  .footer-social { display: flex; gap: 16px; margin-top: 20px; }
  .footer-social a { font-size: 12px; color: #6B6560; letter-spacing: 0.08em; text-decoration: none; transition: color 0.25s ease; }
  .footer-social a:hover { color: #FAFAF8; }
  .footer-contact-info p { font-size: 13px; color: var(--grey-dark); margin-bottom: var(--gap-sm); }
  .footer-bottom { border-top: 0.5px solid #2C2C2C; padding-top: var(--gap-lg); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--gap-lg); font-size: 11px; color: var(--grey-dark); letter-spacing: 0.08em; }
  .footer-bottom-links { display: flex; gap: var(--gap-xxl); }
  .footer-bottom-links a { color: var(--grey-dark); }

  @media (max-width: 1024px) {
    :root { --margin-desktop: var(--margin-tablet); --h1: 42px; --h2: 32px; }
    .nav-links { gap: var(--gap-lg); }
  }
  @media (max-width: 720px) {
    :root { --margin-desktop: var(--margin-mobile); --h1: 40px; --h2: 28px; --h4: 20px; --body-lg: 16px; }
    .nav { padding: var(--gap-md) var(--margin-mobile); height: var(--nav-h); }
    .awards-timeline { padding: 48px var(--margin-mobile); }
    .award-row { grid-template-columns: 1fr; gap: var(--gap-sm); padding: var(--gap-xl) 0; }
    .award-year { font-size: 28px; }
    .footer-grid { grid-template-columns: 1fr; }
    .footer-bottom { flex-direction: column; align-items: flex-start; }
  }
`;
