import { NextRequest, NextResponse } from 'next/server';
import { siteSettings } from '@/lib/db';
import { isSafeHref } from '@/lib/forms';
import { requireAdmin } from '@/lib/admin-guard';

export async function GET() {
  const denied = await requireAdmin({ superadmin: true });
  if (denied) return denied;

  return NextResponse.json({ settings: await siteSettings.get() });
}

export async function PATCH(req: NextRequest) {
  const denied = await requireAdmin({ superadmin: true });
  if (denied) return denied;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const {
    email, phone, whatsapp, address, instagramUrl,
    mapLat, mapLng, metaTitle, metaDescription, ogImageId,
  } = body;

  if (typeof instagramUrl === 'string' && instagramUrl.trim() && (!/^https?:\/\//i.test(instagramUrl.trim()) || !isSafeHref(instagramUrl))) {
    return NextResponse.json({ error: 'The Instagram link must start with https://' }, { status: 400 });
  }

  // Only the fields that were sent change; empty text clears a field.
  const patch = {
    ...(email !== undefined && { email: email || null }),
    ...(phone !== undefined && { phone: phone || null }),
    ...(whatsapp !== undefined && { whatsapp: whatsapp || null }),
    ...(address !== undefined && { address: address || null }),
    ...(instagramUrl !== undefined && { instagramUrl: instagramUrl || null }),
    ...(mapLat !== undefined && { mapLat: mapLat !== null ? Number(mapLat) : null }),
    ...(mapLng !== undefined && { mapLng: mapLng !== null ? Number(mapLng) : null }),
    ...(metaTitle !== undefined && { metaTitle: metaTitle || null }),
    ...(metaDescription !== undefined && { metaDescription: metaDescription || null }),
    ...(ogImageId !== undefined && { ogImageId: ogImageId || null }),
  };

  const settings = await siteSettings.upsert(patch);

  return NextResponse.json({ settings });
}
