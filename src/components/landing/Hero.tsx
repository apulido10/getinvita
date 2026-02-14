'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-violet-950 via-purple-900 to-fuchsia-800 text-white">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djJoLTJ2LTJoMnptMC00aDJ2Mmgt MnYtMnptLTQgOHYtMmgydjJoLTJ6bTQtMTJ2Mmgt MnYtMmgyem0tOCA4djJoLTJ2LTJoMnptLTQtNGgydjJoLTJ2LTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
      {/* Soft bottom fade into white */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
      <div className="relative mx-auto max-w-6xl px-6 pt-32 pb-24 sm:pt-36 sm:pb-28 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm backdrop-blur-sm mb-6">
          <Sparkles className="h-4 w-4 text-yellow-300" />
          <span>Beautiful event websites in minutes</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold tracking-tight leading-tight">
          Your Event Deserves
          <br />
          <span className="bg-gradient-to-r from-pink-300 via-rose-300 to-yellow-200 bg-clip-text text-transparent">
            A Stunning Website
          </span>
        </h1>
        <p className="mt-5 text-base sm:text-lg text-purple-200 max-w-2xl mx-auto leading-relaxed">
          Custom event pages for Quinceañeras, Weddings, Birthdays & Baby Showers.
          Upload your photos, music, and details — we handle the rest.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login?redirect=/order"
            className="inline-flex items-center justify-center rounded-full bg-white text-purple-900 px-8 py-3.5 text-base font-semibold hover:bg-purple-50 transition-colors shadow-xl shadow-purple-900/30"
          >
            Get Started Free
          </Link>
          <a
            href="#event-types"
            className="inline-flex items-center justify-center rounded-full border-2 border-white/30 px-8 py-3.5 text-base font-semibold hover:bg-white/10 transition-colors"
          >
            See Event Types
          </a>
        </div>
      </div>
    </section>
  );
}
