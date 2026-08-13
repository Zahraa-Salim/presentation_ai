# Interactive AI Education Experience — Grade 11 Lebanon

A 45-minute Arabic-first, RTL, 3D-enhanced interactive presentation teaching
students how to use AI intelligently.

**Core message:** خلي AI يساعدك، مش يفكّر بدالك.

This is **not** a website and **not** 33 slides recreated in React. It is one
continuous interactive AI world containing ~33 presentation moments.

---

## THE MASTER RULE

Do not implement the entire project at once. Work task-by-task. Before
implementing any task, inspect the existing implementation and produce a plan.
Do not modify files during the planning stage. After approval, implement only
the approved scope. Preserve existing architecture and reusable components.
Do not introduce libraries without justification. Prioritize presentation
performance, Arabic RTL quality, accessibility, and educational clarity over
visual effects.

**Never replace working functionality merely to implement a new feature.
Extend the existing architecture whenever possible.**

### Task cycle

1. Inspect the current implementation
2. Plan (no file changes)
3. Wait for approval
4. Implement only the approved scope
5. Test
6. Fix only issues caused by this task — do not refactor unrelated areas

### Priority order

When these conflict, higher wins:

1. Educational clarity
2. Presentation usability
3. Arabic RTL quality
4. Performance
5. Maintainability
6. Visual quality
7. 3D effects

3D never compromises the first five.

---

## CONTENT RULES

**The original presentation deck is the source of truth.** Do not invent
educational content, do not replace the structure, do not silently change the
teaching flow. UX, visual storytelling, interaction design, transitions and 3D
representation are open to improvement; the educational content is not.

Where the deck has not been supplied, mark the gap with `TODO()` from
`src/lib/todo.ts`. Never fill it with invented text.

**All Arabic copy lives in `src/data/`.** Components render content passed to
them — they never inline strings. No `Slide1.tsx … Slide33.tsx`.

### Language

- Arabic is dominant. Lebanese / simple conversational Arabic for headlines,
  questions, interactions and NOVA's voice; simple MSA for explanations.
- Natural for Grade 11 students: not overly formal, not academic, not
  childish, not heavy slang.
- English is allowed for: AI, Prompt, Context, Machine Learning, Deep
  Learning, Generative AI, Cybersecurity, AI Literacy, tool names, and short
  technical terms.
- One screen communicates one primary idea. Never make students read tiny
  paragraphs.

---

## STACK — pinned, do not change without justification

React 19.2 · TypeScript 5.9 · Vite 8 · Tailwind CSS v4 (CSS-first) · Motion ·
Three.js · React Three Fiber 9 · @react-three/drei · Lucide React

Optional, only when actually needed: GSAP (complex camera/timeline
choreography only), Howler.js, @react-three/postprocessing, Rapier.

### Version constraints that will break the build if violated

- **React must stay `~19.2.x`.** `@react-three/fiber@9` peer-caps at
  `react <19.3`.
- **TypeScript must stay `5.x`.** `typescript-eslint@8` peer-caps at
  `typescript <6.1.0`. TS 7 means no TypeScript linting.
- `three` is deduped in `vite.config.ts` — a duplicated three.js instance is a
  classic R3F failure mode.

---

## ARCHITECTURE

```
src/
├─ app/                    App root
├─ components/
│  ├─ presentation/        engine, scene manager, navigation, progress
│  ├─ ui/                  reusable UI primitives
│  ├─ three/               reusable 3D systems + NOVA
│  └─ interactions/        the nine classroom interactions
├─ scenes/{ai-world,ai-lab,study-lab,privacy,future}/
├─ data/                   ALL content lives here
├─ hooks/  lib/  types/  styles/  assets/
```

### Deliberate deviations from the original brief's structure

1. **No router.** A 33-step linear presentation is state, not routes. There is
   no `app/routes/`. Deep-linking, if needed, is a `#/scene/12` hash synced to
   presentation state. This keeps local `preview` and Vercel identical with no
   SPA rewrite config.
