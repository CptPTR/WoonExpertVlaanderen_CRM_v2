import { SupabaseClient, createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.APP_SUPABASE_URL ?? ''
const supabaseAnonKey = process.env.APP_ANON_KEY ?? ''

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey)
