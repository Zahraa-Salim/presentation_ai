# CONTENT PROMPT — paste everything below the line into ChatGPT

This asks for **exactly** the 85 missing content slots, keyed by the ids the code
already uses, so the result drops straight into `src/data/` with no rewriting.

**How to use it**
1. Copy everything below the horizontal rule into ChatGPT (GPT-5 or better).
2. It returns one JSON block. Save it as `content.json` in the project root.
3. Tell me it's there and I'll merge it into `src/data/`, then re-run the tests —
   the `⟦TODO⟧` count should drop from 85 toward 0.

**If you'd rather do it in pieces**, ask for one section at a time: `scenes`,
then `interactions`, then `tools`, then `speakerNotes`. Quality is usually better
in smaller batches, and the JSON merges fine section by section.

**Review it as the author.** Anything ChatGPT writes here is a draft of *your*
lesson, not a source of truth — especially the tool list, which dates fast.

---

You are helping me write the Arabic script for a 45-minute interactive lesson
that teaches **Grade 11 students in Lebanon (ages 16–17)** how to use AI
intelligently.

The app is already built. I need **only the text**, returned as JSON keyed by
the exact ids below. Do not redesign the lesson, do not add or remove scenes, do
not rename ids.

## Core message

**خلي AI يساعدك، مش يفكّر بدالك.** ("Let AI help you, not think for you.")

Three threads run through the whole lesson: AI is not magic · AI is not a mind
reader · AI is not a replacement for you. Every line you write should serve one
of those.

## Language rules — important

- **Arabic is dominant.** The presentation is right-to-left.
- **Headlines, questions and interactive prompts:** simple conversational
  Lebanese Arabic. Natural for a 16-year-old — not formal, not academic, not
  childish, and not heavy slang.
- **Explanations and body copy:** simple Modern Standard Arabic, easy to read
  aloud.
- **Keep these in English** (do not translate): AI, Prompt, Context, Machine
  Learning, Deep Learning, Generative AI, Cybersecurity, AI Literacy, Password,
  OTP, ID, Phishing, Deepfake, and all product names (ChatGPT, Claude, ...).
- **One screen = one idea.** Students read this projected from the back of a
  classroom.

## Length limits — these are hard

| Field | Limit |
|---|---|
| `title` / `headline` | max 6 words. Short and punchy. |
| `note` | max 2 short lines, ~20 words total |
| `statement` | one sentence, max 8 words |
| step text | max 12 words |
| interaction `promptAr` | one question, max 10 words |
| `facilitationAr` line | max 15 words |
| speaker note | max 15 words per bullet |

## Rules

1. **Never invent statistics, percentages or research citations.** This lesson teaches
   students not to take AI output at face value — fabricated numbers would
   undercut it. If a point needs evidence, phrase it qualitatively.
2. **Never encourage emotional dependency on AI.** The tone is "AI is a tool that
   helps you," never "AI is your best friend."
3. **Do not moralize or lecture.** Grade 11 students switch off. Be concrete and
   a bit playful.
4. Some text is **already fixed** and appears below marked `[FIXED]`. Do not
   change it — write around it so everything stays consistent with it.

## Already fixed — do not rewrite, but stay consistent with

- Scene 1 title: `AI: كيف نستخدمه بذكاء؟`
- Scene 2: `هل أنت تستخدم AI أم AI يستخدمك؟` — poll `هل استخدمت AI من قبل؟`
  with choices `نعم` / `أحياناً` / `أبداً`
- Scene 3: `AI موجود اليوم` · Scene 4: `AI مش جديد` · Scene 5: `AI مش Trend`
- Scene 6: `AI مش قارئ أفكار` — the mind-reader statement is `أنا متوتر.` and
  the question is `AI بيعرف ليش؟`
- Scene 7: `Context` · Scene 8: `AI مش سحر` · Scene 9: `كيف يعمل؟` ·
  Scene 10: `لماذا يخطئ؟`
- Scene 16: `Prompt ضعيف` · Scene 17: `Prompt قوي` — the weak prompt example is
  `اشرحلي Biology.`
- Scene 18: `Context → Goal → Constraints → Output`
- Scene 33 closing sequence, in order: `AI مش سحر.` → `AI مش قارئ أفكار.` →
  `AI مش بديل عنك.` → `AI أداة.` → `خلي AI يساعدك، مش يفكّر بدالك.`

