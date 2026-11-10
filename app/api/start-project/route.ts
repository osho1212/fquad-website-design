import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { getResend, mailFrom, enquiryRecipient } from '@/lib/mail';
import { clientIp, cleanLine, cleanText, escapeHtml, escapeHtmlMultiline, isEmail, requestHostAllowed } from '@/lib/forms';
import { isLimited, recordHit } from '@/lib/rate-limit';
import { MAX_PLAN_BYTES, PLAN_DIR, PLAN_EXTENSIONS, PLAN_FILE_ROUTE, looksLikePlan, newPlanName } from '@/lib/plan-files';

const WINDOW_MS = 10 * 60_000;
const MAX_SUBMISSIONS = 5;
// A 30 MB plan plus the form's text fields.
const MAX_REQUEST_BYTES = MAX_PLAN_BYTES + 1024 * 1024;

// A submission that filled the hidden honeypot field came from a bot. Answer
// as if it worked, so the bot learns nothing, but save and send nothing.
const botSuccess = () => NextResponse.json({ success: true }, { status: 201 });

export async function POST(req: NextRequest) {
  if (!requestHostAllowed(req.headers)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const limitKey = `form:${clientIp(req.headers)}`;
  if (isLimited(limitKey, MAX_SUBMISSIONS, WINDOW_MS)) {
    return NextResponse.json(
      { error: 'Too many submissions from this connection. Please try again in a few minutes.' },
      { status: 429, headers: { 'Retry-After': '600' } }
    );
  }
  recordHit(limitKey, WINDOW_MS);

  const declared = Number(req.headers.get('content-length') || 0);
  if (declared > MAX_REQUEST_BYTES) {
    return NextResponse.json({ error: 'That upload is too large (30 MB maximum).' }, { status: 413 });
  }

  try {
    let name = '';
    let email = '';
    let phone = '';
    let whatsapp = false;
    let projectType = '';
    let sftArea = '';
    let location = '';
    let stage = '';
    let timeline = '';
    let budget = '';
    let notes = '';
    let planFileName: string | null = null;
    let planFilePath: string | null = null;

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      if (cleanText(formData.get('fq_hp_url'), 200)) return botSuccess();
      name = cleanLine(formData.get('name'), 120);
      email = cleanLine(formData.get('email'), 254);
      phone = cleanLine(formData.get('phone'), 40);
      whatsapp = formData.get('whatsapp') === 'true' || formData.get('whatsapp') === '1';
      projectType = cleanLine(formData.get('projectType'), 120);
      sftArea = cleanLine(formData.get('sftArea'), 60);
      location = cleanLine(formData.get('location'), 160);
      stage = cleanLine(formData.get('stage'), 120);
      timeline = cleanLine(formData.get('timeline'), 120);
      budget = cleanLine(formData.get('budget'), 120);
      notes = cleanText(formData.get('notes'), 5000);

      const file = formData.get('planFile');
      if (file && file instanceof File && file.size > 0) {
        const ext = path.extname(file.name).toLowerCase();
        const rejection = NextResponse.json(
          { error: 'Please attach a PDF, JPG, PNG, DWG or DXF file of up to 30 MB.' },
          { status: 400 }
        );
        if (!(PLAN_EXTENSIONS as readonly string[]).includes(ext) || file.size > MAX_PLAN_BYTES) {
          return rejection;
        }
        const buffer = Buffer.from(await file.arrayBuffer());
        if (!looksLikePlan(buffer, ext)) {
          return rejection;
        }

        // Stored outside public/ under a random name; only the original name
        // (as text) is kept for the admin to read.
        const savedName = newPlanName(ext);
        await mkdir(PLAN_DIR, { recursive: true });
        await writeFile(path.join(PLAN_DIR, savedName), buffer);
        planFileName = cleanLine(file.name, 120) || 'plan';
        planFilePath = `${PLAN_FILE_ROUTE}/${savedName}`;
      }
    } else {
      let body: Record<string, unknown>;
      try {
        body = await req.json();
      } catch {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
      }
      if (cleanText(body?.fq_hp_url, 200)) return botSuccess();
      name = cleanLine(body?.name, 120);
      email = cleanLine(body?.email, 254);
      phone = cleanLine(body?.phone, 40);
      whatsapp = body?.whatsapp === true || body?.whatsapp === 'true';
      projectType = cleanLine(body?.projectType, 120);
      sftArea = cleanLine(body?.sftArea, 60);
      location = cleanLine(body?.location, 160);
      stage = cleanLine(body?.stage, 120);
      timeline = cleanLine(body?.timeline, 120);
      budget = cleanLine(body?.budget, 120);
      notes = cleanText(body?.notes, 5000);
    }

    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: 'Name, email, and phone number are required.' },
        { status: 400 }
      );
    }
    if (!isEmail(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
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

    const fullMessage = messageLines.join('\n');

    // Save to database
    const enquiry = await prisma.enquiry.create({
      data: {
        name,
        email,
        phone,
        message: fullMessage,
        whatsapp,
      },
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
