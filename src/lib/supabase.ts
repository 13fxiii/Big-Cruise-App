import { createClient } from '@supabase/supabase-js';

// The publishable Supabase key is intentionally safe for browser-side use.
// Vercel currently does not have the VITE_* variables configured, so keep the
// production project as a fallback while still allowing env vars to override it.
const DEFAULT_SUPABASE_URL = 'https://qdeozgkmrqectbuhetvc.supabase.co';
const DEFAULT_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_jM4eku7b7m_GG264BCMeyg_Uv_uTuKk';

const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || DEFAULT_SUPABASE_URL;
const key = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || DEFAULT_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'big-cruise-auth',
  },
});
export const UNO_FUNCTION_URL = `${url}/functions/v1/uno`;
