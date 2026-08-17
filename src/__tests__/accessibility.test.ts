import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { QUALITY_TIERS } from '@/types'
import { detectQualityTier, getQualitySettings } from '@/lib/quality'
import { getTransitionPreset } from '@/lib/transitions'
import { NOVA_EXPRESSIONS, toStillExpression } from '@/lib/novaExpressions'
import { NOVA_EMOTIONS, TRANSITION_IDS } from '@/types'
import { hasRtl, latinClass, latinLang } from '@/lib/direction'

/**
 * `prefers-reduced-motion` is honoured in four separate layers — a CSS
 * kill-switch, Motion's `reducedMotion="user"`, pure transformer functions, and
 * a `quality.reducedMotion` flag every 3D world reads. Three of those are
 * covered elsewhere; the fourth was pure trust, because a world that simply
 * forgot to check the flag looks completely normal until someone who needs it
 * turns it on.
 *
 * These suites are the enforcement.
 */

const componentPath = (relative: string) =>
  fileURLToPath(new URL(`../components/${relative}`, import.meta.url))

describe('every 3D world honours reduced motion', () => {
  const dir = componentPath('three/worlds')
  const worlds = readdirSync(dir).filter((f) => f.endsWith('.tsx'))

  it('finds the world modules', () => {
    expect(worlds.length).toBeGreaterThanOrEqual(11)
  })

  /*
    Structural, because there is no DOM here to drive a frame loop through —
    and because the failure is silent. A world that animates unconditionally
    renders perfectly for everyone except the person the setting exists for.
  */
  it.each(
    readdirSync(componentPath('three/worlds')).filter((f) => f.endsWith('.tsx')),
  )('%s checks the flag wherever it animates', (file) => {
    const source = readFileSync(`${dir}/${file}`, 'utf8')
    if (!source.includes('useFrame')) return

    expect(source, `${file} animates without checking reducedMotion`).toMatch(
      /quality\.reducedMotion|reducedMotion:/,
    )
  })
})

describe('the reduced-motion chain holds end to end', () => {
  /* The setting does more than damp animation: it drops the whole render tier,
     which cuts particle counts and shadows too. Someone who asks for less
     motion should not be handed 3,000 drifting points. */
  it('forces the lowest quality tier regardless of hardware', () => {
    const strong = {
      reducedMotion: true,
      renderer: 'NVIDIA GeForce RTX 4090',
      cores: 32,
      memoryGb: 64,
      override: null,
    }
    expect(detectQualityTier(strong)).toBe('low')
  })

  it('hands that tier the smallest particle budget of the three', () => {
    const budgets = QUALITY_TIERS.map((t) => getQualitySettings(t, true))
    const low = getQualitySettings('low', true)
    expect(Math.min(...budgets.map((b) => b.particleBudget))).toBe(
      low.particleBudget,
    )
  })

  it('carries the flag through to the settings every world reads', () => {
    for (const tier of QUALITY_TIERS) {
      expect(getQualitySettings(tier, true).reducedMotion, tier).toBe(true)
      expect(getQualitySettings(tier, false).reducedMotion, tier).toBe(false)
    }
  })

  /* Scene transitions are stripped of movement too — covered in full by
     transitions.test.ts, which walks every preset. Not duplicated here. */
  it('gives every transition a damped variant distinct from the normal one', () => {
    for (const id of TRANSITION_IDS) {
      expect(getTransitionPreset(id, true), id).not.toBe(
        getTransitionPreset(id, false),
      )
    }
  })

  it('stills every NOVA expression without losing what distinguishes it', () => {
    const signatures = NOVA_EMOTIONS.map((emotion) => {
      const still = toStillExpression(NOVA_EXPRESSIONS[emotion])
      expect(still.ringSpeed, emotion).toBe(0)
      expect(still.bobAmplitude, emotion).toBe(0)
      return [still.hue ?? 'accent', still.lensOpenness, still.lensTilt].join('|')
    })
    expect(new Set(signatures).size).toBe(NOVA_EMOTIONS.length)
  })
})

describe('language marking for assistive technology', () => {
  /* The document is lang="ar", so an Arabic voice reads everything unless the
     Latin runs say otherwise — `Password` and `OTP` are exactly the words a
     student most needs to hear correctly. */
  it.each(['ChatGPT', 'GitHub Copilot', 'Password', 'OTP', 'AI Toolbox'])(
    'marks %s as English',
    (value) => {
      expect(latinLang(value)).toBe('en')
      expect(latinClass(value)).toBe('latin')
    },
  )

  it.each(['فهم Code', 'AI مش سحر.', 'Life Coach؟'])(
    'leaves %s to the document language',
    (value) => {
      expect(latinLang(value)).toBeUndefined()
      expect(hasRtl(value)).toBe(true)
    },
  )

  it('always agrees with itself', () => {
    for (const value of ['ChatGPT', 'فهم Code', '', 'OTP', 'مرحبا']) {
      const marked = latinLang(value) === 'en'
      expect(latinClass(value) === 'latin', value).toBe(marked)
    }
  })
})

describe('the canvas is hidden from assistive technology', () => {
  /* No Arabic ever renders inside WebGL — that is a hard project rule — so
     every word on screen is already in the DOM above it. An exposed canvas
     announces itself and can then say nothing. */
  it('marks the canvas layer aria-hidden', () => {
    const source = readFileSync(componentPath('three/ExperienceCanvas.tsx'), 'utf8')
    expect(source).toMatch(/aria-hidden/)
  })
})
