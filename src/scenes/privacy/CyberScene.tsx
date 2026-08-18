import { createElement } from 'react'
import { motion } from 'motion/react'
import { getInteractionComponent } from '@/components/interactions/interactionRegistry'
import { RevealText, SectionTitle } from '@/components/ui'
import { INTERACTION_BY_ID } from '@/data/interactions'
import { getBeatLayout, getStepTiming } from '@/lib/beats'
import { latinLang } from '@/lib/direction'
import { REVEAL_PRESET } from '@/lib/transitions'
import { usePresentation } from '@/hooks/usePresentation'
import type { SceneDef } from '@/types'

/**
 * Scene 27 — `AI + Cybersecurity`.
 *
 * The only scene in the deck that carries a list *and* a two-option quiz *and*
 * a set of tells revealed afterwards. Stacked in one column by
 * `InteractiveScene` that came to roughly 1000px of content against a 780px
 * viewport at 1536×864: the messages ran off the bottom of the screen, which is
 * where the whole interaction lives.
 *
 * So the column becomes two. The five threats are single English terms, not
 * sentences — they belong in a wrapped row of chips beside the question rather
 * than as five full-width lines above it. Nothing about the content, the order
 * or the beats changes; only what sits next to what.
 *
 * Below `lg` it falls back to one column, because a narrow screen has the
 * height a wide one lacks.
 */
export function CyberScene({ scene }: { scene: SceneDef }) {
  const { beat } = usePresentation()

  const interaction = scene.interaction
    ? INTERACTION_BY_ID[scene.interaction]
    : undefined
  const Interaction = scene.interaction
    ? getInteractionComponent(scene.interaction)
    : undefined

  const layout = getBeatLayout(scene)
  const { headline, subheadline, steps, keyMessage } = scene.content

  return (
    <div className="grid h-full grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-12">
      <div className="flex flex-col gap-6">
        <SectionTitle lead={subheadline}>
          {headline ?? scene.title}
        </SectionTitle>

        {/*
          The five threats the deck lists, verbatim and in order. As chips they
          read as a set of named things — which is what they are — instead of as
          five statements competing with the question beside them.
        */}
        {steps && steps.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {steps.map((step, index) => {
              const { revealed, delaySec } = getStepTiming(scene, beat, index)

              return (
                <motion.li
                  key={step.id}
                  initial={false}
                  animate={
                    revealed ? REVEAL_PRESET.animate : REVEAL_PRESET.initial
                  }
                  transition={{
                    duration: REVEAL_PRESET.durationSec,
                    ease: REVEAL_PRESET.ease,
                    delay: revealed ? delaySec : 0,
                  }}
                  aria-hidden={!revealed}
                  className="text-body rounded-pill border border-line bg-surface px-4 py-1.5 text-soft [text-shadow:none]"
                >
                  <bdi dir="ltr" lang={latinLang(step.text)} className="latin">
                    {step.text}
                  </bdi>
                </motion.li>
              )
            })}
          </ul>
        )}

        {/* The takeaway the interaction exists to produce, so it lands on the
            final beat — after the class has answered, not while they decide. */}
        {keyMessage && layout.keyMessageBeat !== null && (
          <RevealText step={layout.keyMessageBeat} emphasis="strong">
            {keyMessage}
          </RevealText>
        )}
      </div>

      {/* Its own scroll container rather than the page's: on a short screen the
          two long messages must stay reachable, and a presentation must never
          scroll as a whole. */}
      <div className="max-h-full min-h-0 overflow-y-auto overscroll-contain">
        {interaction && Interaction ? (
          createElement(Interaction, { scene, interaction })
        ) : (
          <p className="text-lead text-warning">
            ⟦ interaction “{scene.interaction}” — لسا ما انبنت ⟧
          </p>
        )}
      </div>
    </div>
  )
}
