import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, message, whatsapp } = await req.json();

    if (!name || !email || !phone || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Save the enquiry first — this is the durable record, independent of
    // whether email sending succeeds.
    await prisma.enquiry.create({
      data: { name, email, phone, message, whatsapp: !!whatsapp },
    });

    // Email sending is best-effort — log failures but don't fail the
    // request, since the enquiry is already safely stored.
    if (resend) {
      try {
        await resend.emails.send({
          from: 'contact@fquad.com',
          to: 'admin@fquad.com',
          subject: `New Enquiry: ${name}`,
          html: `<h2>${name}</h2><p><strong>Email:</strong> ${email}</p><p><strong>Phone:</strong> ${phone}</p><p><strong>Contact via:</strong> ${whatsapp ? 'WhatsApp' : 'Email'}</p><p><strong>Message:</strong></p><p>${message.replace(/\n/g, '<br>')}</p>`,
        });

        await resend.emails.send({
          from: 'contact@fquad.com',
          to: email,
          subject: 'We received your message — F.QUAD',
          html: `<p>Thank you, ${name}! We'll be in touch within 24 hours.</p><p>Your message:</p><p>${message.replace(/\n/g, '<br>')}</p>`,
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
    return NextResponse.json(
      { error: 'Failed to submit enquiry' },
      { status: 500 }
    );
  }
}