# FIX PROMPT — issues found in the full code review

Paste everything below the horizontal rule into a fresh session.

Findings are ordered by cost. Group A is visible to a classroom, B is silent
behavioural drift introduced when the deck was merged, C is per-frame waste on
exactly the hardware this has to run on, D is hygiene.

---

You are working on the Grade 11 interactive AI lesson in this repo. Read
`CLAUDE.md` first — the master rule applies: **inspect, plan, wait for approval,
then implement only the approved scope.** Do not fix everything at once. Work one
group at a time, smallest blast radius first, and run `npm run typecheck`,
`npm run lint` and `npm test` before and after each.

A full code review produced the issues below. Every one was verified by reading
the file. Line numbers were accurate at the time of review — confirm them before
editing.

Two standing constraints while fixing these:

- **Do not invent educational content.** Arabic copy comes from the deck only.
  Gaps stay marked with `TODO()` from `src/lib/todo.ts`.
- **Do not replace working functionality to implement a fix.** Extend the
  existing beat model, registries and components.

---

## Group A — visible on the projector

These all share one cause: the content model grew (`groups`, `example`,
`keyMessage`, `RevealStep.label`) and the deck landed, but four components were
never revisited.

### A1. The finale shows its closing line twice

`src/scenes/defaults/CinematicScene.tsx:31,48`

The `<h1>` renders `headline ?? scene.title`. The statement is then guarded by
`statement && statement !== headline`, which compares against the **raw**
`headline` (`undefined` for scene 33) rather than the value actually rendered.

Scene 33 has no `content.headline`, and its `title` and `statement` are the same
string. Both render. Worse, the `<h1>` is visible from beat 0, so the four
`AI مش…` closing lines build toward a punchline that has been on screen the whole
time. This is the last thing the room sees.

### A2. `keyMessage` is on screen from beat 0

`src/scenes/defaults/ExplainScene.tsx:57` · `src/scenes/defaults/InteractiveScene.tsx:40`

Rendered as a plain `<p>`, not a `RevealText`, and it consumes no beat. 16 scenes
carry one. Scene 10 shows `AI ممكن يحكي بثقة… وهو غلط.` before the three reasons
that earn it.

`keyMessage` is the line the scene lands on — it must arrive last. Note this also
means `getSceneBeatCount` / `getBeatLayout` in `src/lib/beats.ts` need to account
for it, the same way `steps` and `groups` already do, and the pinned beat total in
`src/__tests__/presentationReducer.test.ts:19` will move.

### A3. Scene 9's `keyMessage` never renders at all

`src/scenes/ai-lab/HowAiWorksScene.tsx`

The override component predates the field and destructures only `headline`.
`AI بيتوقع، مش بيفكّر مثل الإنسان.` — the key insight of World 2 — is in the data
and never reaches the screen.

### A4. Every scene prints its English id above the Arabic headline

`ExplainScene.tsx:20` · `InteractiveScene.tsx:27` · `HowAiWorksScene.tsx:25` ·
`ai-world/HistoryScene.tsx:23`

All four pass `eyebrow={scene.id}`, so `why-ai-feels-like-a-friend` renders in
letter-spaced Latin caps over the Arabic title. `SectionTitle`'s own prop doc says
the eyebrow is "Short Latin label above the title, e.g. the world name" — this
looks like scaffolding that was never swapped for `world.label`.

### A5. `MindReader` no longer matches its data

`src/components/interactions/MindReader.tsx:29`

It does `const [statement, ...possibilities] = interaction.options` and renders
the tail as dashed cards with a `HelpCircle` icon — designed for four open
possibilities AI cannot choose between. The deck merge changed the data to
`[{id:'statement'}, {id:'answer', label:'لا.'}]`, so the deck's flat, definitive
answer now renders as a tentative question-marked "possibility".

`src/__tests__/worlds.test.ts:161` pins the new data shape, so the data is correct
and the component is what drifted.

### A6. Scene 4's timeline cannot be stepped

`src/scenes/ai-world/HistoryScene.tsx` · `src/data/scenes.ts` (`ai-is-not-new`)

The scene has no `steps`, so `getSceneBeatCount` returns 1 and all five milestones
appear at once on a mount stagger. The presenter has no control over a scene whose
entire point is sequence.

Related pacing note for rehearsal, not a bug: `ai-is-everywhere` now has 7 steps in
a 50-second scene — 8 beats at roughly 6s each.

### A7. `D` opens the dev harness in a production build

`src/app/App.tsx:318-328`

The `D · debug` hint at line 352 is `import.meta.env.DEV`-gated; the key handler is
not. A stray `D` mid-lesson puts the component gallery, the NOVA emotion lab and
the 33-button jump grid on the projector.

---

## Group B — beats moved, what was pinned to them did not

### B1. The World 2 brain dissolves three beats early

`src/lib/mindFormation.ts:24`

Returns lattice when `beat >= 1` for `not-magic`, with the comment "exactly on the
beat where `AI مش سحر` lands". That was true when scene 8 had no steps and its
beats were `[0, 1]`. The merge added three steps, so the layout is now
`0 = sentence · 1..3 = steps · 4 = statement bloom`. The brain now comes apart on
the first bullet.

`src/__tests__/worlds.test.ts:63` asserts `getMindFormation('not-magic', 1) === 1`
— it tests the mapping in isolation, not its alignment with the scene's beat
layout, which is why it stayed green through the drift. Decide where the dissolve
belongs, then derive it from `getBeatLayout` rather than a hard-coded beat number
so it cannot drift again.

### B2. `MAX_CHOICE_KEY = 6`, but the privacy sorter has 12 options

`src/lib/keymap.ts:91,108` · `src/data/interactions.ts` (`privacy-sorter`) ·
`src/__tests__/keymap.test.ts:122`

