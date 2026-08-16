import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySessionToken, SESSION_COOKIE_NAME } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Sidebar from './components/Sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
    redirect('/admin/login');
  }

  // Fetch the user's role from the database
  const user = await prisma.adminUser.findUnique({
    where: { id: session.userId },
    select: { role: true },
  });

  const role = user?.role || 'ADMIN';

  return (
    <div
      className="admin-root"
      style={{
        display: 'flex',
        minHeight: '100vh',
        margin: 0,
      }}
    >
      <Sidebar email={session.email} role={role} />
      <main style={{ flex: 1, padding: 40, background: '#F8F8F6' }}>{children}</main>
    </div>
  );
}