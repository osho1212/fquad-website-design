import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uniqueSlug } from '@/lib/slugify';

export async function GET() {
  const posts = await prisma.blogPost.findMany({
    orderBy: { order: 'asc' },
    include: { media: { include: { variants: true } } },
  });
  return NextResponse.json({ posts });
}

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { title, body: postBody, excerpt, mediaId, published } = body;

  if (!title || typeof title !== 'string' || !title.trim()) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }
  if (!postBody || typeof postBody !== 'string' || !postBody.trim()) {
    return NextResponse.json({ error: 'Body is required' }, { status: 400 });
  }

  const existing = await prisma.blogPost.findMany({ select: { slug: true } });
  const slug = uniqueSlug(title, new Set(existing.map((p) => p.slug)));

  const maxOrder = await prisma.blogPost.aggregate({ _max: { order: true } });
  const order = (maxOrder._max.order ?? -1) + 1;

  const isPublished = published === true;
  const publishedAt = isPublished ? (body.publishedAt ? new Date(body.publishedAt) : new Date()) : null;

  const post = await prisma.blogPost.create({
    data: {
      title: title.trim(),
      slug,
      excerpt: excerpt && typeof excerpt === 'string' && excerpt.trim() ? excerpt.trim() : null,
      body: postBody,
      mediaId: mediaId && typeof mediaId === 'string' ? mediaId : null,
      published: isPublished,
      publishedAt,
      order,
    },
  });

  return NextResponse.json({ post }, { status: 201 });
}
