import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { SCENES } from '@/data/scenes'
import { CAMERA_POSES } from '@/lib/cameraPoses'
import { ROBOT_BEHAVIORS, getRobotBehavior } from '@/lib/robotBehavior'
import {
  DRIFT_X,
  DRIFT_Y,
  FLIGHT_ARC,
  HEIGHT_FRACTION,
  INSET_X,
  INSET_Y,
  ROBOT_DISTANCE,
  SCRIM_COMPENSATION,
  cornerForWorld,
  cornerSide,
  getFlightArc,
  getRobotDrift,
  getRobotPlacement,
  projectRobot,
} from '@/lib/robotPlacement'
import { WORLDS } from '@/data/worlds'
import { NOVA_EMOTIONS } from '@/types'

/**
 * NOVA's per-scene behaviour.
 *
 * Two kinds of thing are guarded here, and the second matters more.
 *
 * The first is coverage: a scene with no entry, or an entry for a scene that no
 * longer exists, is the sort of drift that shows up as a companion pulling the
 * wrong face in front of a class.
 *
 * The second is **educational**. Four of the mappings are teaching decisions
 * wearing the costume of a visual choice, and a later tidy-up that "made the
 * friend scene friendlier" would undo a point the deck spends three scenes
 * making. The reason is written into each test so it cannot be rediscovered the
 * hard way.
 */

const byId = (id: string) => SCENES.find((scene) => scene.id === id)

describe('every scene has a behaviour, and every behaviour has a scene', () => {
  it.each(SCENES.map((scene) => [scene.index, scene.id] as const))(
    'scene %i · %s is mapped',
    (_index, id) => {
      expect(ROBOT_BEHAVIORS[id]).toBeDefined()
    },
  )

  it('maps nothing that is not a scene', () => {
    const ids = new Set(SCENES.map((scene) => scene.id))
    const orphans = Object.keys(ROBOT_BEHAVIORS).filter((id) => !ids.has(id))
    expect(orphans).toEqual([])
  })

  it('covers the deck exactly, with no duplicates', () => {
    expect(Object.keys(ROBOT_BEHAVIORS)).toHaveLength(SCENES.length)
  })
})

describe('behaviours are well formed', () => {
  it.each(Object.entries(ROBOT_BEHAVIORS))(
    '%s uses a real expression',
    (_id, behavior) => {
      expect(NOVA_EMOTIONS).toContain(behavior.emotion)
    },
  )

  it('never scales the companion up, only down', () => {
    // It is secondary to the lesson by design; a scene that needed a *bigger*
    // mascot would be a scene that had lost its subject.
    for (const [id, behavior] of Object.entries(ROBOT_BEHAVIORS)) {
      if (behavior.scale === undefined) continue
      expect(behavior.scale, id).toBeGreaterThan(0.4)
      expect(behavior.scale, id).toBeLessThanOrEqual(1)
    }
  })

  it('falls back to resting rather than throwing on an unknown scene', () => {
    expect(getRobotBehavior('no-such-scene')).toEqual({ emotion: 'idle' })
  })
})

describe('the bare screens stay bare', () => {
  /*
    Derived from the deck rather than listed, so a sixth statementReveal scene
    fails here instead of quietly acquiring a mascot. Those scenes are built
    around a clean screen and a silence the presenter controls — scene 8 most of
    all, where the brain dissolves into machinery as `AI مش سحر.` lands.
  */
  const bare = SCENES.filter((scene) => scene.transition === 'statementReveal')

  it('finds the statement scenes', () => {
    expect(bare.length).toBeGreaterThanOrEqual(5)
  })

  it.each(bare.map((scene) => [scene.index, scene.id] as const))(
    'scene %i · %s hides the companion',
    (_index, id) => {
      expect(ROBOT_BEHAVIORS[id]?.hidden).toBe(true)
    },
  )

  it('hides it nowhere else — it is a companion, not a cameo', () => {
    const hidden = Object.entries(ROBOT_BEHAVIORS)
      .filter(([, behavior]) => behavior.hidden)
      .map(([id]) => id)

    expect(hidden.sort()).toEqual(bare.map((scene) => scene.id).sort())
  })
})

