import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export function getSupabaseServerClient() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Supabase service env vars missing");
  }
  return createClient(supabaseUrl, supabaseServiceKey);
}
