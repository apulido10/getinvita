'use client';

import { ClipboardList, Upload, Eye, PartyPopper } from 'lucide-react';
import { t, type Lang } from '@/lib/translations';

const stepIcons = [ClipboardList, Upload, Eye, PartyPopper];

export default function HowItWorks({ lang }: { lang: Lang }) {
  return (
    <section id="how-it-works" className="py-24 sm:py-32 bg-cream">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-20 max-w-2xl mx-auto">
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-plum mb-4">
            {t('landing.howItWorks.heading', lang)}
          </p>
          <h2 className="font-serif text-4xl sm:text-5xl font-medium tracking-tight text-gray-900 leading-tight">
            {t('landing.howItWorks.subheading', lang)}
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {stepIcons.map((StepIcon, index) => {
            const stepNum = index + 1;
            const title = t(`landing.howItWorks.step${stepNum}.title`, lang);
            const description = t(`landing.howItWorks.step${stepNum}.description`, lang);
            return (
              <div key={stepNum} className="text-center lg:text-left">
                <p className="font-serif text-5xl text-plum/30 mb-3">
                  {String(stepNum).padStart(2, '0')}
                </p>
                <StepIcon className="h-7 w-7 text-gray-900 mb-4 mx-auto lg:mx-0" />
                <h3 className="font-serif text-xl font-medium text-gray-900">{title}</h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
