import { createClient } from "@supabase/supabase-js";
import { getSupabaseUrl } from "./env";

/** Server-only: uploads / deletes. Never import in client components. */
export function createServiceRoleClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set (required for admin uploads)");
  }
  return createClient(getSupabaseUrl(), key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
