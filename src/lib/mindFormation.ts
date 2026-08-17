import { SCENE_BY_ID } from '@/data/scenes'
import { getBeatLayout } from '@/lib/beats'

/**
 * Which form the AI Mind is showing, 0 = brain, 1 = lattice.
 *
 * World 2 argues that AI is not a mind. A brain left on screen throughout
 * would quietly assert the opposite, so the brain is shown — the assumption
 * students arrive with — and then taken apart in front of them, on the beat
 * where `AI مش سحر` lands.
 *
 * Pure so the mapping is testable rather than buried inside useFrame.
 */

/** Scenes where the assumption is still intact. */
const BRAIN_SCENES = new Set(['not-mind-reader', 'context'])

/** The scene where it comes apart. */
const DISSOLVE_SCENE = 'not-magic'

/** Scenes after the dissolve. Once broken, it stays broken. */
const LATTICE_SCENES = new Set(['how-ai-works', 'why-ai-makes-mistakes'])

export function getMindFormation(sceneId: string, beat: number): number {
  if (BRAIN_SCENES.has(sceneId)) return 0
  if (LATTICE_SCENES.has(sceneId)) return 1

  if (sceneId === DISSOLVE_SCENE) {
    /*
      Derived from the beat layout, not pinned to a number. This was `beat >= 1`
      and was correct only while the scene had no reveal steps: once the deck
      supplied its three lines, the brain came apart on the first of them —
      three beats before the sentence it is supposed to land with.

      The statement text is on screen from beat 0; what *lands* is the bloom.
      So the brain holds through the whole explanation and breaks as the visual
      behind it blooms, which is the same beat StatementScene reveals on.
    */
    const scene = SCENE_BY_ID.get(sceneId)
    const statementBeat = scene ? getBeatLayout(scene).statementBeat : null
    if (statementBeat === null) return beat >= 1 ? 1 : 0
    return beat >= statementBeat ? 1 : 0
  }

  // Any other scene reaching this world defaults to the lattice — never NaN,
  // because the value feeds straight into geometry interpolation.
  return 1
}
