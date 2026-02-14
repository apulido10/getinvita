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

// POST: Create a signed upload URL + save the DB record (client uploads directly to Supabase storage)
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
  const body = await request.json();
  const { fileName, songTitle, contentType } = body;

  if (!fileName) {
    return NextResponse.json({ error: 'No fileName provided' }, { status: 400 });
  }

  const ext = fileName.split('.').pop();
  const storagePath = `${id}/${nanoid()}.${ext}`;

  // Create a signed upload URL so the client can upload directly to Supabase storage
  const { data: signedData, error: signedError } = await serviceClient.storage
    .from('event-music')
    .createSignedUploadUrl(storagePath);

  if (signedError || !signedData) {
    console.error('Signed URL error:', signedError);
    return NextResponse.json({ error: `Failed to create upload URL: ${signedError?.message}` }, { status: 500 });
  }

  // Save the DB record now (the file will be uploaded by the client)
  const { error: insertError } = await serviceClient.from('event_music').insert({
    event_id: id,
    storage_path: storagePath,
    song_title: songTitle || fileName,
  });

  if (insertError) {
    console.error('Music insert error:', insertError);
    return NextResponse.json({ error: `Save failed: ${insertError.message}` }, { status: 500 });
  }

  return NextResponse.json({
    signedUrl: signedData.signedUrl,
    token: signedData.token,
    storagePath,
    contentType: contentType || 'audio/mpeg',
  });
}

// PUT: Confirm upload complete — return updated music list
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
