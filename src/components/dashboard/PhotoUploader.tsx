'use client';

import { useState, useRef, useCallback } from 'react';
import { Event, EventPhoto } from '@/types';
import { Upload, Star, Trash2, Loader2, ImageIcon } from 'lucide-react';

interface Props {
  event: Event;
  photos: EventPhoto[];
  onUpdate: (photos: EventPhoto[]) => void;
}

export default function PhotoUploader({ event, photos, onUpdate }: Props) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (files: FileList) => {
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue;
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch(`/api/events/${event.id}/photos`, {
          method: 'POST',
          body: formData,
        });
        if (res.ok) {
          const data = await res.json();
          onUpdate(data.photos);
        }
      }
    } finally {
      setUploading(false);
    }
  }, [event.id, onUpdate]);

  async function handleDelete(photoId: string) {
    const res = await fetch(`/api/events/${event.id}/photos?photoId=${photoId}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      const data = await res.json();
      onUpdate(data.photos);
    }
  }

  async function handleSetHero(photoId: string) {
    const res = await fetch(`/api/events/${event.id}/photos`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photoId, is_hero: true }),
    });
    if (res.ok) {
      const data = await res.json();
      onUpdate(data.photos);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) {
      handleFiles(e.dataTransfer.files);
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`bg-white rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
          dragOver ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
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
              Drag & drop photos here, or click to browse
            </p>
            <p className="text-xs text-gray-500">JPG, PNG, WebP up to 10MB each</p>
          </div>
        )}
      </div>

      {/* Photo Grid */}
      {photos.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 border">
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/event-photos/${photo.storage_path}`}
                alt={photo.caption || 'Event photo'}
                className="w-full h-full object-cover"
              />
              {photo.is_hero && (
                <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 rounded-full px-2 py-0.5 text-xs font-bold flex items-center gap-1">
                  <Star className="h-3 w-3" /> Hero
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                {!photo.is_hero && (
                  <button
                    onClick={() => handleSetHero(photo.id)}
                    className="rounded-full bg-white p-2 text-yellow-600 hover:bg-yellow-50"
                    title="Set as hero image"
                  >
                    <Star className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(photo.id)}
                  className="rounded-full bg-white p-2 text-red-600 hover:bg-red-50"
                  title="Delete photo"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border p-8 text-center">
          <ImageIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No photos yet. Upload some to get started!</p>
        </div>
      )}
    </div>
  );
}
