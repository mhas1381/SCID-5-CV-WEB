import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { apiUrl } from '@/config'
import { useAppSelector } from './useAppStore'
import { clearPendingAbandon, getPendingAbandon } from './useAbandonOnExit'

/**
 * Resolves pending-abandon flags left behind by a tab close / hard navigation.
 *
 * `useAbandonOnExit` records a flag in `localStorage` on `pagehide` instead of
 * firing the abandon request immediately (because `pagehide` also fires on F5
 * refresh, and we must never abandon an interview the clinician is still on).
 *
 * This hook runs on every app load and route change and decides what the flag
 * meant:
 *  - the current load was a **reload** → the clinician never left; drop the
 *    flag and do nothing;
 *  - the user came back to **this interview's page** → they resumed it; drop
 *    the flag (the page's own `markActive` takes over);
 *  - anything else → the previous visit ended without completing the
 *    interview, so fire the abandon request now.
 */
export function usePendingAbandonReconciliation() {
  const accessToken = useAppSelector((s) => s.auth.accessToken)
  const location = useLocation()

  useEffect(() => {
    const pending = getPendingAbandon()
    if (!pending) return

    // A reload means the clinician never left the interview page.
    const nav = performance.getEntriesByType?.('navigation')?.[0] as
      | { type?: string }
      | undefined
    if (nav?.type === 'reload') {
      clearPendingAbandon()
      return
    }

    // If the clinician is now viewing that same interview, treat it as a
    // resume — the interview page's own abandon logic takes over from here.
    if (
      location.pathname === `/interview/${pending.sessionId}` ||
      location.pathname.startsWith(`/interview/${pending.sessionId}/`)
    ) {
      clearPendingAbandon()
      return
    }

    // A real exit happened since the flag was recorded: fire the abandon
    // request for the stale session. Keep the flag until a token is actually
    // available — AppLayout can mount before the JWT is hydrated into the
    // store on a fresh load, and dropping the flag then would silently lose
    // the abandonment. The effect re-runs when the token arrives.
    if (!accessToken) return
    clearPendingAbandon()
    fetch(apiUrl(`/v1/interviews/sessions/${pending.sessionId}/abandon/`), {
      method: 'POST',
      keepalive: true,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ts: pending.ts }),
    }).catch(() => {})
  }, [location.pathname, accessToken])
}
