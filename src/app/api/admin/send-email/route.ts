import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { requireAuth } from '@/lib/supabase/auth';

const ADMIN_EMAIL = 'alexanderpulido10@gmail.com';
const resend = new Resend(process.env.RESEND_API_KEY);

interface Recipient {
  email: string;
  name: string | null;
}

function buildEmailHtml(recipientName: string | null, subject: string, content: string) {
  const greeting = recipientName ? `Hi ${recipientName},` : 'Hi there,';
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
    <img src="https://getinvita.com/getinvitalogo.png" alt="GetInvita" style="height:36px;width:auto;margin-bottom:28px;" />
    <h2 style="font-size:20px;font-weight:600;color:#111827;margin:0 0 16px;">${subject}</h2>
    <p style="font-size:15px;color:#374151;margin:0 0 16px;line-height:1.6;">${greeting}</p>
    <div style="font-size:15px;line-height:1.7;color:#374151;">
      ${content.replace(/\n/g, '<br>')}
    </div>
    <p style="margin-top:28px;font-size:15px;color:#374151;line-height:1.6;">Best,<br>The GetInvita Team</p>
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0 16px;" />
    <p style="font-size:12px;color:#9ca3af;margin:0;">
      <a href="https://getinvita.com" style="color:#7c3aed;text-decoration:none;">getinvita.com</a> — Beautiful Event Websites
    </p>
  </div>
</body>
</html>`;
}

export async function POST(request: NextRequest) {
  try {
    const { user } = await requireAuth();
    if (user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { subject, body, recipients } = await request.json();

    if (!subject || !body || !recipients?.length) {
      return NextResponse.json(
        { error: 'Subject, body, and recipients are required' },
        { status: 400 }
      );
    }

    const results: { email: string; id: string | undefined }[] = [];
    const errors: { email: string; error: string }[] = [];

    // Send individually for personalization (helps avoid Promotions tab)
    for (let i = 0; i < recipients.length; i += 10) {
      const batch = recipients.slice(i, i + 10);
      const promises = batch.map(async (recipient: Recipient) => {
        try {
          const html = buildEmailHtml(recipient.name, subject, body);
          const { data, error } = await resend.emails.send({
            from: 'GetInvita <hello@getinvita.com>',
            to: recipient.email,
            subject,
            html,
          });
          if (error) {
            errors.push({ email: recipient.email, error: error.message });
          } else {
            results.push({ email: recipient.email, id: data?.id });
          }
        } catch (err) {
          errors.push({ email: recipient.email, error: String(err) });
        }
      });
      await Promise.all(promises);
    }

    return NextResponse.json({
      sent: results.length,
      failed: errors.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
