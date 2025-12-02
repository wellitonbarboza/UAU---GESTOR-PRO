import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const missingEnv = !supabaseUrl || !supabaseAnonKey;

export const isSupabaseEnabled = !missingEnv;

export const supabase: SupabaseClient | null =
  !missingEnv && supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: { autoRefreshToken: true, persistSession: true }
      })
    : null;

export function getSupabaseClient(): SupabaseClient {
  if (!supabase) {
    throw new Error("Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.");
  }
  return supabase;
}
