import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

function isValidSupabaseUrl(url: string): boolean {
  if (!url.startsWith('https://')) return false;
  try {
    const parsed = new URL(url);
    return parsed.hostname.endsWith('.supabase.co');
  } catch {
    return false;
  }
}

function isValidAnonKey(key: string): boolean {
  if (key.length < 20) return false;
  if (key.startsWith('your-')) return false;
  const parts = key.split('.');
  return parts.length === 3;
}

export const isSupabaseConfigured =
  isValidSupabaseUrl(SUPABASE_URL) && isValidAnonKey(SUPABASE_ANON_KEY);

export const supabase =
  isSupabaseConfigured
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          storage: AsyncStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      })
    : // Safe stub so Expo runs without env vars
      ({
        functions: {
          invoke: async () => ({
            data: null,
            error: new Error(
              'Supabase is not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.'
            ),
          }),
        },
      } as any);
