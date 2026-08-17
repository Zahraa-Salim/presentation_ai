import { ArrowDown, ArrowUp, Check, RotateCcw } from 'lucide-react'
import { Badge } from '@/components/ui'
import { SCENES, SCENE_TYPE_LABELS_AR } from '@/data/scenes'
import { usePresentation } from '@/hooks/usePresentation'
import { usePresenterClock } from '@/hooks/usePresenterClock'
import { FORWARD_ARROW } from '@/lib/direction'
import {
  TOTAL_BUDGET_SEC,
  formatClock,
  getPacing,
  type PacingStatus,
} from '@/lib/presenterPacing'
import { resetPresenterSession } from '@/lib/presenterSession'
import { isTodo } from '@/lib/todo'
import type { BadgeTone } from '@/components/ui'

/**
 * The presenter panel — `P` toggles it.
 *
 * Deliberately non-modal: no focus trap, and the keyboard is NOT suspended
 * while it is open. The presenter reads notes *while* advancing; taking the
 * arrow keys away because the notes are up would be a disaster mid-lesson.
 *
 * This sits on the same screen the class is watching, so it is small, quiet and
 * meant to be opened, read and closed again.
 *
 * The decomposition below is load-bearing, not cosmetic. PresenterTimer owns
 * the once-a-second tick; Notes and NextScene are its SIBLINGS, so a tick never
 * re-renders them and no memoisation is needed anywhere.
 */

const PACING: Record<PacingStatus, { label: string; tone: BadgeTone }> = {
  ahead: { label: 'متقدّم', tone: 'safe' },
  onTrack: { label: 'على الوقت', tone: 'neutral' },
  behind: { label: 'متأخّر', tone: 'warning' },
}

const PACING_ICONS: Record<PacingStatus, typeof Check> = {
  ahead: ArrowDown,
  onTrack: Check,
  behind: ArrowUp,
}

interface PresenterTimerProps {
  sceneIndex: number
  sceneNumber: number
  beat: number
  beatCount: number
}

function PresenterTimer({
  sceneIndex,
  sceneNumber,
  beat,
  beatCount,
}: PresenterTimerProps) {
  const { isRunning, elapsedSec, sceneElapsedSec } = usePresenterClock(true)
  const pacing = getPacing({ elapsedSec, sceneIndex, sceneElapsedSec })
  const { label, tone } = PACING[pacing.status]
  const Icon = PACING_ICONS[pacing.status]

  return (
    <div className="flex flex-col gap-3 border-b border-line px-6 py-4">
      {/*
        Under RTL the first child lands at the visual right. Scene and beat sit
        there; the clock reads at the inline end.
        aria-live is off explicitly — a region announcing every second would
        flood a screen reader.
      */}
      <div className="flex items-center justify-between gap-4" aria-live="off">
        <span className="text-caption text-soft">
          مشهد{' '}
          <span dir="ltr" className="font-semibold tabular-nums latin">
            {sceneNumber}
          </span>{' '}
          · بيت{' '}
          <span dir="ltr" className="font-semibold tabular-nums latin">
            {beat + 1}/{beatCount}
          </span>
        </span>

        {isRunning ? (
          <Badge tone={tone} icon={<Icon className="size-4" aria-hidden />}>
            {label}{' '}
            <span dir="ltr" className="tabular-nums latin">
              {formatClock(pacing.driftSec)}
            </span>
          </Badge>
        ) : (
          <Badge tone="neutral">لم تبدأ بعد</Badge>
        )}

        <span
          dir="ltr"
          className="text-lead font-semibold text-bright tabular-nums latin"
        >
          {formatClock(elapsedSec)} / {formatClock(TOTAL_BUDGET_SEC)}
        </span>

        <button
          type="button"
          // Blur is not optional: focus would stay here and the next Enter
          // would re-fire the reset mid-talk. Enter is unbound, so nothing
          // else prevents it.
          onClick={(event) => {
            resetPresenterSession()
            event.currentTarget.blur()
          }}
          aria-label="إعادة ضبط مؤقّت العرض"
          title="إعادة ضبط المؤقّت"
          className="rounded-pill border border-line p-2 text-muted transition-colors duration-(--dur-fast) hover:text-bright"
        >
          <RotateCcw className="size-4" aria-hidden />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-caption shrink-0 text-muted">
          المشهد{' '}
          <span dir="ltr" className="tabular-nums latin">
            {formatClock(sceneElapsedSec)} /{' '}
            {formatClock(pacing.sceneDurationSec)}
          </span>
        </span>

        <div className="h-1 w-full overflow-hidden rounded-pill bg-surface-2">
          <div
            aria-hidden
            className={`h-full rounded-pill ${
              pacing.sceneOverrun ? 'bg-danger' : 'bg-accent'
            }`}
            style={{ inlineSize: `${pacing.sceneBudgetUsed * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}

function PresenterNotes({ notes }: { notes: readonly string[] }) {
  return (
    <div className="max-h-[30vh] overflow-y-auto overscroll-contain px-6 py-4">
      {notes.length === 0 ? (
        <p className="text-caption text-muted">لا توجد ملاحظات لهذا المشهد.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {notes.map((note) => (
            <li
              key={note}
              className={`text-body ${isTodo(note) ? 'text-warning' : 'text-soft'}`}
            >
              {note}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

interface PresenterNextSceneProps {
  sceneNumber: number
  title: string
  typeLabel: string
  durationSec: number
}

function PresenterNextScene({
  sceneNumber,
  title,
  typeLabel,
  durationSec,
}: PresenterNextSceneProps) {
  return (
    <div className="border-t border-line px-6 py-3">
      {/* The arrow points LEFT because left is forward under RTL — see
          FORWARD_ARROW. Not a typo, and not to be "corrected". */}
      <p className="text-caption text-muted">
        التالي {FORWARD_ARROW}{' '}
        <span dir="ltr" className="tabular-nums latin">
          {sceneNumber}
        </span>{' '}
        · <span className="text-soft">{title}</span> · {typeLabel} ·{' '}
        <span dir="ltr" className="tabular-nums latin">
          {formatClock(durationSec)}
        </span>
      </p>
    </div>
  )
}

export function PresenterOverlay() {
  const { scene, sceneNumber, beat, beatCount, isLastScene } = usePresentation()
  const next = isLastScene ? null : SCENES[sceneNumber]

  return (
    <aside
      // Outside NavigationSurface, so click-to-advance cannot reach it at all;
      // data-no-advance survives anyone relocating it.
      data-no-advance
      role="region"
      aria-label="لوحة المقدّم"
      className="fixed bottom-[clamp(4.5rem,11vh,7.5rem)] start-0 end-0 z-[var(--z-presenter)] mx-auto w-[min(46rem,calc(100vw-4rem))] rounded-panel border border-line bg-surface/95 shadow-panel"
    >
      <PresenterTimer
        sceneIndex={sceneNumber - 1}
        sceneNumber={sceneNumber}
        beat={beat}
        beatCount={beatCount}
      />

      <PresenterNotes notes={scene.speakerNotes} />

      {next && (
        <PresenterNextScene
          sceneNumber={next.index}
          title={next.title}
          typeLabel={SCENE_TYPE_LABELS_AR[next.type]}
          durationSec={next.durationSec}
        />
      )}
    </aside>
  )
}
