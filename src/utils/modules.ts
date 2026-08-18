export const SCID5_CV = 'scid5_cv'
export const SCID5_PD = 'scid5_pd'

export const INSTRUMENTS = [
  { value: SCID5_CV, label: 'SCID-5-CV', label_fa: 'SCID-5-CV (اختلالات محور I)' },
  { value: SCID5_PD, label: 'SCID-5-PD', label_fa: 'SCID-5-PD (اختلالات شخصیت)' },
]

export const MAIN_MODULE_CODES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'PD']

export const MODULE_COLORS: Record<string, string> = {
  A: '#3b82f6',
  B: '#8b5cf6',
  C: '#f59e0b',
  D: '#ef4444',
  E: '#06b6d4',
  F: '#f43f5e',
  G: '#22c55e',
  H: '#10b981',
  I: '#6366f1',
  J: '#ec4899',
  PD: '#7c3aed',
}