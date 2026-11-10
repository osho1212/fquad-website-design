import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { PageHero } from "@/components/layout/PageHero";

export const metadata = {
  title: "Page not found — F.QUAD Studio",
  robots: { index: false, follow: false },
};

/**
 * Replaces Next's bare "404 / This page could not be found." — a dead end with
 * no navigation, no branding and nowhere to go. Same frame as every page, with
 * the three places most visitors actually want.
 */
export default function NotFound() {
  const link =
    "fq-link inline-flex items-center min-h-[44px] px-1 text-[11px] tracking-[0.2em] uppercase text-white/80 hover:text-white transition-colors";

  return (
    <PageShell>
      <PageHero
        eyebrow="Error 404"
        title={"This room doesn't\nexist yet."}
        intro="The page you're after has moved, or never existed. Let's get you back to somewhere with furniture in it."
        art="living"
      >
        <Link href="/" className="btn-primary text-xs uppercase font-medium">
          Back to home
        </Link>
        <Link href="/past-projects" className={link}>
          See our projects →
        </Link>
        <Link href="/contact" className={link}>
          Contact the studio →
        </Link>
      </PageHero>
    </PageShell>
  );
}
