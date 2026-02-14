import { requireAuth } from '@/lib/supabase/auth';
import DashboardEventList from '@/components/dashboard/DashboardEventList';
import { Event } from '@/types';

export default async function DashboardPage() {
  const { user, supabase } = await requireAuth();

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return <DashboardEventList events={(events as Event[]) || []} />;
}
