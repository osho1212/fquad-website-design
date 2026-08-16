import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const mainCategories = await prisma.mainCategory.findMany({ orderBy: { order: 'asc' } });
  return NextResponse.json({ mainCategories });
}
