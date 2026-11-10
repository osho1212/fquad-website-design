// lib/cms/pages/about.ts — the /about page.

import type { PageDef } from '../types';

export const aboutPage: PageDef = {
  key: 'about',
  label: 'About',
  group: 'Pages',
  path: '/about',
  icon: '◍',
  description: 'The long-form about page — intro, stats, story, the Four F’s, founders and recognition.',
  sections: [
    {
      key: 'hero',
      label: 'Hero',
      fields: [
        { key: 'eyebrow', label: 'Eyebrow', type: 'text' },
        { key: 'titleLine1', label: 'Headline, line 1', type: 'text', help: 'Rendered in the light colour.' },
        { key: 'titleLine2', label: 'Headline, line 2', type: 'text', help: 'Rendered in the muted colour.' },
        { key: 'subtitle', label: 'Subtitle', type: 'textarea' },
      ],
      defaults: {
        eyebrow: 'FOUNDED 2005 · HYDERABAD · AWARD-WINNING STUDIO',
        titleLine1: 'Designing Spaces That Work Today',
        titleLine2: 'and Evolve for Tomorrow.',
        subtitle: 'F.Quad Studio is an award-winning architecture and interior design practice built on the principles of Functionality, Futuristic thinking, Friendly collaboration, and Flexibility.',
      },
    },
    {
      key: 'intro',
      label: 'Intro',
      fields: [
        { key: 'lead', label: 'Lead statement', type: 'textarea' },
        { key: 'body', label: 'Paragraphs', type: 'paragraphs', help: 'Separate paragraphs with a blank line.' },
      ],
      defaults: {
        lead: 'Founded in 2005, F.Quad Studio is an award-winning architecture and interior design practice based in Hyderabad.',
        body: [
          'Over the past two decades, we have delivered more than 500 residential, commercial, hospitality, retail, and institutional projects, combining thoughtful design with practical solutions and a client-first approach.',
          'Built on the principles of Functionality, Futuristic thinking, Friendly collaboration, and Flexibility, we create spaces that are purposeful, timeless, and tailored to the people who use them.',
        ],
      },
    },
    {
      key: 'stats',
      label: 'Stats & Sectors',
      fields: [
        {
          key: 'items',
          label: 'Stats',
          type: 'list',
          itemLabel: 'Stat',
          itemTitleKey: 'label',
          max: 4,
          fields: [
            { key: 'number', label: 'Number', type: 'number', half: true, help: 'Counts up on scroll.' },
            { key: 'suffix', label: 'Suffix', type: 'text', half: true },
            { key: 'label', label: 'Label', type: 'text' },
          ],
        },
        { key: 'sectorLine', label: 'Sector line', type: 'text' },
      ],
      defaults: {
        items: [
          { number: 20, suffix: '+', label: 'Years of Experience' },
          { number: 500, suffix: '+', label: 'Projects Completed' },
          { number: 22, suffix: '+', label: 'Design Awards' },
        ],
        sectorLine: 'Residential • Commercial • Retail • Hospitality • Institutional',
      },
    },
    {
      key: 'story',
      label: 'Our Story',
      fields: [
        { key: 'eyebrow', label: 'Eyebrow', type: 'text', half: true },
        { key: 'title', label: 'Heading', type: 'text' },
        { key: 'body', label: 'Paragraphs', type: 'paragraphs' },
      ],
      defaults: {
        eyebrow: 'OUR STORY',
        title: 'F.Quad Studio began with a simple belief—',
        body: [
          'That great design should be functional, meaningful, and built around people. Founded by Amit Shah and Ashmi Shah in 2005, the practice has grown into one of Hyderabad’s leading architecture and interior design studios.',
          'Our work is shaped by curiosity, collaboration, and a willingness to explore diverse design languages while staying true to functionality. Every project is approached with fresh thinking, ensuring each space reflects its purpose, context, and the aspirations of its users.',
        ],
      },
    },
    {
      key: 'pillars',
      label: "The Four F's",
      description: 'The flip cards explaining the name.',
      fields: [
        { key: 'eyebrow', label: 'Eyebrow', type: 'text', half: true },
        { key: 'title', label: 'Heading', type: 'text', half: true },
        {
          key: 'items',
          label: 'Pillars',
          type: 'list',
          itemLabel: 'Pillar',
          itemTitleKey: 'title',
          max: 6,
          fields: [
            { key: 'num', label: 'Number', type: 'text', half: true },
            { key: 'title', label: 'Title', type: 'text', half: true },
            { key: 'desc', label: 'Back-of-card text', type: 'textarea' },
          ],
        },
      ],
      defaults: {
        eyebrow: "WHAT'S BEHIND THE NAME",
        title: "THE FOUR F's",
        items: [
          { num: '01', title: 'Functional', desc: 'We believe every design should serve a purpose. Our spaces are planned to be efficient, comfortable, and intuitive while maintaining a strong aesthetic identity.' },
          { num: '02', title: 'Futuristic', desc: 'We design with longevity in mind, creating spaces that adapt to changing lifestyles, technologies, and future needs.' },
          { num: '03', title: 'Friendly', desc: 'Collaboration is central to our process. We value open communication, transparency, and lasting relationships with every client.' },
          { num: '04', title: 'Flexible', desc: 'Every project is unique. Our ability to adapt, experiment, and respond to different styles and requirements allows us to deliver truly personalized design solutions.' },
        ],
      },
    },
    {
      key: 'founders',
      label: 'Meet the Founders',
      fields: [
        { key: 'eyebrow', label: 'Eyebrow', type: 'text' },
        { key: 'groupPhoto', label: 'Founders photo', type: 'image', help: 'The joint photo in the founders banner. Leave empty to show just the names and descriptions.' },
        { key: 'groupPhotoAlt', label: 'Founders photo alt text', type: 'text' },
        {
          key: 'people',
          label: 'Founders (names and descriptions, shown together in one banner)',
          type: 'list',
          itemLabel: 'Founder',
          itemTitleKey: 'name',
          max: 4,
          fields: [
            { key: 'name', label: 'Name', type: 'text', half: true },
            { key: 'role', label: 'Role', type: 'text', half: true },
            { key: 'bio', label: 'Bio', type: 'textarea' },
          ],
        },
      ],
      defaults: {
        eyebrow: 'MEET THE FOUNDERS',
        groupPhoto: '/assets/images/founders/amit-ashmi-1800.webp',
        groupPhotoAlt: 'Amit Shah and Ashmi Shah, founders of F.QUAD Studio, standing side by side',
        people: [
          {
            name: 'Amit Shah',
            role: 'Principal Architect',
            bio: '20+ years of architectural experience with expertise across residential, commercial, and institutional projects. Amit believes in creating spaces that balance innovation with functionality and is a regular speaker at leading architecture and design forums. His passion for design is complemented by his love for art, travel, and adventure.',
          },
          {
            name: 'Ashmi Shah',
            role: 'Principal Interior Designer',
            bio: 'An accomplished interior designer with over two decades of experience, Ashmi focuses on creating client-centric interiors that seamlessly blend aesthetics with functionality. Beyond design, she actively champions accessibility, sustainability, and climate-conscious practices through her leadership initiatives.',
          },
        ],
      },
    },
    {
      key: 'recognition',
      label: 'Recognition',
      fields: [
        { key: 'eyebrow', label: 'Eyebrow', type: 'text', half: true },
        { key: 'titleLine1', label: 'Heading, line 1', type: 'text', half: true },
        { key: 'titleLine2', label: 'Heading, line 2', type: 'text', half: true },
        { key: 'intro', label: 'Intro paragraph', type: 'textarea' },
        { key: 'items', label: 'Recognitions', type: 'lines', help: 'One per line.' },
      ],
      defaults: {
        eyebrow: 'RECOGNITION',
        titleLine1: 'Work That Speaks',
        titleLine2: 'For Itself.',
        intro: "Over the years, our work has been recognised by some of the industry's most respected institutions.",
        items: ['IIID', 'ELDORK India Architecture Awards', 'Surfaces Reporter', 'Times Design Icons South'],
      },
    },
    {
      key: 'closing',
      label: 'Closing',
      fields: [
        { key: 'statement', label: 'Statement', type: 'textarea' },
        { key: 'body', label: 'Supporting paragraph', type: 'textarea' },
        { key: 'primaryLabel', label: 'Outline button', type: 'text', half: true },
        { key: 'primaryHref', label: 'Outline button link', type: 'url', half: true },
        { key: 'secondaryLabel', label: 'Solid button', type: 'text', half: true, help: 'Opens the Start A Project form.' },
      ],
      defaults: {
        statement: 'At F.Quad Studio, every project is an opportunity to create spaces that inspire, perform, and endure.',
        body: "Whether designing a home, workplace, retail environment, or public space, our focus remains the same—to deliver thoughtful design that reflects our clients' vision and stands the test of time.",
        primaryLabel: 'VIEW OUR WORK',
        primaryHref: '/past-projects',
        secondaryLabel: 'START A PROJECT',
      },
    },
  ],
};
