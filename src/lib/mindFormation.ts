/**
 * Which form the AI Mind is showing, 0 = brain, 1 = lattice.
 *
 * World 2 argues that AI is not a mind. A brain left on screen throughout
 * would quietly assert the opposite, so the brain is shown — the assumption
 * students arrive with — and then taken apart in front of them, exactly on the
 * beat where `AI مش سحر` lands.
 *
 * Pure so the mapping is testable rather than buried inside useFrame.
 */

/** Scenes where the assumption is still intact. */
const BRAIN_SCENES = new Set(['not-a-mind-reader', 'context'])

/** The scene where it comes apart, on its second beat. */
const DISSOLVE_SCENE = 'not-magic'

/** Scenes after the dissolve. Once broken, it stays broken. */
const LATTICE_SCENES = new Set(['how-ai-works', 'why-ai-makes-mistakes'])

export function getMindFormation(sceneId: string, beat: number): number {
  if (BRAIN_SCENES.has(sceneId)) return 0
  if (LATTICE_SCENES.has(sceneId)) return 1
  if (sceneId === DISSOLVE_SCENE) return beat >= 1 ? 1 : 0

  // Any other scene reaching this world defaults to the lattice — never NaN,
  // because the value feeds straight into geometry interpolation.
  return 1
}
