'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import * as guestStore from '@/lib/guestStore';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

type Status = 'checking' | 'flushing' | 'done' | 'error' | 'no-data';

export default function GuestFlushPage() {
  const [status, setStatus] = useState<Status>('checking');
  const [step, setStep] = useState('Checking your account…');
  const [error, setError] = useState('');

  useEffect(() => {
    run();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function run() {
    try {
      // 1. Confirm user is logged in
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = `/login?redirect=${encodeURIComponent('/guest/flush')}`;
        return;
      }

      // 2. Load guest meta
      const meta = guestStore.loadMeta();
      if (!meta) {
        setStatus('no-data');
        return;
      }

      setStatus('flushing');

      // 3. Create the event
      setStep('Creating your event…');
      const createRes = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: meta.eventType,
          event_name: meta.eventName,
          event_date: meta.eventDate || null,
        }),
      });
      const createData = await createRes.json();
      if (!createRes.ok || !createData.url) {
        throw new Error(createData.error || 'Failed to create event');
      }
      // Extract event ID from the URL: /dashboard/[id]
      const eventId = createData.url.split('/dashboard/')[1];
      if (!eventId) throw new Error('Could not determine event ID');

      // 4. Save details + theme
      setStep('Saving your event details…');
      if (Object.keys(meta.details).length > 0) {
        await fetch(`/api/events/${eventId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ details: meta.details, event_name: meta.eventName }),
        });
      }
      if (meta.themeId) {
        await fetch(`/api/events/${eventId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ theme_id: meta.themeId }),
        });
      }

      // 5. Upload photos
      const photos = await guestStore.loadPhotos();
      if (photos.length > 0) {
        setStep(`Uploading ${photos.length} photo${photos.length > 1 ? 's' : ''}…`);
        for (const photo of photos) {
          try {
            // Get signed upload URL
            const signRes = await fetch(`/api/events/${eventId}/photos`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ fileName: photo.fileName, contentType: photo.contentType }),
            });
            if (!signRes.ok) continue;
            const { storagePath, token } = await signRes.json();

            // Upload directly to Supabase storage
            const file = new File([photo.data], photo.fileName, { type: photo.contentType });
            const { error: uploadError } = await supabase.storage
              .from('event-photos')
              .uploadToSignedUrl(storagePath, token, file, { contentType: photo.contentType });
            if (uploadError) continue;

            // First photo is automatically set as hero by the API
          } catch {
            // Skip failed photos, don't abort
          }
        }
      }

      // 6. Upload music
      const musicTracks = await guestStore.loadMusic();
      if (musicTracks.length > 0) {
        setStep(`Saving ${musicTracks.length} music track${musicTracks.length > 1 ? 's' : ''}…`);
        for (const track of musicTracks) {
          try {
            if (track.source === 'spotify') {
              await fetch(`/api/events/${eventId}/music`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  source: 'spotify',
                  spotifyTrackId: track.spotifyTrackId,
                  songTitle: track.songTitle,
                  artist: track.artist,
                  previewUrl: track.previewUrl,
                }),
              });
            } else if (track.data && track.fileName) {
              const signRes = await fetch(`/api/events/${eventId}/music`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  fileName: track.fileName,
                  songTitle: track.songTitle,
                  contentType: track.contentType,
                }),
              });
              if (!signRes.ok) continue;
              const { storagePath, token } = await signRes.json();
              const file = new File([track.data], track.fileName, { type: track.contentType });
              await supabase.storage
                .from('event-music')
                .uploadToSignedUrl(storagePath, token, file, { contentType: track.contentType });
            }
          } catch {
            // Skip failed tracks
          }
        }
      }

      // 7. Clear guest store
      await guestStore.clearAll();

      // 8. Redirect to Stripe checkout
      setStep('Redirecting to checkout…');
      const checkoutRes = await fetch(`/api/events/${eventId}/checkout`, { method: 'POST' });
      const checkoutData = await checkoutRes.json();
      if (checkoutData.url) {
        window.location.href = checkoutData.url;
      } else {
        // Fallback: go to dashboard
        window.location.href = `/dashboard/${eventId}`;
      }

      setStatus('done');
    } catch (err) {
      console.error('Guest flush error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setStatus('error');
    }
  }

  if (status === 'no-data') {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border p-8 max-w-md w-full text-center">
          <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">No saved event found</h1>
          <p className="text-gray-500 text-sm mb-6">
            It looks like your browser data was cleared. Start fresh to build your event.
          </p>
          <a
            href="/order"
            className="inline-flex items-center justify-center rounded-lg bg-purple-600 text-white px-6 py-3 text-sm font-semibold hover:bg-purple-700 transition-colors"
          >
            Start Over
          </a>
        </div>
      </main>
    );
  }

  if (status === 'error') {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border p-8 max-w-md w-full text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h1>
          <p className="text-gray-500 text-sm mb-2">{error}</p>
          <p className="text-gray-400 text-xs mb-6">Your event data is still saved locally. Try again.</p>
          <button
            onClick={() => { setStatus('checking'); setError(''); run(); }}
            className="inline-flex items-center justify-center rounded-lg bg-purple-600 text-white px-6 py-3 text-sm font-semibold hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border p-8 max-w-md w-full text-center">
        {status === 'done' ? (
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        ) : (
          <Loader2 className="h-12 w-12 text-purple-600 animate-spin mx-auto mb-4" />
        )}
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          {status === 'done' ? 'All saved!' : 'Saving your event…'}
        </h1>
        <p className="text-gray-500 text-sm">{step}</p>
      </div>
    </main>
  );
}
