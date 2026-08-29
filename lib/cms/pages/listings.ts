// lib/cms/pages/listings.ts
// The portfolio index, plus the pages whose body is generated from database
// records (team, awards, testimonials, journal). For the record-driven pages
// only the surrounding wording is editable here — the records themselves have
// their own admin sections.

import type { PageDef } from '../types';

export const pastProjectsPage: PageDef = {
  key: 'past_projects',
  label: 'Past Projects',
  group: 'Pages',
  path: '/past-projects',
  icon: '▦',
  description: 'The portfolio index built from the past-projects showcase.',
  sections: [
    {
      key: 'hero',
      label: 'Hero',
      fields: [
        { key: 'eyebrow', label: 'Eyebrow', type: 'text', help: 'Use {count} to insert the number of projects, zero-padded.' },
        { key: 'title', label: 'Headline', type: 'text', half: true },
        { key: 'intro', label: 'Intro paragraph', type: 'textarea' },
      ],
      defaults: {
        eyebrow: 'SELECTED WORK · {count} PROJECTS',
        title: 'Past Projects',
        intro: 'A record of spaces we have planned, detailed and delivered — each one shaped by its brief, its site, and the people who use it.',
      },
    },
    {
      key: 'catalog',
      label: 'Project Catalogue',
      description:
        'The showcase behind this page, each project’s detail page, and the homepage accordion.',
      fields: [
        {
          key: 'items',
          label: 'Projects',
          type: 'list',
          itemLabel: 'Project',
          itemTitleKey: 'name',
          fields: [
            { key: 'name', label: 'Name', type: 'text', half: true },
            { key: 'slug', label: 'URL slug', type: 'text', half: true, help: 'Becomes /past-projects/<slug>. Changing it breaks existing links.' },
            { key: 'category', label: 'Category', type: 'text', half: true, help: 'Must match a category key above — residential or commercial.' },
            { key: 'type', label: 'Project type', type: 'text', half: true, help: 'Shown as the meta line and on the homepage accordion.' },
            { key: 'altName', label: 'Also known as', type: 'text', half: true, help: 'Optional second name, shown under the title.' },
            { key: 'location', label: 'Location', type: 'text', half: true },
            { key: 'area', label: 'Area', type: 'text', half: true },
            { key: 'tagline', label: 'Tagline', type: 'textarea', help: 'One-line summary used on the listing and the detail hero.' },
            { key: 'images', label: 'Gallery', type: 'images' },
            {
              key: 'chapters',
              label: 'Chapters',
              type: 'list',
              itemLabel: 'Chapter',
              itemTitleKey: 'title',
              fields: [
                { key: 'num', label: 'Number', type: 'text', half: true },
                { key: 'title', label: 'Title', type: 'text', half: true },
                { key: 'body', label: 'Paragraphs', type: 'paragraphs' },
              ],
            },
          ],
        },
      ],
      defaults: {
        items: [
          {
            "slug": "juice-salon",
            "category": "commercial",
            "name": "Juice Salon",
            "location": "",
            "type": "Unisex Salon & Spa",
            "area": "",
            "tagline": "A contemporary salon shaped by modern Spanish details, thoughtful planning, and a focus on comfort.",
            "images": [
              "/assets/images/a1.jpg",
              "/assets/images/b21.jpg",
              "/assets/images/b22.jpg"
            ],
            "chapters": [
              {
                "num": "01",
                "title": "Project Brief",
                "body": [
                  "The brief was to create a swanky and spacious unisex salon that felt tranquil, refined, and comfortable, while ensuring efficient space planning and maintenance-friendly detailing. The design needed to balance the functional requirements of a salon and spa with an experience that felt considered and inviting."
                ]
              },
              {
                "num": "02",
                "title": "Design Concept",
                "body": [
                  "The design draws inspiration from Spanish details interpreted through a contemporary lens. Arches, wall textures, flooring, display units, and other interior elements carry this influence throughout the salon.",
                  "Luxury and comfort formed the foundation of the design approach. The colour palette, lighting, mirrors, furniture, beauty rooms, and spa areas were carefully considered to create a calm yet sophisticated environment."
                ]
              },
              {
                "num": "03",
                "title": "Spatial Planning",
                "body": [
                  "The salon is organised across two floors, allowing the ground floor to operate independently during periods of lower footfall while the entire salon can function during busier hours.",
                  "The ground floor accommodates the reception and waiting area, hair-cutting stations, pedicure and nail bar, a beauty room, and staff rest area. The first floor includes an additional reception and waiting area, dedicated hair-wash and hair-spa areas, hair-cutting stations, massage and waxing rooms, a bridal beauty room, staff facilities, pantry, and toilets.",
                  "The planning allows different service zones to remain clearly defined while maintaining an efficient flow throughout the salon."
                ]
              },
              {
                "num": "04",
                "title": "Material Palette",
                "body": [
                  "Spanish-inspired vitrified tiles form the flooring, complemented by pearl-finish wall textures throughout the salon and golden-finish textures in the beauty rooms. The ceilings are finished in white plastic emulsion.",
                  "The staircase combines black leather-finish granite with MS railings and LED profile lighting integrated into the steps.",
                  "Gold-finished MS elements, mirrors, curved laminates, perforated MS sheets, and textured surfaces add detail and visual depth to the interiors."
                ]
              },
              {
                "num": "05",
                "title": "Outcome",
                "body": [
                  "The completed salon brings together contemporary luxury, comfort, and Spanish-inspired detailing within a carefully planned setting. Distinctive elements such as the flowing-hair ceiling, central styling station, multifunctional reception partition, Spanish arch-inspired display unit, and detailed bridal room give the salon a strong visual identity while supporting its day-to-day functions."
                ]
              }
            ]
          },
          {
            "slug": "jevar",
            "category": "commercial",
            "name": "Jevar",
            "location": "",
            "type": "Boutique Jewellery Showroom",
            "area": "1,600 sq. ft.",
            "tagline": "A jewellery showroom shaped by reclaimed heritage, craftsmanship, and a sense of grandeur.",
            "images": [
              "/assets/images/b23.jpg",
              "/assets/images/a2.jpg",
              "/assets/images/b25.jpg"
            ],
            "chapters": [
              {
                "num": "01",
                "title": "Project Brief",
                "body": [
                  "The 1,600 sq. ft. boutique jewellery showroom was designed to create a royal and grand experience for its customers while establishing a distinctive presence. The design is rooted in the concept of R3 — Reduce, Reuse and Recycle, with reclaimed architectural elements becoming an integral part of the showroom identity."
                ]
              },
              {
                "num": "02",
                "title": "Design Concept",
                "body": [
                  "The concept began with the selection of antique elements sourced from Jaipur, Rajasthan, Gujarat, and Ahmedabad. Old jharokhas, arches, pillars, windows, wooden templates, artwork, and artefacts were carefully selected, measured, refurbished, and reinterpreted within the showroom.",
                  "Rather than using these elements purely as decoration, they were transformed into display units, partitions, consoles, and architectural accents. The intention was to retain their original character while giving them a new role within a contemporary jewellery showroom."
                ]
              },
              {
                "num": "03",
                "title": "Spatial Planning",
                "body": [
                  "The double-height entrance creates an immediate sense of volume, framed by two feature walls incorporating reclaimed windows, wooden templates, antique artwork, and artefacts. Chandeliers add to the grandeur of the space.",
                  "The showroom is organised into four display areas, allowing four clients to be attended to at a time. Two display areas are located on the ground floor, including a dedicated VIP area separated using reclaimed pillars. The first floor accommodates two additional display areas along with the MD room, safe, pantry, and powder room.",
                  "A small open lift was introduced between the staircase well to connect the two floors. The first-floor railing combines reclaimed arches and pillars with laser-cut metal jali, continuing the heritage-inspired language throughout the space."
                ]
              },
              {
                "num": "04",
                "title": "Material Palette",
                "body": [
                  "Reclaimed architectural elements form the defining material language of the showroom. Antique arches, pillars, jharokhas, windows, reclaimed wood, old artwork, and artefacts are combined with designer sandstone, glass windows, customised carpets, mirrors, and laser-cut metal jali.",
                  "A century-old silver border inherited by the clients was repurposed as a frame for a mirror, adding a personal layer of history to the space. A colourful digitally printed wallpaper was introduced on the first-floor ceiling, while chandeliers add a sense of richness and grandeur."
                ]
              },
              {
                "num": "05",
                "title": "Outcome",
                "body": [
                  "The showroom brings together heritage elements and contemporary retail requirements through a carefully considered process of reuse and refurbishment. Reclaimed architectural pieces retain their original character while taking on new functions as part of the showroom displays, partitions, and detailing.",
                  "The result is a distinctive jewellery space where history, craftsmanship, and retail experience come together to create a strong sense of identity."
                ]
              }
            ]
          },
          {
            "slug": "after-hours",
            "category": "residential",
            "name": "After Hours",
            "altName": "Kings Party House",
            "location": "",
            "type": "Weekend Home / Private Residence",
            "area": "7,500 sq. ft.",
            "tagline": "A weekend home designed for luxury, entertaining, and an unmistakable sense of character.",
            "images": [
              "/assets/images/b49.jpg",
              "/assets/images/a3.jpg",
              "/assets/images/b61.jpg"
            ],
            "chapters": [
              {
                "num": "01",
                "title": "Project Brief",
                "body": [
                  "The brief was to create a 7,500 sq. ft. weekend home as a surprise gift for the client's younger brother. Conceived as a luxurious, flamboyant, and chic setting for hosting VIP gatherings, the home was designed to make a strong impression while responding to the surrounding farm landscape.",
                  "A defining aspect of the project was its timeline: the design was completed in one month and the project was executed in five months through meticulous planning and coordination."
                ]
              },
              {
                "num": "02",
                "title": "Design Concept",
                "body": [
                  "The interiors are built around a palette of brown, black, and grey, punctuated with vibrant accents. The design combines luxurious finishes with bold, unexpected elements that give the home its distinctive character.",
                  "From the expansive entrance and indoor landscaped nook to the red luxury car that becomes a bar on the first floor, the spaces are designed to create moments of surprise while maintaining a cohesive visual language."
                ]
              },
              {
                "num": "03",
                "title": "Spatial Planning",
                "body": [
                  "The main entrance opens into a luxurious drawing room with an indoor landscaped nook, while the TV unit discreetly screens the pantry and dining areas from the formal seating space. A 14-foot slab height was maintained to maximise the available height after air-conditioning services.",
                  "The master bedroom is positioned beside the swimming pool and opens directly towards it through a wall-to-wall sliding door. Its ensuite accommodates wardrobes, an island dresser, twin-basin counter, jacuzzi, shower, and WC cubicles.",
                  "The first floor is organised around a lounge and home theatre, with a red luxury car serving as the focal point and its bonnet functioning as a bar. A rolling counter on ceiling-mounted tracks adds flexibility to the lounge.",
                  "The upper level also includes two guest rooms, while the terrace houses the glass bedroom overlooking the surrounding farmland."
                ]
              },
              {
                "num": "04",
                "title": "Material Palette",
                "body": [
                  "The interiors are defined by a palette of brown, black, grey, and vibrant accents. The master ensuite combines black and white with touches of gold, while the first-floor guest rooms introduce grey, blue, and textured finishes.",
                  "The terrace bedroom uses glass extensively, with glass walls and a glass roof creating an open connection with the surrounding landscape. White and blue tones bring a Santorini-inspired character to the space."
                ]
              },
              {
                "num": "05",
                "title": "Outcome",
                "body": [
                  "Designed and delivered within an ambitious timeline, the weekend home combines luxury with a strong sense of personality. Its distinctive spaces — from the car-turned-bar and flexible lounge counter to the glass terrace bedroom — create an environment designed around entertaining, relaxation, and memorable experiences.",
                  "The completed home was warmly received by the clients, who were impressed by the final outcome."
                ]
              }
            ]
          },
          {
            "slug": "chhaganlal-fine-jewellery",
            "category": "commercial",
            "name": "Chhaganlal Fine Jewellery",
            "location": "Banjara Hills, Road No. 9",
            "type": "Jewellery Showroom",
            "area": "1,700 sq. ft.",
            "tagline": "A jewellery store shaped by precise planning, considered detailing, and strict Vastu requirements.",
            "images": [
              "/assets/images/b22.jpg",
              "/assets/images/b25.jpg",
              "/assets/images/a1.jpg"
            ],
            "chapters": [
              {
                "num": "01",
                "title": "Project Brief",
                "body": [
                  "This 1,700 sq. ft. store is a branch of a family-run jewellery business, designed to cater to HNI and VIP clientele, politicians, and families seeking customised and bridal jewellery. The brief called for a Vastu-compliant store with prescribed colours for specific spaces, minimal product display, and a dedicated setting for private bridal jewellery selections."
                ]
              },
              {
                "num": "02",
                "title": "Design Concept",
                "body": [
                  "The design approach focused on meeting the strict Vastu parameters while maintaining a refined retail environment. Prescribed colours were carefully incorporated into wallpapers, upholstery, and other interior elements without compromising the overall design.",
                  "A subtle palette of light oak veneer, peach and blue upholstery, peach-toned textured walls, and Italian marble creates a restrained backdrop for the jewellery."
                ]
              },
              {
                "num": "03",
                "title": "Spatial Planning",
                "body": [
                  "The entrance opens into a waiting area defined by inlay-patterned flooring and a mirrored ceiling. A glass partition with laser-cut copper film separates the waiting area from the display space while screening the counters from the main entrance.",
                  "The ground floor includes minimal display areas, movable PVD-coated back runners, display counters, a cabin, and an attached strong room. The first floor introduces a boutique-inspired setting with two distinct display areas — one with counters and another with sofa seating.",
                  "The MD room accommodates two MD chairs and sofa seating, while the accounts area, pantry, and powder room are discreetly positioned away from the common areas."
                ]
              },
              {
                "num": "04",
                "title": "Material Palette",
                "body": [
                  "The interiors combine light oak veneer with marble- and veneer-finished display counters. Italian marble flooring with selective inlay details forms the base, complemented by peach-toned textured walls and peach and blue upholstery.",
                  "Designer wallpapers from the Asian Paints Sabyasachi collection add a boutique character to the first floor. Gold metal fabrication and marble stone cladding extend the material language to the building elevation."
                ]
              },
              {
                "num": "05",
                "title": "Outcome",
                "body": [
                  "The store balances the functional requirements of a specialised jewellery business with the constraints of a strict Vastu brief. Careful planning, a restrained material palette, and selective detailing allow the space to maintain a refined identity while accommodating private consultations, curated displays, and VIP clientele."
                ]
              }
            ]
          },
          {
            "slug": "the-modern-heirloom",
            "category": "residential",
            "name": "The Modern Heirloom",
            "location": "",
            "type": "Private Residence",
            "area": "",
            "tagline": "A contemporary home shaped by family memories, Indian craftsmanship, and a love for colour.",
            "images": [
              "/assets/images/b61.jpg",
              "/assets/images/b21.jpg",
              "/assets/images/a2.jpg"
            ],
            "chapters": [
              {
                "num": "01",
                "title": "Project Brief",
                "body": [
                  "The home was envisioned as a reflection of its inhabitants and their stories, bringing together modern and traditional elements through furniture, décor, colours, and family heirlooms. The aim was to create timeless interiors with a distinctly Indian character, using as many Made-in-India elements as possible."
                ]
              },
              {
                "num": "02",
                "title": "Design Concept",
                "body": [
                  "The design evolved as a gradual transition between modern and traditional styles. Family heirlooms and memorable pieces were layered with contemporary elements, allowing the interiors to retain a sense of history while feeling relevant to the present.",
                  "Green became the defining colour of the home. Initially an unexpected choice for the clients, it gradually became a dominant presence, bringing a sense of tranquillity, freshness, and generosity to the interiors."
                ]
              },
              {
                "num": "03",
                "title": "Spatial Planning",
                "body": [
                  "Each element was considered in relation to the overall composition of the space. Where doors appeared against bed backdrops, they were carefully camouflaged into the wall treatment, allowing them to become seamless with the surrounding décor.",
                  "The planning and detailing were approached with the intention of creating an ideal home that felt personal, cohesive, and connected to the stories of the family."
                ]
              },
              {
                "num": "04",
                "title": "Material Palette",
                "body": [
                  "The interiors bring together traditional and contemporary furniture, décor, artefacts, and finishes. Family heirlooms and memorable pieces are integrated with modern elements, creating a layered material and visual language.",
                  "Green forms the central colour story, complemented by carefully selected flooring, furnishings, and artefacts, with an emphasis on Indian-made elements throughout the home."
                ]
              },
              {
                "num": "05",
                "title": "Outcome",
                "body": [
                  "The result is a home that brings together generations through design. Contemporary elements sit alongside family heirlooms, while colour and carefully considered detailing give the interiors a distinct personality. The evolving presence of green becomes a defining thread, tying together a home built around memory, identity, and everyday living."
                ]
              }
            ]
          },
          {
            "slug": "a-study-in-character",
            "category": "residential",
            "name": "A Study in Character",
            "altName": "Kakani Residence",
            "location": "",
            "type": "Residential Interior",
            "area": "",
            "tagline": "Exploring individuality through a layered design language.",
            "images": [
              "/assets/images/a2.jpg",
              "/assets/images/b23.jpg",
              "/assets/images/b49.jpg"
            ],
            "chapters": [
              {
                "num": "01",
                "title": "Project Brief",
                "body": [
                  "Designed as a home that reflects the Kakani family's personality, the project brings together aesthetics, functionality, and personal expression. Every space is thoughtfully composed to create a living environment that feels elegant, welcoming, and deeply individual."
                ]
              },
              {
                "num": "02",
                "title": "Design Concept",
                "body": [
                  "The design explores the relationship between contemporary sophistication and classical charm. A layered mix of colours, textures, bespoke elements, and carefully curated details creates interiors that feel expressive while remaining cohesive. Rather than following a single design language, the home embraces multiple influences to create a distinct identity."
                ]
              },
              {
                "num": "03",
                "title": "Spatial Planning",
                "body": [
                  "The residence is planned to support both everyday living and social gatherings. Private spaces offer comfort and quiet, while the common areas encourage interaction and connection. The transition between spaces is seamless, allowing each room to retain its own character while contributing to the overall composition."
                ]
              },
              {
                "num": "04",
                "title": "Material Palette",
                "body": [
                  "Luxurious materials and handcrafted details define the interiors. Bespoke furniture, artisanal accents, custom wall treatments, intricate railings, and curated décor are layered with thoughtfully selected colours to create spaces that are rich in character and timeless in appeal."
                ]
              },
              {
                "num": "05",
                "title": "Outcome",
                "body": [
                  "The result is a residence that balances luxury with functionality while celebrating individuality through design. Every space reflects the family's vision, creating a home that is expressive, inviting, and designed to stand the test of time."
                ]
              }
            ]
          },
          {
            "slug": "between-generations",
            "category": "residential",
            "name": "Between Generations",
            "altName": "Dinesh Residence",
            "location": "",
            "type": "Residence",
            "area": "5,000 sq. ft.",
            "tagline": "A contemporary residence designed for multi-generational living.",
            "images": [
              "/assets/images/a3.jpg",
              "/assets/images/b22.jpg",
              "/assets/images/b61.jpg"
            ],
            "chapters": [
              {
                "num": "01",
                "title": "Project Brief",
                "body": [
                  "Designed for a multi-generational family, this 5,000 sq. ft. bungalow is envisioned as a contemporary home that balances functionality with warmth. The project creates a shared environment where every family member enjoys a sense of togetherness while maintaining their own private retreat."
                ]
              },
              {
                "num": "02",
                "title": "Design Concept",
                "body": [
                  "The design is centred on harmony, fluidity, and personalization. Contemporary aesthetics are paired with practical planning, while open layouts, natural light, and carefully considered material choices shape a home that feels both refined and welcoming."
                ]
              },
              {
                "num": "03",
                "title": "Spatial Planning",
                "body": [
                  "The layout encourages interaction without compromising privacy. The living and dining areas form the social heart of the home, while each bedroom is thoughtfully tailored to its occupant. The master suite embraces understated luxury, the children's rooms are designed to evolve with changing needs, and the parents' room offers a calm and comfortable retreat."
                ]
              },
              {
                "num": "04",
                "title": "Material Palette",
                "body": [
                  "A neutral palette enriched with earthy tones, metallic accents, and handcrafted details forms the foundation of the interiors. Italian marble, natural textured stone, wood, wicker partitions, textured wall finishes, fabrics, artistic elements, and custom-designed furniture come together to create spaces with a timeless character."
                ]
              },
              {
                "num": "05",
                "title": "Outcome",
                "body": [
                  "The residence brings together thoughtful planning, natural materials, and refined detailing to create a home that responds to the evolving needs of a modern multi-generational family. Every space is designed to balance comfort, functionality, and lasting elegance."
                ]
              }
            ]
          },
          {
            "slug": "the-veneer-edit",
            "category": "commercial",
            "name": "The Veneer Edit",
            "altName": "Kulture",
            "location": "",
            "type": "Exhibition Pavilion",
            "area": "",
            "tagline": "An immersive exhibition exploring the expressive potential of veneer.",
            "images": [
              "/assets/images/a1.jpg",
              "/assets/images/b25.jpg",
              "/assets/images/b21.jpg"
            ],
            "chapters": [
              {
                "num": "01",
                "title": "Project Brief",
                "body": [
                  "THE KULTURE PAVILION is conceived as an immersive exhibition space that reimagines veneer as more than a surface finish. Designed as a walkthrough experience, the pavilion showcases the material's versatility, craftsmanship, and ability to shape spatial experiences through thoughtfully curated displays."
                ]
              },
              {
                "num": "02",
                "title": "Design Concept",
                "body": [
                  "The pavilion is composed of a series of sculptural pods, each presenting a distinct expression of veneer. From textured patterns and intricate marquetry to earthy finishes and vibrant tones, every installation highlights the material's visual, tactile, and emotional qualities. Together, the pods create a narrative that celebrates the depth and diversity of veneer."
                ]
              },
              {
                "num": "03",
                "title": "Spatial Planning",
                "body": [
                  "Planned as an intuitive walkthrough, the organically flowing layout encourages visitors to explore the pavilion at their own pace. Each pod functions as an individual experience, inviting designers, architects, and visitors to engage with the material through a sequence of immersive spatial moments rather than a prescribed route."
                ]
              },
              {
                "num": "04",
                "title": "Material Palette",
                "body": [
                  "A curated selection of veneer finishes forms the foundation of the installation, ranging from textured surfaces and bold marquetry to natural grains and vibrant tones. The restrained material palette allows craftsmanship, detail, and texture to take centre stage throughout the exhibition."
                ]
              },
              {
                "num": "05",
                "title": "Outcome",
                "body": [
                  "The pavilion transforms veneer into an expressive design medium, demonstrating its potential across residential, retail, and hospitality environments. Through spatial storytelling and material exploration, the installation offers an engaging experience that inspires new perspectives on veneer."
                ]
              }
            ]
          }
        ],
      },
    },
    {
      key: 'groups',
      label: 'Category Headings',
      description: 'The subheading above each group of projects.',
      fields: [
        {
          key: 'items',
          label: 'Categories',
          type: 'list',
          itemLabel: 'Category',
          itemTitleKey: 'label',
          max: 6,
          fields: [
            { key: 'id', label: 'Category key', type: 'text', half: true, help: 'Must match the category on the project records: residential or commercial.' },
            { key: 'label', label: 'Heading', type: 'text', half: true },
          ],
        },
        { key: 'countSingular', label: 'Count label, singular', type: 'text', half: true },
        { key: 'countPlural', label: 'Count label, plural', type: 'text', half: true },
        { key: 'exploreLabel', label: 'Project link label', type: 'text', half: true, help: 'The link under each project that opens its detail page.' },
      ],
      defaults: {
        items: [
          { id: 'residential', label: 'Residential' },
          { id: 'commercial', label: 'Commercial' },
        ],
        countSingular: 'Project',
        countPlural: 'Projects',
        exploreLabel: 'Explore Project',
      },
    },
    {
      key: 'cta',
      label: 'Closing Banner',
      description: 'The band at the bottom of the portfolio listing.',
      fields: [
        { key: 'heading', label: 'Heading', type: 'textarea' },
        { key: 'body', label: 'Supporting paragraph', type: 'textarea' },
        { key: 'contactLabel', label: 'Secondary button', type: 'text', half: true },
        { key: 'contactHref', label: 'Secondary button link', type: 'url', half: true },
        { key: 'ctaLabel', label: 'Primary button', type: 'text', half: true, help: 'Opens the Start A Project form.' },
      ],
      defaults: {
        heading: 'Looking to elevate the aesthetic of your space?',
        body: "Have a question for us? Let's talk. For all project enquiries, write to us with a note about your space and what you have in mind.",
        contactLabel: 'Contact Us',
        contactHref: '/contact',
        ctaLabel: 'START A PROJECT →',
      },
    },
    {
      key: 'detail',
      label: 'Project Detail Pages',
      description: 'Shared labels reused on every /past-projects/<slug> page.',
      fields: [
        { key: 'backLabel', label: 'Back link', type: 'text', half: true },
        { key: 'altNamePrefix', label: 'Alternate-name prefix', type: 'text', half: true },
        { key: 'typeLabel', label: 'Type fact label', type: 'text', half: true },
        { key: 'areaLabel', label: 'Area fact label', type: 'text', half: true },
        { key: 'locationLabel', label: 'Location fact label', type: 'text', half: true },
        { key: 'prevLabel', label: 'Previous link', type: 'text', half: true },
        { key: 'nextLabel', label: 'Next link', type: 'text', half: true },
        { key: 'ctaHeading', label: 'Closing heading', type: 'textarea' },
        { key: 'ctaPrimaryLabel', label: 'Outline button', type: 'text', half: true },
        { key: 'ctaSecondaryLabel', label: 'Primary button', type: 'text', half: true },
      ],
      defaults: {
        backLabel: '← All Projects',
        altNamePrefix: 'also known as',
        typeLabel: 'Project Type',
        areaLabel: 'Area',
        locationLabel: 'Location',
        prevLabel: '← Previous',
        nextLabel: 'Next →',
        ctaHeading: 'Looking to elevate the aesthetic of your space?',
        ctaPrimaryLabel: 'All Projects',
        ctaSecondaryLabel: 'START A PROJECT →',
      },
    },
  ],
};

