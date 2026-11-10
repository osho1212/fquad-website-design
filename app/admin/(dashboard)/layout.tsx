import { redirect } from 'next/navigation';
import { currentAdmin } from '@/lib/session-check';
import Sidebar from './components/Sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The session must still match the account as it is now: a changed password
  // or a deleted account ends it. The role comes from the same lookup.
  const session = await currentAdmin();

  if (!session) {
    redirect('/admin/login');
  }

  const role = session.role;

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