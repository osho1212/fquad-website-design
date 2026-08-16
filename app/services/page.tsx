import Link from 'next/link';
import { getSiteSettings } from '@/lib/public-content';

const SERVICES = [
  { icon: '◧', name: 'Architecture', desc: 'Residential, commercial, and hospitality spaces designed around climate and context.' },
  { icon: '◨', name: 'Interior Design', desc: 'Material, light, and layout brought together with quiet precision.' },
  { icon: '◫', name: 'Landscape', desc: 'Outdoor spaces that extend the architecture into its surroundings.' },
  { icon: '⬒', name: 'Commercial Fit-out', desc: 'Workplace and retail interiors built for how people actually use them.' },
  { icon: '◩', name: 'Hospitality Design', desc: 'Restaurants, cafes, and hotels designed for atmosphere and flow.' },
  { icon: '⬓', name: 'Space Planning', desc: 'Layouts that resolve function first, so the design can follow.' },
];

const PROCESS = [
  { number: '01', name: 'Brief', desc: "We start with site visits and long conversations — understanding how you live, work, and want to feel in the space. Nothing gets drawn until we've listened. This stage sets the brief everything else is measured against." },
  { number: '02', name: 'Concept', desc: 'Sketches, massing studies, and material references bring the early direction into focus. We present options, not a single fixed answer. This is where the character of the project gets decided.' },
  { number: '03', name: 'Development', desc: 'Concept becomes detailed drawings, specifications, and approvals. We coordinate with contractors and consultants so nothing gets lost between design and site. Budgets and timelines get locked in here.' },
  { number: '04', name: 'Delivery', desc: "On-site supervision through construction, fit-out, and styling, right up to handover. We stay involved until the space is exactly what was promised. Then we don't disappear — we're on call after you move in." },
];

const PROJECT_TYPES = ['Residence', 'Villa', 'Apartment', 'Office', 'Restaurant', 'Hotel', 'Retail', 'Landscape'];

