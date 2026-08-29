// lib/cms/pages/home.ts
// Every section of the homepage, top to bottom, in the order it renders.

import type { PageDef } from '../types';

export const homePage: PageDef = {
  key: 'home',
  label: 'Homepage',
  group: 'Homepage',
  path: '/',
  icon: '⌂',
  description: 'The scroll-driven landing page — hero, studio, work, philosophy, services, contact.',
  sections: [
    {
      key: 'hero',
      label: 'Hero',
      description: 'The full-screen scroll sequence at the very top.',
      fields: [
        { key: 'headline', label: 'Headline', type: 'text', help: 'Sits over the construction sequence. Kept on one line — keep it short.' },
        { key: 'primaryCtaLabel', label: 'Primary button', type: 'text', half: true },
        { key: 'primaryCtaHref', label: 'Primary button link', type: 'url', half: true },
        { key: 'secondaryCtaLabel', label: 'Secondary button', type: 'text', half: true, help: 'Opens the Start A Project form.' },
        { key: 'scrollHint', label: 'Scroll hint', type: 'text', half: true },
        { key: 'stencilTitle', label: 'Stencil wordmark', type: 'text', help: 'The large cut-out word revealed as the hero darkens.' },
        { key: 'stencilSubtitle', label: 'Stencil line 2', type: 'text' },
        { key: 'stencilByline', label: 'Stencil line 3', type: 'text' },
        { key: 'discoverLabel', label: 'Settled cue', type: 'text', half: true, help: 'Appears at the very end of the hero scroll.' },
      ],
      defaults: {
        headline: 'SPACE IS OUR MEDIUM',
        primaryCtaLabel: 'EXPLORE WORK ↓',
        primaryCtaHref: '#work',
        secondaryCtaLabel: 'START A PROJECT',
        scrollHint: 'SCROLL TO EXPLORE',
        stencilTitle: 'F.QUAD',
        stencilSubtitle: 'ARCHITECTURE & INTERIOR DESIGN STUDIO',
        stencilByline: 'BY AMIT & ASHMI',
        discoverLabel: 'DISCOVER THE PRACTICE',
      },
    },
    {
      key: 'stats',
      label: 'Stats Bar',
      description: 'The three counting numbers directly under the hero.',
      fields: [
        {
          key: 'items',
          label: 'Stats',
          type: 'list',
          itemLabel: 'Stat',
          itemTitleKey: 'label',
          max: 4,
          fields: [
            { key: 'value', label: 'Number', type: 'number', half: true, help: 'Counts up from zero when scrolled into view.' },
            { key: 'suffix', label: 'Suffix', type: 'text', half: true, placeholder: '+' },
            { key: 'label', label: 'Label', type: 'text' },
          ],
        },
      ],
      defaults: {
        items: [
          { value: 20, suffix: '+', label: 'YEARS' },
          { value: 500, suffix: '+', label: 'PROJECTS' },
          { value: 22, suffix: '+', label: 'AWARDS' },
        ],
      },
    },
    {
      key: 'studio',
      label: 'The Studio',
      description: 'The introduction paragraph block after the stats.',
      fields: [
        { key: 'eyebrow', label: 'Eyebrow', type: 'text', half: true },
        { key: 'lead', label: 'Lead statement', type: 'textarea', help: 'The large display sentence.' },
        { key: 'columns', label: 'Supporting paragraphs', type: 'paragraphs', help: 'Two paragraphs side by side. Separate them with a blank line.' },
      ],
      defaults: {
        eyebrow: 'THE STUDIO',
        lead: 'Founded in 2005, F.Quad Studio is an award-winning architecture and interior design practice based in Hyderabad.',
        columns: [
          'Over the past two decades, we have delivered more than 500 residential, commercial, hospitality, retail, and institutional projects, combining thoughtful design with practical solutions and a client-first approach.',
          'Built on the principles of Functionality, Futuristic thinking, Friendly collaboration, and Flexibility, we create spaces that are purposeful, timeless, and tailored to the people who use them.',
        ],
      },
    },
    {
      key: 'featured_projects',
      label: 'Featured Projects',
      description: 'The full-height hover accordion carrying the #work anchor.',
      fields: [
        { key: 'eyebrow', label: 'Eyebrow', type: 'text' },
        { key: 'linkLabel', label: 'Corner link', type: 'text', half: true },
        { key: 'linkHref', label: 'Corner link URL', type: 'url', half: true },
        { key: 'footnoteLeft', label: 'Footnote, left', type: 'text' },
        { key: 'footnoteRight', label: 'Footnote, right', type: 'text', half: true },
      ],
      defaults: {
        eyebrow: 'FEATURED PROJECTS · RECENT WORKS',
        linkLabel: 'EXPLORE PORTFOLIO →',
        linkHref: '/past-projects',
        footnoteLeft: 'INTERACTIVE ARCHITECTURAL SHOWCASE · HOVER TO EXPAND · SCROLL FOR MORE',
        footnoteRight: 'HYDERABAD · 2005 — PRESENT',
      },
    },
    {
      key: 'four_fs',
      label: "The Four F's",
      description: 'The pinned, auto-advancing philosophy carousel.',
      fields: [
        { key: 'eyebrow', label: 'Eyebrow', type: 'text', half: true },
        { key: 'hint', label: 'Corner hint', type: 'text', half: true },
        {
          key: 'slides',
          label: 'Faces',
          type: 'list',
          itemLabel: 'Face',
          itemTitleKey: 'title',
          max: 6,
          fields: [
            { key: 'title', label: 'Title', type: 'text', half: true, help: 'The first letter is styled separately.' },
            { key: 'accent', label: 'Accent colour', type: 'color', half: true },
            { key: 'subtitle', label: 'Subtitle', type: 'text' },
            { key: 'image', label: 'Background image', type: 'image' },
          ],
        },
      ],
      defaults: {
        eyebrow: 'FOUR FACES · ONE PRACTICE',
        hint: 'SCROLL TO EXPLORE PHILOSOPHY',
        slides: [
          { title: 'FUNCTIONAL', subtitle: 'Purposeful & Ergonomic Architecture', accent: '#B5B5B5', image: '/assets/images/b21.jpg' },
          { title: 'FUTURISTIC', subtitle: 'Modern Materials & Smart Spatial Systems', accent: '#8BA7B8', image: '/assets/images/a1.jpg' },
          { title: 'FRIENDLY', subtitle: 'Warmth, Natural Light & Collaboration', accent: '#A3B899', image: '/assets/images/a3.jpg' },
          { title: 'FLEXIBLE', subtitle: 'Adaptable Living & Timeless Spatial Balance', accent: '#C4C4C4', image: '/assets/images/b25.jpg' },
          { title: 'F.QUAD', subtitle: 'Four Faces · One Unified Practice', accent: '#D8D8D8', image: '/assets/images/b22.jpg' },
        ],
      },
    },
    {
      key: 'services',
      label: 'What We Do',
      description: 'The services grid. The service cards themselves live under Services → Service Catalogue.',
      fields: [
        { key: 'eyebrow', label: 'Eyebrow', type: 'text', half: true },
        { key: 'linkLabel', label: 'Corner link', type: 'text', half: true },
        { key: 'linkHref', label: 'Corner link URL', type: 'url', half: true },
        { key: 'cardCtaLabel', label: 'Card link label', type: 'text', half: true },
      ],
      defaults: {
        eyebrow: 'WHAT WE DO',
        linkLabel: 'ALL SERVICES →',
        linkHref: '/services',
        cardCtaLabel: 'Explore service →',
      },
    },
    {
      key: 'process',
      label: 'How We Work',
      description: 'The four numbered process steps.',
      fields: [
        { key: 'eyebrow', label: 'Eyebrow, left', type: 'text', half: true },
        { key: 'label', label: 'Eyebrow, right', type: 'text', half: true },
        {
          key: 'steps',
          label: 'Steps',
          type: 'list',
          itemLabel: 'Step',
          itemTitleKey: 'title',
          max: 6,
          fields: [
            { key: 'num', label: 'Number', type: 'text', half: true, placeholder: '01' },
            { key: 'title', label: 'Title', type: 'text', half: true },
            { key: 'desc', label: 'Description', type: 'textarea' },
          ],
        },
      ],
      defaults: {
        eyebrow: 'HOW WE WORK',
        label: 'OUR PROCESS',
        steps: [
          { num: '01', title: 'BRIEF', desc: 'We listen first. Understanding your vision, site, and lifestyle before a single line is drawn.' },
          { num: '02', title: 'CONCEPT', desc: 'Ideas take shape through sketches, models, and material exploration.' },
          { num: '03', title: 'DEVELOPMENT', desc: 'Concepts are refined into detailed designs and construction documents.' },
          { num: '04', title: 'DELIVERY', desc: 'We oversee execution to ensure the built result matches the design intent.' },
        ],
      },
    },
    {
      key: 'awards_marquee',
      label: 'Awards Marquee',
      description: 'The scrolling band of recognitions.',
      fields: [
        { key: 'items', label: 'Recognitions', type: 'lines', help: 'One per line. The band loops, so three to six reads best.' },
        { key: 'separator', label: 'Separator glyph', type: 'text', half: true },
      ],
      defaults: {
        items: ['IIID', 'ELDORK India Architecture Awards', 'Surfaces Reporter', 'Times Design Icons South'],
        separator: '◇',
      },
    },
    {
      key: 'testimonial',
      label: 'Testimonial',
      description: 'The single pull-quote near the bottom of the page.',
      fields: [
        { key: 'eyebrow', label: 'Eyebrow', type: 'text', half: true },
        { key: 'quote', label: 'Quote', type: 'textarea', help: 'Quotation marks are added automatically.' },
        { key: 'attribution', label: 'Attribution', type: 'text' },
      ],
      defaults: {
        eyebrow: 'TESTIMONIAL',
        quote: 'F.QUAD transformed our home into a space that truly reflects who we are.',
        attribution: 'CLIENT, JUBILEE HILLS RESIDENCE',
      },
    },
    {
      key: 'cta',
      label: 'Contact Call-to-Action',
      description: 'The "Have a project in mind?" block above the footer.',
      fields: [
        { key: 'heading', label: 'Heading', type: 'textarea', help: 'Line breaks are preserved.' },
        { key: 'subheading', label: 'Supporting line', type: 'textarea' },
        { key: 'whatsappLabel', label: 'WhatsApp button', type: 'text', half: true, help: 'The number comes from Settings.' },
        { key: 'ctaLabel', label: 'Primary button', type: 'text', half: true },
      ],
      defaults: {
        heading: 'Have a project\nin mind?',
        subheading: 'Let us design a space that works for the way you live.',
        whatsappLabel: 'WHATSAPP',
        ctaLabel: 'START A PROJECT →',
      },
    },
  ],
};
