import type { ReactNode } from 'react'

interface SectionTitleProps {
  /** Short Latin label above the title, e.g. the world name. */
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
        {children}
      </h2>

      {lead && (
        <p className="text-lead max-w-4xl text-pretty text-soft">{lead}</p>
      )}
    </header>
  )
}
