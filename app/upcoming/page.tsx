import Link from 'next/link';
import { getUpcomingProjects, getSiteSettings, mediaUrl } from '@/lib/public-content';

export const revalidate = 0;

export default async function UpcomingPage() {
  const projects = await getUpcomingProjects();
  const settings = await getSiteSettings();

  const whatsappNumber = settings?.whatsapp?.replace(/[^0-9]/g, '') || '919876543210';
  const instagramUrl = settings?.instagramUrl || '#';
  const email_ = settings?.email || 'admin@fquad.com';
  const whatsappUrl = `https://wa.me/${whatsappNumber}`;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: UPCOMING_STYLES }} />

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

      <section className="upcoming-hero reveal">
        <div className="upcoming-hero-content">
          <div className="eyebrow">COMING SOON</div>
          <h1>What we&rsquo;re working on</h1>
          <p>A preview of projects currently in design and construction</p>
        </div>
      </section>

      <section className="projects-section">
        <div className="projects-grid stagger">
          {projects.map((project) => {
            const img = mediaUrl(project.coverMedia, 'medium');
            return (
              <Link
                href={`/projects/${project.slug}`}
                className="project-card reveal"
                key={project.id}
              >
                <div className="project-image">
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div className="project-texture" />
                  )}
                  <div className="project-tag">{project.category.name.toUpperCase()}</div>
                  <div className="status-badge">IN PROGRESS</div>
                  <div className="project-line" />
                </div>
                <div className="project-name">{project.title}</div>
                <div className="project-loc">
                  {project.location || ''}
                  {project.year ? ` — ${project.year}` : ''}
                </div>
              </Link>
            );
          })}
        </div>
        {projects.length === 0 && (
          <p style={{ color: '#9C9488', textAlign: 'center', padding: '120px 0' }}>
            Upcoming projects will be announced here
          </p>
        )}
      </section>

      <section className="cta-strip">
        <div className="cta-strip-inner reveal">
          <div>
            <h3>Interested in an upcoming project?</h3>
            <p>Get in touch to discuss availability and timelines for our upcoming developments.</p>
          </div>
          <div className="cta-buttons">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-outline">WHATSAPP</a>
            <Link href="/contact" className="btn-gold">ENQUIRE</Link>
          </div>
        </div>
      </section>

      <footer style={{ background: '#1E1E1E', color: '#FAFAF8', padding: 'var(--gap-xxl) var(--margin-desktop)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--gap-xxl)', marginBottom: 'var(--gap-xxl)' }}>
          <div>
            <img src="/assets/images/fquad-white-logo.svg" alt="F.QUAD" style={{height:40,width:'auto',display:'block',filter:'invert(1) brightness(2)',marginBottom:12}} />
            <p style={{ fontSize: 13, color: '#6B6560', marginTop: 16 }}>Architecture &amp; Interior Design Studio, Hyderabad</p>
            <div className="footer-social">
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer">INSTAGRAM</a>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">WHATSAPP</a>
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
        <div style={{ borderTop: '0.5px solid #2C2C2C', paddingTop: 'var(--gap-lg)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, fontSize: 11, color: '#6B6560', letterSpacing: '0.08em' }}>
          <p>&copy; 2026 F.QUAD Studio. All rights reserved.</p>
          <div style={{ display: 'flex', gap: 32 }}>
            <a href="#">PRIVACY</a>
            <a href="#">SITEMAP</a>
          </div>
        </div>
      </footer>
      </div>

      <script dangerouslySetInnerHTML={{ __html: UPCOMING_SCRIPT }} />
    </>
  );
}

