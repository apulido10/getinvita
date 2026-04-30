'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { t, type Lang } from '@/lib/translations';

const DEMOS = [
  { slug: 'sarah-mike-s-wedding-na2hWl', label: 'Wedding', labelEs: 'Boda' },
  { slug: 'stephanie-quincenera-tjH8cN', label: 'Quinceañera', labelEs: 'Quinceañera' },
];

export default function Hero({ lang }: { lang: Lang }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const currentDemo = DEMOS[selectedIndex];
  const demoSrc = `/events/${currentDemo.slug}?demo=true&autoplay=1${lang === 'es' ? '&lang=es' : ''}`;

  return (
    <section className="relative overflow-hidden bg-cream">
      {/* Subtle radial accent on top-right (replaces stock video) */}
      <div
        className="pointer-events-none absolute -top-32 -right-32 h-[480px] w-[480px] rounded-full opacity-40 blur-3xl"
        style={{ background: 'radial-gradient(circle, #e9c8d6 0%, transparent 70%)' }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-24 -left-24 h-[420px] w-[420px] rounded-full opacity-30 blur-3xl"
        style={{ background: 'radial-gradient(circle, #d8c5e6 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      <link rel="prefetch" href={demoSrc} />

      <div className="relative mx-auto max-w-6xl px-6 pt-32 pb-24 sm:pt-36 sm:pb-32 lg:pt-44 lg:pb-40">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-16 lg:gap-20 items-center">
          {/* Left: copy */}
          <div className="text-center lg:text-left">
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-plum mb-6">
              {t('landing.hero.badge', lang)}
            </p>

            <h1 className="font-serif text-[2.5rem] sm:text-5xl lg:text-6xl xl:text-[4.5rem] font-medium tracking-tight leading-[1.05] text-gray-900">
              {t('landing.hero.h1Line1', lang)}{' '}
              <span className="italic text-plum">
                {t('landing.hero.h1Line2', lang)}
              </span>
            </h1>

            <p className="mt-7 text-lg lg:text-xl text-gray-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              {t('landing.hero.paragraph', lang)}
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-3 sm:gap-5 items-center justify-center lg:justify-start">
              <Link
                href="/login?redirect=/order"
                className="inline-flex items-center justify-center rounded-full bg-gray-900 text-white px-8 py-4 text-base font-medium hover:bg-gray-800 transition-colors"
              >
                {t('landing.hero.cta1', lang)}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <a
                href="#event-types"
                className="inline-flex items-center justify-center text-base font-medium text-gray-900 underline-offset-4 hover:underline px-2 py-3"
              >
                {t('landing.hero.cta2', lang)}
              </a>
            </div>
          </div>

          {/* Right: live phone mockup */}
          <div className="flex flex-col items-center lg:items-end">
            {/* Demo type tabs */}
            <div className="mb-6 inline-flex items-center gap-1 rounded-full bg-white/80 backdrop-blur p-1 ring-1 ring-stone-200 shadow-sm">
              {DEMOS.map((demo, i) => (
                <button
                  key={demo.slug}
                  onClick={() => setSelectedIndex(i)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selectedIndex === i
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {lang === 'es' ? demo.labelEs : demo.label}
                </button>
              ))}
            </div>

            <div className="relative w-[280px] sm:w-[320px] lg:w-[360px]">
              <div className="rounded-[2.75rem] border-[10px] border-gray-900 bg-gray-900 shadow-[0_30px_80px_-20px_rgba(58,15,80,0.35)] overflow-hidden">
                <div className="relative z-10 mx-auto h-6 w-32 rounded-b-2xl bg-gray-900" />
                <div className="relative bg-white" style={{ height: '600px' }}>
                  <iframe
                    key={currentDemo.slug}
                    src={demoSrc}
                    className="absolute inset-0 w-full h-full border-0"
                    allow="autoplay"
                    title="GetInvita Live Demo"
                  />
                </div>
                <div className="h-1 w-28 mx-auto my-3 rounded-full bg-gray-700" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
