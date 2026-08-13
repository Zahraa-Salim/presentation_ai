/**
 * Marks copy that must still come from the original presentation deck.
 *
 * The deck is the source of truth for all educational content. Where it has
 * not been supplied yet, the gap is marked rather than filled with invented
 * text — the marker renders visibly on screen and the content validator
 * counts it, so nothing silently ships as placeholder.
 */
export const TODO_MARKER = '⟦TODO:'

export const TODO = (hint: string): string => `${TODO_MARKER} ${hint}⟧`

export const isTodo = (value: string): boolean => value.startsWith(TODO_MARKER)
