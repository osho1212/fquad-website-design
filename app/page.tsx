import { getPageContent, getFeaturedProjects, getSiteSettings, getHeroSlides, getUpcomingProjects } from '@/lib/public-content';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Reveal } from './components/motion/Reveal';
import { RevealStagger, RevealStaggerItem } from './components/motion/RevealStagger';
import { MotionAnchor } from './components/motion/MotionAnchor';
import { MotionLinkWrap } from './components/motion/MotionLinkWrap';
import { MotionButton } from './components/motion/MotionButton';
import CountUp from './components/CountUp';

// ssr:false is not permitted for next/dynamic inside a Server Component (this page
// does async data-fetching, so it can't be 'use client') — omitting ssr here still
// code-splits these bundles into their own chunks behind their loading fallbacks.
const HeroSlideshow = dynamic(() => import('@/app/components/HeroSlideshow'));
const ProjectCarousel = dynamic(() => import('@/app/components/ProjectCarousel'));
const FourPillarsHome = dynamic(() => import('@/app/components/FourPillars'));

export const revalidate = 60; // always fresh — admin edits show immediately

export default async function HomePage() {
  const content = await getPageContent('home');
  const featuredProjects = await getFeaturedProjects();
  const heroSlides = await getHeroSlides();
  const upcomingProjects = await getUpcomingProjects();
  const settings = await getSiteSettings();
  const whatsappNumber = settings?.whatsapp?.replace(/[^0-9]/g, '') || '919876543210';
  const instagramUrl = settings?.instagramUrl || '#';
  const email_ = settings?.email || 'admin@fquad.com';

  const hero = content.hero || {};
  const stats = content.stats?.items || [];
  const portfolioIntro = content.portfolio_intro || {};
  const services = content.services || {};
  const process = content.process || {};
  const testimonial = content.testimonial || {};
  const cta = content.cta || {};

  const heroMediaUrl = hero.mediaId ? null : null; // resolved below if present
  const heroMedia = hero._media || null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: HOME_STYLES }} />

      <div className="page-fade">
      <nav className="nav" id="site-nav">
        <Link href="/" className="nav-logo" style={{display:'flex',alignItems:'center'}}><img src="/fquad-logo.png" alt="F.QUAD" className="site-logo" style={{height:48,width:'auto',display:'block'}} /></Link>
        <ul className="nav-links">
          <li><Link href="/" className="active">HOME</Link></li>
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
        <MotionButton className="btn-enquire">ENQUIRE</MotionButton>
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

      <HeroSlideshow
        slides={heroSlides}
        eyebrow={hero.eyebrow || 'ARCHITECTURE · INTERIORS · HYDERABAD'}
        title={hero.title || 'Space is our medium.'}
        subtitle={hero.subtitle || 'Considered design for homes, workplaces, and hospitality.'}
      />

      <Reveal className="stats">
        {stats.map((stat: any, i: number) => {
          const match = String(stat.number ?? '').match(/^(\d+)(.*)$/);
          const statValue = match ? parseInt(match[1], 10) : 0;
          const statSuffix = match ? match[2] : String(stat.number ?? '');
          return (
            <div className="stat" key={i}>
              <div className="stat-num"><CountUp end={statValue} suffix={statSuffix} /></div>
              <div className="stat-label">{stat.label}</div>
            </div>
          );
        })}
      </Reveal>

      {/* Four Pillars Section */}
      <section className="philosophy-section" style={{ background: '#111111', padding: '80px var(--margin-desktop)' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.22em', color: '#F5F2EE', marginBottom: 12 }}>
            THE PHILOSOPHY
          </div>
          <h2 style={{ fontSize: 'clamp(24px,4vw,40px)', fontWeight: 400, lineHeight: 1.2 }}>
            What&apos;s Behind the Name
          </h2>
          <p style={{ fontSize: 15, marginTop: 12, maxWidth: 480, margin: '12px auto 0' }}>
            Four principles that define every space we design.
          </p>
        </div>
        <FourPillarsHome />
      </section>

      <section className="section">
        <Reveal>
          <div className="section-eyebrow">RECENT WORKS</div>
          <h2 className="section-title">{portfolioIntro.title}</h2>
          <p className="section-lead">{portfolioIntro.lead}</p>
        </Reveal>
        <ProjectCarousel projects={featuredProjects} />
      </section>

      {upcomingProjects?.length > 0 && (
        <section style={{ padding: '64px 0', borderTop: '0.5px solid #E2DDD8' }}>
          <div style={{ padding: '0 var(--margin-desktop)', marginBottom: 32 }}>
            <div style={{ fontSize: 11, letterSpacing: '0.22em', color: '#9C9488', marginBottom: 8 }}>COMING SOON</div>
            <h3 style={{ fontSize: 'clamp(22px,3vw,32px)', color: '#2C2C2C', fontWeight: 400 }}>Upcoming Projects</h3>
          </div>
          <ProjectCarousel projects={upcomingProjects} showBadge={true} badgeText="UPCOMING" />
        </section>
      )}

      <section className="services-section">
        <div className="section" style={{ paddingTop: 48, paddingBottom: 48 }}>
          <div className="svc-grid">
            <Reveal>
              <div className="section-eyebrow">{services.eyebrow}</div>
              <h2 className="section-title">{services.title}</h2>
              <p className="section-lead" style={{ marginBottom: 32 }}>{services.lead}</p>
              <MotionLinkWrap href="/services" className="btn-outline" style={{ borderColor: '#E2DDD8', color: '#2C2C2C' }}>ALL SERVICES</MotionLinkWrap>
            </Reveal>
            <RevealStagger className="svc-cards">
              {(services.items || []).map((item: any, i: number) => (
                <RevealStaggerItem className="svc-card" key={i}>
                  <div className="svc-icon">{item.icon}</div>
                  <div className="svc-name">{item.name}</div>
                  <div className="svc-desc">{item.description}</div>
                </RevealStaggerItem>
              ))}
            </RevealStagger>
          </div>
        </div>
      </section>

      <section className="section">
        <Reveal>
          <div className="section-eyebrow">{process.eyebrow}</div>
          <h2 className="section-title">{process.title}</h2>
        </Reveal>
        <RevealStagger className="process-grid" style={{ marginTop: 32, position: 'relative' }}>
          <div className="process-line" />
          {(process.steps || []).map((step: any, i: number) => (
            <RevealStaggerItem className="step" key={i}>
              <div className="step-num">{step.number}</div>
              <div className="step-name">{step.name}</div>
              <div className="step-desc">{step.description}</div>
            </RevealStaggerItem>
          ))}
        </RevealStagger>
      </section>

      <Reveal className="testimonial">
        <div>
          <div className="quote-line" />
          <div className="quote">{testimonial.quote}</div>
          <div className="quote-attr">{testimonial.attribution}</div>
        </div>
        <div className="testimonial-img">
          {testimonial.mediaUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={testimonial.mediaUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div className="testimonial-texture" />
          )}
        </div>
      </Reveal>

      <section className="cta-strip">
        <Reveal className="cta-strip-inner">
          <div>
            <h3>{cta.heading}</h3>
            <p>{cta.text}</p>
          </div>
          <div className="cta-buttons">
          <MotionAnchor href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="btn-outline">WHATSAPP</MotionAnchor>
            <MotionLinkWrap href="/contact" className="btn-gold">ENQUIRE</MotionLinkWrap>
          </div>
        </Reveal>
      </section>

      <footer style={{ background: '#1E1E1E', color: '#FAFAF8', padding: 'var(--gap-xxl) var(--margin-desktop)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--gap-xxl)', marginBottom: 'var(--gap-xxl)' }}>
          <div>
            <img src="/fquad-logo.png" alt="F.QUAD" style={{height:40,width:'auto',display:'block',filter:'invert(1) brightness(2)',marginBottom:12}} />
            <p style={{ fontSize: 13, color: '#6B6560', marginTop: 16 }}>Architecture & Interior Design Studio, Hyderabad</p>
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
        <div style={{ borderTop: '0.5px solid #2C2C2C', paddingTop: 'var(--gap-lg)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, fontSize: 11, color: '#6B6560', letterSpacing: '0.08em' }}>
          <p>&copy; 2026 F.QUAD Studio. All rights reserved.</p>
          <div style={{ display: 'flex', gap: 24 }}>
            <a href="#">PRIVACY</a>
            <a href="#">SITEMAP</a>
          </div>
        </div>
      </footer>
      </div>

      <script dangerouslySetInnerHTML={{ __html: HOME_SCRIPT }} />
    </>
  );
}

const HOME_SCRIPT = `
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

  // Curtain reveals
  var curtains = document.querySelectorAll('.curtain-wrap');
  var curtainObs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) { e.target.classList.add('revealed'); curtainObs.unobserve(e.target); }
    });
  }, { threshold: 0.2 });
  curtains.forEach(function(el) { curtainObs.observe(el); });

  // Process line
  var processLine = document.querySelector('.process-line');
  if (processLine) {
    var lineObs = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) { e.target.style.transform = 'scaleX(1)'; lineObs.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    lineObs.observe(processLine);
  }
})();
`;

const HOME_STYLES = `
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
  .nav.scrolled { background: rgba(248, 248, 246, 0.92); backdrop-filter: blur(8px); border-bottom: 0.5px solid var(--border); box-shadow: 0 1px 0 rgba(0,0,0,0.02); }
  .nav-logo { font-family: var(--font-goodtimes); font-size: var(--h4); font-weight: 700; letter-spacing: 0.14em; color: var(--white); transition: color 0.4s ease; text-shadow: 0 1px 6px rgba(0,0,0,0.8); }
  .nav.scrolled .nav-logo { color: var(--black); }
  .nav-links { display: flex; gap: var(--gap-xxl); list-style: none; }
  .nav-links a { font-size: 12px; letter-spacing: 0.12em; color: rgba(248, 248, 246, 0.95); transition: color 0.25s ease; text-shadow: 0 1px 6px rgba(0,0,0,0.8); }
  .nav.scrolled .nav-links a { color: var(--grey-dark); }
  .nav-links a:hover, .nav-links a.active { color: var(--white); }
  .nav.scrolled .nav-links a:hover, .nav.scrolled .nav-links a.active { color: var(--black); }
  .nav-links a.active { font-weight: 600; }
  .btn-enquire { padding: var(--gap-sm) var(--gap-lg); background: transparent; color: var(--white); border: 0.5px solid rgba(248,248,246,0.5); font-size: var(--eyebrow); letter-spacing: 0.12em; font-weight: 600; cursor: pointer; transition: all 0.3s ease; font-family: inherit; }
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

  .hero { position: relative; height: 100vh; min-height: 600px; overflow: hidden; display: flex; align-items: center; justify-content: center; text-align: center; }
  .hero-media { position: absolute; inset: 0; width: 100%; height: 100%; overflow: hidden; }
  .hero-media .placeholder-texture { position: absolute; inset: -10%; background: repeating-linear-gradient(125deg, #1C1C1C 0px, #1C1C1C 1px, transparent 1px, transparent 18px), var(--bg-dark); }
  .hero-media video, .hero-media img { width: 100%; height: 100%; object-fit: cover; }
  .hero-overlay { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(13,13,13,0.6) 0%, rgba(13,13,13,0.3) 40%, rgba(13,13,13,0.7) 100%); }
  .hero-content { position: relative; z-index: 1; padding: 0 var(--margin-desktop); max-width: 900px; }
  .hero-eyebrow { font-size: var(--eyebrow); letter-spacing: 0.24em; color: var(--border); margin-bottom: var(--gap-lg); text-shadow: 0 0 20px rgba(0,0,0,0.8), 0 2px 8px rgba(0,0,0,0.9); font-weight: 700; }
  .hero h1 { font-family: var(--font-goodtimes); font-size: 64px; font-weight: 500; color: var(--white); letter-spacing: 0.01em; margin-bottom: var(--gap-lg); text-shadow: 0 0 40px rgba(0,0,0,0.9), 0 2px 4px rgba(0,0,0,0.9), 0 8px 24px rgba(0,0,0,0.7); }
  .hero p { font-size: var(--body-lg); letter-spacing: 0.02em; color: #FAFAF8; margin-bottom: var(--gap-xl); text-shadow: 0 0 20px rgba(0,0,0,0.8), 0 2px 8px rgba(0,0,0,0.9); font-weight: 500; }
  .hero-line { width: 120px; height: 1px; background: var(--border); margin: 0 auto var(--gap-xxl); }
  .scroll-indicator { font-size: var(--eyebrow); letter-spacing: 0.24em; color: rgba(248,248,246,0.5); display: inline-flex; flex-direction: column; align-items: center; gap: var(--gap-md); }
  .scroll-indicator::after { content: ''; width: 1px; height: 28px; background: rgba(248,248,246,0.3); }
  .scroll-chevron { animation: chevronBounce 1.6s ease-in-out infinite; }
  @keyframes chevronBounce { 0%, 100% { transform: translateY(0); opacity: 0.5; } 50% { transform: translateY(6px); opacity: 1; } }

  .stats { display: grid; grid-template-columns: repeat(3, 1fr); border-bottom: 0.5px solid var(--border); }
  .stat { text-align: center; padding: var(--gap-xl) 0; border-right: 0.5px solid var(--border); }
  .stat:last-child { border-right: none; }
  .stat-num { font-size: var(--h3); font-weight: 500; color: var(--black); }
  .stat-label { font-size: var(--eyebrow); letter-spacing: 0.18em; color: var(--grey-light); margin-top: var(--gap-sm); }

  .section { padding: var(--gap-xxl) var(--margin-desktop); max-width: 1920px; margin: 0 auto; }
  .section-eyebrow { font-size: var(--eyebrow); letter-spacing: 0.22em; color: var(--border); margin-bottom: var(--gap-md); }
  .section-title { font-family: var(--font-goodtimes); font-size: var(--h2); font-weight: 500; letter-spacing: 0.01em; color: var(--black); margin-bottom: var(--gap-md); }
  .section-lead { font-size: var(--body-lg); color: var(--grey-dark); line-height: 1.7; max-width: 560px; margin-bottom: var(--gap-xxl); }

  .works-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--gap-xl); }
  .work-card { cursor: pointer; display: block; }
  .work-image { aspect-ratio: 4 / 3; background: var(--bg-darker); position: relative; overflow: hidden; border-radius: 2px; }
  .work-texture { position: absolute; inset: 0; background: repeating-linear-gradient(125deg, #262626 0px, #262626 1px, transparent 1px, transparent 16px); transition: transform 0.6s ease; }
  .work-card:hover .work-texture { transform: scale(1.08); }
  .work-line { position: absolute; bottom: 0; left: 0; width: 0; height: 2px; background: var(--gold); transition: width 0.5s ease; }
  .work-card:hover .work-line { width: 100%; }
  .work-name { font-size: var(--h4); font-weight: 500; color: var(--black); margin-top: var(--gap-lg); transition: color 0.25s ease; font-family: var(--font-goodtimes); }
  .work-card:hover .work-name { color: var(--gold-dark); }
  .work-loc { font-size: var(--body-sm); color: var(--grey-light); margin-top: var(--gap-xs); }

  .services-section { background: var(--white); border-top: 0.5px solid var(--border); border-bottom: 0.5px solid var(--border); }
  .svc-grid { display: grid; grid-template-columns: 1fr 1.4fr; gap: var(--gap-xxl); align-items: start; }
  .svc-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5px; background: var(--border); border: 0.5px solid var(--border); }
  .svc-card { background: var(--white); padding: var(--gap-xl); transition: background 0.3s ease; cursor: pointer; }
  .svc-icon { font-size: 28px; color: var(--gold); margin-bottom: var(--gap-lg); }
  .svc-name { font-size: var(--h4); font-weight: 500; color: var(--black); margin-bottom: var(--gap-sm); font-family: var(--font-goodtimes); }
  .svc-desc { font-size: var(--body); color: var(--grey-dark); line-height: 1.7; }

  .process-grid { display: grid; grid-template-columns: repeat(4, 1fr); }
  .process-line { position: absolute; top: 22px; left: 0; right: 0; height: 1px; background: var(--border); transform-origin: left; transform: scaleX(0); transition: transform 1s cubic-bezier(0.65, 0, 0.35, 1); }
  .step { padding: var(--gap-lg) var(--gap-xl) 0; border-left: 0.5px solid var(--border); }
  .step:first-child { border-left: none; padding-left: 0; }
  .step-num { font-size: 44px; font-weight: 500; color: var(--border); margin-bottom: var(--gap-md); }
  .step-name { font-size: var(--h4); font-weight: 500; color: var(--black); margin-bottom: var(--gap-sm); font-family: var(--font-goodtimes); }
  .step-desc { font-size: var(--body); color: var(--grey-light); line-height: 1.7; }

  .testimonial { background: var(--bg-darker); padding: var(--gap-xxl) var(--margin-desktop); display: grid; grid-template-columns: 1.3fr 1fr; gap: var(--gap-xxl); align-items: center; }
  .quote-line { width: 40px; height: 1px; background: var(--gold); margin-bottom: var(--gap-xl); }
  .quote { font-size: var(--h3); font-weight: 500; color: var(--white); line-height: 1.6; font-family: var(--font-goodtimes); }
  .quote-attr { font-size: var(--body-sm); letter-spacing: 0.12em; color: var(--grey-light); margin-top: var(--gap-xl); }
  .testimonial-img { aspect-ratio: 4 / 3; background: #1A1A1A; border-radius: 2px; position: relative; overflow: hidden; }
  .testimonial-texture { position: absolute; inset: 0; background: repeating-linear-gradient(125deg, #262626 0px, #262626 1px, transparent 1px, transparent 18px); }

  .cta-strip { background: var(--bg-darker); color: var(--white); padding: var(--gap-xl) var(--margin-desktop); }
  .cta-strip-inner { max-width: 1920px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: var(--gap-xl); align-items: center; }
  .cta-strip h3 { font-size: var(--h3); font-weight: 500; margin-bottom: var(--gap-md); font-family: var(--font-goodtimes); }
  .cta-strip p { font-size: var(--body); color: var(--grey-light); line-height: 1.7; }
  .cta-buttons { display: flex; gap: var(--gap-lg); justify-content: flex-end; flex-wrap: wrap; }
  .btn-outline { padding: var(--gap-md) var(--gap-lg); border: 0.5px solid var(--white); color: var(--white); font-weight: 600; font-size: var(--body-sm); letter-spacing: 0.12em; transition: all 0.3s ease; white-space: nowrap; }
  .btn-outline:hover { background: var(--white); color: var(--black); }
  .btn-gold { padding: var(--gap-md) var(--gap-lg); background: var(--gold); color: var(--black); font-weight: 600; font-size: var(--body-sm); letter-spacing: 0.12em; transition: all 0.3s ease; white-space: nowrap; }
  .btn-gold:hover { background: var(--gold-dark); color: var(--white); }

  footer { background: var(--bg-darker); color: var(--white); padding: var(--gap-xxl) var(--margin-desktop); }
  .footer-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: var(--gap-xxl); margin-bottom: var(--gap-xxl); }
  .footer-brand { font-family: var(--font-goodtimes); font-size: var(--h4); font-weight: 700; letter-spacing: 0.14em; margin-bottom: var(--gap-lg); }
  .footer-tagline { font-size: var(--body-sm); color: var(--grey-light); line-height: 1.7; }
  .footer-heading { font-size: var(--eyebrow); letter-spacing: 0.16em; color: var(--gold); margin-bottom: var(--gap-lg); font-weight: 600; }
  .footer-links { list-style: none; display: flex; flex-direction: column; gap: var(--gap-md); }
  .footer-links a { font-size: var(--body-sm); color: var(--grey-light); transition: color 0.25s ease; }
  .footer-links a:hover { color: var(--white); }
  .footer-contact p { font-size: var(--body-sm); color: var(--grey-light); margin-bottom: var(--gap-md); }
  .footer-contact a { color: var(--grey-light); transition: color 0.25s ease; }
  .footer-contact a:hover { color: var(--white); }
  .footer-bottom { border-top: 0.5px solid #1E1E1E; padding-top: var(--gap-lg); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--gap-lg); font-size: var(--eyebrow); color: var(--grey-light); }
  .footer-bottom-links { display: flex; gap: var(--gap-xxl); }
  .footer-bottom-links a { color: var(--grey-light); }
  .footer-nav-heading { font-size: 11px; letter-spacing: 0.16em; color: #9C9488; margin-bottom: 20px; font-weight: 400; }
  .footer-nav-links { list-style: none; display: flex; flex-direction: column; gap: 12px; }
  .footer-nav-links a { font-size: 13px; color: #6B6560; text-decoration: none; transition: color 0.25s ease; }
  .footer-nav-links a:hover { color: #FAFAF8; }
  .footer-social { display: flex; gap: 16px; margin-top: 20px; }
  .footer-social a { font-size: 12px; color: #6B6560; letter-spacing: 0.08em; text-decoration: none; transition: color 0.25s ease; }
  .footer-social a:hover { color: #FAFAF8; }

  @media (max-width: 1024px) {
    :root { --margin-desktop: var(--margin-tablet); --h1: 42px; --h2: 32px; }
    .hero h1 { font-size: 44px; }
    .nav-links { gap: var(--gap-lg); }
    .works-grid { grid-template-columns: repeat(2, 1fr); }
    .svc-grid { grid-template-columns: 1fr; }
    .process-grid { grid-template-columns: repeat(2, 1fr); }
    .step { border-left: none; padding-left: 0; padding-top: var(--gap-lg); border-top: 0.5px solid var(--border); }
    .testimonial { grid-template-columns: 1fr; }
    .cta-strip-inner { grid-template-columns: 1fr; text-align: left; }
    .cta-buttons { justify-content: flex-start; }
  }
  @media (max-width: 720px) {
    :root { --margin-desktop: var(--margin-mobile); --h1: 40px; --h2: 28px; --h4: 20px; --body-lg: 16px; }
    .hero h1 { font-size: 40px; }
    .hero { height: 90vh; min-height: 480px; }
    .nav { padding: var(--gap-md) var(--margin-mobile); flex-wrap: wrap; height: auto; }
    .btn-enquire { display: none; }
    .stats { grid-template-columns: repeat(2, 1fr); }
    .stat:nth-child(2) { border-right: none; }
    .works-grid { grid-template-columns: 1fr; }
    .svc-cards { grid-template-columns: 1fr; }
    .process-grid { grid-template-columns: 1fr; }
    .step { border: none; padding: var(--gap-lg) 0; border-bottom: 0.5px solid var(--border); }
    .footer-grid { grid-template-columns: 1fr; }
    .footer-bottom { flex-direction: column; align-items: flex-start; }
  }
`;