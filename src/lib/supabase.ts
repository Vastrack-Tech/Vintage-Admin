import {createClient, SupabaseClient} from '@supabase/supabase-js'

export function createSupabaseAdmin(): SupabaseClient {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set.');
  }
  if (!process.env.SUPABASE_KEY) {
    throw new Error('SUPABASE_KEY is not set.');
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}