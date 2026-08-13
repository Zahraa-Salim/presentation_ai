import { describe, expect, it } from 'vitest'
import {
  KEY_BINDINGS,
  MAX_CHOICE_KEY,
  resolveChoiceKey,
  resolveKeyIntent,
  type KeyEventLike,
} from '@/lib/keymap'
import type { NavIntent } from '@/types'

const ev = (over: Partial<KeyEventLike> = {}): KeyEventLike => ({
  key: 'x',
  repeat: false,
  ctrlKey: false,
  altKey: false,
  metaKey: false,
  target: null,
  ...over,
})

const target = (tagName: string, isContentEditable = false) =>
  ({ tagName, isContentEditable }) as unknown as EventTarget

describe('navigation key map', () => {
  it.each<[string, NavIntent]>([
    ['ArrowRight', 'next'],
    [' ', 'next'],
    ['Spacebar', 'next'],
    ['PageDown', 'next'],
    ['ArrowLeft', 'prev'],
    ['PageUp', 'prev'],
    ['ArrowDown', 'nextScene'],
    ['ArrowUp', 'prevScene'],
    ['Home', 'first'],
    ['End', 'last'],
    ['Escape', 'escape'],
  ])('maps %s to %s', (key, intent) => {
    expect(resolveKeyIntent(ev({ key }))).toBe(intent)
  })

  it.each([
    ['f', 'fullscreen'],
    ['F', 'fullscreen'],
    ['p', 'presenter'],
    ['P', 'presenter'],
  ])('matches letter %s case-insensitively', (key, intent) => {
    expect(resolveKeyIntent(ev({ key }))).toBe(intent)
  })

  it.each(['a', 'Tab', 'F5', 'Enter', 'Shift'])(
    'ignores unbound key %s',
    (key) => {
      expect(resolveKeyIntent(ev({ key }))).toBeNull()
    },
  )
})

describe('navigation guards', () => {
  it('ignores auto-repeat so holding a key does not machine-gun the reveals', () => {
    expect(resolveKeyIntent(ev({ key: 'ArrowRight', repeat: true }))).toBeNull()
    expect(resolveKeyIntent(ev({ key: ' ', repeat: true }))).toBeNull()
  })

  it.each(['ctrlKey', 'altKey', 'metaKey'] as const)(
    'leaves browser shortcuts alone when %s is held',
    (modifier) => {
      expect(
        resolveKeyIntent(ev({ key: 'ArrowRight', [modifier]: true })),
      ).toBeNull()
    },
  )

  it.each(['INPUT', 'TEXTAREA', 'SELECT'])(
    'ignores keys typed into a %s',
    (tag) => {
      expect(resolveKeyIntent(ev({ key: ' ', target: target(tag) }))).toBeNull()
    },
  )

  it('ignores keys typed into a contenteditable', () => {
    expect(
      resolveKeyIntent(ev({ key: ' ', target: target('DIV', true) })),
    ).toBeNull()
  })

  it('still navigates when a non-typing element has focus', () => {
    expect(
      resolveKeyIntent(ev({ key: 'ArrowRight', target: target('BUTTON') })),
    ).toBe('next')
    expect(
      resolveKeyIntent(ev({ key: 'ArrowRight', target: target('DIV') })),
    ).toBe('next')
  })
})

describe('key map integrity', () => {
  const allKeys = KEY_BINDINGS.flatMap((b) =>
    b.keys.map((k) => (k.length === 1 ? k.toLowerCase() : k)),
  )

  it('binds no key twice', () => {
    expect(new Set(allKeys).size).toBe(allKeys.length)
  })

  it('binds no intent twice and covers all 9', () => {
    const intents = KEY_BINDINGS.map((b) => b.intent)
    expect(new Set(intents).size).toBe(intents.length)
    expect(intents).toHaveLength(9)
  })

  it('gives every binding an Arabic label for the future help overlay', () => {
    expect(KEY_BINDINGS.every((b) => b.labelAr.trim().length > 0)).toBe(true)
    expect(KEY_BINDINGS.every((b) => b.keys.length > 0)).toBe(true)
  })
})

describe('number-key choice selection', () => {
  it.each([1, 2, 3, 4, 5, 6])('maps "%i" to choice %i', (n) => {
    expect(resolveChoiceKey(ev({ key: String(n) }))).toBe(n)
  })

  it.each(['0', '7', '9', 'a', 'ArrowRight'])('ignores %s', (key) => {
    expect(resolveChoiceKey(ev({ key }))).toBeNull()
  })

  it('caps at MAX_CHOICE_KEY', () => {
    expect(resolveChoiceKey(ev({ key: String(MAX_CHOICE_KEY) }))).toBe(
      MAX_CHOICE_KEY,
    )
    expect(resolveChoiceKey(ev({ key: String(MAX_CHOICE_KEY + 1) }))).toBeNull()
  })

  it('shares the navigation guards', () => {
    expect(resolveChoiceKey(ev({ key: '1', repeat: true }))).toBeNull()
    expect(resolveChoiceKey(ev({ key: '1', ctrlKey: true }))).toBeNull()
    expect(resolveChoiceKey(ev({ key: '1', altKey: true }))).toBeNull()
    expect(resolveChoiceKey(ev({ key: '1', metaKey: true }))).toBeNull()
    expect(
      resolveChoiceKey(ev({ key: '1', target: target('INPUT') })),
    ).toBeNull()
    expect(
      resolveChoiceKey(ev({ key: '1', target: target('DIV', true) })),
    ).toBeNull()
  })
})
