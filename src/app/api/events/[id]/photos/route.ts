import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { nanoid } from 'nanoid';
import { authorizeEventAccess } from '@/lib/event-access';

async function getPhotos(supabase: ReturnType<typeof createServiceClient>, eventId: string) {
  const { data } = await supabase
    .from('event_photos')
    .select('*')
    .eq('event_id', eventId)
    .order('display_order');
  return data || [];
}

// POST: Create a signed upload URL + save the DB record (client uploads directly to Supabase storage)
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
  const { fileName, contentType } = body;

  if (!fileName) {
    return NextResponse.json({ error: 'No fileName provided' }, { status: 400 });
  }

  const ext = fileName.split('.').pop();
  const storagePath = `${id}/${nanoid()}.${ext}`;

  const { data: signedData, error: signedError } = await serviceClient.storage
    .from('event-photos')
    .createSignedUploadUrl(storagePath);

  if (signedError || !signedData) {
    console.error('Signed URL error:', signedError);
    return NextResponse.json({ error: `Failed to create upload URL: ${signedError?.message}` }, { status: 500 });
  }

  const existingPhotos = await getPhotos(serviceClient, id);

  const { error: insertError } = await serviceClient.from('event_photos').insert({
    event_id: id,
    storage_path: storagePath,
    display_order: existingPhotos.length,
    is_hero: existingPhotos.length === 0,
  });

  if (insertError) {
    console.error('Photo insert error:', insertError);
    return NextResponse.json({ error: `Save failed: ${insertError.message}` }, { status: 500 });
  }

  return NextResponse.json({
    signedUrl: signedData.signedUrl,
    token: signedData.token,
    storagePath,
    contentType: contentType || 'image/jpeg',
  });
}

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
  const body = await request.json();
  const { photoId, is_hero } = body;

  if (is_hero && photoId) {
    await serviceClient
      .from('event_photos')
      .update({ is_hero: false })
      .eq('event_id', id);

    await serviceClient
      .from('event_photos')
      .update({ is_hero: true })
      .eq('id', photoId);
  }

  const photos = await getPhotos(serviceClient, id);
  return NextResponse.json({ photos });
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
  const photoId = request.nextUrl.searchParams.get('photoId');

  if (!photoId) {
    return NextResponse.json({ error: 'Missing photoId' }, { status: 400 });
  }

  const { data: photo } = await serviceClient
    .from('event_photos')
    .select('storage_path, is_hero, display_order')
    .eq('id', photoId)
    .single();

  if (photo) {
    await serviceClient.storage.from('event-photos').remove([photo.storage_path]);
    await serviceClient.from('event_photos').delete().eq('id', photoId);

    if (photo.is_hero) {
      const remaining = await getPhotos(serviceClient, id);
      if (remaining.length > 0) {
        const beforePhotos = remaining.filter((p) => p.display_order < photo.display_order);
        const newHero = beforePhotos.length > 0
          ? beforePhotos[beforePhotos.length - 1]
          : remaining[0];
        await serviceClient
          .from('event_photos')
          .update({ is_hero: true })
          .eq('id', newHero.id);
      }
    }
  }

  const photos = await getPhotos(serviceClient, id);
  return NextResponse.json({ photos });
}
