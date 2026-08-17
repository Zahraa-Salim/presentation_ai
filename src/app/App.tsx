import { Suspense, lazy, useCallback, useEffect, useState } from 'react'
import { MotionConfig } from 'motion/react'
import { NavigationSurface } from '@/components/presentation/NavigationSurface'
import { PresentationChrome } from '@/components/presentation/PresentationChrome'
import { PresentationProvider } from '@/components/presentation/PresentationProvider'
import { PresenterClockTracker } from '@/components/presentation/PresenterClockTracker'
import { PresenterOverlay } from '@/components/presentation/PresenterOverlay'
import { SceneTransition } from '@/components/presentation/SceneTransition'
import { ComponentGallery } from '@/components/ui/ComponentGallery'
import { NovaSpeech } from '@/components/ui'
import { SceneRenderer } from '@/scenes/SceneRenderer'
import { NOVA_EMOTIONS } from '@/types'
import { SCENES } from '@/data/scenes'
import { usePresentation, usePresentationActions } from '@/hooks/usePresentation'
import { useFullscreen, type FullscreenApi } from '@/hooks/useFullscreen'
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation'
import { KEY_BINDINGS, isTypingTarget } from '@/lib/keymap'
import { startPresenterSessionIfIdle } from '@/lib/presenterSession'
import { getStatementPhase } from '@/lib/transitions'
import type { NavIntent, NovaEmotion } from '@/types'

// Lazy so the three.js chunk never blocks first paint.
const ExperienceCanvas = lazy(() =>
  import('@/components/three/ExperienceCanvas').then((m) => ({
    default: m.ExperienceCanvas,
  })),
)

/*
  Which intents start the presenter clock. Deliberately excludes `presenter`,
  `fullscreen` and `escape`: opening the panel to check a note before the class
  begins must not start timing the lesson.
*/
const NAVIGATION_INTENTS = new Set<NavIntent>([
  'next',
  'prev',
  'nextScene',
  'prevScene',
  'first',
  'last',
])

