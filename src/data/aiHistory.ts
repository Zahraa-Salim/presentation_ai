/**
 * Milestones for scene 4, `AI مش جديد.`
 *
 * These five, their years and their Arabic captions all come from the deck.
 * The earlier placeholder list happened to choose the same milestones; only
 * `dartmouth`'s label changed, to the deck's `Artificial Intelligence`.
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
    captionAr: 'بدأت أسئلة جدية عن قدرة الآلة على محاكاة التفكير.',
  },
  {
    id: 'dartmouth',
    year: 1956,
    label: 'Artificial Intelligence',
    captionAr: 'ظهر مصطلح Artificial Intelligence.',
  },
  {
    id: 'deep-blue',
    year: 1997,
    label: 'Deep Blue',
    captionAr: 'كمبيوتر هزم بطل العالم بالشطرنج.',
  },
  {
    id: 'deep-learning',
    year: 2012,
    label: 'Deep Learning',
    captionAr: 'التعلّم من كميات ضخمة من البيانات صار أقوى.',
  },
  {
    id: 'chatgpt',
    year: 2022,
    label: 'ChatGPT',
    captionAr: 'Generative AI صار متاحاً لجمهور واسع.',
  },
] as const