export default async function ServicesPage() {
  const settings = await getSiteSettings();
  const whatsappNumber = settings?.whatsapp?.replace(/[^0-9]/g, '') || '919876543210';
  const instagramUrl = settings?.instagramUrl || '#';
  const email_ = settings?.email || 'admin@fquad.com';

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: SERVICES_STYLES }} />

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
            <Link href="/team">STUDIO</Link>
            <div className="nav-dropdown">
              <Link href="/team">Our Team</Link>
              <Link href="/awards">Awards</Link>
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

      <section className="svc-hero">
        <div className="svc-hero-content reveal">
          <div className="eyebrow">WHAT WE DO</div>
          <h1>Every space, considered.</h1>
          <p>From concept to completion, we design spaces that balance beauty with the way people live and work.</p>
        </div>
      </section>

      <section className="section">
        <div className="services-grid stagger">
          {SERVICES.map((s) => (
            <div className="service-card reveal" key={s.name}>
              <div className="service-icon">{s.icon}</div>
              <div className="service-name">{s.name}</div>
              <p className="service-desc">{s.desc}</p>
              <Link href="/contact" className="service-link">Learn more →</Link>
            </div>
          ))}
        </div>
      </section>

      <section className="section process-section">
        <div className="reveal">
          <div className="eyebrow">HOW WE WORK</div>
          <h2 className="section-title">Four stages, one team throughout.</h2>
        </div>
        <div className="process-list stagger" style={{ marginTop: 32 }}>
          {PROCESS.map((step) => (
            <div className="process-row reveal" key={step.number}>
              <div className="process-num">{step.number}</div>
              <div>
                <div className="process-name">{step.name}</div>
                <p className="process-desc">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="why-section">
        <div className="why-grid stagger">
          <div className="why-card reveal">
            <div className="why-num">12+</div>
            <div className="why-name">Experience</div>
            <p className="why-desc">Over a decade designing homes, workplaces, and hospitality spaces.</p>
          </div>
          <div className="why-card reveal">
            <div className="why-num">80+</div>
            <div className="why-name">Portfolio</div>
            <p className="why-desc">Projects delivered across residential, commercial, and hospitality work.</p>
          </div>
          <div className="why-card reveal">
            <div className="why-num">1:1</div>
            <div className="why-name">Approach</div>
            <p className="why-desc">Every project is bespoke — no templates, no repeated floor plans.</p>
          </div>
        </div>
      </section>

      <section className="section types-section">
        <div className="reveal">
          <div className="eyebrow">PROJECT TYPES</div>
          <h2 className="section-title">Spaces we design.</h2>
        </div>
        <div className="type-tags" style={{ marginTop: 32 }}>
          {PROJECT_TYPES.map((t) => (
            <span className="type-tag" key={t}>{t}</span>
          ))}
        </div>
      </section>

      <section className="cta-strip">
        <div className="cta-strip-inner reveal">
          <div>
            <h3>Have a vision? Let's build it.</h3>
            <p>Tell us about your project and we'll get back to you within a day.</p>
          </div>
          <div className="cta-buttons">
            <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="btn-outline">WHATSAPP</a>
            <Link href="/contact" className="btn-solid">ENQUIRE</Link>
          </div>
        </div>
      </section>

      <footer style={{ background: '#1E1E1E', color: '#FAFAF8', padding: 'var(--gap-xxl) var(--margin-desktop)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--gap-xxl)', marginBottom: 'var(--gap-xxl)' }}>
          <div>
            <img src="/fquad-logo.png" alt="F.QUAD" style={{height:40,width:'auto',display:'block',filter:'invert(1) brightness(2)',marginBottom:12}} />
            <p style={{ fontSize: 13, color: '#6B6560', marginTop: 'var(--gap-md)' }}>Architecture & Interior Design Studio, Hyderabad</p>
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
              <li><Link href="/awards">Awards & Recognition</Link></li>
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
        <div style={{ borderTop: '0.5px solid #2C2C2C', paddingTop: 'var(--gap-lg)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--gap-lg)', fontSize: 11, color: '#6B6560', letterSpacing: '0.08em' }}>
          <p>© 2026 F.QUAD Studio. All rights reserved.</p>
          <div style={{ display: 'flex', gap: 'var(--gap-xxl)' }}>
            <a href="#">PRIVACY</a>
            <a href="#">SITEMAP</a>
          </div>
        </div>
      </footer>
      </div>

      <script dangerouslySetInnerHTML={{ __html: SERVICES_SCRIPT }} />
    </>
  );
}

const SERVICES_SCRIPT = `
(function() {
  var nav = document.getElementById('site-nav');
  if (nav) {
    window.addEventListener('scroll', function() {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    });
  }
  var hamburger = document.querySelector('[data-toggle-nav]');
  var mobileMenu = document.getElementById('mobile-menu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function() {
      var isOpen = mobileMenu.classList.toggle('open');
      document.body.style.overflow = isOpen ? 'hidden' : '';
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

const SERVICES_STYLES = `
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
  .nav-links { display: flex; gap: var(--gap-xxl); list-style: none; }
  .nav-links a { font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--grey-dark); transition: color 0.25s ease; }
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
  @media (max-width: 768px) {
    .hamburger { display: block; }
    .nav-links { display: none !important; }
    .btn-enquire { display: none; }
  }

  .svc-hero { background: var(--bg-darker); padding: calc(var(--nav-h) + var(--gap-xxl)) var(--margin-desktop) var(--gap-xxl); }
  .svc-hero-content { max-width: 720px; margin: 0 auto; text-align: center; color: var(--white); }
  .svc-hero-content .eyebrow { color: var(--grey-light); justify-content: center; }
  .svc-hero-content h1 { font-family: var(--font-goodtimes); font-size: var(--h1); font-weight: 500; letter-spacing: 0.01em; color: var(--white); margin-bottom: var(--gap-lg); }
  .svc-hero-content p { font-size: var(--body-lg); color: var(--grey-light); line-height: 1.7; }

  .section { padding: var(--gap-xxl) var(--margin-desktop); max-width: 1920px; margin: 0 auto; }
  .section-title { font-family: var(--font-goodtimes); font-size: var(--h2); font-weight: 500; letter-spacing: 0.01em; color: var(--black); margin-top: var(--gap-md); }

  .services-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5px; background: var(--border); border: 0.5px solid var(--border); }
  .service-card { background: var(--white); padding: var(--gap-xl); }
  .service-icon { font-size: 28px; color: var(--black); margin-bottom: var(--gap-lg); }
  .service-name { font-size: var(--h4); font-weight: 500; color: var(--black); margin-bottom: var(--gap-sm); }
  .service-desc { font-size: var(--body); color: var(--grey-dark); line-height: 1.7; margin-bottom: var(--gap-lg); }
  .service-link { font-size: var(--body-sm); font-weight: 600; color: var(--black); border-bottom: 0.5px solid var(--black); padding-bottom: 2px; }

  .process-list { display: flex; flex-direction: column; }
  .process-row { display: grid; grid-template-columns: 80px 1fr; gap: var(--gap-xl); padding: var(--gap-xl) 0; border-top: 0.5px solid var(--border); }
  .process-row:last-child { border-bottom: 0.5px solid var(--border); }
  .process-num { font-size: 44px; font-weight: 500; color: var(--border); }
  .process-name { font-size: var(--h4); font-weight: 500; color: var(--black); margin-bottom: var(--gap-sm); }
  .process-desc { font-size: var(--body); color: var(--grey-dark); line-height: 1.7; max-width: 640px; }

  .why-section { background: var(--bg-darker); padding: var(--gap-xxl) var(--margin-desktop); }
  .why-grid { max-width: 1920px; margin: 0 auto; display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--gap-xxl); }
  .why-num { font-size: var(--h2); font-weight: 500; color: var(--white); margin-bottom: var(--gap-sm); }
  .why-name { font-size: var(--eyebrow); letter-spacing: 0.18em; text-transform: uppercase; color: var(--grey-light); margin-bottom: var(--gap-md); }
  .why-desc { font-size: var(--body); color: var(--grey-light); line-height: 1.7; }

  .type-tags { display: flex; flex-wrap: wrap; gap: var(--gap-md); }
  .type-tag { font-size: var(--body-sm); padding: var(--gap-sm) var(--gap-lg); border: 0.5px solid var(--border); color: var(--grey-dark); border-radius: 999px; }

  .cta-strip { background: var(--bg-darker); color: var(--white); padding: var(--gap-xl) var(--margin-desktop); }
  .cta-strip-inner { max-width: 1920px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: var(--gap-xl); align-items: center; }
  .cta-strip h3 { font-size: var(--h3); font-weight: 500; margin-bottom: var(--gap-md); font-family: var(--font-goodtimes); }
  .cta-strip p { font-size: var(--body); color: var(--grey-light); line-height: 1.7; }
  .cta-buttons { display: flex; gap: var(--gap-lg); justify-content: flex-end; flex-wrap: wrap; }
  .btn-outline { padding: var(--gap-md) var(--gap-lg); border: 0.5px solid var(--white); color: var(--white); font-weight: 600; font-size: var(--body-sm); letter-spacing: 0.12em; transition: all 0.3s ease; white-space: nowrap; }
  .btn-outline:hover { background: var(--white); color: var(--black); }
  .btn-solid { padding: var(--gap-md) var(--gap-lg); background: var(--white); color: var(--black); font-weight: 600; font-size: var(--body-sm); letter-spacing: 0.12em; transition: all 0.3s ease; white-space: nowrap; }
  .btn-solid:hover { background: var(--grey-light); }

  .footer-nav-heading { font-size: 11px; letter-spacing: 0.16em; color: #9C9488; margin-bottom: 20px; font-weight: 400; }
  .footer-nav-links { list-style: none; display: flex; flex-direction: column; gap: 12px; }
  .footer-nav-links a { font-size: 13px; color: #6B6560; text-decoration: none; transition: color 0.25s ease; }
  .footer-nav-links a:hover { color: #FAFAF8; }
  .footer-social { display: flex; gap: 16px; margin-top: 20px; }
  .footer-social a { font-size: 12px; color: #6B6560; letter-spacing: 0.08em; text-decoration: none; transition: color 0.25s ease; }
  .footer-social a:hover { color: #FAFAF8; }

  @media (max-width: 1024px) {
    :root { --margin-desktop: var(--margin-tablet); --h1: 42px; --h2: 32px; }
    .nav-links { gap: var(--gap-lg); }
    .services-grid { grid-template-columns: repeat(2, 1fr); }
    .why-grid { grid-template-columns: 1fr; gap: var(--gap-xl); }
    .cta-strip-inner { grid-template-columns: 1fr; text-align: left; }
    .cta-buttons { justify-content: flex-start; }
  }
  @media (max-width: 720px) {
    :root { --margin-desktop: var(--margin-mobile); --h1: 40px; --h2: 28px; --h4: 20px; --body-lg: 16px; }
    .nav { padding: var(--gap-md) var(--margin-mobile); flex-wrap: wrap; height: auto; }
    .services-grid { grid-template-columns: 1fr; }
    .process-row { grid-template-columns: 1fr; gap: var(--gap-sm); }
  }
`;
