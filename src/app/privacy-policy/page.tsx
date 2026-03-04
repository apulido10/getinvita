import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy',
  description: 'GetInvita Privacy Policy — how we collect, use, and protect your personal information.',
  alternates: { canonical: '/privacy-policy' },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link href="/" className="text-sm text-purple-600 hover:text-purple-700 mb-8 inline-block">
          &larr; Back to Home
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-10">Last updated: February 2026</p>

        <div className="space-y-10 text-gray-700 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Introduction</h2>
            <p>
              GetInvita (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is committed to protecting your privacy.
              This Privacy Policy explains what information we collect, how we use it, and how we protect it
              when you use <span className="text-purple-600">getinvita.com</span> or our services.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Information We Collect</h2>
            <p className="mb-3">We collect the following types of information:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-gray-800">Account information:</strong> Your name and email address when you sign up.</li>
              <li><strong className="text-gray-800">Event information:</strong> Event details, dates, and content you upload (photos, music, messages).</li>
              <li><strong className="text-gray-800">Guest data:</strong> RSVP responses, names, attendance status, and song requests submitted by your guests.</li>
              <li><strong className="text-gray-800">Payment information:</strong> Payments are processed by Stripe. We do not store your credit card number or full payment details on our servers. We only receive a transaction confirmation from Stripe.</li>
              <li><strong className="text-gray-800">Usage data:</strong> Anonymous analytics such as page views and browser type to help improve our platform.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>To create and deliver your event website</li>
              <li>To process your payment through Stripe</li>
              <li>To send you your event confirmation and access details</li>
              <li>To display guest RSVPs to the event creator</li>
              <li>To improve our platform and user experience</li>
              <li>To respond to support requests</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Payment Processing (Stripe)</h2>
            <p>
              We use <strong className="text-gray-800">Stripe</strong> to process all payments securely.
              When you make a purchase, you are submitting your payment information directly to Stripe,
              which is PCI-DSS compliant. GetInvita does not have access to your full card details.
              Stripe&apos;s privacy policy is available at{' '}
              <a
                href="https://stripe.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:underline"
              >
                stripe.com/privacy
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Guest Data</h2>
            <p>
              Guest RSVP data (names, attendance status, messages, and song requests) is stored securely
              via Supabase and is accessible only to the event creator. We do not sell, rent, or share
              guest data with third parties.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Data Sharing</h2>
            <p>
              We do not sell or rent your personal information. We may share data with trusted service
              providers (Stripe, Supabase, Vercel) solely to operate our platform. These providers are
              contractually obligated to keep your data secure and confidential.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Cookies & Analytics</h2>
            <p>
              We use Vercel Analytics to collect anonymous, aggregated usage data. No personal information
              is tied to analytics data. You can disable cookies in your browser settings, though this
              may affect site functionality.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Data Security</h2>
            <p>
              We use industry-standard security practices to protect your data, including encrypted
              connections (HTTPS) and secure database storage. No method of transmission is 100% secure,
              but we take reasonable steps to protect your information.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">9. Data Retention</h2>
            <p>
              We retain your account and event data for as long as your account is active or as needed
              to provide our services. You may request deletion of your account and associated data by
              contacting us at{' '}
              <a href="mailto:support@getinvita.com" className="text-purple-600 hover:underline">
                support@getinvita.com
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">10. Children&apos;s Privacy</h2>
            <p>
              Our platform is not directed to children under 13. We do not knowingly collect personal
              information from children. If you believe a child has submitted information through our
              service, please contact us and we will delete it promptly.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">11. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Changes will be posted on this page
              with an updated date. Continued use of our service constitutes acceptance of any changes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">12. Contact</h2>
            <p>
              Questions about this Privacy Policy? Contact us at{' '}
              <a href="mailto:support@getinvita.com" className="text-purple-600 hover:underline">
                support@getinvita.com
              </a>.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 text-sm text-gray-500">
          See also:{' '}
          <Link href="/terms" className="text-purple-600 hover:underline">
            Terms of Service
          </Link>
        </div>
      </div>
    </main>
  );
}
