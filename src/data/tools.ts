import type { ToolDef } from '@/types'

/**
 * AI tools shown in the Tool Explorer (Interaction D) and the tool scenes.
 *
 * Chosen for what a Grade 11 student in Lebanon can actually reach,
 * preferring a usable free tier. Source: content-3.json.
 *
 * `limitationsAr` is the field that matters most. The tools section sits
 * downstream of the scene that argues AI is not magic, and a list of
 * capabilities with no honest limits would quietly undo it — so every tool
 * here names what it gets wrong.
 */
export const TOOLS: readonly ToolDef[] = [
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    category: 'study',
    useCasesAr: [
      'شرح الدروس',
      'التدريب والأسئلة',
      'العصف الذهني',
    ],
    strengthsAr: [
      'مفيد لمهام كثيرة',
      'محادثة سهلة وطبيعية',
      'مناسب للتعلّم خطوة بخطوة',
    ],
    limitationsAr: [
      'ممكن يعطي معلومات غلط بثقة',
      'لازم تتحقق من المعلومات المهمة',
      'بعض الميزات المتقدمة ممكن تكون مدفوعة',
    ],
  },
  {
    id: 'claude',
    name: 'Claude',
    category: 'writing',
    useCasesAr: [
      'فهم نصوص طويلة',
      'تحسين الكتابة',
      'تحليل الأفكار',
    ],
    strengthsAr: [
      'ممتاز مع النصوص الطويلة',
      'مفيد للكتابة والتحليل',
      'مناسب للمحادثات التفصيلية',
    ],
    limitationsAr: [
      'ممكن يخطئ بالمعلومات',
      'بعض الاستخدامات والميزات محدودة بالخطة',
      'لازم تتحقق من المصادر المهمة',
    ],
  },
  {
    id: 'gemini',
    name: 'Gemini',
    category: 'research',
    useCasesAr: [
      'البحث',
      'تلخيص المعلومات',
      'مساعدة بالدراسة',
    ],
    strengthsAr: [
      'مفيد للبحث والاستكشاف',
      'مناسب لمهام الدراسة',
      'تكامل جيد مع خدمات Google',
    ],
    limitationsAr: [
      'ممكن يعطي معلومات غير دقيقة',
      'نتائج البحث لازم تنراجع',
      'بعض الميزات مرتبطة بالخطة أو المنطقة',
    ],
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    category: 'research',
    useCasesAr: [
      'البحث عن موضوع',
      'مقارنة المعلومات',
      'العثور على مصادر',
    ],
    strengthsAr: [
      'مفيد للبحث السريع',
      'يعرض مصادر مع الإجابات',
      'مناسب لبدء Research',
    ],
    limitationsAr: [
      'وجود مصدر لا يعني أن الإجابة صحيحة',
      'بعض الميزات المتقدمة مدفوعة',
      'لازم تفتح المصادر وتتأكد منها',
    ],
  },
  {
    id: 'canva-ai',
    name: 'Canva AI',
    category: 'creative',
    useCasesAr: [
      'تصميم Presentations',
      'إنشاء Images',
      'تصميم منشورات',
    ],
    strengthsAr: [
      'سهل للمبتدئين',
      'قوالب وتصاميم كثيرة',
      'مفيد للمشاريع المدرسية',
    ],
    limitationsAr: [
      'بعض العناصر والميزات مدفوعة',
      'AI ممكن يولّد تصميماً يحتاج تعديلات',
      'النص العربي داخل بعض التصاميم قد يحتاج مراجعة',
    ],
  },
  {
    id: 'gamma',
    name: 'Gamma',
    category: 'creative',
    useCasesAr: [
      'إنشاء Presentations',
      'تنظيم الأفكار',
      'تحويل النص إلى عرض',
    ],
    strengthsAr: [
      'سريع في بناء العرض الأولي',
      'يساعد بتنظيم المحتوى',
      'مفيد لتجربة أفكار مختلفة',
    ],
    limitationsAr: [
      'النسخة المجانية محدودة',
      'النتيجة تحتاج مراجعة وتعديل',
      'التنسيق العربي قد يحتاج ضبطاً',
    ],
  },
  {
    id: 'github-copilot',
    name: 'GitHub Copilot',
    category: 'coding',
    useCasesAr: [
      'اقتراح Code',
      'شرح Code',
      'المساعدة في Debugging',
    ],
    strengthsAr: [
      'مفيد داخل بيئة البرمجة',
      'يسرّع كتابة Code',
      'يساعد على فهم بعض الأخطاء',
    ],
    limitationsAr: [
      'الاقتراح ممكن يكون غلط أو غير آمن',
      'لازم تفهم وتراجع الـCode',
      'بعض الخطط والميزات مدفوعة',
    ],
  },
  {
    id: 'cursor',
    name: 'Cursor',
    category: 'coding',
    useCasesAr: [
      'كتابة Code',
      'شرح المشاريع',
      'Debugging',
    ],
    strengthsAr: [
      'مفيد لفهم Code داخل المشروع',
      'يساعد بتعديل أكثر من ملف',
      'مناسب لتجربة أفكار برمجية بسرعة',
    ],
    limitationsAr: [
      'ممكن يقترح تعديلات خاطئة',
      'لازم تراجع التغييرات قبل اعتمادها',
      'الاستخدام والميزات المتقدمة محدودة بالخطة',
    ],
  },
  {
    id: 'notion-ai',
    name: 'Notion AI',
    category: 'writing',
    useCasesAr: [
      'تنظيم الملاحظات',
      'تلخيص النصوص',
      'تحسين الكتابة',
    ],
    strengthsAr: [
      'مفيد لتنظيم الدراسة',
      'يجمع الملاحظات والـAI بمكان واحد',
      'سهل لإدارة الأفكار',
    ],
    limitationsAr: [
      'بعض ميزات AI محدودة بالخطة',
      'التلخيص ممكن يفوّت تفاصيل',
      'لازم تراجع المحتوى قبل الاعتماد عليه',
    ],
  },
  {
    id: 'lovable',
    name: 'Lovable',
    category: 'startup',
    useCasesAr: [
      'بناء Prototype',
      'تجربة فكرة Website',
      'تحويل فكرة إلى مشروع أولي',
    ],
    strengthsAr: [
      'يساعد المبتدئ يبدأ بسرعة',
      'مفيد لتجربة أفكار المنتجات',
      'يقلل الوقت المطلوب لبناء Prototype',
    ],
    limitationsAr: [
      'المشروع الناتج يحتاج مراجعة واختبار',
      'المشاريع الأكبر تحتاج فهم تقني',
      'الاستخدام المجاني محدود',
    ],
  },
  {
    id: 'google-ai-studio',
    name: 'Google AI Studio',
    category: 'startup',
    useCasesAr: [
      'تجربة أفكار AI',
      'بناء Prototypes',
      'تجربة Generative AI',
    ],
    strengthsAr: [
      'مفيد لتجربة نماذج Gemini',
      'مناسب للتجارب الأولية',
      'مفيد للطلاب المهتمين ببناء مشاريع AI',
    ],
    limitationsAr: [
      'يحتاج فهم أساسي للتقنية عند بناء مشاريع حقيقية',
      'المخرجات ممكن تحتاج مراجعة',
      'بعض الاستخدامات تعتمد على حدود الخدمة والحساب',
    ],
  },
] as const