const UPCOMING_SCRIPT = `
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

const UPCOMING_STYLES = `
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

  .eyebrow { font-size: var(--eyebrow); letter-spacing: 0.22em; color: var(--grey-light); margin-bottom: var(--gap-md); text-transform: uppercase; }

  .reveal { opacity: 0; transform: translateY(30px); transition: opacity 0.7s cubic-bezier(0.25, 0.1, 0.25, 1), transform 0.7s cubic-bezier(0.25, 0.1, 0.25, 1); }
  .reveal.visible { opacity: 1; transform: translateY(0); }
  .stagger > .reveal:nth-child(2) { transition-delay: 0.08s; }
  .stagger > .reveal:nth-child(3) { transition-delay: 0.16s; }
  .stagger > .reveal:nth-child(4) { transition-delay: 0.24s; }
  .stagger > .reveal:nth-child(5) { transition-delay: 0.32s; }
  .stagger > .reveal:nth-child(6) { transition-delay: 0.40s; }

  .nav { position: fixed; top: 0; left: 0; right: 0; display: flex; align-items: center; justify-content: space-between; padding: var(--gap-lg) var(--margin-desktop); height: var(--nav-h); background: transparent; border-bottom: 0.5px solid transparent; z-index: 100; transition: background 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease; }
  .nav.scrolled { background: rgba(248, 248, 246, 0.92); backdrop-filter: blur(8px); border-bottom: 0.5px solid var(--border); box-shadow: 0 1px 0 rgba(0,0,0,0.02); }
  .nav-logo { font-family: var(--font-goodtimes); font-size: var(--h4); font-weight: 700; letter-spacing: 0.14em; color: var(--white); transition: color 0.4s ease; }
  .nav.scrolled .nav-logo { color: var(--black); }
  .nav-links { display: flex; align-items: center; gap: var(--gap-xxl); list-style: none; }
  .nav-links > li { position: relative; }
  .nav-links a { font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(248, 248, 246, 0.8); transition: color 0.25s ease; }
  .nav.scrolled .nav-links a { color: var(--grey-dark); }
  .nav-links > li > a:hover, .nav-links > li > a.active { color: var(--white); }
  .nav.scrolled .nav-links > li > a:hover, .nav.scrolled .nav-links > li > a.active { color: var(--black); }
  .nav-links > li > a.active { font-weight: 600; }

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

  .btn-enquire { padding: var(--gap-sm) var(--gap-lg); background: transparent; color: var(--white); border: 0.5px solid rgba(248,248,246,0.5); font-size: var(--eyebrow); letter-spacing: 0.12em; font-weight: 600; cursor: pointer; transition: all 0.3s ease; font-family: inherit; }
  .nav.scrolled .btn-enquire { background: var(--black); color: var(--white); border-color: var(--black); }
  .btn-enquire:hover { background: var(--white); color: var(--black); border-color: var(--white); }
  .nav.scrolled .btn-enquire:hover { background: transparent; color: var(--black); border-color: var(--black); }
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

  .upcoming-hero { background: var(--bg-dark); min-height: 50vh; display: flex; align-items: center; justify-content: center; text-align: center; padding: calc(var(--nav-h) + var(--gap-xxl)) var(--margin-desktop) var(--gap-xxl); }
  .upcoming-hero-content { max-width: 720px; margin: 0 auto; }
  .upcoming-hero-content .eyebrow { color: var(--grey-light); justify-content: center; }
  .upcoming-hero-content h1 { font-family: var(--font-goodtimes); font-size: var(--h1); font-weight: 500; letter-spacing: 0.01em; color: var(--white); margin-bottom: var(--gap-lg); }
  .upcoming-hero-content p { font-size: var(--body-lg); color: var(--grey-light); line-height: 1.7; }

  .projects-section { padding: var(--gap-xxl) var(--margin-desktop); max-width: 1920px; margin: 0 auto; }
  .projects-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--gap-xl); }
  .project-card { cursor: pointer; display: block; transition: opacity 0.4s ease, transform 0.4s ease; }
  .project-image { aspect-ratio: 4 / 3; background: var(--bg-darker); position: relative; overflow: hidden; border-radius: 2px; }
  .project-texture { position: absolute; inset: 0; background: repeating-linear-gradient(125deg, #262626 0px, #262626 1px, transparent 1px, transparent 16px); transition: transform 0.6s ease; }
  .project-card:hover .project-texture { transform: scale(1.08); }
  .project-line { position: absolute; bottom: 0; left: 0; width: 0; height: 2px; background: var(--gold); transition: width 0.5s ease; }
  .project-card:hover .project-line { width: 100%; }
  .project-tag { position: absolute; top: var(--gap-md); left: var(--gap-md); font-size: var(--eyebrow); letter-spacing: 0.14em; color: var(--white); background: rgba(13,13,13,0.5); padding: var(--gap-xs) var(--gap-md); border-radius: 2px; backdrop-filter: blur(4px); }
  .status-badge { position: absolute; top: 16px; right: 16px; border: 0.5px solid #FAFAF8; color: #FAFAF8; background: rgba(42,42,42,0.7); font-size: 10px; letter-spacing: 0.1em; padding: 4px 10px; border-radius: 2px; text-transform: uppercase; }
  .project-name { font-size: var(--h4); font-weight: 500; color: var(--black); margin-top: var(--gap-lg); transition: color 0.25s ease; }
  .project-card:hover .project-name { color: var(--gold-dark); }
  .project-loc { font-size: var(--body-sm); color: var(--grey-light); margin-top: var(--gap-xs); }

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
    .projects-grid { grid-template-columns: repeat(2, 1fr); }
    .cta-strip-inner { grid-template-columns: 1fr; text-align: left; }
    .cta-buttons { justify-content: flex-start; }
  }
  @media (max-width: 720px) {
    :root { --margin-desktop: var(--margin-mobile); --h1: 40px; --h2: 28px; --h4: 20px; --body-lg: 16px; }
    .upcoming-hero { min-height: 42vh; }
    .nav { padding: var(--gap-md) var(--margin-mobile); flex-wrap: wrap; height: auto; }
    .projects-grid { grid-template-columns: 1fr; }
  }
`;
