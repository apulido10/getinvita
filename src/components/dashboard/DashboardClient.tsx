'use client';

import { useState, useRef, useEffect } from 'react';
import { FullEventData } from '@/types';
import { getEventTypeConfig, CARD_EVENT_TYPES } from '@/lib/constants';
import { getThemeById } from '@/lib/themes';
import EventDetailsForm, { EventDetailsFormRef } from './EventDetailsForm';
import PhotoUploader from './PhotoUploader';
import MusicUploader from './MusicUploader';
import ThemePicker from './ThemePicker';
import { FileText, Image, Music, Users, Globe, Eye, ArrowLeft, LogOut, Link2, Check, ChevronRight, ChevronLeft, Trash2, X, Palette, Printer } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { t, type Lang } from '@/lib/translations';

type Step = 'details' | 'photos' | 'music' | 'theme' | 'rsvps';

const stepIds: Step[] = ['details', 'photos', 'music', 'theme', 'rsvps'];
const stepIcons: Record<Step, React.ElementType> = {
  details: FileText,
  photos: Image,
  music: Music,
  theme: Palette,
  rsvps: Users,
};
const stepLabelKeys: Record<Step, string> = {
  details: 'dash.step.details',
  photos: 'dash.step.photos',
  music: 'dash.step.music',
  theme: 'dash.step.theme',
  rsvps: 'dash.step.rsvps',
};

