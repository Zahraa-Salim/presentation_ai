import type { InteractionDef, InteractionId } from '@/types'

/**
 * The nine classroom interactions (A–I).
 *
 * Every prompt, choice and facilitation line is the author's: from the deck
 * where it supplied one, and from content-3.json for the handful it did not —
 * the Real-or-Fake pair, the Tool Explorer's suggestions, the Study Companion's
 * example prompts. Nothing here is invented.
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
    // One line per task, in the same order as the options above.
    facilitationAr: [
      'للدراسة: ChatGPT أو Claude أو Gemini — للشرح، التلخيص، والأسئلة التدريبية.',
      'للـResearch: Gemini أو ChatGPT — للبحث وتنظيم الأفكار، مع التحقق من المصادر.',
      'للـPresentation: Canva AI أو Gamma — لتوليد الأفكار والتصميم بسرعة.',
      'لفهم Code: ChatGPT أو Claude أو Copilot — لشرح Code وDebugging والتعلّم.',
      'لفكرة مشروع: ChatGPT أو Claude — للعصف الذهني، دراسة الفكرة، وبناء خطة أولية.',
    ],
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
    // One example prompt per role, in the same order as the options above.
    facilitationAr: [
      'Tutor: اشرحلي هالموضوع كأني طالب صف 11، وبطريقة بسيطة، وإذا ما فهمتني جرّب طريقة ثانية.',
      'Quiz Partner: اختبرني بـ5 أسئلة عن هالموضوع، سؤال سؤال، وما تعطيني الجواب قبل ما جاوب.',
      'Study Planner: عندي امتحان بعد 5 أيام بهالمواضيع، ساعدني أعمل خطة دراسة واقعية.',
      'Language Partner: احكي معي بالإنجليزي عن هالموضوع، وصححلي أخطائي بعد كل جواب.',
      'Brainstorming Partner: عندي هالفكرة للمشروع، ساعدني أطلع 5 أفكار مختلفة وأخبرني شو نقاط القوة والضعف بكل واحدة.',
    ],
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
    /*
      Two messages a Lebanese student might really receive, deliberately hard to
      separate at a glance — an obviously fake fake would teach nothing, and the
      scene's own line is `مش كل شي بيبين حقيقي… حقيقي.`
    */
    options: [
      {
        id: 'option-1',
        label:
          'وصلتك رسالة من المدرسة على المنصة الرسمية: تذكير إن آخر موعد لتسليم المشروع يوم الخميس، ومعها رابط المنصة المعتاد.',
        correct: true,
      },
      {
        id: 'option-2',
        label:
          'وصلتك رسالة من حساب بيشبه حساب المدرسة: "مبروك! ربحت اشتراك مجاني. سجّل دخولك من هالرابط خلال ساعة لتأكيد الجائزة."',
        correct: false,
      },
    ],
    estimatedSec: 120,
    // The tells — what gives the fake away once you know to look. This is what
    // the class takes home; the threats it covers are Phishing, fake accounts,
    // AI-generated scams, deepfakes and impersonation.
    facilitationAr: [
      'الحساب أو الرابط مش هو نفسه الحساب أو الموقع الرسمي، حتى لو الاسم والصورة بيشبهوا الأصلي.',
      'الاستعجال أو التهديد أو وعد بجائزة كبيرة علامة لازم توقف عندها قبل ما تضغط.',
      'قبل ما تدخل Password أو OTP، افتح الموقع أو التطبيق الرسمي بنفسك وتأكد من المصدر.',
    ],
    verdictAr: { correct: 'حقيقي', incorrect: 'مزوّر' },
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
