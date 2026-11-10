import LoginForm from './LoginForm';
import { googleSignInConfig } from '@/lib/google-signin-config';

// Served fresh each time: whether the Google button shows depends on settings
// that can change in Vercel without a rebuild.
export const dynamic = 'force-dynamic';

export default function AdminLoginPage() {
  return <LoginForm google={googleSignInConfig()} />;
}
