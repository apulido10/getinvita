import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

  const { error } = await supabase
    .from('events')
    .update({ status: 'published' })
    .eq('id', id)
    .in('status', ['paid', 'active']);

  if (error) {
    return NextResponse.json({ error: 'Failed to publish' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
