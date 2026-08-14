import type { CSSProperties } from 'react'

/**
 * Recharts tooltip styling that follows the app theme (CSS variables), so
 * chart tooltips stay readable in both light and dark mode.
 */
export const chartTooltipProps = {
  contentStyle: {
    backgroundColor: 'hsl(var(--card))',
    borderRadius: 8,
    border: '1px solid hsl(var(--border))',
    color: 'hsl(var(--foreground))',
  } satisfies CSSProperties,
  labelStyle: { color: 'hsl(var(--foreground))' } satisfies CSSProperties,
  itemStyle: { color: 'hsl(var(--foreground))' } satisfies CSSProperties,
}