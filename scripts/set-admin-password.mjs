/**
 * Sets (or creates) an admin account's password from the command line. Use it
 * to create the first admin on a new server, or to recover a lost password.
 *
 *   ADMIN_EMAIL=you@fquad.com ADMIN_PASSWORD='a-long-unique-password' npm run admin:password
 *
 * The password is read from the environment so it never appears in shell
 * history as a command argument, but do clear your history afterwards.
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const email = (process.env.ADMIN_EMAIL || '').toLowerCase().trim();
const password = process.env.ADMIN_PASSWORD || '';

if (!email || password.length < 12 || password.toLowerCase() === 'changeme123') {
  console.error('Set ADMIN_EMAIL and an ADMIN_PASSWORD of at least 12 characters (not "changeme123").');
  process.exit(1);
}

const prisma = new PrismaClient();
try {
  const passwordHash = await bcrypt.hash(password, 12);
  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    await prisma.adminUser.update({ where: { email }, data: { passwordHash } });
    console.log(`Password updated for ${email}`);
  } else {
    await prisma.adminUser.create({
      data: { email, passwordHash, name: 'F.QUAD Admin', role: 'SUPERADMIN' },
    });
    console.log(`Created SUPERADMIN ${email}`);
  }
} finally {
  await prisma.$disconnect();
}
