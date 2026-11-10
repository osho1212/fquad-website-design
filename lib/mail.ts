import { Resend } from 'resend';

let client: Resend | null | undefined;

/** The Resend client, or null when RESEND_API_KEY is not configured. */
export function getResend(): Resend | null {
  if (client === undefined) {
    client = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
  }
  return client;
}

/**
 * Sender and recipient come from the environment so the studio can change
 * them without a code change. The sender's domain must be verified in Resend
 * (SPF + DKIM records), or Resend rejects every send.
 */
export function mailFrom(): string {
  return process.env.MAIL_FROM || 'F.QUAD Studio <contact@fquad.com>';
}

export function enquiryRecipient(): string {
  return process.env.ENQUIRY_TO || 'admin@fquad.com';
}
