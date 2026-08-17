/**
 * Which direction a single deck string should resolve in.
 *
 * The document is RTL, which is right for almost everything. It is wrong for a
 * string that contains no Arabic at all: scene 24's
 * `Friend? Life Coach? Secret Keeper?` ends in an ASCII `?`, a neutral, which
 * takes the paragraph direction and jumps to the visual left — printing as
 * `?Friend? Life Coach? Secret Keeper`.
 *
 * The obvious fix, `<bdi>` or `dir="auto"`, is wrong here. Both resolve from the
 * FIRST STRONG CHARACTER, and a third of the deck's Arabic headlines open with
 * a Latin term — `AI صار حوالينا.`, `AI مش Trend.`, `AI للدراسة.` Auto-detection
 * reads the `A` and flips the whole sentence to LTR, putting the full stop on
 * the wrong side of ten correct titles to fix one broken one.
 *
 * So the rule is presence, not position: **any Arabic anywhere means RTL.**
 * Only a string with none at all is laid out LTR.
 *
 * Pure and dependency-free, so every deck string can be checked in Node.
 */

import { RTL_SIGN } from '@/lib/transitions'

/*
  U+0590–U+08FF covers Hebrew, Arabic, Syriac, Thaana, N'Ko and Arabic
  Extended-A; the two later ranges are the Hebrew and Arabic presentation
  forms. Wider than this deck needs, so a future language does not silently
  fall through to LTR.

  Built from a string rather than written as a regex literal so the source
  holds no literal right-to-left characters: a character class of those is
  unreviewable in a diff, and the presentation-forms block runs up against
  U+FEFF — a zero-width no-break space no editor will show you, which trips
  eslint's no-irregular-whitespace.
*/
const RTL_PATTERN = new RegExp(
  '[\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFC]',
)

/** True when the string contains at least one right-to-left character. */
export function hasRtl(value: string): boolean {
  return RTL_PATTERN.test(value)
}

/**
 * `'rtl'` for anything containing Arabic, `'ltr'` for a purely Latin string.
 *
 * Always returns a direction rather than falling back to inheritance, so the
 * value can be paired with an isolate and a Latin run can neither be reordered
 * by its surroundings nor reorder them.
 */
export function resolveTextDir(value: string): 'rtl' | 'ltr' {
  return hasRtl(value) ? 'rtl' : 'ltr'
}

/**
 * `'latin'` for a string with no Arabic in it, otherwise `''`.
 *
 * The bundled Plex Arabic is the Arabic subset only, so a Latin run already
 * falls through to Inter without help — what the class actually buys is Inter's
 * `cv05` and consistency with the components that were already applying it.
 *
 * Deliberately not applied to mixed strings like `فهم Code`: those are Arabic
 * sentences with a technical term inside, and Inter's metrics would be wrong
 * for the Arabic around it. Font fallback handles the embedded word on its own.
 */
export function latinClass(value: string): string {
  return hasRtl(value) ? '' : 'latin'
}

/**
 * `'en'` for a string with no Arabic in it, otherwise undefined.
 *
 * The document is `lang="ar"`, so a screen reader voices everything with an
 * Arabic engine — including `ChatGPT`, `GitHub Copilot`, `Password` and `OTP`,
 * which come out as mangled transliteration. Marking the Latin runs lets the
 * reader switch voice.
 *
 * Pairs with `latinClass`: the stylesheet already maps `:lang(en)` to the Latin
 * face, so the two say the same thing to the renderer and to the reader.
 */
export function latinLang(value: string): 'en' | undefined {
  return hasRtl(value) ? undefined : 'en'
}

/**
 * Which way "forward" points on screen.
 *
 * Under RTL the next thing comes from the LEFT — the progress bar fills that
 * way, scenes enter from there, and `RTL_SIGN` mirrors every transition to
 * match. So a *left*-pointing arrow means forward, and this reads correctly
 * even though it looks backwards to anyone thinking in English.
 *
 * Derived from RTL_SIGN rather than typed as a literal, because
 * `src/lib/transitions.ts` promises that flipping that one constant reverses
 * the whole system — a hardcoded glyph would quietly break that promise, and
 * an arrow pointing the wrong way during a lesson is worse than no arrow.
 *
 * Note that these are NOT bidi-mirrored by the renderer: only paired
 * punctuation carries the Bidi_Mirrored property. An arrow renders exactly as
 * authored, whatever the surrounding direction, which is why the choice has to
 * be made here rather than left to the browser.
 */
export const FORWARD_ARROW = RTL_SIGN === -1 ? '←' : '→'
export const BACK_ARROW = RTL_SIGN === -1 ? '→' : '←'
