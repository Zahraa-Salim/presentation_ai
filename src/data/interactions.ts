import type { InteractionDef, InteractionId } from '@/types'
import { TODO } from '@/lib/todo'

/**
 * The nine classroom interactions (A–I).
 *
 * Prompts and choice lists below are taken from the brief. Everything the
 * brief did not specify — facilitation notes, result copy — is marked TODO
 * pending the original deck.
 *
 * All interactions are presenter-driven: one projected screen, mouse and
 * keyboard, no student devices, no backend, no live voting.
 */
export const INTERACTIONS: readonly InteractionDef[] = [
  {
    id: 'opening-poll',
    kind: 'poll',
    sceneId: 'do-you-use-ai',
    promptAr: 'هل استخدمت AI من قبل؟',
    options: [
      { id: 'yes', label: 'نعم' },
      { id: 'sometimes', label: 'أحياناً' },
      { id: 'never', label: 'أبداً' },
    ],
    estimatedSec: 60,
    facilitationAr: [TODO('كيف يدير الأستاذ التصويت أمام الصف')],
  },
  {
    id: 'mind-reader',
    kind: 'reveal',
    sceneId: 'not-a-mind-reader',
    promptAr: 'AI بيعرف ليش؟',
    options: [
      { id: 'statement', label: 'أنا متوتر.' },
      // The possibilities AI cannot choose between. The brief does not supply
      // them, so they stay TODO rather than being invented — four short Arabic
      // phrases fill these; the interaction works either way.
      { id: 'possibility-1', label: TODO('احتمال ١') },
      { id: 'possibility-2', label: TODO('احتمال ٢') },
      { id: 'possibility-3', label: TODO('احتمال ٣') },
      { id: 'possibility-4', label: TODO('احتمال ٤') },
    ],
    estimatedSec: 70,
    facilitationAr: [TODO('نص الكشف عن الـ Context')],
  },
  {
    id: 'prompt-lab',
    kind: 'lab',
    sceneId: 'prompt-formula',
    promptAr: 'اشرحلي Biology.',
    options: [
      { id: 'context', label: 'Context' },
      { id: 'goal', label: 'Goal' },
      { id: 'constraints', label: 'Constraints' },
      { id: 'output', label: 'Output' },
    ],
    estimatedSec: 110,
    facilitationAr: [TODO('نص الـ Prompt المحسّن بعد كل خطوة')],
  },
  {
    id: 'tool-explorer',
    kind: 'explorer',
    sceneId: 'which-ai-for-which-task',
    promptAr: TODO('سؤال الـ Tool Explorer'),
    options: [
      { id: 'study', label: 'أدرس' },
      { id: 'research', label: 'أبحث' },
      { id: 'design', label: 'أصمم' },
      { id: 'code', label: 'أبرمج' },
      { id: 'write', label: 'أكتب' },
      { id: 'build', label: 'أبني مشروع' },
    ],
    estimatedSec: 90,
    facilitationAr: [TODO('الأدوات المقترحة لكل خيار')],
  },
  {
    id: 'study-companion',
    kind: 'branch',
    sceneId: 'study-companion',
    promptAr: TODO('سؤال رفيق الدراسة'),
    options: [
      { id: 'explain', label: 'اشرح' },
      { id: 'quiz', label: 'اختبرني' },
      { id: 'plan', label: 'اعمل خطة' },
      { id: 'example', label: 'اعطيني مثال' },
      { id: 'correct', label: 'صححلي' },
    ],
    estimatedSec: 90,
    facilitationAr: [TODO('ماذا يعرض بعد كل خيار')],
  },
  {
    id: 'privacy-sorter',
    kind: 'sorter',
    sceneId: 'never-share',
    promptAr: TODO('تعليمات الفرز'),
    options: [
      { id: 'homework', label: 'واجب مدرسي', correct: true },
      { id: 'general-question', label: 'سؤال عام', correct: true },
      { id: 'password', label: 'Password', correct: false },
      { id: 'otp', label: 'OTP', correct: false },
      { id: 'id', label: 'ID', correct: false },
      { id: 'private-photo', label: 'صورة خاصة', correct: false },
    ],
    estimatedSec: 120,
    facilitationAr: [TODO('شرح كل عنصر بعد الفرز')],
  },
  {
    id: 'real-or-fake',
    kind: 'quiz',
    sceneId: 'ai-cybersecurity',
    promptAr: 'مين الحقيقي؟',
    options: [TODO('الخيار الأول'), TODO('الخيار الثاني')].map((label, i) => ({
      id: `option-${i + 1}`,
      label,
    })),
    estimatedSec: 120,
    facilitationAr: [TODO('علامات التزوير التي يجب لفت النظر إليها')],
  },
  {
    id: 'dependency',
    kind: 'branch',
    sceneId: 'if-ai-disappeared',
    promptAr: 'إذا اختفى AI لمدة أسبوع، هل بتقدر تكمل؟',
    options: [TODO('الخيارات')].map((label, i) => ({
      id: `option-${i + 1}`,
      label,
    })),
    estimatedSec: 100,
    facilitationAr: [TODO('النتائج المعروضة لكل خيار')],
  },
  {
    id: 'career',
    kind: 'explorer',
    sceneId: 'jobs-and-skills',
    promptAr: TODO('سؤال المهن'),
    options: [
      { id: 'doctor', label: 'طبيب' },
      { id: 'developer', label: 'مطوّر' },
      { id: 'designer', label: 'مصمّم' },
      { id: 'teacher', label: 'أستاذ' },
      { id: 'engineer', label: 'مهندس' },
      { id: 'entrepreneur', label: 'رائد أعمال' },
    ],
    estimatedSec: 100,
    facilitationAr: [TODO('كيف يتغيّر كل دور مع الـ AI')],
  },
] as const

export const INTERACTION_BY_ID: Record<InteractionId, InteractionDef> =
  Object.fromEntries(INTERACTIONS.map((i) => [i.id, i])) as Record<
    InteractionId,
    InteractionDef
  >
