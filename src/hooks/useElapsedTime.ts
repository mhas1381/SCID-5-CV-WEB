import { useCallback, useEffect, useRef, useState } from 'react'

interface UseElapsedTimeOptions {
  sessionId: number
  initialElapsed?: number
  isActive: boolean
  onUpdate: (elapsed: number) => void
}

export function useElapsedTime({
  sessionId,
  initialElapsed = 0,
  isActive,
  onUpdate,
}: UseElapsedTimeOptions) {
  const [displayTime, setDisplayTime] = useState(initialElapsed)
  const baseRef = useRef(initialElapsed)
  const startRef = useRef<number | null>(null)
  const lastSavedRef = useRef(initialElapsed)
  const activeRef = useRef(isActive)

  const calcElapsed = useCallback(() => {
    const base = baseRef.current
    if (startRef.current === null) return base
    return base + Math.floor((Date.now() - startRef.current) / 1000)
  }, [])

  const save = useCallback(() => {
    const total = calcElapsed()
    if (total !== lastSavedRef.current) {
      lastSavedRef.current = total
      onUpdate(total)
    }
  }, [calcElapsed, onUpdate])

  // Initialize / re-sync when backend value changes
  useEffect(() => {
    const baseWas = baseRef.current
    baseRef.current = initialElapsed
    lastSavedRef.current = initialElapsed
    if (isActive) {
      if (baseWas !== initialElapsed) {
        // Backend returned a different value — restart from saved point
        startRef.current = Date.now()
      } else if (startRef.current === null) {
        startRef.current = Date.now()
      }
    }
    setDisplayTime(initialElapsed)
    // Always call setDisplayTime in a rAF so the tick can correct it
  }, [initialElapsed, isActive])

  // Pause/resume on isActive toggle
  useEffect(() => {
    if (isActive && startRef.current === null) {
      startRef.current = Date.now()
    } else if (!isActive && startRef.current !== null) {
      baseRef.current += Math.floor((Date.now() - startRef.current) / 1000)
      startRef.current = null
      save()
    }
    activeRef.current = isActive
  }, [isActive, save])

  // Tick display every second
  useEffect(() => {
    if (!isActive) return
    const id = setInterval(() => setDisplayTime(calcElapsed()), 1000)
    return () => clearInterval(id)
  }, [isActive, calcElapsed])

  // Persist every 10 s while active
  useEffect(() => {
    if (!isActive) return
    const id = setInterval(() => save(), 10_000)
    return () => clearInterval(id)
  }, [isActive, save])

  // Pause on tab hidden, resume on visible
  useEffect(() => {
    const onVis = () => {
      if (document.hidden && startRef.current !== null) {
        baseRef.current += Math.floor((Date.now() - startRef.current) / 1000)
        startRef.current = null
        save()
      } else if (!document.hidden && activeRef.current && startRef.current === null) {
        startRef.current = Date.now()
      }
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [save])

  // Final flush on page unload
  useEffect(() => {
    const onUnload = () => {
      if (startRef.current !== null) {
        baseRef.current += Math.floor((Date.now() - startRef.current) / 1000)
        startRef.current = null
      }
      const total = baseRef.current
      if (total !== lastSavedRef.current) {
        const blob = new Blob([JSON.stringify({ elapsed_time: total })], {
          type: 'application/json',
        })
        navigator.sendBeacon(`/api/v1/interviews/sessions/${sessionId}/`, blob)
      }
    }
    window.addEventListener('beforeunload', onUnload)
    return () => window.removeEventListener('beforeunload', onUnload)
  }, [sessionId])

  return displayTime
}