describe('the companion never argues against the lesson', () => {
  /* CLAUDE.md: NOVA must never encourage emotional dependency. */

  it('is merely curious about whether an AI is your friend', () => {
    // The scene puts the question to the class. A delighted companion answers
    // it — yes — before anyone has had to think, and the next three scenes
    // spend their time undoing that.
    expect(byId('is-chatgpt-a-friend')).toBeDefined()
    expect(['happy', 'celebrate']).not.toContain(
      ROBOT_BEHAVIORS['is-chatgpt-a-friend'].emotion,
    )
  })

  it('does not look disappointed at someone who does not use AI', () => {
    // The whole point of the scene is that not using AI is not a failure.
    expect(byId('non-ai-user')).toBeDefined()
    expect(['sad', 'confused', 'warning']).not.toContain(
      ROBOT_BEHAVIORS['non-ai-user'].emotion,
    )
  })

  it('thinks rather than sulks about dependency', () => {
    // Stepping back and thinking for yourself, not being punished for having
    // leaned on a tool.
    expect(byId('dependency')).toBeDefined()
    expect(ROBOT_BEHAVIORS['dependency'].emotion).not.toBe('sad')
  })

  it('keeps the sharp states for the boundary and threat scenes', () => {
    for (const id of [
      'friend-lifecoach-secretkeeper',
      'what-not-to-share',
      'ai-cybersecurity',
    ]) {
      expect(ROBOT_BEHAVIORS[id]?.emotion, id).toBe('warning')
    }
  })
})

describe('the mapping is actually varied', () => {
  it('shows the companion on most of the deck', () => {
    const visible = Object.values(ROBOT_BEHAVIORS).filter((b) => !b.hidden)
    expect(visible.length).toBeGreaterThanOrEqual(25)
  })

  it('uses at least four distinct expressions', () => {
    // A single state across 28 scenes would be decoration, which is the thing
    // CLAUDE.md's 3D rule exists to prevent.
    const used = new Set(
      Object.values(ROBOT_BEHAVIORS)
        .filter((b) => !b.hidden)
        .map((b) => b.emotion),
    )
    expect(used.size).toBeGreaterThanOrEqual(4)
  })
})

describe('placement stays out of the world', () => {
  const source = readFileSync(
    fileURLToPath(
      new URL('../components/three/PresentationRobot.tsx', import.meta.url),
    ),
    'utf8',
  )

  it('honours reduced motion', () => {
    // The same chain every 3D module in this project is held to.
    expect(source).toContain('reducedMotion')
  })

  it('anchors to the camera rather than to a scene pose', () => {
    /*
      The invariant `worlds.test.ts` enforces on world modules, for the same
      reason: world-space placement here would leave the companion behind in
      whichever environment it was authored against — the bug that made World 2
      render as a black screen.
    */
    expect(source).not.toContain('getCameraPose')
    expect(source).toContain('camera.quaternion')
  })

  it('sizes itself against the frame, not against the world', () => {
    // The deck eases fov between 40 and 60. A fixed scale visibly swells and
    // shrinks at every world change, so the live fov has to reach the maths.
    expect(source).toContain('camera.fov')
    expect(source).toContain('camera.aspect')
  })

  it('derives placement from the shared module rather than its own arithmetic', () => {
    // The invariants proved below hold for getRobotPlacement. A component that
    // open-coded the same formula would drift out of them silently.
    expect(source).toContain('getRobotPlacement')
    expect(source).not.toMatch(/Math\.tan/)
  })

  it('does not render its own mote field', () => {
    expect(source).toContain('motes={false}')
  })
})


/* The deck's eleven camera poses use five different fields of view. */
const FOVS = [40, 45, 50, 55, 58, 60]
const ASPECTS = [16 / 9, 1366 / 768, 4 / 3]

