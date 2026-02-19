import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

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
  const { data: ownedEvent, error: ownershipError } = await serviceClient
    .from('events')
    .select('id, status')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (ownershipError || !ownedEvent) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  if (ownedEvent.status === 'published') {
    return NextResponse.json({ error: 'Event is already published' }, { status: 400 });
  }

  if (!['paid', 'active'].includes(ownedEvent.status)) {
    return NextResponse.json({ error: 'Event is not ready to publish' }, { status: 400 });
  }

  const { error } = await serviceClient
    .from('events')
    .update({ status: 'published' })
    .eq('id', id)
    .eq('user_id', user.id)
    .in('status', ['paid', 'active']);

  if (error) {
    return NextResponse.json({ error: 'Failed to publish' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
