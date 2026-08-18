import { readFileSync, readdirSync } from 'node:fs'

import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { SCENES, SCENE_BY_ID } from '@/data/scenes'
import { getBeatLayout } from '@/lib/beats'
import { getPollWeights } from '@/lib/pollWeights'
import { getMindFormation } from '@/lib/mindFormation'
import { INTERACTION_BY_ID } from '@/data/interactions'
import { INTERACTION_IDS, SCENE_3D_IDS } from '@/types'

describe('poll weights (World 1, Interaction A)', () => {
  it('rests level and low before anything is chosen', () => {
    const resting = getPollWeights(3, null)
    expect(new Set(resting).size).toBe(1)
    expect(resting[0]).toBeLessThan(0.3)
  })

  it.each([0, 1, 2])('gives the chosen option %i full weight', (selected) => {
    const weights = getPollWeights(3, selected)
    expect(weights[selected]).toBe(1)
    expect(weights.filter((_, i) => i !== selected).every((w) => w < 1)).toBe(
      true,
    )
  })

  it('descends the runners-up in declared order', () => {
    expect(getPollWeights(4, 0)).toEqual([1, 0.45, 0.25, 0.15])
  })

  it('still descends the others when the last option wins', () => {
    const weights = getPollWeights(4, 3)
    expect(weights[3]).toBe(1)
    expect(weights[0]).toBeGreaterThan(weights[1])
    expect(weights[1]).toBeGreaterThan(weights[2])
  })

  /* The bars carry relative weight only. Showing invented percentages in a
     lesson about not trusting AI output would model exactly the wrong thing. */
  it('never exceeds 1, so nothing can read as a percentage over 100', () => {
    for (let selected = 0; selected < 6; selected++) {
      expect(getPollWeights(6, selected).every((w) => w <= 1)).toBe(true)
    }
  })

  it('is deterministic', () => {
    expect(getPollWeights(3, 1)).toEqual(getPollWeights(3, 1))
  })

  it('survives zero options and more options than preset weights', () => {
    expect(getPollWeights(0, null)).toEqual([])
    expect(getPollWeights(9, 0).every((w) => w > 0 && w <= 1)).toBe(true)
  })
})

describe('mind formation (World 2)', () => {
  it.each(['not-mind-reader', 'context'])(
    'keeps the brain intact through %s',
    (sceneId) => {
      expect([0, 1, 2, 5].every((b) => getMindFormation(sceneId, b) === 0)).toBe(
        true,
      )
    },
  )

  /*
    Derived from the layout, not pinned to a beat number. The previous version
    asserted `beat 1 === lattice`, which stayed green when the deck added three
    reveal steps and silently moved the dissolve three beats early — the mapping
    was tested in isolation from the scene it describes.
  */
  it('holds the brain through the explanation, then dissolves it as the statement blooms', () => {
    const scene = SCENE_BY_ID.get('not-magic')!
    const { statementBeat, total } = getBeatLayout(scene)
    expect(statementBeat).not.toBeNull()

    for (let beat = 0; beat < statementBeat!; beat++) {
      expect(getMindFormation('not-magic', beat), `beat ${beat}`).toBe(0)
    }
    for (let beat = statementBeat!; beat < total; beat++) {
      expect(getMindFormation('not-magic', beat), `beat ${beat}`).toBe(1)
    }
  })

  it('shows the brain for at least one beat — it must be seen to be broken', () => {
    const scene = SCENE_BY_ID.get('not-magic')!
    expect(getBeatLayout(scene).statementBeat).toBeGreaterThan(0)
  })

  it.each(['how-ai-works', 'why-ai-makes-mistakes'])(
    'leaves %s as machinery — once broken it stays broken',
    (sceneId) => {
      expect([0, 1, 3, 5].every((b) => getMindFormation(sceneId, b) === 1)).toBe(
        true,
      )
    },
  )

  /* The value feeds straight into geometry interpolation, so a NaN would
     corrupt every vertex position. */
  it('always returns a finite value in 0..1, even for unknown scenes', () => {
    const values = [
      getMindFormation('does-not-exist', 0),
      getMindFormation('', 3),
      ...SCENES.flatMap((s) => [0, 1, 2, 5].map((b) => getMindFormation(s.id, b))),
    ]
    expect(
      values.every((v) => Number.isFinite(v) && v >= 0 && v <= 1),
    ).toBe(true)
  })
})

