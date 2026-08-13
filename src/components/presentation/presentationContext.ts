import { createContext } from 'react'
import type { PresentationActions, PresentationState } from '@/types'

/**
 * State and actions are two separate contexts on purpose.
 *
 * State changes on every beat. Actions never change. Components that only
 * dispatch — navigation controls, 3D camera rigs — subscribe to actions alone
 * and stay out of the per-beat render pass. This matters once the persistent
 * <Canvas> lands in Phase 3.
 *
 * Kept in their own module so the provider file exports only a component and
 * Fast Refresh keeps working.
 */
export const PresentationStateContext = createContext<PresentationState | null>(
  null,
)

export const PresentationActionsContext =
  createContext<PresentationActions | null>(null)
