import { SCENES } from '@/data/scenes'

const PREFIX = '#/scene/'

/**
 * Deep linking, so rehearsal can reload straight into scene 27 instead of
 * pressing → twenty-six times.
 *
 * The scene number in the URL is 1-based, matching what the presenter sees in
 * the progress indicator. The beat is deliberately not encoded: it would
 * rewrite the URL on every key press, and reloading mid-reveal should land at
 * the start of the scene.
 */

/** Returns a 0-based scene index, or null if the hash is absent or invalid. */
export function readSceneFromHash(
  hash: string = window.location.hash,
): number | null {
  if (!hash.startsWith(PREFIX)) return null

  const sceneNumber = Number(hash.slice(PREFIX.length))
  if (
    !Number.isInteger(sceneNumber) ||
    sceneNumber < 1 ||
    sceneNumber > SCENES.length
  ) {
    return null
  }

  return sceneNumber - 1
}

export function writeSceneToHash(sceneIndex: number): void {
  const next = `${PREFIX}${sceneIndex + 1}`
  if (window.location.hash === next) return

  // replaceState, not pushState: during a live presentation browser Back must
  // not step backwards through scenes and fight the arrow keys.
  window.history.replaceState(null, '', next)
}

/** Reacts to the URL being edited by hand. Returns an unsubscribe function. */
export function subscribeToHash(
  onChange: (sceneIndex: number) => void,
): () => void {
  const handler = () => {
    const sceneIndex = readSceneFromHash()
    if (sceneIndex !== null) onChange(sceneIndex)
  }

  window.addEventListener('hashchange', handler)
  return () => window.removeEventListener('hashchange', handler)
}
