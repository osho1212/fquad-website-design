import Link from 'next/link';
import dynamic from 'next/dynamic';
import { getPageContent, getArchProjects, getIntProjects, getSiteSettings } from '@/lib/public-content';

// ssr:false is not permitted for next/dynamic inside a Server Component — this page
// does async data-fetching, so it can't be 'use client'. Omitting ssr still code-splits
// these bundles into their own chunks.
const ProjectSection = dynamic(() => import('@/app/components/ProjectSection'));
const RevealOnScroll = dynamic(() => import('@/app/components/RevealOnScroll'));

export const revalidate = 60;

export default async function ProjectsPage() {
  const content = await getPageContent('projects');
  const [archRes, archCom, intRes, intCom] = await Promise.all([
    getArchProjects('residential'),
    getArchProjects('commercial'),
    getIntProjects('residential'),
    getIntProjects('commercial'),
  ]);
  const settings = await getSiteSettings();

  const archProjects = [...archRes, ...archCom];
  const intProjects = [...intRes, ...intCom];
  const idToSlug: Record<string, string> = Object.fromEntries(
    [...archProjects, ...intProjects].map((p: any) => [p.id, p.slug])
  );

  const banner = content.banner || {};
  const cta = content.cta || {};

  const whatsappNumber = settings?.whatsapp?.replace(/[^0-9]/g, '') || '919876543210';
  const instagramUrl = settings?.instagramUrl || '#';
  const email_ = settings?.email || 'admin@fquad.com';

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PROJECTS_STYLES }} />

      <div className="page-fade">
      <nav className="nav" id="site-nav">
        <Link href="/" className="nav-logo" style={{display:'flex',alignItems:'center'}}><img src="/fquad-logo.png" alt="F.QUAD" className="site-logo" style={{height:48,width:'auto',display:'block'}} /></Link>
        <ul className="nav-links">
          <li><Link href="/">HOME</Link></li>
          <li><Link href="/about">ABOUT</Link></li>
          <li className="nav-item">
            <Link href="/projects" className="active">PROJECTS</Link>
            <div className="nav-dropdown">
              <Link href="/projects" className="active">All Projects</Link>
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

      <section className="banner">
        <div className="banner-media">
          {banner.mediaUrl ? (
            banner.mediaType === 'video' ? (
              <video autoPlay muted loop playsInline poster={banner.posterUrl || undefined}>
                <source src={banner.mediaUrl} type="video/mp4" />
              </video>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={banner.mediaUrl} alt="" />
            )
          ) : (
            <div className="placeholder-texture" />
          )}
        </div>
        <div className="banner-overlay" />
        <div className="banner-content">
          <div className="banner-eyebrow">OUR WORK</div>
          <h1>Projects</h1>
        </div>
      </section>

      <div className="sticky-tabs">
        <a href="#architecture" className="active">ARCHITECTURE</a>
        <a href="#interiors">INTERIORS</a>
      </div>

      <section className="work-section" id="architecture">
        <div className="work-section-watermark">01</div>
        <RevealOnScroll className="work-section-header">
          <div className="work-section-eyebrow">ARCHITECTURE</div>
          <h2 className="work-section-title">Built to Last</h2>
        </RevealOnScroll>
        <RevealOnScroll delay={0.1}>
          <ProjectSection projects={archProjects} idToSlug={idToSlug} sectionType="architecture" />
        </RevealOnScroll>
      </section>

      <div className="section-divider" />

      <section className="work-section" id="interiors">
        <div className="work-section-watermark">02</div>
        <RevealOnScroll className="work-section-header">
          <div className="work-section-eyebrow">INTERIORS</div>
          <h2 className="work-section-title">Spaces That Feel Right</h2>
        </RevealOnScroll>
        <RevealOnScroll delay={0.1}>
          <ProjectSection projects={intProjects} idToSlug={idToSlug} sectionType="interiors" />
        </RevealOnScroll>
      </section>

      <section className="cta-strip">
        <div className="cta-strip-inner reveal">
          <div>
            <h3>{cta.heading}</h3>
            <p>{cta.text}</p>
          </div>
          <div className="cta-buttons">
            <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="btn-outline">WHATSAPP</a>
            <Link href="/contact" className="btn-gold">ENQUIRE</Link>
          </div>
        </div>
      </section>

      <footer style={{ background: '#1E1E1E', color: '#FAFAF8', padding: 'var(--gap-xxl) var(--margin-desktop)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--gap-xxl)', marginBottom: 'var(--gap-xxl)' }}>
          <div>
            <img src="/fquad-logo.png" alt="F.QUAD" style={{height:40,width:'auto',display:'block',filter:'invert(1) brightness(2)',marginBottom:12}} />
            <p style={{ fontSize: 13, color: '#6B6560', marginTop: 16 }}>Architecture &amp; Interior Design Studio, Hyderabad</p>
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
              <li><Link href="/projects#architecture">Architecture</Link></li>
              <li><Link href="/projects#interiors">Interiors</Link></li>
            </ul>
          </div>
          <div>
            <div className="footer-nav-heading">CONTACT</div>
            <p style={{ fontSize: 13, color: '#6B6560' }}>{email_}</p>
            <p style={{ fontSize: 13, color: '#6B6560' }}>{settings?.phone || ''}</p>
            <p style={{ fontSize: 13, color: '#6B6560' }}>{settings?.address || 'Hyderabad, Telangana, India'}</p>
          </div>
        </div>
        <div style={{ borderTop: '0.5px solid #2C2C2C', paddingTop: 'var(--gap-lg)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, fontSize: 11, color: '#6B6560', letterSpacing: '0.08em' }}>
          <p>&copy; 2026 F.QUAD Studio. All rights reserved.</p>
          <div style={{ display: 'flex', gap: 32 }}>
            <a href="#">PRIVACY</a>
            <a href="#">SITEMAP</a>
          </div>
        </div>
      </footer>
      </div>

      <script dangerouslySetInnerHTML={{ __html: PROJECTS_SCRIPT }} />
    </>
  );
}

