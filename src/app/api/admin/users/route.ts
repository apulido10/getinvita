import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/supabase/auth';
import { createServiceClient } from '@/lib/supabase/server';

const ADMIN_EMAIL = 'alexanderpulido10@gmail.com';

export async function GET() {
  try {
    const { user } = await requireAuth();
    if (user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = createServiceClient();
    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const users = data.users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.user_metadata?.full_name || u.user_metadata?.name || null,
      provider: u.app_metadata?.provider || 'email',
      created_at: u.created_at,
    }));

    return NextResponse.json({ users });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
