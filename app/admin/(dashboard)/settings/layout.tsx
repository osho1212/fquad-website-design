import { requireSection } from '@/lib/admin-page-guard';

// An ADMIN may not open this section: typing its address sends them back to
// Enquiries. Who may open what lives in lib/admin-roles.ts.
export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  await requireSection('settings');
  return <>{children}</>;
}
