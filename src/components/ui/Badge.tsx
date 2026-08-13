import type { ReactNode } from 'react'

export type BadgeTone = 'neutral' | 'accent' | 'safe' | 'danger' | 'warning'

const TONES: Record<BadgeTone, string> = {
  neutral: 'border-line bg-surface-2 text-soft',
  accent: 'border-accent/50 bg-accent/10 text-accent',
  safe: 'border-safe/50 bg-safe/10 text-safe',
  danger: 'border-danger/50 bg-danger/10 text-danger',
  warning: 'border-warning/50 bg-warning/10 text-warning',
}

interface BadgeProps {
  tone?: BadgeTone
  /** Paired with the tone so meaning never rests on colour alone. */
  icon?: ReactNode
  children: ReactNode
  className?: string
}

export function Badge({
  tone = 'neutral',
  icon,
  children,
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`text-caption inline-flex items-center gap-2 rounded-pill border px-4 py-1.5 font-medium ${TONES[tone]} ${className}`}
    >
      {icon}
      {children}
    </span>
  )
}
