import Link from 'next/link';
import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import { getProjectBySlug, getProjectSlugById, getSiteSettings, mediaUrl } from '@/lib/public-content';

// ssr:false is not permitted for next/dynamic inside a Server Component — this page
// does async data-fetching, so it can't be 'use client'. Omitting ssr still code-splits
// the lightbox/gallery bundle into its own chunk.
const ProjectGallery = dynamic(() => import('@/app/components/ProjectGallery'));
const RevealOnScroll = dynamic(() => import('@/app/components/RevealOnScroll'));

export const revalidate = 60;

export default async function ProjectDetailPage({ params }: { params: { slug: string } }) {
  const project = await getProjectBySlug(params.slug);

  if (!project) {
    notFound();
  }

  const settings = await getSiteSettings();
  const whatsappNumber = settings?.whatsapp?.replace(/[^0-9]/g, '') || '919876543210';
  const instagramUrl = settings?.instagramUrl || '#';
  const email_ = settings?.email || 'admin@fquad.com';

  const coverImg = mediaUrl(project.coverMedia, 'full');
  const linkedSlug = project.linkedProjectId ? await getProjectSlugById(project.linkedProjectId) : null;
  const companionLabel = project.hasInteriors ? 'EXPLORE INTERIORS' : project.hasArchitecture ? 'EXPLORE ARCHITECTURE' : null;
  const companionHref = linkedSlug ? `/projects/${linkedSlug}` : project.hasInteriors ? '/projects#interiors' : '/projects#architecture';
  const testimonial = project.testimonials?.[0] || null;
  const testimonialPhoto = testimonial ? mediaUrl(testimonial.media, 'thumb') : null;
  const descriptionParagraphs = project.description ? project.description.split('\n\n').filter(Boolean) : [];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: DETAIL_STYLES }} />

      <div className="page-fade">
      <nav className="nav nav-solid" id="site-nav">
        <Link href="/" className="nav-logo" style={{display:'flex',alignItems:'center'}}><img src="/assets/images/fquad-white-logo.svg" alt="F.QUAD" className="site-logo" style={{height:48,width:'auto',display:'block'}} /></Link>
        <ul className="nav-links">
          <li><Link href="/">HOME</Link></li>
          <li><Link href="/about">ABOUT</Link></li>
          <li className="nav-item">
            <Link href="/projects" className="active">PROJECTS</Link>
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

      <section className="detail-hero">
        {coverImg ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverImg} alt={project.title} />
        ) : (
          <div className="placeholder-texture" />
        )}
        <div className="detail-hero-overlay" />
        <div className="detail-hero-content">
          {project.subCategory && <div className="detail-tag">{project.subCategory.toUpperCase()}</div>}
          <h1>{project.title}</h1>
          {(project.clientName || project.location) && (
            <div className="detail-meta">{[project.clientName, project.location].filter(Boolean).join(' · ')}</div>
          )}
          {companionLabel && (
            <Link href={companionHref} className="detail-companion-btn">{companionLabel} →</Link>
          )}
        </div>
      </section>

      <div className="detail-back">
        <Link href="/projects">← BACK TO PROJECTS</Link>
      </div>

      <RevealOnScroll delay={0}>
        <section className="detail-meta-strip reveal">
          <div>
            <div className="detail-meta-label">PROJECT</div>
            <div className="detail-meta-value">{project.title}</div>
          </div>
          <div>
            <div className="detail-meta-label">CLIENT</div>
            <div className="detail-meta-value">{project.clientName || '—'}</div>
          </div>
          <div>
            <div className="detail-meta-label">LOCATION</div>
            <div className="detail-meta-value">{project.clientAddress || '—'}</div>
          </div>
          <div>
            <div className="detail-meta-label">YEAR</div>
            <div className="detail-meta-value">{project.year || '—'}</div>
          </div>
        </section>
      </RevealOnScroll>

      {descriptionParagraphs.length > 0 && (
        <RevealOnScroll delay={0.1}>
          <section className="detail-description reveal">
            {descriptionParagraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </section>
        </RevealOnScroll>
      )}

      {project.gallery.length > 0 && (
        <RevealOnScroll delay={0.2}>
          <section className="detail-gallery-wrap">
            <ProjectGallery gallery={project.gallery} />
          </section>
        </RevealOnScroll>
      )}

      {project.showLocation && project.mapLat !== null && project.mapLng !== null && (
        <section className="detail-map reveal">
          <div className="section-eyebrow">LOCATION</div>
          <iframe
            width="100%"
            height="360"
            style={{ border: 0, borderRadius: 2 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${project.mapLng! - 0.01},${project.mapLat! - 0.01},${project.mapLng! + 0.01},${project.mapLat! + 0.01}&layer=mapnik&marker=${project.mapLat},${project.mapLng}`}
          />
        </section>
      )}

      {testimonial && (
        <RevealOnScroll delay={0.3}>
          <section className="detail-testimonial reveal">
            <div className="detail-testimonial-quotemark">&ldquo;</div>
            <div className="detail-testimonial-inner">
              <div className="detail-testimonial-label">{project.title}</div>
              <p className="detail-testimonial-quote">&ldquo;{testimonial.testimonialText}&rdquo;</p>
              <div className="detail-testimonial-client">
                {testimonialPhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={testimonialPhoto} alt="" className="detail-testimonial-photo" />
                ) : (
                  <div className="detail-testimonial-photo detail-testimonial-initials">
                    {testimonial.clientName?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
                <div>
                  <div className="detail-testimonial-name">{testimonial.clientName}</div>
                  {testimonial.clientAddress && <div className="detail-testimonial-address">{testimonial.clientAddress}</div>}
                </div>
              </div>
            </div>
          </section>
        </RevealOnScroll>
      )}

      {linkedSlug && companionLabel && (
        <section className="detail-companion-cta">
          <Link href={`/projects/${linkedSlug}`}>{companionLabel} →</Link>
        </section>
      )}

      <section className="cta-strip">
        <div className="cta-strip-inner reveal">
          <div>
            <h3>Have a project in mind?</h3>
            <p>Let's talk through the brief, the site, and what's possible.</p>
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
            <img src="/assets/images/fquad-white-logo.svg" alt="F.QUAD" style={{height:40,width:'auto',display:'block',filter:'invert(1) brightness(2)',marginBottom:12}} />
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

      <script dangerouslySetInnerHTML={{ __html: DETAIL_SCRIPT }} />
    </>
  );
}

const DETAIL_SCRIPT = `
(function() {
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

const DETAIL_STYLES = `
  :root {
    --black: #2C2C2C; --white: #FAFAF8; --gold: #6B6560; --gold-dark: #9C9488;
    --grey-dark: #6B6560; --grey-light: #9C9488; --border: #E2DDD8;
    --bg-darker: #1E1E1E;
    --font-goodtimes: 'Good Times', sans-serif;
    --h1: 64px; --h2: 40px; --h3: 28px; --h4: 24px;
    --body-lg: 18px; --body: 16px; --body-sm: 15px; --eyebrow: 11px;
    --margin-desktop: 48px; --margin-tablet: 32px; --margin-mobile: 20px;
    --gap-xxl: 48px; --gap-xl: 32px; --gap-lg: 24px; --gap-md: 16px; --gap-sm: 12px;
    --nav-h: 84px;
  }
  body { background: var(--white); color: var(--black); line-height: 1.5; }
  a { color: inherit; text-decoration: none; }
  img { display: block; max-width: 100%; }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  .page-fade { animation: fadeIn 0.4s ease; }
  .reveal { opacity: 0; transform: translateY(30px); transition: opacity 0.7s cubic-bezier(0.25, 0.1, 0.25, 1), transform 0.7s cubic-bezier(0.25, 0.1, 0.25, 1); }
  .reveal.visible { opacity: 1; transform: translateY(0); }

  .nav { position: fixed; top: 0; left: 0; right: 0; display: flex; align-items: center; justify-content: space-between; padding: var(--gap-lg) var(--margin-desktop); height: var(--nav-h); background: rgba(250, 250, 248, 0.92); backdrop-filter: blur(8px); border-bottom: 0.5px solid var(--border); z-index: 100; }
  .nav-logo { font-family: var(--font-goodtimes); font-size: var(--h4); font-weight: 700; letter-spacing: 0.14em; color: var(--black); }
  .nav-links { display: flex; gap: var(--gap-xxl); list-style: none; }
  .nav-links a { font-size: 12px; letter-spacing: 0.12em; color: var(--grey-dark); }
  .nav-links a:hover, .nav-links a.active { color: var(--black); font-weight: 600; }
  .btn-enquire { padding: var(--gap-sm) var(--gap-lg); background: var(--black); color: var(--white); border: none; font-size: var(--eyebrow); letter-spacing: 0.12em; font-weight: 600; cursor: pointer; }

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

  .detail-hero { position: relative; height: 60vh; min-height: 400px; margin-top: var(--nav-h); overflow: hidden; }
  .detail-hero img { width: 100%; height: 100%; object-fit: cover; position: absolute; inset: 0; }
  .detail-hero .placeholder-texture { position: absolute; inset: 0; background: repeating-linear-gradient(125deg, #1C1C1C 0px, #1C1C1C 1px, transparent 1px, transparent 18px), var(--bg-darker); }
  .detail-hero-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%); }
  .detail-hero-content { position: absolute; z-index: 1; bottom: 40px; left: var(--margin-desktop); right: var(--margin-desktop); color: var(--white); }
  .detail-tag { font-size: 10px; letter-spacing: 0.2em; color: var(--gold-dark); margin-bottom: 10px; }
  .detail-hero-content h1 { font-family: var(--font-goodtimes); font-size: clamp(28px, 5vw, 52px); font-weight: 500; line-height: 1.1; margin-bottom: 8px; }
  .detail-meta { font-size: 13px; color: var(--gold-dark); letter-spacing: 0.06em; }
  .detail-companion-btn { display: inline-block; margin-top: 20px; padding: 10px 20px; border: 0.5px solid rgba(255,255,255,0.4); color: var(--white); font-size: 11px; letter-spacing: 0.12em; transition: all 0.3s ease; }
  .detail-companion-btn:hover { background: var(--white); color: var(--black); }

  .detail-back { padding: var(--gap-lg) var(--margin-desktop); max-width: 1200px; margin: 0 auto; }
  .detail-back a { font-size: var(--eyebrow); letter-spacing: 0.1em; color: var(--grey-dark); font-weight: 600; }
  .detail-back a:hover { color: var(--black); }

  .detail-meta-strip { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--gap-lg); border-bottom: 0.5px solid var(--border); padding: var(--gap-lg) var(--margin-desktop); }
  .detail-meta-label { font-size: 10px; color: var(--grey-light); letter-spacing: 0.18em; margin-bottom: 4px; }
  .detail-meta-value { font-size: 14px; color: var(--black); }

  .detail-description { padding: 64px 24px; max-width: 720px; margin: 0 auto; }
  .detail-description p { font-size: 16px; color: var(--grey-dark); line-height: 1.9; margin-bottom: 24px; }
  .detail-description p:last-child { margin-bottom: 0; }

  .detail-gallery-wrap { padding: 0 var(--margin-desktop) var(--gap-xxl); max-width: 1200px; margin: 0 auto; }
  .project-gallery-hero { width: 100%; height: 70vh; margin-bottom: 4px; }
  .project-gallery-hero img { width: 100%; height: 100%; object-fit: cover; }
  .project-gallery-columns { columns: 2; column-gap: 4px; }
  .project-gallery-item { position: relative; overflow: hidden; cursor: pointer; break-inside: avoid; margin-bottom: 4px; opacity: 0; transform: translateY(20px); transition: opacity 0.6s ease, transform 0.6s ease; }
  .project-gallery-item.gallery-item-visible { opacity: 1; transform: translateY(0); }
  .project-gallery-item img { width: 100%; display: block; transition: transform 0.5s ease; }
  .project-gallery-item:hover img { transform: scale(1.03); }
  .project-gallery-label { position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,0.65)); padding: 16px; color: var(--white); font-size: 11px; letter-spacing: 0.1em; }

  .detail-map { padding: 0 var(--margin-desktop) var(--gap-xxl); max-width: 1200px; margin: 0 auto; }
  .detail-map .section-eyebrow { font-size: var(--eyebrow); letter-spacing: 0.22em; color: var(--gold); margin-bottom: var(--gap-md); }

  .detail-testimonial { position: relative; background: #111111; padding: 72px var(--margin-desktop); overflow: hidden; }
  .detail-testimonial-inner { position: relative; max-width: 760px; margin: 0 auto; z-index: 1; }
  .detail-testimonial-quotemark { position: absolute; top: 40px; left: var(--margin-desktop); font-family: var(--font-goodtimes); font-size: 80px; color: var(--gold); opacity: 0.15; line-height: 1; z-index: 0; }
  .detail-testimonial-label { font-size: 10px; color: var(--grey-dark); letter-spacing: 0.2em; margin-bottom: 6px; text-transform: uppercase; }
  .detail-testimonial-quote { font-family: var(--font-goodtimes); font-size: clamp(15px, 2.2vw, 21px); color: #F5F2EE; line-height: 1.75; max-width: 680px; margin-bottom: 32px; }
  .detail-testimonial-client { display: flex; gap: 16px; align-items: center; }
  .detail-testimonial-photo { width: 52px; height: 52px; border-radius: 50%; object-fit: cover; background: var(--black); flex-shrink: 0; }
  .detail-testimonial-initials { display: flex; align-items: center; justify-content: center; font-size: 14px; color: var(--grey-light); }
  .detail-testimonial-name { font-size: 14px; color: #F5F2EE; font-weight: 500; }
  .detail-testimonial-address { font-size: 12px; color: var(--grey-dark); letter-spacing: 0.08em; margin-top: 2px; }

  .detail-companion-cta { background: #1E1E1E; border-top: 0.5px solid rgba(255,255,255,0.06); padding: 40px var(--margin-desktop); text-align: center; }
  .detail-companion-cta a { font-family: var(--font-goodtimes); font-size: 16px; color: var(--white); transition: color 0.2s ease; }
  .detail-companion-cta a:hover { color: var(--gold-dark); }

  .cta-strip { background: var(--bg-darker); color: var(--white); padding: var(--gap-xl) var(--margin-desktop); }
  .cta-strip-inner { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: var(--gap-xl); align-items: center; }
  .cta-strip h3 { font-size: var(--h3); font-weight: 500; margin-bottom: var(--gap-md); font-family: var(--font-goodtimes); }
  .cta-strip p { font-size: var(--body); color: var(--grey-light); line-height: 1.7; }
  .cta-buttons { display: flex; gap: var(--gap-lg); justify-content: flex-end; flex-wrap: wrap; }
  .btn-outline { padding: var(--gap-md) var(--gap-lg); border: 0.5px solid var(--white); color: var(--white); font-weight: 600; font-size: var(--body-sm); letter-spacing: 0.12em; }
  .btn-outline:hover { background: var(--white); color: var(--black); }
  .btn-gold { padding: var(--gap-md) var(--gap-lg); background: var(--gold); color: var(--black); font-weight: 600; font-size: var(--body-sm); letter-spacing: 0.12em; }
  .btn-gold:hover { background: var(--gold-dark); color: var(--white); }

  .footer-nav-heading { font-size: 11px; letter-spacing: 0.16em; color: #9C9488; margin-bottom: 20px; font-weight: 400; }
  .footer-nav-links { list-style: none; display: flex; flex-direction: column; gap: 12px; }
  .footer-nav-links a { font-size: 13px; color: #6B6560; text-decoration: none; transition: color 0.25s ease; }
  .footer-nav-links a:hover { color: #FAFAF8; }
  .footer-social { display: flex; gap: 16px; margin-top: 20px; }
  .footer-social a { font-size: 12px; color: #6B6560; letter-spacing: 0.08em; text-decoration: none; transition: color 0.25s ease; }
  .footer-social a:hover { color: #FAFAF8; }

  @media (max-width: 720px) {
    :root { --margin-desktop: var(--margin-mobile); }
    .nav-links { display: none; }
    .detail-meta-strip { grid-template-columns: repeat(2, 1fr); }
    .project-gallery-columns { columns: 1; }
    .cta-strip-inner { grid-template-columns: 1fr; text-align: left; }
    .cta-buttons { justify-content: flex-start; }
  }
`;
