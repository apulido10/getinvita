import Hero from '@/components/landing/Hero';
import EventTypes from '@/components/landing/EventTypes';
import HowItWorks from '@/components/landing/HowItWorks';
import Pricing from '@/components/landing/Pricing';
import Navbar from '@/components/landing/Navbar';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <EventTypes />
      <HowItWorks />
      <Pricing />

      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="text-lg font-semibold text-white mb-2">GetInvita</p>
          <p className="text-sm">Beautiful event websites for life&apos;s biggest celebrations.</p>
          <div className="mt-6 flex justify-center gap-6 text-sm">
            <Link href="/login?redirect=/order" className="hover:text-white transition-colors">
              Get Started
            </Link>
            <a href="#event-types" className="hover:text-white transition-colors">
              Event Types
            </a>
            <a href="#pricing" className="hover:text-white transition-colors">
              Event Options
            </a>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms & Policy
            </Link>
          </div>
          <p className="mt-8 text-xs text-gray-600">
            &copy; {new Date().getFullYear()} GetInvita. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
