"use client";

import React, { useRef } from "react";
import { InView } from "@/components/motion/InView";
import { Magnetic, RevealText } from "@/components/motion/Reveal";
import { RoomScene } from "@/components/three/RoomScene";
import { useStartProjectModal } from "@/components/ui/StartProjectModalContext";
import { Footer } from "@/components/layout/Footer";
import { withDefaults, toLines } from "@/lib/cms/schema";
import { SOCIAL_FALLBACKS } from "@/lib/social";
import { SITE } from "@/lib/site";

export interface ContactFooterSettings {
  email: string | null;
  whatsapp: string | null;
  instagramUrl: string | null;
  phone?: string | null;
  address?: string | null;
}

export function ContactFooter({
  content,
  footer,
  settings,
}: {
  content?: Record<string, any>;
  footer?: Record<string, any>;
  settings?: ContactFooterSettings;
}) {
  const { openModal } = useStartProjectModal();
  // Name of the material in focus, written from the 3D scene's frame loop.
  const materialRef = useRef<HTMLSpanElement>(null);
  const cta = withDefaults("home", "cta", content);

  const whatsapp = settings?.whatsapp || SOCIAL_FALLBACKS.whatsapp;
  const waDigits = whatsapp.replace(/[^0-9]/g, "");

  return (
    <>
    <section
      id="contact"
      className="relative pt-20 sm:pt-28 px-6 sm:px-11 pb-0 border-t border-white/15 bg-transparent"
    >
      {/* Full-bleed: the section's own px-* padding sets the edge inset, matching
          the other homepage sections. No max-width cap. */}
      <div className="w-full">
        {/* Top CTA Area — headline and buttons beside an interactive 3D quad */}
        <InView className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6 lg:gap-10 items-center pb-12 sm:pb-16 border-b border-white/15">
          <div>
            <RevealText
              as="h2"
              text={toLines(cta.heading).join("\n")}
              className="m-0 font-semibold uppercase text-3xl sm:text-5xl md:text-6xl lg:text-7xl leading-[0.95] tracking-tight text-white"
            />
            <p
              className="fq-fade mt-6 text-sm sm:text-base text-white/60 max-w-[34ch]"
              style={{ ["--i" as string]: 4 }}
            >
              {cta.subheading}
            </p>

            <div
              className="fq-fade flex flex-wrap gap-5 mt-10"
              style={{ ["--i" as string]: 5 }}
            >
              <Magnetic>
                <a
                  href={`https://wa.me/${waDigits}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] tracking-[0.18em] px-6 py-3.5 border border-white/35 hover:border-white text-white rounded-none transition-colors uppercase font-medium inline-flex items-center justify-center"
                >
                  {cta.whatsappLabel}
                </a>
              </Magnetic>
              <Magnetic>
                <button
                  type="button"
                  onClick={() => openModal()}
                  className="btn-primary text-xs uppercase font-medium cursor-pointer"
                >
                  {cta.ctaLabel}
                </button>
              </Magnetic>
            </div>
          </div>

          <div className="fq-fade relative h-[44vh] sm:h-[50vh] lg:h-[min(58vh,540px)]" style={{ ["--i" as string]: 3 }}>
            <RoomScene
              variant="lounge"
              className="absolute inset-0"
              label="The studio's material library: travertine, marble, oak, walnut, brass, bouclé, velvet and terrazzo samples orbit a leather chair in a lit arched niche; the sample nearest your pointer comes forward"
              onState={({ label }) => {
                if (label && materialRef.current && materialRef.current.textContent !== label) {
                  materialRef.current.textContent = label;
                }
              }}
            />
            <div
              aria-hidden="true"
              className="absolute left-0 right-0 bottom-0 flex justify-between gap-4 text-[11px] tracking-[0.22em] uppercase text-white/55 pointer-events-none"
            >
              <span>Material library</span>
              <span ref={materialRef} className="text-right text-white/80">Travertino Navona</span>
            </div>
          </div>
        </InView>
      </div>
    </section>
    <Footer
      footer={footer}
      settings={{
        email: settings?.email,
        whatsapp: settings?.whatsapp,
        instagramUrl: settings?.instagramUrl,
        phone: settings?.phone,
        address: settings?.address,
      }}
    />
    </>
  );
}
