import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { SCENES } from '@/data/scenes'
import { INTERACTIONS } from '@/data/interactions'
import { AI_HISTORY } from '@/data/aiHistory'
import { AI_PIPELINE } from '@/data/aiPipeline'
import { CORE_RULES } from '@/data/coreRules'
import { isTodo } from '@/lib/todo'

/**
 * A two-way string diff between the source deck and `src/data/`.
 *
 * Every other content test checks that the data is *well formed*. None of them
 * could see whether it is *the deck's*. Two real defects got through as a
 * result: five Cybersecurity threats were dropped during the merge and nobody
 * noticed, and thirteen English column headings were invented by promoting the
 * deck's JSON field names to display copy. Both are exactly what this catches.
 *
 * Direction 1 — deck → code: a line in the deck that reaches no screen.
 * Direction 2 — code → deck: a line on screen that the deck never wrote.
 *
 * Comparison is on normalised strings, ignoring ids, keys, structure and
 * trailing punctuation, so the deck can be re-cut without this becoming noise.
 */

const root = new URL('../../', import.meta.url)
const readJson = (name: string) =>
  JSON.parse(readFileSync(fileURLToPath(new URL(name, root)), 'utf8'))

/** The deck as supplied. */
const deck = readJson('content.json')
/** Headings and speaker notes, authored separately when the deck lacked them. */
const authored = readJson('content-2.json')

/*
  Trailing punctuation differs freely between a title and a reference to it —
  scene 7's column heading is scene 16's title without its full stop — so it is
  normalised away. Everything else must match character for character.
*/
const normalise = (value: string) =>
  value
    .normalize('NFC')
    .replace(/\s+/g, ' ')
    .replace(/[.،؟!…:]+$/u, '')
    .trim()

const collect = (values: (string | undefined)[]) =>
  new Set(
    values
      .filter((v): v is string => typeof v === 'string' && v.length > 0)
      .filter((v) => !isTodo(v))
      .map(normalise)
      .filter((v) => v.length > 0),
  )

/* ── the deck ─────────────────────────────────────────────────────────────── */

/** Keys that carry structure rather than copy. */
const STRUCTURAL = new Set(['id', 'number', 'type', 'year'])

function harvest(node: unknown, into: string[]): void {
  if (typeof node === 'string') {
    into.push(node)
    return
  }
  if (Array.isArray(node)) {
    node.forEach((child) => harvest(child, into))
    return
  }
  if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) {
      if (STRUCTURAL.has(key)) continue
      harvest(value, into)
    }
  }
}

const deckStrings = (() => {
  const out: string[] = []
  // `meta` and `contentStyle` describe the deck; they are not lines in it.
  for (const world of deck.worlds) harvest(world.scenes, out)
  harvest(deck.coreRules, out)
  return collect(out)
})()

const authoredStrings = collect([
  ...Object.values(authored.groupLabels as Record<string, string>),
  ...Object.values(
    authored.speakerNotes as Record<string, string[]>,
  ).flat(),
])

/** Everything the author has written down anywhere. */
const sourceStrings = new Set([...deckStrings, ...authoredStrings])

/* ── the code ─────────────────────────────────────────────────────────────── */

const codeStrings = collect([
  ...SCENES.flatMap((s) => [
    s.title,
    s.content.headline,
    s.content.subheadline,
    s.content.example,
    s.content.statement,
    s.content.keyMessage,
    s.content.note,
    ...(s.content.steps?.flatMap((step) => [step.text, step.label]) ?? []),
    ...(s.content.groups?.flatMap((g) => [g.label, ...g.items]) ?? []),
    ...s.speakerNotes,
  ]),
  ...INTERACTIONS.flatMap((i) => [
    i.promptAr,
    ...i.options.map((o) => o.label),
    ...i.options.map((o) => o.caption),
    ...i.facilitationAr,
  ]),
  ...AI_HISTORY.flatMap((m) => [m.label, m.captionAr]),
  ...AI_PIPELINE.flatMap((s) => [s.label, s.captionAr]),
  ...CORE_RULES.flatMap((r) => [r.title, r.body]),
])

/* ── documented exceptions ────────────────────────────────────────────────── */

/**
 * On screen but not in the deck. Every entry needs a reason; an entry without
 * one is an invented line waiting to be found.
 */
const CODE_ONLY = new Map<string, string>([
  [
    normalise('مين الحقيقي؟'),
    'Real-or-Fake prompt. Predates content.json — it comes from the original brief, and the deck supplies no replacement. Its two options are still TODO.',
  ],
  [
    normalise('Context → Goal → Constraints → Output'),
    'Scene 18 subheadline, and the scene title before the deck landed. The deck names the four stages separately as step labels but never as this formula. Kept deliberately: it is the memorable form, and its rightward arrows are correct because the string renders as an LTR island.',
  ],
])

/**
 * In the deck but on no screen. Should stay empty: anything here is content
 * the author wrote and the audience never sees.
 */
const DECK_ONLY = new Map<string, string>([])

/* ── the assertions ───────────────────────────────────────────────────────── */

describe('code says nothing the deck did not', () => {
  it('renders no invented copy', () => {
    const invented = [...codeStrings]
      .filter((s) => !sourceStrings.has(s))
      .filter((s) => !CODE_ONLY.has(s))

    expect(
      invented,
      `Not written by the author:\n${invented.map((s) => `  · ${s}`).join('\n')}`,
    ).toEqual([])
  })

  it('keeps every exception justified', () => {
    for (const [value, reason] of CODE_ONLY) {
      expect(reason.length, value).toBeGreaterThan(30)
      // An exception for a string that is now in the deck is dead weight.
      expect(sourceStrings.has(value), `${value} is in the deck now`).toBe(false)
    }
  })
})

describe('the deck reaches the screen', () => {
  it('drops nothing the author wrote', () => {
    const dropped = [...deckStrings]
      .filter((s) => !codeStrings.has(s))
      .filter((s) => !DECK_ONLY.has(s))

    expect(
      dropped,
      `Written but never shown:\n${dropped.map((s) => `  · ${s}`).join('\n')}`,
    ).toEqual([])
  })
})

describe('the diff is actually looking at something', () => {
  /* A normalisation bug that emptied either set would make both assertions
     above pass vacuously. */
  it('found copy on both sides', () => {
    expect(deckStrings.size).toBeGreaterThan(150)
    expect(codeStrings.size).toBeGreaterThan(150)
  })

  it('found the lines the two known defects involved', () => {
    for (const threat of ['Phishing', 'Deepfakes', 'Impersonation']) {
      expect(deckStrings.has(normalise(threat)), threat).toBe(true)
      expect(codeStrings.has(normalise(threat)), threat).toBe(true)
    }
    // The invented headings, now replaced by the author's Arabic.
    for (const invented of ['Use Cases', 'AI Helps', 'Healthy Use']) {
      expect(codeStrings.has(normalise(invented)), invented).toBe(false)
    }
  })
})
