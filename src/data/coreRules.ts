/**
 * The five closing rules.
 *
 * The deck lists these after the last scene and does **not** attach them to
 * one, so they are not a 34th scene — the 33 already total exactly 45 minutes.
 * They are the lesson's summary: available to the finale and to presenter mode,
 * and usable as a handout.
 *
 * Titles are English in the deck and stay that way; bodies are mixed Arabic and
 * English exactly as supplied.
 */
export interface CoreRule {
  id: string
  /** English, from the deck. */
  title: string
  body: string
}

export const CORE_RULES: readonly CoreRule[] = [
  {
    id: 'verify',
    title: 'Verify Important Information',
    body: 'خصوصاً المعلومات المتعلقة بالدراسة، العلم، الصحة، المال، والقرارات المهمة.',
  },
  {
    id: 'privacy',
    title: 'Protect Your Privacy',
    body: "Don't treat AI like a private diary.",
  },
  {
    id: 'critical-thinking',
    title: 'Keep Your Critical Thinking',
    body: 'اسأل دائماً: هل هيدا منطقي؟',
  },
  {
    id: 'real-people',
    title: "Don't Let AI Replace Real People",
    body: 'AI ممكن يكون Companion، بس العلاقات الإنسانية بتضل مهمة.',
  },
  {
    id: 'work-with-ai',
    title: 'Learn to Work With AI',
    body: 'الهدف مش تستخدم AI لكل شي. الهدف تعرف إمتى تستخدمه، كيف تستخدمه، وإمتى ما تستخدمه.',
  },
] as const