describe('placement is invariant to the frame it sits in', () => {
  /*
    This is the property the whole design rests on: the companion is scaled from
    halfHeight, and halfHeight is proportional to the ride distance, so both
    distance and fov cancel out of the projection. It is what lets the ride
    distance be chosen purely to settle depth ordering, and what stops the
    companion swelling and shrinking as the fov eases between worlds.

    Asserted rather than argued, because the argument is exactly the kind that
    stays in a comment after the code stops honouring it.
  */
  it('lands on the same point of the screen at every fov', () => {
    const positions = FOVS.map((fov) => projectRobot(fov, 16 / 9))
    for (const p of positions) {
      expect(p.ndcX).toBeCloseTo(INSET_X, 10)
      expect(p.ndcY).toBeCloseTo(-INSET_Y, 10)
    }
  })

  it('lands on the same point of the screen at every aspect ratio', () => {
    for (const aspect of ASPECTS) {
      const p = projectRobot(50, aspect)
      expect(p.ndcX).toBeCloseTo(INSET_X, 10)
      expect(p.ndcY).toBeCloseTo(-INSET_Y, 10)
    }
  })

  it('appears exactly the same size at every fov and aspect', () => {
    for (const fov of FOVS) {
      for (const aspect of ASPECTS) {
        expect(projectRobot(fov, aspect).ndcHeight).toBeCloseTo(
          HEIGHT_FRACTION,
          10,
        )
      }
    }
  })

  it('mirrors cleanly to the other corner', () => {
    const right = projectRobot(50, 16 / 9, { side: cornerSide('bottom-right') })
    const left = projectRobot(50, 16 / 9, { side: cornerSide('bottom-left') })
    expect(left.ndcX).toBeCloseTo(-right.ndcX, 10)
    expect(left.ndcY).toBeCloseTo(right.ndcY, 10)
  })

  it('honours a per-scene scale reduction', () => {
    const full = projectRobot(50, 16 / 9, { side: 1, scaleMultiplier: 1 })
    const small = projectRobot(50, 16 / 9, { side: 1, scaleMultiplier: 0.85 })
    expect(small.ndcHeight).toBeCloseTo(full.ndcHeight * 0.85, 10)
  })
})

describe('it stays inside the frame and off the chrome', () => {
  const halfModel = 0.92 * HEIGHT_FRACTION

  it('keeps clear of the bottom edge even at the bottom of its drift', () => {
    // The model is about 1.84 local units tall (ring diameter), so it reaches
    // roughly 0.92 · HEIGHT_FRACTION below its anchor in NDC. The drift adds to
    // that; the arc only ever lifts, so it cannot.
    expect(INSET_Y + DRIFT_Y + halfModel).toBeLessThan(0.96)
  })

  it('keeps clear of the side edge even at the outside of its drift', () => {
    expect(INSET_X + DRIFT_X + halfModel).toBeLessThan(1)
  })

  it('never lifts far enough to reach the text', () => {
    // Mid-crossing is the highest it ever gets, and it is passing beneath the
    // scene's copy at that moment.
    expect(INSET_Y - FLIGHT_ARC - DRIFT_Y).toBeGreaterThan(0.35)
  })

  it('sits below the vertical middle, out of the text block', () => {
    expect(INSET_Y).toBeGreaterThan(0.5)
  })
})

describe('it rides nearer than any world', () => {
  /*
    Depth ordering, computed from the deck rather than asserted about it: a new
    camera pose that sits closer to its world than the companion rides would let
    geometry punch through it, and that fails here rather than on the projector.
  */
  const distances = Object.entries(CAMERA_POSES).map(([id, pose]) => {
    const [px, py, pz] = pose.position
    const [tx, ty, tz] = pose.target
    return [id, Math.hypot(px - tx, py - ty, pz - tz)] as const
  })

  it('found the poses', () => {
    expect(distances.length).toBeGreaterThanOrEqual(11)
  })

  it('rides at less than half the closest camera-to-world distance', () => {
    const closest = distances.reduce((min, entry) =>
      entry[1] < min[1] ? entry : min,
    )
    expect(
      ROBOT_DISTANCE * 2,
      `${closest[0]} sits ${closest[1].toFixed(2)} from its world`,
    ).toBeLessThan(closest[1])
  })

  it('stays in front of the near plane with room to spare', () => {
    // R3F's default near plane is 0.1.
    const halfDepth = getRobotPlacement(60, 16 / 9, { side: 1 }).scale * 0.92
    expect(ROBOT_DISTANCE - halfDepth).toBeGreaterThan(1)
  })
})

