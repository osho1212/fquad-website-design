import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-guard';

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  await prisma.mediaFolder.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
