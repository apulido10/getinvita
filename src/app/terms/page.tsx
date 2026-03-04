import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service',
  description: 'GetInvita Terms of Service — your rights, responsibilities, payment terms, and more.',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link href="/" className="text-sm text-purple-600 hover:text-purple-700 mb-8 inline-block">
          &larr; Back to Home
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-10">Last updated: February 2026</p>

        <div className="space-y-10 text-gray-700 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Overview</h2>
            <p>
              GetInvita (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) provides custom event website creation services
              for celebrations including Quincea&ntilde;eras, Weddings, Birthdays, Baby Showers, and more.
              By using our service, you agree to these Terms of Service. If you do not agree, please do not
              use our platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Services</h2>
            <p>
              We provide custom-themed event websites that may include photo galleries, background music,
              RSVP collection, countdown timers, and shareable links depending on the package purchased.
              Event websites are hosted and maintained by GetInvita for the duration of your event period.
              Features available depend on the event type and package selected at checkout.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">3. Payment</h2>
            <p className="mb-3">
              All payments are processed securely through Stripe. By completing a purchase you authorize
              GetInvita to charge the amount shown at checkout. Prices are listed in USD.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Your event website is activated upon successful payment confirmation.</li>
              <li>Optional add-ons (reception, dinner, premium themes) are charged at the rates displayed during checkout.</li>
              <li>You will receive an email receipt from Stripe for every transaction.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4. No Refund Policy</h2>
            <p>
              All sales are final. Due to the digital nature of our services and the immediate access provided
              upon purchase, we do not offer refunds, returns, or exchanges under any circumstances.
              By completing your purchase you acknowledge and agree to this no refund policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">5. User Responsibilities</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>You are responsible for the accuracy of all event information, photos, and content you upload.</li>
              <li>You must not upload content that is illegal, offensive, or infringes on the rights of others.</li>
              <li>You are responsible for sharing your event link with your intended guests.</li>
              <li>You must keep your account credentials secure and not share access with unauthorized parties.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Intellectual Property</h2>
            <p>
              You retain ownership of all photos and content you upload. By uploading content, you grant
              GetInvita a license to host and display that content solely on your event website.
              GetInvita retains ownership of all website templates, designs, branding, and platform code.
              You may not copy, reproduce, or redistribute our templates or designs.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Limitation of Liability</h2>
            <p>
              GetInvita is provided &quot;as is&quot; without warranties of any kind. We are not liable for any
              damages arising from the use or inability to use our service, including but not limited to
              website downtime, data loss, or issues related to event planning. Our total liability to you
              shall not exceed the amount paid for the specific service in question.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Account Termination</h2>
            <p>
              We reserve the right to suspend or terminate accounts that violate these terms, upload
              prohibited content, or engage in fraudulent activity — without refund.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">9. Governing Law</h2>
            <p>
              These Terms are governed by the laws of the State of Texas. Any disputes shall be resolved
              in the courts of Dallas County, Texas.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">10. Changes to These Terms</h2>
            <p>
              We reserve the right to update these Terms at any time. Changes will be posted on this page.
              Continued use of our service after changes constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">11. Contact</h2>
            <p>
              Questions about these Terms? Reach out at{' '}
              <a href="mailto:support@getinvita.com" className="text-purple-600 hover:underline">
                support@getinvita.com
              </a>.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 text-sm text-gray-500">
          See also:{' '}
          <Link href="/privacy-policy" className="text-purple-600 hover:underline">
            Privacy Policy
          </Link>
        </div>
      </div>
    </main>
  );
}
