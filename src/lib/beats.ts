import { INTERACTION_BY_ID } from '@/data/interactions'
import { SCENES } from '@/data/scenes'
import type { InteractionDef, SceneDef } from '@/types'

/**
 * A "beat" is one presenter key-press worth of reveal inside a scene.
 *
 * Beat 0 is the scene at rest; each subsequent beat reveals one more thing.
 * Counts are derived from content that already exists, so as the original deck
 * is transcribed into `content.steps` the beat counts grow on their own.
 */

/** How many beats an interaction consumes once its host scene is at rest. */
export function getInteractionBeats(interaction: InteractionDef): number {
  // The Prompt Lab builds its prompt up one piece at a time
  // (Context → Goal → Constraints → Output). Everything else resolves in a
  // single beat: reveal the poll results, show the correct answer, etc.
  return interaction.kind === 'lab' ? interaction.options.length : 1
}

export function getSceneBeatCount(scene: SceneDef): number {
  const steps = scene.content.steps?.length ?? 0
  const interaction = scene.interaction
    ? INTERACTION_BY_ID[scene.interaction]
    : undefined

  // Statement scenes are presenter-stepped: beat 0 is darkness plus the
  // sentence, and one further beat blooms the visual behind it.
  const statementBeat = scene.transition === 'statementReveal' ? 1 : 0

  return (
    1 + steps + statementBeat + (interaction ? getInteractionBeats(interaction) : 0)
  )
}

/** Total key presses to walk the whole deck. Useful for rehearsal. */
export function getTotalBeats(): number {
  return SCENES.reduce((sum, scene) => sum + getSceneBeatCount(scene), 0)
}

/**
 * Which beat owns which content.
 *
 *   beat 0        scene at rest (headline visible)
 *   beats 1..S    reveal steps, one each
 *   beat S+1      statement visual blooms   (statementReveal scenes only)
 *   beats after   interaction phases
 *
 * Steps come before the statement because that is the finale's shape: the four
 * closing lines build first, then the final message lands.
 *
 * Components read this instead of doing beat arithmetic themselves.
 */
export interface BeatLayout {
  /** First beat that reveals a step. Always 1. */
  stepsStart: number
  stepCount: number
  /** Beat at which the statement visual blooms, or null. */
  statementBeat: number | null
  /** First beat belonging to the interaction, or null. */
  interactionStart: number | null
  interactionBeats: number
  /** Always equals getSceneBeatCount(scene). */
  total: number
}

export function getBeatLayout(scene: SceneDef): BeatLayout {
  const stepCount = scene.content.steps?.length ?? 0
  const interaction = scene.interaction
    ? INTERACTION_BY_ID[scene.interaction]
    : undefined
  const interactionBeats = interaction ? getInteractionBeats(interaction) : 0

  const stepsStart = 1
  let nextBeat = stepsStart + stepCount

  const statementBeat =
    scene.transition === 'statementReveal' ? nextBeat++ : null

  const interactionStart = interaction ? nextBeat : null
  nextBeat += interactionBeats

  return {
    stepsStart,
    stepCount,
    statementBeat,
    interactionStart,
    interactionBeats,
    total: nextBeat,
  }
}
