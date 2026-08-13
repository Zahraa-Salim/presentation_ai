# PROJECT STATUS — Interactive AI Education Experience

**Last updated:** 2026-08-13 — after Task 12 + presentation mode fix + Vitest migration
**Project:** 45-minute Arabic-first interactive AI lesson for Grade 11, Lebanon
**Core message:** خلي AI يساعدك، مش يفكّر بدالك.

This document is the handover. It records where the project stands, every
decision made and why, what is still missing, and how to continue.

---

## 1. WHERE WE ARE

**Tasks 00–12 complete**, plus the presentation-mode fix and the test migration.

**All 33 scenes walk end to end.** Worlds 3–5 render through generic type-based
renderers with visible `⟦TODO⟧` markers and placeholder 3D until their own
tasks. You can present the whole deck today — the content is what's missing, not
the mechanics.

| Metric | Value |
|---|---|
| Source files | 86 |
| Scenes | 33 (all render) |
| Beats (key presses to walk the deck) | 59 |
| Runtime budget | exactly 2700s = 45.0 min |
| 3D worlds built | 3 of 11 (`opening`, `aiHistory`, `aiMind`) |
| Interactions built | 2 of 9 (opening poll, mind reader) |
| **Tests** | **231 passing, 9 files, in-repo (Vitest)** |
| Content gaps (`⟦TODO⟧`) | **85** |
| Bundle | entry 238.93 kB (gzip 74.07) · three 884.05 · motion 128.66 |

Gates all green: `typecheck` 0 errors · `lint` 0 errors · `build` succeeds ·
`test` 231/231.

---

## 2. ✅ RESOLVED — "scenes change but the screen looks the same"

**Cause:** `App.tsx` rendered a long *scrolling debug page*. The real scene was
a 420px window near the top; the scene jump grid was at the very bottom. Clicking
a scene number while scrolled down changed the scene correctly, but the visible
part of the screen (gallery, buttons) was unchanged. State was always fine.

**Fix:** the app now opens in **presentation mode** — the scene fills the screen
and nothing else is on it. The harness became the exception rather than the
default.

- **Press `D`** to toggle between presentation and the debug harness
- A faint `D · debug` / `D · presentation` hint sits bottom-left in dev builds only
- Keyboard navigation moved out of the harness into `AppInner`, so hiding the
  harness no longer kills the keyboard (it would have, before)
- `<PresentationStage>` renders `SceneTransition` → `SceneRenderer` full-screen

---

## 3. TASK QUEUE — full status

Legend: ✅ done · ⬜ not started · 🔒 blocked on source deck

| # | Task | Status | Notes |
|---|---|---|---|
| 00 | Project audit | ✅ | Was a bare Vite starter |
| 01 | Architecture + TypeScript + stack | ✅ | TS 5.9, Tailwind v4, fonts bundled offline |
| 02 | Design tokens | ✅ | In `globals.css` `@theme` |
| 03 | Presentation state | ✅ | Pure reducer, beat model, hash deep-link |
| 04 | Navigation | ✅ | Keyboard, click, edge zone, swipe |
| 05 | Fullscreen + progress UI | ✅ | Segmented 5-world bar, auto-hiding chrome |
| 06 | Scene transitions | ✅ | 5 presets, RTL-mirrored, interruptible |
| 07 | UI components | ✅ | 9 components + gallery |
| 08 | 3D foundation | ✅ | Persistent canvas, quality tiers, camera rig |
| 09 | 3D asset system | ✅ | **Absorbed into 08** — procedural decision made it the scene registry |
| 10 | NOVA character | ✅ | 12 emotion states, DOM speech bubble |
| 11 | World 1 — AI World | ✅ | Scenes 1–5, opening poll, history timeline |
| 12 | World 2 — AI Lab | ✅ | Scenes 6–10, mind reader, brain→lattice dissolve |
| — | Presentation mode fix | ✅ | See §2 |
| — | Vitest migration | ✅ | 231 tests now in `src/__tests__/` |
| 13 | Prompt Lab (`aiMachine` 3D) | 🔒 | Scenes 16–18 |
| 14 | World 3 — Study Lab | 🔒 | Scenes 11–21 |
| 15 | AI Tool Explorer | 🔒 | Needs `tools.ts` populated — currently empty |
| 16 | Study Companion | 🔒 | |
| 17 | World 4 — Privacy | 🔒 | Scenes 22–28 |
| 18 | Privacy Vault | 🔒 | |
| 19 | Cybersecurity / Real-or-Fake | 🔒 | |
| 20 | World 5 — Future City | 🔒 | Scenes 29–33 |
| 21 | Dependency experience | 🔒 | |
| 22 | Future City careers | 🔒 | |
| 23 | Entrepreneurship | 🔒 | |
| 24 | Final cinematic | 🔒 | Closing text IS known (see §6) |
| 25 | Presenter mode (`P`) | ⬜ | Key bound, inert; `speakerNotes` field already on every scene |
| 26 | Audio | ⬜ | Optional |
| 27 | Performance pass | ⬜ | |
| 28 | Accessibility pass | ⬜ | `prefers-reduced-motion` still untested end to end |
| 29 | Full rehearsal | ⬜ | **Can be done now** — all 33 walk, and presentation mode makes it viable |
| 30 | Final polish | ⬜ | |
| 31 | Production build verification | ⬜ | Build works; offline verified once |
| 32 | Vercel deployment | ⬜ | |

