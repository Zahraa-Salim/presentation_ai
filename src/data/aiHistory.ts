import { TODO } from '@/lib/todo'

/**
 * Milestones for scene 4, `AI مش جديد`.
 *
 * REPLACEABLE. These are widely-documented public dates, used so the timeline
 * has real structure to design against — they are NOT a claim about which
 * milestones the original presentation chose. Swap the list for the deck's own
 * once it arrives; the scene reads whatever is here.
 *
 * Arabic labels are marked TODO because how each milestone is described to
 * students is educational content, not public record.
 */
export interface HistoryMilestone {
  id: string
  year: number
  /** Short Latin label — names and product names stay in English. */
  label: string
  /** Arabic one-liner explaining why it mattered. */
  captionAr: string
}

export const AI_HISTORY: readonly HistoryMilestone[] = [
  {
    id: 'turing',
    year: 1950,
    label: 'Turing Test',
    captionAr: TODO('وصف اختبار تورينغ'),
  },
  {
    id: 'dartmouth',
    year: 1956,
    label: 'Dartmouth',
    captionAr: TODO('وصف مؤتمر دارتموث — ولادة مصطلح AI'),
  },
  {
    id: 'deep-blue',
    year: 1997,
    label: 'Deep Blue',
    captionAr: TODO('وصف فوز Deep Blue بالشطرنج'),
  },
  {
    id: 'deep-learning',
    year: 2012,
    label: 'Deep Learning',
    captionAr: TODO('وصف انطلاقة الـ Deep Learning'),
  },
  {
    id: 'chatgpt',
    year: 2022,
    label: 'ChatGPT',
    captionAr: TODO('وصف وصول Generative AI للناس'),
  },
] as const
