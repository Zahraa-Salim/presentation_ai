import { motion } from 'motion/react'
import { SectionTitle } from '@/components/ui'
import { AI_HISTORY } from '@/data/aiHistory'
import { isTodo } from '@/lib/todo'
import { REVEAL_PRESET } from '@/lib/transitions'
import type { SceneDef } from '@/types'

/**
 * Scene 4 — `AI مش جديد`.
 *
 * Earns its own component because the milestone labels have to sit in the DOM,
 * mirroring the 3D timeline behind them. Keeping them here rather than in
 * WebGL avoids Arabic shaping problems entirely and needs no 3D-to-screen
 * projection.
 *
 * Laid out as a flex row inside the RTL document, so the earliest milestone
 * lands on the right and time flows leftward — matching both the reading
 * direction and the geometry.
 */
export function HistoryScene({ scene }: { scene: SceneDef }) {
  return (
    <div className="flex h-full flex-col justify-center gap-14">
      <SectionTitle eyebrow={scene.id}>
        {scene.content.headline ?? scene.title}
      </SectionTitle>

      <ol className="flex flex-wrap items-start gap-x-4 gap-y-8">
        {AI_HISTORY.map((milestone, index) => (
          <motion.li
            key={milestone.id}
            initial={REVEAL_PRESET.initial}
            animate={REVEAL_PRESET.animate}
            transition={{
              duration: REVEAL_PRESET.durationSec,
              ease: REVEAL_PRESET.ease,
              delay: index * 0.08,
            }}
            className="flex min-w-40 flex-1 flex-col gap-2"
          >
            <span className="text-title font-bold text-accent tabular-nums latin">
              {milestone.year}
            </span>
            <span className="text-lead font-medium text-bright latin">
              {milestone.label}
            </span>
            <span
              className={`text-caption ${
                isTodo(milestone.captionAr) ? 'text-warning' : 'text-soft'
              }`}
            >
              {milestone.captionAr}
            </span>
          </motion.li>
        ))}
      </ol>

      {scene.content.note && (
        <p className="text-body text-muted">{scene.content.note}</p>
      )}
    </div>
  )
}
