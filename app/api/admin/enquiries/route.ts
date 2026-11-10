import { NextResponse } from 'next/server';
import { enquiries } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-guard';

export const dynamic = 'force-dynamic';

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  return NextResponse.json({ enquiries: await enquiries.list() });
}
