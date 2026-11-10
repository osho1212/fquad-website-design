import LoginForm from './LoginForm';
import { googleSignInConfig } from '@/lib/google-signin-config';

// Served fresh each time: whether the Google button shows depends on settings
// that can change without a rebuild.
export const dynamic = 'force-dynamic';

export default async function AdminLoginPage() {
  return <LoginForm google={await googleSignInConfig()} />;
}
