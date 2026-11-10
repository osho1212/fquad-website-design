import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-guard';

export const dynamic = 'force-dynamic';

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const enquiries = await prisma.enquiry.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ enquiries });
}