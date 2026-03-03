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
import { LANDING_KEYWORDS_ENGLISH } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'GetInvita - Beautiful Event Websites',
  description:
    'Custom event websites for Quinceaneras, Weddings, Birthdays, and Baby Showers. Build your page with photos, music, and RSVP in minutes.',
  keywords: LANDING_KEYWORDS_ENGLISH,
  alternates: {
    canonical: '/',
    languages: {
      en: '/',
      es: '/es',
      'en-US': '/',
      'es-US': '/es',
      'x-default': '/',
    },
  },
  openGraph: {
    title: 'GetInvita - Beautiful Event Websites',
    description:
      'Custom event websites for Quinceaneras, Weddings, Birthdays, and Baby Showers. Build your page with photos, music, and RSVP in minutes.',
    url: 'https://getinvita.com',
    locale: 'en_US',
    alternateLocale: ['es_US'],
  },
};

export default function HomePage() {
  const lang = 'en' as const;

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
          <div className="mt-6 flex justify-center gap-6 text-sm">
            <Link href="/login?redirect=/order" className="hover:text-white transition-colors">
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