export default function DashboardClient({ initialData, lang }: { initialData: FullEventData; lang: Lang }) {
  const [data, setData] = useState(initialData);
  const [activeStep, setActiveStep] = useState<Step>('details');

  const langParam = lang === 'es' ? '?lang=es' : '';

  // Read ?tab= param on mount to jump to a specific tab
  useEffect(() => {
    const tab = new URLSearchParams(window.location.search).get('tab') as Step | null;
    if (tab && stepIds.includes(tab)) {
      setActiveStep(tab);
    }
  }, []);
  const [publishing, setPublishing] = useState(false);
  const [copiedEn, setCopiedEn] = useState(false);
  const [copiedEs, setCopiedEs] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const detailsFormRef = useRef<EventDetailsFormRef>(null);

  const config = getEventTypeConfig(data.event.event_type);
  const isCardEvent = CARD_EVENT_TYPES.includes(data.event.event_type);

  const steps = stepIds
    .filter((id) => !(isCardEvent && id === 'rsvps'))
    .map((id) => ({ id, label: t(stepLabelKeys[id], lang), icon: stepIcons[id] }));

  const isPublished = data.event.status === 'published';
  const currentIndex = steps.findIndex((s) => s.id === activeStep);

  const selectedTheme = data.event.theme_id ? getThemeById(data.event.theme_id) : null;
  const hasPremiumAddon = selectedTheme?.isPremium && !data.event.theme_premium_paid;

  async function changeStep(newStep: Step) {
    if (activeStep === 'details' && newStep !== 'details') {
      await detailsFormRef.current?.save();
    }
    setActiveStep(newStep);
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/login';
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/events/${data.event.id}`, { method: 'DELETE' });
      if (res.ok) {
        window.location.href = `/dashboard${langParam}`;
      }
    } finally {
      setDeleting(false);
    }
  }

  async function handlePublish() {
    setPublishing(true);
    try {
      const res = await fetch(`/api/events/${data.event.id}/checkout`, { method: 'POST' });
      const json = await res.json();
      if (res.ok && json.url) {
        window.location.href = json.url;
      }
    } finally {
      setPublishing(false);
    }
  }

  const toggleLang = () => {
    const url = new URL(window.location.href);
    if (lang === 'en') {
      url.searchParams.set('lang', 'es');
    } else {
      url.searchParams.delete('lang');
    }
    window.location.href = url.toString();
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <Link
              href={`/dashboard${langParam}`}
              className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('dash.back', lang)}
            </Link>
            <div className="flex items-center gap-3">
              {/* Language toggle */}
              <button
                onClick={toggleLang}
                className="flex items-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600 overflow-hidden"
              >
                <span className={`px-2.5 py-1.5 transition-colors ${lang === 'en' ? 'bg-purple-600 text-white' : ''}`}>
                  EN
                </span>
                <span className={`px-2.5 py-1.5 transition-colors ${lang === 'es' ? 'bg-purple-600 text-white' : ''}`}>
                  ES
                </span>
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">{t('dash.delete', lang)}</span>
              </button>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
                title={t('dash.signOut', lang)}
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">{t('dash.signOut', lang)}</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{data.event.event_name}</h1>
              <p className="text-sm text-gray-500 mt-0.5">{config?.label}</p>
            </div>

            <div className="flex items-center justify-end gap-2">
              {isPublished ? (
                <>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 border border-green-200 px-3 py-1.5 text-xs font-semibold text-green-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    {t('dash.live', lang)}
                  </span>
                  <Link
                    href={lang === 'es' ? `/es/events/${data.event.slug}` : `/events/${data.event.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    {t('dash.view', lang)}
                  </Link>
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/events/${data.event.slug}`;
                      navigator.clipboard.writeText(url);
                      setCopiedEn(true);
                      setTimeout(() => setCopiedEn(false), 2000);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    {copiedEn ? <Check className="h-4 w-4 text-green-600" /> : <Link2 className="h-4 w-4" />}
                    {copiedEn ? t('dash.copied', lang) : t('dash.englishLink', lang)}
                  </button>
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/es/events/${data.event.slug}`;
                      navigator.clipboard.writeText(url);
                      setCopiedEs(true);
                      setTimeout(() => setCopiedEs(false), 2000);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    {copiedEs ? <Check className="h-4 w-4 text-green-600" /> : <Link2 className="h-4 w-4" />}
                    {copiedEs ? t('dash.copied', lang) : t('dash.spanishLink', lang)}
                  </button>
                </>
              ) : (
                <button
                  onClick={handlePublish}
                  disabled={publishing}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 text-white px-4 py-2 text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 transition-colors"
                >
                  <Globe className="h-4 w-4" />
                  {publishing
                    ? t('dash.redirecting', lang)
                    : hasPremiumAddon
                    ? t('dash.payPublishPremium', lang)
                    : t('dash.payPublish', lang)}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Step indicator */}
      <div className="bg-white border-b">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            {steps.map((step, i) => (
              <button
                key={step.id}
                onClick={() => changeStep(step.id)}
                className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1.5 group"
              >
                <div className={`flex items-center justify-center h-7 w-7 sm:h-7 sm:w-7 rounded-full text-xs font-bold transition-colors ${
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
        {activeStep === 'details' && (
          <EventDetailsForm
            ref={detailsFormRef}
            event={data.event}
            details={data.details}
            lang={lang}
            onUpdate={(details) => setData((prev) => ({ ...prev, details }))}
            onEventNameChange={(name) => setData((prev) => ({ ...prev, event: { ...prev.event, event_name: name } }))}
          />
        )}
        {activeStep === 'photos' && (
          <PhotoUploader
            event={data.event}
            photos={data.photos}
            lang={lang}
            onUpdate={(photos) => setData((prev) => ({ ...prev, photos }))}
          />
        )}
        {activeStep === 'music' && (
          <MusicUploader
            event={data.event}
            music={data.music}
            lang={lang}
            onUpdate={(music) => setData((prev) => ({ ...prev, music }))}
          />
        )}
        {activeStep === 'theme' && (
          <>
            <ThemePicker
              event={data.event}
              data={data}
              supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL!}
              lang={lang}
              onThemeChange={(themeId) =>
                setData((prev) => ({
                  ...prev,
                  event: { ...prev.event, theme_id: themeId },
                }))
              }
            />
            {!isPublished && (
              <div className="mt-6 text-center">
                <button
                  onClick={handlePublish}
                  disabled={publishing}
                  className="inline-flex items-center gap-2 rounded-lg bg-purple-600 text-white px-6 py-3 text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 transition-colors"
                >
                  <Globe className="h-4 w-4" />
                  {publishing
                    ? t('dash.redirecting', lang)
                    : hasPremiumAddon
                    ? t('dash.payPublishPremium', lang)
                    : t('dash.payPublish', lang)}
                </button>
                <p className="text-xs text-gray-400 mt-2">{t('dash.readyPublish', lang)}</p>
              </div>
            )}
          </>
        )}
        {activeStep === 'rsvps' && (
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">{t('dash.guestRSVPs', lang)}</h2>
              {data.rsvps.length > 0 && (
                <button
                  onClick={() => window.print()}
                  className="print:hidden inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Printer className="h-4 w-4" />
                  {t('dash.print', lang)}
                </button>
              )}
            </div>
            {data.rsvps.length === 0 ? (
              <p className="text-gray-500 text-sm">{t('dash.noRSVPsYet', lang)}</p>
            ) : (
              <div className="overflow-x-auto print-rsvp-area">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-2 font-semibold text-gray-900">{t('dash.guest', lang)}</th>
                      <th className="pb-2 font-semibold text-gray-900">{t('dash.attending', lang)}</th>
                      <th className="pb-2 font-semibold text-gray-900">{t('dash.guests', lang)}</th>
                      <th className="pb-2 font-semibold text-gray-900">{t('dash.songRequest', lang)}</th>
                      <th className="pb-2 font-semibold text-gray-900">{t('dash.message', lang)}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {data.rsvps.map((rsvp) => (
                      <tr key={rsvp.id}>
                        <td className="py-2 text-gray-900">{rsvp.guest_name}</td>
                        <td className="py-2">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                              rsvp.attending
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {rsvp.attending ? t('dash.yes', lang) : t('dash.no', lang)}
                          </span>
                        </td>
                        <td className="py-2 text-gray-600">{rsvp.guest_count}</td>
                        <td className="py-2 text-gray-600">{rsvp.song_request || '—'}</td>
                        <td className="py-2 text-gray-600">{rsvp.message || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
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
      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">{t('dash.deleteEvent', lang)}</h2>
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-1">
              {t('dash.deleteWarning', lang)}
            </p>
            <p className="text-sm text-gray-600 mb-4">
              {lang === 'en' ? 'Type ' : 'Escribe '}<span className="font-semibold text-gray-900">{data.event.event_name}</span> {t('dash.typeToConfirm', lang)}
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder={data.event.event_name}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {t('dash.cancel', lang)}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteConfirmText !== data.event.event_name || deleting}
                className="rounded-lg bg-red-600 text-white px-4 py-2 text-sm font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {deleting ? t('dash.deleting', lang) : t('dash.deleteEvent', lang)}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