/**
 * The 3D environments are laid out along X so moving between worlds is a real
 * traversal. ExperienceCanvas anchors each world at its camera target, which
 * means every world must be authored around its OWN local origin.
 *
 * A world that anchors itself as well lands at twice the offset and falls
 * outside the frustum — a silently black screen, which is exactly how this was
 * found on World 2. Nothing about a black backdrop fails typecheck, lint or any
 * behavioural test, so the invariant is guarded structurally.
 */
describe('worlds stay in local coordinates', () => {
  const dir = fileURLToPath(new URL('../components/three/worlds', import.meta.url))
  const files = readdirSync(dir).filter((f) => f.endsWith('.tsx'))

  it('finds the world modules', () => {
    expect(files.length).toBeGreaterThan(0)
  })

  it.each(files)('%s does not position itself in world space', (file) => {
    expect(readFileSync(`${dir}/${file}`, 'utf8')).not.toContain('getCameraPose')
  })

  it('does not let PlaceholderScene anchor itself either', () => {
    const placeholder = fileURLToPath(
      new URL('../components/three/PlaceholderScene.tsx', import.meta.url),
    )
    expect(readFileSync(placeholder, 'utf8')).not.toContain('getCameraPose')
  })
})

/**
 * An unbuilt interaction renders a visible "not built yet" note rather than
 * crashing, which is right during construction and wrong on the day.
 *
 * Asserted against the registry's source text, not by importing it: these
 * suites run in Node with no DOM, and importing the registry would drag in
 * every interaction component, React and Motion — which tripled the run time
 * when tried. Same technique as the local-coordinate guard above.
 */
/**
 * A full-screen backdrop-blur costs 4–8ms a frame on integrated graphics,
 * every frame, for 45 minutes — which is why the house surface is opaque. The
 * `glass` variant exists for the dev gallery; this keeps it there.
 */
describe('no backdrop-blur reaches the presentation', () => {
  const dir = fileURLToPath(new URL('../components', import.meta.url))

  const walk = (from: string): string[] =>
    readdirSync(from, { withFileTypes: true }).flatMap((entry) =>
      entry.isDirectory()
        ? walk(`${from}/${entry.name}`)
        : entry.name.endsWith('.tsx')
          ? [`${from}/${entry.name}`]
          : [],
    )

  it('uses the glass surface nowhere but the dev gallery', () => {
    const users = walk(dir)
      .filter((file) => readFileSync(file, 'utf8').includes('surface="glass"'))
      .map((file) => file.split(/[\\/]/).pop())

    expect(users).toEqual(['ComponentGallery.tsx'])
  })
})

/**
 * Every 3D environment now has a real world behind it. `void` is the exception
 * and stays one: it is the deliberate empty backdrop for a statement moment,
 * not something waiting to be built.
 */
describe('3D registry coverage', () => {
  const registry = readFileSync(
    fileURLToPath(
      new URL('../components/three/sceneRegistry.ts', import.meta.url),
    ),
    'utf8',
  )

  it('maps every environment to something other than the placeholder', () => {
    const unbuilt = SCENE_3D_IDS.filter(
      (id) => id !== 'void' && !new RegExp(`\\b${id}:`).test(registry),
    )
    expect(unbuilt).toEqual([])
  })

  it('leaves no scene rendering the placeholder', () => {
    const placeholderOnly = SCENES.filter((s) => s.scene3d === 'void')
    expect(placeholderOnly).toEqual([])
  })
})

describe('interaction registry coverage', () => {
  const registry = readFileSync(
    fileURLToPath(
      new URL(
        '../components/interactions/interactionRegistry.ts',
        import.meta.url,
      ),
    ),
    'utf8',
  )

  it('builds all nine', () => {
    const unbuilt = INTERACTION_IDS.filter(
      (id) => !new RegExp(`['"]?${id}['"]?\\s*:`).test(registry),
    )
    expect(unbuilt).toEqual([])
  })

  /* Complete, but the fallback stays: a missing entry must never take a live
     presentation down over a future edit to that map. */
  it('keeps the map sparse-typed so a gap degrades instead of crashing', () => {
    expect(registry).toMatch(/Partial<\s*\n?\s*Record<InteractionId/)
  })
})