const PROJECTS_SCRIPT = `
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

  var tabs = document.querySelectorAll('.sticky-tabs a');
  var sections = ['architecture', 'interiors'].map(function(id) { return document.getElementById(id); }).filter(Boolean);
  var tabObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        tabs.forEach(function(t) { t.classList.toggle('active', t.getAttribute('href') === '#' + entry.target.id); });
      }
    });
  }, { rootMargin: '-84px 0px -70% 0px', threshold: 0 });
  sections.forEach(function(s) { tabObserver.observe(s); });
})();
`;

const PROJECTS_STYLES = `
  :root {
    --black: #2C2C2C; --white: #FAFAF8; --gold: #6B6560; --gold-dark: #9C9488;
    --grey-dark: #6B6560; --grey-light: #9C9488; --grey-bg: #F5F0EA; --border: #E2DDD8;
    --bg-dark: #1E1E1E; --bg-darker: #1E1E1E;
    --font-goodtimes: 'Good Times', sans-serif;
    --h1: 64px; --h2: 40px; --h3: 28px; --h4: 24px;
    --body-lg: 18px; --body: 16px; --body-sm: 15px; --eyebrow: 11px;
    --margin-desktop: 48px; --margin-tablet: 32px; --margin-mobile: 20px;
    --gap-xxl: 48px; --gap-xl: 32px; --gap-lg: 24px; --gap-md: 16px; --gap-sm: 12px; --gap-xs: 8px;
    --nav-h: 84px;
  }
  html { scroll-behavior: smooth; }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  .page-fade { animation: fadeIn 0.4s ease; }
  body { background: var(--white); color: var(--black); line-height: 1.5; -webkit-font-smoothing: antialiased; }
  a { color: inherit; text-decoration: none; }
  img, video { display: block; max-width: 100%; }

  .nav { position: fixed; top: 0; left: 0; right: 0; display: flex; align-items: center; justify-content: space-between; padding: var(--gap-lg) var(--margin-desktop); height: var(--nav-h); background: transparent; border-bottom: 0.5px solid transparent; z-index: 100; transition: background 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease; }
  .nav.scrolled { background: rgba(250, 250, 248, 0.92); backdrop-filter: blur(8px); border-bottom: 0.5px solid var(--border); box-shadow: 0 1px 0 rgba(0,0,0,0.02); }
  .nav-logo { font-family: var(--font-goodtimes); font-size: var(--h4); font-weight: 700; letter-spacing: 0.14em; color: var(--white); transition: color 0.4s ease; }
  .nav.scrolled .nav-logo { color: var(--black); }
  .nav-links { display: flex; gap: var(--gap-xxl); list-style: none; }
  .nav-links a { font-size: 12px; letter-spacing: 0.12em; color: rgba(250, 250, 248, 0.8); transition: color 0.25s ease; }
  .nav.scrolled .nav-links a { color: var(--grey-dark); }
  .nav-links a:hover, .nav-links a.active { color: var(--white); }
  .nav.scrolled .nav-links a:hover, .nav.scrolled .nav-links a.active { color: var(--black); }
  .nav-links a.active { font-weight: 600; }
  .btn-enquire { padding: var(--gap-sm) var(--gap-lg); background: transparent; color: var(--white); border: 0.5px solid rgba(250,250,248,0.5); font-size: var(--eyebrow); letter-spacing: 0.12em; font-weight: 600; cursor: pointer; transition: all 0.3s ease; font-family: inherit; }
  .nav.scrolled .btn-enquire { background: var(--black); color: var(--white); border-color: var(--black); }
  .btn-enquire:hover { background: var(--white); color: var(--black); border-color: var(--white); }
  .nav.scrolled .btn-enquire:hover { background: transparent; color: var(--black); border-color: var(--black); }
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

  .banner { position: relative; height: 55vh; min-height: 380px; overflow: hidden; display: flex; align-items: center; justify-content: center; text-align: center; }
  .banner-media { position: absolute; inset: 0; width: 100%; height: 100%; overflow: hidden; }
  .banner-media .placeholder-texture { position: absolute; inset: -10%; background: repeating-linear-gradient(125deg, #1C1C1C 0px, #1C1C1C 1px, transparent 1px, transparent 18px), var(--bg-dark); }
  .banner-media video, .banner-media img { width: 100%; height: 100%; object-fit: cover; }
  .banner-overlay { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(13,13,13,0.4) 0%, rgba(13,13,13,0.25) 50%, rgba(13,13,13,0.55) 100%); }
  .banner-content { position: relative; z-index: 1; padding: 0 var(--margin-desktop); }
  .banner-eyebrow { font-size: var(--eyebrow); letter-spacing: 0.24em; color: var(--gold); margin-bottom: var(--gap-lg); text-shadow: 0 1px 6px rgba(0,0,0,0.5); }
  .banner h1 { font-family: var(--font-goodtimes); font-size: var(--h1); font-weight: 500; color: var(--white); letter-spacing: 0.01em; text-shadow: 0 1px 0 rgba(255,255,255,0.18), 0 2px 6px rgba(0,0,0,0.55), 0 12px 32px rgba(0,0,0,0.4); }

  .sticky-tabs { position: sticky; top: var(--nav-h); background: rgba(250,250,248,0.95); backdrop-filter: blur(8px); border-bottom: 0.5px solid var(--border); z-index: 50; display: flex; justify-content: center; }
  .sticky-tabs a { display: inline-block; padding: 20px 32px; font-size: 13px; letter-spacing: 0.12em; text-decoration: none; color: var(--grey-light); border-bottom: 2px solid transparent; transition: color 0.2s ease, border-color 0.2s ease; }
  .sticky-tabs a:hover { color: var(--black); }
  .sticky-tabs a.active { color: var(--black); border-bottom-color: var(--black); }

  .work-section { position: relative; padding-top: 80px; overflow: hidden; }
  .work-section-watermark { position: absolute; top: -10px; left: var(--margin-desktop); font-family: var(--font-goodtimes); font-size: 96px; color: #F0EBE3; z-index: 0; line-height: 1; }
  .work-section-header { position: relative; z-index: 1; padding: 0 var(--margin-desktop) 40px; }
  .work-section-eyebrow { font-size: 13px; letter-spacing: 0.22em; color: var(--grey-light); margin-top: 8px; }
  .work-section-title { font-family: var(--font-goodtimes); font-size: clamp(36px, 5vw, 56px); font-weight: 700; color: var(--black); margin-top: 12px; margin-bottom: 32px; }

  .section-divider { width: 100%; height: 0.5px; background: var(--border); margin: 80px 0; }

  .carousel-card { position: relative; overflow: hidden; border-radius: 2px; cursor: pointer; }
  .carousel-card-image { aspect-ratio: 4 / 3; overflow: hidden; position: relative; background: var(--bg-dark); }
  .carousel-card-placeholder { width: 100%; height: 100%; background: repeating-linear-gradient(125deg, #262626 0px, #262626 1px, transparent 1px, transparent 16px); }
  .carousel-card-content { padding: 20px 0; }
  .carousel-card-badge { font-size: 10px; color: var(--grey-light); letter-spacing: 0.18em; margin-bottom: 10px; }
  .carousel-card-name { font-family: var(--font-goodtimes); font-size: clamp(16px, 2vw, 22px); color: var(--black); line-height: 1.2; margin-bottom: 6px; }
  .carousel-card-meta { font-size: 12px; color: var(--grey-light); margin-bottom: 10px; }
  .carousel-card-desc { font-size: 13px; color: var(--grey-dark); line-height: 1.7; max-width: 360px; margin-bottom: 16px; }
  .carousel-card-explore { display: inline-block; border: 0.5px solid var(--black); color: var(--black); padding: 9px 18px; font-size: 11px; letter-spacing: 0.12em; transition: all 0.3s ease; }
  .carousel-card-explore:hover { background: var(--black); color: var(--white); }
  .carousel-card-companion { display: block; margin-top: 10px; font-size: 11px; color: var(--gold); letter-spacing: 0.1em; transition: color 0.2s ease; width: fit-content; }
  .carousel-card-companion:hover { color: var(--black); }

  .carousel-arrow { position: absolute; top: 35%; transform: translateY(-50%); width: 44px; height: 44px; border-radius: 50%; border: 0.5px solid var(--border); background: rgba(250,250,248,0.95); backdrop-filter: blur(4px); font-size: 20px; color: var(--black); cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; z-index: 2; }
  .carousel-arrow:hover { background: var(--black); color: var(--white); }
  .carousel-arrow-left { left: -20px; }
  .carousel-arrow-right { right: -20px; }

  .reveal { opacity: 0; transform: translateY(28px); transition: opacity 0.8s cubic-bezier(0.25, 0.1, 0.25, 1), transform 0.8s cubic-bezier(0.25, 0.1, 0.25, 1); }
  .reveal.visible { opacity: 1; transform: translateY(0); }

  .cta-strip { background: var(--bg-darker); color: var(--white); padding: var(--gap-xl) var(--margin-desktop); }
  .cta-strip-inner { max-width: 1920px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: var(--gap-xl); align-items: center; }
  .cta-strip h3 { font-size: var(--h3); font-weight: 500; margin-bottom: var(--gap-md); font-family: var(--font-goodtimes); }
  .cta-strip p { font-size: var(--body); color: var(--grey-light); line-height: 1.7; }
  .cta-buttons { display: flex; gap: var(--gap-lg); justify-content: flex-end; flex-wrap: wrap; }
  .btn-outline { padding: var(--gap-md) var(--gap-lg); border: 0.5px solid var(--white); color: var(--white); font-weight: 600; font-size: var(--body-sm); letter-spacing: 0.12em; transition: all 0.3s ease; white-space: nowrap; }
  .btn-outline:hover { background: var(--white); color: var(--black); }
  .btn-gold { padding: var(--gap-md) var(--gap-lg); background: var(--gold); color: var(--black); font-weight: 600; font-size: var(--body-sm); letter-spacing: 0.12em; transition: all 0.3s ease; white-space: nowrap; }
  .btn-gold:hover { background: var(--gold-dark); color: var(--white); }

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
    .cta-strip-inner { grid-template-columns: 1fr; text-align: left; }
    .cta-buttons { justify-content: flex-start; }
  }
  @media (max-width: 720px) {
    :root { --margin-desktop: var(--margin-mobile); --h1: 40px; --h2: 28px; --h4: 20px; --body-lg: 16px; }
    .banner { height: 46vh; min-height: 320px; }
    .nav { padding: var(--gap-md) var(--margin-mobile); flex-wrap: wrap; height: auto; }
    .sticky-tabs a { padding: 16px 20px; font-size: 12px; }
    .work-section-watermark { font-size: 64px; }
  }
`;
