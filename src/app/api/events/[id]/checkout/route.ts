import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { getEventTypeConfig } from '@/lib/constants';
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

  // Payment always requires a logged-in user
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const serviceClient = createServiceClient();

  // Check if this is an anonymous event we can claim
  const cookieVal = request.cookies.get('gi_event_access')?.value;
  if (cookieVal) {
    const colonIdx = cookieVal.indexOf(':');
    const cookieId = cookieVal.slice(0, colonIdx);
    const cookieToken = cookieVal.slice(colonIdx + 1);
    if (cookieId === id && cookieToken) {
      // Claim anonymous event before proceeding to payment
      await serviceClient
        .from('events')
        .update({ user_id: user.id })
        .eq('id', id)
        .eq('access_token', cookieToken)
        .is('user_id', null);
    }
  }

  const { data: event, error } = await serviceClient
    .from('events')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
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

  // Read optional add-ons from event details
  const { data: eventDetails } = await serviceClient
    .from('event_details')
    .select('detail_key, detail_value')
    .eq('event_id', id);

  const detailMap: Record<string, string> = {};
  (eventDetails || []).forEach((d) => { if (d.detail_value) detailMap[d.detail_key] = d.detail_value; });

  const hasReception = detailMap['has_reception'] === 'true';
  const hasDinner = detailMap['has_dinner'] === 'true';
  const mealType = detailMap['meal_type'] || 'dinner';

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

    if (config.optionalSections) {
      if (hasReception) {
        lineItems.push({
          price_data: {
            currency: 'usd',
            product_data: { name: 'Reception Add-on' },
            unit_amount: 1000,
          },
          quantity: 1,
        });
      }
      if (hasDinner) {
        lineItems.push({
          price_data: {
            currency: 'usd',
            product_data: { name: `${mealType === 'lunch' ? 'Lunch' : 'Dinner'} Add-on` },
            unit_amount: 1000,
          },
          quantity: 1,
        });
      }
    }

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
