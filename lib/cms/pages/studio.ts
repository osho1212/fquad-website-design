// lib/cms/pages/studio.ts — the /studio practice page.

import type { PageDef } from '../types';

export const studioPage: PageDef = {
  key: 'studio',
  label: 'Studio',
  group: 'Pages',
  path: '/studio',
  icon: '◫',
  description: 'The practice page — story, the Four F’s, founders and recognition.',
  sections: [
    {
      key: 'hero',
      label: 'Hero',
      description: 'Top of the page.',
      fields: [
        { key: 'eyebrow', label: 'Eyebrow', type: 'text' },
        { key: 'title', label: 'Headline', type: 'textarea' },
        { key: 'intro', label: 'Intro paragraph', type: 'textarea' },
      ],
      defaults: {
        eyebrow: 'FOUNDED 2005 · HYDERABAD · AWARD-WINNING STUDIO',
        title: 'Designing Spaces That Work Today and Evolve for Tomorrow.',
        intro: 'F.Quad Studio is an award-winning architecture and interior design practice built on the principles of Functionality, Futuristic thinking, Friendly collaboration, and Flexibility.',
      },
    },
    {
      key: 'showcase',
      label: 'Image & Metrics',
      description: 'The wide photograph and the three numbers beneath it.',
      fields: [
        { key: 'image', label: 'Photograph', type: 'image' },
        { key: 'imageAlt', label: 'Photograph alt text', type: 'text' },
        {
          key: 'metrics',
          label: 'Metrics',
          type: 'list',
          itemLabel: 'Metric',
          itemTitleKey: 'label',
          max: 4,
          fields: [
            { key: 'value', label: 'Value', type: 'text', half: true, placeholder: '20+' },
            { key: 'label', label: 'Label', type: 'text', half: true },
          ],
        },
        { key: 'sectorLine', label: 'Sector line', type: 'text', help: 'The uppercase list of sectors under the metrics.' },
      ],
      defaults: {
        image: '/assets/images/a1.jpg',
        imageAlt: 'Private residence, Hyderabad — F.QUAD',
        metrics: [
          { value: '20+', label: 'YEARS OF EXPERIENCE' },
          { value: '500+', label: 'PROJECTS COMPLETED' },
          { value: '22+', label: 'DESIGN AWARDS' },
        ],
        sectorLine: 'RESIDENTIAL • COMMERCIAL • RETAIL • HOSPITALITY • INSTITUTIONAL',
      },
    },
    {
      key: 'story',
      label: 'Our Story',
      fields: [
        { key: 'eyebrow', label: 'Eyebrow', type: 'text', half: true },
        { key: 'title', label: 'Display line', type: 'textarea' },
        { key: 'body', label: 'Paragraphs', type: 'paragraphs', help: 'Separate paragraphs with a blank line.' },
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
      key: 'four_fs',
      label: "The Four F's",
      description: 'The four-column grid explaining the name.',
      fields: [
        { key: 'eyebrow', label: 'Eyebrow', type: 'text', half: true },
        { key: 'title', label: 'Heading', type: 'text', half: true },
        {
          key: 'items',
          label: 'Principles',
          type: 'list',
          itemLabel: 'Principle',
          itemTitleKey: 'title',
          max: 6,
          fields: [
            { key: 'num', label: 'Number', type: 'text', half: true },
            { key: 'title', label: 'Title', type: 'text', half: true },
            { key: 'desc', label: 'Description', type: 'textarea' },
          ],
        },
      ],
      defaults: {
        eyebrow: "WHAT'S BEHIND THE NAME",
        title: "The Four F's",
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
            role: 'PRINCIPAL ARCHITECT',
            bio: '20+ years of architectural experience with expertise across residential, commercial, and institutional projects. Amit believes in creating spaces that balance innovation with functionality and is a regular speaker at leading architecture and design forums.',
          },
          {
            name: 'Ashmi Shah',
            role: 'PRINCIPAL INTERIOR DESIGNER',
            bio: 'An accomplished interior designer with over two decades of experience, Ashmi focuses on creating client-centric interiors that seamlessly blend aesthetics with functionality. Beyond design, she actively champions accessibility, sustainability, and climate-conscious practices.',
          },
        ],
      },
    },
    {
      key: 'recognition',
      label: 'Recognition',
      fields: [
        { key: 'eyebrow', label: 'Eyebrow', type: 'text', half: true },
        { key: 'title', label: 'Heading', type: 'textarea', help: 'Line breaks are preserved.' },
        { key: 'intro', label: 'Intro paragraph', type: 'textarea' },
        { key: 'items', label: 'Recognitions', type: 'lines', help: 'One per line.' },
        { key: 'itemLabel', label: 'Row label', type: 'text', half: true, help: 'The small text at the right of each row.' },
      ],
      defaults: {
        eyebrow: 'RECOGNITION',
        title: 'Work That Speaks\nFor Itself.',
        intro: "Over the years, our work has been recognised by some of the industry's most respected institutions.",
        items: ['IIID', 'ELDORK India Architecture Awards', 'Surfaces Reporter', 'Times Design Icons South'],
        itemLabel: 'RECOGNITION',
      },
    },
    {
      key: 'cta',
      label: 'Closing Banner',
      fields: [
        { key: 'statement', label: 'Statement', type: 'textarea' },
        { key: 'body', label: 'Supporting paragraph', type: 'textarea' },
        { key: 'primaryLabel', label: 'Primary button', type: 'text', half: true },
        { key: 'primaryHref', label: 'Primary button link', type: 'url', half: true },
        { key: 'secondaryLabel', label: 'Secondary button', type: 'text', half: true, help: 'Opens the Start A Project form.' },
      ],
      defaults: {
        statement: 'At F.Quad Studio, every project is an opportunity to create spaces that inspire, perform, and endure.',
        body: "Whether designing a home, workplace, retail environment, or public space, our focus remains the same—to deliver thoughtful design that reflects our clients' vision and stands the test of time.",
        primaryLabel: 'VIEW OUR WORK',
        primaryHref: '/#work',
        secondaryLabel: 'START A PROJECT →',
      },
    },
  ],
};
