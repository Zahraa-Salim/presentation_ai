import type { WorldDef, WorldId } from '@/types'

/**
 * The five visual environments.
 *
 * Time budgets sum to 45 minutes. They differ slightly from the "suggested
 * distribution" in the brief because scene counts per world are uneven:
 * Study Lab carries 11 of the 33 moments (tools + prompting + study
 * companion) and three of the nine interactions, so it needs more than the
 * suggested 10 minutes; AI Lab carries 5 and needs less than 9.
 * Totals are unchanged.
 */
export const WORLDS: readonly WorldDef[] = [
  {
    id: 'ai-world',
    order: 1,
    nameAr: 'عالم الـ AI',
    label: 'AI WORLD',
    summaryAr: 'شو هو الـ AI، ومن وين إجا، وليش هو مش Trend.',
    budgetMin: 5,
  },
  {
    id: 'ai-lab',
    order: 2,
    nameAr: 'مختبر الـ AI',
    label: 'AI LAB',
    summaryAr: 'الـ AI مش سحر ومش قارئ أفكار — كيف بيشتغل وليش بيغلط.',
    budgetMin: 8,
  },
  {
    id: 'study-lab',
    order: 3,
    nameAr: 'مختبر الدراسة',
    label: 'STUDY LAB',
    summaryAr: 'أدوات الـ AI، الـ Prompting، والـ AI كرفيق دراسة.',
    budgetMin: 13,
  },
  {
    id: 'privacy',
    order: 4,
    nameAr: 'الخصوصية والأمن',
    label: 'PRIVACY',
    summaryAr: 'شو بتشارك وشو ما بتشارك، والـ Cybersecurity.',
    budgetMin: 11,
  },
  {
    id: 'future',
    order: 5,
    nameAr: 'مدينة المستقبل',
    label: 'FUTURE CITY',
    summaryAr: 'الاعتماد على الـ AI، الشغل، والمهارات المستقبلية.',
    budgetMin: 8,
  },
] as const

export const WORLD_BY_ID: Record<WorldId, WorldDef> = Object.fromEntries(
  WORLDS.map((w) => [w.id, w]),
) as Record<WorldId, WorldDef>
