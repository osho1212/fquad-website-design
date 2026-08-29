import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteNav } from '@/components/ui/SiteNav';
import { SiteFooter } from '@/components/ui/SiteFooter';
import { getBlogPostBySlug, getSiteSettings, mediaUrl } from '@/lib/public-content';
import { getPage } from '@/lib/cms/content';

export const revalidate = 0;

function formatDate(publishedAt: Date | null, createdAt: Date) {
  const d = publishedAt ?? createdAt;
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(d);
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getBlogPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const [settings, globalContent] = await Promise.all([getSiteSettings(), getPage('global')]);
  const nav = globalContent.page_nav;
  const footer = globalContent.page_footer;
  const footerSettings = {
    email: settings?.email ?? null,
    phone: settings?.phone ?? null,
    address: settings?.address ?? null,
    instagramUrl: settings?.instagramUrl ?? null,
    whatsapp: settings?.whatsapp ?? null,
  };

  const coverImg = post.media ? mediaUrl(post.media, 'full') : null;
  const readTime = Math.max(1, Math.ceil(post.body.split(' ').length / 200));
  const paragraphs = post.body.split('\n\n').map((p) => p.trim()).filter(Boolean);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: BLOG_POST_STYLES }} />

      <div className="page-fade">
      <SiteNav content={nav} active="/blog" />

      <div className="post-cover">
        {coverImg && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverImg} alt={post.title} />
        )}
      </div>

      <article className="post-article">
        <Link href="/blog" className="post-back">← Back to Journal</Link>

        <header className="post-header">
          <div className="post-date">{formatDate(post.publishedAt, post.createdAt)}</div>
          <h1 className="post-title">{post.title}</h1>
          <div className="post-readtime">{readTime} min read</div>
        </header>

        <div className="post-divider" />

        <div className="post-body">
          {paragraphs.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>

        <Link href="/blog" className="post-back post-back-bottom">← Back to Journal</Link>
      </article>

      <SiteFooter content={footer} settings={footerSettings} />
      </div>

      <script dangerouslySetInnerHTML={{ __html: BLOG_POST_SCRIPT }} />
    </>
  );
}

const BLOG_POST_SCRIPT = `
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

const BLOG_POST_STYLES = `
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

  .post-cover { position: relative; height: 55vh; min-height: 320px; margin-top: var(--nav-h); background: var(--bg-dark); overflow: hidden; }
  .post-cover img { width: 100%; height: 100%; object-fit: cover; }

  .post-article { max-width: 720px; margin: 0 auto; padding: 60px 24px; }
  .post-back { display: inline-block; font-size: 12px; color: var(--grey-light); letter-spacing: 0.1em; transition: color 0.25s ease; }
  .post-back:hover { color: var(--black); }
  .post-back-bottom { margin-top: 16px; }

  .post-header { margin-top: 32px; }
  .post-date { font-size: 11px; color: var(--grey-light); letter-spacing: 0.1em; text-transform: uppercase; }
  .post-title { font-size: 36px; font-weight: 500; color: var(--black); margin-top: 12px; line-height: 1.25; }
  .post-readtime { font-size: 11px; color: var(--grey-light); margin-top: 8px; letter-spacing: 0.1em; }

  .post-divider { border-top: 0.5px solid var(--border); margin: 32px 0; }

  .post-body p { font-size: 17px; color: var(--black); line-height: 1.88; margin-bottom: 24px; }
  .post-body p:last-child { margin-bottom: 0; }

  footer { background: var(--bg-darker); color: var(--white); padding: var(--gap-xxl) var(--margin-desktop); }
  .footer-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--gap-xxl); margin-bottom: var(--gap-xxl); }
  .footer-brand { font-family: var(--font-goodtimes); font-size: 22px; font-weight: 400; letter-spacing: 0.14em; margin-bottom: var(--gap-lg); }
  .footer-tagline { font-size: 13px; color: var(--grey-dark); line-height: 1.7; }
  .footer-contact-line { font-size: 13px; color: var(--grey-dark); margin-bottom: var(--gap-md); }
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
  .footer-bottom-links a:hover { color: #FAFAF8; }

  @media (max-width: 1024px) {
    :root { --margin-desktop: var(--margin-tablet); --h1: 42px; --h2: 32px; }
    .nav-links { gap: var(--gap-lg); }
  }
  @media (max-width: 720px) {
    :root { --margin-desktop: var(--margin-mobile); --h1: 40px; --h2: 28px; --h4: 20px; --body-lg: 16px; }
    .nav { padding: var(--gap-md) var(--margin-mobile); height: auto; }
    .post-article { padding: 40px 20px; }
    .post-title { font-size: 28px; }
    .footer-grid { grid-template-columns: 1fr; }
    .footer-bottom { flex-direction: column; align-items: flex-start; }
  }
`;
