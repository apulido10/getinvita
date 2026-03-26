export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/supabase/auth';
import AdminClient from './AdminClient';

const ADMIN_EMAIL = 'alexanderpulido10@gmail.com';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  try {
    const { user } = await requireAuth();
    if (user.email !== ADMIN_EMAIL) {
      redirect('/dashboard');
    }
    return <AdminClient />;
  } catch {
    redirect('/login?redirect=/admin');
  }
}
