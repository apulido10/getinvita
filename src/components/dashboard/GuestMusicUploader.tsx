'use client';

import { useState, useRef, useEffect } from 'react';
import { EventMusic } from '@/types';
import { Upload, Trash2, Loader2, Music2, Play, Pause } from 'lucide-react';
import { nanoid } from 'nanoid';
import SpotifySearch from './SpotifySearch';
import * as guestStore from '@/lib/guestStore';

type Tab = 'upload' | 'spotify';

interface LocalTrack {
  record: guestStore.GuestMusicRecord;
  blobUrl?: string;
}

interface Props {
  onUpdate: (music: EventMusic[]) => void;
}

function toEventMusic(t: LocalTrack): EventMusic {
  return {
    id: t.record.id,
    event_id: 'guest',
    storage_path: t.blobUrl || t.record.previewUrl || null,
    song_title: t.record.songTitle,
    artist: t.record.artist || null,
    source: t.record.source,
    spotify_track_id: t.record.spotifyTrackId || null,
    created_at: new Date().toISOString(),
  };
}

export default function GuestMusicUploader({ onUpdate }: Props) {
  const [tab, setTab] = useState<Tab>('upload');
  const [tracks, setTracks] = useState<LocalTrack[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const didLoad = useRef(false);

  useEffect(() => {
    if (didLoad.current) return;
    didLoad.current = true;
    guestStore.loadMusic().then((records) => {
      const loaded: LocalTrack[] = records.map((record) => ({
        record,
        blobUrl: record.data
          ? URL.createObjectURL(new Blob([record.data], { type: record.contentType }))
          : undefined,
      }));
      setTracks(loaded);
      onUpdate(loaded.map(toEventMusic));
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleUpload(files: FileList) {
    setUploading(true);
    setError(null);
    try {
      const newTracks: LocalTrack[] = [];
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('audio/')) {
          setError(`"${file.name}" is not an audio file.`);
          continue;
        }
        const data = await file.arrayBuffer();
        const id = nanoid();
        const record: guestStore.GuestMusicRecord = {
          id,
          source: 'upload',
          fileName: file.name,
          contentType: file.type,
          data,
          songTitle: file.name.replace(/\.[^/.]+$/, ''),
        };
        await guestStore.saveMusic(record);
        const blobUrl = URL.createObjectURL(new Blob([data], { type: file.type }));
        newTracks.push({ record, blobUrl });
      }
      const updated = [...tracks, ...newTracks];
      setTracks(updated);
      onUpdate(updated.map(toEventMusic));
    } finally {
      setUploading(false);
    }
  }

  async function handleSpotifySelect(track: {
    id: string;
    name: string;
    artist: string;
    previewUrl: string | null;
  }) {
    setError(null);
    const id = nanoid();
    const record: guestStore.GuestMusicRecord = {
      id,
      source: 'spotify',
      spotifyTrackId: track.id,
      songTitle: track.name,
      artist: track.artist,
      previewUrl: track.previewUrl,
    };
    await guestStore.saveMusic(record);
    const updated = [...tracks, { record }];
    setTracks(updated);
    onUpdate(updated.map(toEventMusic));
  }

  async function handleDelete(id: string) {
    const track = tracks.find((t) => t.record.id === id);
    if (track?.blobUrl) URL.revokeObjectURL(track.blobUrl);
    if (playingId === id) {
      audioRef.current?.pause();
      setPlayingId(null);
    }
    await guestStore.deleteMusic(id);
    const updated = tracks.filter((t) => t.record.id !== id);
    setTracks(updated);
    onUpdate(updated.map(toEventMusic));
  }

  function togglePlay(track: LocalTrack) {
    if (track.record.source === 'spotify') return;
    if (!track.blobUrl) return;
    if (playingId === track.record.id) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = track.blobUrl;
        audioRef.current.play();
        setPlayingId(track.record.id);
      }
    }
  }

  return (
    <div className="space-y-6">
      <audio ref={audioRef} onEnded={() => setPlayingId(null)} />

      <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setTab('upload')}
          className={`flex-1 text-sm font-medium py-2 px-4 rounded-md transition-colors ${
            tab === 'upload' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Upload MP3
        </button>
        <button
          onClick={() => setTab('spotify')}
          className={`flex-1 text-sm font-medium py-2 px-4 rounded-md transition-colors ${
            tab === 'spotify' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Search Spotify
        </button>
      </div>

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
              <p className="text-sm text-gray-600">Processing…</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-8 w-8 text-gray-400" />
              <p className="text-sm font-medium text-gray-700">Click to upload music</p>
              <p className="text-xs text-gray-500">MP3, WAV, AAC supported</p>
            </div>
          )}
        </div>
      )}

      {tab === 'spotify' && (
        <>
          <SpotifySearch onSelect={handleSpotifySelect} lang="en" />
          <p className="text-xs text-gray-400 text-center mt-2">
            Spotify preview clips (30s) will play on your event site.
          </p>
        </>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>
      )}

      {tracks.length > 0 ? (
        <div className="bg-white rounded-xl border divide-y">
          {tracks.map((track) => (
            <div key={track.record.id} className="flex items-center gap-4 p-4">
              {track.record.source === 'spotify' ? (
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
                  {playingId === track.record.id ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4 ml-0.5" />
                  )}
                </button>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {track.record.songTitle || 'Untitled'}
                </p>
                {track.record.artist && (
                  <p className="text-xs text-gray-500 truncate">{track.record.artist}</p>
                )}
              </div>
              <button
                onClick={() => handleDelete(track.record.id)}
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
          <p className="text-sm text-gray-500">No music yet</p>
        </div>
      )}
    </div>
  );
}
