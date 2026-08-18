import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { getRobotPose, toRobotPose } from '@/lib/robotPose'
import { NOVA_EXPRESSIONS } from '@/lib/novaExpressions'
import { NOVA_EMOTIONS } from '@/types'

/**
 * The character body, and the translation that drives it.
 *
 * `nova.test.ts` proves the twelve expressions are mutually distinguishable as
 * abstract parameters. That proof does not automatically survive being mapped
 * onto a head, two eyes and a pair of arms: a translation that collapsed two
 * states into the same pose would pass every existing test and show a class the
 * same face for `thinking` and `confused`.
 *
 * So the mapping is re-proved here, on the body's own terms.
 */

const source = (relative: string) =>
  readFileSync(fileURLToPath(new URL(`../${relative}`, import.meta.url)), 'utf8')

const poseKey = (emotion: (typeof NOVA_EMOTIONS)[number], still = false) => {
  const p = getRobotPose(emotion, still)
  return [
    p.eyeOpenness.toFixed(3),
    p.headTilt.toFixed(3),
    p.armSpread.toFixed(3),
    p.swaySpeed.toFixed(3),
    p.bobAmplitude.toFixed(3),
    p.bobSpeed.toFixed(3),
    p.glow.toFixed(3),
    p.hue ?? 'accent',
  ].join('|')
}

describe('every expression becomes a pose', () => {
  it.each(NOVA_EMOTIONS)('%s maps without gaps', (emotion) => {
    const pose = getRobotPose(emotion)
    expect(Number.isFinite(pose.eyeOpenness)).toBe(true)
    expect(Number.isFinite(pose.headTilt)).toBe(true)
    expect(Number.isFinite(pose.armSpread)).toBe(true)
    expect(Number.isFinite(pose.glow)).toBe(true)
  })

  it('falls back to idle rather than crashing on an unknown emotion', () => {
    // Mirrors getExpression's contract — the canvas must never come down.
    const unknown = getRobotPose('nonsense' as (typeof NOVA_EMOTIONS)[number])
    expect(unknown).toEqual(getRobotPose('idle'))
  })

  it('keeps the arms in front of the body, never folded through it', () => {
    for (const emotion of NOVA_EMOTIONS) {
      const { armSpread } = getRobotPose(emotion)
      expect(armSpread, emotion).toBeGreaterThan(0)
      expect(armSpread, emotion).toBeLessThan(Math.PI / 2)
    }
  })

  it('never shuts the eyes on a state meant to be held', () => {
    // A state that reads as permanently blinking reads as broken.
    for (const emotion of NOVA_EMOTIONS) {
      const pose = getRobotPose(emotion)
      if (emotion === 'blink') continue
      expect(pose.eyeOpenness, emotion).toBeGreaterThan(0.15)
    }
  })
})

describe('the twelve stay distinguishable on a body', () => {
  it('gives no two states the same pose', () => {
    const seen = new Map<string, string>()
    for (const emotion of NOVA_EMOTIONS) {
      const key = poseKey(emotion)
      expect(seen.has(key), `${emotion} poses identically to ${seen.get(key)}`).toBe(
        false,
      )
      seen.set(key, emotion)
    }
  })

  it('leaves them distinguishable even when completely still', () => {
    // Reduced motion zeroes everything that moves. What is left — eye shape,
    // head tilt, arm spread, hue, glow — still has to carry twelve meanings.
    const seen = new Map<string, string>()
    for (const emotion of NOVA_EMOTIONS) {
      const key = poseKey(emotion, true)
      expect(
        seen.has(key),
        `${emotion} is indistinguishable from ${seen.get(key)} under reduced motion`,
      ).toBe(false)
      seen.set(key, emotion)
    }
  })

  it('separates the three states a class most needs to tell apart', () => {
    // Confusion, thinking and warning are the deck's teaching beats; if any two
    // read the same, three scenes lose their signal.
    const keys = ['confused', 'thinking', 'warning'].map((e) =>
      poseKey(e as (typeof NOVA_EMOTIONS)[number], true),
    )
    expect(new Set(keys).size).toBe(3)
  })
})

