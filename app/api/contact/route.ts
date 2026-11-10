import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getResend, mailFrom, enquiryRecipient } from '@/lib/mail';
import { clientIp, cleanLine, cleanText, escapeHtml, escapeHtmlMultiline, isEmail, requestHostAllowed } from '@/lib/forms';
import { isLimited, recordHit } from '@/lib/rate-limit';

const WINDOW_MS = 10 * 60_000;
const MAX_SUBMISSIONS = 5;
const MAX_BODY_BYTES = 64 * 1024;

export async function POST(req: NextRequest) {
  if (!requestHostAllowed(req.headers)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const limitKey = `form:${clientIp(req.headers)}`;
  if (isLimited(limitKey, MAX_SUBMISSIONS, WINDOW_MS)) {
    return NextResponse.json(
      { error: 'Too many messages from this connection. Please try again in a few minutes.' },
      { status: 429, headers: { 'Retry-After': '600' } }
    );
  }
  recordHit(limitKey, WINDOW_MS);

  const declared = Number(req.headers.get('content-length') || 0);
  if (declared > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'Message is too large' }, { status: 413 });
  }

  try {
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const name = cleanLine(body?.name, 120);
    const email = cleanLine(body?.email, 254);
    const phone = cleanLine(body?.phone, 40);
    const message = cleanText(body?.message, 5000);
    const whatsapp = body?.whatsapp === true || body?.whatsapp === 'true';

    if (!name || !email || !phone || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (!isEmail(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }

    // Save the enquiry first — this is the durable record, independent of
    // whether email sending succeeds.
    await prisma.enquiry.create({
      data: { name, email, phone, message, whatsapp },
    });

    // Email sending is best-effort — log failures but don't fail the
    // request, since the enquiry is already safely stored.
    const resend = getResend();
    if (resend) {
      try {
        await resend.emails.send({
          from: mailFrom(),
          to: enquiryRecipient(),
          replyTo: email,
          subject: `New Enquiry: ${name}`,
          html: `<h2>${escapeHtml(name)}</h2><p><strong>Email:</strong> ${escapeHtml(email)}</p><p><strong>Phone:</strong> ${escapeHtml(phone)}</p><p><strong>Contact via:</strong> ${whatsapp ? 'WhatsApp' : 'Email'}</p><p><strong>Message:</strong></p><p>${escapeHtmlMultiline(message)}</p>`,
        });

        // The visitor chooses this address, so the reply carries nothing they
        // typed except their own name — it cannot be used to send arbitrary
        // text from the studio's domain.
        await resend.emails.send({
          from: mailFrom(),
          to: email,
          subject: 'We received your message — F.QUAD',
          html: `<p>Thank you, ${escapeHtml(name)}! We have received your message and will be in touch within 24 hours.</p><p style="color:#666;font-size:13px;">— F.QUAD Studio, Hyderabad</p>`,
        });
      } catch (emailError) {
        console.error('Email send failed (enquiry was still saved):', emailError);
      }
    } else {
      console.warn('RESEND_API_KEY not configured. Email notification skipped (enquiry saved to database).');
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Contact error:', error);
    return NextResponse.json({ error: 'Failed to submit enquiry' }, { status: 500 });
  }
}
