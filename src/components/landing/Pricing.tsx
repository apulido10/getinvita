'use client';

import { Check } from 'lucide-react';
import { EVENT_TYPES, CARD_EVENT_TYPES } from '@/lib/constants';
import Link from 'next/link';

const eventFeatures = [
  'Custom themed event page',
  'Photo gallery with lightbox',
  'Background music player',
  'Live countdown timer',
  'RSVP collection',
  'Mobile responsive design',
  'Shareable custom link',
  'Unlimited photo uploads',
];

const cardFeatures = [
  'Custom themed card page',
  'Photo gallery with lightbox',
  'Background music player',
  'Personalized message',
  'Mobile responsive design',
  'Shareable custom link',
  'Unlimited photo uploads',
];

const colorBorder: Record<string, string> = {
  rose: 'border-rose-200 hover:border-rose-400',
  emerald: 'border-emerald-200 hover:border-emerald-400',
  violet: 'border-violet-200 hover:border-violet-400',
  sky: 'border-sky-200 hover:border-sky-400',
  pink: 'border-pink-200 hover:border-pink-400',
  blue: 'border-blue-200 hover:border-blue-400',
};

const colorButton: Record<string, string> = {
  rose: 'bg-rose-600 hover:bg-rose-700',
  emerald: 'bg-emerald-600 hover:bg-emerald-700',
  violet: 'bg-violet-600 hover:bg-violet-700',
  sky: 'bg-sky-600 hover:bg-sky-700',
  pink: 'bg-pink-600 hover:bg-pink-700',
  blue: 'bg-blue-600 hover:bg-blue-700',
};

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 sm:py-28 bg-white">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Choose Your Event Type
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Pick the perfect template for your celebration and get started in minutes.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {EVENT_TYPES.map((eventType) => (
            <div
              key={eventType.type}
              className={`rounded-2xl border-2 ${colorBorder[eventType.color]} p-6 transition-colors`}
            >
              <h3 className="text-lg font-bold text-gray-900">{eventType.label}</h3>
              <ul className="mt-6 space-y-3">
                {(CARD_EVENT_TYPES.includes(eventType.type) ? cardFeatures : eventFeatures).map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-gray-700">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href={`/order?type=${eventType.type}`}
                className={`mt-6 block w-full text-center rounded-lg ${colorButton[eventType.color]} text-white py-3 text-sm font-semibold transition-colors`}
              >
                Create Your Site
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
