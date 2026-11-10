// lib/cms/pages/global.ts
// Chrome that appears on every page: the floating navbar and the site footer.

import type { PageDef } from '../types';

export const globalPage: PageDef = {
  key: 'global',
  label: 'Navigation & Footer',
  group: 'Global',
  path: '/',
  icon: '⌗',
  description: 'The floating navbar and the footer that repeat on every page.',
  sections: [
    {
      key: 'nav',
      label: 'Navigation Bar',
      description: 'The floating pill navbar at the top of every page.',
      fields: [
        { key: 'logo', label: 'Logo', type: 'image', help: 'Shown at the left of the pill. SVG or PNG with transparency works best.' },
        { key: 'logoAlt', label: 'Logo alt text', type: 'text' },
        { key: 'links', label: 'Menu links', type: 'links', help: 'Order here is the order on screen. Use /#work for an anchor on the homepage.' },
        { key: 'ctaLabel', label: 'Button label', type: 'text', half: true },
      ],
      defaults: {
        logo: '/assets/images/fquad-icon.svg',
        logoAlt: 'F.QUAD Logo',
        links: [
          { label: 'WORK', href: '/#work' },
          { label: 'SERVICES', href: '/services' },
          { label: 'STUDIO', href: '/studio' },
          { label: 'PROJECTS', href: '/past-projects' },
          { label: 'CONTACT', href: '/contact' },
        ],
        ctaLabel: 'START A PROJECT',
      },
    },
    {
      key: 'page_nav',
      label: 'Interior Page Navigation',
      description:
        'The solid bar used on About, Past Projects, Team, Awards, Journal and Testimonials — separate from the floating navbar on the homepage.',
      fields: [
        { key: 'logo', label: 'Logo', type: 'image' },
        { key: 'logoAlt', label: 'Logo alt text', type: 'text' },
        {
          key: 'items',
          label: 'Menu items',
          type: 'list',
          itemLabel: 'Item',
          itemTitleKey: 'label',
          fields: [
            { key: 'label', label: 'Label', type: 'text', half: true },
            { key: 'href', label: 'Link', type: 'url', half: true },
            { key: 'children', label: 'Dropdown links', type: 'links', help: 'Leave empty for a plain link with no dropdown.' },
          ],
        },
        { key: 'mobileItems', label: 'Mobile menu', type: 'links', help: 'The full-screen menu on small screens — flat, no dropdowns.' },
        { key: 'ctaLabel', label: 'Button label', type: 'text', half: true },
      ],
      defaults: {
        logo: '/assets/images/fquad-white-logo.svg',
        logoAlt: 'F.QUAD',
        items: [
          { label: 'HOME', href: '/', children: [] },
          { label: 'ABOUT', href: '/about', children: [] },
          {
            label: 'PROJECTS',
            href: '/past-projects',
            children: [
              { label: 'All Projects', href: '/past-projects' },
              { label: 'Residential', href: '/past-projects#residential' },
              { label: 'Commercial', href: '/past-projects#commercial' },
            ],
          },
          {
            label: 'STUDIO',
            href: '/team',
            children: [
              { label: 'Our Team', href: '/team' },
              { label: 'Awards', href: '/awards' },
            ],
          },
          { label: 'JOURNAL', href: '/blog', children: [] },
          { label: 'TESTIMONIALS', href: '/testimonials', children: [] },
          { label: 'CONTACT', href: '/contact', children: [] },
        ],
        mobileItems: [
          { label: 'HOME', href: '/' },
          { label: 'ABOUT', href: '/about' },
          { label: 'PROJECTS', href: '/past-projects' },
          { label: 'TEAM', href: '/team' },
          { label: 'AWARDS', href: '/awards' },
          { label: 'JOURNAL', href: '/blog' },
          { label: 'TESTIMONIALS', href: '/testimonials' },
          { label: 'CONTACT', href: '/contact' },
        ],
        ctaLabel: 'ENQUIRE',
      },
    },
    {
      key: 'page_footer',
      label: 'Interior Page Footer',
      description:
        'The dark footer on About, Past Projects, Team, Awards, Journal and Testimonials. Email, phone and address come from Settings.',
      fields: [
        { key: 'logo', label: 'Logo', type: 'image' },
        { key: 'logoAlt', label: 'Logo alt text', type: 'text' },
        { key: 'tagline', label: 'Tagline', type: 'text' },
        { key: 'socialLinks', label: 'Social links', type: 'links' },
        {
          key: 'columns',
          label: 'Link columns',
          type: 'list',
          itemLabel: 'Column',
          itemTitleKey: 'title',
          max: 3,
          fields: [
            { key: 'title', label: 'Column heading', type: 'text' },
            { key: 'links', label: 'Links', type: 'links' },
          ],
        },
        { key: 'contactHeading', label: 'Contact column heading', type: 'text', half: true },
        { key: 'copyright', label: 'Copyright line', type: 'text', help: 'Use {year} to insert the current year automatically.' },
        { key: 'legalLinks', label: 'Sub-footer links', type: 'links' },
      ],
      defaults: {
        logo: '/assets/images/fquad-white-logo.svg',
        logoAlt: 'F.QUAD',
        tagline: 'Architecture & Interior Design Studio, Hyderabad',
        socialLinks: [
          { label: 'INSTAGRAM', href: 'instagram' },
          { label: 'WHATSAPP', href: 'whatsapp' },
        ],
        columns: [
          {
            title: 'STUDIO',
            links: [
              { label: 'About', href: '/about' },
              { label: 'Our Team', href: '/team' },
              { label: 'Awards & Recognition', href: '/awards' },
              { label: 'Journal', href: '/blog' },
            ],
          },
          {
            title: 'PROJECTS',
            links: [
              { label: 'All Projects', href: '/past-projects' },
              { label: 'Residential', href: '/past-projects#residential' },
              { label: 'Commercial', href: '/past-projects#commercial' },
            ],
          },
        ],
        contactHeading: 'CONTACT',
        copyright: '© {year} F.QUAD Studio. All rights reserved.',
        legalLinks: [
          { label: 'PRIVACY', href: '#' },
          { label: 'SITEMAP', href: '/sitemap.xml' },
        ],
      },
    },
    {
      key: 'footer',
      label: 'Homepage Footer',
      description: 'The multi-column footer under the contact block on the homepage, Studio and Services pages.',
      fields: [
        { key: 'logo', label: 'Footer logo', type: 'image' },
        { key: 'logoAlt', label: 'Footer logo alt text', type: 'text' },
        {
          key: 'columns',
          label: 'Link columns',
          type: 'list',
          itemLabel: 'Column',
          itemTitleKey: 'title',
          max: 4,
          fields: [
            { key: 'title', label: 'Column heading', type: 'text' },
            { key: 'links', label: 'Links', type: 'links' },
          ],
        },
        { key: 'contactHeading', label: 'Contact column heading', type: 'text', half: true },
        { key: 'contactLocation', label: 'Location line', type: 'text', half: true },
        { key: 'copyright', label: 'Copyright line', type: 'text', help: 'Use {year} to insert the current year automatically.' },
        { key: 'legalLinks', label: 'Sub-footer links', type: 'links' },
      ],
      defaults: {
        logo: '/assets/images/fquad-white-logo-full.svg',
        logoAlt: 'F.QUAD Architecture & Interior Design Studio by Amit and Ashmi',
        columns: [
          {
            title: 'STUDIO',
            links: [
              { label: 'About', href: '/studio' },
              { label: 'Our Team', href: '/team' },
              { label: 'Awards & Recognition', href: '/awards' },
              { label: 'Journal', href: '/blog' },
            ],
          },
          {
            title: 'PROJECTS',
            links: [
              { label: 'Residential', href: '/past-projects#residential' },
              { label: 'Commercial', href: '/past-projects#commercial' },
            ],
          },
        ],
        contactHeading: 'CONTACT',
        contactLocation: 'Hyderabad, Telangana, India',
        copyright: '© {year} F.QUAD STUDIO. ALL RIGHTS RESERVED.',
        legalLinks: [
          { label: 'PRIVACY', href: '#' },
          { label: 'SITEMAP', href: '/sitemap.xml' },
        ],
      },
    },
  ],
};
