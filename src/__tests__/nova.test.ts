import { describe, expect, it } from 'vitest'
import {
  NOVA_EXPRESSIONS,
  getExpression,
  toStillExpression,
  type NovaExpression,
} from '@/lib/novaExpressions'
import { NOVA_EMOTIONS } from '@/types'

describe('expression coverage', () => {
  it('defines all 12 states with no orphans', () => {
    expect(NOVA_EMOTIONS).toHaveLength(12)
    expect(NOVA_EMOTIONS.every((e) => NOVA_EXPRESSIONS[e])).toBe(true)
    expect(Object.keys(NOVA_EXPRESSIONS)).toHaveLength(NOVA_EMOTIONS.length)
  })

  it('falls back to idle rather than crashing on an unknown emotion', () => {
    expect(getExpression('nonsense' as never)).toBe(NOVA_EXPRESSIONS.idle)
  })
})

describe('parameter ranges', () => {
  it.each(NOVA_EMOTIONS)('keeps %s within usable bounds', (emotion) => {
    const e = NOVA_EXPRESSIONS[emotion]
    expect(e.lensOpenness).toBeGreaterThanOrEqual(0)
    expect(e.lensOpenness).toBeLessThanOrEqual(1)
    expect(e.bobAmplitude).toBeGreaterThanOrEqual(0)
    expect(e.bobSpeed).toBeGreaterThanOrEqual(0)
    expect(e.ringSeparation).toBeGreaterThan(0)
    expect(e.pulse).toBeGreaterThan(0)
    expect(Number.isFinite(e.lensTilt)).toBe(true)
    expect(Number.isFinite(e.ringSpeed)).toBe(true)
  })

  it('never seals the lens shut on a state meant to be held', () => {
    const visible = NOVA_EMOTIONS.filter((e) => e !== 'blink')
    expect(visible.every((e) => NOVA_EXPRESSIONS[e].lensOpenness > 0.1)).toBe(
      true,
    )
  })
})

describe('burst discipline', () => {
  it('bursts only on celebrate — a burst on every change would exhaust a class', () => {
    const bursting = NOVA_EMOTIONS.filter((e) => NOVA_EXPRESSIONS[e].burst)
    expect(bursting).toEqual(['celebrate'])
  })
})

describe('every state is distinguishable', () => {
  const signature = (e: NovaExpression) =>
    [
      e.hue ?? 'accent',
      e.lensOpenness,
      e.lensTilt,
      e.ringSpeed,
      e.ringSeparation,
      e.bobAmplitude,
      e.bobSpeed,
      e.pulse,
    ].join('|')

  it('gives no two emotions the same parameter set', () => {
    const signatures = NOVA_EMOTIONS.map((e) => signature(NOVA_EXPRESSIONS[e]))
    expect(new Set(signatures).size).toBe(signatures.length)
  })

  /* A washed-out projector can flatten hue, so meaning must also live in shape
     and motion — the same rule ChoiceCard follows for its verdicts. */
  const shapeOnly = (e: NovaExpression) =>
    [e.lensOpenness, e.lensTilt, e.ringSpeed, e.ringSeparation, e.bobSpeed].join(
      '|',
    )

  it.each([
    ['warning', 'happy'],
    ['sad', 'happy'],
    ['warning', 'celebrate'],
    ['thinking', 'confused'],
    ['surprised', 'idle'],
  ] as const)('tells %s from %s without relying on colour', (a, b) => {
    expect(shapeOnly(NOVA_EXPRESSIONS[a])).not.toBe(
      shapeOnly(NOVA_EXPRESSIONS[b]),
    )
  })
})

describe('reduced motion', () => {
  it.each(NOVA_EMOTIONS)('stills %s completely', (emotion) => {
    const still = toStillExpression(NOVA_EXPRESSIONS[emotion])
    expect(still.ringSpeed).toBe(0)
    expect(still.bobAmplitude).toBe(0)
    expect(still.bobSpeed).toBe(0)
    expect(still.burst).toBe(false)
    expect(still.blinks).toBe(false)
  })

  it('keeps lens shape, tilt, hue and pulse intact', () => {
    for (const emotion of NOVA_EMOTIONS) {
      const original = NOVA_EXPRESSIONS[emotion]
      const still = toStillExpression(original)
      expect(still.lensOpenness).toBe(original.lensOpenness)
      expect(still.lensTilt).toBe(original.lensTilt)
      expect(still.hue).toBe(original.hue)
      expect(still.pulse).toBe(original.pulse)
    }
  })

  it('leaves all 12 mutually distinguishable even when completely still', () => {
    const signatures = NOVA_EMOTIONS.map((e) => {
      const s = toStillExpression(NOVA_EXPRESSIONS[e])
      return [s.hue ?? 'accent', s.lensOpenness, s.lensTilt, s.ringSeparation, s.pulse].join('|')
    })
    expect(new Set(signatures).size).toBe(NOVA_EMOTIONS.length)
  })
})

describe('world integration', () => {
  it('lets most states take on the current world’s accent', () => {
    const inheriting = NOVA_EMOTIONS.filter(
      (e) => NOVA_EXPRESSIONS[e].hue === null,
    )
    expect(inheriting.length).toBeGreaterThanOrEqual(7)
  })

  it('overrides hue only for the semantic states', () => {
    for (const emotion of ['happy', 'warning', 'sad', 'celebrate'] as const) {
      expect(NOVA_EXPRESSIONS[emotion].hue).not.toBeNull()
    }
  })
})
