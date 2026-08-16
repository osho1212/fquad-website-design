import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // --- Admin user ---
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@fquad.com').toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || 'changeme123';

  const existingAdmin = await prisma.adminUser.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await prisma.adminUser.create({
      data: { email: adminEmail, passwordHash, name: 'F.QUAD Admin', role: 'SUPERADMIN' },
    });
    console.log(`Created admin user: ${adminEmail}`);
    if (!process.env.ADMIN_PASSWORD) {
      console.log('  (using default password "changeme123" — set ADMIN_PASSWORD env var to change)');
    }
  } else {
    console.log(`Admin user already exists: ${adminEmail}`);
  }

  // --- Categories ---
  const categories = [
    { name: 'Residential', slug: 'residential', order: 0 },
    { name: 'Commercial', slug: 'commercial', order: 1 },
    { name: 'Hospitality', slug: 'hospitality', order: 2 },
    { name: 'Landscape', slug: 'landscape', order: 3 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log(`Ensured ${categories.length} categories`);

  // --- Site settings ---
  await prisma.siteSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      siteName: 'F.QUAD',
      email: 'admin@fquad.com',
      whatsapp: '+919876543210',
      address: 'Hyderabad, Telangana, India',
      instagramUrl: 'https://instagram.com/fquadstudio',
      metaTitle: 'F.QUAD — Architecture & Interior Design Studio',
      metaDescription:
        'Architecture and interior design studio based in Hyderabad, working across homes, workplaces, and hospitality spaces.',
    },
  });
  console.log('Ensured site settings');

  // --- Page content defaults (mirrors current static preview pages) ---
  const pageContent: { page: string; section: string; data: object }[] = [
    {
      page: 'home',
      section: 'hero',
      data: {
        eyebrow: 'ARCHITECTURE · INTERIORS · HYDERABAD',
        title: 'Space is our medium.',
        subtitle: 'Considered design for homes, workplaces, and hospitality.',
        mediaId: null,
        mediaType: 'image',
      },
    },
    {
      page: 'home',
      section: 'stats',
      data: {
        items: [
          { number: '12+', label: 'YEARS' },
          { number: '80+', label: 'PROJECTS' },
          { number: '5', label: 'AWARDS' },
          { number: '3', label: 'CITIES' },
        ],
      },
    },
    {
      page: 'home',
      section: 'portfolio_intro',
      data: {
        eyebrow: 'PORTFOLIO',
        title: 'Selected works',
        lead: 'A glimpse into projects shaped by site, light, and material — each one considered from first sketch to final handover.',
      },
    },
    {
      page: 'home',
      section: 'services',
      data: {
        eyebrow: 'STUDIO',
        title: 'What we do',
        lead: 'From first concept to final handover — architecture, interiors, and everything between, under one roof.',
        items: [
          {
            icon: '◧',
            name: 'Architecture',
            description: 'Residential, commercial, and hospitality spaces designed around climate and context.',
          },
          {
            icon: '◨',
            name: 'Interior design',
            description: 'Material, light, and layout brought together with quiet precision.',
          },
          {
            icon: '◫',
            name: 'Landscape',
            description: 'Outdoor spaces that extend the architecture into its surroundings.',
          },
          {
            icon: '◩',
            name: 'Project management',
            description: 'Site supervision and contractor coordination from start to finish.',
          },
        ],
      },
    },
    {
      page: 'home',
      section: 'process',
      data: {
        eyebrow: 'PROCESS',
        title: 'How we work',
        steps: [
          { number: '01', name: 'Discovery', description: 'Site visits and conversations to understand how you live and work.' },
          { number: '02', name: 'Concept', description: 'Sketches, models, and material studies that bring the vision into focus.' },
          { number: '03', name: 'Development', description: 'Detailed drawings, approvals, and contractor coordination.' },
          { number: '04', name: 'Delivery', description: "On-site supervision through to handover — we don't disappear." },
        ],
      },
    },
    {
      page: 'home',
      section: 'testimonial',
      data: {
        quote:
          'FQuad understood the feeling we wanted before we had the words for it. The space has become part of how we work.',
        attribution: 'ROHAN MEHTA — FOUNDER, TERRACOTTA LOUNGE',
        mediaId: null,
      },
    },
    {
      page: 'home',
      section: 'cta',
      data: {
        heading: 'Start a conversation',
        text: 'Based in Hyderabad — working across Telangana and beyond.',
      },
    },
    {
      page: 'projects',
      section: 'banner',
      data: {
        eyebrow: 'OUR WORK',
        title: 'Projects',
        subtitle: 'A selection of homes, workplaces, and hospitality spaces — each shaped by site, light, and material.',
        mediaId: null,
        mediaType: 'image',
      },
    },
    {
      page: 'projects',
      section: 'cta',
      data: {
        heading: 'Have a project in mind?',
        text: "Let's talk through the brief, the site, and what's possible.",
      },
    },
  ];

  for (const pc of pageContent) {
    await prisma.pageContent.upsert({
      where: { page_section: { page: pc.page, section: pc.section } },
      update: {},
      create: { page: pc.page, section: pc.section, data: JSON.stringify(pc.data) },
    });
  }
  console.log(`Ensured ${pageContent.length} page content blocks`);

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
