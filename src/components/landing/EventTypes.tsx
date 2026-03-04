'use client';

import { Crown, Heart, Cake, Baby, Gift } from 'lucide-react';
import { EVENT_TYPES } from '@/lib/constants';
import { t, type Lang } from '@/lib/translations';
import Link from 'next/link';

const iconMap: Record<string, React.ElementType> = {
  Crown,
  Heart,
  Cake,
  Baby,
  Gift,
};

const colorMap: Record<string, string> = {
  rose: 'from-rose-500 to-pink-600 shadow-rose-500/25',
  emerald: 'from-emerald-500 to-teal-600 shadow-emerald-500/25',
  violet: 'from-violet-500 to-purple-600 shadow-violet-500/25',
  sky: 'from-sky-400 to-blue-500 shadow-sky-500/25',
  pink: 'from-pink-400 to-rose-500 shadow-pink-500/25',
  blue: 'from-blue-500 to-indigo-600 shadow-blue-500/25',
};

const bgColorMap: Record<string, string> = {
  rose: 'bg-rose-50 border-rose-100',
  emerald: 'bg-emerald-50 border-emerald-100',
  violet: 'bg-violet-50 border-violet-100',
  sky: 'bg-sky-50 border-sky-100',
  pink: 'bg-pink-50 border-pink-100',
  blue: 'bg-blue-50 border-blue-100',
};

const FEATURED_TYPES = ['wedding', 'sweet15'];

export default function EventTypes({ lang }: { lang: Lang }) {
  const featured = EVENT_TYPES.filter((et) => FEATURED_TYPES.includes(et.type));
  const others = EVENT_TYPES.filter((et) => !FEATURED_TYPES.includes(et.type));

  return (
    <section id="event-types" className="py-20 sm:py-28 bg-white">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            {t('landing.eventTypes.heading', lang)}
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            {t('landing.eventTypes.subheading', lang)}
          </p>
        </div>

        {/* Featured: Wedding & Quinceañera */}
        <div className="grid sm:grid-cols-2 gap-8 mb-16">
          {featured.map((eventType) => {
            const Icon = iconMap[eventType.icon];
            const label = t(`landing.eventType.${eventType.type}.label`, lang);
            const description = t(`landing.eventType.${eventType.type}.description`, lang);
            return (
              <div
                key={eventType.type}
                className={`rounded-3xl border-2 p-8 sm:p-10 ${bgColorMap[eventType.color]} hover:shadow-xl transition-shadow`}
              >
                <div
                  className={`inline-flex rounded-xl bg-gradient-to-br ${colorMap[eventType.color]} p-4 shadow-lg`}
                >
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="mt-5 text-2xl sm:text-3xl font-bold text-gray-900">{label}</h3>
                <p className="mt-3 text-base text-gray-600 leading-relaxed">{description}</p>
                <p className="mt-2 text-sm font-semibold text-gray-500">{t('landing.eventTypes.startingAt', lang)}{(eventType.price / 100).toFixed(0)}</p>
                <Link
                  href={`/login?redirect=${encodeURIComponent(`/order?type=${eventType.type}`)}`}
                  className={`mt-6 block w-full text-center rounded-xl bg-gradient-to-r ${colorMap[eventType.color]} text-white py-3.5 text-base font-semibold hover:opacity-90 transition-opacity`}
                >
                  {t('landing.eventTypes.getStarted', lang)}
                </Link>
              </div>
            );
          })}
        </div>

        {/* Other Celebrations */}
        <div className="text-center mb-8">
          <h3 className="text-xl font-semibold text-gray-500">{t('landing.eventTypes.otherCelebrations', lang)}</h3>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {others.map((eventType) => {
            const Icon = iconMap[eventType.icon];
            const label = t(`landing.eventType.${eventType.type}.label`, lang);
            const description = t(`landing.eventType.${eventType.type}.description`, lang);
            return (
              <div
                key={eventType.type}
                className={`rounded-2xl border p-5 ${bgColorMap[eventType.color]} hover:shadow-lg transition-shadow`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`inline-flex rounded-lg bg-gradient-to-br ${colorMap[eventType.color]} p-2.5 shadow-md`}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{label}</h3>
                </div>
                <p className="mt-3 text-sm text-gray-600 leading-relaxed">{description}</p>
                <Link
                  href={`/login?redirect=${encodeURIComponent(`/order?type=${eventType.type}`)}`}
                  className={`mt-4 block w-full text-center rounded-lg bg-gradient-to-r ${colorMap[eventType.color]} text-white py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity`}
                >
                  {t('landing.eventTypes.getStarted', lang)}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
