import Link from 'next/link';
import dynamic from 'next/dynamic';
import { getSiteSettings } from '@/lib/public-content';
import CountUp from '../components/CountUp';

// ssr:false is not permitted for next/dynamic inside a Server Component — this page
// does async data-fetching, so it can't be 'use client'. Omitting ssr still code-splits
// the flip-card bundle into its own chunk.
const FourPillars = dynamic(() => import('@/app/components/FourPillars'));
const RevealOnScroll = dynamic(() => import('@/app/components/RevealOnScroll'));

export const revalidate = 60;

const STATS = [
  { number: 20, suffix: '+', label: 'Years of Experience' },
  { number: 500, suffix: '+', label: 'Projects Completed' },
  { number: 22, suffix: '+', label: 'Design Awards' },
];

const AWARDS = ['IIID', 'Hafele Design Awards', 'ELDORK India Architecture Awards', 'Surfaces Reporter', 'Times Design Icons South'];

export default async function AboutPage() {
  const settings = await getSiteSettings();
  const whatsappNumber = settings?.whatsapp?.replace(/[^0-9]/g, '') || '919876543210';
  const instagramUrl = settings?.instagramUrl || '#';
  const email_ = settings?.email || 'admin@fquad.com';

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: ABOUT_STYLES }} />

      <div className="page-fade">
      <nav className="nav nav-solid" id="site-nav">
        <Link href="/" className="nav-logo" style={{display:'flex',alignItems:'center'}}><img src="/assets/images/fquad-white-logo.svg" alt="F.QUAD" className="site-logo" style={{height:48,width:'auto',display:'block'}} /></Link>
        <ul className="nav-links">
          <li><Link href="/">HOME</Link></li>
          <li><Link href="/about" className="active">ABOUT</Link></li>
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

      <section className="about-hero">
        <div className="about-hero-texture" />
        <div className="about-hero-content reveal">
          <div className="about-hero-eyebrow">FOUNDED 2005 · HYDERABAD · AWARD-WINNING STUDIO</div>
          <h1>
            <span style={{ display: 'block', color: '#FAFAF8' }}>Designing Spaces That Work Today</span>
            <span style={{ display: 'block', color: '#9C9488' }}>and Evolve for Tomorrow.</span>
          </h1>
          <p className="about-hero-subtitle">F.Quad Studio is an award-winning architecture and interior design practice built on the principles of Functionality, Futuristic thinking, Friendly collaboration, and Flexibility.</p>
        </div>
      </section>

      <RevealOnScroll delay={0}>
        <section className="about-intro">
          <div className="about-intro-lead reveal">Founded in 2005, F.Quad Studio is an award-winning architecture and interior design practice based in Hyderabad.</div>
          <div className="about-intro-copy reveal">
            <p>Over the past two decades, we have delivered more than 500 residential, commercial, hospitality, retail, and institutional projects, combining thoughtful design with practical solutions and a client-first approach.</p>
            <p>Built on the principles of Functionality, Futuristic thinking, Friendly collaboration, and Flexibility, we create spaces that are purposeful, timeless, and tailored to the people who use them.</p>
          </div>
        </section>
      </RevealOnScroll>

      <RevealOnScroll delay={0.1}>
        <div className="about-stats reveal">
          {STATS.map((s, i) => (
            <div className="about-stat" key={i}>
              <div className="about-stat-num"><CountUp end={s.number} suffix={s.suffix} /></div>
              <div className="about-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </RevealOnScroll>

      <div className="about-services-line">
        Residential&nbsp;&nbsp;•&nbsp;&nbsp;Commercial&nbsp;&nbsp;•&nbsp;&nbsp;Retail&nbsp;&nbsp;•&nbsp;&nbsp;Hospitality&nbsp;&nbsp;•&nbsp;&nbsp;Institutional
      </div>

      <RevealOnScroll delay={0.2}>
        <section className="about-story">
          <div className="about-story-eyebrow reveal">OUR STORY</div>
          <h2 className="about-story-title reveal">F.Quad Studio began with a simple belief—</h2>
          <p className="about-story-p reveal">that great design should be functional, meaningful, and built around people. Founded by Amit Shah and Ashmi Shah in 2005, the practice has grown into one of Hyderabad&apos;s leading architecture and interior design studios.</p>
          <p className="about-story-p reveal">Our work is shaped by curiosity, collaboration, and a willingness to explore diverse design languages while staying true to functionality. Every project is approached with fresh thinking, ensuring each space reflects its purpose, context, and the aspirations of its users.</p>
        </section>
      </RevealOnScroll>

      <section className="about-pillars">
        <div className="about-pillars-eyebrow">WHAT&apos;S BEHIND THE NAME</div>
        <h2 className="about-pillars-title">THE FOUR F&apos;s</h2>
        <FourPillars />
      </section>

      <RevealOnScroll delay={0.3}>
        <section className="about-founders">
          <div className="about-founders-eyebrow reveal">MEET THE FOUNDERS</div>
          <div className="about-founders-grid stagger">
            <div className="about-founder-card reveal">
              <div className="about-founder-photo" />
              <div className="about-founder-name">Amit Shah</div>
              <div className="about-founder-role">Principal Architect</div>
              <div className="about-founder-divider" />
              <p className="about-founder-bio">20+ years of architectural experience with expertise across residential, commercial, and institutional projects. Amit believes in creating spaces that balance innovation with functionality and is a regular speaker at leading architecture and design forums. His passion for design is complemented by his love for art, travel, and adventure.</p>
            </div>
            <div className="about-founder-card reveal">
              <div className="about-founder-photo" />
              <div className="about-founder-name">Ashmi Shah</div>
              <div className="about-founder-role">Principal Interior Designer</div>
              <div className="about-founder-divider" />
              <p className="about-founder-bio">An accomplished interior designer with over two decades of experience, Ashmi focuses on creating client-centric interiors that seamlessly blend aesthetics with functionality. Beyond design, she actively champions accessibility, sustainability, and climate-conscious practices through her leadership initiatives.</p>
            </div>
          </div>
        </section>
      </RevealOnScroll>

      <RevealOnScroll delay={0.4}>
        <section className="about-recognition">
          <div className="about-recognition-eyebrow reveal">RECOGNITION</div>
          <h2 className="about-recognition-title reveal">
            <span style={{ display: 'block' }}>Work That Speaks</span>
            <span style={{ display: 'block' }}>For Itself.</span>
          </h2>
          <p className="about-recognition-intro reveal">Over the years, our work has been recognised by some of the industry&apos;s most respected institutions.</p>
          <div className="about-awards-list stagger">
            {AWARDS.map((a, i) => (
              <div className="about-award-row reveal" key={i}>
                <span className="about-award-dash">—</span>
                <span className="about-award-name">{a}</span>
              </div>
            ))}
          </div>
        </section>
      </RevealOnScroll>

      <RevealOnScroll delay={0.5}>
        <section className="about-closing">
          <p className="about-closing-main reveal">At F.Quad Studio, every project is an opportunity to create spaces that inspire, perform, and endure.</p>
          <p className="about-closing-sub reveal">Whether designing a home, workplace, retail environment, or public space, our focus remains the same—to deliver thoughtful design that reflects our clients&apos; vision and stands the test of time.</p>
          <div className="about-closing-buttons reveal">
            <Link href="/projects" className="about-btn-outline">VIEW OUR WORK</Link>
            <Link href="#start-project" data-start-project="true" className="about-btn-solid">START A PROJECT</Link>
          </div>
        </section>
      </RevealOnScroll>

      <footer style={{ background: '#1E1E1E', color: '#FAFAF8', padding: 'var(--gap-xxl) var(--margin-desktop)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--gap-xxl)', marginBottom: 'var(--gap-xxl)' }}>
          <div>
            <img src="/assets/images/fquad-white-logo.svg" alt="F.QUAD" style={{height:40,width:'auto',display:'block',filter:'invert(1) brightness(2)',marginBottom:12}} />
            <p style={{ fontSize: 13, color: '#6B6560', marginTop: 'var(--gap-md)' }}>Architecture &amp; Interior Design Studio, Hyderabad</p>
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
        <div style={{ borderTop: '0.5px solid #2C2C2C', paddingTop: 'var(--gap-lg)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--gap-lg)', fontSize: 11, color: '#6B6560', letterSpacing: '0.08em' }}>
          <p>&copy; 2026 F.QUAD Studio. All rights reserved.</p>
          <div style={{ display: 'flex', gap: 'var(--gap-xxl)' }}>
            <a href="#">PRIVACY</a>
            <a href="#">SITEMAP</a>
          </div>
        </div>
      </footer>
      </div>

      <script dangerouslySetInnerHTML={{ __html: ABOUT_SCRIPT }} />
    </>
  );
}

const ABOUT_SCRIPT = `
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

const ABOUT_STYLES = `
  :root {
    --black: #2C2C2C; --white: #FAFAF8; --grey-dark: #6B6560; --grey-light: #9C9488;
    --grey-bg: #F5F0EA; --border: #E2DDD8; --bg-dark: #1E1E1E; --bg-darker: #1E1E1E;
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

  .nav { position: fixed; top: 0; left: 0; right: 0; display: flex; align-items: center; justify-content: space-between; padding: var(--gap-lg) var(--margin-desktop); height: var(--nav-h); background: rgba(248, 248, 246, 0.92); backdrop-filter: blur(8px); border-bottom: 0.5px solid var(--border); z-index: 100; }
  .nav-logo { font-size: var(--h4); font-weight: 700; letter-spacing: 0.14em; color: var(--black); }
  .nav-links { display: flex; gap: var(--gap-xxl); list-style: none; }
  .nav-links a { font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--grey-dark); transition: color 0.25s ease; }
  .nav-links a:hover, .nav-links a.active { color: var(--black); font-weight: 600; }
  .btn-enquire { padding: var(--gap-sm) var(--gap-lg); background: var(--black); color: var(--white); border: 0.5px solid var(--black); font-size: var(--eyebrow); letter-spacing: 0.12em; font-weight: 600; cursor: pointer; }
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

  .about-hero { position: relative; min-height: 90vh; background: #0F0F0F; display: flex; align-items: flex-end; overflow: hidden; }
  .about-hero-texture { position: absolute; inset: 0; background: repeating-linear-gradient(135deg, rgba(255,255,255,0.015) 0, rgba(255,255,255,0.015) 1px, transparent 1px, transparent 60px); }
  .about-hero-content { position: relative; padding: clamp(40px,6vw,80px) var(--margin-desktop); }
  .about-hero-eyebrow { font-size: 11px; color: #6B6560; letter-spacing: 0.24em; margin-bottom: 24px; }
  .about-hero-content h1 { font-size: clamp(28px,5vw,52px); font-weight: 400; line-height: 1.1; }
  .about-hero-subtitle { font-size: 16px; color: #6B6560; max-width: 600px; line-height: 1.85; margin-top: 24px; }

  .about-intro { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(40px,6vw,80px); padding: 80px var(--margin-desktop); background: #FAFAF8; border-bottom: 0.5px solid #E2DDD8; }
  .about-intro-lead { font-size: 22px; color: #2C2C2C; line-height: 1.65; font-weight: 400; }
  .about-intro-copy p { font-size: 16px; color: #6B6560; line-height: 1.9; margin-bottom: 20px; }
  .about-intro-copy p:last-child { margin-bottom: 0; }

  .about-stats { display: grid; grid-template-columns: repeat(3, 1fr); padding: 48px var(--margin-desktop); background: #F5F0EA; border-top: 0.5px solid #E2DDD8; border-bottom: 0.5px solid #E2DDD8; }
  .about-stat { text-align: center; }
  .about-stat-num { font-size: 52px; color: #2C2C2C; }
  .about-stat-label { font-size: 12px; color: #9C9488; letter-spacing: 0.18em; margin-top: 8px; text-transform: uppercase; }

  .about-services-line { padding: 28px var(--margin-desktop); text-align: center; border-bottom: 0.5px solid #E2DDD8; font-size: 12px; color: #9C9488; letter-spacing: 0.18em; }

  .about-story { padding: 100px var(--margin-desktop); background: #FAFAF8; max-width: 900px; margin: 0 auto; }
  .about-story-eyebrow { font-size: 11px; color: #9C9488; letter-spacing: 0.22em; margin-bottom: 24px; }
  .about-story-title { font-size: clamp(24px,4vw,36px); color: #2C2C2C; margin-bottom: 32px; line-height: 1.3; max-width: 700px; }
  .about-story-p { font-size: 16px; color: #6B6560; line-height: 1.9; max-width: 680px; margin-bottom: 24px; }
  .about-story-p:last-child { margin-bottom: 0; }

  .about-pillars { background: #0F0F0F; padding: 100px var(--margin-desktop); text-align: center; }
  .about-pillars-eyebrow { font-size: 11px; color: #6B6560; letter-spacing: 0.24em; margin-bottom: 12px; }
  .about-pillars-title { font-size: 13px; color: #FAFAF8; letter-spacing: 0.5em; margin-bottom: 64px; }

  .about-founders { padding: 100px var(--margin-desktop); background: #FAFAF8; }
  .about-founders-eyebrow { font-size: 11px; color: #9C9488; letter-spacing: 0.22em; margin-bottom: 48px; }
  .about-founders-grid { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(40px,6vw,64px); }
  .about-founder-photo { aspect-ratio: 3/4; max-width: 300px; background: #1E1E1E; border-radius: 2px; }
  .about-founder-name { font-size: clamp(18px,2.5vw,24px); color: #2C2C2C; margin-top: 24px; }
  .about-founder-role { font-size: 12px; color: #9C9488; letter-spacing: 0.14em; margin-top: 6px; text-transform: uppercase; }
  .about-founder-divider { border-top: 0.5px solid #E2DDD8; margin: 18px 0; }
  .about-founder-bio { font-size: 15px; color: #6B6560; line-height: 1.85; }

  .about-recognition { padding: 80px var(--margin-desktop); background: #F5F0EA; }
  .about-recognition-eyebrow { font-size: 11px; color: #9C9488; letter-spacing: 0.22em; margin-bottom: 16px; }
  .about-recognition-title { font-size: clamp(24px,4vw,36px); color: #2C2C2C; margin-bottom: 32px; line-height: 1.2; }
  .about-recognition-intro { font-size: 16px; color: #6B6560; line-height: 1.85; max-width: 640px; margin-bottom: 40px; }
  .about-award-row { display: flex; justify-content: space-between; align-items: center; border-bottom: 0.5px solid #E2DDD8; padding: 18px 0; }
  .about-award-dash { font-size: 14px; color: #E2DDD8; }
  .about-award-name { font-size: 16px; color: #2C2C2C; transition: color 0.2s ease; }
  .about-award-row:hover .about-award-name { color: #1E1E1E; }

  .about-closing { padding: 100px var(--margin-desktop); background: #0F0F0F; text-align: center; }
  .about-closing-main { font-size: clamp(18px,3vw,28px); color: #FAFAF8; max-width: 760px; margin: 0 auto; line-height: 1.6; }
  .about-closing-sub { font-size: 15px; color: #9C9488; max-width: 560px; margin: 24px auto 0; line-height: 1.85; }
  .about-closing-buttons { display: flex; gap: 16px; justify-content: center; margin-top: 40px; flex-wrap: wrap; }
  .about-btn-outline { padding: 12px 28px; border: 0.5px solid #E2DDD8; color: #FAFAF8; font-size: 11px; letter-spacing: 0.14em; transition: all 0.3s ease; }
  .about-btn-outline:hover { background: #FAFAF8; color: #1E1E1E; }
  .about-btn-solid { padding: 12px 28px; background: #FAFAF8; color: #1E1E1E; font-size: 11px; letter-spacing: 0.14em; transition: all 0.3s ease; }
  .about-btn-solid:hover { background: #E2DDD8; }

  .footer-nav-heading { font-size: 11px; letter-spacing: 0.16em; color: #9C9488; margin-bottom: 20px; font-weight: 400; }
  .footer-nav-links { list-style: none; display: flex; flex-direction: column; gap: 12px; }
  .footer-nav-links a { font-size: 13px; color: #6B6560; text-decoration: none; transition: color 0.25s ease; }
  .footer-nav-links a:hover { color: #FAFAF8; }
  .footer-social { display: flex; gap: 16px; margin-top: 20px; }
  .footer-social a { font-size: 12px; color: #6B6560; letter-spacing: 0.08em; text-decoration: none; transition: color 0.25s ease; }
  .footer-social a:hover { color: #FAFAF8; }

  @media (max-width: 1024px) {
    :root { --margin-desktop: var(--margin-tablet); }
    .nav-links { gap: var(--gap-lg); }
    .about-intro { grid-template-columns: 1fr; }
    .about-founders-grid { grid-template-columns: 1fr; }
    .about-stats { grid-template-columns: 1fr; gap: 32px; }
  }
  @media (max-width: 720px) {
    :root { --margin-desktop: var(--margin-mobile); }
    .nav { padding: var(--gap-md) var(--margin-mobile); flex-wrap: wrap; height: auto; }
  }
`;
