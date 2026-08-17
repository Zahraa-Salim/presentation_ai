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
  return getBeatLayout(scene).total
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
 *   beats after   comparison columns, one each
 *   next beat     statement visual blooms   (statementReveal scenes only)
 *   beats after   interaction phases
 *   final beat    keyMessage — the line the scene lands on
 *
 * Steps come before the statement because that is the finale's shape: the four
 * closing lines build first, then the final message lands. Groups sit between
 * them so a comparison can still resolve into a statement.
 *
 * keyMessage is always LAST, after the interaction too: on the interactive
 * scenes it is the takeaway the interaction exists to produce, so it has to
 * arrive once the class has answered — not while they are still deciding.
 *
 * Components read this instead of doing beat arithmetic themselves.
 */
export interface BeatLayout {
  /** First beat that reveals a step. Always 1. */
  stepsStart: number
  stepCount: number
  /** First beat that reveals a comparison column, or null. */
  groupsStart: number | null
  groupCount: number
  /** Beat at which the statement visual blooms, or null. */
  statementBeat: number | null
  /** First beat belonging to the interaction, or null. */
  interactionStart: number | null
  interactionBeats: number
  /** Final beat, landing the scene's takeaway, or null. */
  keyMessageBeat: number | null
  /** Always equals getSceneBeatCount(scene). */
  total: number
}

export function getBeatLayout(scene: SceneDef): BeatLayout {
  const stepCount = scene.content.steps?.length ?? 0
  const groupCount = scene.content.groups?.length ?? 0
  const interaction = scene.interaction
    ? INTERACTION_BY_ID[scene.interaction]
    : undefined
  const interactionBeats = interaction ? getInteractionBeats(interaction) : 0

  const stepsStart = 1
  let nextBeat = stepsStart + stepCount

  // A comparison lands column by column — showing "weak" and "strong" at once
  // gives the class nothing to think about in between.
  const groupsStart = groupCount > 0 ? nextBeat : null
  nextBeat += groupCount

  // Statement scenes are presenter-stepped: beat 0 is darkness plus the
  // sentence, and one further beat blooms the visual behind it.
  const statementBeat =
    scene.transition === 'statementReveal' ? nextBeat++ : null

  const interactionStart = interaction ? nextBeat : null
  nextBeat += interactionBeats

  const keyMessageBeat = scene.content.keyMessage ? nextBeat++ : null

  return {
    stepsStart,
    stepCount,
    groupsStart,
    groupCount,
    statementBeat,
    interactionStart,
    interactionBeats,
    keyMessageBeat,
    total: nextBeat,
  }
}
