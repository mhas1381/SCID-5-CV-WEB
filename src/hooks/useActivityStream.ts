import { useEffect, useRef, useState } from 'react'
import { apiUrl } from '@/config'
import { useAppSelector } from '@/hooks/useAppStore'
import type { AdminActivityItem } from '@/types'

/**
 * Subscribes to the admin activity SSE stream.
 *
 * EventSource cannot send an Authorization header, so the access token is
 * passed as a query param. The stream is bounded server-side (timeout) and
 * the browser reconnects automatically; we also reset the cursor on
 * reconnect so no event is missed.
 */
export function useActivityStream(afterId: number | null) {
  const accessToken = useAppSelector((state) => state.auth.accessToken)
  const [isLive, setIsLive] = useState(false)
  const [pendingEvents, setPendingEvents] = useState<AdminActivityItem[]>([])
  const esRef = useRef<EventSource | null>(null)
  const newestIdRef = useRef<number | null>(afterId)

  newestIdRef.current = afterId

  useEffect(() => {
    if (!accessToken) return

    let es: EventSource | null = null
    let disconnected = false

    const connect = () => {
      if (disconnected) return
      const cursor = newestIdRef.current ?? 0
      es = new EventSource(
        `${apiUrl('v1/admin/activity/stream/')}?after=${cursor}&token=${encodeURIComponent(accessToken)}`
      )
      esRef.current = es

      es.onopen = () => setIsLive(true)
      es.onerror = () => {
        // The browser reconnects by itself; flip the indicator until it
        // comes back up.
        setIsLive(false)
      }

      es.addEventListener('activity', (event) => {
        try {
          const item = JSON.parse((event as MessageEvent).data) as AdminActivityItem
          setPendingEvents((prev) => {
            if (prev.some((existing) => existing.id === item.id)) return prev
            return [item, ...prev]
          })
        } catch {
          // Ignore malformed events
        }
      })
    }

    connect()

    return () => {
      disconnected = true
      es?.close()
      esRef.current = null
      setIsLive(false)
    }
    // Reconnect when the token changes (e.g. refresh), not on every event.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken])

  return { isLive, pendingEvents, clearPending: () => setPendingEvents([]) }
}
