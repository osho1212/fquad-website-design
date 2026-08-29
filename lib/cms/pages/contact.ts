// lib/cms/pages/contact.ts — the /contact page.
// Addresses, phone numbers and the map pin live in Settings, not here; this
// covers only the wording around them.

import type { PageDef } from '../types';

export const contactPage: PageDef = {
  key: 'contact',
  label: 'Contact',
  group: 'Pages',
  path: '/contact',
  icon: '✉',
  description: 'Wording on the contact page. Email, phone, address and map pin come from Settings.',
  sections: [
    {
      key: 'hero',
      label: 'Hero',
      fields: [
        { key: 'eyebrow', label: 'Eyebrow', type: 'text', half: true },
        { key: 'title', label: 'Headline', type: 'text', half: true },
        { key: 'intro', label: 'Intro paragraph', type: 'textarea' },
      ],
      defaults: {
        eyebrow: 'Get In Touch',
        title: 'Contact',
        intro: "Tell us about your project and we'll get back to you within one working day.",
      },
    },
    {
      key: 'details',
      label: 'Studio Details',
      description: 'The labelled list on the left. Values come from Settings — these are the labels.',
      fields: [
        { key: 'heading', label: 'Column heading', type: 'text', half: true },
        { key: 'studioLabel', label: 'Address label', type: 'text', half: true },
        { key: 'emailLabel', label: 'Email label', type: 'text', half: true },
        { key: 'phoneLabel', label: 'Phone label', type: 'text', half: true },
        { key: 'whatsappLabel', label: 'WhatsApp label', type: 'text', half: true },
        { key: 'instagramLabel', label: 'Instagram label', type: 'text', half: true },
        { key: 'instagramHandle', label: 'Instagram handle', type: 'text', half: true },
        { key: 'hoursLabel', label: 'Hours label', type: 'text', half: true },
        { key: 'hours', label: 'Opening hours', type: 'text' },
        { key: 'followLabel', label: 'Social row label', type: 'text', half: true },
        { key: 'whatsappButton', label: 'WhatsApp button', type: 'text', half: true },
        { key: 'workButton', label: 'View-work button', type: 'text', half: true },
        { key: 'workHref', label: 'View-work link', type: 'url', half: true },
      ],
      defaults: {
        heading: 'The Studio',
        studioLabel: 'Studio',
        emailLabel: 'Email',
        phoneLabel: 'Phone',
        whatsappLabel: 'WhatsApp',
        instagramLabel: 'Instagram',
        instagramHandle: '@fquadstudio',
        hoursLabel: 'Hours',
        hours: 'Monday – Saturday, 10:00 – 19:00',
        followLabel: 'Follow',
        whatsappButton: 'WhatsApp',
        workButton: 'View Work',
        workHref: '/past-projects',
      },
    },
    {
      key: 'form',
      label: 'Enquiry Form',
      fields: [{ key: 'heading', label: 'Form heading', type: 'text' }],
      defaults: { heading: 'Start a Project' },
    },
    {
      key: 'map',
      label: 'Map',
      description: 'The pin itself is set in Settings.',
      fields: [
        { key: 'heading', label: 'Section heading', type: 'text', half: true },
        { key: 'linkLabel', label: 'Open-in-maps link', type: 'text', half: true },
      ],
      defaults: { heading: 'Find Us', linkLabel: 'Open in Google Maps →' },
    },
  ],
};
