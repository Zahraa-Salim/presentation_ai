import { SCENES } from '@/data/scenes'
import { WORLDS } from '@/data/worlds'
import type { WorldDef } from '@/types'

/**
 * Layout data for the segmented progress bar.
 *
 * Derived from the scene registry rather than hard-coded, so the bar cannot
 * drift out of sync if scenes move between worlds.
 */
export interface WorldSegment {
  world: WorldDef
  /** 0-based index of this world's first scene. */
  startIndex: number
  /** 0-based index of its last scene. */
  endIndex: number
  sceneCount: number
  /** Share of the whole deck, 0..1 — drives flex-basis. */
  weight: number
}

export function getWorldSegments(): WorldSegment[] {
  const total = SCENES.length

  return WORLDS.map((world) => {
    const startIndex = SCENES.findIndex((scene) => scene.world === world.id)
    const sceneCount = SCENES.filter((scene) => scene.world === world.id).length

    return {
      world,
      startIndex,
      endIndex: startIndex + sceneCount - 1,
      sceneCount,
      weight: sceneCount / total,
    }
  })
}

/**
 * How full one segment should be, 0..1, given the current scene.
 *
 * Worlds already presented sit at 1, worlds not yet reached at 0, and the
 * current world fills scene by scene.
 */
export function getSegmentFill(
  segment: WorldSegment,
  sceneIndex: number,
): number {
  if (sceneIndex > segment.endIndex) return 1
  if (sceneIndex < segment.startIndex) return 0

  return (sceneIndex - segment.startIndex + 1) / segment.sceneCount
}
