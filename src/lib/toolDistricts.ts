import { TOOL_CATEGORIES } from '@/types'
import type { ToolCategory } from '@/types'

/**
 * Which district of Tool City is lit, or null when none is.
 *
 * World 3 opens by arguing that you do not need to know twenty AI tools, you
 * need to know which one fits the job — `مش المهم تعرف 20 AI. المهم تعرف أي
 * Tool تستخدم ولأي مهمة.` So the city is built as separate districts and the
 * camera's attention moves between them rather than lighting everything at
 * once.
 *
 * Scenes 11 and 15 light nothing on purpose. Scene 11 is the overview — every
 * district equal, because the point is that they are different jobs, not that
 * one wins. Scene 15 is the question itself, and answering it in the scenery
 * would answer it for the class.
 *
 * Pure so the mapping is testable, and keyed by ToolCategory so a district can
 * never exist that no tool could belong to.
 */
const BY_SCENE: Readonly<Record<string, ToolCategory>> = {
  'study-tools': 'study',
  'creative-tools': 'creative',
  'coding-tools': 'coding',
}

export function getActiveDistrict(sceneId: string): ToolCategory | null {
  return BY_SCENE[sceneId] ?? null
}

/** Stable order, so a district always sits in the same place in the city. */
export const DISTRICTS: readonly ToolCategory[] = TOOL_CATEGORIES

export function getDistrictIndex(category: ToolCategory): number {
  return DISTRICTS.indexOf(category)
}
