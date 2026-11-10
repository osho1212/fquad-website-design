import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { enquiries } from '@/lib/db';
import { getResend, mailFrom, enquiryRecipient } from '@/lib/mail';
import { clientIp, cleanLine, cleanText, escapeHtml, escapeHtmlMultiline, isEmail, requestHostAllowed } from '@/lib/forms';
import { isLimited, recordHit } from '@/lib/rate-limit';
import { MAX_PLAN_BYTES, PENDING_PREFIX, PLAN_FILE_ROUTE, PLAN_PREFIX, isSafePlanName, looksLikePlan } from '@/lib/plan-files';
import { deleteObject, moveObject, readHead, statObject } from '@/lib/storage';

export const dynamic = 'force-dynamic';

const WINDOW_MS = 10 * 60_000;
const MAX_SUBMISSIONS = 5;
const MAX_BODY_BYTES = 64 * 1024;

// A submission that filled the hidden honeypot field came from a bot. Answer
// as if it worked, so the bot learns nothing, but save and send nothing.
const botSuccess = () => NextResponse.json({ success: true }, { status: 201 });

export async function POST(req: NextRequest) {
  if (!requestHostAllowed(req.headers)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const limitKey = `form:${clientIp(req.headers)}`;
  if (await isLimited(limitKey, MAX_SUBMISSIONS, WINDOW_MS)) {
    return NextResponse.json(
      { error: 'Too many submissions from this connection. Please try again in a few minutes.' },
      { status: 429, headers: { 'Retry-After': '600' } }
    );
  }
  await recordHit(limitKey, WINDOW_MS);

  // The form sends text only. A plan goes straight to storage first (see
  // upload-url) and is named here.
  const declared = Number(req.headers.get('content-length') || 0);
  if (declared > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'That submission is too large.' }, { status: 413 });
  }

  try {
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    if (cleanText(body?.fq_hp_url, 200)) return botSuccess();

    const name = cleanLine(body?.name, 120);
    const email = cleanLine(body?.email, 254);
    const phone = cleanLine(body?.phone, 40);
    const whatsapp = body?.whatsapp === true || body?.whatsapp === 'true';
    const projectType = cleanLine(body?.projectType, 120);
    const sftArea = cleanLine(body?.sftArea, 60);
    const location = cleanLine(body?.location, 160);
    const stage = cleanLine(body?.stage, 120);
    const timeline = cleanLine(body?.timeline, 120);
    const budget = cleanLine(body?.budget, 120);
    const notes = cleanText(body?.notes, 5000);

    if (!name || !email || !phone) {
      return NextResponse.json({ error: 'Name, email, and phone number are required.' }, { status: 400 });
    }
    if (!isEmail(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    // A plan the visitor sent to storage: check what it really is, then keep it.
    let planFileName: string | null = null;
    let planFilePath: string | null = null;
    const planFileId = typeof body?.planFileId === 'string' ? body.planFileId : '';
    if (planFileId) {
      const rejection = NextResponse.json(
        { error: 'Please attach a PDF, JPG, PNG, DWG or DXF file of up to 30 MB.' },
        { status: 400 }
      );
      if (!isSafePlanName(planFileId)) return rejection;

      const pending = `${PENDING_PREFIX}${planFileId}`;
      const info = await statObject(pending);
      if (!info) {
        return NextResponse.json({ error: 'The attached file did not arrive. Please attach it again.' }, { status: 400 });
      }
      const ext = path.extname(planFileId).toLowerCase();
      if (info.size > MAX_PLAN_BYTES || !looksLikePlan(await readHead(pending, 4096), ext)) {
        await deleteObject(pending);
        return rejection;
      }
      await moveObject(pending, `${PLAN_PREFIX}${planFileId}`);
      planFileName = cleanLine(body?.planFileName, 120) || 'plan';
      planFilePath = `${PLAN_FILE_ROUTE}/${planFileId}`;
    }

    // Build structured message for persistence
    const messageLines = [
      '=== START A PROJECT BRIEF ===',
      `• Project Type: ${projectType || 'Not specified'}`,
      `• Sft. Area: ${sftArea || 'Not specified'}`,
      `• Location: ${location || 'Not specified'}`,
      `• Stage: ${stage || 'Not specified'}`,
      `• Timeline: ${timeline || 'Not specified'}`,
      `• Budget: ${budget || 'Not specified'}`,
    ];

    if (planFileName) {
      messageLines.push(`• Uploaded Plan: ${planFileName} (${planFilePath || 'saved'})`);
    }

    if (notes) {
      messageLines.push(`\n• Additional Notes:\n${notes}`);
    }

    const enquiry = await enquiries.create({
      name,
      email,
      phone,
      message: messageLines.join('\n'),
      whatsapp,
    });

    // Optional notification email via Resend
    const resend = getResend();
    if (resend) {
      try {
        await resend.emails.send({
          from: mailFrom(),
          to: enquiryRecipient(),
          replyTo: email,
          subject: `New Project Brief: ${name} — ${projectType || 'Architecture'} (${location || 'General'})`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; color: #111;">
              <h2 style="color: #000; border-bottom: 2px solid #000; padding-bottom: 8px;">New Project Brief Received</h2>
              <p><strong>Client:</strong> ${escapeHtml(name)}</p>
              <p><strong>Email:</strong> ${escapeHtml(email)}</p>
              <p><strong>Phone:</strong> ${escapeHtml(phone)} ${whatsapp ? '(Prefers WhatsApp)' : ''}</p>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 16px 0;" />
              <h3>Project Details:</h3>
              <ul style="line-height: 1.8;">
                <li><strong>Type of Project:</strong> ${escapeHtml(projectType || 'N/A')}</li>
                <li><strong>Sft. Area:</strong> ${escapeHtml(sftArea || 'N/A')}</li>
                <li><strong>Location:</strong> ${escapeHtml(location || 'N/A')}</li>
                <li><strong>Stage:</strong> ${escapeHtml(stage || 'N/A')}</li>
                <li><strong>Timeline:</strong> ${escapeHtml(timeline || 'N/A')}</li>
                <li><strong>Budget:</strong> ${escapeHtml(budget || 'N/A')}</li>
                ${planFileName ? `<li><strong>Plan attached:</strong> ${escapeHtml(planFileName)} (download it from Admin → Enquiries)</li>` : ''}
              </ul>
              ${notes ? `<p><strong>Notes:</strong><br>${escapeHtmlMultiline(notes)}</p>` : ''}
            </div>
          `,
        });

        // Confirmation email to client. The visitor picks this address, so it
        // repeats nothing they typed except their own name.
        await resend.emails.send({
          from: mailFrom(),
          to: email,
          subject: 'We received your project brief — F.QUAD Studio',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; color: #111;">
              <h2 style="color: #000;">Thank you for reaching out, ${escapeHtml(name)}!</h2>
              <p>We have received your project brief.</p>
              <p>Our principal design team will review your specifications and reach out within 24–48 hours to schedule an initial design consultation.</p>
              <br/>
              <p style="color: #666; font-size: 13px;">— F.QUAD Studio<br/>Hyderabad, Telangana, India</p>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error('Email send failed (brief was still saved):', emailErr);
      }
    }

    return NextResponse.json({ success: true, enquiryId: enquiry.id }, { status: 201 });
  } catch (error) {
    console.error('Error submitting start-project form:', error);
    return NextResponse.json(
      { error: 'An error occurred while submitting your brief. Please try again or contact us directly.' },
      { status: 500 }
    );
  }
}