describe('the scrim compensation tracks the stylesheet', () => {
  /*
    SCRIM_COMPENSATION is derived from a CSS gradient in another file — exactly
    the kind of coupling that rots without anyone noticing. The scrim was
    already retinted once, on 2026-08-18. So the number is recomputed here from
    the stylesheet itself rather than trusted.
  */
  const css = readFileSync(
    fileURLToPath(new URL('../styles/globals.css', import.meta.url)),
    'utf8',
  )

  const block = css.slice(css.indexOf('@utility scene-scrim'))
  const stops = [...block.matchAll(/rgb\([^/]*\/\s*([0-9.]+)\)\s*([0-9.]+)%/g)]
    .map((m) => ({ alpha: Number(m[1]), at: Number(m[2]) }))
    .slice(0, 4)

  it('found the four gradient stops', () => {
    expect(stops).toHaveLength(4)
    expect(stops.map((s) => s.at)).toEqual([0, 30, 70, 100])
  })

  it('matches the veil at the height the companion actually sits at', () => {
    // INSET_Y is a fraction of the half-frame measured from centre.
    const screenPercent = (0.5 + INSET_Y * 0.5) * 100

    const upper = stops.filter((s) => s.at <= screenPercent).at(-1)!
    const lower = stops.find((s) => s.at > screenPercent)!
    const t = (screenPercent - upper.at) / (lower.at - upper.at)
    const alpha = upper.alpha + (lower.alpha - upper.alpha) * t

    // Anything under half means the veil is doing very little and the
    // compensation is overdriving the companion.
    expect(alpha).toBeGreaterThan(0.2)
    expect(alpha).toBeLessThan(0.6)

    expect(
      SCRIM_COMPENSATION,
      `the scrim is ${(alpha * 100).toFixed(1)}% opaque there, so compensation should be ~${(1 / (1 - alpha)).toFixed(2)}`,
    ).toBeCloseTo(1 / (1 - alpha), 1)
  })

  it('never drives an opacity past what is valid', () => {
    // AICharacter clamps, but the brightest material it clamps is the ring at
    // 0.7 — worth knowing the multiplier is in the range where clamping is a
    // safety net rather than the normal case.
    expect(0.14 * SCRIM_COMPENSATION).toBeLessThan(1)
    expect(SCRIM_COMPENSATION).toBeGreaterThan(1)
    expect(SCRIM_COMPENSATION).toBeLessThan(2.5)
  })
})


describe('it crosses the screen, rarely and on purpose', () => {
  /*
    The corner comes from the world rather than the scene, so the companion
    changes sides exactly four times in 45 minutes — always at the moment the
    class is being taken somewhere new. Movement in the corner of the eye costs
    attention: four crossings across a lesson is an event, forty would be a
    distraction.
  */
  const corners = WORLDS.map((world) => cornerForWorld(world.order))

  it('gives every neighbouring world a different corner', () => {
    for (let i = 1; i < corners.length; i++) {
      expect(corners[i], WORLDS[i].id).not.toBe(corners[i - 1])
    }
  })

  it('crosses exactly four times across the five worlds', () => {
    const crossings = corners.filter((c, i) => i > 0 && c !== corners[i - 1])
    expect(crossings).toHaveLength(4)
  })

  it('arcs highest exactly halfway across', () => {
    // What makes the move read as flying rather than sliding along the floor.
    expect(getFlightArc(0)).toBeCloseTo(FLIGHT_ARC, 10)
    expect(getFlightArc(0.5)).toBeCloseTo(FLIGHT_ARC / 2, 10)
  })

  it('sits flat at either end, so holding a corner is never a hover', () => {
    expect(getFlightArc(1)).toBe(0)
    expect(getFlightArc(-1)).toBe(0)
  })

  it('lifts while crossing rather than dropping', () => {
    // The arc has to move it away from the chrome along the bottom, never into.
    const held = projectRobot(50, 16 / 9, { side: 1 })
    const midFlight = projectRobot(50, 16 / 9, { side: 0 })
    expect(midFlight.ndcY).toBeGreaterThan(held.ndcY)
  })

  it('passes through the middle of the screen on the way', () => {
    expect(projectRobot(50, 16 / 9, { side: 0 }).ndcX).toBeCloseTo(0, 10)
  })
})

