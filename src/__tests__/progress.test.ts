import { describe, expect, it } from 'vitest'
import { SCENES } from '@/data/scenes'
import { WORLDS } from '@/data/worlds'
import { getSegmentFill, getWorldSegments } from '@/lib/progress'

const segments = getWorldSegments()

describe('world segments', () => {
  it('produces one per world, in presentation order', () => {
    expect(segments).toHaveLength(5)
    expect(segments.map((s) => s.world.id)).toEqual(WORLDS.map((w) => w.id))
  })

  it('splits the deck 5 / 5 / 11 / 7 / 5', () => {
    expect(segments.map((s) => s.sceneCount)).toEqual([5, 5, 11, 7, 5])
  })

  it('accounts for all 33 scenes', () => {
    expect(segments.reduce((sum, s) => sum + s.sceneCount, 0)).toBe(
      SCENES.length,
    )
  })
})

describe('segment ranges', () => {
  it('chains without gaps or overlap', () => {
    let expectedStart = 0
    for (const segment of segments) {
      expect(segment.startIndex).toBe(expectedStart)
      expect(segment.endIndex).toBe(segment.startIndex + segment.sceneCount - 1)
      expectedStart = segment.endIndex + 1
    }
    expect(expectedStart).toBe(SCENES.length)
  })

  it('places every scene in exactly one segment', () => {
    SCENES.forEach((_, index) => {
      const owning = segments.filter(
        (s) => index >= s.startIndex && index <= s.endIndex,
      )
      expect(owning).toHaveLength(1)
    })
  })

  it('matches each range against the scenes’ actual world', () => {
    for (const segment of segments) {
      const slice = SCENES.slice(segment.startIndex, segment.endIndex + 1)
      expect(slice.every((s) => s.world === segment.world.id)).toBe(true)
    }
  })
})

describe('weights', () => {
  it('sums to exactly 1', () => {
    const total = segments.reduce((sum, s) => sum + s.weight, 0)
    expect(total).toBeCloseTo(1, 10)
  })

  it('gives every world a positive share', () => {
    expect(segments.every((s) => s.weight > 0)).toBe(true)
  })
})

describe('fill behaviour', () => {
  const [first, second, , , fifth] = segments

  it('leaves a world that has not been reached empty', () => {
    expect(getSegmentFill(second, 0)).toBe(0)
  })

  it('fills a world that has been passed completely', () => {
    expect(getSegmentFill(first, 5)).toBe(1)
    expect(getSegmentFill(first, first.endIndex)).toBe(1)
  })

  it('fills the current world scene by scene', () => {
    expect(getSegmentFill(first, 0)).toBeGreaterThan(0)
    expect(getSegmentFill(first, 0)).toBeLessThan(1)
    expect(getSegmentFill(fifth, fifth.startIndex)).toBeCloseTo(
      1 / fifth.sceneCount,
    )
  })

  it('shows only the first world filled on scene 1', () => {
    expect(segments.filter((s) => getSegmentFill(s, 0) > 0)).toHaveLength(1)
  })

  it('fills every segment by the final scene', () => {
    expect(
      segments.every((s) => getSegmentFill(s, SCENES.length - 1) === 1),
    ).toBe(true)
  })

  it('never decreases as the deck advances, and stays within 0..1', () => {
    for (const segment of segments) {
      let previous = -1
      SCENES.forEach((_, index) => {
        const fill = getSegmentFill(segment, index)
        expect(fill).toBeGreaterThanOrEqual(previous)
        expect(fill).toBeGreaterThanOrEqual(0)
        expect(fill).toBeLessThanOrEqual(1)
        previous = fill
      })
    }
  })
})
