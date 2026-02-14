'use client';

import { Crown, Heart, Cake, Baby } from 'lucide-react';
import { EVENT_TYPES } from '@/lib/constants';
import Link from 'next/link';

const iconMap: Record<string, React.ElementType> = {
  Crown,
  Heart,
  Cake,
  Baby,
};

const colorMap: Record<string, string> = {
  rose: 'from-rose-500 to-pink-600 shadow-rose-500/25',
  emerald: 'from-emerald-500 to-teal-600 shadow-emerald-500/25',
  violet: 'from-violet-500 to-purple-600 shadow-violet-500/25',
  sky: 'from-sky-400 to-blue-500 shadow-sky-500/25',
};

const bgColorMap: Record<string, string> = {
  rose: 'bg-rose-50 border-rose-100',
  emerald: 'bg-emerald-50 border-emerald-100',
  violet: 'bg-violet-50 border-violet-100',
  sky: 'bg-sky-50 border-sky-100',
};

export default function EventTypes() {
  return (
    <section id="event-types" className="py-20 sm:py-28 bg-white">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Every Celebration, Beautifully Designed
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Choose your event type and get a custom-themed website with all the features you need.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {EVENT_TYPES.map((eventType) => {
            const Icon = iconMap[eventType.icon];
            return (
              <div
                key={eventType.type}
                className={`rounded-2xl border p-6 ${bgColorMap[eventType.color]} hover:shadow-lg transition-shadow`}
              >
                <div
                  className={`inline-flex rounded-xl bg-gradient-to-br ${colorMap[eventType.color]} p-3 shadow-lg`}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mt-4 text-xl font-bold text-gray-900">{eventType.label}</h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{eventType.description}</p>
                <Link
                  href={`/order?type=${eventType.type}`}
                  className={`mt-4 block w-full text-center rounded-lg bg-gradient-to-r ${colorMap[eventType.color]} text-white py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity`}
                >
                  Get Started
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
