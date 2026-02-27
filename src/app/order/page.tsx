import { Metadata } from 'next';
import { Suspense } from 'react';
import OrderForm from './OrderForm';

export const metadata: Metadata = {
  title: 'Create Your Event',
  description: 'Create a beautiful custom event website for your Quinceañera, Wedding, Birthday, or Baby Shower.',
  robots: { index: false, follow: false },
};

export default function OrderPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
          <p className="text-gray-500">Loading...</p>
        </main>
      }
    >
      <OrderForm />
    </Suspense>
  );
}
