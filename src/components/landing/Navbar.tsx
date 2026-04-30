'use client';

import Link from 'next/link';
import Image from 'next/image';
import { t, type Lang } from '@/lib/translations';

export default function Navbar({ lang }: { lang: Lang }) {
  const homeHref = lang === 'es' ? '/es' : '/';
  const toggleHref = lang === 'en' ? '/es' : '/';

  return (
    <nav className="absolute top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-6xl px-3 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        <Link href={homeHref} className="relative h-8 w-[110px] sm:h-10 sm:w-[160px] shrink-0">
          <Image
            src="/getinvitalogo.png"
            alt="GetInvita"
            fill
            className="object-contain"
            priority
          />
        </Link>
        <div className="flex items-center gap-1.5 sm:gap-3">
          <Link
            href={toggleHref}
            className="flex items-center rounded-full ring-1 ring-stone-300 text-[10px] sm:text-xs font-semibold text-gray-600 overflow-hidden shrink-0"
          >
            <span className={`px-2 py-1 sm:px-2.5 sm:py-1.5 transition-colors ${lang === 'en' ? 'bg-gray-900 text-white' : ''}`}>
              EN
            </span>
            <span className={`px-2 py-1 sm:px-2.5 sm:py-1.5 transition-colors ${lang === 'es' ? 'bg-gray-900 text-white' : ''}`}>
              ES
            </span>
          </Link>
          <Link
            href={lang === 'es' ? '/login?lang=es' : '/login'}
            className="px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors whitespace-nowrap"
          >
            {t('landing.nav.signIn', lang)}
          </Link>
          <Link
            href={lang === 'es' ? '/login?redirect=/order&lang=es' : '/login?redirect=/order'}
            className="rounded-full bg-gray-900 px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white hover:bg-gray-800 transition-colors whitespace-nowrap"
          >
            {t('landing.nav.signUp', lang)}
          </Link>
        </div>
      </div>
    </nav>
  );
}
