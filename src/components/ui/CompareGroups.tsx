import { motion } from 'motion/react'
import { Check, Circle, X } from 'lucide-react'
import { usePresentation } from '@/hooks/usePresentation'
import { latinClass, latinLang } from '@/lib/direction'
import { REVEAL_PRESET } from '@/lib/transitions'
import type { ContentGroup, GroupTone } from '@/types'

/**
 * Two or three labelled columns compared side by side.
 *
 * The deck argues by comparison throughout — weak vs strong prompt, avoid vs
 * try, what AI helps you do vs what it does instead of you. Columns reveal one
 * beat at a time, because showing both halves at once leaves the class nothing
 * to think about in between.
 *
 * Tone tints the column, but the Arabic label always states the meaning and an
 * icon repeats it: a washed-out projector must not be able to turn "never
 * share" into "safe to share".
 */

const TONES: Record<GroupTone, string> = {
  positive: 'border-safe/50 bg-safe/5',
  negative: 'border-danger/50 bg-danger/5',
  neutral: 'border-line bg-surface',
}

const LABEL_TONES: Record<GroupTone, string> = {
  positive: 'text-safe',
  negative: 'text-danger',
  neutral: 'text-soft',
}

const ICONS: Record<GroupTone, typeof Check> = {
  positive: Check,
  negative: X,
  neutral: Circle,
}

interface CompareGroupsProps {
  groups: readonly ContentGroup[]
  /** Beat at which the first column appears; each later column follows one beat on. */
  startBeat: number
  className?: string
}

export function CompareGroups({
  groups,
  startBeat,
  className = '',
}: CompareGroupsProps) {
  const { beat } = usePresentation()

  return (
    <div
      className={`grid gap-5 ${groups.length > 2 ? 'md:grid-cols-3' : 'md:grid-cols-2'} ${className}`}
    >
      {groups.map((group, index) => {
        const revealed = beat >= startBeat + index
        const tone = group.tone ?? 'neutral'
        const Icon = ICONS[tone]

        return (
          <motion.div
            key={group.id}
            initial={false}
            animate={revealed ? REVEAL_PRESET.animate : REVEAL_PRESET.initial}
            transition={{
              duration: REVEAL_PRESET.durationSec,
              ease: REVEAL_PRESET.ease,
            }}
            // Kept in the layout while hidden so revealing never shifts the page.
            aria-hidden={!revealed}
            className={`rounded-card border p-6 ${TONES[tone]} ${
              revealed ? '' : 'pointer-events-none'
            }`}
          >
            <p
              className={`text-lead mb-4 flex items-center gap-2 font-semibold ${LABEL_TONES[tone]}`}
            >
              <Icon className="size-5 shrink-0" aria-hidden />
              <span className={latinClass(group.label)} lang={latinLang(group.label)}>
                {group.label}
              </span>
            </p>

            {/* Tool names and category words are Latin; the lists they sit in
                are Arabic. Applied per item so each gets the right metrics —
                and the right screen-reader voice. */}
            <ul className="flex flex-col gap-3">
              {group.items.map((item) => (
                <li
                  key={item}
                  lang={latinLang(item)}
                  className={`text-body text-soft ${latinClass(item)}`}
                >
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        )
      })}
    </div>
  )
}
