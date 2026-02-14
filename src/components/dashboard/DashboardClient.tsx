'use client';

import { useState } from 'react';
import { FullEventData } from '@/types';
import { getEventTypeConfig } from '@/lib/constants';
import { getThemeById } from '@/lib/themes';
import EventDetailsForm from './EventDetailsForm';
import PhotoUploader from './PhotoUploader';
import MusicUploader from './MusicUploader';
import ThemePicker from './ThemePicker';
import { FileText, Image, Music, Users, Globe, Eye, ArrowLeft, LogOut, Link2, Check, ChevronRight, ChevronLeft, Trash2, X, Palette } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

type Step = 'details' | 'photos' | 'music' | 'theme' | 'rsvps';

const steps: { id: Step; label: string; icon: React.ElementType }[] = [
  { id: 'details', label: 'Details', icon: FileText },
  { id: 'photos', label: 'Photos', icon: Image },
  { id: 'music', label: 'Music', icon: Music },
  { id: 'theme', label: 'Theme', icon: Palette },
  { id: 'rsvps', label: 'RSVPs', icon: Users },
];

export default function DashboardClient({ initialData }: { initialData: FullEventData }) {
  const [data, setData] = useState(initialData);
  const [activeStep, setActiveStep] = useState<Step>('details');
  const [publishing, setPublishing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const config = getEventTypeConfig(data.event.event_type);
  const isPublished = data.event.status === 'published';
  const currentIndex = steps.findIndex((s) => s.id === activeStep);

  const selectedTheme = data.event.theme_id ? getThemeById(data.event.theme_id) : null;
  const hasPremiumAddon = selectedTheme?.isPremium && !data.event.theme_premium_paid;

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
        window.location.href = '/dashboard';
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

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">Delete</span>
              </button>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
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
                    Live
                  </span>
                  <Link
                    href={`/events/${data.event.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </Link>
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/events/${data.event.slug}`;
                      navigator.clipboard.writeText(url);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    {copied ? <Check className="h-4 w-4 text-green-600" /> : <Link2 className="h-4 w-4" />}
                    {copied ? 'Copied!' : 'Share'}
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
                    ? 'Redirecting...'
                    : hasPremiumAddon
                    ? 'Pay & Publish (+$50 theme)'
                    : 'Pay & Publish'}
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
                onClick={() => setActiveStep(step.id)}
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
            event={data.event}
            details={data.details}
            onUpdate={(details) => setData((prev) => ({ ...prev, details }))}
          />
        )}
        {activeStep === 'photos' && (
          <PhotoUploader
            event={data.event}
            photos={data.photos}
            onUpdate={(photos) => setData((prev) => ({ ...prev, photos }))}
          />
        )}
        {activeStep === 'music' && (
          <MusicUploader
            event={data.event}
            music={data.music}
            onUpdate={(music) => setData((prev) => ({ ...prev, music }))}
          />
        )}
        {activeStep === 'theme' && (
          <>
            <ThemePicker
              event={data.event}
              data={data}
              supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL!}
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
                    ? 'Redirecting...'
                    : hasPremiumAddon
                    ? 'Pay & Publish (+$50 theme)'
                    : 'Pay & Publish'}
                </button>
                <p className="text-xs text-gray-400 mt-2">Ready? Hit publish to take your event live.</p>
              </div>
            )}
          </>
        )}
        {activeStep === 'rsvps' && (
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Guest RSVPs</h2>
            {data.rsvps.length === 0 ? (
              <p className="text-gray-500 text-sm">No RSVPs yet. Publish your event to start collecting responses.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-2 font-semibold text-gray-900">Guest</th>
                      <th className="pb-2 font-semibold text-gray-900">Attending</th>
                      <th className="pb-2 font-semibold text-gray-900">Guests</th>
                      <th className="pb-2 font-semibold text-gray-900">Message</th>
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
                            {rsvp.attending ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="py-2 text-gray-600">{rsvp.guest_count}</td>
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
            onClick={() => setActiveStep(steps[currentIndex - 1].id)}
            disabled={currentIndex === 0}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-0 disabled:pointer-events-none transition-all"
          >
            <ChevronLeft className="h-4 w-4" />
            {currentIndex > 0 ? steps[currentIndex - 1].label : ''}
          </button>
          <button
            onClick={() => setActiveStep(steps[currentIndex + 1].id)}
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
              <h2 className="text-lg font-bold text-gray-900">Delete Event</h2>
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-1">
              This action is permanent and cannot be undone. All event data, photos, music, and RSVPs will be deleted.
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Type <span className="font-semibold text-gray-900">{data.event.event_name}</span> to confirm.
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
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteConfirmText !== data.event.event_name || deleting}
                className="rounded-lg bg-red-600 text-white px-4 py-2 text-sm font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {deleting ? 'Deleting...' : 'Delete Event'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
