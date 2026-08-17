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
    sceneId: 'opening-poll',
    promptAr: 'هل استخدمت AI من قبل؟',
    options: [
      { id: 'yes', label: 'نعم' },
      { id: 'sometimes', label: 'أحياناً' },
      { id: 'never', label: 'أبداً' },
    ],
    estimatedSec: 60,
    facilitationAr: ['طيب… مين عم يستخدم مين؟'],
  },
  {
    /*
      The deck answers this outright — `لا.` plus why — rather than fanning out
      possibilities for the class to choose between. An earlier design offered
      four candidate reasons; the deck does not, so it was removed. Making any
      of them selectable would also have implied one was the answer.
    */
    id: 'mind-reader',
    kind: 'reveal',
    sceneId: 'not-mind-reader',
    promptAr: 'AI بيعرف ليش؟',
    options: [
      { id: 'statement', label: 'أنا متوتر.' },
      { id: 'answer', label: 'لا.' },
    ],
    estimatedSec: 70,
    facilitationAr: [
      'إذا ما قلتله إن عندك امتحان بكرا، ما عنده طريقة يعرف هالشي من الجملة وحدها.',
    ],
  },
  {
    id: 'prompt-lab',
    kind: 'lab',
    sceneId: 'prompt-framework',
    promptAr: 'اشرحلي Biology.',
    options: [
      { id: 'context', label: 'Context' },
      { id: 'goal', label: 'Goal' },
      { id: 'constraints', label: 'Constraints' },
      { id: 'output', label: 'Output' },
    ],
    estimatedSec: 110,
    // One question per build stage, in the same order as the options above.
    facilitationAr: ['مين أنا؟', 'شو بدي؟', 'شو الشروط؟', 'كيف بدي الجواب؟'],
  },
  {
    id: 'tool-explorer',
    kind: 'explorer',
    sceneId: 'which-ai-for-which-task',
    promptAr: 'أي AI لأي مهمة؟',
    options: [
      { id: 'study', label: 'بدي أدرس Chapter.' },
      { id: 'research', label: 'بدي أعمل Research.' },
      { id: 'design', label: 'بدي أصمم Presentation.' },
      { id: 'code', label: 'بدي أفهم Code.' },
      { id: 'build', label: 'بدي أبني فكرة مشروع.' },
    ],
    estimatedSec: 90,
    facilitationAr: [TODO('الأدوات المقترحة لكل مهمة من المهام الخمس')],
  },
  {
    id: 'study-companion',
    kind: 'branch',
    sceneId: 'study-companion',
    promptAr: 'AI ممكن يساعدك تدرس. مش يدرس عنك.',
    options: [
      { id: 'tutor', label: 'Tutor' },
      { id: 'quiz-partner', label: 'Quiz Partner' },
      { id: 'study-planner', label: 'Study Planner' },
      { id: 'language-partner', label: 'Language Partner' },
      { id: 'brainstorming-partner', label: 'Brainstorming Partner' },
    ],
    estimatedSec: 90,
    facilitationAr: [TODO('شو بتكتب للـ AI ليلعب كل دور من الأدوار الخمسة')],
  },
  {
    id: 'privacy-sorter',
    kind: 'sorter',
    sceneId: 'what-not-to-share',
    promptAr: 'شو ما لازم تشارك؟',
    // `correct: true` means "safe to share". The label always states which is
    // which, so the sorter never depends on colour alone.
    options: [
      { id: 'homework', label: 'سؤال دراسي', correct: true },
      { id: 'project-idea', label: 'فكرة مشروع', correct: true },
      { id: 'exercise', label: 'تمرين', correct: true },
      { id: 'text-to-improve', label: 'نص بدك تحسّنه', correct: true },
      { id: 'general-topic', label: 'موضوع عام', correct: true },
      { id: 'password', label: 'Password', correct: false },
      { id: 'otp', label: 'OTP', correct: false },
      { id: 'bank', label: 'Bank information', correct: false },
      { id: 'id', label: 'ID / Passport', correct: false },
      { id: 'private-photos', label: 'Private photos', correct: false },
      { id: 'private-documents', label: 'Private documents', correct: false },
      { id: 'others-secrets', label: 'أسرار شخص تاني', correct: false },
    ],
    estimatedSec: 120,
    facilitationAr: ['قبل ما تبعت أي شي… اسأل حالك: هل هيدا الشي لازم يعرفه AI؟'],
    // "Right answer" wording would be wrong here — these are not answers.
    verdictAr: { correct: 'آمن للمشاركة', incorrect: 'لا تشارك' },
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
    // The deck names the threats but supplies no pair to compare, so the two
    // items above stay open. Threats: Phishing · Fake accounts ·
    // AI-generated scams · Deepfakes · Impersonation.
    facilitationAr: [TODO('علامات التزوير التي يجب لفت النظر إليها')],
  },
  {
    id: 'dependency',
    kind: 'branch',
    sceneId: 'dependency',
    promptAr: 'إذا اختفى AI لمدة أسبوع، هل بتقدر تكمل؟',
    options: [
      { id: 'option-1', label: 'أكيد.' },
      { id: 'option-2', label: 'بصير أصعب… بس بكمل.' },
      { id: 'option-3', label: 'رح أحتاج وقت.' },
      { id: 'option-4', label: 'ما بعرف شو بعمل.' },
    ],
    estimatedSec: 100,
    // One line per option, in the same order. Reflective, never shaming.
    facilitationAr: [
      'ممتاز. AI أداة، مش شيء لازم تعتمد عليه بكل خطوة.',
      'هيدا طبيعي. المهم تضل عندك المهارات الأساسية.',
      'يمكن تكون معتمد عليه ببعض المهام. هيدا وقت مناسب تراجع هالاعتماد.',
      'مش مشكلة ولا عيب. الفكرة إننا نستخدم AI بطريقة تقوّي مهاراتنا، مش تستبدلها.',
    ],
  },
  {
    id: 'career',
    kind: 'explorer',
    sceneId: 'future-jobs',
    promptAr: 'هل AI رح ياخد وظائفنا؟',
    options: [
      { id: 'doctor', label: 'طبيب' },
      { id: 'developer', label: 'مطوّر' },
      { id: 'designer', label: 'مصمّم' },
      { id: 'teacher', label: 'أستاذ' },
      { id: 'engineer', label: 'مهندس' },
      { id: 'entrepreneur', label: 'رائد أعمال' },
    ],
    estimatedSec: 100,
    // One line per role, in the same order as the options above.
    facilitationAr: [
      'AI يساعد في تحليل المعلومات والمهام المتكررة، لكن القرار والمسؤولية والتعامل الإنساني يظلون مهمين.',
      'AI يكتب ويشرح Code، لكن المطوّر يحتاج يفهم المشكلة ويختبر الحل ويتخذ القرارات التقنية.',
      'AI يسرّع توليد الأفكار والنسخ الأولى، لكن الذوق والاختيار وفهم الجمهور ما زالوا مهمين.',
      'AI يساعد في تحضير المحتوى والتدريب، لكن فهم الطلاب والتفاعل معهم يحتاج إنسان.',
      'AI يساعد في الحسابات والتحليل والتصميم، لكن المسؤولية والحكم الهندسي مهمان.',
      'AI يساعد في البحث والأفكار والنماذج الأولية، لكن فهم المشكلة والناس واتخاذ القرار يبقى أساسياً.',
    ],
  },
] as const

export const INTERACTION_BY_ID: Record<InteractionId, InteractionDef> =
  Object.fromEntries(INTERACTIONS.map((i) => [i.id, i])) as Record<
    InteractionId,
    InteractionDef
  >
