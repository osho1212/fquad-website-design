import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-guard';

export async function DELETE(_req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const denied = await requireAdmin();
  if (denied) return denied;

  await prisma.mediaFolder.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
