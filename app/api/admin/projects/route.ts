import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uniqueSlug } from '@/lib/slugify';

export async function GET(req: NextRequest) {
  const mainCategorySlug = req.nextUrl.searchParams.get('mainCategory');
  const projects = await prisma.project.findMany({
    where: mainCategorySlug ? { mainCategory: { slug: mainCategorySlug } } : undefined,
    include: {
      category: true,
      mainCategory: true,
      coverMedia: { include: { variants: true } },
      gallery: { include: { media: { include: { variants: true } } }, orderBy: { order: 'asc' } },
    },
    orderBy: { order: 'asc' },
  });
  return NextResponse.json({ projects });
}

interface TestimonialInput {
  clientName: string;
  clientAddress?: string | null;
  testimonialText: string;
  mediaId?: string | null;
}

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

const {
  title, categoryId, mainCategoryId, subCategory, location, mapLat, mapLng, showLocation, year,
  clientName, clientAddress, shortDescription, description, coverMediaId, featured, published, status,
  galleryItems, hasInteriors, hasArchitecture, linkedProjectId, testimonial,
} = body;

  if (!title || typeof title !== 'string' || !title.trim()) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }
  if (!categoryId) {
    return NextResponse.json({ error: 'Category is required' }, { status: 400 });
  }

  const existing = await prisma.project.findMany({ select: { slug: true } });
  const slug = uniqueSlug(title, new Set(existing.map((p: any) => p.slug)));

  const maxOrder = await prisma.project.aggregate({ _max: { order: true } });
  const order = (maxOrder._max.order ?? -1) + 1;

  const project = await prisma.project.create({
    data: {
      title: title.trim(),
      slug,
      categoryId,
      mainCategoryId: mainCategoryId || null,
      subCategory: subCategory || null,
      location: location || null,
      mapLat: mapLat !== undefined && mapLat !== null ? Number(mapLat) : null,
      mapLng: mapLng !== undefined && mapLng !== null ? Number(mapLng) : null,
      showLocation: !!showLocation,
      year: year ? Number(year) : null,
      clientName: clientName || null,
      clientAddress: clientAddress || null,
      shortDescription: shortDescription || null,
      description: description || null,
      coverMediaId: coverMediaId || null,
      featured: !!featured,
      published: published !== false,
      status: status || 'PUBLISHED',
      order,
      hasInteriors: !!hasInteriors,
      hasArchitecture: !!hasArchitecture,
      linkedProjectId: linkedProjectId || null,
      gallery: Array.isArray(galleryItems)
        ? {
            create: galleryItems.map((g: { mediaId: string; areaLabel?: string | null; order?: number }, i: number) => ({
              mediaId: g.mediaId,
              areaLabel: g.areaLabel || null,
              order: g.order ?? i,
            })),
          }
        : undefined,
      testimonials: testimonial
        ? {
            create: [
              {
                clientName: (testimonial as TestimonialInput).clientName,
                clientAddress: (testimonial as TestimonialInput).clientAddress || null,
                testimonialText: (testimonial as TestimonialInput).testimonialText,
                mediaId: (testimonial as TestimonialInput).mediaId || null,
              },
            ],
          }
        : undefined,
    },
    include: {
      category: true,
      mainCategory: true,
      coverMedia: { include: { variants: true } },
      gallery: { include: { media: { include: { variants: true } } }, orderBy: { order: 'asc' } },
      testimonials: { include: { media: { include: { variants: true } } } },
    },
  });

  return NextResponse.json({ project }, { status: 201 });
}