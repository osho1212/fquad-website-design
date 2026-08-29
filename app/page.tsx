import { Navbar } from "@/components/ui/mini-navbar";
import { HeroSection } from "@/components/sections/HeroSection";
import { StatsSection } from "@/components/sections/StatsSection";
import { StudioSection } from "@/components/sections/StudioSection";
import { FeaturedProjects } from "@/components/sections/FeaturedProjects";
import { FourFsSection } from "@/components/sections/FourFsSection";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { ProcessSection } from "@/components/sections/ProcessSection";
import { AwardsSection } from "@/components/sections/AwardsSection";
import { Testimonial } from "@/components/sections/Testimonial";
import { ContactFooter } from "@/components/sections/ContactFooter";
import { getPage } from "@/lib/cms/content";
import { getPastProjects } from "@/lib/past-projects";
import { getSiteSettings } from "@/lib/public-content";

// Content is read on the server and handed down as props, so every section
// below stays a plain client component with no data fetching of its own.
export const revalidate = 60;

export default async function Home() {
  const [home, global, services, projects, settings] = await Promise.all([
    getPage("home"),
    getPage("global"),
    getPage("services"),
    getPastProjects(),
    getSiteSettings().catch(() => null),
  ]);

  return (
    <div className="relative bg-transparent text-white min-h-screen selection:bg-white selection:text-black">
      {/* Floating Pill Mini-Navbar */}
      <Navbar content={global.nav} />

      {/* Hero Section with Canvas Image Scrub & Bottom Left Typography */}
      <HeroSection content={home.hero} />

      {/* Animated Stats Section */}
      <StatsSection content={home.stats} />

      {/* The Studio with Autoplay Video Background & Vignette */}
      <StudioSection content={home.studio} />

      {/* Full-bleed Featured Projects showcase (carries the #work anchor) */}
      <FeaturedProjects content={home.featured_projects} projects={projects} />

      {/* 3D Rotating Quad Cube (Four F's) */}
      <FourFsSection content={home.four_fs} />

      {/* What We Do (Services) */}
      <ServicesSection content={home.services} services={services.catalog?.items ?? []} />

      {/* How We Work (Process) */}
      <ProcessSection content={home.process} />

      {/* Awards Infinite Marquee */}
      <AwardsSection content={home.awards_marquee} />

      {/* Client Testimonial */}
      <Testimonial content={home.testimonial} />

      {/* Contact & Multi-column Studio Footer */}
      <ContactFooter
        content={home.cta}
        footer={global.footer}
        settings={{
          email: settings?.email ?? null,
          whatsapp: settings?.whatsapp ?? null,
          instagramUrl: settings?.instagramUrl ?? null,
        }}
      />
    </div>
  );
}
