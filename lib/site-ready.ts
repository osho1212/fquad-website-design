/**
 * WARMING THE PAGE BEHIND THE INTRO
 *
 * The intro used to lift after a fixed 4.2s while most of the page was still
 * arriving: the hero film fetches a window of frames around the one on
 * screen, every image below the fold is lazy, and the 3D scenes build on an
 * idle callback. All of that then landed *while the visitor scrolled*, which
 * is what made exploring feel laggy.
 *
 * This pulls that work forward into the time the intro is already on screen,
 * and reports honest progress so the intro can wait for it:
 *
 *   fonts    document.fonts.ready — so nothing re-flows after the reveal
 *   film     the opening half of the hero film, fetched *and decoded*
           (the heavy one; the rest streams in behind the reveal)
 *   images   every <img> on the page, lazy ones included, decoded
 *   scenes   reported in `detail` only; the intro no longer waits on it
 *
 * Nothing here blocks forever: `watchSiteReady` reports, and the caller
 * decides how long to honour it (see the ceilings in Preloader.tsx).
 */

/**
 * How much of the bar each stage is worth. The film dominates the bytes.
 *
 * The 3D scene is not waited on. It lives in the contact footer, a dozen
 * screens below the hero, and only starts after the window's load event and
 * two idle callbacks, so holding the intro for it added ~6 s to every first
 * visit (measured on fquadstudio.com: film ready at 2.9 s, scene at 9.1 s,
 * intro lifted at 10.9 s). The idle queue still builds it in a quiet moment
 * long before anyone scrolls that far.
 */
const WEIGHTS = { fonts: 0.05, film: 0.67, images: 0.28 };

/**
 * Share of the film the intro waits for. Frames are fetched in order from
 * the playhead, so this is the opening stretch of the scrub. The rest keeps
 * streaming in at full concurrency while the visitor reads the headline;
 * holding the intro for every last frame doubled the wait for a part of the
 * film nobody reaches in the first few seconds.
 */
const FILM_GATE = 0.5;

/**
 * The longest any single image may hold the intro. A large source photo
 * being optimised for the first time (AVIF encoding, before any CDN has it
 * cached) can take several seconds on its own; past this it is counted as
 * settled and the rest of the page stops waiting on it. It still finishes
 * loading — it just no longer gates the reveal.
 */
const IMAGE_CEILING_MS = 6000;

export type SiteProgress = {
  /** 0‒1 across every stage, weighted. */
  progress: number;
  /** True once everything this page is going to load has loaded. */
  ready: boolean;
  /** For debugging and for the dev readout. */
  detail: { fonts: number; film: number; images: number; scenes: number };
};

type Stop = () => void;

const settled = (p: number) => (Number.isFinite(p) ? Math.min(1, Math.max(0, p)) : 0);

/**
 * Force one image to load now and resolve once its pixels are decoded, so a
 * later paint of it costs nothing. A failure resolves too — a broken image
 * must never hold the intro.
 */
function warmImage(img: HTMLImageElement): Promise<void> {
  return new Promise((resolve) => {
    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      resolve();
    };
    const timer = window.setTimeout(done, IMAGE_CEILING_MS);
    // Flipping this is what actually starts a lazy image; the browser
    // re-evaluates it the moment the attribute changes.
    if (img.loading === "lazy") img.loading = "eager";
    const decode = () => {
      if (typeof img.decode === "function") img.decode().then(done, done);
      else done();
    };
    if (img.complete) {
      if (img.naturalWidth > 0) decode();
      else done(); // already failed
      return;
    }
    img.addEventListener("load", decode, { once: true });
    img.addEventListener("error", done, { once: true });
  });
}

/**
 * Start warming the page and report progress until `stop()` is called.
 *
 * `scope` is the element the page lives in, so the intro's own markup is
 * never counted against itself.
 */
export function watchSiteReady(
  onChange: (state: SiteProgress) => void,
  scope: () => Element | null = () => document.querySelector(".fq-page"),
): Stop {
  let stopped = false;

  // ── fonts ───────────────────────────────────────────────────────────────
  let fonts = 0;
  const fontSet = (document as Document & { fonts?: FontFaceSet }).fonts;
  if (fontSet?.ready) fontSet.ready.then(() => { fonts = 1; }, () => { fonts = 1; });
  else fonts = 1;

  // ── images ──────────────────────────────────────────────────────────────
  const seen = new WeakSet<HTMLImageElement>();
  let imgTotal = 0;
  let imgDone = 0;
  const sweepImages = () => {
    const root = scope();
    if (!root) return;
    root.querySelectorAll("img").forEach((img) => {
      if (seen.has(img)) return;
      seen.add(img);
      imgTotal += 1;
      warmImage(img).then(() => { imgDone += 1; });
    });
  };

  // ── the hero film ───────────────────────────────────────────────────────
  let askedForFilm = false;
  const filmProgress = () => {
    const hero = window.__fqHero;
    if (!hero) return 0;
    if (!askedForFilm && hero.preloadAll) {
      askedForFilm = true;
      hero.preloadAll();
    }
    // Before the hero has published film counts, fall back to the opening
    // frames so the bar still moves.
    if (hero.filmTotal) return settled((hero.filmLoaded ?? 0) / (hero.filmTotal * FILM_GATE));
    return settled(hero.loaded / Math.max(1, hero.total)) * 0.2;
  };

  // ── the 3D scenes ───────────────────────────────────────────────────────
  // Each <RoomScene> reports through this counter once its first frame is
  // drawn; until any scene registers, this stage is simply complete.
  const sceneProgress = () => {
    const reg = window.__fqScenes;
    if (!reg || reg.total === 0) return 1;
    return settled(reg.ready / reg.total);
  };

  const tick = () => {
    if (stopped) return;
    sweepImages();
    const film = filmProgress();
    const images = imgTotal === 0 ? 0 : imgDone / imgTotal;
    const scenes = sceneProgress();
    // An image count of zero means the page has not rendered yet, which is
    // not the same as "no images to load" — hold that stage at zero until
    // something appears.
    const imagesKnown = imgTotal > 0;
    const progress =
      fonts * WEIGHTS.fonts + film * WEIGHTS.film + (imagesKnown ? images : 0) * WEIGHTS.images;
    const ready = fonts === 1 && film >= 1 && imagesKnown && images >= 1;
    onChange({ progress, ready, detail: { fonts, film, images: imagesKnown ? images : 0, scenes } });
  };

  tick();
  const id = window.setInterval(tick, 120);
  return () => {
    stopped = true;
    window.clearInterval(id);
  };
}