export const teamPage: PageDef = {
  key: 'team',
  label: 'Team',
  group: 'Pages',
  path: '/team',
  icon: '◉',
  description: 'The people page. Members are managed under People & Proof → Team.',
  sections: [
    {
      key: 'hero',
      label: 'Hero',
      fields: [
        { key: 'eyebrow', label: 'Eyebrow', type: 'text', half: true },
        { key: 'title', label: 'Headline', type: 'text', half: true },
        { key: 'emptyState', label: 'Empty state', type: 'text', help: 'Shown when no team members are published.' },
      ],
      defaults: {
        eyebrow: 'THE PEOPLE',
        title: 'Designed by human hands',
        emptyState: 'Meet the team — coming soon',
      },
    },
  ],
};

export const awardsPage: PageDef = {
  key: 'awards',
  label: 'Awards',
  group: 'Pages',
  path: '/awards',
  icon: '✦',
  description: 'The recognition timeline. Entries are managed under People & Proof → Awards.',
  sections: [
    {
      key: 'hero',
      label: 'Hero',
      fields: [
        { key: 'eyebrow', label: 'Eyebrow', type: 'text', half: true },
        { key: 'title', label: 'Headline', type: 'text', half: true },
        { key: 'emptyState', label: 'Empty state', type: 'text' },
      ],
      defaults: {
        eyebrow: 'RECOGNITION',
        title: 'Work that speaks for itself',
        emptyState: 'Awards & recognition coming soon',
      },
    },
  ],
};

