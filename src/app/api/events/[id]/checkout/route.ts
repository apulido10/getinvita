import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { getEventTypeConfig } from '@/lib/constants';
import { getThemeById } from '@/lib/themes';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(
  _request: NextRequest,
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

  const serviceClient = createServiceClient();

  const { data: event, error } = await serviceClient
    .from('events')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  if (event.status === 'published') {
    return NextResponse.json({ error: 'Event is already published' }, { status: 400 });
  }

  const config = getEventTypeConfig(event.event_type);
  if (!config) {
    return NextResponse.json({ error: 'Invalid event type' }, { status: 400 });
  }

  // Check if a premium theme is selected and not yet paid
  const needsPremiumTheme =
    event.theme_id &&
    !event.theme_premium_paid &&
    getThemeById(event.theme_id)?.isPremium;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  try {
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${config.label} Event — ${event.event_name}`,
          },
          unit_amount: config.price,
        },
        quantity: 1,
      },
    ];

    if (needsPremiumTheme) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Premium Theme Layout',
          },
          unit_amount: 5000,
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: 'payment',
      allow_promotion_codes: true,
      success_url: `${baseUrl}/api/events/${id}/publish-callback?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/dashboard/${id}`,
      metadata: {
        event_id: id,
        includes_premium_theme: needsPremiumTheme ? 'true' : 'false',
      },
    });

    await serviceClient
      .from('events')
      .update({ stripe_checkout_session_id: session.id })
      .eq('id', id);

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
