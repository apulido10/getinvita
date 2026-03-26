'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Event } from '@/types';
import { getEventTypeConfig, CARD_EVENT_TYPES } from '@/lib/constants';
import { Plus, Eye, Pencil, Calendar, Users, X, LogOut } from 'lucide-react';
import { t, type Lang } from '@/lib/translations';
import { createClient } from '@/lib/supabase/client';

export default function DashboardEventList({ events, lang, confirmed, reset }: { events: Event[]; lang: Lang; confirmed?: boolean; reset?: boolean }) {
  const [showBanner, setShowBanner] = useState(confirmed ?? false);
  const [showResetBanner, setShowResetBanner] = useState(reset ?? false);
  const langParam = lang === 'es' ? '?lang=es' : '';

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
      {showBanner && (
        <div className="bg-green-600 text-white px-4 py-3 flex items-center justify-between">
          <p className="text-sm font-medium">Your email has been confirmed. Welcome to GetInvita!</p>
          <button onClick={() => setShowBanner(false)} className="ml-4 shrink-0 hover:opacity-75 transition-opacity">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      {showResetBanner && (
        <div className="bg-green-600 text-white px-4 py-3 flex items-center justify-between">
          <p className="text-sm font-medium">Your password has been updated successfully.</p>
          <button onClick={() => setShowResetBanner(false)} className="ml-4 shrink-0 hover:opacity-75 transition-opacity">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t('dash.myEvents', lang)}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {events.length === 0
                ? t('dash.createFirstEvent', lang)
                : `${events.length} ${events.length === 1 ? t('dash.eventCount', lang) : t('dash.eventCountPlural', lang)}`}
            </p>
            </div>
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
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/order${langParam}`}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-purple-600 text-white px-4 py-2.5 text-sm font-semibold hover:bg-purple-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              {t('dash.createNewEvent', lang)}
            </Link>
            <button
              onClick={async () => {
                const supabase = createClient();
                await supabase.auth.signOut();
                window.location.href = '/';
              }}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 text-gray-600 px-4 py-2.5 text-sm font-medium hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              {lang === 'es' ? 'Salir' : 'Sign Out'}
            </button>
          </div>
        </div>

        {events.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
            <Calendar className="h-10 w-10 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-sm">{t('dash.noEventsYet', lang)}</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {events.map((event) => {
              const config = getEventTypeConfig(event.event_type);
              return (
                <div
                  key={event.id}
                  className="bg-white rounded-xl border p-4 sm:p-5 hover:shadow-sm transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="text-base font-semibold text-gray-900 truncate">
                        {event.event_name}
                      </h2>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1 text-sm text-gray-500">
                        <span>{config?.label}</span>
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            event.status === 'published'
                              ? 'bg-green-100 text-green-700'
                              : event.status === 'active'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {event.status}
                        </span>
                        {event.event_date && (
                          <span>
                            {new Date(`${event.event_date.substring(0, 10)}T12:00:00`).toLocaleDateString(lang === 'es' ? 'es-MX' : 'en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {event.status === 'published' && (
                        <>
                          <Link
                            href={lang === 'es' ? `/es/events/${event.slug}` : `/events/${event.slug}`}
                            target="_blank"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <Eye className="h-4 w-4" />
                            {t('dash.view', lang)}
                          </Link>
                          {!CARD_EVENT_TYPES.includes(event.event_type) && (
                            <Link
                              href={`/dashboard/${event.id}?tab=rsvps${lang === 'es' ? '&lang=es' : ''}`}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Users className="h-4 w-4" />
                              RSVPs
                            </Link>
                          )}
                        </>
                      )}
                      <Link
                        href={`/dashboard/${event.id}${langParam}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 text-white px-3 py-2 text-sm font-medium hover:bg-purple-700"
                      >
                        <Pencil className="h-4 w-4" />
                        {t('dash.edit', lang)}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
