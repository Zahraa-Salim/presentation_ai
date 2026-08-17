/**
 * The nine classroom interactions (A–I).
 *
 * All of them are presenter-driven and fully client-side: one projected
 * screen, no student devices, no backend, no live voting. Results are
 * revealed by the presenter, not collected from an audience.
 */
export const INTERACTION_IDS = [
  'opening-poll', // A — هل استخدمت AI من قبل؟
  'mind-reader', // B — "أنا متوتر." → Context reveal
  'prompt-lab', // C — weak prompt → Context + Goal + Constraints + Output
  'tool-explorer', // D — pick a task, see the fitting tools
  'study-companion', // E — Tutor / Quiz Partner / Study Planner / …
  'privacy-sorter', // F — SAFE TO SHARE vs DON'T SHARE
  'real-or-fake', // G — مين الحقيقي؟
  'dependency', // H — إذا اختفى AI لمدة أسبوع؟
  'career', // I — pick a profession, see how AI changes it
] as const

export type InteractionId = (typeof INTERACTION_IDS)[number]

export type InteractionKind =
  | 'poll' // presenter reveals an animated distribution
  | 'reveal' // a single staged reveal
  | 'lab' // progressive building (Prompt Lab)
  | 'explorer' // branch and fly to a result
  | 'sorter' // drag items into buckets
  | 'quiz' // pick the correct one of N
  | 'branch' // pick a path, see the consequence

export interface ChoiceOption {
  id: string
  /** Arabic label. */
  label: string
  /** Optional Arabic caption shown after reveal. */
  caption?: string
  /** For quiz/sorter interactions: is this the correct answer / safe item? */
  correct?: boolean
}

export interface InteractionDef {
  id: InteractionId
  kind: InteractionKind
  /** Scene this interaction belongs to. */
  sceneId: string
  /** Arabic question shown to the class. */
  promptAr: string
  options: ChoiceOption[]
  /** Seconds this is expected to consume, counted inside the scene duration. */
  estimatedSec: number
  /** Arabic guidance for the presenter on how to run it live. */
  facilitationAr: string[]
  /**
   * Arabic verdict wording for interactions that judge each option.
   *
   * The generic default is صح / خطأ, which is right for a quiz and wrong for
   * the Privacy Sorter — there, `correct` means "safe to share", not "the right
   * answer". Lives here rather than in the component because it is copy.
   */
  verdictAr?: { correct: string; incorrect: string }
}
