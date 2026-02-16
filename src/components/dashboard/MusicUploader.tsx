'use client';

import { useState, useRef } from 'react';
import { Event, EventMusic } from '@/types';
import { Upload, Trash2, Loader2, Music2, Play, Pause } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import SpotifySearch from './SpotifySearch';

interface Props {
  event: Event;
  music: EventMusic[];
  onUpdate: (music: EventMusic[]) => void;
}

type Tab = 'upload' | 'spotify';

export default function MusicUploader({ event, music, onUpdate }: Props) {
  const [tab, setTab] = useState<Tab>('upload');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(files: FileList) {
    setUploading(true);
    setError(null);
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('audio/')) {
          setError(`"${file.name}" is not an audio file`);
          continue;
        }

        const res = await fetch(`/api/events/${event.id}/music`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            songTitle: file.name.replace(/\.[^/.]+$/, ''),
            contentType: file.type,
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({ error: 'Upload failed' }));
          setError(data.error || `Upload failed (${res.status})`);
          continue;
        }

        const { storagePath, token } = await res.json();

        const supabase = createClient();
        const { error: uploadError } = await supabase.storage
          .from('event-music')
          .uploadToSignedUrl(storagePath, token, file, {
            contentType: file.type || 'audio/mpeg',
          });

        if (uploadError) {
          setError(`Storage upload failed: ${uploadError.message}`);
          continue;
        }

        const confirmRes = await fetch(`/api/events/${event.id}/music`, {
          method: 'PUT',
        });

        if (confirmRes.ok) {
          const data = await confirmRes.json();
          onUpdate(data.music);
        }
      }
    } catch (err) {
      setError('Network error — check your connection and try again');
      console.error('Music upload error:', err);
    } finally {
      setUploading(false);
    }
  }

  async function handleSpotifySelect(track: { id: string; name: string; artist: string; previewUrl: string | null }) {
    setError(null);
    try {
      const res = await fetch(`/api/events/${event.id}/music`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'spotify',
          spotifyTrackId: track.id,
          songTitle: track.name,
          artist: track.artist,
          previewUrl: track.previewUrl,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Failed to add track' }));
        setError(data.error || 'Failed to add Spotify track');
        return;
      }

      const data = await res.json();
      onUpdate(data.music);
    } catch {
      setError('Network error — check your connection and try again');
    }
  }

  async function handleDelete(musicId: string) {
    const res = await fetch(`/api/events/${event.id}/music?musicId=${musicId}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      const data = await res.json();
      onUpdate(data.music);
      if (playingId === musicId) {
        audioRef.current?.pause();
        setPlayingId(null);
      }
    }
  }

  function togglePlay(track: EventMusic) {
    if (track.source === 'spotify') return;
    if (playingId === track.id) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/event-music/${track.storage_path}`;
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
        setPlayingId(track.id);
      }
    }
  }

  return (
    <div className="space-y-6">
      <audio ref={audioRef} onEnded={() => setPlayingId(null)} />

      {/* Tab Toggle */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setTab('upload')}
          className={`flex-1 text-sm font-medium py-2 px-4 rounded-md transition-colors ${
            tab === 'upload'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Upload MP3
        </button>
        <button
          onClick={() => setTab('spotify')}
          className={`flex-1 text-sm font-medium py-2 px-4 rounded-md transition-colors ${
            tab === 'spotify'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Search Spotify
        </button>
      </div>

      {/* Upload Tab */}
      {tab === 'upload' && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            multiple
            onChange={(e) => e.target.files && handleUpload(e.target.files)}
            className="hidden"
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
              <p className="text-sm text-gray-600">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-8 w-8 text-gray-400" />
              <p className="text-sm font-medium text-gray-700">
                Click to upload music files
              </p>
              <p className="text-xs text-gray-500">MP3, WAV, AAC</p>
            </div>
          )}
        </div>
      )}

      {/* Spotify Tab */}
      {tab === 'spotify' && (
        <>
          <SpotifySearch onSelect={handleSpotifySelect} />
          <p className="text-xs text-gray-400 text-center mt-2">
            Spotify tracks play a 30-second preview. Upload an MP3 for the full song.
          </p>
        </>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Track List */}
      {music.length > 0 ? (
        <div className="bg-white rounded-xl border divide-y">
          {music.map((track) => (
            <div key={track.id} className="flex items-center gap-4 p-4">
              {track.source === 'spotify' ? (
                <div className="shrink-0 w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                  </svg>
                </div>
              ) : (
                <button
                  onClick={() => togglePlay(track)}
                  className="shrink-0 w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center hover:bg-purple-200 transition-colors"
                >
                  {playingId === track.id ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4 ml-0.5" />
                  )}
                </button>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {track.song_title || 'Untitled'}
                </p>
                {track.artist && (
                  <p className="text-xs text-gray-500 truncate">{track.artist}</p>
                )}
              </div>
              <button
                onClick={() => handleDelete(track.id)}
                className="shrink-0 p-2 text-gray-400 hover:text-red-600 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border p-8 text-center">
          <Music2 className="h-12 w-12 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No music yet. Upload tracks or search Spotify for your event page!</p>
        </div>
      )}
    </div>
  );
}
