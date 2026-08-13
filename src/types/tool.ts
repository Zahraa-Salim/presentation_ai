export const TOOL_CATEGORIES = [
  'study',
  'research',
  'writing',
  'creative',
  'coding',
  'startup',
] as const

export type ToolCategory = (typeof TOOL_CATEGORIES)[number]

export interface ToolDef {
  id: string
  /** Tool names stay in English (ChatGPT, Claude, Perplexity, ...). */
  name: string
  category: ToolCategory
  /** Arabic. What a student would realistically use it for. */
  useCasesAr: string[]
  /** Arabic. */
  strengthsAr: string[]
  /** Arabic. Stated honestly — this feeds the "AI is not magic" thread. */
  limitationsAr: string[]
}
