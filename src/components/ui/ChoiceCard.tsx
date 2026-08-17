import { Check, X } from 'lucide-react'
import { latinClass, latinLang } from '@/lib/direction'

export type ChoiceState =
  | 'idle'
  | 'selected'
  | 'correct'
  | 'incorrect'
  | 'dimmed'

const STATES: Record<ChoiceState, string> = {
  idle: 'border-line bg-surface text-text hover:border-accent hover:bg-surface-2',
  selected: 'border-accent bg-accent/10 text-bright glow-sm',
  correct: 'border-safe bg-safe/10 text-bright',
  incorrect: 'border-danger bg-danger/10 text-bright',
  dimmed: 'border-line-soft bg-surface/40 text-muted',
}

/**
 * Verdict markers.
 *
 * Colour alone never carries the meaning — every verdict pairs a tint with an
 * icon *and* an Arabic word. This is the component the Privacy Sorter and
 * Real-or-Fake are built on, so it is where that rule actually matters.
 */
const VERDICTS: Partial<
  Record<ChoiceState, { icon: typeof Check; labelAr: string; tone: string }>
> = {
  correct: { icon: Check, labelAr: 'صح', tone: 'text-safe' },
  incorrect: { icon: X, labelAr: 'خطأ', tone: 'text-danger' },
}

/** Overrides for interactions where "right answer" is the wrong idea. */
export interface VerdictLabels {
  correct: string
  incorrect: string
}

interface ChoiceCardProps {
  /** Arabic label for the choice. */
  label: string
  /** Arabic caption revealed after the answer. */
  caption?: string
  state?: ChoiceState
  /** 1-based number-key hint shown to the presenter. */
  choiceKey?: number
  /** Replaces صح / خطأ where those words would misdescribe the verdict. */
  verdictLabels?: VerdictLabels
  onSelect?: () => void
  disabled?: boolean
  className?: string
}

export function ChoiceCard({
  label,
  caption,
  state = 'idle',
  choiceKey,
  verdictLabels,
  onSelect,
  disabled = false,
  className = '',
}: ChoiceCardProps) {
  const verdict = VERDICTS[state]
  const VerdictIcon = verdict?.icon
  const verdictLabel =
    state === 'correct'
      ? (verdictLabels?.correct ?? verdict?.labelAr)
      : state === 'incorrect'
        ? (verdictLabels?.incorrect ?? verdict?.labelAr)
        : verdict?.labelAr

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={state === 'selected'}
      className={`flex w-full min-h-16 items-center gap-4 rounded-card border p-5 text-start transition-colors duration-(--dur-fast) disabled:cursor-not-allowed ${STATES[state]} ${className}`}
    >
      {choiceKey !== undefined && (
        <kbd className="text-caption flex size-8 shrink-0 items-center justify-center rounded-lg border border-line bg-surface-2 text-muted latin">
          {choiceKey}
        </kbd>
      )}

      {/* Several choice lists are Latin — Password, OTP, Tutor, Quiz Partner —
          so the typeface is chosen per string rather than for the component. */}
      <span className="flex-1">
        <span
          lang={latinLang(label)}
          className={`text-lead font-medium ${latinClass(label)}`}
        >
          {label}
        </span>
        {caption && (
          <span
            lang={latinLang(caption)}
            className={`text-body mt-1 block text-soft ${latinClass(caption)}`}
          >
            {caption}
          </span>
        )}
      </span>

      {verdict && VerdictIcon && (
        <span className={`flex shrink-0 items-center gap-2 ${verdict.tone}`}>
          <VerdictIcon className="size-5" aria-hidden />
          <span className="text-caption font-semibold">{verdictLabel}</span>
        </span>
      )}
    </button>
  )
}
