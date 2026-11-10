import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { requireAdmin } from '@/lib/admin-guard';
import { PLAN_DIR, isSafePlanName } from '@/lib/plan-files';

export const dynamic = 'force-dynamic';

/**
 * Hands a visitor's uploaded plan to a logged-in admin — always as a download,
 * never displayed in the browser, so even a disguised file cannot run as part
 * of the site.
 */
export async function GET(_req: NextRequest, props: { params: Promise<{ name: string }> }) {
  const params = await props.params;
  const denied = await requireAdmin();
  if (denied) return denied;

  if (!isSafePlanName(params.name)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  let data: Buffer;
  try {
    data = await readFile(path.join(PLAN_DIR, params.name));
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(data), {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${params.name}"`,
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'private, no-store',
    },
  });
}
