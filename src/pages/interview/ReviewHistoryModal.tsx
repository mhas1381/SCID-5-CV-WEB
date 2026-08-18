import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, History, X } from 'lucide-react'
import { useGetModuleQuestionsQuery, useGetModulesQuery } from '@/store/api/interviewApi'
import { Button } from '@/components/ui'
import { cn } from '@/utils/cn'
import { MODULE_COLORS } from '@/utils/modules'
import type { Question, SessionResponse } from '@/types'

interface ReviewHistoryModalProps {
  open: boolean
  responses: SessionResponse[]
  isRtl: boolean
  t: (key: string) => string
  activeQuestionId: string | null
  onSelect: (questionId: string) => void
  onClose: () => void
}

function answerSnippet(r: SessionResponse, isRtl: boolean): string {
  if (r.selected_option_label_fa || r.selected_option_label) {
    return isRtl
      ? r.selected_option_label_fa || r.selected_option_label!
      : r.selected_option_label || r.selected_option_label_fa!
  }
  if (r.text_response) {
    const text = r.text_response.trim()
    return text.length > 24 ? `${text.slice(0, 24)}...` : text
  }
  if (r.numeric_response !== null && r.numeric_response !== undefined) {
    return String(r.numeric_response)
  }
  if (r.date_response) return r.date_response
  return '—'
}

function questionText(q: Question | undefined, isRtl: boolean): string {
  if (!q) return ''
  const txt = isRtl && q.text_fa ? q.text_fa : q.text
  return txt.replace(/\\n/g, ' ').replace(/\s+/g, ' ').trim()
}

function ModuleAccordion({
  moduleCode,
  moduleName,
  responses,
  isRtl,
  t,
  activeQuestionId,
  onSelect,
}: {
  moduleCode: string
  moduleName: string
  responses: SessionResponse[]
  isRtl: boolean
  t: (key: string) => string
  activeQuestionId: string | null
  onSelect: (questionId: string) => void
}) {
  const { data: questions } = useGetModuleQuestionsQuery(moduleCode)
  const qMap = useMemo(() => {
    const map = new Map<string, Question>()
    for (const q of questions ?? []) map.set(q.question_id, q)
    return map
  }, [questions])

  const ordered = useMemo(
    () =>
      [...responses].sort(
        (a, b) =>
          new Date(a.answered_at).getTime() - new Date(b.answered_at).getTime()
      ),
    [responses]
  )

  return (
    <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3 min-w-0">
          <ChevronDown className="h-4 w-4 shrink-0 text-[hsl(var(--muted-foreground))]" />
          <span
            className="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold text-white shrink-0"
            style={{ backgroundColor: MODULE_COLORS[moduleCode] ?? 'hsl(var(--primary))' }}
          >
            {moduleCode}
          </span>
          <span className="font-semibold">{moduleName}</span>
        </div>
        <span className="text-xs text-[hsl(var(--muted-foreground))] shrink-0">
          {ordered.length} {t('interview.reviewCount')}
        </span>
      </div>
      <div className="border-t px-4 pb-4 pt-3 space-y-2">
        {ordered.map((r) => {
          const q = qMap.get(r.question_id_str)
          const text = questionText(q, isRtl)
          const snippet = answerSnippet(r, isRtl)
          const active = activeQuestionId === r.question_id_str
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => onSelect(r.question_id_str)}
              data-testid="review-history-item"
              className={cn(
                'w-full flex flex-col items-start gap-1.5 rounded-lg border p-3 text-left text-sm transition-colors',
                active
                  ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5'
                  : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-[hsl(var(--accent))]'
              )}
            >
              <span className="flex w-full items-center justify-between gap-2">
                <span className="font-mono text-xs text-[hsl(var(--muted-foreground))] shrink-0">
                  {r.question_id_str}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                  {snippet}
                </span>
              </span>
              {text && (
                <span className="text-[hsl(var(--foreground))] leading-relaxed line-clamp-2">
                  {text}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

const modalVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 16 },
  visible: { opacity: 1, scale: 1, y: 0 },
}

export function ReviewHistoryModal({
  open,
  responses,
  isRtl,
  t,
  activeQuestionId,
  onSelect,
  onClose,
}: ReviewHistoryModalProps) {
  const { data: modules } = useGetModulesQuery()
  const moduleNames = useMemo(() => {
    const map = new Map<string, { name: string; name_fa?: string }>()
    for (const m of modules ?? []) map.set(m.code, m)
    return map
  }, [modules])

  const moduleLabel = (code: string): string => {
    const m = moduleNames.get(code)
    if (!m) return `${t('interview.module')} ${code}`
    return isRtl && m.name_fa ? m.name_fa : m.name
  }

  const grouped = useMemo(() => {
    const map = new Map<string, SessionResponse[]>()
    for (const r of responses) {
      const qid = r.question_id_str ?? ''
      const code = qid.toUpperCase().startsWith('PD') ? 'PD' : qid.charAt(0).toUpperCase()
      if (!code) continue
      if (!map.has(code)) map.set(code, [])
      map.get(code)!.push(r)
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  }, [responses])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            className="absolute inset-0 bg-black/50"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            className="relative z-10 mx-4 w-full max-w-3xl max-h-[85vh] flex flex-col rounded-xl bg-[var(--glass-bg)] backdrop-blur-xl shadow-[var(--glass-shadow)] border border-[var(--glass-border)]"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.2 }}
            data-testid="review-history-modal"
          >
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-5 py-4">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-[hsl(var(--primary))]" />
                <h3 className="text-lg font-semibold">{t('interview.reviewHistory')}</h3>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose} aria-label={t('interview.reviewClose')}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {grouped.length === 0 ? (
                <p className="text-center py-10 text-sm text-[hsl(var(--muted-foreground))]">
                  {t('interview.reviewHistoryEmpty')}
                </p>
              ) : (
                grouped.map(([code, rs]) => (
                  <ModuleAccordion
                    key={code}
                    moduleCode={code}
                    moduleName={moduleLabel(code)}
                    responses={rs}
                    isRtl={isRtl}
                    t={t}
                    activeQuestionId={activeQuestionId}
                    onSelect={onSelect}
                  />
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