**🔒 = blocked on the source presentation deck**, which has not been provided.
Structure can be built without it; Arabic copy cannot.

---

## 4. TIME ESTIMATE

Twelve tasks were completed in this session. Roughly **20 remain**.

| Phase | Tasks | Rough effort |
|---|---|---|
| Worlds 3–5 + their 6 interactions | 13–24 | ~1.5–2× the work done so far — these are the biggest tasks; each world is 5–11 scenes plus a bespoke 3D environment |
| Presenter mode, audio, perf, a11y | 25–28 | Small-to-medium; foundations already exist |
| Rehearsal, polish, build, deploy | 29–32 | Small, but rehearsal usually surfaces rework |

**The honest answer: the engineering is roughly 60% done, but the schedule
depends almost entirely on content.** Every remaining world task can be built to
the same standard as Worlds 1–2 without the deck — they will just ship with
visible gaps that still need filling afterwards. Supplying the deck earlier
removes a whole second pass.

If you have a fixed presentation date, tell me and I'll propose a cut-down scope
(for example: finish all five worlds structurally, skip audio and Task 30 polish,
and prioritise rehearsal).

---

## 5. ARCHITECTURE

```
src/
├─ app/App.tsx              PresentationStage (default) + DevHarness (press D)
├─ components/
│  ├─ presentation/         engine: provider, navigation, chrome, transitions
│  ├─ ui/                   9 reusable components + gallery
│  ├─ three/                canvas, camera, lighting, particles, NOVA
│  │  └─ worlds/            OpeningWorld, AiHistoryWorld, AiMindWorld
│  └─ interactions/         Poll, MindReader, registry
├─ scenes/
│  ├─ SceneRenderer.tsx     resolves scene → component
│  ├─ sceneComponents.ts    sparse overrides, else type default
│  ├─ defaults/             Explain, Statement, Interactive, Cinematic
│  ├─ ai-world/             HistoryScene
│  └─ ai-lab/               HowAiWorksScene
├─ data/                    ALL Arabic content lives here
├─ __tests__/               9 Vitest suites, 231 tests
├─ hooks/  lib/  types/  styles/  assets/fonts/
```

### The three registry patterns (extend these, don't bypass them)

**Scenes:** `sceneComponents[scene.id]` → else `DEFAULT_SCENE_COMPONENTS[scene.type]`.
A scene only gets its own file when its layout genuinely differs. This is what
prevents `Slide1.tsx … Slide33.tsx`.

**3D:** `SCENE_3D_REGISTRY[scene3d]`, all keys default to `PlaceholderScene`.
Replace one entry per world task.

