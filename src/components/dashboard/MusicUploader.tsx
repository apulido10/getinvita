'use client';

import { useState, useRef } from 'react';
import { Event, EventMusic } from '@/types';
import { Upload, Trash2, Loader2, Music2, Play, Pause } from 'lucide-react';

interface Props {
  event: Event;
  music: EventMusic[];
  onUpdate: (music: EventMusic[]) => void;
}

export default function MusicUploader({ event, music, onUpdate }: Props) {
  const [uploading, setUploading] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(files: FileList) {
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('audio/')) continue;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('song_title', file.name.replace(/\.[^/.]+$/, ''));
        const res = await fetch(`/api/events/${event.id}/music`, {
          method: 'POST',
          body: formData,
        });
        if (res.ok) {
          const data = await res.json();
          onUpdate(data.music);
        }
      }
    } finally {
      setUploading(false);
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

      {/* Upload */}
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

      {/* Track List */}
      {music.length > 0 ? (
        <div className="bg-white rounded-xl border divide-y">
          {music.map((track) => (
            <div key={track.id} className="flex items-center gap-4 p-4">
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
          <p className="text-sm text-gray-500">No music yet. Upload tracks for your event page!</p>
        </div>
      )}
    </div>
  );
}
