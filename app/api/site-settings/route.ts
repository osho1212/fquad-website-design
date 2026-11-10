import { NextResponse } from 'next/server';
import { getSiteSettings } from '@/lib/public-content';

// Read per request: without this the settings are frozen at build time.
export const dynamic = 'force-dynamic';

export async function GET() {
  const settings = await getSiteSettings();
  return NextResponse.json({ settings });
}