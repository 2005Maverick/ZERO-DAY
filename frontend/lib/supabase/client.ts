import { createBrowserClient } from '@supabase/ssr'
import { createStubClient } from './stub'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

// Only treat as configured if we have a real Supabase project URL + valid-length key
const IS_CONFIGURED =
  SUPABASE_URL.startsWith('https://') &&
  SUPABASE_URL.includes('.supabase.co') &&
  SUPABASE_KEY.length > 30

// Without real Supabase credentials the app runs on a no-op stand-in (see ./stub)
const stub = createStubClient()

export function createClient() {
  if (!IS_CONFIGURED) return stub
  return createBrowserClient(SUPABASE_URL, SUPABASE_KEY)
}