describe('the translation keeps what the abstract form meant', () => {
  it('carries the sign of the ring speed into the sway', () => {
    // `confused` is the only state that spins backwards, and it stays the only
    // state that sways the wrong way. Meaning, not decoration.
    const backwards = NOVA_EMOTIONS.filter(
      (e) => getRobotPose(e).swaySpeed < 0,
    )
    expect(backwards).toEqual(['confused'])
  })

  it('opens the arms exactly where the rings drifted apart', () => {
    // thinking has the widest ring separation; warning the tightest.
    const spreads = NOVA_EMOTIONS.map((e) => [e, getRobotPose(e).armSpread] as const)
    const widest = spreads.reduce((a, b) => (b[1] > a[1] ? b : a))
    const tightest = spreads.reduce((a, b) => (b[1] < a[1] ? b : a))
    expect(widest[0]).toBe('thinking')
    expect(tightest[0]).toBe('warning')
  })

  it('bursts only on celebrate', () => {
    const bursting = NOVA_EMOTIONS.filter((e) => getRobotPose(e).burst)
    expect(bursting).toEqual(['celebrate'])
  })

  it('is a translation, not a second set of states', () => {
    // Derived from NOVA_EXPRESSIONS, so the twelve cannot drift apart into two
    // definitions that disagree.
    for (const emotion of NOVA_EMOTIONS) {
      expect(toRobotPose(NOVA_EXPRESSIONS[emotion])).toEqual(getRobotPose(emotion))
    }
  })
})

describe('the body itself', () => {
  const model = source('components/three/RobotModel.tsx')

  it('has the parts the character is made of', () => {
    for (const part of ['legs', 'torso', 'arms', 'head', 'Visor', 'Eyes', 'Antenna']) {
      expect(model, `no ${part}`).toContain(part)
    }
  })

  it('reads its meaning from the shared pose module', () => {
    expect(model).toContain('getRobotPose')
    // A body that re-derived the expressions would be a second source of truth.
    expect(model).not.toContain('NOVA_EXPRESSIONS')
  })

  it('honours reduced motion', () => {
    expect(model).toContain('reducedMotion')
  })

  it('allocates nothing inside the frame loop', () => {
    // 45 minutes at 60fps is 162,000 frames; a Vector3 per frame is garbage
    // the presentation cannot afford to collect mid-sentence.
    const loop = model.slice(model.indexOf('useFrame('), model.indexOf('const showGlow'))
    expect(loop.length).toBeGreaterThan(200)
    expect(loop).not.toMatch(/\bnew [A-Z]/)
  })

  it('disposes the geometries it builds', () => {
    // This runs for the whole lesson and the companion unmounts on a WebGL
    // fallback; leaking three geometries is small but it is still a leak.
    expect(model).toContain('dispose()')
  })

  it('renders no text, in any language', () => {
    // Three.js cannot shape or bidi Arabic, and every word in this deck lives
    // in the DOM layer above the canvas.
    expect(model).not.toContain('<Text')
    expect(model).not.toMatch(/[؀-ۿ]/)
  })

  it('shares the geometries that come in pairs', () => {
    // Two eyes, two arms and two legs are six meshes from three geometries.
    expect(model).toContain('geometry={geometries.eye}')
    expect(model).toContain('geometry={geometries.limb}')
    expect(model).toContain('geometry={geometries.leg}')
  })
})

describe('NOVA’s abstract form is kept, not deleted', () => {
  it('still exists as the fallback', () => {
    // If the character body turns out to be too much for a classroom, swapping
    // back is one line in PresentationRobot.
    expect(() => source('components/three/AICharacter.tsx')).not.toThrow()
  })

  it('is what the companion no longer uses', () => {
    const robot = source('components/three/PresentationRobot.tsx')
    expect(robot).toContain('RobotModel')
    expect(robot).not.toContain('<AICharacter')
  })
})
