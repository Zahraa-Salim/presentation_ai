import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { BufferAttribute, BufferGeometry } from 'three'

interface BlendedPositionsOptions {
  /** Positions at blend 0. */
  from: Float32Array
  /** Positions at blend 1. Must be the same length as `from`. */
  to: Float32Array
  /** Where the blend should be right now, 0..1. */
  target: number
  /** Higher eases faster. */
  speed?: number
  reducedMotion: boolean
}

/*
  Below this, a further step moves every point by less than a thousandth of a
  unit — invisible at any projector resolution, and not worth a GPU upload.
*/
const SETTLE_EPSILON = 0.0005

/**
 * Two precomputed point sets, blended by one eased value.
 *
 * Every world in this deck that morphs — particles gathering, a brain coming
 * apart, a prompt focusing — is the same technique: precompute both states,
 * interpolate, never simulate. This owns the whole of it, including the two
 * things that are easy to get wrong and invisible when you do:
 *
 *  - **It stops writing once the blend has settled.** Rewriting the buffer
 *    unconditionally costs thousands of float writes and a full GPU re-upload
 *    per frame, forever — and it costs the most on the still scenes, which are
 *    exactly the ones the presenter talks over.
 *  - **It disposes the geometry on unmount.** Manually created geometry is not
 *    collected, and this runs for 45 minutes.
 *
 * Returns the geometry plus the live blend value, which callers need for the
 * things that ride along with it — emissive intensity, scale, drift rate.
 */
export function useBlendedPositions({
  from,
  to,
  target,
  speed = 2,
  reducedMotion,
}: BlendedPositionsOptions) {
  const formation = useRef(0)
  const settled = useRef(false)

  const geometry = useMemo(() => {
    const geo = new BufferGeometry()
    // A copy: the buffer is mutated per frame and `from` is the pristine state.
    geo.setAttribute('position', new BufferAttribute(new Float32Array(from), 3))
    return geo
  }, [from])

  useEffect(() => () => geometry.dispose(), [geometry])

  useFrame((_, delta) => {
    const gap = target - formation.current

    const write = (t: number) => {
      const attribute = geometry.getAttribute('position') as BufferAttribute
      const array = attribute.array as Float32Array
      for (let i = 0; i < array.length; i++) {
        array[i] = from[i] + (to[i] - from[i]) * t
      }
      attribute.needsUpdate = true
    }

    if (Math.abs(gap) > SETTLE_EPSILON) {
      settled.current = false
      formation.current += gap * (reducedMotion ? 1 : 1 - Math.exp(-speed * delta))
      write(formation.current)
    } else if (!settled.current) {
      // One last exact write, so the geometry lands on the target not near it.
      formation.current = target
      write(target)
      settled.current = true
    }
  })

  return { geometry, formation }
}
