export const WORLD_IDS = [
  'ai-world',
  'ai-lab',
  'study-lab',
  'privacy',
  'future',
] as const

export type WorldId = (typeof WORLD_IDS)[number]

export interface WorldDef {
  id: WorldId
  /** Order in the presentation, 1-based. */
  order: number
  /** Arabic display name. */
  nameAr: string
  /** Short Latin label shown in the progress chrome, e.g. "AI LAB". */
  label: string
  /** One-line Arabic description of what this world covers. */
  summaryAr: string
  /** Budgeted minutes from the 45-minute plan. Used by the rehearsal check. */
  budgetMin: number
}