describe('World 1 shape', () => {
  const world1 = SCENES.filter((s) => s.world === 'ai-world')

  it('runs 5 scenes over 5 minutes', () => {
    expect(world1).toHaveLength(5)
    expect(world1.reduce((sum, s) => sum + s.durationSec, 0)).toBe(300)
  })

  it('opens on a cinematic and closes on a statement', () => {
    expect(world1[0].type).toBe('cinematic')
    expect(world1[4].type).toBe('statement')
  })

  it('splits its 3D between the opening and the timeline', () => {
    expect(world1.slice(0, 3).every((s) => s.scene3d === 'opening')).toBe(true)
    expect(world1.slice(3).every((s) => s.scene3d === 'aiHistory')).toBe(true)
  })

  it('covers the opening poll with number keys 1-3', () => {
    expect(world1[1].interaction).toBe('opening-poll')
    expect(INTERACTION_BY_ID['opening-poll'].options).toHaveLength(3)
  })
})

describe('World 2 shape', () => {
  const world2 = SCENES.filter((s) => s.world === 'ai-lab')

  it('runs 5 scenes over 8 minutes', () => {
    expect(world2).toHaveLength(5)
    expect(world2.reduce((sum, s) => sum + s.durationSec, 0)).toBe(480)
  })

  it('uses one environment throughout, so the dissolve reads as continuous', () => {
    expect(world2.every((s) => s.scene3d === 'aiMind')).toBe(true)
  })

  /* The deck answers the question outright rather than offering candidate
     reasons to pick between. An earlier design fanned out four possibilities;
     if they ever reappear, the deck did not put them there. */
  it('gives the mind reader the statement and the deck’s flat answer', () => {
    const mindReader = INTERACTION_BY_ID['mind-reader']
    expect(mindReader.kind).toBe('reveal')
    expect(mindReader.options.map((o) => o.id)).toEqual(['statement', 'answer'])
    expect(mindReader.options[1].label).toBe('لا.')
    expect(
      mindReader.options.some((o) => o.id.startsWith('possibility-')),
    ).toBe(false)
  })
})

/**
 * The accent light has to travel with the scene.
 *
 * It is what carries each world's colour, and it spent the whole project at a
 * fixed world position with a 30-unit falloff while the environments run out to
 * x = 110 — so for 23 of the 33 scenes it lit nothing. Rendered inside the
 * anchor group its position is local and it follows the scene, which is what its
 * comment always claimed.
 *
 * The reverse mistake is worse and is guarded too: a *directional* light shines
 * toward its target, and the target defaults to the world origin, so moving one
 * into the group would swing its direction to almost entirely −X and light every
 * distant world edge-on.
 */
describe('the accent light travels with the scene', () => {
  const read = (relative: string) =>
    readFileSync(
      fileURLToPath(new URL(`../components/${relative}`, import.meta.url)),
      'utf8',
    )

  const lighting = read('three/Lighting.tsx')
  const canvas = read('three/ExperienceCanvas.tsx')

  it('keeps the point light out of the fixed rig', () => {
    const rig = lighting.slice(
      lighting.indexOf('export function Lighting'),
      lighting.indexOf('export function AccentLight'),
    )
    expect(rig).not.toContain('pointLight')
    expect(rig.length).toBeGreaterThan(100)
  })

  it('keeps the directional lights in the fixed rig', () => {
    const accent = lighting.slice(lighting.indexOf('export function AccentLight'))
    expect(accent).not.toContain('directionalLight')
    expect(lighting).toContain('directionalLight')
  })

  it('renders the accent light inside the anchor group', () => {
    const group = canvas.slice(
      canvas.indexOf('<group position={getCameraPose'),
      canvas.indexOf('</group>'),
    )
    expect(group).toContain('<AccentLight')
  })

  it('does not leave an accent outside the group as well', () => {
    // Two accent lights would double the intensity in whichever world happened
    // to be near the origin.
    expect(canvas.match(/<AccentLight/g)).toHaveLength(1)
    expect(canvas).toContain('<Lighting quality={quality} />')
  })
})
