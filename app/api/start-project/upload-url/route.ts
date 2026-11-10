import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { clientIp, cleanLine, requestHostAllowed } from '@/lib/forms';
import { isLimited, recordHit } from '@/lib/rate-limit';
import { MAX_PLAN_BYTES, PENDING_PREFIX, PLAN_EXTENSIONS, newPlanName } from '@/lib/plan-files';
import { createUploadTarget } from '@/lib/storage';

export const dynamic = 'force-dynamic';

const WINDOW_MS = 10 * 60_000;
const MAX_TICKETS = 10;

/**
 * Step 1 of attaching a plan to the Start a Project form: a short-lived address
 * the browser sends the file to directly (Vercel functions refuse request bodies
 * over 4.5 MB). Only the allowed kinds of file, up to 30 MB — the size cap is
 * enforced by Google Cloud Storage itself. The file is checked again, by its
 * contents, when the enquiry is submitted.
 */
export async function POST(req: NextRequest) {
  if (!requestHostAllowed(req.headers)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const limitKey = `plan-upload:${clientIp(req.headers)}`;
  if (await isLimited(limitKey, MAX_TICKETS, WINDOW_MS)) {
    return NextResponse.json({ error: 'Too many uploads from this connection. Please try again in a few minutes.' }, { status: 429, headers: { 'Retry-After': '600' } });
  }
  await recordHit(limitKey, WINDOW_MS);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const filename = cleanLine(body?.filename, 200);
  const ext = path.extname(filename).toLowerCase();
  const size = Number(body?.size);
  const rejection = NextResponse.json(
    { error: 'Please attach a PDF, JPG, PNG, DWG or DXF file of up to 30 MB.' },
    { status: 400 }
  );
  if (!(PLAN_EXTENSIONS as readonly string[]).includes(ext)) return rejection;
  if (!Number.isFinite(size) || size <= 0 || size > MAX_PLAN_BYTES) return rejection;

  const fileId = newPlanName(ext);
  const upload = await createUploadTarget({
    path: `${PENDING_PREFIX}${fileId}`,
    contentType: 'application/octet-stream',
    maxBytes: MAX_PLAN_BYTES,
  });

  return NextResponse.json({ fileId, upload });
}
