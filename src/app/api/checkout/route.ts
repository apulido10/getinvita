import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { getEventTypeConfig } from '@/lib/constants';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const serviceClient = createServiceClient();

    const body = await request.json();
    const { event_type, event_name, event_date } = body;

    const config = getEventTypeConfig(event_type);
    if (!config) {
      return NextResponse.json({ error: 'Invalid event type' }, { status: 400 });
    }

    if (!event_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const client_name = user.user_metadata?.full_name || user.email || '';
    const client_email = user.email || '';

    const slug = `${event_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${nanoid(6)}`;
    const access_token = nanoid(32);

    const { data: event, error: dbError } = await serviceClient
      .from('events')
      .insert({
        slug,
        event_type,
        event_name,
        event_date: event_date || null,
        status: 'active',
        client_name,
        client_email,
        access_token,
        user_id: user.id,
      })
      .select()
      .single();

    if (dbError) {
      console.error('DB Error:', dbError);
      return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
    }

    return NextResponse.json({ url: `/dashboard/${event.id}` });
  } catch (error) {
    console.error('Create event error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
