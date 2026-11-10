import { NextRequest, NextResponse } from 'next/server';
import { blogPosts, NotFoundError } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-guard';

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const denied = await requireAdmin({ superadmin: true });
  if (denied) return denied;

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
        const existingPost = await blogPosts.get(params.id);
        if (!existingPost?.publishedAt) {
          data.publishedAt = new Date();
        }
      }
    }
  } else if (publishedAt !== undefined) {
    data.publishedAt = publishedAt ? new Date(publishedAt) : null;
  }

  try {
    const post = await blogPosts.update(params.id, data);
    return NextResponse.json({ post });
  } catch (err) {
    if (err instanceof NotFoundError) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    throw err;
  }
}

export async function DELETE(_req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const denied = await requireAdmin({ superadmin: true });
  if (denied) return denied;

  await blogPosts.remove(params.id);
  return NextResponse.json({ success: true });
}
