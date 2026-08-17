import type { SceneDef, SceneType } from '@/types'
import { TODO } from '@/lib/todo'

/**
 * The 33 presentation moments, in running order.
 *
 * SOURCE OF TRUTH: `content.json` in the project root. Every title and line
 * below is the deck's, verbatim. The handful of remaining TODOs are things the
 * deck genuinely does not contain — see PROJECT-STATUS.md §7. Nothing here is
 * invented.
 *
 * ORDERING: Parts 01–09 are kept in their original order. Worlds are
 * assigned so each one is contiguous (no bouncing between environments),
 * which puts Part 04 (Prompting) inside Study Lab rather than AI Lab. The
 * brief lists "Prompting" under AI Lab and "Prompting practice" under Study
 * Lab, so either placement is defensible; this one preserves the original
 * running order. Moving scenes 16–18 into AI Lab is a two-line change here
 * if preferred — but it would reorder Parts 03 and 04.
 *
 * TIMING: durations sum to exactly 2700s (45 minutes).
 */
export const SCENES: readonly SceneDef[] = [
  // ══════════════════════════════════════════════════════════════════
  // PART 01 — OPENING · World 1: AI World · 5 min
  // ══════════════════════════════════════════════════════════════════
  {
    id: 'opening',
    world: 'ai-world',
    index: 1,
    title: 'AI: كيف نستخدمه بذكاء؟',
    type: 'cinematic',
    content: {
      headline: 'AI: كيف نستخدمه بذكاء؟',
      note: 'مش كيف نخليه يعمل كل شي عنّا.',
    },
    scene3d: 'opening',
    durationSec: 60,
    transition: 'statementReveal',
    speakerNotes: [
      'اليوم مش جايين نتعلّم كيف نستخدم ChatGPT وبس.',
      'بدنا نفهم AI، نعرف وين بيساعدنا، ووين لازم نوقف ونفكّر لحالنا.',
    ],
  },
  {
    id: 'opening-poll',
    world: 'ai-world',
    index: 2,
    title: 'هل أنت تستخدم AI أم AI يستخدمك؟',
    type: 'interactive',
    content: { headline: 'هل أنت تستخدم AI أم AI يستخدمك؟' },
    scene3d: 'opening',
    interaction: 'opening-poll',
    durationSec: 90,
    transition: 'fade',
    // Verbatim from the deck. Left in English because that is how it was
    // supplied — it is a note to the presenter about how the interaction runs,
    // not a line to say to the class.
    speakerNotes: [
      'Presenter-controlled classroom interaction; no live voting backend.',
    ],
  },
  {
    id: 'ai-is-everywhere',
    world: 'ai-world',
    index: 3,
    title: 'AI صار حوالينا.',
    type: 'explain',
    content: {
      headline: 'AI صار حوالينا.',
      steps: [
        { id: 'study', text: 'الدراسة' },
        { id: 'phone', text: 'الموبايل' },
        { id: 'photos', text: 'الصور' },
        { id: 'video', text: 'الفيديو' },
        { id: 'coding', text: 'البرمجة' },
        { id: 'search', text: 'البحث' },
        { id: 'games', text: 'الألعاب' },
      ],
      note: 'يمكن تستخدم AI كل يوم… من دون ما تنتبه.',
    },
    scene3d: 'opening',
    durationSec: 50,
    transition: 'fade',
    speakerNotes: [
      'اعرض الأمثلة السبعة واحدة واحدة، واسأل الطلاب أين صادفوا AI فيها.',
      'إذا بقي الصف ساكتاً، أعطِ مثالاً من الموبايل واطلب منهم رفع اليد إذا استخدموه.',
    ],
  },
  {
    id: 'ai-is-not-new',
    world: 'ai-world',
    index: 4,
    title: 'AI مش جديد.',
    type: 'explain',
    content: {
      headline: 'AI مش جديد.',
      // Ids and text must match AI_HISTORY in src/data/aiHistory.ts — the
      // milestone and the beat that reveals it are joined by these, the same
      // way scene 9 is joined to AI_PIPELINE. A test asserts they agree.
      steps: [
        {
          id: 'turing',
          text: 'بدأت أسئلة جدية عن قدرة الآلة على محاكاة التفكير.',
        },
        { id: 'dartmouth', text: 'ظهر مصطلح Artificial Intelligence.' },
        { id: 'deep-blue', text: 'كمبيوتر هزم بطل العالم بالشطرنج.' },
        {
          id: 'deep-learning',
          text: 'التعلّم من كميات ضخمة من البيانات صار أقوى.',
        },
        { id: 'chatgpt', text: 'Generative AI صار متاحاً لجمهور واسع.' },
      ],
      note: 'الفكرة أقدم بكتير من ChatGPT.',
    },
    scene3d: 'aiHistory',
    durationSec: 50,
    transition: 'cameraPush',
    speakerNotes: [
      'مرّ بسرعة على المحطات الخمس؛ الهدف فهم التطور وليس حفظ التواريخ.',
      'شدّد على أن ChatGPT جزء حديث من قصة بدأت قبل سنوات طويلة.',
    ],
  },
  {
    id: 'ai-is-not-a-trend',
    world: 'ai-world',
    index: 5,
    title: 'AI مش Trend.',
    type: 'statement',
    content: {
      statement: 'AI مش Trend.',
      steps: [
        { id: 'not-a-wave', text: 'مش موجة وبتروح.', emphasis: 'quiet' },
        { id: 'growing', text: 'AI عم يدخل أكثر بحياتنا ودراستنا وشغلنا.' },
        { id: 'wrong-question', text: 'السؤال مش: هل AI رح يختفي؟' },
        {
          id: 'right-question',
          text: 'السؤال: هل رح نعرف نستخدمه؟',
          emphasis: 'strong',
        },
      ],
    },
    scene3d: 'aiHistory',
    durationSec: 50,
    transition: 'statementReveal',
    speakerNotes: [
      'اقرأ الجملة الأخيرة ببطء واترك وقفة قبل السؤال.',
      'اسأل: برأيكم، هل AI رح يضل معنا بعد عشر سنين؟',
    ],
  },

  // ══════════════════════════════════════════════════════════════════
  // PART 02 — UNDERSTANDING AI · World 2: AI Lab · 8 min
  // ══════════════════════════════════════════════════════════════════
  {
    id: 'not-mind-reader',
    world: 'ai-lab',
    index: 6,
    title: 'AI مش قارئ أفكار.',
    type: 'interactive',
    content: {
      headline: 'AI مش قارئ أفكار.',
      keyMessage: 'AI يحتاج Context.',
    },
    scene3d: 'aiMind',
    interaction: 'mind-reader',
    durationSec: 120,
    transition: 'worldShift',
    speakerNotes: [
      'قل: أنا متوتر. ثم اسأل: AI بيعرف ليش؟ وانتظر الإجابات.',
      'إذا ما حدا جاوب، اطلب منهم يختاروا نعم أو لا برفع اليد.',
      'وضّح أن AI يحتاج المعلومات والسياق الذي نعطيه إياه.',
    ],
  },
  {
    id: 'context',
    world: 'ai-lab',
    index: 7,
    title: 'Context بيغيّر كل شي.',
    type: 'explain',
    content: {
      headline: 'Context بيغيّر كل شي.',
      subheadline: 'أي Prompt بيعطي AI معلومات أكثر؟',
      groups: [
        {
          id: 'weak',
          // The deck's own words for these two, from scenes 16 and 17.
          label: 'Prompt ضعيف',
          tone: 'negative',
          items: ['ساعدني أدرس.'],
        },
        {
          id: 'strong',
          label: 'Prompt أقوى',
          tone: 'positive',
          items: [
            'أنا طالب صف 11، عندي امتحان Biology بكرا. ساعدني أراجع أهم الأفكار.',
          ],
        },
      ],
      keyMessage:
        'كل ما أعطيت AI Context أوضح، صار عنده صورة أوضح عن المطلوب.',
    },
    scene3d: 'aiMind',
    durationSec: 100,
    transition: 'fade',
    speakerNotes: [
      'اعرض الـ Prompt الضعيف والقوي جنباً إلى جنب.',
      'اسأل أي واحد يعطي AI صورة أوضح عن المطلوب.',
      'إذا ما حدا جاوب، اطلب منهم تحديد المعلومات الإضافية الموجودة في الثاني.',
    ],
  },
  {
    id: 'not-magic',
    world: 'ai-lab',
    index: 8,
    title: 'AI مش سحر.',
    type: 'statement',
    content: {
      statement: 'AI مش سحر.',
      steps: [
        { id: 'you-prompt', text: 'أنت بتعطيه Prompt.' },
        {
          id: 'it-processes',
          text: 'AI بيعالج المعلومات والأنماط اللي تعلّم منها.',
        },
        { id: 'it-responds', text: 'وبعدين بيولّد Response.' },
      ],
      note: 'بس هيدا ما يعني إنه بيعرف كل شي.',
    },
    scene3d: 'aiMind',
    durationSec: 70,
    transition: 'statementReveal',
    speakerNotes: [
      'اربط المشهد بفكرة أن AI يعالج أنماطاً ويولّد Response.',
      'لا تدخل بتفاصيل تقنية؛ الهدف كسر فكرة أن AI يعرف كل شيء.',
    ],
  },
  {
    id: 'how-ai-works',
    world: 'ai-lab',
    index: 9,
    title: 'كيف بيشتغل AI؟',
    type: 'explain',
    content: {
      headline: 'كيف بيشتغل AI؟',
      // Stage ids must match AI_PIPELINE in src/data/aiPipeline.ts — the DOM
      // label and the 3D node that lights up are joined by these.
      steps: [
        { id: 'prompt', label: 'Prompt', text: 'شو طلبت من AI؟' },
        {
          id: 'tokens',
          label: 'Tokens',
          text: 'النص بيتقسّم لأجزاء يفهمها النموذج.',
        },
        {
          id: 'patterns',
          label: 'Patterns',
          text: 'النموذج يتعامل مع أنماط تعلّمها.',
        },
        {
          id: 'probability',
          label: 'Probability',
          text: 'بيتوقع شو الاحتمال الأنسب.',
          emphasis: 'strong',
        },
        { id: 'response', label: 'Response', text: 'بيولّد الجواب.' },
      ],
      keyMessage: 'AI بيتوقع، مش بيفكّر مثل الإنسان.',
    },
    scene3d: 'aiMind',
    durationSec: 110,
    transition: 'fade',
    speakerNotes: [
      'مرّر المراحل الخمس بالتسلسل: Prompt ثم Tokens ثم Patterns.',
      'عند Probability، شدّد أن AI يتوقع الاحتمال الأنسب.',
      'اختم بـ Response واربطها بما يراه الطالب على الشاشة.',
    ],
  },
  {
    id: 'why-ai-makes-mistakes',
    world: 'ai-lab',
    index: 10,
    title: 'طيب… ليش AI بيغلط؟',
    type: 'explain',
    content: {
      headline: 'طيب… ليش AI بيغلط؟',
      steps: [
        { id: 'incomplete', text: 'المعلومات ممكن تكون ناقصة.' },
        { id: 'misread', text: 'ممكن يفهم السؤال بطريقة غلط.' },
        {
          id: 'confident-wrong',
          text: 'ممكن يولّد جواب شكله مقنع لكنه غير صحيح.',
        },
      ],
      keyMessage: 'AI ممكن يحكي بثقة… وهو غلط.',
    },
    scene3d: 'aiMind',
    durationSec: 80,
    transition: 'fade',
    speakerNotes: [
      'اعرض الأسباب الثلاثة واحداً واحداً.',
      'اسأل: إذا كان الجواب شكله مقنع، هل يعني أنه صحيح؟',
      'إذا بقي الصف ساكتاً، أعطِ مثالاً بسيطاً عن معلومة يمكن التحقق منها.',
    ],
  },

  // ══════════════════════════════════════════════════════════════════
  // PART 03 — AI TOOLS · World 3: Study Lab · 13 min (parts 03–05)
  // ══════════════════════════════════════════════════════════════════
  {
    id: 'tools-overview',
    world: 'study-lab',
    index: 11,
    title: 'AI Toolbox',
    type: 'explain',
    content: {
      headline: 'AI Toolbox',
      subheadline: 'كل Tool إلها شغلة.',
      note: 'مش المهم تعرف 20 AI. المهم تعرف أي Tool تستخدم ولأي مهمة.',
    },
    scene3d: 'toolCity',
    durationSec: 50,
    transition: 'worldShift',
    speakerNotes: [
      'قدّم الفكرة: مش المطلوب تحفظ أسماء عشرات الأدوات.',
      'المهم تعرف أي Tool تناسب المهمة التي عندك.',
    ],
  },
  {
    id: 'study-tools',
    world: 'study-lab',
    index: 12,
    title: 'AI للدراسة.',
    type: 'explain',
    content: {
      headline: 'AI للدراسة.',
      groups: [
        {
          id: 'tools',
          label: 'الأدوات',
          items: ['ChatGPT', 'Claude', 'Gemini'],
        },
        {
          id: 'use-cases',
          label: 'حالات الاستخدام',
          tone: 'positive',
          items: [
            'شرح درس',
            'أسئلة تدريبية',
            'مراجعة',
            'خطة دراسة',
            'تبسيط فكرة',
          ],
        },
      ],
      keyMessage: 'اسأل: شو أفضل AI لهالمهمة؟',
    },
    scene3d: 'toolCity',
    durationSec: 55,
    transition: 'cameraPush',
    speakerNotes: [
      'وضّح أن الأدوات يمكن أن تساعد في الشرح والمراجعة والتدريب.',
      'اسأل الطلاب أي استخدام منها ممكن يساعدهم قبل الامتحان.',
      'إذا ما حدا جاوب، أعطِ مثالاً: تحويل درس إلى Quiz.',
    ],
  },
  {
    id: 'creative-tools',
    world: 'study-lab',
    index: 13,
    title: 'AI للإبداع.',
    type: 'explain',
    content: {
      headline: 'AI للإبداع.',
      groups: [
        {
          id: 'categories',
          label: 'الفئات',
          items: ['Images', 'Video', 'Design', 'Presentations'],
        },
        {
          id: 'examples',
          label: 'أمثلة',
          tone: 'positive',
          items: ['Canva AI', 'Gamma'],
        },
      ],
      keyMessage: 'من فكرة صغيرة… لشي فيك تشوفه.',
    },
    scene3d: 'toolCity',
    durationSec: 50,
    transition: 'cameraPush',
    speakerNotes: [
      'اعرض الفئات الأربع بسرعة: Images وVideo وDesign وPresentations.',
      'اسأل أي فئة ممكن يستخدموها لمشروع مدرسي.',
      'ذكّرهم أن AI يساعد في الإبداع ولا يلغي دور الشخص الذي يختار ويعدّل.',
    ],
  },
  {
    id: 'coding-tools',
    world: 'study-lab',
    index: 14,
    title: 'AI للبرمجة.',
    type: 'explain',
    content: {
      headline: 'AI للبرمجة.',
      groups: [
        {
          id: 'tools',
          label: 'الأدوات',
          items: ['ChatGPT', 'Claude', 'GitHub Copilot'],
        },
        {
          id: 'use-cases',
          label: 'حالات الاستخدام',
          tone: 'positive',
          items: [
            'فهم Code',
            'Debugging',
            'تعلّم Programming',
            'اكتشاف الأخطاء',
          ],
        },
      ],
      keyMessage: 'لا تخلي AI يكتب كل شي عنك. خليه يساعدك تفهم.',
    },
    scene3d: 'toolCity',
    durationSec: 50,
    transition: 'cameraPush',
    speakerNotes: [
      'ركّز على فهم Code وDebugging وليس نسخ الحلول.',
      'اسأل المبرمجين في الصف كيف ممكن AI يساعدهم يتعلموا.',
      'إذا لم يتفاعل أحد، أعطِ مثالاً: اطلب من AI شرح خطأ في Code.',
    ],
  },
  {
    id: 'which-ai-for-which-task',
    world: 'study-lab',
    index: 15,
    title: 'أي AI لأي مهمة؟',
    type: 'interactive',
    content: {
      headline: 'أي AI لأي مهمة؟',
      keyMessage: 'Tool ≠ Magic Tool',
    },
    scene3d: 'toolCity',
    interaction: 'tool-explorer',
    durationSec: 110,
    transition: 'fade',
    speakerNotes: [
      'اعرض كل مهمة واسأل الطلاب أي Tool يختارون ولماذا.',
      'إذا كان الصف ساكتاً، اطلب التصويت برفع اليد بين خيارين.',
      'لا تركّز على إجابة واحدة؛ ركّز على سبب اختيار الأداة.',
    ],
  },

  // ══════════════════════════════════════════════════════════════════
  // PART 04 — PROMPTING · World 3: Study Lab
  // ══════════════════════════════════════════════════════════════════
  {
    id: 'weak-prompt',
    world: 'study-lab',
    index: 16,
    title: 'Prompt ضعيف.',
    type: 'explain',
    content: {
      headline: 'Prompt ضعيف.',
      subheadline: 'شو المشكلة؟',
      example: 'اشرحلي Biology.',
      steps: [
        { id: 'no-context', text: 'ما في Context.' },
        { id: 'no-goal', text: 'ما في Goal واضح.' },
        { id: 'no-level', text: 'ما في مستوى محدد.' },
      ],
    },
    scene3d: 'aiMachine',
    durationSec: 55,
    transition: 'fade',
    speakerNotes: [
      'اعرض: اشرحلي Biology. واسأل: شو ناقص؟',
      'وجّه الطلاب نحو Context والهدف والمستوى المطلوب.',
      'إذا ما حدا جاوب، اسأل: هل AI بيعرف أي Chapter أو أي مستوى شرح؟',
    ],
  },
  {
    id: 'strong-prompt',
    world: 'study-lab',
    index: 17,
    title: 'Prompt أقوى.',
    type: 'explain',
    content: {
      headline: 'Prompt أقوى.',
      example:
        'أنا طالب صف 11. اشرحلي Photosynthesis بالعربي البسيط. أعطيني مثال من الحياة اليومية. وبعدين اختبرني بـ5 أسئلة.',
      steps: [
        { id: 'context', text: 'Context' },
        { id: 'goal', text: 'Goal' },
        { id: 'constraints', text: 'Constraints' },
        { id: 'output', text: 'Output' },
      ],
      keyMessage: 'نفس AI. بس السؤال صار أوضح.',
    },
    scene3d: 'aiMachine',
    durationSec: 55,
    transition: 'fade',
    speakerNotes: [
      'قارن الـ Prompt الجديد بالسابق واطلب من الطلاب اكتشاف المعلومات الإضافية.',
      'بيّن أن تحديد الجمهور والهدف وطريقة الإجابة يحسن النتيجة.',
      'أكد أن Prompt الجيد هو طريقة واضحة للتواصل مع AI.',
    ],
  },
  {
    id: 'prompt-framework',
    world: 'study-lab',
    index: 18,
    title: 'كيف تحكي مع AI؟',
    type: 'interactive',
    content: {
      headline: 'كيف تحكي مع AI؟',
      /*
        Rightward arrows are correct here, despite the RTL deck. The string
        contains no Arabic, so SectionTitle renders it as an LTR island (see
        src/lib/direction.ts) and it reads left to right like the Latin formula
        it is. Mirroring it would produce `Output ← Constraints`, which is not
        the framework backwards — it is nonsense.

        This is also the one line in the scene that predates content.json; the
        deck names the four stages separately as step labels. Kept because it is
        the memorable form, and recorded as an exception in deckFidelity.test.
      */
      subheadline: 'Context → Goal → Constraints → Output',
      keyMessage: 'AI ما بيقرأ أفكارك. علّمه شو بدك بوضوح.',
    },
    scene3d: 'aiMachine',
    interaction: 'prompt-lab',
    durationSec: 140,
    transition: 'fade',
    speakerNotes: [
      'ابنِ الإطار خطوة خطوة: Context ثم Goal ثم Constraints ثم Output.',
      'اسأل الطلاب عن مثال لكل خطوة باستخدام مهمة دراسية.',
      'إذا سكت الصف، أعطِ مثالاً واحداً واطلب منهم تحديد الخطوة التي يمثّلها.',
    ],
  },

  // ══════════════════════════════════════════════════════════════════
  // PART 05 — STUDY COMPANION · World 3: Study Lab
  // ══════════════════════════════════════════════════════════════════
  {
    id: 'study-companion',
    world: 'study-lab',
    index: 19,
    title: 'AI كـ Study Companion.',
    type: 'interactive',
    content: {
      headline: 'AI كـ Study Companion.',
      subheadline: 'AI ممكن يساعدك تدرس. مش يدرس عنك.',
      keyMessage: 'أنت بتضل الطالب. AI هو المساعد.',
    },
    scene3d: 'studyLab',
    interaction: 'study-companion',
    durationSec: 110,
    transition: 'cameraPush',
    speakerNotes: [
      'اعرض الأدوار الخمسة واسأل أي دور يمكن أن يساعدهم بالدراسة.',
      'إذا لم يتفاعلوا، اطلب منهم اختيار دور واحد برفع اليد.',
      'ذكّرهم: AI يساعدك كـ Companion، لكن أنت من يتعلم ويقرر.',
    ],
  },
  {
    id: 'ask-to-teach',
    world: 'study-lab',
    index: 20,
    title: 'خليه يعلّمك.',
    type: 'explain',
    content: {
      headline: 'خليه يعلّمك.',
      groups: [
        {
          id: 'avoid',
          label: 'تجنّب',
          tone: 'negative',
          items: ['اعطيني الجواب.', 'حلّها عني.'],
        },
        {
          id: 'try',
          label: 'جرّب',
          tone: 'positive',
          items: [
            'ساعدني أوصل للجواب.',
            'اسألني أسئلة بدل ما تعطيني الحل.',
            'اشرحلي وين غلطت.',
            'اختبرني.',
            'اعطيني Hint.',
          ],
        },
      ],
    },
    scene3d: 'studyLab',
    durationSec: 55,
    transition: 'fade',
    speakerNotes: [
      'اعرض Avoid أولاً ثم Try لتوضيح الفرق بين الحل الجاهز والتعلّم.',
      'اسأل أي جملة ستساعد الطالب يفهم أكثر.',
      'إذا لم يجاوبوا، خذ مثالاً واحداً وحوّله أمامهم من Avoid إلى Try.',
    ],
  },
  {
    id: 'ai-and-learning',
    world: 'study-lab',
    index: 21,
    title: 'AI والتعلّم.',
    type: 'explain',
    content: {
      headline: 'AI والتعلّم.',
      groups: [
        {
          id: 'ai-helps',
          label: 'ما يساعدك فيه AI',
          tone: 'positive',
          items: ['تفهم', 'تتدرّب', 'تبحث', 'تحسّن', 'تخلق'],
        },
        {
          id: 'ai-replaces',
          label: 'ما قد يستبدله AI',
          tone: 'negative',
          items: ['يكتب', 'يحل', 'يقرر', 'يفكر'],
        },
      ],
      keyMessage: 'الهدف مش تخلي AI يعمل أكتر. الهدف تخلي حالك تتعلم أكتر.',
    },
    scene3d: 'studyLab',
    durationSec: 50,
    transition: 'fade',
    speakerNotes: [
      'اقرأ العمودين كفكرة واحدة: AI يساعدك مقابل AI يعمل بدلاً منك.',
      'اسأل: أي جهة تساعدك تتعلم فعلاً؟',
      'أكد أن الهدف استخدام AI لتقوية مهارات الطالب.',
    ],
  },

  // ══════════════════════════════════════════════════════════════════
  // PART 06 — FRIEND WITH BOUNDARIES · World 4: Privacy · 11 min
  // ══════════════════════════════════════════════════════════════════
  {
    id: 'is-chatgpt-a-friend',
    world: 'privacy',
    index: 22,
    title: 'ChatGPT… صاحبك؟',
    type: 'explain',
    content: {
      headline: 'ChatGPT… صاحبك؟',
      steps: [
        {
          id: 'always-there',
          text: 'فيك تحكي مع AI الساعة 2 بالليل… وما يملّ، وما يقاطعك، ودايماً عنده وقت.',
        },
        {
          id: 'but',
          text: 'بس… هل هيدا يعني إنه صاحبك؟',
          emphasis: 'strong',
        },
      ],
    },
    scene3d: 'privacyVault',
    durationSec: 70,
    transition: 'worldShift',
    speakerNotes: [
      'استخدم السؤال كانتقال إلى موضوع الحدود والخصوصية.',
      'لا تقدّم AI كصديق حقيقي؛ ركّز على أنه أداة تتحدث بطريقة طبيعية.',
    ],
  },
  {
    id: 'why-ai-feels-like-a-friend',
    world: 'privacy',
    index: 23,
    title: 'ليش AI بيحسّسنا إنه قريب؟',
    type: 'explain',
    content: {
      headline: 'ليش AI بيحسّسنا إنه قريب؟',
      steps: [
        { id: 'fast', text: 'بيرد بسرعة.' },
        { id: 'remembers', text: 'بيتذكر Context المحادثة.' },
        { id: 'natural', text: 'بيحكي بطريقة طبيعية.' },
        { id: 'helpful', text: 'بيحاول يساعدك.' },
        { id: 'patient', text: 'وما عنده مشكلة تعيد السؤال عشر مرات.' },
      ],
      keyMessage:
        'طبيعي تحس إنك عم تحكي مع حدا. بس الإحساس مش دليل إنه إنسان.',
    },
    scene3d: 'privacyVault',
    durationSec: 70,
    transition: 'fade',
    speakerNotes: [
      'اعرض الأسباب الخمسة واحدة واحدة.',
      'اسأل: أي سبب يجعل المحادثة مع AI تبدو طبيعية أكثر؟',
      'اختم بالتأكيد أن الإحساس بالقرب لا يعني أن AI إنسان.',
    ],
  },
  {
    id: 'friend-lifecoach-secretkeeper',
    world: 'privacy',
    index: 24,
    title: 'Friend? Life Coach? Secret Keeper?',
    type: 'explain',
    content: {
      headline: 'Friend? Life Coach? Secret Keeper?',
      groups: [
        {
          id: 'roles',
          label: 'الأدوار',
          items: ['صاحب؟', 'Life Coach؟', 'Secret Keeper؟'],
        },
        {
          id: 'ai-can-be',
          label: 'ما يمكن أن يكونه AI',
          tone: 'positive',
          items: [
            'Study Companion',
            'Brainstorming Partner',
            'Practice Partner',
            'Productivity Assistant',
          ],
        },
        {
          id: 'boundaries',
          label: 'الحدود',
          tone: 'negative',
          items: [
            'مش بديل عن أهلك.',
            'مش بديل عن أصحابك.',
            'مش إنسان بيعرفك فعلاً.',
            'ومش مكان تحط فيه كل أسرارك.',
          ],
        },
      ],
    },
    scene3d: 'privacyVault',
    durationSec: 90,
    transition: 'fade',
    speakerNotes: [
      'مرّر الأعمدة الثلاثة من Roles إلى AI Can Be ثم Boundaries.',
      'اسأل: أي دور من هذه الأدوار مناسب لـ AI كأداة؟',
      'شدّد على أن AI ليس بديلاً عن العلاقات الحقيقية أو مكاناً للأسرار.',
    ],
  },

  // ══════════════════════════════════════════════════════════════════
  // PART 07 — PRIVACY · World 4: Privacy
  // ══════════════════════════════════════════════════════════════════
  {
    id: 'what-to-share',
    world: 'privacy',
    index: 25,
    title: 'شو فيك تشارك؟',
    type: 'explain',
    content: {
      headline: 'شو فيك تشارك؟',
      steps: [
        { id: 'homework', text: 'سؤال دراسي' },
        { id: 'project-idea', text: 'فكرة مشروع' },
        { id: 'exercise', text: 'تمرين' },
        { id: 'text-to-improve', text: 'نص بدك تحسّنه' },
        { id: 'general-topic', text: 'موضوع عام' },
      ],
      keyMessage:
        'قبل ما تبعت أي شي… اسأل حالك: هل هيدا الشي لازم يعرفه AI؟',
    },
    scene3d: 'privacyVault',
    durationSec: 70,
    transition: 'fade',
    speakerNotes: [
      'اعرض الأمثلة الخمسة كأشياء عامة يمكن استخدامها مع AI.',
      'اسأل قبل الانتقال: شو الشي المشترك بينها؟',
      'أوصلهم لقاعدة: اسأل حالك إذا AI فعلاً لازم يعرف هالشي.',
    ],
  },
  {
    id: 'what-not-to-share',
    world: 'privacy',
    index: 26,
    title: 'شو ما لازم تشارك؟',
    type: 'interactive',
    content: { headline: 'شو ما لازم تشارك؟' },
    scene3d: 'privacyVault',
    interaction: 'privacy-sorter',
    durationSec: 150,
    transition: 'fade',
    speakerNotes: [
      'حوّل المشهد إلى Sorting Game: خلي الطلاب يقرروا Safe أو Never.',
      'إذا بقي الصف ساكتاً، اقرأ كل عنصر واطلب رفع يد واحدة لخيار Safe ويدين لـ Never.',
      'بعد كل عنصر، أعطِ سبباً قصيراً خصوصاً للـ Password وOTP والمعلومات الشخصية.',
    ],
  },
  {
    id: 'ai-cybersecurity',
    world: 'privacy',
    index: 27,
    title: 'AI + Cybersecurity',
    type: 'interactive',
    content: {
      headline: 'AI + Cybersecurity',
      subheadline: 'مش كل شي بيبين حقيقي… حقيقي.',
      // The deck's five threats, verbatim. They stay in English: each is a
      // short technical term the students will meet in English anyway, and
      // Cybersecurity is already on the allowed-English list.
      steps: [
        { id: 'phishing', text: 'Phishing' },
        { id: 'fake-accounts', text: 'Fake accounts' },
        { id: 'ai-generated-scams', text: 'AI-generated scams' },
        { id: 'deepfakes', text: 'Deepfakes' },
        { id: 'impersonation', text: 'Impersonation' },
      ],
      keyMessage: 'AI صار يساعد المحتالين كمان.',
    },
    scene3d: 'cyberCity',
    interaction: 'real-or-fake',
    durationSec: 150,
    transition: 'worldShift',
    speakerNotes: [
      'عرّف كل تهديد بكلمة أو مثال سريع، بدون تحويل المشهد لمحاضرة Cybersecurity.',
      'اسأل: أي من هذه الأشياء ممكن يصعب اكتشافه إذا استخدم AI؟',
      'إذا لم يتفاعلوا، اعرض مثالاً عن رسالة Phishing أو Deepfake واسأل ماذا سيفعلون.',
    ],
  },
  {
    id: 'before-send',
    world: 'privacy',
    index: 28,
    title: 'قبل ما تضغط Send.',
    type: 'statement',
    content: {
      steps: [
        { id: 'what', text: 'شو عم ببعت؟' },
        { id: 'why', text: 'ليش عم ببعتو؟' },
        { id: 'necessary', text: 'هل لازم AI يعرف هالشي؟' },
      ],
      // The deck's keyMessage, promoted to the statement so this scene keeps
      // the presenter-stepped landing it was designed around.
      statement: 'AI مش Private Diary.',
    },
    scene3d: 'privacyVault',
    durationSec: 60,
    transition: 'statementReveal',
    speakerNotes: [
      'اعرض الأسئلة الثلاثة كفحص سريع قبل إرسال أي معلومة.',
      'اطلب من الطلاب حفظ السؤال الثالث تحديداً: هل لازم AI يعرف هالشي؟',
      'اختم بوضوح: AI مش Private Diary.',
    ],
  },

  // ══════════════════════════════════════════════════════════════════
  // PART 08 — DEPENDENCE · World 5: Future City · 8 min (parts 08–09)
  // ══════════════════════════════════════════════════════════════════
  {
    id: 'tool-vs-replacement',
    world: 'future',
    index: 29,
    title: 'AI يساعدك أم يستبدلك؟',
    type: 'explain',
    content: {
      headline: 'AI يساعدك أم يستبدلك؟',
      groups: [
        {
          id: 'healthy-use',
          label: 'الاستخدام الصحي',
          tone: 'positive',
          items: [
            'ساعدني أفهم.',
            'اختبرني.',
            'وين غلطت؟',
            'ساعدني أحسن فكرتي.',
          ],
        },
        {
          id: 'dependency',
          label: 'الاعتماد',
          tone: 'negative',
          items: [
            'اعمل كل شي عني.',
            'اعطيني الجواب.',
            'اكتب كل شي.',
            'فكّر عني.',
          ],
        },
      ],
    },
    scene3d: 'dependency',
    durationSec: 80,
    transition: 'worldShift',
    speakerNotes: [
      'اعرض Healthy Use مقابل Dependency وخلّي الفرق واضحاً من الأمثلة.',
      'اسأل أي مجموعة تساعد الطالب يتعلم أكثر.',
      'أكد أن استخدام AI ليس المشكلة؛ المشكلة أن يفكر ويعمل بدلاً من الطالب دائماً.',
    ],
  },
  {
    id: 'dependency',
    world: 'future',
    index: 30,
    title: 'إذا اختفى AI لمدة أسبوع، هل بتقدر تكمل؟',
    type: 'interactive',
    content: {
      headline: 'إذا اختفى AI لمدة أسبوع، هل بتقدر تكمل؟',
      keyMessage:
        'المشكلة مش إنك تستخدم AI. المشكلة لما ما تعود تعرف تعمل شي بدونه.',
    },
    scene3d: 'dependency',
    interaction: 'dependency',
    durationSec: 130,
    transition: 'fade',
    speakerNotes: [
      'اعرض الخيارات الأربعة وقل للطلاب إن ما في جواب غلط أو محرج.',
      'إذا كان الصف ساكتاً، اطلب منهم اختيار رقم من 1 إلى 4 بأصابعهم.',
      'لا تحكم على الإجابات؛ اربطها بفكرة الحفاظ على المهارات الأساسية.',
    ],
  },

  // ══════════════════════════════════════════════════════════════════
  // PART 09 — FUTURE · World 5: Future City
  // ══════════════════════════════════════════════════════════════════
  {
    id: 'non-ai-user',
    world: 'future',
    index: 31,
    title: 'شو عن الشخص اللي ما بيستخدم AI؟',
    type: 'explain',
    content: {
      headline: 'شو عن الشخص اللي ما بيستخدم AI؟',
      groups: [
        {
          id: 'never',
          label: 'ما بيستخدم AI أبداً',
          tone: 'negative',
          items: ['ممكن يفوّت أدوات وفرص مفيدة.'],
        },
        {
          id: 'always',
          label: 'بيستخدم AI لكل شي',
          tone: 'negative',
          items: ['ممكن يصير معتمد عليه.'],
        },
        {
          id: 'knows-when',
          label: 'بيعرف إمتى وكيف يستخدم AI',
          tone: 'positive',
          items: ['هون القوة.'],
        },
      ],
      keyMessage:
        'مش المطلوب تستخدم AI بكل شي. المطلوب تعرف إمتى تستخدمه، كيف تستخدمه، وإمتى ما تستخدمه.',
    },
    scene3d: 'futureCity',
    durationSec: 70,
    transition: 'cameraPush',
    speakerNotes: [
      'اعرض الملفات الثلاثة بدون وصف أي شخص بأنه أفضل أو أسوأ.',
      'اسأل: وين المشكلة إذا ما استخدمنا AI أبداً؟ ووين المشكلة إذا استخدمناه لكل شي؟',
      'اختم بأن القوة هي معرفة إمتى وكيف نستخدم AI.',
    ],
  },
  {
    id: 'future-jobs',
    world: 'future',
    index: 32,
    title: 'AI ومستقبلك.',
    type: 'interactive',
    content: {
      headline: 'AI ومستقبلك.',
      subheadline: 'هل AI رح ياخد وظائفنا؟',
      keyMessage:
        'المنافس مش دائماً AI. أحياناً المنافس هو شخص بيعرف يشتغل مع AI.',
    },
    scene3d: 'futureCity',
    interaction: 'career',
    durationSec: 130,
    transition: 'fade',
    speakerNotes: [
      'اعرض الوظائف الست واسأل الطلاب أي وظيفة يريدون مناقشتها أولاً.',
      'لكل وظيفة، ركّز على المهام التي قد يساعد فيها AI والمهارات البشرية التي تبقى مهمة.',
      'إذا لم يتفاعلوا، اختر وظيفة مألوفة مثل الطبيب أو المطوّر وابدأ منها.',
      'اختم: المنافس مش دائماً AI؛ أحياناً شخص بيعرف يشتغل مع AI.',
    ],
  },
  {
    id: 'final',
    world: 'future',
    index: 33,
    title: 'خلي AI يساعدك، مش يفكّر بدالك.',
    type: 'cinematic',
    content: {
      // The closing sequence, specified verbatim in the brief.
      steps: [
        { id: 'not-magic', text: 'AI مش سحر.', emphasis: 'normal' },
        { id: 'not-mind-reader', text: 'AI مش قارئ أفكار.', emphasis: 'normal' },
        { id: 'not-replacement', text: 'AI مش بديل عنك.', emphasis: 'normal' },
        { id: 'is-a-tool', text: 'AI أداة.', emphasis: 'strong' },
      ],
      statement: 'خلي AI يساعدك، مش يفكّر بدالك.',
      // The deck contains no entrepreneurship content, so this slot stays open
      // rather than being filled with invented copy. See PROJECT-STATUS.md §7.
      note: TODO('محتوى ريادة الأعمال (Entrepreneurship) قبل الرسالة الأخيرة'),
    },
    scene3d: 'finale',
    durationSec: 70,
    transition: 'statementReveal',
    speakerNotes: [
      'اقرأ كل جملة ببطء مع توقف قصير بينها.',
      'خلي الرسالة الأخيرة تبقى على الشاشة قبل إنهاء العرض.',
    ],
  },
] as const

export const TOTAL_SCENES = SCENES.length

/** Arabic names for the scene types, shown in the presenter panel. */
export const SCENE_TYPE_LABELS_AR: Record<SceneType, string> = {
  statement: 'جملة',
  explain: 'شرح',
  interactive: 'تفاعل',
  cinematic: 'مشهد',
}

export const SCENE_BY_ID = new Map(SCENES.map((s) => [s.id, s]))
