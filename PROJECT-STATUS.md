# PROJECT STATUS — Interactive AI Education Experience

**Last updated:** 2026-08-18 — **finished; packaged to run on any laptop**
**Project:** 45-minute Arabic-first interactive AI lesson for Grade 11, Lebanon
**Core message:** خلي AI يساعدك، مش يفكّر بدالك.

This document is the handover. It records where the project stands, every
decision made and why, what is still missing, and how to continue.

---

## ▶ RESUME HERE

**Everything that can be done at the keyboard is done.** What is left needs the
room.

> **Run the rehearsal.** `npm run build && npm run preview`, open
> `http://localhost:4173/?perf=1`, press `F` then `P`, and present all 33 scenes
> **out loud**. Write the clock at the end of scenes 5, 10, 21, 28 and 33 —
> targets 5:00 / 13:00 / 26:00 / 37:00 / 45:00. Then click the corner readout
> for the frame-rate table, and walk it a second time with reduced motion on.
>
> Full instructions: **`REHEARSAL.md`** — read §1 before you start.

You no longer have to watch the FPS meter while presenting; the run records
itself per world (§13). Everything else waits on the run: Task 30 has nothing to
act on until it says what to polish, and Task 27's remaining half *is* those
numbers. Task 32 (Vercel) needs an account and nothing else.

**The four scenes to judge hardest** — all now one beat, one screen, no press:

| | | |
|---|---|---|
| 16 · `weak-prompt` | 55s | The note asks the class *«شو ناقص؟»* while all three answers are already on screen |
| 22 · `is-chatgpt-a-friend` | 70s | `بس… هل هيدا يعني إنه صاحبك؟` is a pivot marked `strong`; cascaded, the turn never happens |
| 3 · `ai-is-everywhere` | 50s | Seven single words arriving at once |
| 11 · `tools-overview` | 50s | The deck gives it nothing more to reveal |

Each is one line (`pacing: 'stepped'`) to fix. **Judge them live first.**

**Nothing is half-finished.** Every gate is green, no `TODO` markers remain, and
no work is mid-flight.

---

## 1. WHERE WE ARE

**Tasks 00–28 and 31 complete. Task 26 dropped.**

**The presentation is content-complete and structurally finished.** All 33
scenes, all 9 interactions, all 11 3D environments, zero `⟦TODO⟧` markers. What
remains is a timed rehearsal, whatever polish it surfaces, and deployment.

| Metric | Value |
|---|---|
| Source files | 122 |
| Scenes | 33 (all render) |
| Beats (key presses to walk the deck) | **106** — lists cascade in, they no longer cost a press |
| Runtime budget | exactly 2700s = 45.0 min |
| 3D worlds built | **all 11** — no scene renders a placeholder |
| Interactions built | **all 9** |
| **Tests** | **701 passing, 18 files, in-repo (Vitest)** |
| Content gaps (`⟦TODO⟧`) | **0** (was 85) |
| Bundle | entry 277.08 kB (gzip 85.14) · three 887.76 · motion 128.66 · 1.6 MB total |

Gates all green: `typecheck` 0 errors · `lint` 0 errors · `build` succeeds ·
`test` 701/701.

Between scenes 32 and 33 sits the **coda** — the deck's five core rules, reached
by pressing on from the careers scene. It is deliberately not a 34th scene;
see §14.

**Every word on screen is the author's** — from `content.json` where the deck
supplied it, and from `content-2.json` / `content-3.json` for the slots it did
not. `deckFidelity.test.ts` proves it in both directions: nothing invented,
nothing dropped.

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

## 2b. ✅ RESOLVED — World 2 rendered as a black backdrop

Found during the first presentation-mode walk of the deck.

