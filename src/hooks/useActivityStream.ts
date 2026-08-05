import { useEffect, useRef, useState } from 'react'
import { apiUrl } from '@/config'
import { useAppSelector } from '@/hooks/useAppStore'
import type { AdminActivityItem } from '@/types'

/**
 * Subscribes to the admin activity SSE stream.
 *
 * EventSource cannot send an Authorization header, so instead of leaking the
 * JWT in a `?token=` query param (which lands in history, proxy logs and
 * referrers) we read the stream with a plain `fetch` and pass the token in the
 * `Authorization` header. The stream is bounded server-side (timeout) and we
 * reconnect automatically; the cursor is read fresh on every reconnect so no
 * event is missed.
 */
export function useActivityStream(afterId: number | null) {
  const accessToken = useAppSelector((state) => state.auth.accessToken)
  const [isLive, setIsLive] = useState(false)
  const [pendingEvents, setPendingEvents] = useState<AdminActivityItem[]>([])
  const controllerRef = useRef<AbortController | null>(null)
  const retryTimerRef = useRef<number | null>(null)
  const newestIdRef = useRef<number | null>(afterId)

  newestIdRef.current = afterId

  useEffect(() => {
    if (!accessToken) return

    let disposed = false

    const scheduleReconnect = (delay: number) => {
      if (disposed) return
      if (retryTimerRef.current !== null) return
      retryTimerRef.current = window.setTimeout(() => {
        retryTimerRef.current = null
        void connect()
      }, delay)
    }

    const connect = async () => {
      if (disposed) return
      const controller = new AbortController()
      controllerRef.current = controller
      const cursor = newestIdRef.current ?? 0
      try {
        const resp = await fetch(
          `${apiUrl('v1/admin/activity/stream/')}?after=${cursor}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
            signal: controller.signal,
          },
        )
        if (!resp.ok) {
          // 401 means the access token expired: stop reconnecting and wait for
          // the RTK interceptor to rotate it — the effect re-runs when the new
          // token lands in the store.
          if (resp.status === 401) return
          setIsLive(false)
          scheduleReconnect(2000)
          return
        }
        if (!resp.body) {
          setIsLive(false)
          scheduleReconnect(2000)
          return
        }

        const reader = resp.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        setIsLive(true)

        while (!disposed) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          let boundary: number
          while ((boundary = buffer.indexOf('\n\n')) !== -1) {
            const chunk = buffer.slice(0, boundary)
            buffer = buffer.slice(boundary + 2)
            const dataLine = chunk.split('\n').find((l) => l.startsWith('data:'))
            if (!dataLine) continue
            const payload = dataLine.slice(5).trim()
            if (!payload) continue
            try {
              const item = JSON.parse(payload) as AdminActivityItem
              setPendingEvents((prev) => {
                if (prev.some((existing) => existing.id === item.id)) return prev
                return [item, ...prev]
              })
            } catch {
              // Ignore malformed events
            }
          }
        }
      } catch {
        // Network error or abort — reconnect unless the hook was unmounted.
      } finally {
        if (controllerRef.current === controller) controllerRef.current = null
        if (!disposed) {
          setIsLive(false)
          scheduleReconnect(2000)
        }
      }
    }

    void connect()

    return () => {
      disposed = true
      controllerRef.current?.abort()
      controllerRef.current = null
      if (retryTimerRef.current !== null) {
        window.clearTimeout(retryTimerRef.current)
        retryTimerRef.current = null
      }
      setIsLive(false)
    }
    // Reconnect when the token changes (e.g. refresh), not on every event.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken])

  return { isLive, pendingEvents, clearPending: () => setPendingEvents([]) }
}
