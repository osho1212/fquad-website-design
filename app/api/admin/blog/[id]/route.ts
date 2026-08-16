import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { title, excerpt, body: postBody, mediaId, published, order, publishedAt } = body;

  const data: any = {};

  if (title !== undefined) data.title = title;
  if (excerpt !== undefined) data.excerpt = excerpt;
  if (postBody !== undefined) data.body = postBody;
  if (mediaId !== undefined) data.mediaId = mediaId;
  if (order !== undefined) data.order = order;

  if (published !== undefined) {
    data.published = published;

    if (published === true) {
      if (publishedAt !== undefined) {
        data.publishedAt = publishedAt ? new Date(publishedAt) : null;
      } else {
        const existingPost = await prisma.blogPost.findUnique({
          where: { id: params.id },
          select: { publishedAt: true },
        });
        if (!existingPost?.publishedAt) {
          data.publishedAt = new Date();
        }
      }
    }
  } else if (publishedAt !== undefined) {
    data.publishedAt = publishedAt ? new Date(publishedAt) : null;
  }

  const post = await prisma.blogPost.update({
    where: { id: params.id },
    data,
  });

  return NextResponse.json({ post });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.blogPost.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