---

# What to write

## A. Scene text

Each scene has a time budget in seconds — keep the copy readable within it.
Where a scene needs both `title` and `headline`, **they are the same text**, so
give one value under `title` and I'll use it for both.

### World 1 — AI World (5 min)

| id | # | Needs | Sec | Context |
|---|---|---|---|---|
| `opening` | 1 | `note` | 60 | Opening line under the title `AI: كيف نستخدمه بذكاء؟` [FIXED]. Sets the tone for the whole session. |
| `ai-today` | 3 | `note` | 50 | Examples of AI already in a Lebanese student's day — phone, social feed, maps, camera. Concrete, familiar. |
| `ai-not-new` | 4 | `note` | 50 | One line introducing the idea that AI has a 70-year history, over a timeline. |
| `ai-not-trend` | 5 | `note` | 50 | Why AI is not a passing trend. Sits under the statement `AI مش Trend` [FIXED]. |

### World 2 — AI Lab (8 min)

| id | # | Needs | Sec | Context |
|---|---|---|---|---|
| `context` | 7 | `note` | 100 | What Context means and why AI needs it. Follows directly from the mind-reader interaction, where AI could not know why the student was stressed. |
| `not-magic` | 8 | `note` | 70 | Under the statement `AI مش سحر` [FIXED]. On screen a brain visibly dissolves into machinery as this lands — the copy should support that, not fight it. |
| `how-ai-works` | 9 | 5 `steps` | 110 | The pipeline, one step each. Ids in order: `prompt`, `tokens`, `patterns`, `probability`, `response`. The `probability` step is emphasised — it is the key insight: AI predicts what is *likely*, it does not *know*. |
| `why-ai-makes-mistakes` | 10 | `note` | 80 | Why AI makes mistakes and hallucinates. Must follow logically from `probability` above. |

### World 3 — Study Lab (13 min)

| id | # | Needs | Sec | Context |
|---|---|---|---|---|
| `tools-overview` | 11 | `title` | 50 | Opens the AI tools section. |
| `study-tools` | 12 | `title` | 55 | AI tools for studying. |
| `creative-tools` | 13 | `title` | 50 | AI tools for creative work — images, video, design. |
| `coding-tools` | 14 | `title` | 50 | AI tools for programming. |
| `which-ai-for-which-task` | 15 | `title` | 110 | Interactive: which AI for which task. |
| `weak-prompt` | 16 | `note` | 55 | Why `اشرحلي Biology.` [FIXED] is a weak prompt — vague, no context, no goal. |
| `strong-prompt` | 17 | `note` | 55 | **Write the improved version of that same prompt**, showing Context + Goal + Constraints + Output. This is the payoff of the previous scene. |
| `study-companion` | 19 | `title` | 110 | Interactive: using AI as a study companion. |
| `ask-to-teach` | 20 | `title` | 55 | The idea: don't ask AI for the answer, ask it to teach you. |
| `ai-and-learning` | 21 | `title` | 50 | AI and real learning — what actually stays in your head. |

### World 4 — Privacy (11 min)

| id | # | Needs | Sec | Context |
|---|---|---|---|---|
| `is-chatgpt-a-friend` | 22 | `title` | 70 | Is ChatGPT a friend? Opens the boundaries section. |
| `why-ai-feels-like-a-friend` | 23 | `title` | 70 | Why AI *feels* like a friend — always available, never judges, always agrees. |
| `friend-lifecoach-secretkeeper` | 24 | `title` | 90 | Friend? Life coach? Secret keeper? Where the line is. |
| `what-to-share` | 25 | `title` | 70 | What is safe to share with AI. |
| `never-share` | 26 | `title` | 150 | Interactive sorter: what you must never share. |
| `ai-cybersecurity` | 27 | `title` + `note` | 150 | AI and Cybersecurity. The `note` covers Phishing / Deepfakes / Scams / Social engineering in one or two lines. |
| `privacy-rule` | 28 | `statement` | 60 | **The privacy rule as one memorable sentence** students will repeat. Max 8 words. This is a landing moment — treat it like a slogan. |

### World 5 — Future City (8 min)