2. **One persistent `<Canvas>`** for the whole experience, with scenes swapping
   inside it. Mounting a Canvas per scene destroys and recreates a WebGL
   context on every navigation — stutter, memory churn, and browsers cap
   contexts and silently kill the oldest.
3. **`assets/models` and `assets/textures` stay empty.** All 3D is procedural
   in v1 (primitives, instancing, particles, glowing materials, simple
   shaders). External `.glb` models are a separate decision per scene.

### Layering

```
<PresentationEngine>
  ├─ <ExperienceCanvas>   mounted once, never unmounts   (z: canvas)
  └─ <UILayer>            DOM, absolutely positioned      (z: ui / overlay)
```

---

## ARABIC & RTL RULES

- `<html lang="ar" dir="rtl">`.
- **Never render Arabic text inside WebGL.** Three.js and drei's `<Text>` do
  not perform Arabic shaping or bidi correctly — letters render disconnected
  and reversed. All Arabic text renders in the DOM layer above the Canvas.
- **Logical properties only** in Tailwind: `ps-/pe-/ms-/me-/start-/end-`.
  Never `pl-/pr-/left-/right-`.
- 3D space is direction-agnostic: camera pans, arrows, progress direction and
  reveal order must be mirrored explicitly for RTL.
- Arabic needs more line-height than Latin — use `--leading-arabic`.
- Wrap English runs in `.latin` (or `lang="en"`) so they get Inter's metrics.

---

## PERFORMANCE RULES

The presentation laptop's GPU is unknown. Design for ordinary school hardware.

- Target 1920×1080; **1366×768 is the floor** and must be tested.
- Clamp `dpr` — the single biggest fill-rate lever.
- Read budgets from the quality tier (`QualitySettings`), never hard-code
  particle counts.
- Particles use `Points` / `InstancedMesh`, never one mesh each.
- Post-processing (bloom) is expensive: sparing, optional, off on low tier.
- Animate in `useFrame` mutating refs. Never drive per-frame 3D from
  `setState` — it re-renders the tree 60×/s.
- Lazy-load worlds. Dispose geometries, materials and textures on unmount —
  this runs for 45 minutes straight.
- Never sacrifice usability for visual effects.

---

## OFFLINE REQUIREMENT

The presentation must run with **zero network access**.

- Fonts are bundled in `src/assets/fonts/` (Arabic + Latin subsets, ~226 KB).
  Upstream source is the `@fontsource` devDependencies; the woff2 files are
  copied into the repo so the build never depends on module resolution or a
  CDN. No CDN fonts, ever.
- No external APIs, no live AI calls, no analytics.
- Must work from a local production build (`npm run build && npm run preview`)
  and deploy unchanged to Vercel as a static SPA. No backend.

---

## ACCESSIBILITY

- Full keyboard navigation: `←` `→` `Space` `Home` `End` `F` `Esc`, `P` for
  presenter mode.
- Honour `prefers-reduced-motion`: damp camera movement, cut particle effects,
  simplify transitions.
- Never encode meaning in colour alone — pair with icon or label. This matters
  most in the Privacy Sorter (safe / don't share) and Cybersecurity scenes.
- Visible focus states; readable Arabic at projection distance.

---

## NOVA

One recurring procedural 3D AI character: curious, friendly, helpful,
playful, intelligent, slightly humorous. Not childish, not scary, not overly
humanoid.

**NOVA must never encourage emotional dependency.** It communicates
"أنا موجود لأساعدك" — never "أنا أفضل صديق إلك". The presentation itself
teaches AI boundaries, so the character has to model them.

---

## 3D RULE

3D explains concepts; it does not decorate.

- Bad: a spinning 3D robot next to some text.
- Good: private information physically tries to enter the AI vault and is
  blocked by the barrier.

---

## COMMANDS

```
npm run dev         # dev server
npm run typecheck   # tsc -b
npm run lint        # eslint
npm run build       # tsc -b && vite build
npm run preview     # serve the production build locally
```

Git is intentionally not set up. Do not initialize a repository or create
commits unless asked.
