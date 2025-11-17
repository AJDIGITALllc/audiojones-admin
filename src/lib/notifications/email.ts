// src/lib/notifications/email.ts

import { logInfo, logWarn } from '@/lib/log';

export interface EmailParams {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<void> {
  // For now, just log the email send attempt
  // Later this will call Resend/SendGrid/etc. using env vars
  logInfo('notifications/email/sendEmail', {
    to: params.to,
    subject: params.subject,
    provider: process.env.EMAIL_PROVIDER || 'none',
  });

  // Check for required env vars
  const internalEmail = process.env.NOTIFICATIONS_INTERNAL_EMAIL;
  if (!internalEmail) {
    logWarn('notifications/email/sendEmail', 
      'NOTIFICATIONS_INTERNAL_EMAIL env var not set - email not sent'
    );
    return;
  }

  // TODO: Actual email provider integration goes here
  // Example with Resend:
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // await resend.emails.send({ from: 'noreply@audiojones.com', ...params });
}
