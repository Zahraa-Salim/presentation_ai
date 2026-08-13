import { TODO } from '@/lib/todo'

/**
 * The five stages of `كيف يعمل؟` (scene 9).
 *
 * Stage names come from the brief — Prompt → tokens → patterns → probability →
 * response — and stay in English as technical terms. How each is explained to
 * students is educational content, so the Arabic captions are TODO.
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
    captionAr: TODO('شرح: شو بيوصل للـ AI'),
    position: 0,
  },
  {
    id: 'tokens',
    label: 'tokens',
    captionAr: TODO('شرح: تقطيع النص لوحدات'),
    position: 0.25,
  },
  {
    id: 'patterns',
    label: 'patterns',
    captionAr: TODO('شرح: أنماط تعلّمها من بيانات'),
    position: 0.5,
  },
  {
    id: 'probability',
    label: 'probability',
    captionAr: TODO('شرح: احتمالات، مش معرفة'),
    position: 0.75,
  },
  {
    id: 'response',
    label: 'response',
    captionAr: TODO('شرح: الجواب الناتج'),
    position: 1,
  },
] as const
