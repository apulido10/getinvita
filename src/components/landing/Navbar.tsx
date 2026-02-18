'use client';

import Link from 'next/link';
import Image from 'next/image';
import { t, type Lang } from '@/lib/translations';

export default function Navbar({ lang }: { lang: Lang }) {
  const toggleLang = () => {
    if (lang === 'en') {
      window.location.href = '/?lang=es';
    } else {
      window.location.href = '/';
    }
  };

  return (
    <nav className="absolute top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-6xl px-3 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        <Link href="/" className="relative h-8 w-[110px] sm:h-10 sm:w-[160px] rounded-lg overflow-hidden bg-white/90 backdrop-blur-sm px-1.5 sm:px-2 shrink-0">
          <Image
            src="/getinvitalogo.png"
            alt="GetInvita"
            fill
            className="object-contain"
            priority
          />
        </Link>
        <div className="flex items-center gap-1.5 sm:gap-3">
          <button
            onClick={toggleLang}
            className="flex items-center rounded-full bg-white/10 backdrop-blur-sm text-[10px] sm:text-xs font-semibold text-white overflow-hidden shrink-0"
          >
            <span className={`px-2 py-1 sm:px-2.5 sm:py-1.5 transition-colors ${lang === 'en' ? 'bg-white text-purple-900' : ''}`}>
              EN
            </span>
            <span className={`px-2 py-1 sm:px-2.5 sm:py-1.5 transition-colors ${lang === 'es' ? 'bg-white text-purple-900' : ''}`}>
              ES
            </span>
          </button>
          <Link
            href={lang === 'es' ? '/login?lang=es' : '/login'}
            className="px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white/80 hover:text-white transition-colors whitespace-nowrap"
          >
            {t('landing.nav.signIn', lang)}
          </Link>
          <Link
            href={lang === 'es' ? '/login?redirect=/order&lang=es' : '/login?redirect=/order'}
            className="rounded-full bg-white px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-purple-900 hover:bg-purple-50 transition-colors whitespace-nowrap"
          >
            {t('landing.nav.signUp', lang)}
          </Link>
        </div>
      </div>
    </nav>
  );
}
