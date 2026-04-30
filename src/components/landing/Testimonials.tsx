import { t, type Lang } from '@/lib/translations';

const testimonials = [
  {
    name: 'Maria G.',
    event: 'Quinceañera',
    quote:
      'My daughter\'s quinceañera site was absolutely gorgeous. Our guests loved being able to RSVP online and the music that played when they opened it. So many compliments!',
  },
  {
    name: 'Jessica & Daniel',
    event: 'Wedding',
    quote:
      'We needed something beautiful but easy to set up. GetInvita gave us a stunning wedding page in minutes. Our families couldn\'t stop sharing the link.',
  },
  {
    name: 'Rosa M.',
    event: 'Quinceañera',
    quote:
      'Way better than paper invitations and so much easier to manage. I could see RSVPs coming in right away. Worth every penny.',
  },
];

export default function Testimonials({ lang }: { lang: Lang }) {
  return (
    <section className="py-24 sm:py-32 bg-white">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-20 max-w-2xl mx-auto">
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-plum mb-4">
            {t('landing.testimonials.heading', lang)}
          </p>
          <h2 className="font-serif text-4xl sm:text-5xl font-medium tracking-tight text-gray-900 leading-tight">
            {t('landing.testimonials.subheading', lang)}
          </h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-10 lg:gap-12">
          {testimonials.map((testimonial) => (
            <figure key={testimonial.name} className="flex flex-col">
              <span aria-hidden="true" className="font-serif text-6xl leading-none text-plum/40 mb-2">
                &ldquo;
              </span>
              <blockquote className="font-serif text-lg text-gray-800 leading-relaxed flex-1">
                {testimonial.quote}
              </blockquote>
              <figcaption className="mt-6 pt-5 border-t border-stone-200">
                <p className="font-medium text-gray-900">{testimonial.name}</p>
                <p className="text-sm text-gray-500">{testimonial.event}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
