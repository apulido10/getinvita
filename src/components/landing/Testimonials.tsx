import { Star } from 'lucide-react';

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

export default function Testimonials() {
  return (
    <section className="py-20 sm:py-28 bg-white">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Loved by Families
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            See what our customers have to say.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl border border-gray-100 bg-gray-50 p-6 sm:p-8"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-gray-700 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-6 border-t border-gray-200 pt-4">
                <p className="font-semibold text-gray-900">{t.name}</p>
                <p className="text-sm text-gray-500">{t.event}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
