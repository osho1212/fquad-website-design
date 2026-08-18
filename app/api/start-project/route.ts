import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { randomBytes } from 'crypto';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req: NextRequest) {
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
      name = String(formData.get('name') || '').trim();
      email = String(formData.get('email') || '').trim();
      phone = String(formData.get('phone') || '').trim();
      whatsapp = formData.get('whatsapp') === 'true' || formData.get('whatsapp') === '1';
      projectType = String(formData.get('projectType') || '').trim();
      sftArea = String(formData.get('sftArea') || '').trim();
      location = String(formData.get('location') || '').trim();
      stage = String(formData.get('stage') || '').trim();
      timeline = String(formData.get('timeline') || '').trim();
      budget = String(formData.get('budget') || '').trim();
      notes = String(formData.get('notes') || '').trim();

      const file = formData.get('planFile');
      if (file && file instanceof File && file.size > 0) {
        planFileName = file.name;
        const ext = path.extname(file.name).toLowerCase();
        const safeBase = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
        const rand = randomBytes(4).toString('hex');
        const savedName = `plan_${Date.now()}_${rand}_${safeBase}${ext}`;
        
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'plans');
        await mkdir(uploadsDir, { recursive: true });
        
        const fullDiskPath = path.join(uploadsDir, savedName);
        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(fullDiskPath, buffer);
        planFilePath = `/uploads/plans/${savedName}`;
      }
    } else {
      const body = await req.json();
      name = String(body.name || '').trim();
      email = String(body.email || '').trim();
      phone = String(body.phone || '').trim();
      whatsapp = Boolean(body.whatsapp);
      projectType = String(body.projectType || '').trim();
      sftArea = String(body.sftArea || '').trim();
      location = String(body.location || '').trim();
      stage = String(body.stage || '').trim();
      timeline = String(body.timeline || '').trim();
      budget = String(body.budget || '').trim();
      notes = String(body.notes || '').trim();
    }

    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: 'Name, email, and phone number are required.' },
        { status: 400 }
      );
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
    if (resend) {
      try {
        await resend.emails.send({
          from: 'contact@fquad.com',
          to: 'admin@fquad.com',
          subject: `✨ New Project Brief: ${name} — ${projectType || 'Architecture'} (${location || 'General'})`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; color: #111;">
              <h2 style="color: #000; border-bottom: 2px solid #000; padding-bottom: 8px;">New Project Brief Received</h2>
              <p><strong>Client:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Phone:</strong> ${phone} ${whatsapp ? '(Prefers WhatsApp)' : ''}</p>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 16px 0;" />
              <h3>Project Details:</h3>
              <ul style="line-height: 1.8;">
                <li><strong>Type of Project:</strong> ${projectType || 'N/A'}</li>
                <li><strong>Sft. Area:</strong> ${sftArea || 'N/A'}</li>
                <li><strong>Location:</strong> ${location || 'N/A'}</li>
                <li><strong>Stage:</strong> ${stage || 'N/A'}</li>
                <li><strong>Timeline:</strong> ${timeline || 'N/A'}</li>
                <li><strong>Budget:</strong> ${budget || 'N/A'}</li>
                ${planFileName ? `<li><strong>Plan Attachment:</strong> ${planFileName}</li>` : ''}
              </ul>
              ${notes ? `<p><strong>Notes:</strong><br>${notes.replace(/\n/g, '<br>')}</p>` : ''}
            </div>
          `,
        });

        // Confirmation email to client
        await resend.emails.send({
          from: 'contact@fquad.com',
          to: email,
          subject: 'We received your project brief — F.QUAD Studio',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; color: #111;">
              <h2 style="color: #000;">Thank you for reaching out, ${name}!</h2>
              <p>We have received your project brief for <strong>${projectType || 'your space'}</strong> in <strong>${location || 'Hyderabad'}</strong>.</p>
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
