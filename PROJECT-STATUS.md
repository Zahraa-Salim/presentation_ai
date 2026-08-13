# PROJECT STATUS — Interactive AI Education Experience

**Last updated:** 2026-08-13, end of Task 12
**Project:** 45-minute Arabic-first interactive AI lesson for Grade 11, Lebanon
**Core message:** خلي AI يساعدك، مش يفكّر بدالك.

This document is the handover. It records where the project stands, every
decision made and why, what is still missing, and how to continue.

---

## 1. WHERE WE ARE

**Tasks 00–12 are complete.** The full presentation engine, UI layer, 3D
foundation, NOVA, and Worlds 1 and 2 are built and tested.

**All 33 scenes already walk end to end.** Worlds 3–5 render through generic
type-based renderers with visible `⟦TODO⟧` markers and placeholder 3D until
their own tasks. You can press through the whole deck today.

| Metric | Value |
|---|---|
| Source files | 80 |
| Scenes | 33 (all render) |
| Beats (key presses to walk the deck) | 59 |
| Runtime budget | exactly 2700s = 45.0 min |
| 3D worlds built | 3 of 11 (`opening`, `aiHistory`, `aiMind`) |
| Interactions built | 2 of 9 (opening poll, mind reader) |
| Automated test suites | 9, all passing |
| Content gaps (`⟦TODO⟧`) | **85** |
| Bundle | entry 238.49 kB (gzip 73.99) · three 884.05 · motion 128.66 |

---

## 2. ⚠️ KNOWN PROBLEM — "scenes change but the screen looks the same"

**Diagnosed. This is a dev-harness artifact, not an engine bug.**

### What is happening

`src/app/App.tsx` renders a long **scrolling debug page**:

```
<main class="scene-frame overflow-y-auto">     ← absolute, fills viewport, scrolls
  header  (world label · 12 / 33)
  ┌──────────────────────────────────┐
  │  h-[420px]  ← THE ACTUAL SCENE   │   ← only 420px tall, near the top
  └──────────────────────────────────┘
  debug: scene data   (collapsed)
  NOVA lab            (12 emotion buttons)
  Component gallery   (long)
  Scene jump grid     (33 buttons — at the very BOTTOM)
</main>
```

The scene jump grid sits at the bottom of that page. When you scroll down to
click a scene number — or press `→` while scrolled down — **the scene really
does change, but the 420px scene window is far above the viewport**, so the part
of the screen you are looking at (gallery, buttons) is unchanged.

The progress bar at the bottom and the `12 / 33` counter *do* update. That is
the giveaway: state is fine, you just cannot see the scene.

### How to confirm in 10 seconds

Scroll to the very top, then press `→`. The scene region will change correctly.

### Recommended fix (not yet implemented)

**Add a presentation mode toggle.** A key (or button) that hides all harness
chrome and renders `<SceneRenderer>` full-screen — which is what the product
actually is. The harness then becomes an optional debug overlay rather than the
default view.

This is worth doing **before Task 13**, because right now the work is hard to
review, and every future world inherits the same problem.

Smaller alternatives if you want something immediate:
- Make the 420px scene region `sticky top-0` so it stays visible while scrolling
- Scroll to top automatically on scene change

---

## 3. TASK QUEUE — full status

Legend: ✅ done · 🔄 next · ⬜ not started · 🔒 blocked on source deck

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
| — | **Presentation mode toggle** | 🔄 | **Recommended before 13 — see §2** |
| 13 | Prompt Lab (`aiMachine` 3D) | 🔒 | Scenes 16–18 |
| 14 | World 3 — Study Lab | 🔒 | Scenes 11–21 |
| 15 | AI Tool Explorer | 🔒 | Needs `tools.ts` populated |
| 16 | Study Companion | 🔒 | |
| 17 | World 4 — Privacy | 🔒 | Scenes 22–28 |
| 18 | Privacy Vault | 🔒 | |
| 19 | Cybersecurity / Real-or-Fake | 🔒 | |
| 20 | World 5 — Future City | 🔒 | Scenes 29–33 |
| 21 | Dependency experience | 🔒 | |
| 22 | Future City careers | 🔒 | |
| 23 | Entrepreneurship | 🔒 | |
| 24 | Final cinematic | 🔒 | Closing text IS known (see §6) |
| 25 | Presenter mode (`P`) | ⬜ | Key already bound, inert |
| 26 | Audio | ⬜ | Optional |
| 27 | Performance pass | ⬜ | |
| 28 | Accessibility pass | ⬜ | |
| 29 | Full rehearsal | ⬜ | **Can be done now — all 33 walk** |
| 30 | Final polish | ⬜ | |
| 31 | Production build verification | ⬜ | Build works; offline verified once |
| 32 | Vercel deployment | ⬜ | |

