'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { EventPhoto } from '@/types';
import { Upload, Star, Trash2, Loader2, ImageIcon } from 'lucide-react';
import { nanoid } from 'nanoid';
import * as guestStore from '@/lib/guestStore';

interface LocalPhoto {
  record: guestStore.GuestPhotoRecord;
  blobUrl: string;
}

interface Props {
  onUpdate: (photos: EventPhoto[]) => void;
}

function toEventPhoto(p: LocalPhoto): EventPhoto {
  return {
    id: p.record.id,
    event_id: 'guest',
    storage_path: p.blobUrl,
    caption: null,
    display_order: p.record.displayOrder,
    is_hero: p.record.isHero,
    created_at: new Date().toISOString(),
  };
}

export default function GuestPhotoUploader({ onUpdate }: Props) {
  const [photos, setPhotos] = useState<LocalPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const didLoad = useRef(false);

  // Load persisted photos from IndexedDB on mount
  useEffect(() => {
    if (didLoad.current) return;
    didLoad.current = true;
    guestStore.loadPhotos().then((records) => {
      const loaded: LocalPhoto[] = records.map((record) => ({
        record,
        blobUrl: URL.createObjectURL(new Blob([record.data], { type: record.contentType })),
      }));
      setPhotos(loaded);
      onUpdate(loaded.map(toEventPhoto));
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFiles = useCallback(
    async (files: FileList) => {
      setUploading(true);
      setError(null);
      try {
        const newPhotos: LocalPhoto[] = [];
        for (const file of Array.from(files)) {
          if (!file.type.startsWith('image/')) {
            setError(`"${file.name}" is not an image file.`);
            continue;
          }
          const data = await file.arrayBuffer();
          const id = nanoid();
          const isFirstPhoto = photos.length === 0 && newPhotos.length === 0;
          const record: guestStore.GuestPhotoRecord = {
            id,
            fileName: file.name,
            contentType: file.type,
            data,
            isHero: isFirstPhoto,
            displayOrder: photos.length + newPhotos.length,
          };
          await guestStore.savePhoto(record);
          const blobUrl = URL.createObjectURL(new Blob([data], { type: file.type }));
          newPhotos.push({ record, blobUrl });
        }
        const updated = [...photos, ...newPhotos];
        setPhotos(updated);
        onUpdate(updated.map(toEventPhoto));
      } finally {
        setUploading(false);
      }
    },
    [photos, onUpdate]
  );

  async function handleDelete(id: string) {
    const photo = photos.find((p) => p.record.id === id);
    if (photo) URL.revokeObjectURL(photo.blobUrl);
    await guestStore.deletePhoto(id);

    let updated = photos.filter((p) => p.record.id !== id);
    // If we deleted the hero and there are remaining photos, assign new hero
    const deletedWasHero = photo?.record.isHero;
    if (deletedWasHero && updated.length > 0) {
      updated = updated.map((p, i) => ({
        ...p,
        record: { ...p.record, isHero: i === 0 },
      }));
      await guestStore.savePhoto(updated[0].record);
    }
    // Fix display orders
    updated = updated.map((p, i) => ({
      ...p,
      record: { ...p.record, displayOrder: i },
    }));
    setPhotos(updated);
    onUpdate(updated.map(toEventPhoto));
  }

  async function handleSetHero(id: string) {
    const updated = photos.map((p) => ({
      ...p,
      record: { ...p.record, isHero: p.record.id === id },
    }));
    for (const p of updated) await guestStore.savePhoto(p.record);
    setPhotos(updated);
    onUpdate(updated.map(toEventPhoto));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  }

  return (
    <div className="space-y-6">
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
            <p className="text-sm text-gray-600">Processing…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-gray-400" />
            <p className="text-sm font-medium text-gray-700">Drag & drop photos or click to browse</p>
            <p className="text-xs text-gray-500">JPG, PNG, WEBP supported</p>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>
      )}

      {photos.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div
              key={photo.record.id}
              className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 border"
            >
              <img
                src={photo.blobUrl}
                alt="Event photo"
                className="w-full h-full object-cover"
              />
              {photo.record.isHero && (
                <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 rounded-full px-2.5 py-1 text-xs font-bold flex items-center gap-1 shadow-md">
                  <Star className="h-3.5 w-3.5 fill-current" /> Cover
                </div>
              )}
              {!photo.record.isHero && (
                <div className="absolute top-2 left-2">
                  <button
                    onClick={() => handleSetHero(photo.record.id)}
                    className="bg-white/90 backdrop-blur-sm text-yellow-600 hover:bg-yellow-50 rounded-full px-2.5 py-1 text-xs font-medium flex items-center gap-1 shadow-md"
                  >
                    <Star className="h-3.5 w-3.5" /> Set as cover
                  </button>
                </div>
              )}
              <div className="absolute top-2 right-2">
                <button
                  onClick={() => handleDelete(photo.record.id)}
                  className="rounded-full bg-white/90 backdrop-blur-sm p-2 text-red-600 hover:bg-red-50 shadow-md"
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
          <p className="text-sm text-gray-500">No photos yet</p>
        </div>
      )}
    </div>
  );
}