| id | # | Needs | Sec | Context |
|---|---|---|---|---|
| `tool-vs-replacement` | 29 | `title` | 80 | AI as a tool versus AI as a replacement. |
| `if-ai-disappeared` | 30 | `title` | 130 | Interactive: what if AI disappeared for a week? |
| `people-who-dont-use-ai` | 31 | `title` | 70 | What happens to people who don't use AI at all. Do not shame anyone — the point is opportunity, not fear. |
| `jobs-and-skills` | 32 | `title` + `note` | 130 | Jobs and future skills. The `note` explains **AI Literacy** in one line. |
| `final-message` | 33 | `note` | 70 | **A short entrepreneurship idea** — AI lets a student start something small on their own — placed just before the closing sequence [FIXED]. Max 2 lines. |

## B. Interactions

All are teacher-driven on one projected screen. Students raise hands; the
teacher clicks. **There is no student voting and no live data** — never write
copy that implies counts, percentages or "most students said."

`facilitationAr` = short lines shown on screen after the reveal, which also cue
the teacher what to say.

| id | Needs | Context |
|---|---|---|
| `opening-poll` | 1 `facilitationAr` line | After the hand-raise on `هل استخدمت AI من قبل؟` [FIXED]. One line that turns the show of hands into the lesson's opening point. |
| `mind-reader` | 4 option labels + 1 `facilitationAr` | The screen shows `أنا متوتر.` [FIXED] and asks `AI بيعرف ليش؟` [FIXED]. Write **4 short, equally plausible reasons a Lebanese 16-year-old might be stressed** — ids `possibility-1` … `possibility-4`, max 4 words each. None is "the answer": the point is that AI has no way to choose between them, because nobody gave it Context. The `facilitationAr` line makes that explicit and hands over to scene 7. |
| `prompt-lab` | 4 `facilitationAr` lines | Starting from `اشرحلي Biology.` [FIXED], show the prompt getting better one piece at a time. Line 1 adds **Context**, line 2 adds **Goal**, line 3 adds **Constraints**, line 4 adds **Output**. Each line is the *prompt as it now reads*, so the class watches it improve. |
| `tool-explorer` | `promptAr` + 6 `facilitationAr` lines | The question that introduces the six choices `أدرس` / `أبحث` / `أصمم` / `أبرمج` / `أكتب` / `أبني مشروع` [FIXED]. Then **one line per choice, in that order**, naming which tools suit it. |
| `study-companion` | `promptAr` + 5 `facilitationAr` lines | The question introducing `اشرح` / `اختبرني` / `اعمل خطة` / `اعطيني مثال` / `صححلي` [FIXED]. Then **one line per choice, in that order**: what a student would actually type to get that. |
| `privacy-sorter` | `promptAr` + 6 `facilitationAr` lines | Sorting instructions, then **one line per item, in this order**: `واجب مدرسي` (safe), `سؤال عام` (safe), `Password` (never), `OTP` (never), `ID` (never), `صورة خاصة` (never). Each line says *why* in a few words. Do not rely on colour to carry safe-vs-never — say it in words. |
| `real-or-fake` | 2 option labels + `facilitationAr` | The question `مين الحقيقي؟` [FIXED]. Write **two short descriptions of a message or account** — one genuine, one a scam or deepfake — that a Lebanese student might really receive. Ids `option-1` (make this the real one) and `option-2`. Then 2–4 `facilitationAr` lines listing the **tells** that give the fake away. |
| `dependency` | 3–4 option labels + one `facilitationAr` line each | The question `إذا اختفى AI لمدة أسبوع، هل بتقدر تكمل؟` [FIXED]. Write 3–4 honest answers a student might give, from "I'd be fine" to "I'd be stuck," ids `option-1`, `option-2`, … Then one line per option, in order — reflective, never shaming. |
| `career` | `promptAr` + 6 `facilitationAr` lines | The question introducing `طبيب` / `مطوّر` / `مصمّم` / `أستاذ` / `مهندس` / `رائد أعمال` [FIXED]. Then **one line per role, in that order**: how AI changes that job — what it takes over, and what still needs the human. |

## C. Timeline captions — `aiHistory`

One Arabic line each, max 12 words, saying **why it mattered**. Ids and years:

