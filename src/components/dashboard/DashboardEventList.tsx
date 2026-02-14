'use client';

import Link from 'next/link';
import { Event } from '@/types';
import { getEventTypeConfig, CARD_EVENT_TYPES } from '@/lib/constants';
import { Plus, Eye, Pencil, Calendar, Users } from 'lucide-react';

export default function DashboardEventList({ events }: { events: Event[] }) {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Events</h1>
            <p className="text-sm text-gray-500 mt-1">
              {events.length === 0
                ? 'Create your first event to get started.'
                : `${events.length} event${events.length === 1 ? '' : 's'}`}
            </p>
          </div>
          <Link
            href="/order"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-purple-600 text-white px-4 py-2.5 text-sm font-semibold hover:bg-purple-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create New Event
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
            <Calendar className="h-10 w-10 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-sm">No events yet. Create one to get started!</p>
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
                            {new Date(`${event.event_date.substring(0, 10)}T12:00:00`).toLocaleDateString('en-US', {
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
                            href={`/events/${event.slug}`}
                            target="_blank"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </Link>
                          {!CARD_EVENT_TYPES.includes(event.event_type) && (
                            <Link
                              href={`/dashboard/${event.id}?tab=rsvps`}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Users className="h-4 w-4" />
                              RSVPs
                            </Link>
                          )}
                        </>
                      )}
                      <Link
                        href={`/dashboard/${event.id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 text-white px-3 py-2 text-sm font-medium hover:bg-purple-700"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
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
