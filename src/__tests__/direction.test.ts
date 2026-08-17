import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { SCENES } from '@/data/scenes'
import {
  BACK_ARROW,
  FORWARD_ARROW,
  hasRtl,
  latinClass,
  resolveTextDir,
} from '@/lib/direction'
import { RTL_SIGN } from '@/lib/transitions'

/**
 * Direction resolution for deck strings. The document is RTL; this decides the
 * exceptions.
 */

describe('detecting Arabic', () => {
  it.each([
    'AI مش سحر.',
    'مش كل شي بيبين حقيقي… حقيقي.',
    'AI صار حوالينا.',
    'فهم Code',
  ])('finds Arabic in %s', (value) => {
    expect(hasRtl(value)).toBe(true)
  })

  it.each([
    'Friend? Life Coach? Secret Keeper?',
    'AI Toolbox',
    'AI + Cybersecurity',
    'GitHub Copilot',
    'Context → Goal → Constraints → Output',
    '',
    '12 / 45',
  ])('finds none in %s', (value) => {
    expect(hasRtl(value)).toBe(false)
  })
})

describe('resolving direction', () => {
  /* The bug this exists for: a trailing ASCII "?" on an all-Latin string takes
     the paragraph direction and renders at the visual left. */
  it('lays out a purely Latin title left to right', () => {
    expect(resolveTextDir('Friend? Life Coach? Secret Keeper?')).toBe('ltr')
  })

  /*
    The regression this exists to prevent. `<bdi>` and `dir="auto"` resolve from
    the first strong character, which for these is the Latin "A" — so they would
    flip a third of the deck's Arabic headlines to LTR and put the full stop on
    the wrong side. Presence of Arabic wins over its position.
  */
  it.each([
    'AI صار حوالينا.',
    'AI مش Trend.',
    'AI للدراسة.',
    'AI للإبداع.',
    'AI للبرمجة.',
    'AI والتعلّم.',
    'AI ومستقبلك.',
    'AI يساعدك أم يستبدلك؟',
    'AI مش قارئ أفكار.',
    'AI كـ Study Companion.',
  ])('keeps %s right to left despite opening in Latin', (title) => {
    expect(resolveTextDir(title)).toBe('rtl')
  })

  it('always returns a concrete direction, never undefined', () => {
    for (const value of ['', 'x', 'ا', '؟', '→']) {
      expect(['rtl', 'ltr']).toContain(resolveTextDir(value))
    }
  })
})

describe('Latin typeface selection', () => {
  it.each([
    'ChatGPT',
    'GitHub Copilot',
    'Images',
    'Password',
    'OTP',
    'Bank information',
    'Study Companion',
    'Quiz Partner',
    'Debugging',
  ])('gives %s Inter’s metrics', (value) => {
    expect(latinClass(value)).toBe('latin')
  })

  /* Mixed strings are Arabic sentences with a technical term inside. Inter's
     metrics would be wrong for the Arabic around it, and font fallback already
     handles the embedded word. */
  it.each(['فهم Code', 'تعلّم Programming', 'AI مش سحر.', 'Prompt ضعيف'])(
    'leaves %s on the Arabic face',
    (value) => {
      expect(latinClass(value)).toBe('')
    },
  )

  /* The Arabic question mark is a strong RTL character, so these stay Arabic
     even though every letter in them is Latin — which is what the deck wants. */
  it.each(['Life Coach؟', 'Secret Keeper؟'])(
    'treats %s as Arabic, on the strength of its ؟',
    (value) => {
      expect(latinClass(value)).toBe('')
    },
  )
})

/**
 * Arrows are not bidi-mirrored by the renderer — only paired punctuation
 * carries Bidi_Mirrored — so an arrow renders exactly as authored whatever the
 * surrounding direction. The choice has to be made in code.
 */
describe('which way forward points', () => {
  it('points left, because left is forward under RTL', () => {
    expect(RTL_SIGN).toBe(-1)
    expect(FORWARD_ARROW).toBe('←')
    expect(BACK_ARROW).toBe('→')
  })

  it('never points the same way as back', () => {
    expect(FORWARD_ARROW).not.toBe(BACK_ARROW)
  })

  /* transitions.ts promises that flipping RTL_SIGN reverses the whole system.
     A hardcoded glyph in a component would quietly break that promise, and an
     arrow pointing the wrong way mid-lesson is worse than no arrow. */
  it('leaves no bare arrow literal in the presenter panel', () => {
    const source = readFileSync(
      fileURLToPath(
        new URL(
          '../components/presentation/PresenterOverlay.tsx',
          import.meta.url,
        ),
      ),
      'utf8',
    )
    const rendered = source
      .split('\n')
      .filter((line) => !line.trimStart().startsWith('//'))
      .filter((line) => !line.trimStart().startsWith('*'))
      .join('\n')

    expect(rendered).not.toMatch(/['"`>][^'"`]*[←→]/)
  })
})

describe('across the whole deck', () => {
  const titles = SCENES.map((s) => s.title)

  /* Every scene title that contains any Arabic must stay RTL — this is the
     assertion that would have caught a naive auto-detection fix. */
  it('keeps every Arabic-bearing title right to left', () => {
    for (const title of titles.filter(hasRtl)) {
      expect(resolveTextDir(title), title).toBe('rtl')
    }
  })

  it('finds the Latin-only titles the deck really has', () => {
    const latinOnly = titles.filter((t) => !hasRtl(t))
    expect(latinOnly).toEqual([
      'AI Toolbox',
      'Friend? Life Coach? Secret Keeper?',
      'AI + Cybersecurity',
    ])
  })
})