`resolveChoiceKey` matches `[1-9]` and caps at 6. After the merge the sorter has 12
items, so `Bank information`, `ID / Passport`, `Private photos`,
`Private documents` and `أسرار شخص تاني` are keyboard-unreachable. The test
explicitly asserts `'7'` and `'9'` are ignored, so the suite will stay green about
it. The comment "Most choice lists have six options" is now false.

Note that raising the cap alone does not solve it — ten of twelve is the most a
single digit key can reach.

---

## Group C — per-frame and per-render waste in the 3D layer

### C1. `ParticleField` rebuilds its geometry on every render

`src/components/three/ParticleField.tsx:64`

`center` is in the `useMemo` dependency array and is always a fresh array
reference: an inline literal at `PlaceholderScene.tsx:57` and
`AiHistoryWorld.tsx:89`, and a default parameter (`center = [0,0,0]`) for NOVA's
motes. `ExperienceCanvas` re-renders on every beat, so each key press allocates a
Float32Array (36 KB at the high tier), builds and uploads a `BufferGeometry`, and
disposes the old one.

`PlaceholderScene` currently backs 8 of the 12 environments, i.e. scenes 11–33.

### C2. Both real worlds rewrite their whole vertex buffer every frame, forever

`src/components/three/worlds/AiMindWorld.tsx:94` ·
`src/components/three/worlds/OpeningWorld.tsx:84`

The interpolation loop and `attribute.needsUpdate = true` run unconditionally,
including long after `formation.current` has converged on its target and nothing
is changing. That is roughly 7,650 float writes plus a full GPU re-upload per
frame, for the entire duration of every scene in Worlds 1–2.

### C3. The fov transition is frame-rate dependent

`src/components/three/CameraController.tsx:52`

The camera position lerp directly above correctly uses
`1 - Math.pow(0.0015, delta)`. The fov below it uses a fixed `* 0.05` per frame. On
a 30 fps machine the two halves of the same camera move desynchronise — on exactly
the hardware class this is designed for.

---

## Group D — correctness and hygiene

- **`burst` is specified, documented and tested, but never implemented.**
  `NovaExpression.burst` exists, `celebrate` sets it, and
  `src/__tests__/nova.test.ts:44` asserts "bursts only on celebrate" — but
  `AICharacter` never reads the field. Either implement it or remove it and its
  test; right now the suite guards a contract nothing honours.

- **`src/lib/beats.ts` computes the beat total twice.** `getSceneBeatCount` and
  `getBeatLayout(...).total` are independent implementations of one rule, kept in
  agreement only by `beats.test.ts:9` — and the reducer depends on it.
  `getSceneBeatCount` can just return `getBeatLayout(scene).total`.

- **`validateContent` does not count the fields the content now lives in.**
  `src/lib/validateContent.ts:137-144` counts TODOs in `title`, `headline`,
  `subheadline`, `statement`, `note` and `steps[].text` — but not
  `groups[].label`, `groups[].items`, `keyMessage` or `example`, which is where
  most of the merged deck now sits. The `todoCount <= 8` ratchet in
  `content.test.ts` is therefore measuring a shrinking fraction of the content.

- **`src/__tests__/transitions.test.ts:98` hand-computes the statement beat** as
  `steps.length + 1` instead of calling `getBeatLayout`. It is correct only because
  no `statementReveal` scene currently has `groups`. The moment one does, it will
  assert the wrong beat and pass for the wrong reason.

- **No component or DOM tests exist.** `vite.config.ts:23-26` sets
  `environment: 'node'` and `include: ['src/**/*.test.ts']`, so `.tsx` is outside
  the glob and there is no DOM. Every defect in Group A is in a component, and the
  component layer is structurally untestable as configured. Consider whether A1–A5
  should be covered before or after they are fixed.

- **Stale comment:** `src/types/interaction.ts:13` still documents
  `study-companion` as `اشرح / اختبرني / اعمل خطة / مثال / صححلي`. The merge
  replaced those with `Tutor / Quiz Partner / Study Planner / Language Partner /
  Brainstorming Partner`.

- **`--z-scene` and `--z-overlay` are defined in `globals.css` and never used.**
  The scene layer renders above the `fixed` z-0 canvas purely by DOM order in
  `AppInner`. It works, but nothing enforces it.

- **`Poll` registers its own `window` Escape listener** (`Poll.tsx:39`) alongside
  the global handler's `onEscape`. With seven interactions still to build, decide
  now whether Escape-to-reset belongs in the shared key map, or this gets
  copy-pasted seven more times.

- **`NovaSpeech` is not exported from the `ui` barrel** while every other UI
  component is; `App.tsx` imports it by path.

- **`Card`'s `glass` surface uses `backdrop-blur-sm`**, which contradicts the
  recorded "no backdrop-blur GPU cost" decision. It is only used in
  `ComponentGallery` — decide whether the variant should exist at all.

- **ESLint runs recommended rules only** — no type-aware config, so
  `no-floating-promises` and related rules are not active.

---

## Suggested order

1. **Group A** — user-visible, mostly small, and A2 changes the beat model so it
   should land before anything else that touches beats.
2. **Group B** — small, but B1 is a silent regression and should be derived from
   the beat layout, not re-pinned to a new constant.
3. **Group C** — three contained fixes with real effect on weak hardware.
4. **Group D** — as convenient, except the `validateContent` gap, which is worth
   doing early because it is currently under-reporting how much content is missing.

Also worth knowing: `PROJECT-STATUS.md` is stale. It still says the deck has not
been supplied and reports 85 content gaps against a `<= 90` test ceiling; the deck
has landed and the ceiling is now 8. Update it as part of whichever task you do
first.
