import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
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

  const body = await request.json();
  const { details, theme_id } = body;

  // If updating theme_id directly
  if (theme_id !== undefined) {
    const newTheme = getThemeById(theme_id);

    // If the new theme is premium, validate payment
    if (newTheme?.isPremium) {
      const { data: event } = await supabase
        .from('events')
        .select('theme_id, theme_premium_paid, status')
        .eq('id', id)
        .single();

      // If already published without premium paid, block all premium themes
      if (event?.status === 'published' && !event.theme_premium_paid) {
        return NextResponse.json(
          { error: 'Premium layouts require payment. Use the upgrade option.' },
          { status: 403 }
        );
      }
      // If premium is paid, all premium themes are allowed (no further check needed)
    }

    await supabase
      .from('events')
      .update({ theme_id })
      .eq('id', id);

    return NextResponse.json({ theme_id });
  }

  // Upsert each detail key-value pair (RLS enforces ownership)
  for (const [key, value] of Object.entries(details)) {
    await supabase
      .from('event_details')
      .upsert(
        { event_id: id, detail_key: key, detail_value: value as string },
        { onConflict: 'event_id,detail_key' }
      );
  }

  // Also update event to 'active' if currently 'paid'
  await supabase
    .from('events')
    .update({ status: 'active' })
    .eq('id', id)
    .eq('status', 'paid');

  const { data: updatedDetails } = await supabase
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

  // RLS enforces ownership — delete related data then the event
  await supabase.from('rsvps').delete().eq('event_id', id);
  await supabase.from('event_music').delete().eq('event_id', id);
  await supabase.from('event_photos').delete().eq('event_id', id);
  await supabase.from('event_details').delete().eq('event_id', id);
  const { error } = await supabase.from('events').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
