import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { nanoid } from 'nanoid';

async function getMusic(supabase: ReturnType<typeof createServiceClient>, eventId: string) {
  const { data } = await supabase
    .from('event_music')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at');
  return data || [];
}

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

  const serviceClient = createServiceClient();

  const formData = await request.formData();
  const file = formData.get('file') as File;
  const songTitle = formData.get('song_title') as string;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const ext = file.name.split('.').pop();
  const storagePath = `${id}/${nanoid()}.${ext}`;

  const { error: uploadError } = await serviceClient.storage
    .from('event-music')
    .upload(storagePath, file);

  if (uploadError) {
    console.error('Upload error:', uploadError);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }

  await serviceClient.from('event_music').insert({
    event_id: id,
    storage_path: storagePath,
    song_title: songTitle || file.name,
  });

  const music = await getMusic(serviceClient, id);
  return NextResponse.json({ music });
}

export async function DELETE(
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
  const musicId = request.nextUrl.searchParams.get('musicId');

  if (!musicId) {
    return NextResponse.json({ error: 'Missing musicId' }, { status: 400 });
  }

  const { data: track } = await serviceClient
    .from('event_music')
    .select('storage_path')
    .eq('id', musicId)
    .single();

  if (track) {
    await serviceClient.storage.from('event-music').remove([track.storage_path]);
    await serviceClient.from('event_music').delete().eq('id', musicId);
  }

  const music = await getMusic(serviceClient, id);
  return NextResponse.json({ music });
}
