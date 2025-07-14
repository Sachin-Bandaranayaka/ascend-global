import { createClient } from '@supabase/supabase-js';
import { config } from './config';

export function createSupabaseClient(isServer = false) {
  if (isServer) {
    const { cookies } = require('next/headers');
    const cookieStore = cookies();
    return createClient(
      config.NEXT_PUBLIC_SUPABASE_URL,
      config.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: true,
          storage: {
          getItem: (key) => cookieStore.get(key)?.value,
          setItem: (key: string, value: string) => {
            cookieStore.set({ name: key, value });
          },
          removeItem: (key) => {
            cookieStore.delete({ name: key });
          },
        },
      }
    });
  } else {
    return createClient(
      config.NEXT_PUBLIC_SUPABASE_URL,
      config.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        auth: {
          storage: {
          getItem: (key: string): string | null => {
            if (typeof document === 'undefined') return null;
            const cookie = document.cookie.split('; ').find((c) => c.startsWith(`${key}=`));
            return cookie ? decodeURIComponent(cookie.split('=')[1]) : null;
          },
          setItem: (key: string, value: string, options: any = {}) => {
            if (typeof document === 'undefined') return;
            document.cookie = `${key}=${encodeURIComponent(value)}${Object.entries(options).map(([k, v]) => `; ${k}=${v}`).join('')}`;
          },
          removeItem: (key: string, options: any = {}) => {
            if (typeof document === 'undefined') return;
            document.cookie = `${key}=; Max-Age=0${Object.entries(options).map(([k, v]) => `; ${k}=${v}`).join('')}`;
          },
        },
      }
    });
  }
}
// For client-side usage
export const supabase = createSupabaseClient(false);