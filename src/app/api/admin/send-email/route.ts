import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { requireAuth } from '@/lib/supabase/auth';

const ADMIN_EMAIL = 'alexanderpulido10@gmail.com';
const resend = new Resend(process.env.RESEND_API_KEY);

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

    // Send in batches of 10 to avoid rate limits
    for (let i = 0; i < recipients.length; i += 10) {
      const batch = recipients.slice(i, i + 10);
      const promises = batch.map(async (email: string) => {
        try {
          const { data, error } = await resend.emails.send({
            from: 'GetInvita <hello@getinvita.com>',
            to: email,
            subject,
            html: body,
          });
          if (error) {
            errors.push({ email, error: error.message });
          } else {
            results.push({ email, id: data?.id });
          }
        } catch (err) {
          errors.push({ email, error: String(err) });
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
