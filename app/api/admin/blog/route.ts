import { NextRequest, NextResponse } from 'next/server';
import { blogPosts } from '@/lib/db';
import { uniqueSlug } from '@/lib/slugify';
import { requireAdmin } from '@/lib/admin-guard';

export async function GET() {
  const denied = await requireAdmin({ superadmin: true });
  if (denied) return denied;

  return NextResponse.json({ posts: await blogPosts.list() });
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin({ superadmin: true });
  if (denied) return denied;

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

  const slug = uniqueSlug(title, new Set(await blogPosts.slugs()));

  const isPublished = published === true;
  const publishedAt = isPublished ? (body.publishedAt ? new Date(body.publishedAt) : new Date()) : null;

  const post = await blogPosts.create({
    title: title.trim(),
    slug,
    excerpt: excerpt && typeof excerpt === 'string' && excerpt.trim() ? excerpt.trim() : null,
    body: postBody,
    mediaId: mediaId && typeof mediaId === 'string' ? mediaId : null,
    published: isPublished,
    publishedAt,
  });

  return NextResponse.json({ post }, { status: 201 });
}
