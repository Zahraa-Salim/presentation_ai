import type { ReactNode } from 'react'
import { Card } from '@/components/ui/Card'
import { latinClass } from '@/lib/direction'

interface QuestionCardProps {
  /** The Arabic question put to the class. */
  question: string
  /** Optional Arabic hint shown under it. */
  hint?: string
  children?: ReactNode
  className?: string
}

/**
 * The question a classroom interaction opens with.
 *
 * Typographically loud on purpose: this is read aloud and answered from the
 * back of the room.
 */
export function QuestionCard({
  question,
  hint,
  children,
  className = '',
}: QuestionCardProps) {
  return (
    <Card surface="panel" className={`p-8 ${className}`}>
      <h3
        className={`text-title font-semibold text-balance text-bright ${latinClass(question)}`}
      >
        {question}
      </h3>

      {hint && (
        <p className={`text-body mt-3 text-muted ${latinClass(hint)}`}>{hint}</p>
      )}

      {children && <div className="mt-8">{children}</div>}
    </Card>
  )
}
