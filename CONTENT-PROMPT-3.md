# CONTENT PROMPT 3 — the last content gaps

Five `TODO` markers and one empty file. Copy everything below the rule into
ChatGPT, save the result as `content-3.json` in the project root, and tell me.

**Section A is two sentences and unblocks the last unbuilt interaction.** The
rest can wait or be skipped — say so and I will mark them closed rather than
outstanding.

---

You are helping finish the Arabic script for a 45-minute interactive AI lesson
for **Grade 11 students in Lebanon (ages 16–17)**. The lesson is right-to-left
and Arabic-dominant. Everything else is already written — do not rewrite or
comment on the rest of it.

**Core message:** خلي AI يساعدك، مش يفكّر بدالك.

## Language rules

- **Simple conversational Lebanese Arabic** — natural for a 16-year-old. Not
  formal, not academic, not childish.
- **Keep in English:** AI, Prompt, Context, Machine Learning, Deep Learning,
  Generative AI, Cybersecurity, AI Literacy, Password, OTP, Phishing, Deepfake,
  and all product names (ChatGPT, Claude, Gemini, Canva AI, Gamma, Copilot).
- **Never invent statistics, percentages or study citations.** This lesson
  teaches students not to take AI output at face value.
- **Never encourage emotional dependency on AI.**

---

# SECTION A — Real or Fake (2 items + the tells)

Scene 27 is the Cybersecurity moment. The class is shown two things and asked
**`مين الحقيقي؟`** — which one is real?

The deck names the threats it is about: **Phishing · Fake accounts ·
AI-generated scams · Deepfakes · Impersonation.**

Write **two short descriptions of a message or an account that a Lebanese
student might really receive** — one genuine, one a scam or an impersonation.

- Each is **one or two lines**, the kind of thing you could read aloud.
- They must be **genuinely hard to tell apart at a glance.** If the fake is
  obviously fake the scene teaches nothing — the whole point is
  `مش كل شي بيبين حقيقي… حقيقي.`
- `option-1` is the **real** one. `option-2` is the fake.

Then write **2 to 4 lines naming the tells** — what gives the fake away once
you know to look. These appear after the reveal and are what the class takes
home.

# SECTION B — Tool Explorer suggestions (5 lines)

Scene 15 asks `أي AI لأي مهمة؟` and offers five tasks. Write **one line per
task, in this exact order**, naming which tools suit it and why in a few words:

1. `بدي أدرس Chapter.`
2. `بدي أعمل Research.`
3. `بدي أصمم Presentation.`
4. `بدي أفهم Code.`
5. `بدي أبني فكرة مشروع.`

Max 15 words each. Name real tools the student can actually reach.

# SECTION C — Study Companion prompts (5 lines)

Scene 19 offers five roles AI can play. Write **one line per role, in this exact
order** — what a student would actually type to get that role:

1. `Tutor`
2. `Quiz Partner`
3. `Study Planner`
4. `Language Partner`
5. `Brainstorming Partner`

These are example prompts, so they can be a sentence the student would send.

# SECTION D — The AI tool list

Currently empty, and it is what the tool scenes lean on. Give **8–12 tools
students in Lebanon can realistically reach**, preferring a usable free tier.

Each needs: `id` (kebab-case), `name` (English), `category` — exactly one of
`study` · `research` · `writing` · `creative` · `coding` · `startup` — and three
Arabic arrays: `useCasesAr` (1–3 items), `strengthsAr` (1–3), `limitationsAr`
(1–3).

**`limitationsAr` is the most important field.** It carries the "AI is not magic"
thread through the tools section, so be specific and honest — hallucination,
weak Arabic, outdated information, paywalls. Cover every category at least once.

# SECTION E — Entrepreneurship (1–2 lines) — optional

Scene 33, just before the closing sequence. **A short idea that AI lets a
student start something small on their own** — a project, a small business, a
piece of work they could not have made alone before.

Max two lines. It has to sit comfortably in front of
`AI مش سحر. → AI مش قارئ أفكار. → AI مش بديل عنك. → AI أداة.`

**Skip this section if you would rather drop it** — return
`"entrepreneurship": null` and the slot will be closed rather than left open.

---

# Output format

Return **one JSON code block and nothing else** — no commentary, no markdown
inside the strings:

```json
{
  "realOrFake": {
    "options": { "option-1": "...", "option-2": "..." },
    "tells": ["...", "..."]
  },
  "toolExplorer": ["...", "...", "...", "...", "..."],
  "studyCompanion": ["...", "...", "...", "...", "..."],
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
  "entrepreneurship": "..."
}
```

Any section you are not doing: return `null` for it. I will mark it closed
rather than outstanding.
