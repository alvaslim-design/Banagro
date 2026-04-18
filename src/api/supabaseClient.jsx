import { createClient } from '@supabase/supabase-js'

// Estas son tus credenciales de Banagro
const supabaseUrl = 'https://hrfomdfaolpjrvwvwpdp.supabase.co'
const supabaseAnonKey = 'sb_publishable_QBekVppUvXPQfbuZKqDwMQ_5Hli7C50'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)