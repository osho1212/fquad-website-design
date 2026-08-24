// lib/services.ts
// Single source of truth for the studio's services. Consumed by the homepage
// section, the /services index, and each /services/[slug] detail page.

export interface Service {
  slug: string;
  num: string;
  /** Card + index title. */
  title: string;
  /** One-line summary used on cards. */
  desc: string;
  /** Opening paragraph on the detail page. */
  intro: string;
  /** Supporting paragraphs on the detail page. */
  body: string[];
  /** What the engagement covers. */
  offerings: string[];
  image: string;
  alt: string;
}

export const services: Service[] = [
  {
    slug: 'architecture',
    num: '01',
    title: 'Architecture',
    desc: 'Residential, commercial, and hospitality spaces designed around climate and context.',
    intro:
      'We design buildings that answer to their site before anything else — orientation, light, airflow, and the way people will actually move through them.',
    body: [
      'Every project begins with the ground it sits on. Sun path, prevailing wind, neighbouring structures, and local climate shape the massing long before elevations are drawn. The result is architecture that performs in its context rather than fighting it.',
      'We work across residential, commercial, and hospitality briefs, coordinating with structural and services consultants from the earliest stages so that design intent survives all the way to construction.',
    ],
    offerings: [
      'Site and feasibility studies',
      'Concept design and massing',
      'Elevation and facade development',
      'Working drawings and approvals',
      'Consultant and contractor coordination',
      'On-site supervision through handover',
    ],
    image: '/assets/images/a1.jpg',
    alt: 'Residence facade in daylight',
  },
  {
    slug: 'interior-design',
    num: '02',
    title: 'Interior Design',
    desc: 'Material, light, and layout brought together with quiet precision.',
    intro:
      'Interiors are where a building meets daily life. We resolve layout, light, and material into spaces that feel considered without announcing themselves.',
    body: [
      'Planning comes first — how rooms connect, where light falls through the day, how storage disappears into the architecture. Only once the plan works do finishes and detailing follow.',
      'We develop bespoke joinery, lighting schemes, and material palettes in-house, then detail them to a level our contractors can build from without guesswork.',
    ],
    offerings: [
      'Spatial planning and layouts',
      'Material and finish palettes',
      'Bespoke joinery and furniture detailing',
      'Lighting design and specification',
      'Services and false-ceiling coordination',
      'Execution drawings and site supervision',
    ],
    image: '/assets/images/b21.jpg',
    alt: 'Living room with folding screens',
  },
  {
    slug: 'interior-styling',
    num: '03',
    title: 'Interior Styling',
    desc: 'The final layer — furniture, art, and objects that make a space feel lived in.',
    intro:
      'Styling is the last layer, and the one people feel first. Furniture, textiles, art, and objects are selected and placed so a finished space reads as personal rather than staged.',
    body: [
      'We curate loose furniture, rugs, lighting, artwork, and accessories against the palette already established in the interiors — sourcing across makers and galleries, and commissioning pieces where nothing existing fits.',
      'Styling can follow one of our own interior projects or stand alone, refreshing a completed space without construction.',
    ],
    offerings: [
      'Loose furniture selection and sourcing',
      'Art curation and commissioning',
      'Soft furnishings, rugs, and textiles',
      'Decorative lighting and accessories',
      'Vignette and shelf styling',
      'Installation and final placement',
    ],
    image: '/assets/images/b22.jpg',
    alt: 'Styled interior with layered furnishings and artwork',
  },
  {
    slug: 'farmhouse',
    num: '04',
    title: 'Farmhouse',
    desc: 'Bespoke weekend homes, luxury estates, and rural retreats designed in harmony with the natural landscape.',
    intro:
      'Weekend homes ask a different question than city projects: how much of the landscape can the building give back to you?',
    body: [
      'We plan farmhouses and estates around the land they occupy — existing trees, contours, water, and views set the footprint. Indoor and outdoor rooms are treated as one continuous sequence, with deep verandas, courtyards, and thresholds that stay usable through the year.',
      'These projects typically combine architecture, interiors, and landscape coordination under a single scope, so the house and its grounds resolve together.',
    ],
    offerings: [
      'Land assessment and siting',
      'Farmhouse and estate architecture',
      'Indoor–outdoor and veranda planning',
      'Pool, courtyard, and landscape coordination',
      'Interiors and material palettes',
      'Turnkey delivery and handover',
    ],
    image: '/assets/images/a3.jpg',
    alt: 'Farmhouse deck and estate outdoor living at dusk',
  },
];

export function getService(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}
