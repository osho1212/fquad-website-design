import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-guard';

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const settings = await prisma.siteSettings.findUnique({
    where: { id: 'default' },
    include: { ogImage: { include: { variants: true } } },
  });
  return NextResponse.json({ settings });
}

export async function PATCH(req: NextRequest) {
  const denied = await requireAdmin();
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

  if (typeof instagramUrl === 'string' && instagramUrl.trim() && !/^https?:\/\//i.test(instagramUrl.trim())) {
    return NextResponse.json({ error: 'The Instagram link must start with https://' }, { status: 400 });
  }

  const settings = await prisma.siteSettings.upsert({
    where: { id: 'default' },
    update: {
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
    },
    create: {
      id: 'default',
      email, phone, whatsapp, address, instagramUrl,
      mapLat: mapLat !== null && mapLat !== undefined ? Number(mapLat) : null,
      mapLng: mapLng !== null && mapLng !== undefined ? Number(mapLng) : null,
      metaTitle, metaDescription, ogImageId,
    },
    include: { ogImage: { include: { variants: true } } },
  });

  return NextResponse.json({ settings });
}
