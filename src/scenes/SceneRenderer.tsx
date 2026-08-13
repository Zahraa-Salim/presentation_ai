import { createElement } from 'react'
import { usePresentation } from '@/hooks/usePresentation'
import { getSceneComponent } from '@/scenes/sceneComponents'

/**
 * Renders whichever scene is current.
 *
 * Resolution is override-first, then the default for the scene's type, so
 * every one of the 33 scenes renders something from the moment it exists in
 * the data — long before its own world is built.
 */
export function SceneRenderer() {
  const { scene, world } = usePresentation()

  return (
    <div
      data-world={world.id}
      className="scene-frame"
      // Remounts on scene change so reveal state never leaks between scenes.
      key={scene.id}
    >
      {createElement(getSceneComponent(scene), { scene })}
    </div>
  )
}
