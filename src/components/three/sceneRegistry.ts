import type { ComponentType } from 'react'
import { PlaceholderScene } from '@/components/three/PlaceholderScene'
import { AiHistoryWorld } from '@/components/three/worlds/AiHistoryWorld'
import { AiMindWorld } from '@/components/three/worlds/AiMindWorld'
import { OpeningWorld } from '@/components/three/worlds/OpeningWorld'
import { SCENE_3D_IDS } from '@/types'
import type { QualitySettings, Scene3DId } from '@/types'

export interface Scene3DProps {
  scene3d: Scene3DId
  quality: QualitySettings
  accent: string
}

export type Scene3DComponent = ComponentType<Scene3DProps>

/**
 * Maps each 3D environment to its component.
 *
 * Every key currently points at PlaceholderScene. Phases 5–9 replace entries
 * one at a time — AI World first, then AI Lab, and so on — without touching
 * anything that consumes the registry.
 */
export const SCENE_3D_REGISTRY: Record<Scene3DId, Scene3DComponent> = {
  ...(Object.fromEntries(
    SCENE_3D_IDS.map((id) => [id, PlaceholderScene]),
  ) as Record<Scene3DId, Scene3DComponent>),

  // World 1 — Task 11.
  opening: OpeningWorld,
  aiHistory: AiHistoryWorld,
  // World 2 — Task 12. The rest follow in Tasks 13–24.
  aiMind: AiMindWorld,
}

/**
 * Resolves a 3D scene, falling back rather than crashing.
 *
 * A missing entry must never take down a live presentation over something
 * purely decorative.
 */
export function getScene3DComponent(id: Scene3DId): Scene3DComponent {
  return SCENE_3D_REGISTRY[id] ?? PlaceholderScene
}
