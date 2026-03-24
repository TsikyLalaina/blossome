import "server-only";

import { createClient } from "@supabase/supabase-js";

/**
 * Creates a privileged Supabase admin client using the service-role key.
 *
 * ⚠️  Only use in API Route Handlers for privileged operations.
 * The `server-only` import ensures this file can never be imported
 * from a Client Component bundle.
 */
export function createAdminSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
