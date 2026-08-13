import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'
export type ButtonSize = 'md' | 'lg'

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'border-accent bg-accent text-void hover:brightness-110',
  secondary:
    'border-line bg-surface text-text hover:border-accent hover:bg-surface-2',
  ghost: 'border-transparent bg-transparent text-soft hover:text-text',
}

// Sized for a live presentation: every target clears 48px, so it can be hit
// while standing at a projector.
const SIZES: Record<ButtonSize, string> = {
  md: 'min-h-12 px-6 py-3 text-body',
  lg: 'min-h-16 px-9 py-4 text-lead',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  children: ReactNode
}

export function Button({
  variant = 'secondary',
  size = 'md',
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-3 rounded-pill border font-medium transition-colors duration-(--dur-fast) disabled:cursor-not-allowed disabled:opacity-35 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