**Interactions:** `INTERACTION_COMPONENTS[id]`, sparse; unbuilt ones render a
visible note rather than crashing.

### The beat model

A "beat" is one presenter key-press worth of reveal.

```
beat 0        scene at rest (headline visible)
beats 1..S    reveal steps, one each
beat S+1      statement visual blooms   (statementReveal scenes only)
beats after   interaction phases
```

`getBeatLayout(scene)` in `src/lib/beats.ts` is the single source of truth.
Components never do beat arithmetic — `<RevealText step={n}>` binds itself.

---

## 6. DECISION LOG

Every decision below was explicitly approved. Reversing one is fine — this
records *why*, so the reversal is informed.

### Product
| Decision | Reason |
|---|---|
| Teacher-driven, one screen, no student devices | Stated requirement. No backend, no live voting |
| Runs fully offline | Fonts bundled locally; no CDN, no APIs |
| Deploys to Vercel as static SPA | Same codebase local and remote |
| Procedural 3D only, no `.glb` | Performance + no asset pipeline |
| Git deliberately NOT initialised | Your instruction |

### Engine
| Decision | Reason |
|---|---|
| `→` = next (not RTL-flipped) | Presentation clickers send Right/PageDown regardless of language |
| Beats, then scene | Presenter controls each reveal |
| Back = fully revealed | Don't re-click through a build you already showed |
| `#/scene/12` deep link, `replaceState` | Rehearsal resume; Back must not fight arrow keys |
| Transitions interruptible (sync mode) | `mode="wait"` swallows fast presses |
| ~450ms scene change | Deliberate but responsive |
| `statementReveal` presenter-stepped | You control the silence — that's what makes those moments land |
| No `react-router` | 33-step linear deck is state, not routes |
| `D` handled outside the shared key map | Harness is temporary; it shouldn't pollute the product key map |

### Visual
| Decision | Reason |
|---|---|
| Solid card panels, no heavy glass | Legibility over moving 3D; no backdrop-blur GPU cost |
| Progress fills right→left, 5 world segments | Arabic flow; students see session shape |
| Chrome auto-hides after 3s | Clean screen for statement moments |
| No post-processing / bloom | 4–8ms per frame on integrated graphics. Glow via emissive + additive |
| NOVA: core + rings + lens, per-scene opt-in | Readable, not a mascot; absent where the screen should be bare |
| Quality tier probed once, locked | Quality shifting mid-lesson reads as the machine struggling |
| WebGL failure → silent DOM fallback | The lesson must survive a GPU hiccup |
| Seeded randomness everywhere | Scenes look identical in rehearsal and on the day |

### Content
| Decision | Reason |
|---|---|
| **Never invent educational content** | Your standing instruction. Gaps marked `⟦TODO⟧` |
| Poll shows relative weight, never numbers | Inventing statistics in a lesson about not trusting AI output would be self-defeating |
| Brain **dissolves** into machinery | A brain left on screen argues AI thinks — the opposite of World 2's message |
| Mind-reader possibilities not clickable | Making them selectable implies one is the answer |
| History milestones = public fact, replaceable | Structure to design against, not a claim about your deck |
| World budgets rebalanced | 5/8/13/11/8 min. Scene counts are uneven; total still 45 |
| Part 04 (Prompting) sits in Study Lab | Keeps worlds contiguous and preserves your Part order |

---

## 7. CONTENT GAPS — 85 markers

All render visibly in amber as `⟦TODO: …⟧`. Filling them is a **pure data edit
in `src/data/` — no component changes**.

| File | Gaps | What is needed |
|---|---|---|
| `scenes.ts` | 55 | Titles for Worlds 3–5, body copy throughout |
| `interactions.ts` | 19 | Prompts, options, facilitation notes for 7 interactions |
| `aiHistory.ts` | 5 | Arabic captions for the 5 milestones |
| `aiPipeline.ts` | 5 | Arabic captions for Prompt/tokens/patterns/probability/response |
| `tools.ts` | empty | **The entire AI tool list** — blocks Task 15 |

