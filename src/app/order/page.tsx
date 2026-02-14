import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/supabase/auth';
import OrderForm from './OrderForm';

export default async function OrderPage() {
  const { user } = await getAuthUser();
  if (!user) {
    redirect('/login?redirect=/order');
  }

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
