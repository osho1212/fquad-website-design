import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uniqueSlug } from '@/lib/slugify';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      category: true,
      mainCategory: true,
      coverMedia: { include: { variants: true } },
      gallery: { include: { media: { include: { variants: true } } }, orderBy: { order: 'asc' } },
      testimonials: { include: { media: { include: { variants: true } } } },
    },
  });

  if (!project) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ project });
}

interface TestimonialInput {
  clientName: string;
  clientAddress?: string | null;
  testimonialText: string;
  mediaId?: string | null;
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  const existingProject = await prisma.project.findUnique({ where: { id } });
  if (!existingProject) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

 const {
   title, categoryId, mainCategoryId, subCategory, location, mapLat, mapLng, showLocation, year,
   clientName, clientAddress, shortDescription, description, coverMediaId, featured, published, status,
   galleryItems, order, hasInteriors, hasArchitecture, linkedProjectId, testimonial,
 } = body;
  if (title !== undefined && (!title || !String(title).trim())) {
    return NextResponse.json({ error: 'Title cannot be empty' }, { status: 400 });
  }

  let slug = existingProject.slug;
  if (title && title.trim() !== existingProject.title) {
    const others = await prisma.project.findMany({
      where: { id: { not: id } },
      select: { slug: true },
    });
    slug = uniqueSlug(title, new Set(others.map((p) => p.slug)));
  }

  // Replace the gallery wholesale if provided — simplest correct way to
  // handle add/remove/reorder in one request.
  if (Array.isArray(galleryItems)) {
    await prisma.projectMedia.deleteMany({ where: { projectId: id } });
  }

  // Replace the testimonial wholesale too, when the field is present in the payload.
  if (testimonial !== undefined) {
    await prisma.projectTestimonial.deleteMany({ where: { projectId: id } });
  }

  const project = await prisma.project.update({
    where: { id },
    data: {
      ...(title !== undefined && { title: title.trim(), slug }),
      ...(categoryId !== undefined && { categoryId }),
      ...(mainCategoryId !== undefined && { mainCategoryId: mainCategoryId || null }),
      ...(subCategory !== undefined && { subCategory: subCategory || null }),
      ...(location !== undefined && { location: location || null }),
      ...(mapLat !== undefined && { mapLat: mapLat !== null ? Number(mapLat) : null }),
      ...(mapLng !== undefined && { mapLng: mapLng !== null ? Number(mapLng) : null }),
      ...(showLocation !== undefined && { showLocation: !!showLocation }),
      ...(year !== undefined && { year: year ? Number(year) : null }),
      ...(clientName !== undefined && { clientName: clientName || null }),
      ...(clientAddress !== undefined && { clientAddress: clientAddress || null }),
      ...(shortDescription !== undefined && { shortDescription: shortDescription || null }),
      ...(description !== undefined && { description: description || null }),
      ...(coverMediaId !== undefined && { coverMediaId: coverMediaId || null }),
      ...(featured !== undefined && { featured: !!featured }),
      ...(published !== undefined && { published: !!published }),
      ...(status !== undefined && { status }),
      ...(order !== undefined && { order: Number(order) }),
      ...(hasInteriors !== undefined && { hasInteriors: !!hasInteriors }),
      ...(hasArchitecture !== undefined && { hasArchitecture: !!hasArchitecture }),
      ...(linkedProjectId !== undefined && { linkedProjectId: linkedProjectId || null }),
      ...(Array.isArray(galleryItems) && {
        gallery: {
          create: galleryItems.map((g: { mediaId: string; areaLabel?: string | null; order?: number }, i: number) => ({
            mediaId: g.mediaId,
            areaLabel: g.areaLabel || null,
            order: g.order ?? i,
          })),
        },
      }),
      ...(testimonial !== undefined && testimonial !== null && {
        testimonials: {
          create: [
            {
              clientName: (testimonial as TestimonialInput).clientName,
              clientAddress: (testimonial as TestimonialInput).clientAddress || null,
              testimonialText: (testimonial as TestimonialInput).testimonialText,
              mediaId: (testimonial as TestimonialInput).mediaId || null,
            },
          ],
        },
      }),
    },
    include: {
      category: true,
      mainCategory: true,
      coverMedia: { include: { variants: true } },
      gallery: { include: { media: { include: { variants: true } } }, orderBy: { order: 'asc' } },
      testimonials: { include: { media: { include: { variants: true } } } },
    },
  });

  return NextResponse.json({ project });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({ where: { id: params.id } });
  if (!project) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await prisma.project.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}