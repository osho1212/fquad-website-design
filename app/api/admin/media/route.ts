import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import os from 'os';
import path from 'path';
import { randomBytes } from 'crypto';
import { prisma } from '@/lib/prisma';
import { processImage, processVideo, deleteMediaFiles } from '@/lib/media';

export async function GET() {
  const media = await prisma.media.findMany({
    include: { variants: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ media });
}

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid upload' }, { status: 400 });
  }

  const file = formData.get('file');
  const alt = (formData.get('alt') as string | null) || null;
  const folderId = (formData.get('folderId') as string | null) || null;
  const isBackground = req.nextUrl.searchParams.get('bg') === '1';

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');

  if (!isImage && !isVideo) {
    return NextResponse.json(
      { error: 'Unsupported file type — please upload an image or video.' },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Create the row first so we have a stable ID to use as the folder name.
  const media = await prisma.media.create({
    data: {
      type: isImage ? 'IMAGE' : 'VIDEO',
      filename: file.name,
      path: '',
      alt,
      folderId,
    },
  });

  try {
    const result = isImage
      ? await processImage(buffer, media.id, isBackground)
      : await processVideoBuffer(buffer, media.id, file.name);

    const mainVariant = result.variants.find((v) => v.label === (isImage ? 'full' : 'compressed'));

    const updated = await prisma.media.update({
      where: { id: media.id },
      data: {
        width: result.width,
        height: result.height,
        duration: result.duration,
        path: mainVariant?.path || '',
        variants: {
          create: result.variants.map((v) => ({
            label: v.label,
            path: v.path,
            width: v.width,
            height: v.height,
            format: v.format,
          })),
        },
      },
      include: { variants: true },
    });

    return NextResponse.json({ media: updated }, { status: 201 });
  } catch (err) {
    console.error('Media processing failed:', err);
    await prisma.media.delete({ where: { id: media.id } }).catch(() => {});
    await deleteMediaFiles(media.id).catch(() => {});
    return NextResponse.json(
      { error: 'Failed to process file. Check the file is a valid image/video and try again.' },
      { status: 500 }
    );
  }
}

/** ffmpeg needs a real file path, so write the upload to a temp file first. */
async function processVideoBuffer(buffer: Buffer, mediaId: string, originalFilename: string) {
  const ext = path.extname(originalFilename) || '.mp4';
  const tempPath = path.join(os.tmpdir(), `fquad-upload-${mediaId}-${randomBytes(4).toString('hex')}${ext}`);
  await writeFile(tempPath, buffer);
  try {
    return await processVideo(tempPath, mediaId);
  } finally {
    await unlink(tempPath).catch(() => {});
  }
}