import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { nanoid } from 'nanoid';

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

async function getPhotos(supabase: SupabaseClient, eventId: string) {
  const { data } = await supabase
    .from('event_photos')
    .select('*')
    .eq('event_id', eventId)
    .order('display_order');
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

  const formData = await request.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const ext = file.name.split('.').pop();
  const storagePath = `${id}/${nanoid()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('event-photos')
    .upload(storagePath, file);

  if (uploadError) {
    console.error('Upload error:', uploadError);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }

  // Get current photo count for display_order
  const existingPhotos = await getPhotos(supabase, id);

  await supabase.from('event_photos').insert({
    event_id: id,
    storage_path: storagePath,
    display_order: existingPhotos.length,
    is_hero: existingPhotos.length === 0,
  });

  const photos = await getPhotos(supabase, id);
  return NextResponse.json({ photos });
}

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
  const { photoId, is_hero } = body;

  if (is_hero) {
    await supabase
      .from('event_photos')
      .update({ is_hero: false })
      .eq('event_id', id);

    await supabase
      .from('event_photos')
      .update({ is_hero: true })
      .eq('id', photoId);
  }

  const photos = await getPhotos(supabase, id);
  return NextResponse.json({ photos });
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

  const photoId = request.nextUrl.searchParams.get('photoId');

  if (!photoId) {
    return NextResponse.json({ error: 'Missing photoId' }, { status: 400 });
  }

  const { data: photo } = await supabase
    .from('event_photos')
    .select('storage_path')
    .eq('id', photoId)
    .single();

  if (photo) {
    await supabase.storage.from('event-photos').remove([photo.storage_path]);
    await supabase.from('event_photos').delete().eq('id', photoId);
  }

  const photos = await getPhotos(supabase, id);
  return NextResponse.json({ photos });
}
