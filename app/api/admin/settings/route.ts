import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: 'default' },
    include: { logoDark: { include: { variants: true } }, logoLight: { include: { variants: true } }, ogImage: { include: { variants: true } } },
  });
  return NextResponse.json({ settings });
}

export async function PATCH(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const {
    siteName, email, phone, whatsapp, address, instagramUrl,
    mapLat, mapLng, metaTitle, metaDescription,
    logoDarkId, logoLightId, ogImageId,
  } = body;

  const settings = await prisma.siteSettings.upsert({
    where: { id: 'default' },
    update: {
      ...(siteName !== undefined && { siteName }),
      ...(email !== undefined && { email: email || null }),
      ...(phone !== undefined && { phone: phone || null }),
      ...(whatsapp !== undefined && { whatsapp: whatsapp || null }),
      ...(address !== undefined && { address: address || null }),
      ...(instagramUrl !== undefined && { instagramUrl: instagramUrl || null }),
      ...(mapLat !== undefined && { mapLat: mapLat !== null ? Number(mapLat) : null }),
      ...(mapLng !== undefined && { mapLng: mapLng !== null ? Number(mapLng) : null }),
      ...(metaTitle !== undefined && { metaTitle: metaTitle || null }),
      ...(metaDescription !== undefined && { metaDescription: metaDescription || null }),
      ...(logoDarkId !== undefined && { logoDarkId: logoDarkId || null }),
      ...(logoLightId !== undefined && { logoLightId: logoLightId || null }),
      ...(ogImageId !== undefined && { ogImageId: ogImageId || null }),
    },
    create: {
      id: 'default',
      siteName: siteName || 'F.QUAD',
      email, phone, whatsapp, address, instagramUrl,
      mapLat: mapLat !== null && mapLat !== undefined ? Number(mapLat) : null,
      mapLng: mapLng !== null && mapLng !== undefined ? Number(mapLng) : null,
      metaTitle, metaDescription, logoDarkId, logoLightId, ogImageId,
    },
    include: { logoDark: { include: { variants: true } }, logoLight: { include: { variants: true } }, ogImage: { include: { variants: true } } },
  });

  return NextResponse.json({ settings });
}