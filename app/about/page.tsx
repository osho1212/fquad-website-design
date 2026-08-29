import Link from 'next/link';
import { SiteNav } from '@/components/ui/SiteNav';
import { SiteFooter } from '@/components/ui/SiteFooter';
import dynamic from 'next/dynamic';
import { getSiteSettings } from '@/lib/public-content';
import { getPage } from '@/lib/cms/content';
import CountUp from '../components/CountUp';

// ssr:false is not permitted for next/dynamic inside a Server Component — this page
// does async data-fetching, so it can't be 'use client'. Omitting ssr still code-splits
// the flip-card bundle into its own chunk.
const FourPillars = dynamic(() => import('@/app/components/FourPillars'));
const RevealOnScroll = dynamic(() => import('@/app/components/RevealOnScroll'));

export const revalidate = 60;

interface Stat {
  number: number;
  suffix: string;
  label: string;
}

interface Founder {
  name: string;
  role: string;
  portrait: string;
  bio: string;
}

export default async function AboutPage() {
  const [settings, content, globalContent] = await Promise.all([
    getSiteSettings(),
    getPage('about'),
    getPage('global'),
  ]);

  const nav = globalContent.page_nav;
  const footer = globalContent.page_footer;
  const footerSettings = {
    email: settings?.email ?? null,
    phone: settings?.phone ?? null,
    address: settings?.address ?? null,
    instagramUrl: settings?.instagramUrl ?? null,
    whatsapp: settings?.whatsapp ?? null,
  };

  const hero = content.hero;
  const intro = content.intro;
  const statsSection = content.stats;
  const story = content.story;
  const pillars = content.pillars;
  const founders = content.founders;
  const recognition = content.recognition;
  const closing = content.closing;

  const stats: Stat[] = statsSection.items ?? [];
  const awards: string[] = recognition.items ?? [];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: ABOUT_STYLES }} />

      <div className="page-fade">
      <SiteNav content={nav} active="/about" />

      <section className="about-hero">
        <div className="about-hero-texture" />
        <div className="about-hero-content reveal">
          <div className="about-hero-eyebrow">{hero.eyebrow}</div>
          <h1>
            <span style={{ display: 'block', color: '#FAFAF8' }}>{hero.titleLine1}</span>
            <span style={{ display: 'block', color: '#9C9488' }}>{hero.titleLine2}</span>
          </h1>
          <p className="about-hero-subtitle">{hero.subtitle}</p>
        </div>
      </section>

      <RevealOnScroll delay={0}>
        <section className="about-intro">
          <div className="about-intro-lead reveal">{intro.lead}</div>
          <div className="about-intro-copy reveal">
            {(intro.body as string[]).map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </section>
      </RevealOnScroll>

      <RevealOnScroll delay={0.1}>
        <div className="about-stats reveal">
          {stats.map((s, i) => (
            <div className="about-stat" key={i}>
              <div className="about-stat-num"><CountUp end={s.number} suffix={s.suffix} /></div>
              <div className="about-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </RevealOnScroll>

      <div className="about-services-line">{statsSection.sectorLine}</div>

      <RevealOnScroll delay={0.2}>
        <section className="about-story">
          <div className="about-story-eyebrow reveal">{story.eyebrow}</div>
          <h2 className="about-story-title reveal">{story.title}</h2>
          {(story.body as string[]).map((para, i) => (
            <p className="about-story-p reveal" key={i}>{para}</p>
          ))}
        </section>
      </RevealOnScroll>

      <section className="about-pillars">
        <div className="about-pillars-eyebrow">{pillars.eyebrow}</div>
        <h2 className="about-pillars-title">{pillars.title}</h2>
        <FourPillars pillars={pillars.items} />
      </section>

      <RevealOnScroll delay={0.3}>
        <section className="about-founders">
          <div className="about-founders-eyebrow reveal">{founders.eyebrow}</div>
          <div className="about-founders-grid stagger">
            {(founders.people as Founder[]).map((person, i) => (
              <div className="about-founder-card reveal" key={i}>
                {person.portrait ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    className="about-founder-photo"
                    src={person.portrait}
                    alt={person.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                ) : (
                  <div className="about-founder-photo" />
                )}
                <div className="about-founder-name">{person.name}</div>
                <div className="about-founder-role">{person.role}</div>
                <div className="about-founder-divider" />
                <p className="about-founder-bio">{person.bio}</p>
              </div>
            ))}
          </div>
        </section>
      </RevealOnScroll>

      <RevealOnScroll delay={0.4}>
        <section className="about-recognition">
          <div className="about-recognition-eyebrow reveal">{recognition.eyebrow}</div>
          <h2 className="about-recognition-title reveal">
            <span style={{ display: 'block' }}>{recognition.titleLine1}</span>
            <span style={{ display: 'block' }}>{recognition.titleLine2}</span>
          </h2>
          <p className="about-recognition-intro reveal">{recognition.intro}</p>
          <div className="about-awards-list stagger">
            {awards.map((a, i) => (
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
          <p className="about-closing-main reveal">{closing.statement}</p>
          <p className="about-closing-sub reveal">{closing.body}</p>
          <div className="about-closing-buttons reveal">
            <Link href={closing.primaryHref} className="about-btn-outline">{closing.primaryLabel}</Link>
            <Link href="#start-project" data-start-project="true" className="about-btn-solid">{closing.secondaryLabel}</Link>
          </div>
        </section>
      </RevealOnScroll>

      <SiteFooter content={footer} settings={footerSettings} />
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
