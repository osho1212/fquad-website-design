"use client";

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

export default function Home() {
  return (
    <div className="relative bg-transparent text-white min-h-screen selection:bg-white selection:text-black">
      {/* Floating Pill Mini-Navbar */}
      <Navbar />

      {/* Hero Section with Canvas Image Scrub & Bottom Left Typography */}
      <HeroSection />

      {/* Animated Stats Section */}
      <StatsSection />

      {/* The Studio with Autoplay Video Background & Vignette */}
      <StudioSection />

      {/* Full-bleed Featured Projects showcase (carries the #work anchor) */}
      <FeaturedProjects />

      {/* 3D Rotating Quad Cube (Four F's) */}
      <FourFsSection />

      {/* What We Do (Services) */}
      <ServicesSection />

      {/* How We Work (Process) */}
      <ProcessSection />

      {/* Awards Infinite Marquee */}
      <AwardsSection />

      {/* Client Testimonial */}
      <Testimonial />

      {/* Contact & Multi-column Studio Footer */}
      <ContactFooter />
    </div>
  );
}
