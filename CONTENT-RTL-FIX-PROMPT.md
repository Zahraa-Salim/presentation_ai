# CONTENT & RTL FIX PROMPT

Second review pass — content fidelity against the deck, speaker-note coverage,
and RTL. `FIX-PROMPT.md` covers the *code* issues from the first pass and may
already be in progress; this file does not repeat them.

Paste everything below the horizontal rule into a session.

**Two items here are blocked on the author and must not be fixed by an agent.**
They are marked `BLOCKED`.

---

You are working on the Grade 11 interactive AI lesson in this repo. Read
`CLAUDE.md` first — the master rule applies: **inspect, plan, wait for approval,
then implement only the approved scope.**

The findings below come from a mechanical two-way string diff between
`content.json` (the source deck) and `src/data/`, plus an RTL audit. Verify each
against the current tree before acting — the working tree has been changing
rapidly and some of this may already be addressed.

**The hard rule for this batch: `content.json` is the source of truth for every
Arabic word. Do not write educational copy. Where copy is missing and the deck
does not contain it, stop and ask.**

---

## Group E — content fidelity

### E1. Five cybersecurity threats were dropped from the deck

`src/data/scenes.ts` → scene 27 `ai-cybersecurity` ·
source: `content.json` → `ai-cybersecurity.threats`

The deck supplies five threats:

```
Phishing · Fake accounts · AI-generated scams · Deepfakes · Impersonation
```

None of them reach the screen. Scene 27 currently has only `headline`,
`subheadline` and `keyMessage`. The five names survive **only as a code comment**
in `src/data/interactions.ts`, above the `real-or-fake` definition.

This scene is budgeted at 150 seconds — joint-longest in the deck — and is the
entire Cybersecurity moment. Put the threats on screen as scene content.

**This needs no new copy — the deck already contains it.** Fixing it is
transcription, not authoring.

### E2. `BLOCKED` — thirteen English column headings were invented

`src/data/scenes.ts` → every scene with `content.groups`

These thirteen labels render as on-screen column headings and **are not in the
deck as display copy** — they are the deck's JSON *field names*, promoted to
headings during the merge:

```
Tools · Use Cases · Categories · Examples · Avoid · Try · AI Helps ·
AI Replaces · Roles · AI Can Be · Boundaries · Healthy Use · Dependency
```

Two rules collided to produce this:

- `ContentGroup.label` is required, and `src/__tests__/content.test.ts` asserts
  it is non-empty — deliberately, so a washed-out projector can never leave
  colour as the only signal.
- `CLAUDE.md` forbids inventing educational content, and permits English only for
  AI, Prompt, Context, Machine Learning, Deep Learning, Generative AI,
  Cybersecurity, AI Literacy, tool names and short technical terms.

`Avoid`, `Try`, `Boundaries`, `Healthy Use`, `Use Cases`, `Roles`, `Examples`,
`Categories`, `AI Helps` and `AI Replaces` are none of those.

**Do not invent replacements.** Ask the author for thirteen Arabic column
headings (or a decision to drop the labels and carry the meaning another way that
still satisfies the never-colour-alone rule). List the affected scenes and their
current labels so the author can answer in one pass.

### E3. Confirm two authoring decisions, do not change them unasked

Both are commented in the code and both are defensible, but neither is a
transcription — the author should confirm:

- Scene 7 `context` uses `Prompt ضعيف` / `Prompt أقوى` as its column labels,
  borrowed from scenes 16–17. Deck words, but the deck did not put them in
  scene 7.
- Scene 28 `before-send` promotes the deck's `keyMessage`
  (`AI مش Private Diary.`) to `statement` so the scene keeps a presenter-stepped
  landing.

### E4. `BLOCKED` — 30 of 33 scenes have no speaker notes

`src/data/scenes.ts` → `speakerNotes: []`

Only scenes 1, 2 and 33 have any. Scene 2's single note is English prose *about*
the interaction (`Presenter-controlled classroom interaction; no live voting
backend.`), not a line to say aloud — so the presenter has usable Arabic notes on
**two** scenes out of thirty-three.

This is now urgent because `PresenterOverlay` has been built. It works correctly
and will render `لا توجد ملاحظات لهذا المشهد.` on 30 of 33 scenes.

The deck does not contain these notes. **Do not write them.** Flag to the author
that presenter mode is complete but starved of content, and that this is the
highest-value small content ask remaining.

---

## Group F — the validator could not see any of the above

### F1. `validateContent` cannot detect an empty `speakerNotes` array

`src/lib/validateContent.ts`

It counts `TODO` *strings*. `[]` is not a `TODO` string, so 30 empty note arrays
are invisible to both the dev report and `content.test.ts`. Add speaker-note
coverage to `ContentReport` so the gap is tracked rather than discovered.

