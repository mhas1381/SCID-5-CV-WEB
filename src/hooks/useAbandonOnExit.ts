import { useCallback, useEffect, useRef } from 'react'
import { apiUrl } from '@/config'
import { useAppSelector } from './useAppStore'

/**
 * Marks an interview session as abandoned when the clinician leaves the
 * interview without completing it.
 *
 * Triggers handled:
 *  1. SPA navigation away — the page component unmounts while the document
 *     stays visible (e.g. the clinician clicks a sidebar link or uses the
 *     browser back button). This fires the abandon request immediately.
 *  2. Tab close / hard navigation — the document is torn down. A `pagehide`
 *     listener records a pending-abandon flag in `localStorage` instead of
 *     firing immediately, because `pagehide` also fires on F5 refresh and we
 *     must never abandon an interview the clinician is still working on.
 *     `usePendingAbandonReconciliation` (mounted in `AppLayout`) resolves the
 *     flag on the next app load: if that load was a reload it drops the flag
 *     (no-op), otherwise it fires the abandon request for the stale session.
 *
 * The caller controls the state via the returned helpers:
 *  - `markActive()` → the interview is genuinely in progress; abandon on exit.
 *  - `markDone()`   → the interview completed; never abandon.
 *  - `markSkip()`   → an intentional *internal* navigation (e.g. going to the
 *    results page or the overview step); don't abandon this one exit.
 *
 * The default state is "skip" so the component's initial mount (and React
 * StrictMode's dev double-mount) can never accidentally abandon a session.
 */

export const PENDING_ABANDON_KEY = 'scid_pending_abandon'

interface PendingAbandon {
  sessionId: number
  ts: number
}

export function setPendingAbandon(sessionId: number) {
  const pending: PendingAbandon = { sessionId, ts: Date.now() }
  localStorage.setItem(PENDING_ABANDON_KEY, JSON.stringify(pending))
}

export function clearPendingAbandon() {
  localStorage.removeItem(PENDING_ABANDON_KEY)
}

export function getPendingAbandon(): PendingAbandon | null {
  try {
    const raw = localStorage.getItem(PENDING_ABANDON_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<PendingAbandon>
    if (!parsed?.sessionId) return null
    return { sessionId: parsed.sessionId, ts: parsed.ts ?? Date.now() }
  } catch {
    return null
  }
}

export function useAbandonOnExit(sessionId: number) {
  const accessToken = useAppSelector((s) => s.auth.accessToken)
  const tokenRef = useRef(accessToken)
  tokenRef.current = accessToken
  const stateRef = useRef<'active' | 'done' | 'skip'>('skip')
  const firedRef = useRef(false)

  const fire = useCallback(() => {
    if (firedRef.current || stateRef.current !== 'active') return
    firedRef.current = true
    // Fire-and-forget. keepalive:true lets this request finish even when the
    // tab is being closed, and the JWT goes in the header (unlike sendBeacon).
    fetch(apiUrl(`/v1/interviews/sessions/${sessionId}/abandon/`), {
      method: 'POST',
      keepalive: true,
      headers: {
        Authorization: `Bearer ${tokenRef.current}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    }).catch(() => {
      // The session might be completed/removed already — nothing to do.
    })
  }, [sessionId])

  // SPA navigation away (component unmount). On genuine page teardown
  // (F5 / tab close) `document.visibilityState` is already 'hidden', so the
  // unmount path only fires for in-app navigation; the pagehide path below
  // covers real unloads via the localStorage flag.
  useEffect(() => () => {
    if (document.visibilityState !== 'hidden') fire()
  }, [fire])

  // Tab close / hard navigation. Record the pending abandon — do NOT fire
  // here, because pagehide also fires on F5 and that would falsely abandon an
  // interview the clinician never left.
  useEffect(() => {
    const onPageHide = () => {
      if (stateRef.current === 'active' && !firedRef.current) {
        setPendingAbandon(sessionId)
      }
    }
    window.addEventListener('pagehide', onPageHide)
    return () => window.removeEventListener('pagehide', onPageHide)
  }, [sessionId])

  return {
    markActive: useCallback(() => {
      stateRef.current = 'active'
    }, []),
    markDone: useCallback(() => {
      stateRef.current = 'done'
    }, []),
    markSkip: useCallback(() => {
      stateRef.current = 'skip'
    }, []),
  }
}