/** The part that actually transitions. Replaced by real scenes later. */
function SceneCard() {
  const {
    scene,
    world,
    sceneNumber,
    beat,
    beatCount,
    sceneProgress,
    direction,
  } = usePresentation()

  const statementPhase = getStatementPhase(scene, beat)

  return (
    <section
      className={`size-full rounded-panel border p-8 transition-colors duration-(--dur-base) ${
        statementPhase === 'sentence'
          ? 'border-line-soft bg-void'
          : 'border-line bg-surface/60'
      }`}
    >
      <h1 className="text-headline font-bold text-bright">{scene.title}</h1>

      {statementPhase && (
        <p className="text-caption mt-3 text-accent latin">
          statement phase: {statementPhase}
          {statementPhase === 'sentence' && ' — press → to reveal'}
        </p>
      )}

      <dl className="mt-6 grid grid-cols-2 gap-x-10 gap-y-3 text-body md:grid-cols-3">
        {[
          ['id', scene.id],
          ['world', world.nameAr],
          ['type', scene.type],
          ['transition', scene.transition],
          ['scene3d', scene.scene3d],
          ['interaction', scene.interaction ?? '—'],
          ['beat', `${beat} / ${beatCount - 1}`],
          ['sceneProgress', `${Math.round(sceneProgress * 100)}%`],
          ['direction', direction === 1 ? 'forward' : 'backward'],
          ['duration', `${scene.durationSec}s`],
          ['hash', `#/scene/${sceneNumber}`],
        ].map(([label, value]) => (
          <div key={label}>
            <dt className="text-caption text-muted latin">{label}</dt>
            <dd className="text-soft latin">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

/**
 * TEMPORARY dev harness.
 *
 * Replaced by <PresentationEngine> and deleted once real scenes land.
 */
/** TEMPORARY. Drives NOVA through all 12 states for review. */
function NovaLab({
  emotion,
  onEmotion,
}: {
  emotion: NovaEmotion
  onEmotion: (emotion: NovaEmotion) => void
}) {
  return (
    <section data-no-advance className="flex flex-col gap-4">
      <div className="flex items-baseline gap-4">
        <span className="text-caption tracking-[0.3em] text-muted latin">
          NOVA
        </span>
        <span className="text-title font-semibold text-accent latin">
          {emotion}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {NOVA_EMOTIONS.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => onEmotion(name)}
            className={`rounded-pill border px-5 py-2.5 text-body latin transition-colors ${
              name === emotion
                ? 'border-accent bg-accent text-void'
                : 'border-line bg-surface text-muted hover:border-accent'
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      <NovaSpeech className="mt-2">
        أنا موجود لأساعدك — مش لأفكّر بدالك.
      </NovaSpeech>
    </section>
  )
}

function DevHarness({
  lastIntent,
  novaEmotion,
  onNovaEmotion,
}: {
  lastIntent: NavIntent | null
  novaEmotion: NovaEmotion
  onNovaEmotion: (emotion: NovaEmotion) => void
}) {
  const {
    world,
    sceneNumber,
    totalScenes,
    isFirstScene,
    isLastScene,
    canGoNext,
    canGoPrev,
  } = usePresentation()

  const { next, prev, nextScene, prevScene, jumpToScene, first, last } =
    usePresentationActions()

  return (
    <main
      data-world={world.id}
      className="scene-frame gap-8 overflow-y-auto pt-10 pb-44"
    >
      <header className="flex items-baseline justify-between border-b border-line pb-4">
        <span className="text-caption tracking-[0.3em] text-muted latin">
          {world.label}
        </span>
        <span className="text-title font-semibold text-bright latin">
          {sceneNumber} / {totalScenes}
        </span>
      </header>

      {/* The transitioning region — everything below it stays put. */}
      <div className="h-[420px] shrink-0">
        <SceneTransition>
          <SceneRenderer />
        </SceneTransition>
      </div>

      <details className="rounded-card border border-line bg-surface/40 p-4">
        <summary className="text-caption cursor-pointer text-muted latin">
          debug: scene data
        </summary>
        <div className="mt-4">
          <SceneCard />
        </div>
      </details>

      <section className="flex flex-wrap gap-3">
        <HarnessButton onClick={prev} disabled={!canGoPrev}>
          ⟶ السابق (beat)
        </HarnessButton>
        <HarnessButton onClick={next} disabled={!canGoNext} primary>
          التالي (beat) ⟵
        </HarnessButton>
        <HarnessButton onClick={prevScene} disabled={isFirstScene}>
          مشهد سابق
        </HarnessButton>
        <HarnessButton onClick={nextScene} disabled={isLastScene}>
          مشهد تالي
        </HarnessButton>
        <HarnessButton onClick={first}>الأول</HarnessButton>
        <HarnessButton onClick={last}>الأخير</HarnessButton>
      </section>

      <section
        data-no-advance
        className="rounded-card border border-line bg-surface/40 p-6"
      >
        <div className="flex items-baseline gap-4">
          <span className="text-caption text-muted">آخر أمر:</span>
          <span className="text-title font-semibold text-accent latin">
            {lastIntent ?? '—'}
          </span>
        </div>

        <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-caption text-muted">
          {KEY_BINDINGS.map((binding) => (
            <li key={binding.intent}>
              <kbd className="rounded border border-line bg-surface-2 px-2 py-0.5 text-text latin">
                {binding.keys[0] === ' ' ? 'Space' : binding.keys[0]}
              </kbd>
              <span className="ms-2">{binding.labelAr}</span>
            </li>
          ))}
        </ul>
      </section>

      <NovaLab emotion={novaEmotion} onEmotion={onNovaEmotion} />

      <ComponentGallery />

      <section>
        <p className="text-caption mb-3 text-muted">قفز إلى مشهد:</p>
        <div className="flex flex-wrap gap-1.5">
          {SCENES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              data-world={s.world}
              onClick={() => jumpToScene(i)}
              title={s.title}
              className={`size-9 rounded-lg border text-caption latin transition-colors ${
                i === sceneNumber - 1
                  ? 'border-accent bg-accent text-void'
                  : 'border-line bg-surface text-muted hover:border-accent'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </section>
    </main>
  )
}

function HarnessButton({
  onClick,
  disabled,
  primary,
  children,
}: {
  onClick: () => void
  disabled?: boolean
  primary?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-pill border px-6 py-3 text-body transition-colors disabled:cursor-not-allowed disabled:opacity-35 ${
        primary
          ? 'border-accent bg-accent text-void'
          : 'border-line bg-surface text-text hover:border-accent'
      }`}
    >
      {children}
    </button>
  )
}

/**
 * The presentation itself: the scene fills the screen and nothing else is on it.
 *
 * This is what the product actually is. The dev harness is the exception, not
 * the default.
 */
function PresentationStage() {
  return (
    // Explicitly above the canvas. This used to rely on DOM order alone, which
    // works until someone reorders AppInner's children.
    <div className="absolute inset-0 z-[var(--z-scene)]">
      <SceneTransition>
        <SceneRenderer />
      </SceneTransition>
    </div>
  )
}

/**
 * Lives inside PresentationProvider so it can own keyboard navigation for both
 * views — the harness used to own it, which meant hiding the harness would have
 * killed the keyboard.
 */
function AppInner({ fullscreen }: { fullscreen: FullscreenApi }) {
  const [lastIntent, setLastIntent] = useState<NavIntent | null>(null)
  const [novaEmotion, setNovaEmotion] = useState<NovaEmotion>('idle')
  const [showHarness, setShowHarness] = useState(false)
  const [showPresenter, setShowPresenter] = useState(false)

  /*
    The presenter clock starts on the first *navigation*, not on load and not
    on `P` — see src/lib/presenterSession.ts. This is the one choke point every
    navigation passes through, keyboard and pointer alike.
  */
  const onIntent = useCallback((intent: NavIntent) => {
    if (NAVIGATION_INTENTS.has(intent)) startPresenterSessionIfIdle()
    setLastIntent(intent)
  }, [])

  useKeyboardNavigation({
    onIntent,
    onEscape: () => {
      setLastIntent('escape')
      // Escape dismisses the panel first. The intent's eventual job — resetting
      // an interaction — sits behind this check when it is implemented.
      setShowPresenter(false)
    },
    onPresenter: () => {
      setLastIntent('presenter')
      setShowPresenter((open) => !open)
    },
    onFullscreen: () => {
      setLastIntent('fullscreen')
      fullscreen.toggle()
    },
  })

  /*
    `D` toggles the harness. Handled here rather than in src/lib/keymap.ts on
    purpose: the harness is temporary scaffolding and should not appear in the
    product key map or a future help overlay.

    DEV only — the hint below was already gated, but the handler was not, so a
    stray `D` during a lesson opened a debug page on the projector.
  */
  useEffect(() => {
    if (!import.meta.env.DEV) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== 'd') return
      if (event.repeat || event.ctrlKey || event.altKey || event.metaKey) return
      if (isTypingTarget(event.target)) return
      setShowHarness((visible) => !visible)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <>
      <Suspense fallback={null}>
        <ExperienceCanvas
          demoEmotion={showHarness ? novaEmotion : undefined}
        />
      </Suspense>

      <PresenterClockTracker />

      <NavigationSurface onIntent={onIntent}>
        {showHarness ? (
          <DevHarness
            lastIntent={lastIntent}
            novaEmotion={novaEmotion}
            onNovaEmotion={setNovaEmotion}
          />
        ) : (
          <PresentationStage />
        )}

        <PresentationChrome fullscreen={fullscreen} />
      </NavigationSurface>

      {showPresenter && <PresenterOverlay />}

      {import.meta.env.DEV && (
        <p className="text-caption fixed bottom-3 start-4 z-[var(--z-presenter)] text-muted/50 latin">
          D · {showHarness ? 'presentation' : 'debug'}
        </p>
      )}
    </>
  )
}

export default function App() {
  const fullscreen = useFullscreen()

  return (
    <MotionConfig reducedMotion="user">
      <PresentationProvider>
        <AppInner fullscreen={fullscreen} />
      </PresentationProvider>
    </MotionConfig>
  )
}
