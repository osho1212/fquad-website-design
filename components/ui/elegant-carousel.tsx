'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import './elegant-carousel.css';

export interface SlideData {
  title: string;
  subtitle: string;
  description: string;
  accent: string;
  imageUrl: string;
}

const defaultSlides: SlideData[] = [
  {
    title: 'FUNCTIONAL',
    subtitle: 'Purposeful & Ergonomic Architecture',
    description:
      'We believe every design should serve a purpose. Our spaces are planned to be efficient, comfortable, and intuitive while maintaining a strong aesthetic identity.',
    accent: '#C39A5F',
    imageUrl: '/assets/images/b21.jpg',
  },
  {
    title: 'FUTURISTIC',
    subtitle: 'Modern Materials & Smart Spatial Systems',
    description:
      'Design should look forward. We integrate modern materials, sustainable systems, and smart spatial planning so that spaces remain relevant for decades.',
    accent: '#8BA7B8',
    imageUrl: '/assets/images/a1.jpg',
  },
  {
    title: 'FRIENDLY',
    subtitle: 'Warmth, Natural Light & Collaboration',
    description:
      'Architecture is for people. We focus on warmth, light, and natural connectivity — creating environments where people feel welcome and at ease.',
    accent: '#A3B899',
    imageUrl: '/assets/images/a3.jpg',
  },
  {
    title: 'FLEXIBLE',
    subtitle: 'Adaptable Living & Timeless Spatial Balance',
    description:
      'Spaces evolve as lifestyles change. Our layouts are adaptable, allowing rooms to shift between work, entertaining, and quiet contemplation with ease.',
    accent: '#D4A955',
    imageUrl: '/assets/images/b25.jpg',
  },
];

interface ElegantCarouselProps {
  slides?: SlideData[];
  className?: string;
}

export default function ElegantCarousel({
  slides = defaultSlides,
  className = '',
}: ElegantCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const SLIDE_DURATION = 6000;
  const TRANSITION_DURATION = 600;

  const goToSlide = useCallback(
    (index: number, dir?: 'next' | 'prev') => {
      if (isTransitioning || index === currentIndex) return;
      setDirection(dir || (index > currentIndex ? 'next' : 'prev'));
      setIsTransitioning(true);
      setProgress(0);

      setTimeout(() => {
        setCurrentIndex(index);
        setTimeout(() => {
          setIsTransitioning(false);
        }, 50);
      }, TRANSITION_DURATION / 2);
    },
    [isTransitioning, currentIndex]
  );

  const goNext = useCallback(() => {
    const nextIndex = (currentIndex + 1) % slides.length;
    goToSlide(nextIndex, 'next');
  }, [currentIndex, goToSlide, slides.length]);

  const goPrev = useCallback(() => {
    const prevIndex = (currentIndex - 1 + slides.length) % slides.length;
    goToSlide(prevIndex, 'prev');
  }, [currentIndex, goToSlide, slides.length]);

  useEffect(() => {
    if (isPaused) return;

    progressRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + 100 / (SLIDE_DURATION / 50);
      });
    }, 50);

    intervalRef.current = setInterval(() => {
      goNext();
    }, SLIDE_DURATION);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [currentIndex, isPaused, goNext]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 60) {
      if (diff > 0) goNext();
      else goPrev();
    }
  };

  const currentSlide = slides[currentIndex] || defaultSlides[0];

  return (
    <div
      className={`carousel-wrapper ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background accent wash */}
      <div
        className="carousel-bg-wash"
        style={{
          background: `radial-gradient(ellipse at 70% 50%, ${currentSlide.accent}20 0%, transparent 70%)`,
        }}
      />

      <div className="carousel-inner">
        {/* Left: Text Content */}
        <div className="carousel-content">
          <div className="carousel-content-inner">
            {/* Collection number */}
            <div
              className={`carousel-collection-num ${
                isTransitioning ? 'transitioning' : 'visible'
              }`}
            >
              <span className="carousel-num-line" style={{ background: currentSlide.accent }} />
              <span className="carousel-num-text">
                {String(currentIndex + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
              </span>
            </div>

            {/* Title */}
            <h2
              className={`carousel-title ${
                isTransitioning ? 'transitioning' : 'visible'
              }`}
            >
              {currentSlide.title}
            </h2>

            {/* Subtitle */}
            <p
              className={`carousel-subtitle ${
                isTransitioning ? 'transitioning' : 'visible'
              }`}
              style={{ color: currentSlide.accent }}
            >
              {currentSlide.subtitle}
            </p>

            {/* Description */}
            <p
              className={`carousel-description ${
                isTransitioning ? 'transitioning' : 'visible'
              }`}
            >
              {currentSlide.description}
            </p>

            {/* Navigation Arrows */}
            <div className="carousel-nav-arrows">
              <button
                onClick={goPrev}
                className="carousel-arrow-btn"
                aria-label="Previous slide"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={goNext}
                className="carousel-arrow-btn"
                aria-label="Next slide"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Image */}
        <div className="carousel-image-container">
          <div
            className={`carousel-image-frame ${
              isTransitioning ? 'transitioning' : 'visible'
            }`}
          >
            <img
              src={currentSlide.imageUrl}
              alt={currentSlide.title}
              className="carousel-image"
            />
            <div
              className="carousel-image-overlay"
              style={{
                background: `linear-gradient(135deg, ${currentSlide.accent}25 0%, transparent 55%)`,
              }}
            />
          </div>

          {/* Decorative frame corners */}
          <div
            className="carousel-frame-corner carousel-frame-corner--tl"
            style={{ borderColor: currentSlide.accent }}
          />
          <div
            className="carousel-frame-corner carousel-frame-corner--br"
            style={{ borderColor: currentSlide.accent }}
          />
        </div>
      </div>

      {/* Progress Indicators */}
      <div className="carousel-progress-bar">
        {slides.map((slide, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`carousel-progress-item ${
              index === currentIndex ? 'active' : ''
            }`}
            aria-label={`Go to slide ${index + 1}`}
          >
            <div className="carousel-progress-track">
              <div
                className="carousel-progress-fill"
                style={{
                  width:
                    index === currentIndex
                      ? `${progress}%`
                      : index < currentIndex
                      ? '100%'
                      : '0%',
                  backgroundColor:
                    index === currentIndex ? currentSlide.accent : undefined,
                }}
              />
            </div>
            <span className="carousel-progress-label">{slide.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
