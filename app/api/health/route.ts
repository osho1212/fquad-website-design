import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase';

// Never cached: an uptime monitor must see the live state, not a stored answer.
export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store' };

/**
 * Health check for uptime monitors. Answers 200 only when the app can reach
 * its database (Firestore), and 503 otherwise. It reveals nothing else.
 */
export async function GET() {
  try {
    await firestore().collection('_health').doc('ping').get();
    return NextResponse.json({ status: 'ok' }, { headers: NO_STORE });
  } catch {
    return NextResponse.json({ status: 'error' }, { status: 503, headers: NO_STORE });
  }
}
