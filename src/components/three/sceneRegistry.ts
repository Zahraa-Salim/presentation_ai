import type { ComponentType } from 'react'
import { PlaceholderScene } from '@/components/three/PlaceholderScene'
import { AiHistoryWorld } from '@/components/three/worlds/AiHistoryWorld'
import { AiMachineWorld } from '@/components/three/worlds/AiMachineWorld'
import { AiMindWorld } from '@/components/three/worlds/AiMindWorld'
import { CyberCityWorld } from '@/components/three/worlds/CyberCityWorld'
import { DependencyWorld } from '@/components/three/worlds/DependencyWorld'
import { FinaleWorld } from '@/components/three/worlds/FinaleWorld'
import { FutureCityWorld } from '@/components/three/worlds/FutureCityWorld'
import { OpeningWorld } from '@/components/three/worlds/OpeningWorld'
import { PrivacyVaultWorld } from '@/components/three/worlds/PrivacyVaultWorld'
import { StudyLabWorld } from '@/components/three/worlds/StudyLabWorld'
import { ToolCityWorld } from '@/components/three/worlds/ToolCityWorld'
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
  // World 2 — Task 12.
  aiMind: AiMindWorld,
  // Prompting and privacy — the two environments that carry an argument.
  aiMachine: AiMachineWorld,
  privacyVault: PrivacyVaultWorld,
  // World 3's city and desk, plus the Cybersecurity moment.
  toolCity: ToolCityWorld,
  studyLab: StudyLabWorld,
  cyberCity: CyberCityWorld,
  // World 5 and the close.
  dependency: DependencyWorld,
  futureCity: FutureCityWorld,
  finale: FinaleWorld,
  // `void` keeps the placeholder: it is the deliberate empty backdrop for a
  // statement moment, not an environment waiting to be built.
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