describe('it drifts while it waits', () => {
  /*
    The difference between a character standing by and an ornament stuck to the
    glass. Bounded hard, because it runs for 45 minutes in the corner of
    everyone's eye.
  */
  it('stays within its unit range for a whole lesson', () => {
    for (let t = 0; t < 2700; t += 0.37) {
      const drift = getRobotDrift(t)
      expect(Math.abs(drift.x)).toBeLessThanOrEqual(1)
      expect(Math.abs(drift.y)).toBeLessThanOrEqual(1)
    }
  })

  it('actually moves, on both axes', () => {
    const xs = new Set()
    const ys = new Set()
    for (let t = 0; t < 60; t += 1) {
      const d = getRobotDrift(t)
      xs.add(Math.round(d.x * 100))
      ys.add(Math.round(d.y * 100))
    }
    expect(xs.size).toBeGreaterThan(20)
    expect(ys.size).toBeGreaterThan(20)
  })

  it('does not trace the same path on both axes', () => {
    // Matched frequencies would slide it along a diagonal, which reads as a
    // mechanism rather than as drifting.
    for (let t = 1; t < 40; t += 1) {
      const d = getRobotDrift(t)
      expect(Math.abs(d.x - d.y)).toBeGreaterThan(1e-6)
    }
  })

  it('is deterministic, so a rehearsal predicts the day', () => {
    expect(getRobotDrift(12.5)).toEqual(getRobotDrift(12.5))
  })

  it('stays small enough to be noticed only when looked at', () => {
    expect(DRIFT_X).toBeLessThan(0.1)
    expect(DRIFT_Y).toBeLessThan(0.1)
  })
})

describe('reduced motion stops all of it', () => {
  const robot = readFileSync(
    fileURLToPath(
      new URL('../components/three/PresentationRobot.tsx', import.meta.url),
    ),
    'utf8',
  )

  it('skips the drift entirely rather than damping it', () => {
    expect(robot).toContain('reducedMotion ? undefined : getRobotDrift')
  })

  it('snaps to the corner instead of crossing', () => {
    const branch = robot.slice(
      robot.indexOf('if (quality.reducedMotion)'),
      robot.indexOf('} else {'),
    )
    expect(branch.length).toBeGreaterThan(40)
    expect(branch).toContain('side.current = targetSide')
  })
})

describe('the orbit rings actually orbit', () => {
  /*
    They never did. A torus lies in the XY plane with its axis along Z, so
    turning it about its own Z turns it about its own axis of symmetry — real in
    the matrix, invisible on screen. The default XYZ Euler order applies that Z
    rotation first, so the static tilt could not rescue it either. The fix spins
    a parent group about Y and leaves the tilt on the mesh.
  */
  const character = readFileSync(
    fileURLToPath(
      new URL('../components/three/AICharacter.tsx', import.meta.url),
    ),
    'utf8',
  )

  it('no longer spins a torus about its own axis', () => {
    expect(character).not.toMatch(/ring[AB]Ref\.current\.rotation\.z\s*[+-]=/)
  })

  it('spins the parent groups instead, in opposite directions', () => {
    expect(character).toMatch(/spinARef\.current\.rotation\.y\s*\+=/)
    expect(character).toMatch(/spinBRef\.current\.rotation\.y\s*-=/)
  })

  it('keeps the tilt on the mesh, which is where it shows', () => {
    expect(character).toContain('rotation={[Math.PI / 2.6, 0.3, 0]}')
  })
})
