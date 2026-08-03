import { memo, useEffect, useRef, useState } from 'react'

interface SessionTimerTextProps {
  initialElapsed: number
  isActive: boolean
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m >= 60) {
    const h = Math.floor(m / 60)
    return `${h}:${String(m % 60).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${m}:${String(s).padStart(2, '0')}`
}

/**
 * Displays the interview's elapsed time with its own 1-second ticker.
 *
 * The elapsed time is owned by a separate memoized component so the per-second
 * re-render is isolated here instead of re-rendering the entire interview page
 * (which used to run on every tick via useElapsedTime's display state).
 */
export const SessionTimerText = memo(function SessionTimerText({
  initialElapsed,
  isActive,
}: SessionTimerTextProps) {
  const [elapsed, setElapsed] = useState(initialElapsed)
  const baseRef = useRef(initialElapsed)
  const startRef = useRef<number | null>(isActive ? Date.now() : null)

  useEffect(() => {
    baseRef.current = initialElapsed
    if (isActive && startRef.current === null) {
      startRef.current = Date.now()
    } else if (!isActive) {
      if (startRef.current !== null) {
        baseRef.current += Math.floor((Date.now() - startRef.current) / 1000)
        startRef.current = null
      }
    }
    setElapsed(baseRef.current)
  }, [initialElapsed, isActive])

  useEffect(() => {
    if (!isActive) return
    const id = setInterval(() => {
      const total =
        startRef.current === null
          ? baseRef.current
          : baseRef.current + Math.floor((Date.now() - startRef.current) / 1000)
      setElapsed(total)
    }, 1000)
    return () => clearInterval(id)
  }, [isActive])

  return (
    <span className="text-xs text-[hsl(var(--muted-foreground))] font-mono tabular-nums">
      {formatTime(elapsed)}
    </span>
  )
})
