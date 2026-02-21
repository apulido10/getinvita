export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { requireAuth } from '@/lib/supabase/auth';
import DashboardEventList from '@/components/dashboard/DashboardEventList';
import { Event } from '@/types';
import { Lang } from '@/lib/translations';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string; confirmed?: string; reset?: string }>;
}) {
  const { lang: langParam, confirmed, reset } = await searchParams;
  const lang: Lang = langParam === 'es' ? 'es' : 'en';
  const { user, supabase } = await requireAuth();

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return <DashboardEventList events={(events as Event[]) || []} lang={lang} confirmed={confirmed === 'true'} reset={reset === 'true'} />;
}
