import { adminUsers } from './db';

export const ADMIN_ROLES = ['ADMIN', 'SUPERADMIN'] as const;
export type AdminRoleName = (typeof ADMIN_ROLES)[number];

type Account = Awaited<ReturnType<typeof adminUsers.all>>[number];

/** What the Admin Team page may see about an account: never the password hash. */
export function publicUser(u: Account) {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: (u.role === 'SUPERADMIN' ? 'SUPERADMIN' : 'ADMIN') as AdminRoleName,
    hasPassword: Boolean(u.passwordHash),
    lastLoginAt: u.lastLoginAt ? u.lastLoginAt.toISOString() : null,
    createdAt: u.createdAt ? u.createdAt.toISOString() : null,
  };
}

export const countSuperadmins = async () => (await adminUsers.all()).filter((u) => u.role === 'SUPERADMIN').length;
