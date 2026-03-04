import type { Metadata } from 'next';
import Hero from '@/components/landing/Hero';
import EventTypes from '@/components/landing/EventTypes';
import LiveDemo from '@/components/landing/LiveDemo';
import HowItWorks from '@/components/landing/HowItWorks';
import Testimonials from '@/components/landing/Testimonials';
import Pricing from '@/components/landing/Pricing';
import Navbar from '@/components/landing/Navbar';
import Link from 'next/link';
import { t } from '@/lib/translations';
import { LANDING_KEYWORDS_SPANISH } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'GetInvita - Sitios Web Hermosos para Eventos',
  description:
    'Sitios web personalizados para Quinceaneras, Bodas, Cumpleanos y Baby Showers. Crea tu pagina con fotos, musica y RSVP en minutos.',
  keywords: LANDING_KEYWORDS_SPANISH,
  alternates: {
    canonical: '/es',
    languages: {
      en: '/',
      es: '/es',
      'en-US': '/',
      'es-US': '/es',
      'x-default': '/',
    },
  },
  openGraph: {
    title: 'GetInvita - Sitios Web Hermosos para Eventos',
    description:
      'Sitios web personalizados para Quinceaneras, Bodas, Cumpleanos y Baby Showers. Crea tu pagina con fotos, musica y RSVP en minutos.',
    url: 'https://getinvita.com/es',
    locale: 'es_US',
    alternateLocale: ['en_US'],
  },
};

export default function HomePageEs() {
  const lang = 'es' as const;

  return (
    <main>
      <Navbar lang={lang} />
      <Hero lang={lang} />
      <LiveDemo lang={lang} />
      <EventTypes lang={lang} />
      <HowItWorks lang={lang} />
      <Testimonials lang={lang} />
      <Pricing lang={lang} />

      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="text-lg font-semibold text-white mb-2">GetInvita</p>
          <p className="text-sm">{t('landing.footer.tagline', lang)}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm">
            <Link href="/login?redirect=/order&lang=es" className="hover:text-white transition-colors">
              {t('landing.footer.getStarted', lang)}
            </Link>
            <a href="#event-types" className="hover:text-white transition-colors">
              {t('landing.footer.eventTypes', lang)}
            </a>
            <a href="#pricing" className="hover:text-white transition-colors">
              {t('landing.footer.eventOptions', lang)}
            </a>
            <Link href="/terms" className="hover:text-white transition-colors">
              {t('landing.footer.termsAndPolicy', lang)}
            </Link>
            <a href="mailto:support@getinvita.com" className="hover:text-white transition-colors">
              {t('landing.footer.contact', lang)}
            </a>
          </div>
          <p className="mt-8 text-xs text-gray-600">
            &copy; {new Date().getFullYear()} GetInvita. {t('landing.footer.copyright', lang)}
          </p>
        </div>
      </footer>
    </main>
  );
}