`src/__tests__/content.test.ts` asserts the gap count stays ≤ 90. **That number
should fall as the deck arrives.** If it rises unexpectedly, content was added as
TODO rather than filled in.

### Highest-value small asks (biggest effect per word)
1. **4 Arabic phrases** for the mind-reader possibilities → makes scene 6 fully real
2. **5 pipeline captions** → makes scene 9 fully real
3. **The tool list** → unblocks Task 15 entirely

### What IS known verbatim (from the brief, already in place)
- All 10 titles for Worlds 1–2
- The closing sequence: `AI مش سحر.` → `AI مش قارئ أفكار.` → `AI مش بديل عنك.` → `AI أداة.` → `خلي AI يساعدك، مش يفكّر بدالك.`
- Poll question + 3 choices; mind-reader statement + question; Prompt Lab formula; Tool Explorer 6 choices; Study Companion 5 choices; Privacy Sorter 6 items; career 6 roles

---

## 8. HOW TO RUN

```bash
npm run dev         # dev server → http://localhost:5173
npm test            # 231 Vitest tests (run once)
npm run test:watch  # watch mode while editing
npm run typecheck   # tsc -b
npm run lint        # eslint
npm run build       # tsc -b && vite build
npm run preview     # serve the production build locally
```

**URL options:** `?quality=low|medium|high` forces the render tier ·
`?perf=1` shows the FPS meter in production · `#/scene/12` jumps to a scene.

**Keyboard:** `→`/`Space`/`PageDown` next beat · `←`/`PageUp` back ·
`↓`/`↑` skip scene · `Home`/`End` · `F` fullscreen · `1`–`6` pick a choice ·
`Esc` reset an interaction · **`D` toggle debug harness**.
`P` is bound but inert until Task 25.

### The test suites

Nine files in `src/__tests__/`, all pure logic — no DOM, no components:

| File | Covers |
|---|---|
| `presentationReducer.test.ts` | navigation, bounds, jumps, hash deep-links |
| `beats.test.ts` | beat layout, ownership, interaction beats |
| `keymap.test.ts` | key map, guards, number keys |
| `transitions.test.ts` | presets, RTL mirroring, reduced motion, statement phases |
| `progress.test.ts` | world segments and bar fill |
| `quality.test.ts` | tier detection, camera poses, seeded randomness |
| `nova.test.ts` | 12 expressions, distinctness, reduced motion |
| `content.test.ts` | deck structure, timing, interaction cross-refs, gap tracking |
| `worlds.test.ts` | poll weights, mind formation, Worlds 1–2 shape |

These have already caught real regressions (a beat-count drift, an option-count
mismatch). **Run `npm test` before and after every change.**

---

## 9. VERIFIED ON REAL HARDWARE

From your checks:
- Tier auto-detected as **`high`**, 60 fps, dpr 2
- **58 fps at 1366×768** (the hardware floor that matters)
- **WebGL kill test passed** — presentation kept working with 3D disabled
- **Arabic legible over the 3D** — confirms the solid-card decision

Caveat: those numbers came from mostly-placeholder geometry. Re-measure once
more worlds are real.

---

## 10. RECOMMENDED NEXT STEPS

1. **Walk the deck in presentation mode.** It has never been seen this way —
   press `→` from scene 1 and see whether it reads as a presentation.
2. **Timing rehearsal (Task 29, early).** All 33 walk. Measuring pacing before
   three more worlds are built is far cheaper than after.
3. **Send the source deck**, or even one world's worth. It gates 12 tasks.
4. Then continue: Task 13 (Prompt Lab) → 14 → 17 → 20.

### Risks worth tracking
- **The deck is the critical path.** Everything structural can be built without
  it, but each world then needs a second content pass.
- **Perf is unmeasured under real load** — three worlds are real, eight are
  still cheap placeholders.
- **`prefers-reduced-motion` has never been tested end to end.**
- **NOVA is not yet placed in any real scene** — it's built and reviewable in
  the harness, but scenes need content for it to react to.
