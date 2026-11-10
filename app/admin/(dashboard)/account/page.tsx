import { adminUsers } from '@/lib/db';
import { currentAdmin } from '@/lib/session-check';
import PasswordForm from './PasswordForm';

export default async function AccountPage() {
  const session = await currentAdmin();
  const user = session ? await adminUsers.findById(session.userId) : null;

  // A teammate who signs in with Google has no password to change.
  if (user && !user.passwordHash) {
    return (
      <div style={{ maxWidth: 480 }}>
        <h1 style={{ fontSize: 28, marginBottom: 8 }}>Account</h1>
        <p style={{ color: '#7A7870', fontSize: 15, marginBottom: 12, lineHeight: 1.7 }}>
          You sign in with Google as <strong style={{ color: '#0D0D0D' }}>{user.email}</strong>, so there is no password
          to manage here. Who can sign in is managed by a SUPERADMIN under Admin Team.
        </p>
      </div>
    );
  }

  return <PasswordForm />;
}