### F2. `validateContent` does not count the fields the content now lives in

Also listed as Group D in `FIX-PROMPT.md` — repeated here because it is the same
root cause. It counts `title`, `headline`, `subheadline`, `statement`, `note` and
`steps[].text`, but not `groups[].label`, `groups[].items`, `keyMessage` or
`example`, which is where most of the merged deck now sits.

### F3. Nothing asserts that group labels came from the deck

`src/__tests__/content.test.ts`

The existing test checks each `ContentGroup.label` is non-empty — which is the
right rule, and is exactly what forced E2. Consider adding a guard that catches
invented display copy: for example, asserting group labels are Arabic, or
cross-checking scene copy against `content.json` directly so a future merge
cannot silently introduce text the deck never contained.

A fidelity check of that kind is cheap and would have caught both E1 and E2. It
can be written as a two-way string-set diff between `content.json` and
`src/data/`, ignoring ids and `tone` values.

---

## Group G — RTL

The RTL work in this codebase is genuinely strong and most of it needs nothing:
no physical properties anywhere, `dir="ltr"` on every numeric run, transforms
mirrored through one `RTL_SIGN` constant, the 3D timeline laid along −X, the
progress bar mirroring via flex order. Do not disturb any of it.

Three items:

### G1. Bidi bug — scene 24's title and headline

`src/data/scenes.ts` → `friend-lifecoach-secretkeeper`

```
Friend? Life Coach? Secret Keeper?
```

A pure-Latin run ending in an ASCII `?` inside an RTL paragraph. The trailing
neutral takes the *paragraph* direction, so the final `?` renders at the visual
left — before the text instead of after it.

Two possible fixes. **Prefer the second**, because it leaves the deck string
untouched:

1. Swap the ASCII `?` for the Arabic question mark `؟` (U+061F), which is
   strong-RTL. Note the same scene's `roles` items already do exactly this —
   `صاحب؟`, `Life Coach؟`, `Secret Keeper؟` — and render correctly. But this
   edits deck copy.
2. Wrap the run in a bidi isolate at render time — `<bdi>` or a `dir="ltr"`
   span — so the string is preserved verbatim and only its resolution changes.

Whichever is chosen, check whether other pure-Latin strings ending in neutral
punctuation exist now or arrive later; a general fix in the rendering path beats
a per-string one.

### G2. Directional arrows in an RTL deck — decide, then apply consistently

- Scene 18 `prompt-framework` subheadline:
  `Context → Goal → Constraints → Output`. Rightward arrows in a right-to-left
  deck. `CLAUDE.md` requires arrows be mirrored explicitly for RTL, so this is a
  design decision: mirror to `←`, or replace with a direction-neutral separator.
- `PresenterNextScene` renders `التالي ←`. Left is forward under RTL so the
  intent is right, but an arrow at an RTL/Latin boundary is where mirroring
  surprises appear.

Both need a visual check on screen, not just a code decision — confirm the
renderer is not bidi-mirroring the glyphs on its own.

### G3. English display strings render without `.latin`

The merge added many pure-English on-screen strings that do not get the `.latin`
class: all 13 group labels, group items (`ChatGPT`, `Claude`, `GitHub Copilot`,
`Images`, `Video`), the `study-companion` options (`Tutor`, `Quiz Partner`, …),
and the privacy sorter's `Password` / `OTP` / `Bank information`.

Affected components: `CompareGroups` (labels and items), `ChoiceCard` (label),
`QuestionCard`, `MindReader`.

**This is polish, not a rendering bug** — the bundled Plex Arabic is the Arabic
subset only, so Latin falls through to Inter automatically. What is lost is the
`cv05` feature setting, and the inconsistency with `HistoryScene`,
`HowAiWorksScene`, `ExplainScene` and `ToolCard`, which all do apply `.latin` to
their English runs.

---

## Suggested order

1. **E1** — the only content item that needs no author input; the deck already
   has the copy.
2. **F1 / F2 / F3** — make the validator able to see gaps of this kind, so the
   next merge cannot repeat them. Worth doing before more content lands.
3. **G1** — a real rendering bug, small, and the isolate-based fix is safe.
4. **E2 / E4** — take these to the author as one combined question. Do not
   proceed on either without answers.
5. **G2 / G3** — after a visual pass at 1366×768.

---

## What still cannot be assessed from the code

Dialect and register. Whether the Arabic lands naturally for a 16-year-old in
Lebanon — not formal, not academic, not childish, not heavy slang — needs a
native reader. This is the one remaining review dimension no amount of static
analysis substitutes for.
