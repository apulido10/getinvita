import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event_id, guest_name, attending, guest_count, message, song_request } = body;

    if (!event_id || !guest_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createServiceClient();

    const { error } = await supabase.from('rsvps').insert({
      event_id,
      guest_name,
      attending: attending ?? true,
      guest_count: guest_count ?? 1,
      message: message || null,
      song_request: song_request || null,
    });

    if (error) {
      console.error('RSVP error:', error);
      return NextResponse.json({ error: 'Failed to submit RSVP' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
