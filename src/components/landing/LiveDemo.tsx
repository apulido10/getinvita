'use client';

import { useState, useRef, useEffect } from 'react';
import { t, type Lang } from '@/lib/translations';

const DEMOS = [
  { slug: 'sarah-mike-s-wedding-na2hWl', label: 'Wedding', labelEs: 'Boda' },
  { slug: 'stephanie-quincenera-tjH8cN', label: 'Quinceañera', labelEs: 'Quinceañera' },
];

export default function LiveDemo({ lang }: { lang: Lang }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [prefetch, setPrefetch] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPrefetch(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const currentDemo = DEMOS[selectedIndex];

  return (
    <section ref={sectionRef} className="py-20 sm:py-28 bg-gradient-to-b from-gray-50 to-white">
      {prefetch && activeIndex === null && (
        <link rel="prefetch" href={`/events/${currentDemo.slug}?demo=true`} />
      )}

      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            {t('landing.liveDemo.heading', lang)}
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            {t('landing.liveDemo.subheading', lang)}
          </p>
        </div>

        {/* Demo selector tabs */}
        <div className="flex justify-center gap-3 mb-8">
          {DEMOS.map((demo, i) => (
            <button
              key={demo.slug}
              onClick={() => {
                setSelectedIndex(i);
                setActiveIndex(null);
              }}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
                selectedIndex === i
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {lang === 'es' ? demo.labelEs : demo.label}
            </button>
          ))}
        </div>

        <div className="flex justify-center">
          {/* Phone mockup frame */}
          <div className="relative mx-auto w-[320px] sm:w-[375px]">
            {/* Phone bezel */}
            <div className="rounded-[3rem] border-[8px] border-gray-900 bg-gray-900 shadow-2xl overflow-hidden">
              {/* Notch */}
              <div className="relative z-10 mx-auto h-6 w-32 rounded-b-2xl bg-gray-900" />

              {/* Screen */}
              <div className="relative bg-white" style={{ height: '680px' }}>
                {activeIndex === selectedIndex ? (
                  <iframe
                    src={`/events/${currentDemo.slug}?demo=true`}
                    className="absolute inset-0 w-full h-full border-0"
                    allow="autoplay"
                    title="GetInvita Live Demo"
                  />
                ) : (
                  <button
                    onClick={() => setActiveIndex(selectedIndex)}
                    className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gradient-to-br from-rose-50 to-pink-100 cursor-pointer group"
                  >
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    <p className="mt-4 text-base font-semibold text-gray-900">{t('landing.liveDemo.tapToExplore', lang)}</p>
                    <p className="mt-1 text-sm text-gray-500">{t('landing.liveDemo.interactiveDemo', lang)}</p>
                  </button>
                )}
              </div>

              {/* Bottom bar */}
              <div className="h-1 w-28 mx-auto my-3 rounded-full bg-gray-600" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
