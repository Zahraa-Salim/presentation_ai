import type { SceneDef } from '@/types'
import { TODO } from '@/lib/todo'

/**
 * The 33 presentation moments, in running order.
 *
 * SOURCE OF TRUTH: the original presentation deck. Titles and copy that the
 * brief specified verbatim are used as-is. Everything else is marked TODO —
 * no educational content is invented here.
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
      note: TODO('نص الافتتاحية'),
    },
    scene3d: 'opening',
    durationSec: 60,
    transition: 'statementReveal',
    speakerNotes: [],
  },
  {
    id: 'do-you-use-ai',
    world: 'ai-world',
    index: 2,
    title: 'هل أنت تستخدم AI أم AI يستخدمك؟',
    type: 'interactive',
    content: { headline: 'هل أنت تستخدم AI أم AI يستخدمك؟' },
    scene3d: 'opening',
    interaction: 'opening-poll',
    durationSec: 90,
    transition: 'fade',
    speakerNotes: [],
  },
  {
    id: 'ai-today',
    world: 'ai-world',
    index: 3,
    title: 'AI موجود اليوم',
    type: 'explain',
    content: { headline: 'AI موجود اليوم', note: TODO('أمثلة من يوم الطالب') },
    scene3d: 'opening',
    durationSec: 50,
    transition: 'fade',
    speakerNotes: [],
  },
  {
    id: 'ai-not-new',
    world: 'ai-world',
    index: 4,
    title: 'AI مش جديد',
    type: 'explain',
    content: { headline: 'AI مش جديد', note: TODO('محطات من تاريخ الـ AI') },
    scene3d: 'aiHistory',
    durationSec: 50,
    transition: 'cameraPush',
    speakerNotes: [],
  },
  {
    id: 'ai-not-trend',
    world: 'ai-world',
    index: 5,
    title: 'AI مش Trend',
    type: 'statement',
    content: { statement: 'AI مش Trend', note: TODO('نص الشرح') },
    scene3d: 'aiHistory',
    durationSec: 50,
    transition: 'statementReveal',
    speakerNotes: [],
  },

  // ══════════════════════════════════════════════════════════════════
  // PART 02 — UNDERSTANDING AI · World 2: AI Lab · 8 min
  // ══════════════════════════════════════════════════════════════════
  {
    id: 'not-a-mind-reader',
    world: 'ai-lab',
    index: 6,
    title: 'AI مش قارئ أفكار',
    type: 'interactive',
    content: { headline: 'AI مش قارئ أفكار' },
    scene3d: 'aiMind',
    interaction: 'mind-reader',
    durationSec: 120,
    transition: 'worldShift',
    speakerNotes: [],
  },
  {
    id: 'context',
    world: 'ai-lab',
    index: 7,
    title: 'Context',
    type: 'explain',
    content: { headline: 'Context', note: TODO('شرح الـ Context') },
    scene3d: 'aiMind',
    durationSec: 100,
    transition: 'fade',
    speakerNotes: [],
  },
  {
    id: 'not-magic',
    world: 'ai-lab',
    index: 8,
    title: 'AI مش سحر',
    type: 'statement',
    content: { statement: 'AI مش سحر', note: TODO('نص الشرح') },
    scene3d: 'aiMind',
    durationSec: 70,
    transition: 'statementReveal',
    speakerNotes: [],
  },
  {
    id: 'how-ai-works',
    world: 'ai-lab',
    index: 9,
    title: 'كيف يعمل؟',
    type: 'explain',
    content: {
      headline: 'كيف يعمل؟',
      // Stage ids must match AI_PIPELINE in src/data/aiPipeline.ts — the DOM
      // label and the 3D node that lights up are joined by these.
      steps: [
        { id: 'prompt', text: TODO('شرح مرحلة Prompt') },
        { id: 'tokens', text: TODO('شرح مرحلة tokens') },
        { id: 'patterns', text: TODO('شرح مرحلة patterns') },
        { id: 'probability', text: TODO('شرح مرحلة probability'), emphasis: 'strong' },
        { id: 'response', text: TODO('شرح مرحلة response') },
      ],
    },
    scene3d: 'aiMind',
    durationSec: 110,
    transition: 'fade',
    speakerNotes: [],
  },
  {
    id: 'why-ai-makes-mistakes',
    world: 'ai-lab',
    index: 10,
    title: 'لماذا يخطئ؟',
    type: 'explain',
    content: {
      headline: 'لماذا يخطئ؟',
      note: TODO('الأخطاء والـ Hallucinations'),
    },
    scene3d: 'aiMind',
    durationSec: 80,
    transition: 'fade',
    speakerNotes: [],
  },

  // ══════════════════════════════════════════════════════════════════
  // PART 03 — AI TOOLS · World 3: Study Lab · 13 min (parts 03–05)
  // ══════════════════════════════════════════════════════════════════
  {
    id: 'tools-overview',
    world: 'study-lab',
    index: 11,
    title: TODO('عنوان: AI tools overview'),
    type: 'explain',
    content: { headline: TODO('عنوان: AI tools overview') },
    scene3d: 'toolCity',
    durationSec: 50,
    transition: 'worldShift',
    speakerNotes: [],
  },
  {
    id: 'study-tools',
    world: 'study-lab',
    index: 12,
    title: TODO('عنوان: Study tools'),
    type: 'explain',
    content: { headline: TODO('عنوان: Study tools') },
    scene3d: 'toolCity',
    durationSec: 55,
    transition: 'cameraPush',
    speakerNotes: [],
  },
  {
    id: 'creative-tools',
    world: 'study-lab',
    index: 13,
    title: TODO('عنوان: Creative tools'),
    type: 'explain',
    content: { headline: TODO('عنوان: Creative tools') },
    scene3d: 'toolCity',
    durationSec: 50,
    transition: 'cameraPush',
    speakerNotes: [],
  },
  {
    id: 'coding-tools',
    world: 'study-lab',
    index: 14,
    title: TODO('عنوان: Coding tools'),
    type: 'explain',
    content: { headline: TODO('عنوان: Coding tools') },
    scene3d: 'toolCity',
    durationSec: 50,
    transition: 'cameraPush',
    speakerNotes: [],
  },
  {
    id: 'which-ai-for-which-task',
    world: 'study-lab',
    index: 15,
    title: TODO('عنوان: Which AI for which task?'),
    type: 'interactive',
    content: { headline: TODO('عنوان: Which AI for which task?') },
    scene3d: 'toolCity',
    interaction: 'tool-explorer',
    durationSec: 110,
    transition: 'fade',
    speakerNotes: [],
  },

  // ══════════════════════════════════════════════════════════════════
  // PART 04 — PROMPTING · World 3: Study Lab
  // ══════════════════════════════════════════════════════════════════
  {
    id: 'weak-prompt',
    world: 'study-lab',
    index: 16,
    title: 'Prompt ضعيف',
    type: 'explain',
    content: { headline: 'Prompt ضعيف', note: TODO('مثال الـ Prompt الضعيف') },
    scene3d: 'aiMachine',
    durationSec: 55,
    transition: 'fade',
    speakerNotes: [],
  },
  {
    id: 'strong-prompt',
    world: 'study-lab',
    index: 17,
    title: 'Prompt قوي',
    type: 'explain',
    content: { headline: 'Prompt قوي', note: TODO('مثال الـ Prompt القوي') },
    scene3d: 'aiMachine',
    durationSec: 55,
    transition: 'fade',
    speakerNotes: [],
  },
  {
    id: 'prompt-formula',
    world: 'study-lab',
    index: 18,
    title: 'Context → Goal → Constraints → Output',
    type: 'interactive',
    content: { headline: 'Context → Goal → Constraints → Output' },
    scene3d: 'aiMachine',
    interaction: 'prompt-lab',
    durationSec: 140,
    transition: 'fade',
    speakerNotes: [],
  },

  // ══════════════════════════════════════════════════════════════════
  // PART 05 — STUDY COMPANION · World 3: Study Lab
  // ══════════════════════════════════════════════════════════════════
  {
    id: 'study-companion',
    world: 'study-lab',
    index: 19,
    title: TODO('عنوان: AI as study companion'),
    type: 'interactive',
    content: { headline: TODO('عنوان: AI as study companion') },
    scene3d: 'studyLab',
    interaction: 'study-companion',
    durationSec: 110,
    transition: 'cameraPush',
    speakerNotes: [],
  },
  {
    id: 'ask-to-teach',
    world: 'study-lab',
    index: 20,
    title: TODO("عنوان: Don't ask AI for answers; ask it to teach"),
    type: 'explain',
    content: {
      headline: TODO("عنوان: Don't ask AI for answers; ask it to teach"),
    },
    scene3d: 'studyLab',
    durationSec: 55,
    transition: 'fade',
    speakerNotes: [],
  },
  {
    id: 'ai-and-learning',
    world: 'study-lab',
    index: 21,
    title: TODO('عنوان: AI + learning'),
    type: 'explain',
    content: { headline: TODO('عنوان: AI + learning') },
    scene3d: 'studyLab',
    durationSec: 50,
    transition: 'fade',
    speakerNotes: [],
  },

  // ══════════════════════════════════════════════════════════════════
  // PART 06 — FRIEND WITH BOUNDARIES · World 4: Privacy · 11 min
  // ══════════════════════════════════════════════════════════════════
  {
    id: 'is-chatgpt-a-friend',
    world: 'privacy',
    index: 22,
    title: TODO('عنوان: Is ChatGPT a friend?'),
    type: 'explain',
    content: { headline: TODO('عنوان: Is ChatGPT a friend?') },
    scene3d: 'privacyVault',
    durationSec: 70,
    transition: 'worldShift',
    speakerNotes: [],
  },
  {
    id: 'why-ai-feels-like-a-friend',
    world: 'privacy',
    index: 23,
    title: TODO('عنوان: Why AI feels like a friend'),
    type: 'explain',
    content: { headline: TODO('عنوان: Why AI feels like a friend') },
    scene3d: 'privacyVault',
    durationSec: 70,
    transition: 'fade',
    speakerNotes: [],
  },
  {
    id: 'friend-lifecoach-secretkeeper',
    world: 'privacy',
    index: 24,
    title: TODO('عنوان: Friend? Life Coach? Secret Keeper?'),
    type: 'explain',
    content: { headline: TODO('عنوان: Friend? Life Coach? Secret Keeper?') },
    scene3d: 'privacyVault',
    durationSec: 90,
    transition: 'fade',
    speakerNotes: [],
  },

  // ══════════════════════════════════════════════════════════════════
  // PART 07 — PRIVACY · World 4: Privacy
  // ══════════════════════════════════════════════════════════════════
  {
    id: 'what-to-share',
    world: 'privacy',
    index: 25,
    title: TODO('عنوان: What should you share?'),
    type: 'explain',
    content: { headline: TODO('عنوان: What should you share?') },
    scene3d: 'privacyVault',
    durationSec: 70,
    transition: 'fade',
    speakerNotes: [],
  },
  {
    id: 'never-share',
    world: 'privacy',
    index: 26,
    title: TODO('عنوان: What should you never share?'),
    type: 'interactive',
    content: { headline: TODO('عنوان: What should you never share?') },
    scene3d: 'privacyVault',
    interaction: 'privacy-sorter',
    durationSec: 150,
    transition: 'fade',
    speakerNotes: [],
  },
  {
    id: 'ai-cybersecurity',
    world: 'privacy',
    index: 27,
    title: TODO('عنوان: AI + cybersecurity'),
    type: 'interactive',
    content: {
      headline: TODO('عنوان: AI + cybersecurity'),
      note: TODO('Phishing / Deepfakes / Scams / Social engineering'),
    },
    scene3d: 'cyberCity',
    interaction: 'real-or-fake',
    durationSec: 150,
    transition: 'worldShift',
    speakerNotes: [],
  },
  {
    id: 'privacy-rule',
    world: 'privacy',
    index: 28,
    title: TODO('عنوان: Privacy rule'),
    type: 'statement',
    content: { statement: TODO('قاعدة الخصوصية') },
    scene3d: 'privacyVault',
    durationSec: 60,
    transition: 'statementReveal',
    speakerNotes: [],
  },

  // ══════════════════════════════════════════════════════════════════
  // PART 08 — DEPENDENCE · World 5: Future City · 8 min (parts 08–09)
  // ══════════════════════════════════════════════════════════════════
  {
    id: 'tool-vs-replacement',
    world: 'future',
    index: 29,
    title: TODO('عنوان: AI as tool vs replacement'),
    type: 'explain',
    content: { headline: TODO('عنوان: AI as tool vs replacement') },
    scene3d: 'dependency',
    durationSec: 80,
    transition: 'worldShift',
    speakerNotes: [],
  },
  {
    id: 'if-ai-disappeared',
    world: 'future',
    index: 30,
    title: TODO('عنوان: What if AI disappeared?'),
    type: 'interactive',
    content: { headline: TODO('عنوان: What if AI disappeared?') },
    scene3d: 'dependency',
    interaction: 'dependency',
    durationSec: 130,
    transition: 'fade',
    speakerNotes: [],
  },

  // ══════════════════════════════════════════════════════════════════
  // PART 09 — FUTURE · World 5: Future City
  // ══════════════════════════════════════════════════════════════════
  {
    id: 'people-who-dont-use-ai',
    world: 'future',
    index: 31,
    title: TODO("عنوان: What about people who don't use AI?"),
    type: 'explain',
    content: { headline: TODO("عنوان: What about people who don't use AI?") },
    scene3d: 'futureCity',
    durationSec: 70,
    transition: 'cameraPush',
    speakerNotes: [],
  },
  {
    id: 'jobs-and-skills',
    world: 'future',
    index: 32,
    title: TODO('عنوان: Jobs + future skills'),
    type: 'interactive',
    content: {
      headline: TODO('عنوان: Jobs + future skills'),
      note: TODO('AI Literacy'),
    },
    scene3d: 'futureCity',
    interaction: 'career',
    durationSec: 130,
    transition: 'fade',
    speakerNotes: [],
  },
  {
    id: 'final-message',
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
      note: TODO('محتوى ريادة الأعمال (Entrepreneurship) قبل الرسالة الأخيرة'),
    },
    scene3d: 'finale',
    durationSec: 70,
    transition: 'statementReveal',
    speakerNotes: [],
  },
] as const

export const TOTAL_SCENES = SCENES.length

export const SCENE_BY_ID = new Map(SCENES.map((s) => [s.id, s]))
