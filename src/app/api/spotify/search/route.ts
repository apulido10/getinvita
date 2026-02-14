import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

async function getSpotifyToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Spotify credentials not configured');
  }

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: 'grant_type=client_credentials',
  });

  if (!res.ok) {
    throw new Error('Failed to get Spotify token');
  }

  const data = await res.json();
  cachedToken = data.access_token;
  // Expire 60s early to avoid edge cases
  tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;
  return cachedToken!;
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const query = request.nextUrl.searchParams.get('q');
  if (!query || query.trim().length === 0) {
    return NextResponse.json({ tracks: [] });
  }

  try {
    const token = await getSpotifyToken();
    const spotifyRes = await fetch(
      `https://api.spotify.com/v1/search?type=track&limit=8&q=${encodeURIComponent(query)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!spotifyRes.ok) {
      // Token may have expired despite our caching — clear and retry once
      if (spotifyRes.status === 401) {
        cachedToken = null;
        tokenExpiresAt = 0;
        const newToken = await getSpotifyToken();
        const retryRes = await fetch(
          `https://api.spotify.com/v1/search?type=track&limit=8&q=${encodeURIComponent(query)}`,
          { headers: { Authorization: `Bearer ${newToken}` } }
        );
        if (!retryRes.ok) {
          return NextResponse.json({ error: 'Spotify search failed' }, { status: 502 });
        }
        const retryData = await retryRes.json();
        return NextResponse.json({ tracks: formatTracks(retryData) });
      }
      return NextResponse.json({ error: 'Spotify search failed' }, { status: 502 });
    }

    const data = await spotifyRes.json();
    return NextResponse.json({ tracks: formatTracks(data) });
  } catch {
    return NextResponse.json({ error: 'Spotify search failed' }, { status: 500 });
  }
}

interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { images: { url: string; width: number }[] };
}

function formatTracks(data: { tracks?: { items?: SpotifyTrack[] } }) {
  return (data.tracks?.items || []).map((track) => ({
    id: track.id,
    name: track.name,
    artist: track.artists.map((a) => a.name).join(', '),
    albumArt: track.album.images.find((img) => img.width <= 300)?.url || track.album.images[0]?.url || null,
  }));
}
