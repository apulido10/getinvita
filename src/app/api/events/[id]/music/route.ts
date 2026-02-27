import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { nanoid } from 'nanoid';
import { authorizeEventAccess } from '@/lib/event-access';

async function getMusic(supabase: ReturnType<typeof createServiceClient>, eventId: string) {
  const { data } = await supabase
    .from('event_music')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at');
  return data || [];
}

// POST: Create a signed upload URL + save the DB record (client uploads directly to Supabase storage)
// OR: Add a Spotify track (no file upload needed)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const access = await authorizeEventAccess(id, request);
  if (!access) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const serviceClient = createServiceClient();
  const body = await request.json();

  // Spotify track flow
  if (body.source === 'spotify') {
    const { spotifyTrackId, songTitle, artist, previewUrl } = body;

    if (!spotifyTrackId) {
      return NextResponse.json({ error: 'No spotifyTrackId provided' }, { status: 400 });
    }

    const { error: insertError } = await serviceClient.from('event_music').insert({
      event_id: id,
      source: 'spotify',
      spotify_track_id: spotifyTrackId,
      song_title: songTitle || 'Spotify Track',
      artist: artist || null,
      storage_path: previewUrl || null,
    });

    if (insertError) {
      console.error('Spotify music insert error:', insertError);
      return NextResponse.json({ error: `Save failed: ${insertError.message}` }, { status: 500 });
    }

    const music = await getMusic(serviceClient, id);
    return NextResponse.json({ music });
  }

  // File upload flow
  const { fileName, songTitle, contentType } = body;

  if (!fileName) {
    return NextResponse.json({ error: 'No fileName provided' }, { status: 400 });
  }

  const ext = fileName.split('.').pop();
  const storagePath = `${id}/${nanoid()}.${ext}`;

  const { data: signedData, error: signedError } = await serviceClient.storage
    .from('event-music')
    .createSignedUploadUrl(storagePath);

  if (signedError || !signedData) {
    console.error('Signed URL error:', signedError);
    return NextResponse.json({ error: `Failed to create upload URL: ${signedError?.message}` }, { status: 500 });
  }

  const { error: insertError } = await serviceClient.from('event_music').insert({
    event_id: id,
    storage_path: storagePath,
    song_title: songTitle || fileName,
    source: 'upload',
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

  const access = await authorizeEventAccess(id, request);
  if (!access) {
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

  const access = await authorizeEventAccess(id, request);
  if (!access) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const serviceClient = createServiceClient();
  const musicId = request.nextUrl.searchParams.get('musicId');

  if (!musicId) {
    return NextResponse.json({ error: 'Missing musicId' }, { status: 400 });
  }

  const { data: track } = await serviceClient
    .from('event_music')
    .select('storage_path, source')
    .eq('id', musicId)
    .single();

  if (track) {
    if (track.storage_path && track.source !== 'spotify') {
      await serviceClient.storage.from('event-music').remove([track.storage_path]);
    }
    await serviceClient.from('event_music').delete().eq('id', musicId);
  }

  const music = await getMusic(serviceClient, id);
  return NextResponse.json({ music });
}
