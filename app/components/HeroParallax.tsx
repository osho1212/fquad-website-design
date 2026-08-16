'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function HeroParallax() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const media = document.querySelector('.hero-media');
    if (!media) return;

    const tween = gsap.fromTo(
      media,
      { y: 0 },
      {
        y: -120,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      }
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  return null;
}
