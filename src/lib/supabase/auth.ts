import { createClient } from './server';

export async function getAuthUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { user, supabase };
}

export async function requireAuth() {
  const { user, supabase } = await getAuthUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return { user, supabase };
}
