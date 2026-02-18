'use client';

import { useState, useRef, useCallback } from 'react';
import { Event, EventPhoto } from '@/types';
import { Upload, Star, Trash2, Loader2, ImageIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { t, type Lang } from '@/lib/translations';

interface Props {
  event: Event;
  photos: EventPhoto[];
  lang: Lang;
  onUpdate: (photos: EventPhoto[]) => void;
}

export default function PhotoUploader({ event, photos, lang, onUpdate }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (files: FileList) => {
    setUploading(true);
    setError(null);
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) {
          setError(`"${file.name}" ${t('dash.notImageFile', lang)}`);
          continue;
        }

        // Step 1: Get a signed upload URL from our API
        const res = await fetch(`/api/events/${event.id}/photos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            contentType: file.type,
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({ error: 'Upload failed' }));
          setError(data.error || `Upload failed (${res.status})`);
          continue;
        }

        const { storagePath, token } = await res.json();

        // Step 2: Upload the file directly to Supabase storage using the signed URL
        const supabase = createClient();
        const { error: uploadError } = await supabase.storage
          .from('event-photos')
          .uploadToSignedUrl(storagePath, token, file, {
            contentType: file.type || 'image/jpeg',
          });

        if (uploadError) {
          setError(`Storage upload failed: ${uploadError.message}`);
          continue;
        }

        // Step 3: Get updated photos list
        const confirmRes = await fetch(`/api/events/${event.id}/photos`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh: true }),
        });

        if (confirmRes.ok) {
          const data = await confirmRes.json();
          onUpdate(data.photos);
        }
      }
    } catch (err) {
      setError(t('dash.networkError', lang));
      console.error('Photo upload error:', err);
    } finally {
      setUploading(false);
    }
  }, [event.id, lang, onUpdate]);

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
            <p className="text-sm text-gray-600">{t('dash.uploading', lang)}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-gray-400" />
            <p className="text-sm font-medium text-gray-700">
              {t('dash.dragDropPhotos', lang)}
            </p>
            <p className="text-xs text-gray-500">{t('dash.photoFormats', lang)}</p>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {error}
        </div>
      )}

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
                <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 rounded-full px-2.5 py-1 text-xs font-bold flex items-center gap-1 shadow-md">
                  <Star className="h-3.5 w-3.5 fill-current" /> {t('dash.coverPhoto', lang)}
                </div>
              )}
              {!photo.is_hero && (
                <div className="absolute top-2 left-2">
                  <button
                    onClick={() => handleSetHero(photo.id)}
                    className="bg-white/90 backdrop-blur-sm text-yellow-600 hover:bg-yellow-50 rounded-full px-2.5 py-1 text-xs font-medium flex items-center gap-1 shadow-md"
                    title={t('dash.setAsCover', lang)}
                  >
                    <Star className="h-3.5 w-3.5" /> {t('dash.setAsCover', lang)}
                  </button>
                </div>
              )}
              <div className="absolute top-2 right-2">
                <button
                  onClick={() => handleDelete(photo.id)}
                  className="rounded-full bg-white/90 backdrop-blur-sm p-2 text-red-600 hover:bg-red-50 shadow-md"
                  title={t('dash.delete', lang)}
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
          <p className="text-sm text-gray-500">{t('dash.noPhotosYet', lang)}</p>
        </div>
      )}
    </div>
  );
}
