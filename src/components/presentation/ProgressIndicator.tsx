import { usePresentation } from '@/hooks/usePresentation'
import { getSegmentFill, getWorldSegments } from '@/lib/progress'

// Derived once from the scene registry — it never changes at runtime.
const SEGMENTS = getWorldSegments()

/**
 * World label, scene counter and the segmented progress bar.
 *
 * The bar is a flex row inside the RTL document, so World 1 sits on the right
 * and the deck reads right to left with no reversing logic. Each fill is
 * pinned to inset-inline-start, which under RTL grows from the right edge
 * leftward.
 */
export function ProgressIndicator() {
  const { world, sceneNumber, totalScenes } = usePresentation()
  const sceneIndex = sceneNumber - 1

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <span className="text-caption tracking-[0.3em] text-muted latin">
          {world.label}
        </span>
        {/*
          Explicit LTR: in an RTL context a number-slash-number run can render
          reversed, turning "12 / 33" into "33 / 12".
        */}
        <span
          dir="ltr"
          className="text-caption font-semibold text-soft tabular-nums latin"
        >
          {sceneNumber} / {totalScenes}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        {SEGMENTS.map((segment) => {
          const fill = getSegmentFill(segment, sceneIndex)
          const isCurrent = segment.world.id === world.id

          return (
            <div
              key={segment.world.id}
              /* Re-points --color-accent to this world's ramp. */
              data-world={segment.world.id}
              title={segment.world.nameAr}
              style={{ flexGrow: segment.weight }}
              className="relative h-1 rounded-pill bg-surface-2"
            >
              <div
                style={{ width: `${fill * 100}%` }}
                className="absolute inset-y-0 start-0 rounded-pill bg-accent transition-[width] duration-(--dur-base) ease-(--ease-out-expo)"
              />

              {isCurrent && (
                <span
                  aria-hidden
                  style={{ insetInlineStart: `calc(${fill * 100}% - 5px)` }}
                  className="absolute top-1/2 size-2.5 -translate-y-1/2 rounded-pill bg-accent glow-sm transition-[inset-inline-start] duration-(--dur-base) ease-(--ease-out-expo)"
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
