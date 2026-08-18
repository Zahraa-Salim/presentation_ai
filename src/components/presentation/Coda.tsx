import { motion } from 'motion/react'
import { Card } from '@/components/ui'
import { CORE_RULES } from '@/data/coreRules'
import { usePresentation } from '@/hooks/usePresentation'
import { latinLang, resolveTextDir } from '@/lib/direction'
import { REVEAL_PRESET } from '@/lib/transitions'

/** Arabic-Indic, matching the presenter panel's `مشهد ٨ · بيت ٣`. */
const ARABIC_DIGITS = ['١', '٢', '٣', '٤', '٥'] as const

/**
 * The closing recap — the deck's five core rules.
 *
 * They belong to no scene: the 33 already total exactly 2700s, so there is no
 * room for a 34th. Instead this sits between the careers scene and the closing
 * message, reached by pressing on. Scene 33 keeps the last word — a recap
 * belongs before the closing line, not after it.
 *
 * Because `sceneIndex` never moves, `ExperienceCanvas` carries on rendering
 * `FutureCityWorld` behind this. The canvas needed no change at all.
 *
 * One rule per press. The presenter voices each; five arriving at once is a
 * summary nobody reads at minute forty-three.
 */
export function Coda() {
  const { coda } = usePresentation()
  const revealedCount = coda ?? 0

  return (
    <div
      data-world="future"
      className="scene-frame items-center justify-center gap-7"
    >
      <header className="flex flex-col items-center gap-2 text-center">
        <h2 className="text-headline font-bold text-bright glow-text">
          القواعد الخمسة
        </h2>
        <p className="text-body text-muted">خمس قواعد تاخدها معك.</p>
      </header>

      <ol className="flex w-full max-w-4xl flex-col gap-3">
        {CORE_RULES.map((rule, index) => {
          const revealed = revealedCount > index

          return (
            <motion.li
              key={rule.id}
              initial={false}
              animate={revealed ? REVEAL_PRESET.animate : REVEAL_PRESET.initial}
              transition={{
                duration: REVEAL_PRESET.durationSec,
                ease: REVEAL_PRESET.ease,
              }}
              /* Kept in the layout while hidden so revealing never shifts the
                 list — the same contract RevealText holds for scenes. */
              aria-hidden={!revealed}
            >
              <Card
                surface="panel"
                className="flex items-baseline gap-4 px-5 py-4"
              >
                {/*
                  The number carries the ordering, not colour — the
                  never-colour-alone rule. Fixed width so the five titles form a
                  straight edge rather than stepping in and out.
                */}
                <span
                  aria-hidden
                  className="text-lead w-6 shrink-0 text-center font-semibold text-accent tabular-nums"
                >
                  {ARABIC_DIGITS[index]}
                </span>

                {/*
                  The block stays in the document's RTL, so every card aligns to
                  the same edge. Direction is isolated on an inline <bdi>
                  instead — put on the block, an English title aligns left while
                  the Arabic beside it aligns right, and the list reads as
                  ragged halves. Same pattern as SectionTitle.
                */}
                <div className="flex min-w-0 flex-col gap-1 text-start">
                  <p className="text-lead font-semibold text-bright">
                    <bdi dir="ltr" lang={latinLang(rule.title)} className="latin">
                      {rule.title}
                    </bdi>
                  </p>
                  <p className="text-body text-pretty text-soft">
                    <bdi
                      dir={resolveTextDir(rule.body)}
                      lang={latinLang(rule.body)}
                    >
                      {rule.body}
                    </bdi>
                  </p>
                </div>
              </Card>
            </motion.li>
          )
        })}
      </ol>
    </div>
  )
}
