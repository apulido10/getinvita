import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service & Policy - GetInvita',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link href="/" className="text-sm text-purple-600 hover:text-purple-700 mb-8 inline-block">
          &larr; Back to Home
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service & Policy</h1>
        <p className="text-sm text-gray-500 mb-10">Last updated: February 14, 2026</p>

        <div className="space-y-10 text-gray-700 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Overview</h2>
            <p>
              GetInvita provides custom event website creation services for celebrations including
              Quincea&ntilde;eras, Weddings, Birthdays, Baby Showers, Valentine&apos;s Day, Mother&apos;s Day,
              and Father&apos;s Day. By using our service, you agree to these terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Services</h2>
            <p>
              We provide custom-themed event websites that include features such as photo galleries,
              background music, RSVP collection, countdown timers, and shareable links depending on
              the event type purchased. Event websites are hosted and maintained by GetInvita for the
              duration of your event.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">3. No Refund Policy</h2>
            <p>
              All sales are final. Due to the digital nature of our services and the immediate access
              provided upon purchase, we do not offer refunds, returns, or exchanges under any
              circumstances. By completing your purchase, you acknowledge and agree to this no refund
              policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4. User Responsibilities</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>You are responsible for the accuracy of all event information, photos, and content you upload.</li>
              <li>You must not upload content that is illegal, offensive, or infringes on the rights of others.</li>
              <li>You are responsible for sharing your event link with your intended guests.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Privacy & Data</h2>
            <p>
              We collect information necessary to provide our services, including event details, photos,
              and RSVP responses from your guests. Guest RSVP data (names, attendance status, messages,
              and song requests) is stored securely and is accessible only to the event creator. We do
              not sell or share your data or your guests&apos; data with third parties.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Intellectual Property</h2>
            <p>
              You retain ownership of all photos and content you upload. By uploading content, you grant
              GetInvita a license to host and display that content on your event website. GetInvita
              retains ownership of all website templates, designs, and platform code.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Limitation of Liability</h2>
            <p>
              GetInvita is provided &quot;as is&quot; without warranties of any kind. We are not liable for any
              damages arising from the use or inability to use our service, including but not limited to
              website downtime, data loss, or any issues related to event planning. Our total liability
              shall not exceed the amount paid for the specific service in question.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Modifications</h2>
            <p>
              We reserve the right to update these terms at any time. Continued use of our service after
              changes constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">9. Contact</h2>
            <p>
              If you have questions about these terms, please contact us through our website.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
