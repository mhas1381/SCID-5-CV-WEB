import { SCID5_CV, SCID5_PD } from './modules'
import type { Instrument } from '@/types'

export function isPd(instrument?: string): boolean {
  return instrument === SCID5_PD
}

export interface InstrumentConfig {
  /** Whether the module list is locked (PD has a single module). */
  modulesLocked: boolean
  /** Modules pre-selected when this instrument is chosen. */
  initialModules: string[]
  /** Whether the background overview is always included (no choice shown). */
  overviewAlwaysIncluded: boolean
  /** Whether the include/skip-overview choice card is shown. */
  showOverviewChoice: boolean
  /** Whether the "clear selection" button is shown. */
  clearSelectionAllowed: boolean
  /** Locale key of the small hint under the module list. */
  hintKey: string
  /** Whether the API is told which modules to run (PD runs its full module). */
  sendModulesParam: boolean
}

export const INSTRUMENT_CONFIG: Record<Instrument, InstrumentConfig> = {
  [SCID5_CV]: {
    modulesLocked: false,
    initialModules: [],
    overviewAlwaysIncluded: false,
    showOverviewChoice: true,
    clearSelectionAllowed: true,
    hintKey: 'interview.modulesGroupedHint',
    sendModulesParam: true,
  },
  [SCID5_PD]: {
    modulesLocked: true,
    initialModules: ['PD'],
    overviewAlwaysIncluded: true,
    showOverviewChoice: false,
    clearSelectionAllowed: false,
    hintKey: 'interview.pdOverviewIncluded',
    sendModulesParam: false,
  },
}

// PD-questions use a two-letter prefix ("PD1", "PD_B", ...) so a plain
// charAt(0) would derive the wrong module code ("P"). The instrument is kept
// in the signature for future use / consistency with firstModuleCode.
export function deriveModuleCode(questionId: string, instrument?: string): string | null {
  const qid = (questionId || '').toUpperCase()
  if (qid.startsWith('PD')) return 'PD'
  if (qid.charAt(0)) return qid.charAt(0)
  return null
}

export function firstModuleCode(instrument?: Instrument): string {
  return isPd(instrument) ? 'PD' : 'A'
}

export function instrumentLabel(instrument?: string): string {
  return isPd(instrument) ? 'SCID-5-PD' : 'SCID-5-CV'
}

export function instrumentBadgeClasses(instrument?: string): string {
  return isPd(instrument)
    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
    : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
}