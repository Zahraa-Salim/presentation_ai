import { useReducedMotion as useMotionReducedMotion } from 'motion/react'

/**
 * One source of truth for reduced motion, shared by DOM transitions now and
 * the 3D systems in Phase 3 — where it will also cut camera movement and
 * particle counts, not just CSS transforms.
 *
 * Wraps Motion's hook rather than re-implementing the media query so the
 * behaviour matches what <MotionConfig reducedMotion="user"> already does.
 */
export function useReducedMotion(): boolean {
  return useMotionReducedMotion() ?? false
}
