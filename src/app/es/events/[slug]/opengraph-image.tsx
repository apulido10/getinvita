import { ImageResponse } from 'next/og';
import { createServiceClient } from '@/lib/supabase/server';

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
        {/* Background photo — anchored to top */}
        {imageUrl && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'flex-start',
            }}
          >
            <img
              src={imageUrl}
              style={{
                width: '100%',
                height: 'auto',
              }}
            />
          </div>
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
