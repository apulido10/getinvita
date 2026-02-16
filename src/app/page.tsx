import Hero from '@/components/landing/Hero';
import EventTypes from '@/components/landing/EventTypes';
import LiveDemo from '@/components/landing/LiveDemo';
import HowItWorks from '@/components/landing/HowItWorks';
import Testimonials from '@/components/landing/Testimonials';
import Pricing from '@/components/landing/Pricing';
import Navbar from '@/components/landing/Navbar';
import Link from 'next/link';
import { t, type Lang } from '@/lib/translations';

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const params = await searchParams;
  const lang: Lang = params.lang === 'es' ? 'es' : 'en';

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
          </div>
          <p className="mt-8 text-xs text-gray-600">
            &copy; {new Date().getFullYear()} GetInvita. {t('landing.footer.copyright', lang)}
          </p>
        </div>
      </footer>
    </main>
  );
}
