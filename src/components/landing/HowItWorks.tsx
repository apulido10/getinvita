'use client';

import { ClipboardList, Upload, Eye, PartyPopper } from 'lucide-react';

const steps = [
  {
    icon: ClipboardList,
    title: 'Choose Your Event',
    description: 'Pick your event type and fill in a few details to get started.',
  },
  {
    icon: Upload,
    title: 'Upload Your Content',
    description: 'Use your private dashboard to add photos, music, and event details.',
  },
  {
    icon: Eye,
    title: 'Preview & Publish',
    description: 'Review your beautiful event page and publish it when you\'re ready.',
  },
  {
    icon: PartyPopper,
    title: 'Share & Celebrate',
    description: 'Send your custom link to guests so they can RSVP and get excited!',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-gray-50">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            How It Works
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Four simple steps to your perfect event website
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={step.title} className="relative text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-100 mb-4">
                <step.icon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="absolute -top-2 -right-2 sm:right-auto sm:left-1/2 sm:ml-6 w-8 h-8 rounded-full bg-purple-600 text-white text-sm font-bold flex items-center justify-center">
                {index + 1}
              </div>
              <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
