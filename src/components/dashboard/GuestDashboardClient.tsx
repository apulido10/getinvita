'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { EventType } from '@/types';
import { getEventTypeConfig } from '@/lib/constants';
import { getThemesForEventType, getThemeById } from '@/lib/themes';
import {
  FileText, Image, Music, Palette, ChevronRight, ChevronLeft,
  Upload, Trash2, Star, Loader2, Play, Pause, Music2, ImageIcon,
  Check, X, Plus, UtensilsCrossed, Crown, Lock, Globe, ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import AddressAutocomplete from './AddressAutocomplete';
import DatePicker from './DatePicker';
import SpotifySearch from './SpotifySearch';
import { createClient } from '@/lib/supabase/client';
import { saveGuestSession, loadGuestSession, clearGuestSession } from '@/lib/guestSession';
import { t, type Lang } from '@/lib/translations';
import { useRouter } from 'next/navigation';
import { nanoid } from 'nanoid';

type Step = 'details' | 'photos' | 'music' | 'theme';
const stepIds: Step[] = ['details', 'photos', 'music', 'theme'];
const stepIcons: Record<Step, React.ElementType> = {
  details: FileText,
  photos: Image,
  music: Music,
  theme: Palette,
};

interface GuestPhoto {
  id: string;
  file: File;
  blobUrl: string;
  isHero: boolean;
}

type GuestTrack =
  | { id: string; type: 'upload'; file: File; title: string }
  | { id: string; type: 'spotify'; spotifyTrackId: string; title: string; artist: string; previewUrl: string | null };

interface Props {
  eventType: EventType;
  eventName: string;
  eventDate: string;
  lang: Lang;
  isLoggedIn: boolean;
}

export default function GuestDashboardClient({ eventType, eventName, eventDate, lang, isLoggedIn }: Props) {
  const router = useRouter();
  const config = getEventTypeConfig(eventType);

  // ── Details state (persisted in localStorage) ─────────────────────────────
  const [name, setName] = useState(eventName);
  const [detailValues, setDetailValues] = useState<Record<string, string>>(() => {
    const session = loadGuestSession();
    if (session && session.type === eventType && session.name === eventName) {
      return session.details;
    }
    return {};
  });

  // ── Theme state (persisted in localStorage) ────────────────────────────────
  const themes = config ? getThemesForEventType(eventType) : [];
  const [themeId, setThemeId] = useState<string | null>(() => {
    const session = loadGuestSession();
    if (session && session.type === eventType && session.name === eventName) {
      return session.themeId;
    }
    return themes[0]?.id ?? null;
  });

  // ── Photos state (browser memory only) ────────────────────────────────────
  const [photos, setPhotos] = useState<GuestPhoto[]>([]);

  // ── Music state (browser memory only) ─────────────────────────────────────
  const [tracks, setTracks] = useState<GuestTrack[]>([]);

  // ── UI state ───────────────────────────────────────────────────────────────
  const [activeStep, setActiveStep] = useState<Step>('details');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [musicTab, setMusicTab] = useState<'upload' | 'spotify'>('upload');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingMusic, setUploadingMusic] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const musicInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentIndex = stepIds.indexOf(activeStep);
  const steps = stepIds.map((id) => ({
    id,
    label: t(`dash.step.${id}`, lang),
    icon: stepIcons[id],
  }));

  // Persist details + theme to localStorage whenever they change
  useEffect(() => {
    saveGuestSession({ type: eventType, name, date: eventDate, details: detailValues, themeId });
  }, [eventType, name, eventDate, detailValues, themeId]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      photos.forEach((p) => URL.revokeObjectURL(p.blobUrl));
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleDetailChange(key: string, value: string) {
    setDetailValues((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function toggleSection(id: 'reception' | 'dinner') {
    const key = `has_${id}`;
    const current = detailValues[key] === 'true';
    handleDetailChange(key, current ? 'false' : 'true');
  }

  function toggleMealType() {
    const current = detailValues['meal_type'] || 'dinner';
    handleDetailChange('meal_type', current === 'dinner' ? 'lunch' : 'dinner');
  }

  // ── Photo handlers ─────────────────────────────────────────────────────────
  const handlePhotoFiles = useCallback(async (files: FileList) => {
    setUploadingPhoto(true);
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue;
        const blobUrl = URL.createObjectURL(file);
        setPhotos((prev) => [
          ...prev,
          { id: nanoid(), file, blobUrl, isHero: prev.length === 0 },
        ]);
      }
    } finally {
      setUploadingPhoto(false);
    }
  }, []);

  function handleDeletePhoto(id: string) {
    setPhotos((prev) => {
      const removed = prev.find((p) => p.id === id);
      if (removed) URL.revokeObjectURL(removed.blobUrl);
      const remaining = prev.filter((p) => p.id !== id);
      if (removed?.isHero && remaining.length > 0) {
        remaining[0] = { ...remaining[0], isHero: true };
      }
      return remaining;
    });
  }

  function handleSetHero(id: string) {
    setPhotos((prev) => prev.map((p) => ({ ...p, isHero: p.id === id })));
  }

  // ── Music handlers ─────────────────────────────────────────────────────────
  function handleMusicFiles(files: FileList) {
    setUploadingMusic(true);
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('audio/')) continue;
        setTracks((prev) => [
          ...prev,
          { id: nanoid(), type: 'upload', file, title: file.name.replace(/\.[^/.]+$/, '') },
        ]);
      }
    } finally {
      setUploadingMusic(false);
    }
  }

  function handleSpotifySelect(track: { id: string; name: string; artist: string; previewUrl: string | null }) {
    setTracks((prev) => [
      ...prev,
      { id: nanoid(), type: 'spotify', spotifyTrackId: track.id, title: track.name, artist: track.artist, previewUrl: track.previewUrl },
    ]);
  }

  function handleDeleteTrack(id: string) {
    if (playingId === id) {
      audioRef.current?.pause();
      setPlayingId(null);
    }
    setTracks((prev) => prev.filter((t) => t.id !== id));
  }

  function togglePlay(track: GuestTrack) {
    if (track.type === 'spotify') return;
    if (playingId === track.id) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      const url = URL.createObjectURL(track.file);
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
        setPlayingId(track.id);
      }
    }
  }

  // ── Save / migrate ─────────────────────────────────────────────────────────
  async function handleSave() {
    // Always persist to localStorage first
    saveGuestSession({ type: eventType, name, date: eventDate, details: detailValues, themeId });

    if (!isLoggedIn) {
      const customizeUrl = `/order/customize?type=${eventType}&name=${encodeURIComponent(eventName)}&date=${encodeURIComponent(eventDate)}`;
      router.push(`/login?redirect=${encodeURIComponent(customizeUrl)}`);
      return;
    }

    setSaving(true);
    setError('');
    try {
      // 1. Create event
      const createRes = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_type: eventType, event_name: name, event_date: eventDate || null }),
      });
      const createData = await createRes.json();
      if (!createRes.ok || !createData.url) {
        setError(createData.error || 'Failed to create event.');
        return;
      }

      const eventId = (createData.url as string).replace('/dashboard/', '');

      // 2. Save details
      await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ details: detailValues, event_name: name }),
      });

      // 3. Save theme
      if (themeId) {
        await fetch(`/api/events/${eventId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ theme_id: themeId }),
        });
      }

      // 4. Upload photos
      const supabase = createClient();
      for (const photo of photos) {
        try {
          const postRes = await fetch(`/api/events/${eventId}/photos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileName: photo.file.name, contentType: photo.file.type }),
          });
          if (!postRes.ok) continue;
          const { storagePath, token } = await postRes.json();
          await supabase.storage.from('event-photos').uploadToSignedUrl(storagePath, token, photo.file, {
            contentType: photo.file.type || 'image/jpeg',
          });
        } catch {
          // Continue with other photos
        }
      }

      // 5. Upload music
      for (const track of tracks) {
        try {
          if (track.type === 'spotify') {
            await fetch(`/api/events/${eventId}/music`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                source: 'spotify',
                spotifyTrackId: track.spotifyTrackId,
                songTitle: track.title,
                artist: track.artist,
                previewUrl: track.previewUrl,
              }),
            });
          } else {
            const postRes = await fetch(`/api/events/${eventId}/music`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ fileName: track.file.name, songTitle: track.title, contentType: track.file.type }),
            });
            if (!postRes.ok) continue;
            const { storagePath, token } = await postRes.json();
            await supabase.storage.from('event-music').uploadToSignedUrl(storagePath, token, track.file, {
              contentType: track.file.type || 'audio/mpeg',
            });
          }
        } catch {
          // Continue with other tracks
        }
      }

      // 6. Clear guest session and redirect
      clearGuestSession();
      router.push(`/dashboard/${eventId}`);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (!config) return null;

  const mealType = detailValues['meal_type'] || 'dinner';

  function renderField(field: { key: string; label: string; type: string; placeholder?: string }) {
    if (field.type === 'textarea') {
      return (
        <textarea
          value={detailValues[field.key] || ''}
          onChange={(e) => handleDetailChange(field.key, e.target.value)}
          placeholder={field.placeholder}
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none resize-none"
        />
      );
    }
    if (field.type === 'address') {
      return (
        <AddressAutocomplete
          value={detailValues[field.key] || ''}
          onChange={(val) => handleDetailChange(field.key, val)}
          placeholder={field.placeholder}
        />
      );
    }
    if (field.type === 'date') {
      return (
        <DatePicker
          value={detailValues[field.key] || ''}
          onChange={(val) => handleDetailChange(field.key, val)}
          placeholder={field.placeholder}
        />
      );
    }
    return (
      <input
        type={field.type}
        value={detailValues[field.key] || ''}
        onChange={(e) => handleDetailChange(field.key, e.target.value)}
        placeholder={field.placeholder}
        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
      />
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-gray-50">
      <audio ref={audioRef} onEnded={() => setPlayingId(null)} />

      {/* Header */}
      <div className="bg-white border-b">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <Link
              href={`/order?type=${eventType}&name=${encodeURIComponent(eventName)}&date=${encodeURIComponent(eventDate)}`}
              className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>

            <div className="flex items-center gap-3">
              {error && <p className="text-xs text-red-600 hidden sm:block">{error}</p>}
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-purple-600 text-white px-4 py-2 text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                <Globe className="h-4 w-4" />
                {saving ? 'Creating…' : isLoggedIn ? `Build My Site — $${(config.price / 100).toFixed(0)}` : 'Sign Up to Build'}
              </button>
            </div>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{name || eventName}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{config.label}</p>
          </div>
        </div>
      </div>

      {/* Guest banner */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-sm text-amber-800">
        Your customizations are auto-saved in your browser. Create your account to permanently save everything.
      </div>

      {/* Step indicator */}
      <div className="bg-white border-b">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            {steps.map((step, i) => (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1.5 group"
              >
                <div className={`flex items-center justify-center h-7 w-7 rounded-full text-xs font-bold transition-colors ${
                  i < currentIndex
                    ? 'bg-purple-600 text-white'
                    : i === currentIndex
                    ? 'bg-purple-600 text-white ring-2 ring-purple-200'
                    : 'bg-gray-200 text-gray-500 group-hover:bg-gray-300'
                }`}>
                  {i + 1}
                </div>
                <span className={`text-[10px] sm:text-sm font-medium transition-colors ${
                  i === currentIndex ? 'text-purple-600' : 'text-gray-500 group-hover:text-gray-700'
                }`}>
                  {step.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 sm:py-8">

        {/* ── Details panel ── */}
        {activeStep === 'details' && (
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">{t('dash.eventDetails', lang)}</h2>
              <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                <Check className="h-3.5 w-3.5" /> Auto-saved
              </span>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('dash.eventName', lang)} <span className="text-red-500 ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setSaved(false); }}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                />
                <p className="text-xs text-gray-400 mt-1">{t('dash.eventNameHelper', lang)}</p>
              </div>

              {config.fields.map((field) => (
                <div key={field.key} className={field.type === 'textarea' ? 'sm:col-span-2' : ''}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-0.5">*</span>}
                  </label>
                  {renderField(field)}
                </div>
              ))}
            </div>

            {config.optionalSections && config.optionalSections.length > 0 && (
              <div className="mt-6 space-y-4">
                {config.optionalSections.map((section) => {
                  const isEnabled = detailValues[`has_${section.id}`] === 'true';
                  const isDinner = section.id === 'dinner';
                  const sectionLabel = isDinner
                    ? (mealType === 'lunch' ? section.label.replace('Dinner', 'Lunch') : section.label)
                    : section.label;

                  return (
                    <div key={section.id} className="border border-dashed border-gray-200 rounded-xl overflow-hidden">
                      <button
                        type="button"
                        onClick={() => toggleSection(section.id)}
                        className={`w-full flex items-center justify-between px-4 py-3 text-sm font-semibold transition-colors ${
                          isEnabled ? 'bg-purple-50 text-purple-700' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {isDinner && <UtensilsCrossed className="h-4 w-4" />}
                          {isEnabled ? sectionLabel : `+ Add ${sectionLabel}`}
                          {section.addOnPrice > 0 && (
                            <span className="text-xs font-normal text-gray-400">+$10</span>
                          )}
                        </span>
                        {isEnabled ? <X className="h-4 w-4 text-purple-400" /> : <Plus className="h-4 w-4 text-gray-400" />}
                      </button>
                      {isEnabled && (
                        <div className="px-4 pb-4 pt-3 grid sm:grid-cols-2 gap-4 bg-white">
                          {isDinner && (
                            <div className="sm:col-span-2 flex items-center gap-3">
                              <span className="text-xs font-medium text-gray-500">Meal type:</span>
                              <button
                                type="button"
                                onClick={toggleMealType}
                                className="flex items-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600 overflow-hidden"
                              >
                                <span className={`px-3 py-1.5 transition-colors ${mealType === 'dinner' ? 'bg-purple-600 text-white' : ''}`}>Dinner</span>
                                <span className={`px-3 py-1.5 transition-colors ${mealType === 'lunch' ? 'bg-purple-600 text-white' : ''}`}>Lunch</span>
                              </button>
                            </div>
                          )}
                          {section.fields.map((field) => (
                            <div key={field.key} className={field.type === 'textarea' || field.type === 'address' ? 'sm:col-span-2' : ''}>
                              <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                              {renderField(field)}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Photos panel ── */}
        {activeStep === 'photos' && (
          <div className="space-y-6">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files.length) handlePhotoFiles(e.dataTransfer.files); }}
              onClick={() => photoInputRef.current?.click()}
              className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
            >
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => e.target.files && handlePhotoFiles(e.target.files)}
                className="hidden"
              />
              {uploadingPhoto ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
                  <p className="text-sm text-gray-600">{t('dash.uploading', lang)}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-8 w-8 text-gray-400" />
                  <p className="text-sm font-medium text-gray-700">{t('dash.dragDropPhotos', lang)}</p>
                  <p className="text-xs text-gray-500">{t('dash.photoFormats', lang)}</p>
                </div>
              )}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
              Photos are stored in your browser for this session. They&apos;ll be uploaded when you save your site.
            </div>

            {photos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map((photo) => (
                  <div key={photo.id} className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 border">
                    <img src={photo.blobUrl} alt="Event photo" className="w-full h-full object-cover" />
                    {photo.isHero && (
                      <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 rounded-full px-2.5 py-1 text-xs font-bold flex items-center gap-1 shadow-md">
                        <Star className="h-3.5 w-3.5 fill-current" /> {t('dash.coverPhoto', lang)}
                      </div>
                    )}
                    {!photo.isHero && (
                      <div className="absolute top-2 left-2">
                        <button
                          onClick={() => handleSetHero(photo.id)}
                          className="bg-white/90 backdrop-blur-sm text-yellow-600 hover:bg-yellow-50 rounded-full px-2.5 py-1 text-xs font-medium flex items-center gap-1 shadow-md"
                        >
                          <Star className="h-3.5 w-3.5" /> {t('dash.setAsCover', lang)}
                        </button>
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <button
                        onClick={() => handleDeletePhoto(photo.id)}
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
                <p className="text-sm text-gray-500">{t('dash.noPhotosYet', lang)}</p>
              </div>
            )}
          </div>
        )}

        {/* ── Music panel ── */}
        {activeStep === 'music' && (
          <div className="space-y-6">
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setMusicTab('upload')}
                className={`flex-1 text-sm font-medium py-2 px-4 rounded-md transition-colors ${musicTab === 'upload' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {t('dash.uploadMP3', lang)}
              </button>
              <button
                onClick={() => setMusicTab('spotify')}
                className={`flex-1 text-sm font-medium py-2 px-4 rounded-md transition-colors ${musicTab === 'spotify' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {t('dash.searchSpotify', lang)}
              </button>
            </div>

            {musicTab === 'upload' && (
              <div
                onClick={() => musicInputRef.current?.click()}
                className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
              >
                <input
                  ref={musicInputRef}
                  type="file"
                  accept="audio/*"
                  multiple
                  onChange={(e) => e.target.files && handleMusicFiles(e.target.files)}
                  className="hidden"
                />
                {uploadingMusic ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-8 w-8 text-gray-400" />
                    <p className="text-sm font-medium text-gray-700">{t('dash.clickToUploadMusic', lang)}</p>
                    <p className="text-xs text-gray-500">{t('dash.audioFormats', lang)}</p>
                  </div>
                )}
              </div>
            )}

            {musicTab === 'spotify' && (
              <>
                <SpotifySearch onSelect={handleSpotifySelect} lang={lang} />
                <p className="text-xs text-gray-400 text-center mt-2">{t('dash.spotifyNote', lang)}</p>
              </>
            )}

            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
              Music tracks are stored in your browser for this session. They&apos;ll be saved when you build your site.
            </div>

            {tracks.length > 0 ? (
              <div className="bg-white rounded-xl border divide-y">
                {tracks.map((track) => (
                  <div key={track.id} className="flex items-center gap-4 p-4">
                    {track.type === 'spotify' ? (
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
                        {playingId === track.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                      </button>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{track.title || 'Untitled'}</p>
                      {track.type === 'spotify' && <p className="text-xs text-gray-500 truncate">{track.artist}</p>}
                    </div>
                    <button onClick={() => handleDeleteTrack(track.id)} className="shrink-0 p-2 text-gray-400 hover:text-red-600 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border p-8 text-center">
                <Music2 className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">{t('dash.noMusicYet', lang)}</p>
              </div>
            )}
          </div>
        )}

        {/* ── Theme panel ── */}
        {activeStep === 'theme' && (
          <GuestThemePanel
            eventType={eventType}
            selectedId={themeId}
            onSelect={(id) => setThemeId(id)}
          />
        )}

        {/* Navigation arrows */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={() => setActiveStep(steps[currentIndex - 1].id)}
            disabled={currentIndex === 0}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-0 disabled:pointer-events-none transition-all"
          >
            <ChevronLeft className="h-4 w-4" />
            {currentIndex > 0 ? steps[currentIndex - 1].label : ''}
          </button>

          {currentIndex < steps.length - 1 ? (
            <button
              onClick={() => setActiveStep(steps[currentIndex + 1].id)}
              className="inline-flex items-center gap-2 rounded-lg bg-purple-600 text-white px-4 py-2.5 text-sm font-semibold hover:bg-purple-700 transition-all"
            >
              {steps[currentIndex + 1].label}
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-purple-600 text-white px-6 py-2.5 text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 transition-all"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              <Globe className="h-4 w-4" />
              {saving ? 'Creating…' : isLoggedIn ? `Build My Site — $${(config.price / 100).toFixed(0)}` : 'Sign Up to Build'}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

// ── Guest Theme Panel (no API calls) ──────────────────────────────────────────

function MiniThemePreview({ theme }: { theme: { colors: { hero: string; heroText: string; accent: string; background: string; text: string; textSecondary: string }; layout: string } }) {
  const { colors, layout } = theme;

  if (layout === 'split') {
    return (
      <div className="w-full aspect-[4/3] rounded-lg overflow-hidden border border-gray-200 flex">
        <div className="w-1/2 flex flex-col items-center justify-center p-2" style={{ backgroundColor: colors.hero }}>
          <div className="h-1 w-8 rounded mb-1" style={{ backgroundColor: colors.heroText, opacity: 0.5 }} />
          <div className="h-2 w-16 rounded mb-1" style={{ backgroundColor: colors.heroText }} />
          <div className="h-1 w-10 rounded" style={{ backgroundColor: colors.heroText, opacity: 0.7 }} />
        </div>
        <div className="w-1/2" style={{ backgroundColor: colors.accent }} />
      </div>
    );
  }
  if (layout === 'minimal') {
    return (
      <div className="w-full aspect-[4/3] rounded-lg overflow-hidden border border-gray-200 flex flex-col" style={{ backgroundColor: colors.background }}>
        <div className="flex-1 flex flex-col items-center justify-center p-2">
          <div className="h-1 w-6 rounded mb-1" style={{ backgroundColor: colors.textSecondary }} />
          <div className="h-2 w-20 rounded mb-1" style={{ backgroundColor: colors.text }} />
          <div className="h-1 w-12 rounded" style={{ backgroundColor: colors.textSecondary }} />
        </div>
        <div className="h-1/3 mx-3 mb-2 rounded" style={{ backgroundColor: colors.accent, opacity: 0.3 }} />
      </div>
    );
  }
  return (
    <div className="w-full aspect-[4/3] rounded-lg overflow-hidden border border-gray-200 flex flex-col" style={{ backgroundColor: colors.background }}>
      <div className="h-1/2 flex items-center justify-center" style={{ backgroundColor: colors.hero }}>
        <div className="text-center">
          <div className="h-1 w-6 rounded mx-auto mb-1" style={{ backgroundColor: colors.heroText, opacity: 0.5 }} />
          <div className="h-2 w-14 rounded mx-auto" style={{ backgroundColor: colors.heroText }} />
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-2 gap-1">
        <div className="h-1 w-16 rounded" style={{ backgroundColor: colors.text }} />
        <div className="h-1 w-10 rounded" style={{ backgroundColor: colors.textSecondary }} />
        <div className="h-3 w-12 rounded mt-1" style={{ backgroundColor: colors.accent }} />
      </div>
    </div>
  );
}

function GuestThemePanel({ eventType, selectedId, onSelect }: { eventType: EventType; selectedId: string | null; onSelect: (id: string) => void }) {
  const themes = getThemesForEventType(eventType);
  const freeThemes = themes.filter((t) => !t.isPremium);
  const premiumThemes = themes.filter((t) => t.isPremium);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Choose Your Theme</h2>
        <p className="text-sm text-gray-500 mb-6">Pick a look for your site. You can change it anytime.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {freeThemes.map((theme) => {
            const isSelected = selectedId === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => onSelect(theme.id)}
                className={`relative w-full text-left rounded-xl border-2 p-3 transition-all hover:shadow-md ${
                  isSelected ? 'border-purple-600 ring-2 ring-purple-200' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-purple-600 flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
                <MiniThemePreview theme={theme} />
                <h3 className="text-sm font-semibold text-gray-900 mt-2">{theme.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{theme.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-center gap-2 mb-1">
          <Crown className="h-5 w-5 text-amber-500" />
          <h2 className="text-lg font-bold text-gray-900">Premium Layouts</h2>
        </div>
        <p className="text-sm text-gray-500 mb-6">Unique layouts included with your site — select one before saving.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {premiumThemes.map((theme) => {
            const isSelected = selectedId === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => onSelect(theme.id)}
                className={`relative w-full text-left rounded-xl border-2 p-3 transition-all hover:shadow-md ${
                  isSelected ? 'border-purple-600 ring-2 ring-purple-200' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-purple-600 flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
                <MiniThemePreview theme={theme} />
                <h3 className="text-sm font-semibold text-gray-900 mt-2">{theme.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{theme.description}</p>
                <span className="inline-block mt-1.5 text-[10px] uppercase tracking-wider font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                  {theme.layout} layout
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
