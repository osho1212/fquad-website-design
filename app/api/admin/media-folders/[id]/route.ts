import { NextRequest, NextResponse } from 'next/server';
import { mediaFolders } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-guard';

export async function DELETE(_req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const denied = await requireAdmin({ superadmin: true });
  if (denied) return denied;

  await mediaFolders.remove(params.id);
  return NextResponse.json({ success: true });
}
