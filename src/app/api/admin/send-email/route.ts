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
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;-webkit-font-smoothing:antialiased;">
  <div style="max-width:600px;margin:0 auto;">
    <!-- Header -->
    <div style="background-color:#18181b;padding:24px 32px;text-align:center;">
      <img src="https://getinvita.com/getinvitalogo.png" alt="GetInvita" style="height:32px;width:auto;filter:brightness(0) invert(1);" />
    </div>
    <!-- Content -->
    <div style="background-color:#ffffff;padding:36px 32px;">
      <h2 style="font-size:21px;font-weight:700;color:#18181b;margin:0 0 20px;letter-spacing:-0.3px;">${subject}</h2>
      <p style="font-size:15px;color:#3f3f46;margin:0 0 16px;line-height:1.6;">${greeting}</p>
      <div style="font-size:15px;line-height:1.75;color:#3f3f46;">
        ${content.replace(/\n/g, '<br>')}
      </div>
      <p style="margin-top:32px;font-size:15px;color:#3f3f46;line-height:1.6;">Best,<br><span style="font-weight:600;">The GetInvita Team</span></p>
    </div>
    <!-- Footer -->
    <div style="background-color:#fafafa;padding:20px 32px;border-top:1px solid #e4e4e7;text-align:center;">
      <p style="font-size:13px;color:#a1a1aa;margin:0;">
        <a href="https://getinvita.com" style="color:#7c3aed;text-decoration:none;font-weight:500;">getinvita.com</a>
        <span style="margin:0 6px;color:#d4d4d8;">·</span>
        Beautiful Event Websites
      </p>
    </div>
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
