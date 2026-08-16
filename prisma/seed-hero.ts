/**
 * seed-hero.ts
 * Seeds Media + HeroSlide records from the existing /public/uploads folders
 * so the local dev site shows hero images matching production.
 * Run with: DATABASE_URL="file:./dev.db" npx tsx prisma/seed-hero.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// All upload folder IDs that exist locally
const uploadDirs = [
  'cmqfba7120000ogoo7ws8m7x4',
  'cmqfbakyx0005ogoojt1e5m8s',
  'cmqgjzwwj0000md3ok1ynitja',
  'cmshdar9s0004zp2qdmwhortx',
  'cmshdbdlq000bzp2qepivrr29',
  'cmshdi32j000izp2qza6s6jla',
  'cmshdj28s000pzp2qjb3afit4',
  'cmshdjjk6000wzp2qdhmgwt87',
  'cmshdp0cs0013zp2q6v60aov8',
  'cmshdpm3g001azp2qhn4k7nv8',
  'cmshdq5zm001hzp2q6izrrj10',
  'cmshe434l001ozp2qmririy6t',
];

// Use first 5 as hero slides
const heroSlideIds = uploadDirs.slice(0, 5);

async function main() {
  console.log('Seeding Media records from existing uploads...');

  for (const id of uploadDirs) {
    // Check if variants already exist and delete them first
    await prisma.mediaVariant.deleteMany({ where: { mediaId: id } });

    // Upsert Media record (using the folder id as media id)
    await prisma.media.upsert({
      where: { id },
      update: {},
      create: {
        id,
        type: 'IMAGE',
        filename: `${id}.jpg`,
        path: `/uploads/${id}/full.jpg`,
        width: 1920,
        height: 1080,
        variants: {
          create: [
            { label: 'full', path: `/uploads/${id}/full.jpg`, format: 'jpg' },
            { label: 'full_webp', path: `/uploads/${id}/full.webp`, format: 'webp' },
            { label: 'medium', path: `/uploads/${id}/medium.jpg`, format: 'jpg' },
            { label: 'thumb', path: `/uploads/${id}/thumb.jpg`, format: 'jpg' },
          ],
        },
      },
    });
  }
  console.log(`Upserted ${uploadDirs.length} Media records`);

  // Clear existing hero slides then re-create
  await prisma.heroSlide.deleteMany({});

  for (let i = 0; i < heroSlideIds.length; i++) {
    const mediaId = heroSlideIds[i];
    await prisma.heroSlide.create({
      data: {
        mediaId,
        order: i,
        active: true,
      },
    });
  }
  console.log(`Created ${heroSlideIds.length} HeroSlide records`);
  console.log('Done! Refresh http://localhost:3002 to see the hero images.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
