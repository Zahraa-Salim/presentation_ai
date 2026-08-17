import type { ReactNode } from 'react'
import { latinLang, resolveTextDir } from '@/lib/direction'

/* Only a plain string can be inspected; anything richer keeps the document's
   direction and language, which is the safe default. */
const dirOf = (node: ReactNode) =>
  typeof node === 'string' ? resolveTextDir(node) : undefined

const langOf = (node: ReactNode) =>
  typeof node === 'string' ? latinLang(node) : undefined

interface SectionTitleProps {
  /**
   * Short Latin label above the title, e.g. the world name. Scene renderers
   * deliberately leave it unset — the chrome already names the world, and a
   * second label competes with the headline it sits above.
   */
  eyebrow?: string
  children: ReactNode
  /** One supporting line. Deliberately not a paragraph. */
  lead?: ReactNode
  align?: 'start' | 'center'
  className?: string
}

/**
 * The headline for a presentation moment.
 *
 * One screen communicates one primary idea, so this takes a single title and at
 * most one supporting line — there is no slot for body copy.
 *
 * Title and lead render inside a direction-isolated `<bdi>` whose direction
 * comes from `resolveTextDir` — see src/lib/direction.ts for why the built-in
 * auto-detection is the wrong tool here. Fixed in the rendering path rather
 * than in the copy, so the deck's strings are preserved exactly and every scene
 * is covered rather than only the one that happened to be noticed.
 */
export function SectionTitle({
  eyebrow,
  children,
  lead,
  align = 'start',
  className = '',
}: SectionTitleProps) {
  return (
    <header
      className={`flex flex-col gap-4 ${
        align === 'center' ? 'items-center text-center' : 'items-start'
      } ${className}`}
    >
      {eyebrow && (
        <span className="text-caption tracking-[0.3em] text-muted latin">
          {eyebrow}
        </span>
      )}

      <h2 className="text-headline font-bold text-balance text-bright">
        <bdi dir={dirOf(children)} lang={langOf(children)}>
          {children}
        </bdi>
      </h2>

      {lead && (
        <p className="text-lead max-w-4xl text-pretty text-soft">
          <bdi dir={dirOf(lead)} lang={langOf(lead)}>
            {lead}
          </bdi>
        </p>
      )}
    </header>
  )
}
