import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Never cached: an uptime monitor must see the live state, not a stored answer.
export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store' };

/**
 * Health check for uptime monitors. The home page is served from a cache, so
 * it keeps loading even when the database is gone; this one answers 200 only
 * when the app can actually read its database, and 503 otherwise. It reveals
 * nothing else.
 */
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: 'ok' }, { headers: NO_STORE });
  } catch {
    return NextResponse.json({ status: 'error' }, { status: 503, headers: NO_STORE });
  }
}
