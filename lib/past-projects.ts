// lib/past-projects.ts
// Content source for the /past-projects showcase and its detail pages.
// Images are placeholders drawn from /public/assets/images — swap the `images`
// arrays for real project photography as it becomes available.

export interface ProjectChapter {
  num: string;
  title: string;
  body: string[];
}

export interface ProjectFact {
  label: string;
  value: string;
}

export type ProjectCategory = 'residential' | 'commercial';

export interface PastProject {
  slug: string;
  name: string;
  category: ProjectCategory;
  /** Secondary name the project is also known by. Rendered under the title when set. */
  altName?: string;
  /** Shown as the small uppercase meta line. Empty until confirmed. */
  location: string;
  type: string;
  area: string;
  /** One-line summary used on the listing page and the detail hero. */
  tagline: string;
  images: string[];
  chapters: ProjectChapter[];
  facts: ProjectFact[];
}

export const pastProjects: PastProject[] = [
  {
    slug: 'juice-salon',
    category: 'commercial',
    name: 'Juice Salon',
    location: '',
    type: 'Unisex Salon & Spa',
    area: '',
    tagline:
      'A contemporary salon shaped by modern Spanish details, thoughtful planning, and a focus on comfort.',
    images: ['/assets/images/a1.jpg', '/assets/images/b21.jpg', '/assets/images/b22.jpg'],
    chapters: [
      {
        num: '01',
        title: 'Project Brief',
        body: [
          'The brief was to create a swanky and spacious unisex salon that felt tranquil, refined, and comfortable, while ensuring efficient space planning and maintenance-friendly detailing. The design needed to balance the functional requirements of a salon and spa with an experience that felt considered and inviting.',
        ],
      },
      {
        num: '02',
        title: 'Design Concept',
        body: [
          'The design draws inspiration from Spanish details interpreted through a contemporary lens. Arches, wall textures, flooring, display units, and other interior elements carry this influence throughout the salon.',
          'Luxury and comfort formed the foundation of the design approach. The colour palette, lighting, mirrors, furniture, beauty rooms, and spa areas were carefully considered to create a calm yet sophisticated environment.',
        ],
      },
      {
        num: '03',
        title: 'Spatial Planning',
        body: [
          'The salon is organised across two floors, allowing the ground floor to operate independently during periods of lower footfall while the entire salon can function during busier hours.',
          'The ground floor accommodates the reception and waiting area, hair-cutting stations, pedicure and nail bar, a beauty room, and staff rest area. The first floor includes an additional reception and waiting area, dedicated hair-wash and hair-spa areas, hair-cutting stations, massage and waxing rooms, a bridal beauty room, staff facilities, pantry, and toilets.',
          'The planning allows different service zones to remain clearly defined while maintaining an efficient flow throughout the salon.',
        ],
      },
      {
        num: '04',
        title: 'Material Palette',
        body: [
          'Spanish-inspired vitrified tiles form the flooring, complemented by pearl-finish wall textures throughout the salon and golden-finish textures in the beauty rooms. The ceilings are finished in white plastic emulsion.',
          'The staircase combines black leather-finish granite with MS railings and LED profile lighting integrated into the steps.',
          'Gold-finished MS elements, mirrors, curved laminates, perforated MS sheets, and textured surfaces add detail and visual depth to the interiors.',
        ],
      },
      {
        num: '05',
        title: 'Outcome',
        body: [
          'The completed salon brings together contemporary luxury, comfort, and Spanish-inspired detailing within a carefully planned setting. Distinctive elements such as the flowing-hair ceiling, central styling station, multifunctional reception partition, Spanish arch-inspired display unit, and detailed bridal room give the salon a strong visual identity while supporting its day-to-day functions.',
        ],
      },
    ],
    facts: [
      { label: 'Project Name', value: 'Juice Salon' },
      { label: 'Project Type', value: 'Unisex Salon & Spa' },
      { label: 'Studio', value: 'F.Quad Studio' },
      { label: 'Location', value: '' },
      { label: 'Area', value: '' },
    ],
  },

  {
    slug: 'jevar',
    category: 'commercial',
    name: 'Jevar',
    location: '',
    type: 'Boutique Jewellery Showroom',
    area: '1,600 sq. ft.',
    tagline:
      'A jewellery showroom shaped by reclaimed heritage, craftsmanship, and a sense of grandeur.',
    images: ['/assets/images/b23.jpg', '/assets/images/a2.jpg', '/assets/images/b25.jpg'],
    chapters: [
      {
        num: '01',
        title: 'Project Brief',
        body: [
          'The 1,600 sq. ft. boutique jewellery showroom was designed to create a royal and grand experience for its customers while establishing a distinctive presence. The design is rooted in the concept of R3 — Reduce, Reuse and Recycle, with reclaimed architectural elements becoming an integral part of the showroom identity.',
        ],
      },
      {
        num: '02',
        title: 'Design Concept',
        body: [
          'The concept began with the selection of antique elements sourced from Jaipur, Rajasthan, Gujarat, and Ahmedabad. Old jharokhas, arches, pillars, windows, wooden templates, artwork, and artefacts were carefully selected, measured, refurbished, and reinterpreted within the showroom.',
          'Rather than using these elements purely as decoration, they were transformed into display units, partitions, consoles, and architectural accents. The intention was to retain their original character while giving them a new role within a contemporary jewellery showroom.',
        ],
      },
      {
        num: '03',
        title: 'Spatial Planning',
        body: [
          'The double-height entrance creates an immediate sense of volume, framed by two feature walls incorporating reclaimed windows, wooden templates, antique artwork, and artefacts. Chandeliers add to the grandeur of the space.',
          'The showroom is organised into four display areas, allowing four clients to be attended to at a time. Two display areas are located on the ground floor, including a dedicated VIP area separated using reclaimed pillars. The first floor accommodates two additional display areas along with the MD room, safe, pantry, and powder room.',
          'A small open lift was introduced between the staircase well to connect the two floors. The first-floor railing combines reclaimed arches and pillars with laser-cut metal jali, continuing the heritage-inspired language throughout the space.',
        ],
      },
      {
        num: '04',
        title: 'Material Palette',
        body: [
          'Reclaimed architectural elements form the defining material language of the showroom. Antique arches, pillars, jharokhas, windows, reclaimed wood, old artwork, and artefacts are combined with designer sandstone, glass windows, customised carpets, mirrors, and laser-cut metal jali.',
          'A century-old silver border inherited by the clients was repurposed as a frame for a mirror, adding a personal layer of history to the space. A colourful digitally printed wallpaper was introduced on the first-floor ceiling, while chandeliers add a sense of richness and grandeur.',
        ],
      },
      {
        num: '05',
        title: 'Outcome',
        body: [
          'The showroom brings together heritage elements and contemporary retail requirements through a carefully considered process of reuse and refurbishment. Reclaimed architectural pieces retain their original character while taking on new functions as part of the showroom displays, partitions, and detailing.',
          'The result is a distinctive jewellery space where history, craftsmanship, and retail experience come together to create a strong sense of identity.',
        ],
      },
    ],
    facts: [
      { label: 'Project Name', value: 'Jevar' },
      { label: 'Project Type', value: 'Boutique Jewellery Showroom' },
      { label: 'Area', value: '1,600 sq. ft.' },
      { label: 'Location', value: '' },
    ],
  },

  {
    slug: 'after-hours',
    category: 'residential',
    name: 'After Hours',
    altName: 'Kings Party House',
    location: '',
    type: 'Weekend Home / Private Residence',
    area: '7,500 sq. ft.',
    tagline:
      'A weekend home designed for luxury, entertaining, and an unmistakable sense of character.',
    images: ['/assets/images/b49.jpg', '/assets/images/a3.jpg', '/assets/images/b61.jpg'],
    chapters: [
      {
        num: '01',
        title: 'Project Brief',
        body: [
          "The brief was to create a 7,500 sq. ft. weekend home as a surprise gift for the client's younger brother. Conceived as a luxurious, flamboyant, and chic setting for hosting VIP gatherings, the home was designed to make a strong impression while responding to the surrounding farm landscape.",
          'A defining aspect of the project was its timeline: the design was completed in one month and the project was executed in five months through meticulous planning and coordination.',
        ],
      },
      {
        num: '02',
        title: 'Design Concept',
        body: [
          'The interiors are built around a palette of brown, black, and grey, punctuated with vibrant accents. The design combines luxurious finishes with bold, unexpected elements that give the home its distinctive character.',
          'From the expansive entrance and indoor landscaped nook to the red luxury car that becomes a bar on the first floor, the spaces are designed to create moments of surprise while maintaining a cohesive visual language.',
        ],
      },
      {
        num: '03',
        title: 'Spatial Planning',
        body: [
          'The main entrance opens into a luxurious drawing room with an indoor landscaped nook, while the TV unit discreetly screens the pantry and dining areas from the formal seating space. A 14-foot slab height was maintained to maximise the available height after air-conditioning services.',
          'The master bedroom is positioned beside the swimming pool and opens directly towards it through a wall-to-wall sliding door. Its ensuite accommodates wardrobes, an island dresser, twin-basin counter, jacuzzi, shower, and WC cubicles.',
          'The first floor is organised around a lounge and home theatre, with a red luxury car serving as the focal point and its bonnet functioning as a bar. A rolling counter on ceiling-mounted tracks adds flexibility to the lounge.',
          'The upper level also includes two guest rooms, while the terrace houses the glass bedroom overlooking the surrounding farmland.',
        ],
      },
      {
        num: '04',
        title: 'Material Palette',
        body: [
          'The interiors are defined by a palette of brown, black, grey, and vibrant accents. The master ensuite combines black and white with touches of gold, while the first-floor guest rooms introduce grey, blue, and textured finishes.',
          'The terrace bedroom uses glass extensively, with glass walls and a glass roof creating an open connection with the surrounding landscape. White and blue tones bring a Santorini-inspired character to the space.',
        ],
      },
      {
        num: '05',
        title: 'Outcome',
        body: [
          'Designed and delivered within an ambitious timeline, the weekend home combines luxury with a strong sense of personality. Its distinctive spaces — from the car-turned-bar and flexible lounge counter to the glass terrace bedroom — create an environment designed around entertaining, relaxation, and memorable experiences.',
          'The completed home was warmly received by the clients, who were impressed by the final outcome.',
        ],
      },
    ],
    facts: [
      { label: 'Project Name', value: 'After Hours' },
      { label: 'Project Type', value: 'Weekend Home / Private Residence' },
      { label: 'Area', value: '7,500 sq. ft.' },
      { label: 'Location', value: '' },
    ],
  },

  {
    slug: 'chhaganlal-fine-jewellery',
    category: 'commercial',
    name: 'Chhaganlal Fine Jewellery',
    location: 'Banjara Hills, Road No. 9',
    type: 'Jewellery Showroom',
    area: '1,700 sq. ft.',
    tagline:
      'A jewellery store shaped by precise planning, considered detailing, and strict Vastu requirements.',
    images: ['/assets/images/b22.jpg', '/assets/images/b25.jpg', '/assets/images/a1.jpg'],
    chapters: [
      {
        num: '01',
        title: 'Project Brief',
        body: [
          'This 1,700 sq. ft. store is a branch of a family-run jewellery business, designed to cater to HNI and VIP clientele, politicians, and families seeking customised and bridal jewellery. The brief called for a Vastu-compliant store with prescribed colours for specific spaces, minimal product display, and a dedicated setting for private bridal jewellery selections.',
        ],
      },
      {
        num: '02',
        title: 'Design Concept',
        body: [
          'The design approach focused on meeting the strict Vastu parameters while maintaining a refined retail environment. Prescribed colours were carefully incorporated into wallpapers, upholstery, and other interior elements without compromising the overall design.',
          'A subtle palette of light oak veneer, peach and blue upholstery, peach-toned textured walls, and Italian marble creates a restrained backdrop for the jewellery.',
        ],
      },
      {
        num: '03',
        title: 'Spatial Planning',
        body: [
          'The entrance opens into a waiting area defined by inlay-patterned flooring and a mirrored ceiling. A glass partition with laser-cut copper film separates the waiting area from the display space while screening the counters from the main entrance.',
          'The ground floor includes minimal display areas, movable PVD-coated back runners, display counters, a cabin, and an attached strong room. The first floor introduces a boutique-inspired setting with two distinct display areas — one with counters and another with sofa seating.',
          'The MD room accommodates two MD chairs and sofa seating, while the accounts area, pantry, and powder room are discreetly positioned away from the common areas.',
        ],
      },
      {
        num: '04',
        title: 'Material Palette',
        body: [
          'The interiors combine light oak veneer with marble- and veneer-finished display counters. Italian marble flooring with selective inlay details forms the base, complemented by peach-toned textured walls and peach and blue upholstery.',
          'Designer wallpapers from the Asian Paints Sabyasachi collection add a boutique character to the first floor. Gold metal fabrication and marble stone cladding extend the material language to the building elevation.',
        ],
      },
      {
        num: '05',
        title: 'Outcome',
        body: [
          'The store balances the functional requirements of a specialised jewellery business with the constraints of a strict Vastu brief. Careful planning, a restrained material palette, and selective detailing allow the space to maintain a refined identity while accommodating private consultations, curated displays, and VIP clientele.',
        ],
      },
    ],
    facts: [
      { label: 'Project Name', value: 'Chhaganlal Fine Jewellery' },
      { label: 'Project Type', value: 'Jewellery Showroom' },
      { label: 'Location', value: 'Banjara Hills, Road No. 9' },
      { label: 'Area', value: '1,700 sq. ft.' },
    ],
  },

  {
    slug: 'the-modern-heirloom',
    category: 'residential',
    name: 'The Modern Heirloom',
    location: '',
    type: 'Private Residence',
    area: '',
    tagline:
      'A contemporary home shaped by family memories, Indian craftsmanship, and a love for colour.',
    images: ['/assets/images/b61.jpg', '/assets/images/b21.jpg', '/assets/images/a2.jpg'],
    chapters: [
      {
        num: '01',
        title: 'Project Brief',
        body: [
          'The home was envisioned as a reflection of its inhabitants and their stories, bringing together modern and traditional elements through furniture, décor, colours, and family heirlooms. The aim was to create timeless interiors with a distinctly Indian character, using as many Made-in-India elements as possible.',
        ],
      },
      {
        num: '02',
        title: 'Design Concept',
        body: [
          'The design evolved as a gradual transition between modern and traditional styles. Family heirlooms and memorable pieces were layered with contemporary elements, allowing the interiors to retain a sense of history while feeling relevant to the present.',
          'Green became the defining colour of the home. Initially an unexpected choice for the clients, it gradually became a dominant presence, bringing a sense of tranquillity, freshness, and generosity to the interiors.',
        ],
      },
      {
        num: '03',
        title: 'Spatial Planning',
        body: [
          'Each element was considered in relation to the overall composition of the space. Where doors appeared against bed backdrops, they were carefully camouflaged into the wall treatment, allowing them to become seamless with the surrounding décor.',
          'The planning and detailing were approached with the intention of creating an ideal home that felt personal, cohesive, and connected to the stories of the family.',
        ],
      },
      {
        num: '04',
        title: 'Material Palette',
        body: [
          'The interiors bring together traditional and contemporary furniture, décor, artefacts, and finishes. Family heirlooms and memorable pieces are integrated with modern elements, creating a layered material and visual language.',
          'Green forms the central colour story, complemented by carefully selected flooring, furnishings, and artefacts, with an emphasis on Indian-made elements throughout the home.',
        ],
      },
      {
        num: '05',
        title: 'Outcome',
        body: [
          'The result is a home that brings together generations through design. Contemporary elements sit alongside family heirlooms, while colour and carefully considered detailing give the interiors a distinct personality. The evolving presence of green becomes a defining thread, tying together a home built around memory, identity, and everyday living.',
        ],
      },
    ],
    facts: [
      { label: 'Project Name', value: 'The Modern Heirloom' },
      { label: 'Project Type', value: 'Private Residence' },
      { label: 'Location', value: '' },
      { label: 'Area', value: '' },
    ],
  },
];

export function getPastProject(slug: string): PastProject | undefined {
  return pastProjects.find((p) => p.slug === slug);
}
