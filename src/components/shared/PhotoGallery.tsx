'use client';

import { useState } from 'react';
import { EventPhoto } from '@/types';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { photoUrl } from '@/lib/mediaUrl';

interface Props {
  photos: EventPhoto[];
  supabaseUrl: string;
}

export default function PhotoGallery({ photos, supabaseUrl }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (photos.length === 0) return null;

  function getUrl(path: string) {
    return photoUrl(path, supabaseUrl);
  }

  function getThumbUrl(path: string) {
    return photoUrl(path, supabaseUrl);
  }

  function prev() {
    setLightboxIndex((i) => (i !== null ? (i - 1 + photos.length) % photos.length : null));
  }

  function next() {
    setLightboxIndex((i) => (i !== null ? (i + 1) % photos.length : null));
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
        {photos.map((photo, index) => (
          <button
            key={photo.id}
            onClick={() => setLightboxIndex(index)}
            className="aspect-square rounded-lg sm:rounded-xl overflow-hidden hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            <img
              src={getThumbUrl(photo.storage_path)}
              alt={photo.caption || 'Event photo'}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setLightboxIndex(null); }}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2"
          >
            <X className="h-6 w-6" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-4 text-white/80 hover:text-white p-2"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-4 text-white/80 hover:text-white p-2"
          >
            <ChevronRight className="h-8 w-8" />
          </button>
          <img
            src={getUrl(photos[lightboxIndex].storage_path)}
            alt={photos[lightboxIndex].caption || 'Event photo'}
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
