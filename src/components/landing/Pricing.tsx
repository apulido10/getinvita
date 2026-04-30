'use client';

import { Check } from 'lucide-react';
import { EVENT_TYPES, CARD_EVENT_TYPES } from '@/lib/constants';
import { t, type Lang } from '@/lib/translations';
import Link from 'next/link';

const eventFeatureKeys = [
  'landing.pricing.feature.customThemed',
  'landing.pricing.feature.photoGallery',
  'landing.pricing.feature.musicPlayer',
  'landing.pricing.feature.countdown',
  'landing.pricing.feature.rsvp',
  'landing.pricing.feature.responsive',
  'landing.pricing.feature.shareableLink',
  'landing.pricing.feature.unlimitedPhotos',
];

const cardFeatureKeys = [
  'landing.pricing.feature.customThemedCard',
  'landing.pricing.feature.photoGallery',
  'landing.pricing.feature.musicPlayer',
  'landing.pricing.feature.personalizedMessage',
  'landing.pricing.feature.responsive',
  'landing.pricing.feature.shareableLink',
  'landing.pricing.feature.unlimitedPhotos',
];

const FEATURED_TYPES = ['wedding', 'sweet15'];

export default function Pricing({ lang }: { lang: Lang }) {
  return (
    <section id="pricing" className="py-24 sm:py-32 bg-cream">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-20 max-w-2xl mx-auto">
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-plum mb-4">
            {t('landing.pricing.heading', lang)}
          </p>
          <h2 className="font-serif text-4xl sm:text-5xl font-medium tracking-tight text-gray-900 leading-tight">
            {t('landing.pricing.subheading', lang)}
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {EVENT_TYPES.map((eventType) => {
            const featureKeys = CARD_EVENT_TYPES.includes(eventType.type) ? cardFeatureKeys : eventFeatureKeys;
            const label = t(`landing.eventType.${eventType.type}.label`, lang);
            const isFeatured = FEATURED_TYPES.includes(eventType.type);
            return (
              <div
                key={eventType.type}
                className={`flex flex-col rounded-2xl p-7 transition-all ${
                  isFeatured
                    ? 'bg-gray-900 text-white ring-1 ring-gray-900'
                    : 'bg-white ring-1 ring-stone-200 hover:ring-gray-900'
                }`}
              >
                <h3 className={`font-serif text-2xl font-medium ${isFeatured ? 'text-white' : 'text-gray-900'}`}>
                  {label}
                </h3>
                <p className="mt-3 flex items-baseline gap-1.5">
                  <span className={`font-serif text-4xl font-medium ${isFeatured ? 'text-white' : 'text-gray-900'}`}>
                    ${(eventType.price / 100).toFixed(0)}
                  </span>
                  <span className={`text-sm ${isFeatured ? 'text-gray-400' : 'text-gray-500'}`}>one-time</span>
                </p>
                <ul className="mt-7 space-y-3 flex-1">
                  {featureKeys.map((key) => (
                    <li
                      key={key}
                      className={`flex items-start gap-2.5 text-sm ${isFeatured ? 'text-gray-200' : 'text-gray-700'}`}
                    >
                      <Check className={`h-4 w-4 mt-0.5 shrink-0 ${isFeatured ? 'text-emerald-400' : 'text-plum'}`} />
                      {t(key, lang)}
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/order?type=${eventType.type}`}
                  className={`mt-7 block w-full text-center rounded-full py-3 text-sm font-medium transition-colors ${
                    isFeatured
                      ? 'bg-white text-gray-900 hover:bg-stone-100'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  {t('landing.pricing.createYourSite', lang)}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
