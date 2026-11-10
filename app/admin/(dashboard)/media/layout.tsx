import { requireSection } from '@/lib/admin-page-guard';

// An ADMIN may not open this section: typing its address sends them back to
// Enquiries. Who may open what lives in lib/admin-roles.ts.
export default async function MediaLayout({ children }: { children: React.ReactNode }) {
  await requireSection('media');
  return <>{children}</>;
}
