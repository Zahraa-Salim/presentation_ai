import { Maximize, Minimize } from 'lucide-react'
import { ProgressIndicator } from '@/components/presentation/ProgressIndicator'
import { useAutoHideChrome } from '@/hooks/useAutoHideChrome'
import { usePresentation } from '@/hooks/usePresentation'
import type { FullscreenApi } from '@/hooks/useFullscreen'

interface PresentationChromeProps {
  fullscreen: FullscreenApi
}

/**
 * The minimal presenter chrome: progress and a fullscreen toggle.
 *
 * Auto-hides after a few idle seconds so statement moments and the finale get
 * a clean screen. Marked data-no-advance, which the pointer guard in
 * usePointerNavigation already honours — clicking it never advances a beat.
 */
export function PresentationChrome({ fullscreen }: PresentationChromeProps) {
  const { sceneNumber, beat } = usePresentation()
  const visible = useAutoHideChrome(`${sceneNumber}:${beat}`)

  return (
    <div
      data-no-advance
      className={`fixed inset-x-0 bottom-0 z-[var(--z-ui)] px-[clamp(2rem,5vw,5rem)] pb-[clamp(1.25rem,3vh,2.5rem)] transition-opacity duration-(--dur-base) focus-within:opacity-100 ${
        visible ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      <div className="flex items-end gap-6">
        <div className="flex-1">
          <ProgressIndicator />
        </div>

        {fullscreen.isSupported && (
          <button
            type="button"
            onClick={fullscreen.toggle}
            aria-label={
              fullscreen.isFullscreen ? 'إنهاء ملء الشاشة' : 'ملء الشاشة'
            }
            title={fullscreen.isFullscreen ? 'إنهاء ملء الشاشة (F)' : 'ملء الشاشة (F)'}
            className="rounded-pill border border-line bg-surface/70 p-3 text-muted transition-colors hover:border-accent hover:text-text"
          >
            {fullscreen.isFullscreen ? (
              <Minimize className="size-5" />
            ) : (
              <Maximize className="size-5" />
            )}
          </button>
        )}
      </div>
    </div>
  )
}