export const testimonialsPage: PageDef = {
  key: 'testimonials',
  label: 'Testimonials',
  group: 'Pages',
  path: '/testimonials',
  icon: '❝',
  description: 'The client-words page. Quotes are managed under People & Proof → Testimonials.',
  sections: [
    {
      key: 'hero',
      label: 'Hero',
      fields: [
        { key: 'eyebrow', label: 'Eyebrow', type: 'text', half: true },
        { key: 'title', label: 'Headline', type: 'text', half: true },
        { key: 'emptyState', label: 'Empty state', type: 'text' },
      ],
      defaults: {
        eyebrow: 'CLIENT WORDS',
        title: 'Spaces they call home',
        emptyState: 'Testimonials coming soon',
      },
    },
  ],
};

export const blogPage: PageDef = {
  key: 'blog',
  label: 'Journal',
  group: 'Pages',
  path: '/blog',
  icon: '✎',
  description: 'The journal index. Articles are managed under Content → Journal.',
  sections: [
    {
      key: 'hero',
      label: 'Hero',
      fields: [
        { key: 'eyebrow', label: 'Eyebrow', type: 'text', half: true },
        { key: 'title', label: 'Headline', type: 'text', half: true },
        { key: 'emptyState', label: 'Empty state', type: 'text' },
      ],
      defaults: {
        eyebrow: 'JOURNAL',
        title: 'Thoughts on space',
        emptyState: 'Articles coming soon',
      },
    },
  ],
};
