'use client';

import { ClipboardList, Upload, Eye, PartyPopper } from 'lucide-react';
import { t, type Lang } from '@/lib/translations';

const stepIcons = [ClipboardList, Upload, Eye, PartyPopper];

export default function HowItWorks({ lang }: { lang: Lang }) {
  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-gray-50">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            {t('landing.howItWorks.heading', lang)}
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            {t('landing.howItWorks.subheading', lang)}
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stepIcons.map((StepIcon, index) => {
            const stepNum = index + 1;
            const title = t(`landing.howItWorks.step${stepNum}.title`, lang);
            const description = t(`landing.howItWorks.step${stepNum}.description`, lang);
            return (
              <div key={stepNum} className="relative text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-100 mb-4">
                  <StepIcon className="h-8 w-8 text-purple-600" />
                </div>
                <div className="absolute -top-2 -right-2 sm:right-auto sm:left-1/2 sm:ml-6 w-8 h-8 rounded-full bg-purple-600 text-white text-sm font-bold flex items-center justify-center">
                  {stepNum}
                </div>
                <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
