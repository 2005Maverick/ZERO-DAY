import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/db/admin'
import { completeSession, type SessionsDb } from '@/lib/db/sessions'
import { handleEndSession } from '@/lib/session/end-session'

// Marks a live session completed once its action log is fully synced (3.3, ADR-005).
// Not covered by proxy.ts (API routes answer 401 themselves).
export async function POST(req: Request) {
  return handleEndSession(req, {
    async userId() {
      const supabase = await createClient()
      const { data } = await supabase.auth.getUser()
      return data.user?.id ?? null
    },
    complete: (userId, sessionId) =>
      completeSession(createAdminClient() as unknown as SessionsDb, userId, sessionId),
  })
}
