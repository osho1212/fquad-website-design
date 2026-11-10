import { NextRequest, NextResponse } from 'next/server';
import { mediaFolders } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-guard';

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  return NextResponse.json({ folders: await mediaFolders.list() });
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { name } = body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const folder = await mediaFolders.create(name.trim());

  return NextResponse.json({ folder }, { status: 201 });
}
