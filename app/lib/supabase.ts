// This file creates a single shared Supabase client that the rest of the app imports.
// Keeping it in one place means if we ever change config, we only change it here.

import { createClient } from '@supabase/supabase-js'

// These environment variables come from .env.local
// NEXT_PUBLIC_ prefix means they're safe to use in both server and client code
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// createClient connects to your Supabase project using the URL and key
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
