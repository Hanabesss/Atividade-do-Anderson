// js/supabase-client.js
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

let supabaseClient = null;

try {
  if (SUPABASE_URL && !SUPABASE_URL.includes('seu-projeto')) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
} catch (e) {
  console.warn('Supabase Client fallback to Mock Mode:', e);
}

export const supabase = supabaseClient;
