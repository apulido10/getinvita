'use client';

import { Crown, Heart, Cake, Baby, Gift, ArrowRight } from 'lucide-react';
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

const FEATURED_TYPES = ['wedding', 'sweet15'];

export default function EventTypes({ lang }: { lang: Lang }) {
  const featured = EVENT_TYPES.filter((et) => FEATURED_TYPES.includes(et.type));
  const others = EVENT_TYPES.filter((et) => !FEATURED_TYPES.includes(et.type));

  return (
    <section id="event-types" className="py-24 sm:py-32 bg-white">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-20 max-w-2xl mx-auto">
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-plum mb-4">
            {t('landing.eventTypes.heading', lang)}
          </p>
          <h2 className="font-serif text-4xl sm:text-5xl font-medium tracking-tight text-gray-900 leading-tight">
            {t('landing.eventTypes.subheading', lang)}
          </h2>
        </div>

        {/* Featured: Wedding & Quinceañera */}
        <div className="grid sm:grid-cols-2 gap-6 sm:gap-8 mb-20">
          {featured.map((eventType) => {
            const Icon = iconMap[eventType.icon];
            const label = t(`landing.eventType.${eventType.type}.label`, lang);
            const description = t(`landing.eventType.${eventType.type}.description`, lang);
            return (
              <div
                key={eventType.type}
                className="group relative rounded-3xl bg-cream p-8 sm:p-10 ring-1 ring-stone-200 hover:ring-gray-900 transition-all"
              >
                <div className="inline-flex rounded-2xl bg-white p-4 ring-1 ring-stone-200">
                  <Icon className="h-6 w-6 text-plum" />
                </div>
                <h3 className="mt-6 font-serif text-3xl font-medium text-gray-900">{label}</h3>
                <p className="mt-3 text-base text-gray-600 leading-relaxed">{description}</p>
                <div className="mt-8 flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    {t('landing.eventTypes.startingAt', lang)}
                    <span className="font-semibold text-gray-900">${(eventType.price / 100).toFixed(0)}</span>
                  </p>
                  <Link
                    href={`/login?redirect=${encodeURIComponent(`/order?type=${eventType.type}`)}`}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-900 group-hover:text-plum transition-colors"
                  >
                    {t('landing.eventTypes.getStarted', lang)}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Other Celebrations */}
        <div className="text-center mb-10">
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-gray-500">
            {t('landing.eventTypes.otherCelebrations', lang)}
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {others.map((eventType) => {
            const Icon = iconMap[eventType.icon];
            const label = t(`landing.eventType.${eventType.type}.label`, lang);
            const description = t(`landing.eventType.${eventType.type}.description`, lang);
            return (
              <Link
                key={eventType.type}
                href={`/login?redirect=${encodeURIComponent(`/order?type=${eventType.type}`)}`}
                className="group rounded-2xl p-6 ring-1 ring-stone-200 hover:ring-gray-900 hover:bg-cream transition-all"
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-plum shrink-0" />
                  <h3 className="font-serif text-xl font-medium text-gray-900">{label}</h3>
                </div>
                <p className="mt-3 text-sm text-gray-600 leading-relaxed">{description}</p>
                <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-gray-900">
                  {t('landing.eventTypes.getStarted', lang)}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
