import { describe, expect, it } from 'vitest'
import {
  detectQualityTier,
  getQualitySettings,
  isQualityTier,
  type HardwareProbe,
} from '@/lib/quality'
import { CAMERA_POSES, getCameraPose } from '@/lib/cameraPoses'
import { makeRandom, seedFromString } from '@/lib/random'
import { SCENES } from '@/data/scenes'
import { QUALITY_TIERS, SCENE_3D_IDS } from '@/types'

const probe = (over: Partial<HardwareProbe> = {}): HardwareProbe => ({
  renderer: 'ANGLE (NVIDIA GeForce RTX 3060 Direct3D11 vs_5_0 ps_5_0)',
  cores: 8,
  memoryGb: 8,
  reducedMotion: false,
  override: null,
  ...over,
})

describe('quality tier detection', () => {
  it('gives a discrete GPU the high tier', () => {
    expect(detectQualityTier(probe())).toBe('high')
  })

  it.each(['SwiftShader', 'llvmpipe', 'Microsoft Basic Render Driver'])(
    'drops the software renderer %s to low',
    (renderer) => {
      expect(detectQualityTier(probe({ renderer }))).toBe('low')
    },
  )

  it.each([
    'Intel(R) HD Graphics 620',
    'ANGLE (Intel, Intel(R) UHD Graphics 630 Direct3D11)',
  ])('caps integrated graphics (%s) at medium', (renderer) => {
    expect(detectQualityTier(probe({ renderer }))).toBe('medium')
  })

  it('forces low when the user asked for reduced motion', () => {
    expect(detectQualityTier(probe({ reducedMotion: true }))).toBe('low')
  })

  it.each(QUALITY_TIERS)(
    'lets an explicit %s override beat both hardware and reduced motion',
    (tier) => {
      expect(
        detectQualityTier(probe({ renderer: 'SwiftShader', override: tier })),
      ).toBe(tier)
      expect(
        detectQualityTier(probe({ reducedMotion: true, override: tier })),
      ).toBe(tier)
    },
  )

  it('caps on low core or memory counts', () => {
    expect(detectQualityTier(probe({ cores: 2 }))).toBe('low')
    expect(detectQualityTier(probe({ cores: 4 }))).toBe('medium')
    expect(detectQualityTier(probe({ memoryGb: 2 }))).toBe('low')
    expect(detectQualityTier(probe({ memoryGb: 4 }))).toBe('medium')
  })

  it('lets the weakest signal win', () => {
    expect(detectQualityTier(probe({ cores: 2 }))).toBe('low')
  })

  it('stays conservative rather than optimistic when it learns nothing', () => {
    const blind: HardwareProbe = {
      renderer: null,
      cores: null,
      memoryGb: null,
      reducedMotion: false,
      override: null,
    }
    expect(() => detectQualityTier(blind)).not.toThrow()
    expect(detectQualityTier(blind)).toBe('medium')
    expect(detectQualityTier(probe({ renderer: '' }))).toBe('medium')
  })
})

describe('quality settings', () => {
  const settings = QUALITY_TIERS.map((t) => getQualitySettings(t, false))

  it.each(QUALITY_TIERS)('keeps %s within sane bounds', (tier) => {
    const s = getQualitySettings(tier, false)
    expect(s.dpr[0]).toBeLessThanOrEqual(s.dpr[1])
    expect(s.dpr[1]).toBeLessThanOrEqual(2)
    expect(s.particleBudget).toBeGreaterThan(0)
    expect(s.postProcessing).toBe(false)
  })

  it('scales budgets upward with the tier', () => {
    expect(settings.map((s) => s.particleBudget)).toEqual([400, 1200, 3000])
    expect(settings[0].dpr[1]).toBeLessThanOrEqual(settings[1].dpr[1])
    expect(settings[1].dpr[1]).toBeLessThanOrEqual(settings[2].dpr[1])
  })

  it('enables shadows only on high', () => {
    expect(settings.map((s) => s.shadows)).toEqual([false, false, true])
  })

  it('carries the reducedMotion flag through', () => {
    expect(getQualitySettings('high', true).reducedMotion).toBe(true)
  })
})

describe('isQualityTier', () => {
  it('accepts real tiers and rejects everything else', () => {
    expect(isQualityTier('low')).toBe(true)
    expect(isQualityTier('ultra')).toBe(false)
    expect(isQualityTier(null)).toBe(false)
    expect(isQualityTier(42)).toBe(false)
  })
})

describe('camera poses', () => {
  it('covers every 3D scene id with no orphans', () => {
    expect(SCENE_3D_IDS.every((id) => CAMERA_POSES[id])).toBe(true)
    expect(Object.keys(CAMERA_POSES)).toHaveLength(SCENE_3D_IDS.length)
  })

  it('resolves every scene in the deck', () => {
    expect(SCENES.every((s) => getCameraPose(s.scene3d))).toBe(true)
  })

  it('uses finite coordinates and a usable field of view', () => {
    for (const id of SCENE_3D_IDS) {
      const pose = CAMERA_POSES[id]
      expect([...pose.position, ...pose.target].every(Number.isFinite)).toBe(true)
      expect(pose.fov).toBeGreaterThan(20)
      expect(pose.fov).toBeLessThan(90)
    }
  })

  it('never places the camera exactly on its own target', () => {
    for (const id of SCENE_3D_IDS) {
      const pose = CAMERA_POSES[id]
      expect(pose.position.some((v, i) => v !== pose.target[i])).toBe(true)
    }
  })
})

describe('seeded randomness', () => {
  it('repeats exactly for the same seed, so scenes look identical every run', () => {
    const a = makeRandom(seedFromString('aiMind'))
    const b = makeRandom(seedFromString('aiMind'))
    expect(Array.from({ length: 20 }, () => a())).toEqual(
      Array.from({ length: 20 }, () => b()),
    )
  })

  it('diverges for different seeds', () => {
    expect(makeRandom(seedFromString('toolCity'))()).not.toBe(
      makeRandom(seedFromString('aiMind'))(),
    )
  })

  it('stays in range and distributes roughly evenly', () => {
    const random = makeRandom(7)
    const samples = Array.from({ length: 2000 }, () => random())
    expect(samples.every((v) => v >= 0 && v < 1)).toBe(true)
    const mean = samples.reduce((sum, v) => sum + v, 0) / samples.length
    expect(mean).toBeCloseTo(0.5, 1)
  })
})
