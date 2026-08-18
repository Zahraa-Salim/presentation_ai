import type { ComponentType } from 'react'
import { CinematicScene } from '@/scenes/defaults/CinematicScene'
import { ExplainScene } from '@/scenes/defaults/ExplainScene'
import { InteractiveScene } from '@/scenes/defaults/InteractiveScene'
import { StatementScene } from '@/scenes/defaults/StatementScene'
import { HistoryScene } from '@/scenes/ai-world/HistoryScene'
import { HowAiWorksScene } from '@/scenes/ai-lab/HowAiWorksScene'
import { CyberScene } from '@/scenes/privacy/CyberScene'
import type { SceneDef, SceneType } from '@/types'

export interface SceneComponentProps {
  scene: SceneDef
}

export type SceneComponent = ComponentType<SceneComponentProps>

/**
 * A default renderer per scene type. Most scenes are structurally identical —
 * a headline plus staged reveals — so they share these.
 */
export const DEFAULT_SCENE_COMPONENTS: Record<SceneType, SceneComponent> = {
  explain: ExplainScene,
  statement: StatementScene,
  interactive: InteractiveScene,
  cinematic: CinematicScene,
}

/**
 * Per-scene overrides, keyed by scene id.
 *
 * Deliberately sparse: a scene only gets its own component when its layout
 * genuinely differs. This is what keeps the project from turning into
 * Slide1.tsx … Slide33.tsx.
 */
export const SCENE_COMPONENTS: Partial<Record<string, SceneComponent>> = {
  // Needs DOM-rendered milestone labels mirroring the 3D timeline.
  'ai-is-not-new': HistoryScene,
  // Five pipeline stages advancing in step with the 3D lattice.
  'how-ai-works': HowAiWorksScene,
  // A list, a two-option quiz and its tells — one column ran off the screen.
  'ai-cybersecurity': CyberScene,
}

export function getSceneComponent(scene: SceneDef): SceneComponent {
  return SCENE_COMPONENTS[scene.id] ?? DEFAULT_SCENE_COMPONENTS[scene.type]
}
