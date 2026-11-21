import { NextRequest, NextResponse } from 'next/server';
import { siteSettings } from '@/lib/db';
import { isSafeHref } from '@/lib/forms';
import { requireAdmin } from '@/lib/admin-guard';
import { WATERMARK_DEFAULTS, WATERMARK_LIMITS } from '@/lib/watermark.mjs';

export async function GET() {
  const denied = await requireAdmin({ superadmin: true });
  if (denied) return denied;

  // The watermark defaults travel with the settings so the editor's two boxes
  // can show what an unset value actually does.
  return NextResponse.json({
    settings: await siteSettings.get(),
    watermarkDefaults: WATERMARK_DEFAULTS,
    watermarkLimits: WATERMARK_LIMITS,
  });
}

/**
 * A watermark box: a number inside its allowed range, or null to go back to
 * the default. Anything else is rejected rather than silently clamped, so a
 * mistyped value cannot quietly change every future upload.
 *
 * A box that was not sent at all is not a mistyped one. Only the fields
 * present in the body are applied, so an editor saving their phone number
 * sends no watermark values and must not be turned away: `undefined` means
 * "leave it alone", while null or empty text means "put it back to the
 * default". Both return null here; what separates them is whether the key
 * reaches the patch below.
 */
function watermarkNumber(
  value: unknown,
  limits: { min: number; max: number },
  label: string
): { ok: true; value: number | null } | { ok: false; error: string } {
  if (value === undefined || value === null || value === '') return { ok: true, value: null };
  const number = Number(value);
  if (!Number.isFinite(number)) return { ok: false, error: `${label} must be a number.` };
  if (number < limits.min || number > limits.max) {
    // Said as percentages, which is how the editor types them.
    const percent = (n: number) => `${Math.round(n * 1000) / 10}%`;
    return { ok: false, error: `${label} must be between ${percent(limits.min)} and ${percent(limits.max)}.` };
  }
  return { ok: true, value: number };
}

export async function PATCH(req: NextRequest) {
  const denied = await requireAdmin({ superadmin: true });
  if (denied) return denied;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const {
    email, phone, whatsapp, address, instagramUrl,
    mapLat, mapLng, metaTitle, metaDescription, ogImageId,
    watermarkOpacity, watermarkScale,
  } = body;

  const opacity = watermarkNumber(watermarkOpacity, WATERMARK_LIMITS.opacity, 'Watermark strength');
  if (!opacity.ok) return NextResponse.json({ error: opacity.error }, { status: 400 });
  const scale = watermarkNumber(watermarkScale, WATERMARK_LIMITS.scale, 'Watermark size');
  if (!scale.ok) return NextResponse.json({ error: scale.error }, { status: 400 });

  if (typeof instagramUrl === 'string' && instagramUrl.trim() && (!/^https?:\/\//i.test(instagramUrl.trim()) || !isSafeHref(instagramUrl))) {
    return NextResponse.json({ error: 'The Instagram link must start with https://' }, { status: 400 });
  }

  // Only the fields that were sent change; empty text clears a field.
  const patch = {
    ...(email !== undefined && { email: email || null }),
    ...(phone !== undefined && { phone: phone || null }),
    ...(whatsapp !== undefined && { whatsapp: whatsapp || null }),
    ...(address !== undefined && { address: address || null }),
    ...(instagramUrl !== undefined && { instagramUrl: instagramUrl || null }),
    ...(mapLat !== undefined && { mapLat: mapLat !== null ? Number(mapLat) : null }),
    ...(mapLng !== undefined && { mapLng: mapLng !== null ? Number(mapLng) : null }),
    ...(metaTitle !== undefined && { metaTitle: metaTitle || null }),
    ...(metaDescription !== undefined && { metaDescription: metaDescription || null }),
    ...(ogImageId !== undefined && { ogImageId: ogImageId || null }),
    ...(watermarkOpacity !== undefined && { watermarkOpacity: opacity.value }),
    ...(watermarkScale !== undefined && { watermarkScale: scale.value }),
  };

  const settings = await siteSettings.upsert(patch);

  return NextResponse.json({ settings });
}
