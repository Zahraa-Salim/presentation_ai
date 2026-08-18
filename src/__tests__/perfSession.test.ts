import { beforeEach, describe, expect, it } from 'vitest'
import {
  MAX_PLAUSIBLE_FRAME_SEC,
  formatPerfSummary,
  isPlausibleFrame,
  readPerfSummary,
  recordPerfSample,
  resetPerfSession,
} from '@/lib/perfSession'

/**
 * The rehearsal's frame-rate accumulator.
 *
 * Worth testing despite being an instrument rather than a feature: it is the
 * only thing producing the numbers Task 27 has been waiting on, and a summary
 * that quietly averages two worlds together would send the polish pass at the
 * wrong one.
 */
describe('perfSession', () => {
  beforeEach(() => {
    resetPerfSession()
  })

  /* The first rehearsal reported a 198-second worst frame and 0 fps in two
     worlds. Neither was a stall: requestAnimationFrame pauses when the tab is
     hidden, and the frame after reports the whole absence as one delta. */
  describe('frames the browser never drew', () => {
    it.each([16.6 / 1000, 0.033, 0.113, 0.6, MAX_PLAUSIBLE_FRAME_SEC])(
      'counts %ss as a real frame',
      (delta) => {
        expect(isPlausibleFrame(delta)).toBe(true)
      },
    )

    it.each([1.01, 9.7423, 28.1521, 198.8448])(
      'rejects %ss — that is an absence, not a frame',
      (delta) => {
        expect(isPlausibleFrame(delta)).toBe(false)
      },
    )

    it('rejects a zero or negative delta', () => {
      expect(isPlausibleFrame(0)).toBe(false)
      expect(isPlausibleFrame(-1)).toBe(false)
    })
  })

  it('records nothing before the first sample', () => {
    expect(readPerfSummary()).toEqual([])
  })

  it('averages fps across the windows recorded in a world', () => {
    recordPerfSample('ai-world', { fps: 60, worstFrameMs: 17, calls: 40 })
    recordPerfSample('ai-world', { fps: 50, worstFrameMs: 17, calls: 40 })

    const [stats] = readPerfSummary()
    expect(stats.samples).toBe(2)
    expect(stats.avgFps).toBe(55)
  })

  it('keeps the minimum fps rather than only the average', () => {
    // The point of the whole instrument: a world that averages fine but drops
    // hard at one moment is a world with a stutter, and the average hides it.
    recordPerfSample('ai-lab', { fps: 60, worstFrameMs: 17, calls: 40 })
    recordPerfSample('ai-lab', { fps: 24, worstFrameMs: 42, calls: 40 })
    recordPerfSample('ai-lab', { fps: 60, worstFrameMs: 17, calls: 40 })

    const [stats] = readPerfSummary()
    expect(stats.minFps).toBe(24)
    expect(stats.maxFps).toBe(60)
    expect(stats.avgFps).toBe(48)
  })

  it('keeps the worst single frame and the highest draw-call count', () => {
    recordPerfSample('study-lab', { fps: 60, worstFrameMs: 16.6, calls: 51 })
    recordPerfSample('study-lab', { fps: 58, worstFrameMs: 38.2, calls: 44 })

    const [stats] = readPerfSummary()
    expect(stats.worstFrameMs).toBe(38.2)
    expect(stats.maxCalls).toBe(51)
  })

  it('keeps worlds separate', () => {
    recordPerfSample('privacy', { fps: 60, worstFrameMs: 17, calls: 30 })
    recordPerfSample('future', { fps: 30, worstFrameMs: 34, calls: 90 })

    const summary = readPerfSummary()
    expect(summary).toHaveLength(2)
    expect(summary.find((s) => s.worldId === 'privacy')?.avgFps).toBe(60)
    expect(summary.find((s) => s.worldId === 'future')?.avgFps).toBe(30)
  })

  it('reports worlds in the order they were first entered', () => {
    // Traversal order, so the table reads the way the deck was walked.
    recordPerfSample('future', { fps: 60, worstFrameMs: 17, calls: 30 })
    recordPerfSample('ai-world', { fps: 60, worstFrameMs: 17, calls: 30 })
    recordPerfSample('future', { fps: 58, worstFrameMs: 18, calls: 30 })

    expect(readPerfSummary().map((s) => s.worldId)).toEqual([
      'future',
      'ai-world',
    ])
  })

  it('reset clears everything, so a second run is not polluted by the first', () => {
    recordPerfSample('ai-world', { fps: 60, worstFrameMs: 17, calls: 30 })
    resetPerfSession()
    expect(readPerfSummary()).toEqual([])
  })

  it('rounds the average to one decimal', () => {
    recordPerfSample('ai-world', { fps: 59, worstFrameMs: 17, calls: 30 })
    recordPerfSample('ai-world', { fps: 60, worstFrameMs: 17, calls: 30 })
    recordPerfSample('ai-world', { fps: 60, worstFrameMs: 17, calls: 30 })

    expect(readPerfSummary()[0].avgFps).toBe(59.7)
  })

  describe('formatPerfSummary', () => {
    it('says so plainly when no frames were recorded', () => {
      expect(formatPerfSummary(readPerfSummary(), 'ctx')).toBe(
        'No frames recorded.',
      )
    })

    it('produces a column-aligned table with the context line on top', () => {
      recordPerfSample('ai-world', { fps: 60, worstFrameMs: 17, calls: 30 })
      recordPerfSample('study-lab', { fps: 48, worstFrameMs: 41, calls: 62 })

      const text = formatPerfSummary(readPerfSummary(), 'high · dpr 2 · 1366×768')
      const lines = text.split('\n')

      expect(lines[0]).toBe('high · dpr 2 · 1366×768')
      expect(lines[2]).toContain('world')
      expect(lines[2]).toContain('worst ms')
      expect(text).toContain('ai-world')
      expect(text).toContain('study-lab')

      // Aligned: every world name padded to the widest, so the numbers line up
      // when pasted into notes.
      const worldRows = lines.slice(3)
      expect(worldRows[0].indexOf('60')).toBe(worldRows[1].indexOf('48'))
    })

    it('never leaves trailing whitespace on a row', () => {
      recordPerfSample('ai-world', { fps: 60, worstFrameMs: 17, calls: 30 })
      const text = formatPerfSummary(readPerfSummary(), 'ctx')
      for (const line of text.split('\n')) {
        expect(line).toBe(line.trimEnd())
      }
    })
  })
})
