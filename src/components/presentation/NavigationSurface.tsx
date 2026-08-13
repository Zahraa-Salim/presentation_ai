import type { ReactNode } from 'react'
import { usePresentationActions } from '@/hooks/usePresentation'
import { usePointerNavigation } from '@/hooks/usePointerNavigation'
import type { NavIntent } from '@/types'

interface NavigationSurfaceProps {
  children: ReactNode
  enabled?: boolean
  onIntent?: (intent: NavIntent) => void
}

/**
 * Wraps the presentation and turns mouse and touch input into navigation.
 *
 * Clicking anywhere that is not interactive advances a beat. A narrow strip on
 * the inline-start edge — the right side under RTL, where the presenter came
 * from — steps back.
 */
export function NavigationSurface({
  children,
  enabled = true,
  onIntent,
}: NavigationSurfaceProps) {
  const pointer = usePointerNavigation({ enabled, onIntent })
  const actions = usePresentationActions()

  return (
    <div className="relative size-full" {...pointer}>
      {children}

      <button
        type="button"
        data-no-advance
        aria-label="المشهد السابق"
        disabled={!enabled}
        onClick={() => {
          onIntent?.('prev')
          actions.prev()
        }}
        /*
         * Inset from the top and bottom so it never sits over the progress
         * indicator or presenter chrome that lands in Task 05.
         * Invisible to the audience; a faint tint on hover for the presenter.
         */
        className="absolute inset-y-[15%] start-0 z-20 w-[7%] cursor-w-resize rounded-e-panel bg-transparent transition-colors hover:bg-accent/5"
      />
    </div>
  )
}
