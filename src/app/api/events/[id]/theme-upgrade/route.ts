import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { getThemeById } from '@/lib/themes';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { theme_id } = body;

  const theme = getThemeById(theme_id);
  if (!theme?.isPremium) {
    return NextResponse.json({ error: 'Not a premium theme' }, { status: 400 });
  }

  const serviceClient = createServiceClient();

  const { data: event } = await serviceClient
    .from('events')
    .select('*')
    .eq('id', id)
    .single();

  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  if (event.theme_premium_paid) {
    return NextResponse.json({ error: 'Premium already purchased' }, { status: 400 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  try {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Premium Theme — ${theme.name}`,
            },
            unit_amount: 5000,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      allow_promotion_codes: true,
      success_url: `${baseUrl}/api/events/${id}/theme-upgrade?session_id={CHECKOUT_SESSION_ID}&theme_id=${theme_id}`,
      cancel_url: `${baseUrl}/dashboard/${id}`,
      metadata: {
        event_id: id,
        theme_id,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Stripe theme upgrade error:', err);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}

// Callback after Stripe payment
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sessionId = request.nextUrl.searchParams.get('session_id');
  const themeId = request.nextUrl.searchParams.get('theme_id');

  if (!sessionId || !themeId) {
    return NextResponse.redirect(new URL(`/dashboard/${id}`, request.url));
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== 'paid' || session.metadata?.event_id !== id) {
    return NextResponse.redirect(new URL(`/dashboard/${id}`, request.url));
  }

  const serviceClient = createServiceClient();

  await serviceClient
    .from('events')
    .update({
      theme_id: themeId,
      theme_premium_paid: true,
    })
    .eq('id', id);

  return NextResponse.redirect(new URL(`/dashboard/${id}`, request.url));
}