`turing` (1950, Turing Test) · `dartmouth` (1956, the term "AI" is born) ·
`deep-blue` (1997, beats the world chess champion) · `deep-learning` (2012) ·
`chatgpt` (2022, Generative AI reaches everyone)

## D. Pipeline captions — `aiPipeline`

One Arabic line each, max 8 words — these are short labels on the 3D pipeline in
scene 9, and must agree with that scene's steps:

`prompt` · `tokens` · `patterns` · `probability` · `response`

## E. The AI tool list — `tools`

Currently empty and it blocks a whole section. Give me **8–12 tools students in
Lebanon can realistically access**, preferring ones with a usable free tier.

Each tool needs: `id` (kebab-case), `name` (English), `category` — exactly one of
`study` · `research` · `writing` · `creative` · `coding` · `startup` — and three
Arabic arrays: `useCasesAr` (1–3 items), `strengthsAr` (1–3), `limitationsAr`
(1–3).

**`limitationsAr` is the most important field.** It carries the "AI is not magic"
thread through the tools section, so be honest and specific — hallucination,
weak Arabic, outdated information, paywalls. Cover every category at least once.

## F. Speaker notes — `speakerNotes`

Presenter-only, never shown to students. For **all 33 scenes**, 2–4 short Arabic
bullets: what to say, what to ask the class, what to watch for. For interactive
scenes include how to run the interaction with a class that is quiet or noisy.
Scene ids, in order:

`opening` · `do-you-use-ai` · `ai-today` · `ai-not-new` · `ai-not-trend` ·
`not-a-mind-reader` · `context` · `not-magic` · `how-ai-works` ·
`why-ai-makes-mistakes` · `tools-overview` · `study-tools` · `creative-tools` ·
`coding-tools` · `which-ai-for-which-task` · `weak-prompt` · `strong-prompt` ·
`prompt-formula` · `study-companion` · `ask-to-teach` · `ai-and-learning` ·
`is-chatgpt-a-friend` · `why-ai-feels-like-a-friend` ·
`friend-lifecoach-secretkeeper` · `what-to-share` · `never-share` ·
`ai-cybersecurity` · `privacy-rule` · `tool-vs-replacement` · `if-ai-disappeared` ·
`people-who-dont-use-ai` · `jobs-and-skills` · `final-message`

---

# Output format

Return **one JSON code block and nothing else** — no commentary before or after,
no markdown inside the strings. Use exactly this shape, and use exactly the ids
above:

```json
{
  "scenes": {
    "opening": { "note": "..." },
    "ai-today": { "note": "..." },
    "how-ai-works": {
      "steps": {
        "prompt": "...", "tokens": "...", "patterns": "...",
        "probability": "...", "response": "..."
      }
    },
    "tools-overview": { "title": "..." },
    "ai-cybersecurity": { "title": "...", "note": "..." },
    "privacy-rule": { "statement": "..." }
  },
  "interactions": {
    "mind-reader": {
      "options": {
        "possibility-1": "...", "possibility-2": "...",
        "possibility-3": "...", "possibility-4": "..."
      },
      "facilitationAr": ["..."]
    },
    "tool-explorer": { "promptAr": "...", "facilitationAr": ["...", "..."] },
    "real-or-fake": {
      "options": { "option-1": "...", "option-2": "..." },
      "facilitationAr": ["..."]
    },
    "dependency": {
      "options": { "option-1": "...", "option-2": "...", "option-3": "..." },
      "facilitationAr": ["..."]
    }
  },
  "aiHistory": { "turing": "...", "dartmouth": "...", "deep-blue": "...", "deep-learning": "...", "chatgpt": "..." },
  "aiPipeline": { "prompt": "...", "tokens": "...", "patterns": "...", "probability": "...", "response": "..." },
  "tools": [
    {
      "id": "chatgpt",
      "name": "ChatGPT",
      "category": "study",
      "useCasesAr": ["..."],
      "strengthsAr": ["..."],
      "limitationsAr": ["..."]
    }
  ],
  "speakerNotes": {
    "opening": ["...", "..."],
    "do-you-use-ai": ["...", "..."]
  }
}
```

Include **every** id listed in sections A–F. Where `facilitationAr` needs one
line per choice, keep the array in the same order as the choices are listed
above — the order is how the app matches them.