**Cause:** the 3D environments are laid out along X so moving between worlds is a
real traversal (`aiMind`'s camera sits at x=24 aiming at x=22). But `AiMindWorld`
built its geometry around the **origin**, so the camera was aiming 22 units away
from it — completely outside the frustum. `PlaceholderScene` had been anchoring
itself at `pose.target`; the real worlds were written without that line.
`aiHistory` (target x=2) had the same bug, mild enough to look merely off-centre.

**Fix:** anchoring moved into `ExperienceCanvas`, which wraps the resolved world
in `<group position={getCameraPose(scene.scene3d).target}>`. Every world is now
authored around its own local origin and world-space layout is no longer each
world's problem. `PlaceholderScene` lost its self-anchoring — keeping it would
have double-offset it to x=44. The three real worlds needed no changes at all.

**Guard:** `worlds.test.ts` asserts no module in `three/worlds/` (nor
`PlaceholderScene`) imports `getCameraPose`. A black backdrop passes typecheck,
lint and every behavioural test, so the invariant is enforced structurally —
which also stops Tasks 13–24 reintroducing it.

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
| — | Vitest migration | ✅ | Tests now in `src/__tests__/` |
| — | World anchoring fix | ✅ | See §2b — World 2 was rendering black |
| — | **Source deck merged** | ✅ | See §7. Gaps 85 → 5, beats 59 → 118 |
| 13 | Prompt Lab interaction | ✅ | 4 beats, one per stage. `aiMachine` 3D still placeholder |
| 14 | World 3 — Study Lab | ✅ | `toolCity` + `studyLab` 3D |
| 15 | AI Tool Explorer | ✅ | Built on `ChoiceReveal`; `tools.ts` now holds 11 tools |
| 16 | Study Companion | ✅ | Built on `ChoiceReveal`, all 5 example prompts supplied |
| 17 | World 4 — Privacy | ✅ | `privacyVault` + `cyberCity` 3D |
| 18 | Privacy Sorter | ✅ | 12 items, click to flip. `privacyVault` 3D still placeholder |
| 19 | Cybersecurity / Real-or-Fake | ✅ | Two messages, verdict withheld until the reveal |
| 20 | World 5 — Future City | ✅ | `dependency` + `futureCity` 3D |
| 21 | Dependency experience | ✅ | Built on `ChoiceReveal`, all 4 lines supplied |
| 22 | Future City careers | ✅ | Built on `ChoiceReveal`, all 6 lines supplied |
| 23 | Entrepreneurship | ✅ | One line before the closing sequence |
| 24 | Final cinematic | ✅ | `finale` 3D — five world accents converging |
| 25 | Presenter mode (`P`) | ✅ | Overlay with timer, pacing badge, notes, next scene. See §11 |
| 26 | ~~Audio~~ | ❌ | **Dropped 2026-08-17 — the presentation is silent.** Never built; scaffolding removed |
| 27 | Performance pass | ⬜ | Engineering side done; the rehearsal now records its own per-world numbers (§13) |
| 28 | Accessibility pass | ✅ | Reduced-motion chain now enforced; canvas hidden from AT; Latin runs marked `lang="en"` |
| 29 | Full rehearsal | ⬜ | **Instrumented and ready.** See `REHEARSAL.md` |
| 30 | Final polish | ⬜ | |
| 31 | Production build verification | ✅ | Offline verified end to end; guarded by `offline.test.ts`. See §12 |
| 32 | Vercel deployment | ⬜ | |
| — | **Core rules coda** | ✅ | The five closing rules now render, between scenes 32 and 33. See §14 |
| — | **Scene 27 relayout** | ✅ | Own renderer, two columns — the one-column stack overflowed the screen |
| — | **Rehearsal instrumentation** | ✅ | Per-world fps recorded automatically under `?perf=1`. See §13 |

**Nothing is blocked.** Every 🔒 lifted when the deck arrived, and the last
three gaps closed with `content-3.json`.

---

## 4. WHAT IS LEFT

Three items, and two of them need the room rather than the keyboard.

| # | Task | What it needs |
|---|---|---|
| 29 | **Full rehearsal** | 45 minutes, presented out loud. See `REHEARSAL.md` — five checkpoint times and an FPS reading per world |
| 30 | Final polish | Nothing to act on until the rehearsal says what to polish. Four `pacing` calls are pre-decided and waiting on it — see ▶ RESUME HERE |
| 32 | Vercel deployment | An account. The build is verified offline and deploys unchanged |

Task 27 (performance) is done on the engineering side — the per-frame fixes
landed and the lazy-loading lever measured at 1.2 kB. What is missing is real
frame-rate numbers, which the rehearsal produces.

Deferred deliberately, each its own session: **type-aware ESLint** (unknown
finding count) and **component/DOM tests** (would change the sub-2-second
suite). Neither blocks anything.

<details>
<summary>Superseded estimate from when the deck had not arrived</summary>

Every remaining world task can be built to
the same standard as Worlds 1–2 without the deck — they will just ship with
visible gaps that still need filling afterwards. Supplying the deck earlier
removes a whole second pass.

If you have a fixed presentation date, tell me and I'll propose a cut-down scope
(for example: finish all five worlds structurally, skip Task 30 polish,
and prioritise rehearsal).

</details>

---

## 5. ARCHITECTURE

```
src/
├─ app/App.tsx              PresentationStage (default) + DevHarness (press D)
├─ components/
│  ├─ presentation/         engine: provider, navigation, chrome, transitions
│  ├─ ui/                   reusable primitives + gallery
│  ├─ three/                canvas, camera, lighting, particles, NOVA
│  │  └─ worlds/            all 11 environments
│  └─ interactions/         all 9, four sharing ChoiceReveal
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

## 7. CONTENT — complete

**85 gaps → 0.** Three sources, all in the project root, all the author's:

| File | What it supplied |
|---|---|
| **`content.json`** | The deck itself — all 33 scenes. Source of truth; where it and earlier code disagreed, the deck won |
| **`content-2.json`** | The 13 Arabic column headings and speaker notes for 30 scenes, neither of which the deck contained |
| **`content-3.json`** | The Real-or-Fake pair and its tells, the Tool Explorer's 5 suggestions, the Study Companion's 5 example prompts, 11 tools, and the closing entrepreneurship line |

`content.test.ts` now asserts `todoCount === 0` — an equality, not a ceiling, so
a new marker is a regression rather than known debt. Speaker-note coverage is
likewise pinned at 33 of 33.

`deckFidelity.test.ts` diffs the data against those sources **both ways**:
nothing on screen the author did not write, nothing written that reaches no
screen. Two exceptions remain, each with a written reason — `مين الحقيقي؟` and
`Context → Goal → Constraints → Output`, both predating `content.json`.

### Also worth your eyes

- ✅ **Speaker notes now cover all 33 scenes**, authored by you and saved at
  `content-2.json`. `content.test.ts` asserts full coverage, so a scene added
  without notes fails rather than quietly showing an empty presenter panel.
- ✅ **All 13 comparison headings are Arabic**, also from `content-2.json`.
  They previously carried the deck's English JSON field names, which was my
  error — a field name promoted to a projected heading is authored copy.

### What changed structurally when the deck landed

- **12 scene ids renamed** to the deck's (`do-you-use-ai` → `opening-poll`,
  `privacy-rule` → `before-send`, `final-message` → `final`, …). World ids kept.
- **`SceneContent` extended** with `example`, `groups`, `keyMessage`, and
  `RevealStep.label` — the deck compares constantly and the old model had no
  shape for it. New `CompareGroups` UI component renders 2–3 labelled columns.
- **Beats went 59 → 118.** Every list the deck supplies is now a presenter-paced
  reveal instead of a wall of bullets. Durations are unchanged, so the 45-minute
  budget holds — only the granularity changed. ~21 seconds per press.
- **Scene 28 changed identity**: `privacy-rule` → `before-send`, three questions
  landing on `AI مش Private Diary.` The statementReveal moment was preserved.
- **The mind-reader interaction was restructured.** The deck answers `لا.`
  outright; it does not fan out four possibilities. That mechanic was mine and
  has been removed.
- **`coreRules.ts` is new** — the deck's five closing rules, which belong to no
  scene. Not yet rendered anywhere; see §10.

---

## 8. HOW TO RUN

```bash
npm run present     # build, then serve it — this is how you present
npm run kit         # build, then assemble the USB-stick folder
npm run serve       # serve an existing build, without rebuilding

npm run dev         # dev server → http://localhost:5173
npm test            # 701 Vitest tests (run once)
npm run test:watch  # watch mode while editing
npm run typecheck   # tsc -b
npm run lint        # eslint
npm run build       # tsc -b && vite build
npm run preview     # Vite's own preview server
```

**URL options:** `?quality=low|medium|high` forces the render tier ·
`?perf=1` shows the FPS meter in production · `#/scene/12` jumps to a scene.

**Keyboard:** `→`/`Space`/`PageDown` next beat · `←`/`PageUp` back ·
`↓`/`↑` skip scene · `Home`/`End` · `F` fullscreen · `1`–`6` pick a choice ·
**`P` presenter panel** · `Esc` closes it · **`D` toggle debug harness**.

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
| `worlds.test.ts` | poll weights, mind formation, Worlds 1–2 shape, local-coordinate guard |
| `sceneCoverage.test.ts` | **every field of Arabic a scene carries is read by the component that renders it** |
| `presenterPacing.test.ts` | clock formatting, deck budget, drift, boundary continuity |
| `direction.test.ts` | RTL/LTR resolution for every deck string |
| `deckFidelity.test.ts` | **two-way diff against `content.json`** — nothing invented, nothing dropped |

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

See **▶ RESUME HERE** at the top. In short: run the rehearsal, then polish what
it exposes, then deploy.

### No decisions are open

The last one — where the five core rules belong — was settled on 2026-08-18 as
a coda past the end of the deck. See §14.

### Decisions already made, for the record

| | |
|---|---|
| Audio | **Dropped.** The presentation is silent — recorded in `CLAUDE.md` |
| The five core rules | **A recap between scenes 32 and 33**, not a handout. See §14 |
| Task 23 Entrepreneurship | **Kept**, one line supplied in `content-3.json` |
| The 13 English column headings | **Replaced with Arabic** from `content-2.json` |
| Lazy-loading the 11 worlds | **Measured and rejected** — 1.2 kB gzipped, see §4 |
| Auto-pacing lists | **Adopted**, except scenes 4, 9, 17 and 33 where each line is presenter-driven by design |

### Risks worth tracking
- **Perf is unmeasured under real load.** Three waste paths were fixed (below),
  but the numbers in §9 predate the deck, the interactions and eight of the
  eleven environments. **They are no longer meaningful** — the rehearsal
  replaces them.
- **`prefers-reduced-motion` is enforced but never seen.** Every path is
  guarded by tests; nobody has watched the deck with the setting on.
- **The coda has never been seen in a room**, and it costs unbudgeted time.
  Judge it on the rehearsal; it is trivial to remove.
- **Scene 27 was rebuilt on 2026-08-18** because its content overflowed the
  screen. Its new two-column layout has been typechecked and guarded but not
  watched.

### Measured and rejected: lazy-loading the worlds

`CLAUDE.md`'s performance rules say to lazy-load worlds, and the registry
imports all eleven statically. Measured on 2026-08-17 by stubbing every world
out of the registry and rebuilding:

| | `three` chunk | gzip |
|---|---|---|
| All 11 worlds | 887.76 kB | 236.46 kB |
| No worlds at all | 884.05 kB | 235.24 kB |
| **Cost of every world in the deck** | **3.71 kB** | **1.22 kB** |

**0.4% of the chunk.** The 888 kB is three.js itself, and that is already
deferred — `ExperienceCanvas` is `React.lazy`, so none of it blocks first paint.

Splitting the worlds would add a Suspense boundary inside the `<Canvas>` and
risk a blank frame on each of the five world changes — precisely the moments
`worldShift` exists to make seamless — to save a kilobyte. **Not done, and not
worth revisiting** unless a world stops being procedural and starts loading a
`.glb`, which is the case that rule was written for.

⚠️ `CLAUDE.md`'s "Lazy-load worlds" line is now contradicted by this
measurement. Left as-is pending your call, since it is your rules file.

### Per-frame fixes already made
- `ParticleField` no longer rebuilds its geometry on every beat. `center` was an
  array in the `useMemo` deps and a fresh reference each render, so the memo
  missed every time — a new `Float32Array`, geometry and GPU upload per key
  press, across the eight environments `PlaceholderScene` backs.
- `AiMindWorld` and `OpeningWorld` no longer rewrite their whole vertex buffer
  every frame once the blend has settled. It ran unconditionally before, so the
  still scenes — the ones the presenter talks over — paid the most.
- `CameraController`'s `fov` easing is frame-rate independent and now snaps
  inside a tolerance; it previously used a fixed factor while the position lerp
  beside it did not, and rebuilt the projection matrix every frame forever.
- **`prefers-reduced-motion` has never been tested end to end.**
- **NOVA is not yet placed in any real scene** — it's built and reviewable in
  the harness, but scenes need content for it to react to.

---

## 12. RUNNING IT ON THE DAY (Task 31)

Verified 2026-08-17, and again on 2026-08-18 against the standalone server.

```bash
npm run present    # build, then serve on http://127.0.0.1:4173
```

**You must serve it — do not double-click `index.html`.** The app is an ES
module, and browsers block module scripts loaded over `file://` regardless of
how the paths are written.

### Two ways to serve it, and why there are two

| | |
|---|---|
| `npm run preview` | Vite's own server. Fine at a desk. Needs `node_modules` intact |
| **`node serve.mjs`** | **~110 lines using only Node builtins.** Needs `dist/` and Node — nothing else |

`serve.mjs` exists for the failure mode that actually ends a lesson: the deck
copied to another laptop or a USB stick, `node_modules` missing or broken, and
no network to `npm install` from. It binds to loopback, sets `Cache-Control:
no-store` so a cached build can never be shown by mistake, falls back to the
deck on any unknown path, and refuses to start with a clear message if no build
is present rather than serving an empty page.

`offline.test.ts` asserts every one of its imports is a `node:` builtin, so the
zero-dependency promise cannot quietly lapse.

### The portable kit

```bash
npm run kit
```

Builds, then assembles `presentation-kit/` — **1.5 MB, three things**:

| | |
|---|---|
| `dist/` | the built presentation |
| `serve.mjs` | the server, no dependencies |
| `اقرأني — READ ME.txt` | bilingual instructions, keyboard map, and what to do when it goes wrong |

Copy that folder to a USB stick. On the target laptop: `node serve.mjs`, then
open `http://127.0.0.1:4173`. **Node is the only requirement.** No checkout, no
`node_modules`, no `npm install`, no network.

Verified 2026-08-18 by running the server from inside the kit folder alone:
index, favicon, all four JS chunks, the stylesheet, all five fonts and a deep
link every returned 200.

### What was checked

| | |
|---|---|
| Every asset local | `index.html` references only `/assets/…` and `/favicon.svg` |
| All 5 fonts bundled | Served from `/assets/`, no `@fontsource` or CDN `url()` in the built CSS |
| Every asset serves | index, entry JS, three chunk, CSS and the Arabic woff2 all return 200 |
| Deep links work | `#/scene/12` returns 200 |
| No runtime network calls | Zero `fetch` / `XMLHttpRequest` / `WebSocket` / `EventSource` / `sendBeacon` anywhere in `src/` |
| No third-party host | The only external URLs in the bundle are XML namespaces and package metadata inside three.js and React — inert strings, never fetched |

`src/__tests__/offline.test.ts` now enforces all of this against the source, so
it holds whether or not a build has been run. It also fails on a zero-byte font,
which would build cleanly and render nothing.

---

## 11. PRESENTER MODE (Task 25)

**`P` opens and closes the panel. `Esc` also closes it.**

An overlay on the same screen, not a second window — school laptops usually
mirror to the projector, so a second window would be useless there. The
consequence is real and worth knowing: **while the panel is open, the class can
see it.** It is small and quiet by design — open it, read, close it.

| Shows | Detail |
|---|---|
| Elapsed / total | `12:04 / 45:00` |
| Pacing badge | `متقدّم` / `على الوقت` / `متأخّر` plus the drift |
| Scene + beat | `مشهد ٨ · بيت ٣/٦` |
| Scene budget | Elapsed against this scene's `durationSec`, with a bar that turns red on overrun |
| Speaker notes | Currently only scenes 1, 2 and 33 have any |
| Next scene | Number, title, type, duration |

### How the clock behaves

- **Starts on your first navigation** — not on page load (the deck sits on the
  projector while the class settles) and not on `P` (checking notes beforehand
  must not start timing). Until then it reads `لم تبدأ بعد`.
- **Reset button in the panel** restarts at zero, still running. `Home` does
  *not* reset — an accidental Home silently destroying your pacing data would be
  worse than the convenience.
- **Keeps accumulating while the panel is closed**; there is no interval running
  then, because elapsed is derived from timestamps rather than counted.
- **Navigating backwards reads as suddenly behind.** That is correct — you are
  re-covering material — not a bug.

### Two implementation notes worth not undoing

**The clock must never live in `AppInner`.** It sits above a non-memoised
`ExperienceCanvas`, so a tick there would reconcile the entire 3D tree once a
second for 45 minutes. Elapsed time is held as two timestamps in
`src/lib/presenterSession.ts` — module scope, not React state — and only
`PresenterTimer` re-renders on a tick. Notes and next-scene are its *siblings*,
which is why no memoisation is needed anywhere.

**The keyboard is deliberately NOT suspended while the panel is open.**
`useKeyboardNavigation`'s `enabled` flag exists but is not used here: the
presenter reads notes *while* advancing, and taking the arrow keys away
mid-lesson would be a disaster.

**Deferred, not forgotten:** pause/resume (a paused-and-forgotten timer lies
silently for the rest of the lesson; reset covers rehearsal) and auto-hiding the
panel on statement/cinematic scenes, whose whole design is a clean screen.

---

## 13. REHEARSAL INSTRUMENTATION

**The run records its own frame rate, per world.** Added 2026-08-18, because
asking a presenter to read a corner readout and write the number down at each
world boundary — while presenting out loud for 45 minutes — is how a rehearsal
comes back with no usable numbers.

`src/lib/perfSession.ts` accumulates one sample a second into a module-scope
`Map`, keyed by world. Module scope for the same reason as
`presenterSession.ts`: 2700 `setState` calls over the lesson would reconcile
`ExperienceCanvas` and the whole 3D tree with it. Only the summary *view*
renders, and only when the presenter opens it.

| | |
|---|---|
| Where | The corner readout is now a button; click it for the table |
| When | `?perf=1` or a DEV build only — it does not exist in a real lesson |
| Records | avg / min / max fps, worst single frame in ms, peak draw calls, sample count |
| Order | Worlds in the order they were first entered, so it reads as the walk |
| Out | `copy` puts the table on the clipboard with tier, dpr and resolution |

**`min` is the number that matters, not `avg`.** A world averaging 58 that drops
to 24 at one transition has a stutter the mean hides — so `min` below 30 is
flagged with a `!` as well as colour.

`worstFrameMs` is the max `delta` inside each sampled second, taken from the
`useFrame` callback that was already running. `perfSession.test.ts` covers the
accumulation maths, which is the only part that can be wrong silently.

---

## 14. THE CODA — the five core rules (settled 2026-08-18)

The deck lists five rules after its last scene and attaches them to none:
Verify · Protect Privacy · Keep Critical Thinking · Don't Let AI Replace Real
People · Learn to Work With AI. They sat in `src/data/coreRules.ts` rendering
nowhere. **They are now a recap between scenes 32 and 33** — careers → the five
rules → the closing message.

Built first as a coda *past* scene 33 and moved on the author's call the same
day. Placing it after meant the lesson ended on a summary of its closing line
rather than on the line itself; a recap belongs before the last word.

⚠️ **It has no time budget.** The 33 scenes total exactly 2700s, so the ~45–60
seconds spent on the rules is unbudgeted and the pacing badge will read about a
minute behind at the finale. Deliberate — inside the 90-second tolerance in
`REHEARSAL.md` §3 — and revisited if the rehearsal says the rules take longer.

### Why not a 34th scene

The 33 scenes total exactly 2700s and `content.test.ts` asserts it, so there is
no room. Making one would have meant taking a minute from somewhere else.

Instead the coda lives in `PresentationState.coda: number | null` — `null` while
the deck runs, `0` at rest, `1..5` revealing one rule per press. **`sceneIndex`
never leaves the careers scene.** The consequences are all good ones:

- `SCENES.length` is still 33 and `getTotalBeats()` is still 106, so the
  progress bar, presenter pacing, the 45-minute budget and `deckFidelity` all
  see an unchanged deck
- `ExperienceCanvas` needed **no change at all** — `FutureCityWorld` keeps
  rendering behind it, so the world holds while the rules land on top of it
- Removing the coda later is deleting a component and a branch, not unpicking a
  scene

### Navigation rules worth not undoing

| | |
|---|---|
| `→` at scene 32's last beat | opens the coda |
| `→` past the fifth rule | hands over to scene 33 |
| `←` from scene 33 at rest | returns to the coda **fully revealed** |
| `←` from the coda's first position | returns to scene 32 fully revealed |
| `End` | goes to the closing message **with the coda closed** |
| `Home` / scene jump | close it and leave |
| `↓` from inside it | skips the rest of the rules to the closing message |

**`End` goes to the ending, never to the recap in front of it.**

### Measured perf, first pass (2026-08-18)

Real numbers at `medium` / dpr 1.5 / 1536×864, from a partial walk:

| World | avg | worst genuine frame | draw calls |
|---|---|---|---|
| ai-lab | 59.9 | 44 ms | 6 |
| study-lab | 59.9 | 113 ms | 30 |
| privacy | 59.8 | 113 ms | 38 |
| ai-world | 58.0 | — | 16 |
| future | 59.6 | — | 18 |

Comfortable everywhere. The two 113ms hitches in Study Lab and Privacy are the
only real finding and are single events, not a pattern.

That run also produced a "198-second worst frame" and 0 fps in two worlds, which
was a defect in the instrument, not the deck: requestAnimationFrame pauses when
the tab is hidden and reports the whole absence as one frame. Frames longer than
`MAX_PLAUSIBLE_FRAME_SEC` are now discarded — see `perfSession.ts` for why that
threshold is the right trade.

### Legibility pass on the finale (2026-08-18)

From the author, watching scene 33: the three closing lines sat too quietly and
the screen read as flat black.

| | |
|---|---|
| Closing lines | `RevealText` gained a `scale="cinematic"` variant — `normal` goes `text-lead`/soft → `text-title`/text, `strong` goes `text-title` → `text-headline`. The gap between them is kept, so `AI أداة.` is still the largest line in the deck. Used only by the two cinematic scenes |
| Background | `--color-void` lifted `#05060f` → `#0c1022` and `--color-deep` with it, deck-wide so no transition shows a jump. Contrast against `--color-soft` is still ~12:1. `scene-scrim` retinted to match, with its alphas raised slightly so it still does the job it was added for |
| Arabic leading | `--text-display` 1.25 → 1.35 and `--text-title` 1.4 → 1.5. Arabic sets deeper than Latin — descenders and the shadda in `يفكّر` — and a two-line headline collided at 1.25 |

**`sceneCoverage.test.ts` is new and is the important part.** It resolves the
component that renders each of the 33 scenes and asserts its source reads every
content field that scene populates. Verified non-vacuous against the repo's own
history: the committed `InteractiveScene` mentions `steps` zero times, so this
test would have caught scene 27's five dead presses.

### Guards

`presentationReducer.test.ts` pins all of the above, including the two
load-bearing facts — 33 scenes, 106 beats — that prove the coda stayed outside
the deck. `deckFidelity.test.ts` additionally asserts that `Coda.tsx` and
`PresenterOverlay.tsx` *read* `CORE_RULES` rather than restating it: the coda is
the first screen whose copy comes from a component rather than a scene, and a
rule typed into the JSX would sail straight past the two-way diff — which is
precisely the class of defect that has already shipped twice here.
