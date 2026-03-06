'use client';

import { useState, useRef, useEffect } from 'react';
import { FullEventData, EventPhoto, EventMusic } from '@/types';
import { getEventTypeConfig, CARD_EVENT_TYPES } from '@/lib/constants';
import { getThemeById, getDefaultTheme } from '@/lib/themes';
import EventDetailsForm, { EventDetailsFormRef } from './EventDetailsForm';
import GuestPhotoUploader from './GuestPhotoUploader';
import GuestMusicUploader from './GuestMusicUploader';
import ThemePicker from './ThemePicker';
import {
  FileText,
  Image,
  Music,
  Globe,
  Eye,
  X,
  ChevronRight,
  ChevronLeft,
  Palette,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import * as guestStore from '@/lib/guestStore';
import WeddingTemplate from '@/components/templates/WeddingTemplate';
import Sweet15Template from '@/components/templates/Sweet15Template';
import BirthdayTemplate from '@/components/templates/BirthdayTemplate';
import BabyShowerTemplate from '@/components/templates/BabyShowerTemplate';

type Step = 'details' | 'photos' | 'music' | 'theme';

const stepIds: Step[] = ['details', 'photos', 'music', 'theme'];
const stepIcons: Record<Step, React.ElementType> = {
  details: FileText,
  photos: Image,
  music: Music,
  theme: Palette,
};
const stepLabels: Record<Step, string> = {
  details: 'Details',
  photos: 'Photos',
  music: 'Music',
  theme: 'Theme',
};

interface Props {
  initialData: FullEventData;
}

export default function GuestDashboardClient({ initialData }: Props) {
  const [data, setData] = useState(initialData);
  const [photos, setPhotos] = useState<EventPhoto[]>([]);
  const [music, setMusic] = useState<EventMusic[]>([]);
  const [activeStep, setActiveStep] = useState<Step>('details');
  const [showPreview, setShowPreview] = useState(false);
  const detailsFormRef = useRef<EventDetailsFormRef>(null);

  const config = getEventTypeConfig(data.event.event_type);
  const isCardEvent = CARD_EVENT_TYPES.includes(data.event.event_type);

  const steps = stepIds
    .filter((id) => !(isCardEvent && id === 'theme'))
    .map((id) => ({ id, label: stepLabels[id], icon: stepIcons[id] }));

  const currentIndex = steps.findIndex((s) => s.id === activeStep);

  const selectedTheme =
    data.event.theme_id
      ? getThemeById(data.event.theme_id)
      : getDefaultTheme(data.event.event_type);

  // Persist details + theme to localStorage whenever they change
  useEffect(() => {
    const meta = guestStore.loadMeta();
    if (!meta) return;
    guestStore.saveMeta({
      ...meta,
      themeId: data.event.theme_id,
    });
  }, [data.event.theme_id]);

  async function changeStep(newStep: Step) {
    if (activeStep === 'details' && newStep !== 'details') {
      await detailsFormRef.current?.save();
    }
    setActiveStep(newStep);
  }

  async function handleDetailsSave(values: Record<string, string>, eventName: string) {
    const meta = guestStore.loadMeta();
    if (meta) {
      guestStore.saveMeta({ ...meta, details: values, eventName });
    }
    // Update local state with new details
    const updatedDetails = Object.entries(values).map(([key, value], i) => ({
      id: String(i),
      event_id: 'guest',
      detail_key: key,
      detail_value: value,
      created_at: new Date().toISOString(),
    }));
    setData((prev) => ({
      ...prev,
      event: { ...prev.event, event_name: eventName },
      details: updatedDetails,
    }));
  }

  function handlePayAndPublish() {
    // Save current state to localStorage before navigating
    const meta = guestStore.loadMeta();
    if (meta) {
      guestStore.saveMeta({
        ...meta,
        themeId: data.event.theme_id,
      });
    }
    window.location.href = `/login?signup=1&redirect=${encodeURIComponent('/guest/flush')}`;
  }

  // Build preview data combining current state with local photos/music
  const previewData: FullEventData = {
    ...data,
    photos,
    music,
  };

  const TemplateComponent =
    data.event.event_type === 'wedding'
      ? WeddingTemplate
      : data.event.event_type === 'sweet15'
      ? Sweet15Template
      : data.event.event_type === 'baby_shower'
      ? BabyShowerTemplate
      : BirthdayTemplate;

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Guest banner */}
      <div className="bg-purple-600 px-6 py-2 text-center text-sm text-white">
        Your progress is saved in this browser. Sign up to save it permanently and publish your site.
      </div>

      {/* Header */}
      <div className="bg-white border-b">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <Link
              href="/order"
              className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <button
              onClick={() => setShowPreview(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Eye className="h-4 w-4" />
              Preview Site
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{data.event.event_name}</h1>
              <p className="text-sm text-gray-500 mt-0.5">{config?.label}</p>
            </div>
            <button
              onClick={handlePayAndPublish}
              className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 text-white px-4 py-2 text-sm font-semibold hover:bg-purple-700 transition-colors"
            >
              <Globe className="h-4 w-4" />
              Save & Publish — ${config ? (config.price / 100).toFixed(0) : ''}
            </button>
          </div>
        </div>
      </div>

      {/* Step indicator */}
      <div className="bg-white border-b">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <button
                  key={step.id}
                  onClick={() => changeStep(step.id)}
                  className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1.5 group"
                >
                  <div
                    className={`flex items-center justify-center h-7 w-7 rounded-full text-xs font-bold transition-colors ${
                      i < currentIndex
                        ? 'bg-purple-600 text-white'
                        : i === currentIndex
                        ? 'bg-purple-600 text-white ring-2 ring-purple-200'
                        : 'bg-gray-200 text-gray-500 group-hover:bg-gray-300'
                    }`}
                  >
                    {i + 1}
                  </div>
                  <span
                    className={`text-[10px] sm:text-sm font-medium transition-colors ${
                      i === currentIndex ? 'text-purple-600' : 'text-gray-500 group-hover:text-gray-700'
                    }`}
                  >
                    {step.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 sm:py-8">
        <div className={activeStep !== 'details' ? 'hidden' : ''}>
          <EventDetailsForm
            ref={detailsFormRef}
            event={data.event}
            details={data.details}
            lang="en"
            onUpdate={(details) => setData((prev) => ({ ...prev, details }))}
            onEventNameChange={(name) =>
              setData((prev) => ({ ...prev, event: { ...prev.event, event_name: name } }))
            }
            onSave={handleDetailsSave}
          />
        </div>
        <div className={activeStep !== 'photos' ? 'hidden' : ''}>
          <GuestPhotoUploader onUpdate={(p) => setPhotos(p)} />
        </div>
        <div className={activeStep !== 'music' ? 'hidden' : ''}>
          <GuestMusicUploader onUpdate={(m) => setMusic(m)} />
        </div>
        {activeStep === 'theme' && (
          <>
            <ThemePicker
              event={data.event}
              data={data}
              supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL!}
              lang="en"
              isGuest
              onThemeChange={(themeId) => {
                setData((prev) => ({
                  ...prev,
                  event: { ...prev.event, theme_id: themeId },
                }));
              }}
            />
            <div className="mt-6 text-center">
              <button
                onClick={handlePayAndPublish}
                className="inline-flex items-center gap-2 rounded-lg bg-purple-600 text-white px-6 py-3 text-sm font-semibold hover:bg-purple-700 transition-colors"
              >
                <Globe className="h-4 w-4" />
                Save & Publish — ${config ? (config.price / 100).toFixed(0) : ''}
              </button>
              <p className="text-xs text-gray-400 mt-2">
                Create a free account to save your work and go live.
              </p>
            </div>
          </>
        )}

        {/* Navigation arrows */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={() => changeStep(steps[currentIndex - 1].id)}
            disabled={currentIndex === 0}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-0 disabled:pointer-events-none transition-all"
          >
            <ChevronLeft className="h-4 w-4" />
            {currentIndex > 0 ? steps[currentIndex - 1].label : ''}
          </button>
          <button
            onClick={() => changeStep(steps[currentIndex + 1].id)}
            disabled={currentIndex === steps.length - 1}
            className="inline-flex items-center gap-2 rounded-lg bg-purple-600 text-white px-4 py-2.5 text-sm font-semibold hover:bg-purple-700 disabled:opacity-0 disabled:pointer-events-none transition-all"
          >
            {currentIndex < steps.length - 1 ? steps[currentIndex + 1].label : ''}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Preview modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black/70 flex flex-col">
          <div className="bg-white border-b px-4 py-3 flex items-center justify-between shrink-0">
            <span className="text-sm font-semibold text-gray-900">Site Preview</span>
            <button
              onClick={() => setShowPreview(false)}
              className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto bg-white">
            <TemplateComponent
              data={previewData}
              supabaseUrl=""
              theme={selectedTheme ?? undefined}
              lang="en"
            />
          </div>
        </div>
      )}
    </main>
  );
}