**🔒 = blocked on the source presentation deck**, which has not been provided.
Structure can be built without it; Arabic copy cannot.

---

## 4. ARCHITECTURE

```
src/
├─ app/App.tsx              ← dev harness (TEMPORARY, see §2)
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
├─ hooks/  lib/  types/  styles/  assets/fonts/
```

### The two registry patterns (extend these, don't bypass them)

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

## 5. DECISION LOG

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

## 6. CONTENT GAPS — 85 markers

All render visibly in amber as `⟦TODO: …⟧`. Filling them is a **pure data edit
in `src/data/` — no component changes**.

| File | Gaps | What is needed |
|---|---|---|
| `scenes.ts` | 55 | Titles for Worlds 3–5, body copy throughout |
| `interactions.ts` | 19 | Prompts, options, facilitation notes for 7 interactions |
| `aiHistory.ts` | 5 | Arabic captions for the 5 milestones |
| `aiPipeline.ts` | 5 | Arabic captions for Prompt/tokens/patterns/probability/response |
| `tools.ts` | empty | **The entire AI tool list** — blocks Task 15 |

### Highest-value small asks (biggest effect per word)
1. **4 Arabic phrases** for the mind-reader possibilities → makes scene 6 fully real
2. **5 pipeline captions** → makes scene 9 fully real
3. **The tool list** → unblocks Task 15 entirely

### What IS known verbatim (from the brief, already in place)
- All 10 titles for Worlds 1–2
- The closing sequence: `AI مش سحر.` → `AI مش قارئ أفكار.` → `AI مش بديل عنك.` → `AI أداة.` → `خلي AI يساعدك، مش يفكّر بدالك.`
- Poll question + 3 choices; mind-reader statement + question; Prompt Lab formula; Tool Explorer 6 choices; Study Companion 5 choices; Privacy Sorter 6 items; career 6 roles

---

## 7. HOW TO RUN

```bash
npm run dev         # dev server → http://localhost:5173
npm run typecheck   # tsc -b
npm run lint        # eslint
npm run build       # tsc -b && vite build
npm run preview     # serve the production build locally
```

**URL options:** `?quality=low|medium|high` forces the render tier ·
`?perf=1` shows the FPS meter in production · `#/scene/12` jumps to a scene.

**Keyboard:** `→`/`Space`/`PageDown` next beat · `←`/`PageUp` back ·
`↓`/`↑` skip scene · `Home`/`End` · `F` fullscreen · `1`–`6` pick a choice ·
`Esc` reset an interaction. `P` is bound but inert until Task 25.

### Test suites

Nine Node suites live in the session scratchpad (not in the repo). They are
bundled with Rolldown and run against the real modules:

```
reducerTest · keymapTest · transitionsTest · progressTest · uiTest
threeTest · novaTest · world1Test · world2Test
```

**These are outside the project and will be lost.** If you want them kept,
they should be moved into `src/` with a real test runner (Vitest) — worth doing
before the project grows further.

---

## 8. VERIFIED ON REAL HARDWARE

From your checks:
- Tier auto-detected as **`high`**, 60 fps, dpr 2
- **58 fps at 1366×768** (the hardware floor that matters)
- **WebGL kill test passed** — presentation kept working with 3D disabled
- **Arabic legible over the 3D** — confirms the solid-card decision

Caveat: those numbers came from trivial placeholder geometry. Re-measure once
more worlds are real.

---

## 9. RECOMMENDED NEXT STEPS

1. **Fix the scene visibility problem (§2)** — add presentation mode. Without
   it, nothing after this is properly reviewable.
2. **Do a timing rehearsal (Task 29 early)** — all 33 scenes walk now.
   Measuring pacing before four more worlds are built is far cheaper than after.
3. **Send the source deck**, or even one world's worth. It gates 12 tasks.
4. Then continue: Task 13 (Prompt Lab) → 14 → 17 → 20.

### Risks worth tracking
- **The deck is the critical path.** Everything structural can be built without
  it, but the gap list grows with each world.
- **Test suites live outside the repo** and will not survive.
- **Perf is unmeasured under real load** — three worlds are real, eight are
  still cheap placeholders.
- **`prefers-reduced-motion` has never been tested end to end.**
