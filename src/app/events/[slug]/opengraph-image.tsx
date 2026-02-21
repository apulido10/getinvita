import { ImageResponse } from 'next/og';
import { createServiceClient } from '@/lib/supabase/server';
import sharp from 'sharp';

export const runtime = 'nodejs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OGImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = createServiceClient();

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  const { data: photos } = await supabase
    .from('event_photos')
    .select('*')
    .eq('event_id', event?.id)
    .eq('is_hero', true)
    .limit(1);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const heroPhoto = photos?.[0];
  const imageUrl = heroPhoto
    ? `${supabaseUrl}/storage/v1/object/public/event-photos/${heroPhoto.storage_path}`
    : null;

  const eventName = event?.event_name ?? "You're Invited";

  // Crop image server-side to 1200x630 anchored to top
  let croppedDataUrl: string | null = null;
  if (imageUrl) {
    try {
      const res = await fetch(imageUrl);
      const buffer = Buffer.from(await res.arrayBuffer());
      const cropped = await sharp(buffer)
        .resize(1200, 630, { fit: 'cover', position: 'top' })
        .jpeg({ quality: 90 })
        .toBuffer();
      croppedDataUrl = `data:image/jpeg;base64,${cropped.toString('base64')}`;
    } catch {
      // fall through to no image
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: 'flex',
          position: 'relative',
          backgroundColor: '#1e0a3c',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        {/* Background photo — cropped to top via sharp */}
        {croppedDataUrl && (
          <img
            src={croppedDataUrl}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 1200,
              height: 630,
            }}
          />
        )}

        {/* Gradient overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.1) 100%)',
            display: 'flex',
          }}
        />

        {/* Bottom content */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '48px 60px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div
            style={{
              fontSize: 56,
              fontWeight: 700,
              color: '#ffffff',
              lineHeight: 1.15,
              letterSpacing: '-1px',
              textShadow: '0 2px 8px rgba(0,0,0,0.4)',
            }}
          >
            {eventName}
          </div>
          <div
            style={{
              fontSize: 24,
              color: 'rgba(255,255,255,0.75)',
              fontWeight: 500,
            }}
          >
            getinvita.com
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
