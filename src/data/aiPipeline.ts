/**
 * The five stages of `كيف بيشتغل AI؟` (scene 9).
 *
 * Stage names and captions come from the deck — Prompt → Tokens → Patterns →
 * Probability → Response. The names stay in English as technical terms.
 *
 * The ids here must match scene 9's reveal step ids exactly; a test asserts it,
 * because a mismatch would desynchronise the DOM label from the 3D stage that
 * lights up beside it.
 */
export interface PipelineStage {
  id: string
  /** Technical term, English. */
  label: string
  /** Arabic explanation for students. */
  captionAr: string
  /** Position along the lattice, 0..1, used to light the matching node. */
  position: number
}

export const AI_PIPELINE: readonly PipelineStage[] = [
  {
    id: 'prompt',
    label: 'Prompt',
    captionAr: 'شو طلبت من AI؟',
    position: 0,
  },
  {
    id: 'tokens',
    label: 'Tokens',
    captionAr: 'النص بيتقسّم لأجزاء يفهمها النموذج.',
    position: 0.25,
  },
  {
    id: 'patterns',
    label: 'Patterns',
    captionAr: 'النموذج يتعامل مع أنماط تعلّمها.',
    position: 0.5,
  },
  {
    id: 'probability',
    label: 'Probability',
    captionAr: 'بيتوقع شو الاحتمال الأنسب.',
    position: 0.75,
  },
  {
    id: 'response',
    label: 'Response',
    captionAr: 'بيولّد الجواب.',
    position: 1,
  },
] as const
