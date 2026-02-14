import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sessionId = request.nextUrl.searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.redirect(new URL(`/dashboard/${id}`, request.url));
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== 'paid' || session.metadata?.event_id !== id) {
    return NextResponse.redirect(new URL(`/dashboard/${id}`, request.url));
  }

  const serviceClient = createServiceClient();

  const updateData: Record<string, unknown> = {
    status: 'published',
    stripe_payment_intent_id: session.payment_intent as string,
  };

  // If premium theme was included in this checkout, unlock it
  if (session.metadata?.includes_premium_theme === 'true') {
    updateData.theme_premium_paid = true;
  }

  await serviceClient
    .from('events')
    .update(updateData)
    .eq('id', id);

  return NextResponse.redirect(new URL(`/dashboard/${id}`, request.url));
}
