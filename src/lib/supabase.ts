import { createClient } from "@supabase/supabase-js";

const publicSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const publicAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const serverSupabaseUrl = process.env.SUPABASE_URL ?? publicSupabaseUrl;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

function createSupabaseClient(url: string, key: string) {
  return createClient(url, key, {
    auth: {
      persistSession: false
    }
  });
}

export function getSupabaseClient() {
  if (!publicSupabaseUrl || !publicAnonKey) {
    throw new Error(
      "Supabase env vars missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }
  return createSupabaseClient(publicSupabaseUrl, publicAnonKey);
}

export function getSupabaseServerClient() {
  if (serverSupabaseUrl && serviceRoleKey) {
    return createSupabaseClient(serverSupabaseUrl, serviceRoleKey);
  }
  if (!publicSupabaseUrl || !publicAnonKey) {
    throw new Error(
      "Supabase env vars missing. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY)."
    );
  }
  return createSupabaseClient(publicSupabaseUrl, publicAnonKey);
}
