import type { HTMLAttributes, ReactNode } from 'react'

export type CardSurface = 'panel' | 'glass' | 'outline'

/**
 * `panel` is the house style: an opaque surface that stays legible over the
 * moving 3D world behind it, with no backdrop-blur to pay for on weak GPUs.
 * `glass` is the light frosted variant (this is where GlassCard lives — one
 * component with three surfaces beats two that drift apart).
 */
const SURFACES: Record<CardSurface, string> = {
  panel: 'border-line bg-surface shadow-card',
  glass: 'border-line/70 bg-surface/55 backdrop-blur-sm',
  outline: 'border-line bg-transparent',
}

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  surface?: CardSurface
  /** Adds the accent border and a subtle glow. Used sparingly — one at a time. */
  active?: boolean
  children: ReactNode
}

export function Card({
  surface = 'panel',
  active = false,
  className = '',
  children,
  ...rest
}: CardProps) {
  return (
    <div
      className={`rounded-card border p-6 transition-colors duration-(--dur-fast) ${
        SURFACES[surface]
      } ${active ? 'border-accent glow-sm' : ''} ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}
