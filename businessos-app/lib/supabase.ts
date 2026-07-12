import "server-only";
import { createClient } from "@supabase/supabase-js";

// Server-only Supabase client using the service-role key. Never import this
// from a Client Component — the `server-only` guard above makes any such
// import a build-time error rather than a leaked secret at runtime.
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
