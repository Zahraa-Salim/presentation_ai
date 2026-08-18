import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { SCENES } from '@/data/scenes'
import type { SceneContent, SceneDef, SceneType } from '@/types'

/**
 * Every field of Arabic a scene carries must be drawn by the component that
 * renders that scene.
 *
 * `deckFidelity.test.ts` proves the data matches the deck. Nothing proved the
 * *components* draw the data — and that gap has already cost a live defect:
 * scene 27 listed five Cybersecurity threats that `InteractiveScene` never
 * rendered, so five presses did visibly nothing in front of a class and five
 * lines of the deck reached no screen at all. Typecheck, lint and every other
 * test passed throughout.
 *
 * The check is structural, because these suites run in Node with no DOM: for
 * each scene, resolve the component that renders it, then assert its source
 * names every content field that scene actually populates.
 */

const source = (relative: string) =>
  readFileSync(fileURLToPath(new URL(`../${relative}`, import.meta.url)), 'utf8')

const DEFAULTS: Record<SceneType, string> = {
  explain: 'scenes/defaults/ExplainScene.tsx',
  statement: 'scenes/defaults/StatementScene.tsx',
  interactive: 'scenes/defaults/InteractiveScene.tsx',
  cinematic: 'scenes/defaults/CinematicScene.tsx',
}

/** Mirrors SCENE_COMPONENTS. Kept honest by the first test below. */
const OVERRIDES: Record<string, string> = {
  'ai-is-not-new': 'scenes/ai-world/HistoryScene.tsx',
  'how-ai-works': 'scenes/ai-lab/HowAiWorksScene.tsx',
  'ai-cybersecurity': 'scenes/privacy/CyberScene.tsx',
}

/** `pacing` is a directive to the beat model, not copy — it draws nothing. */
const NOT_RENDERED: readonly (keyof SceneContent)[] = ['pacing']

const rendererFor = (scene: SceneDef) =>
  OVERRIDES[scene.id] ?? DEFAULTS[scene.type]

const populatedKeys = (scene: SceneDef) =>
  (Object.keys(scene.content) as (keyof SceneContent)[]).filter((key) => {
    if (NOT_RENDERED.includes(key)) return false
    const value = scene.content[key]
    if (Array.isArray(value)) return value.length > 0
    return value !== undefined && value !== ''
  })

describe('every scene is rendered by a component that reads it', () => {
  it('the override list here matches the one the app uses', () => {
    // Otherwise a new per-scene renderer would be silently checked against the
    // default it replaced, which is the exact blind spot this suite exists for.
    const registry = source('scenes/sceneComponents.ts')
    for (const id of Object.keys(OVERRIDES)) {
      expect(registry, `${id} is not registered`).toContain(`'${id}':`)
    }
    const registered = [...registry.matchAll(/^\s+'([a-z0-9-]+)':\s/gm)].map(
      (m) => m[1],
    )
    expect(registered.sort()).toEqual(Object.keys(OVERRIDES).sort())
  })

  it.each(SCENES.map((scene) => [scene.index, scene.id, scene] as const))(
    'scene %i · %s draws every field it carries',
    (_index, _id, scene) => {
      const text = source(rendererFor(scene))

      for (const key of populatedKeys(scene)) {
        expect(
          text,
          `${rendererFor(scene)} never reads content.${key}, so scene ${scene.index} carries Arabic that reaches no screen`,
        ).toContain(key)
      }
    },
  )

  it('is actually checking something — the deck populates seven distinct fields', () => {
    const seen = new Set(SCENES.flatMap(populatedKeys))
    expect(seen.size).toBeGreaterThanOrEqual(7)
  })
})

describe('the finale shows all of its copy', () => {
  /* Scene 33 is the one scene whose `statement` and `title` are the same
     string. CinematicScene prints the title and then deliberately suppresses
     the statement, because rendering both put the closing line on screen
     twice. Pinned so a future edit to either cannot silently drop it. */
  const finale = SCENES[SCENES.length - 1]

  it('has no headline, so its title is what renders', () => {
    expect(finale.content.headline).toBeUndefined()
    expect(finale.title).toBe('خلي AI يساعدك، مش يفكّر بدالك.')
  })

  it('says the closing line once, not twice', () => {
    expect(finale.content.statement).toBe(finale.title)
    expect(source('scenes/defaults/CinematicScene.tsx')).toContain(
      'statement !== displayed',
    )
  })

  it('carries four closing lines and a note, all of which render', () => {
    expect(finale.content.steps).toHaveLength(4)
    expect(finale.content.note).toBeTruthy()

    const text = source('scenes/defaults/CinematicScene.tsx')
    expect(text).toContain('steps.map')
    expect(text).toContain('note')
  })

  it('sets its closing lines one size up', () => {
    // They are the last thing the class reads, over a full-screen 3D backdrop.
    expect(source('scenes/defaults/CinematicScene.tsx')).toContain(
      'scale="cinematic"',
    )
  })
})
