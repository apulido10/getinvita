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
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#f0f0f0;">
  <div style="max-width:600px;margin:0 auto;padding:24px 16px;">
    <!-- Card -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;">
      <!-- Purple Header with Logo -->
      <tr>
        <td style="padding:0;text-align:center;">
          <img src="https://getinvita.com/getinvitalogo-email.png" alt="GetInvita" style="width:100%;max-width:600px;height:auto;display:block;" />
        </td>
      </tr>
      <!-- Body -->
      <tr>
        <td style="padding:32px 36px 40px;">
          <h2 style="font-size:22px;font-weight:700;color:#1a1a1a;margin:0 0 20px;">${subject}</h2>
          <p style="font-size:15px;color:#333333;margin:0 0 16px;line-height:1.6;">${greeting}</p>
          <div style="font-size:15px;line-height:1.75;color:#333333;">
            ${content.replace(/\n/g, '<br>')}
          </div>
          <p style="margin:32px 0 0;font-size:15px;color:#333333;line-height:1.6;">Best,<br><strong>The GetInvita Team</strong></p>
        </td>
      </tr>
      <!-- Footer -->
      <tr>
        <td style="padding:16px 36px 20px;border-top:1px solid #eeeeee;">
          <p style="font-size:12px;color:#999999;margin:0;text-align:center;">
            <a href="https://getinvita.com" style="color:#7c3aed;text-decoration:none;font-weight:500;">getinvita.com</a>
            &nbsp;&middot;&nbsp; Beautiful Event Websites
          </p>
        </td>
      </tr>
    </table>
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
