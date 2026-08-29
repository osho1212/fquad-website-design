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

  // --- Site settings ---
  await prisma.siteSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
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

  // Page content is no longer seeded. Every editable string and image on the
  // site now has its shipped value declared in lib/cms/pages/*, and
  // lib/cms/content.ts merges saved rows over those defaults — so an empty
  // PageContent table renders the site exactly as it ships. Seeding rows here
  // would only pin stale copy that the CMS then has to fight.

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
