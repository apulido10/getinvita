import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { getThemeById } from '@/lib/themes';

export async function PUT(
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

  const serviceClient = createServiceClient();
  const body = await request.json();
  const { details, theme_id, event_name } = body;
  const { data: ownedEvent, error: ownershipError } = await serviceClient
    .from('events')
    .select('id, status, theme_premium_paid')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (ownershipError || !ownedEvent) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  // If updating theme_id directly
  if (theme_id !== undefined) {
    const newTheme = getThemeById(theme_id);

    // If the new theme is premium, validate payment
    if (newTheme?.isPremium) {
      // If already published without premium paid, block all premium themes
      if (ownedEvent.status === 'published' && !ownedEvent.theme_premium_paid) {
        return NextResponse.json(
          { error: 'Premium layouts require payment. Use the upgrade option.' },
          { status: 403 }
        );
      }
    }

    await serviceClient
      .from('events')
      .update({ theme_id })
      .eq('id', id)
      .eq('user_id', user.id);

    return NextResponse.json({ theme_id });
  }

  // Update event name if provided
  if (event_name !== undefined) {
    await serviceClient
      .from('events')
      .update({ event_name })
      .eq('id', id)
      .eq('user_id', user.id);
  }

  // Upsert each detail key-value pair
  for (const [key, value] of Object.entries(details ?? {})) {
    await serviceClient
      .from('event_details')
      .upsert(
        { event_id: id, detail_key: key, detail_value: value as string },
        { onConflict: 'event_id,detail_key' }
      );
  }

  // Also update event to 'active' if currently 'paid'
  await serviceClient
    .from('events')
    .update({ status: 'active' })
    .eq('id', id)
    .eq('user_id', user.id)
    .eq('status', 'paid');

  const { data: updatedDetails } = await serviceClient
    .from('event_details')
    .select('*')
    .eq('event_id', id);

  return NextResponse.json({ details: updatedDetails || [] });
}

export async function DELETE(
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
  const { data: ownedEvent, error: ownershipError } = await serviceClient
    .from('events')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (ownershipError || !ownedEvent) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  await serviceClient.from('rsvps').delete().eq('event_id', id);
  await serviceClient.from('event_music').delete().eq('event_id', id);
  await serviceClient.from('event_photos').delete().eq('event_id', id);
  await serviceClient.from('event_details').delete().eq('event_id', id);
  const { error } = await serviceClient
    .from('events')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
