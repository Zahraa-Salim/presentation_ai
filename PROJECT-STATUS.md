# PROJECT STATUS — Interactive AI Education Experience

**Last updated:** 2026-08-17 — **the source deck has landed and is merged**
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
| Beats (key presses to walk the deck) | **146** |
| Runtime budget | exactly 2700s = 45.0 min |
| 3D worlds built | **all 11** — no scene renders a placeholder |
| Interactions built | **8 of 9** — only Real-or-Fake is left, blocked on content |
| **Tests** | **478 passing, 15 files, in-repo (Vitest)** |
| Content gaps (`⟦TODO⟧`) | **5** (was 85) |
| Bundle | entry 256.06 kB (gzip 79.57) · three 884.05 · motion 128.66 |

Gates all green: `typecheck` 0 errors · `lint` 0 errors · `build` succeeds ·
`test` 478/478.

**The whole deck now has real Arabic content.** Worlds 3–5 still render on
generic type-based renderers and placeholder 3D, but they say the right things.

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
| 15 | AI Tool Explorer | ✅ | Built on `ChoiceReveal`. Its 5 facilitation lines are still TODO |
| 16 | Study Companion | ✅ | Built on `ChoiceReveal`. Its 5 facilitation lines are still TODO |
| 17 | World 4 — Privacy | ✅ | `privacyVault` + `cyberCity` 3D |
| 18 | Privacy Sorter | ✅ | 12 items, click to flip. `privacyVault` 3D still placeholder |
| 19 | Cybersecurity / Real-or-Fake | 🔒 | **The one genuinely blocked interaction** — deck supplies no pair |
| 20 | World 5 — Future City | ✅ | `dependency` + `futureCity` 3D |
| 21 | Dependency experience | ✅ | Built on `ChoiceReveal`, all 4 lines supplied |
| 22 | Future City careers | ✅ | Built on `ChoiceReveal`, all 6 lines supplied |
| 23 | Entrepreneurship | 🔒 | |
| 24 | Final cinematic | ✅ | `finale` 3D — five world accents converging |
| 25 | Presenter mode (`P`) | ✅ | Overlay with timer, pacing badge, notes, next scene. See §11 |
| 26 | ~~Audio~~ | ❌ | **Dropped 2026-08-17 — the presentation is silent.** Never built; scaffolding removed |
| 27 | Performance pass | ⬜ | |
| 28 | Accessibility pass | ✅ | Reduced-motion chain now enforced; canvas hidden from AT; Latin runs marked `lang="en"` |
| 29 | Full rehearsal | ⬜ | **Can be done now** — all 33 walk, and presentation mode makes it viable |
| 30 | Final polish | ⬜ | |
| 31 | Production build verification | ✅ | Offline verified end to end; guarded by `offline.test.ts`. See §12 |
| 32 | Vercel deployment | ⬜ | |

**🔒 is now mostly lifted** — the deck has arrived and all Arabic copy is in
place. Tasks 13–24 are unblocked and are now about **3D environments and
interaction mechanics**, not content. Two exceptions: Task 15 still needs the
per-tool detail for `tools.ts`, and Task 23 (Entrepreneurship) has no source
content at all.

---

## 4. TIME ESTIMATE

Twelve tasks were completed in this session. Roughly **20 remain**.

| Phase | Tasks | Rough effort |
|---|---|---|
| Worlds 3–5 + their 6 interactions | 13–24 | ~1.5–2× the work done so far — these are the biggest tasks; each world is 5–11 scenes plus a bespoke 3D environment |
| Presenter mode, perf, a11y | 25–28 | Small-to-medium; foundations already exist. Audio dropped |
| Rehearsal, polish, build, deploy | 29–32 | Small, but rehearsal usually surfaces rework |

**The honest answer: the engineering is roughly 60% done, but the schedule
depends almost entirely on content.** Every remaining world task can be built to
the same standard as Worlds 1–2 without the deck — they will just ship with
visible gaps that still need filling afterwards. Supplying the deck earlier
removes a whole second pass.

If you have a fixed presentation date, tell me and I'll propose a cut-down scope
(for example: finish all five worlds structurally, skip Task 30 polish,
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

## 7. CONTENT — the deck is merged

The source deck is saved at **`content.json`** in the project root. It is the
source of truth; where it and earlier code disagreed, the deck won.

**Gaps fell from 85 to 5.** All five are things the deck genuinely does not
contain — not things left undone:

| Gap | Where | What is needed |
|---|---|---|
| Real-or-Fake pair | `interactions.ts` | Two items to compare — the deck names the threats (Phishing · Fake accounts · AI-generated scams · Deepfakes · Impersonation) but supplies no pair |
| Tool Explorer suggestions | `interactions.ts` | Which tools suit each of the 5 tasks |
| Study Companion prompts | `interactions.ts` | What to type to get each of the 5 roles |
| Entrepreneurship | `scenes.ts` scene 33 | The deck contains none — **Task 23 has no source content**; decide whether to drop it |
| The tool list | `tools.ts` | Still empty. The deck names tools (ChatGPT, Claude, Gemini, Canva AI, Gamma, GitHub Copilot) but not the per-tool `useCasesAr`/`strengthsAr`/`limitationsAr` the type wants. **Task 15 remains partly blocked** |

`content.test.ts` now asserts the count stays **≤ 8**, and separately that
Worlds 1–2 contain no gap at all.

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
npm run dev         # dev server → http://localhost:5173
npm test            # 236 Vitest tests (run once)
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

1. ✅ **Walk the deck in presentation mode** — done, and it immediately found the
   World 2 black-backdrop bug (§2b). This is why walking it first was worth it.
2. ✅ **The deck arrived and is merged** (§7).
3. **Walk it again — the content is real now, and the pacing has changed.**
   118 beats instead of 59. This is the moment for the timed rehearsal
   (Task 29): the deck finally says what it is meant to say, so pacing measured
   now is pacing you can trust.
4. **Task 25 (presenter mode) is planned and ready to implement** — see the
   plan file appendix. The timer and pacing badge are what make the rehearsal
   in step 3 measurable.
5. Then the worlds, now unblocked and purely about 3D and mechanics:
   Task 13 (Prompt Lab) → 14 → 17 → 20.

### Small decisions waiting on you
- Where `coreRules.ts` should surface — finale recap, presenter reference, or
  a handout. The deck attaches them to no scene.
- Whether Task 23 (Entrepreneurship) is dropped, given the deck has no content
  for it.
- Whether the ten English comparison headings should become Arabic.

### Risks worth tracking
- **The deck is the critical path.** Everything structural can be built without
  it, but each world then needs a second content pass.
- **Perf is unmeasured under real load** — three worlds are real, eight are
  still cheap placeholders. Three known waste paths were fixed (see below), but
  the numbers in §9 predate them and predate the deck.

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

Verified 2026-08-17 against a real production build.

```bash
npm run build      # 1.6 MB total in dist/
npm run preview    # http://localhost:4173
```

**You must serve it — do not double-click `index.html`.** The app is an ES
module, and browsers block module scripts loaded over `file://` regardless of
how the paths are written. `npm run preview` is the supported way, and it needs
no network.

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
