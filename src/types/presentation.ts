import type { WorldId } from './world'
import type { InteractionId } from './interaction'

/**
 * Keys into the procedural 3D scene registry.
 * Every environment is built from primitives, instancing and particles —
 * no external .glb models in v1.
 */
export const SCENE_3D_IDS = [
  'void', // near-empty space; used by statement moments
  'opening', // particles → AI orb → world reveal
  'aiHistory', // timeline through the AI world
  'aiMind', // brain, tokens, probability flow
  'aiMachine', // input terminal → output screen
  'toolCity', // Study Tower, Research Hub, Creative Studio, Coding Lab, Startup Hub
  'studyLab', // desk, laptop, books — deliberately calm
  'privacyVault', // vault + security barrier + information cards
  'cyberCity', // network nodes, suspicious nodes, glitch
  'dependency', // student ↔ AI scale relationship
  'futureCity', // careers, tools, entrepreneurs
  'finale', // closing cinematic
] as const

export type Scene3DId = (typeof SCENE_3D_IDS)[number]

export const TRANSITION_IDS = [
  'fade', // default: fade + slight movement
  'fadeUp',
  'worldShift', // camera move + particles + environment change
  'statementReveal', // darkness → one sentence → visual reveal
  'cameraPush',
] as const

export type TransitionId = (typeof TRANSITION_IDS)[number]

export type SceneType =
  | 'statement' // one sentence, maximum weight
  | 'explain' // headline + staged reveal steps
  | 'interactive' // hosts one of the nine interactions
  | 'cinematic' // the finale

/** Emphasis controls typographic weight, not colour alone. */
export type RevealEmphasis = 'normal' | 'strong' | 'quiet'

export interface RevealStep {
  id: string
  /**
   * Short heading above the text — the deck's pipeline and framework stages
   * name each step (Prompt, Tokens, Context, Goal ...) before explaining it.
   * Usually a Latin technical term, so it renders with `.latin`.
   */
  label?: string
  /** Arabic. */
  text: string
  emphasis?: RevealEmphasis
}

/** Colour is never the only signal — `label` always states the meaning. */
export type GroupTone = 'positive' | 'negative' | 'neutral'

/**
 * One labelled column in a side-by-side comparison.
 *
 * The deck compares constantly — weak vs strong prompt, avoid vs try, what AI
 * helps with vs what it replaces, safe vs never-share. Ten scenes are built
 * this way, so it is a first-class shape rather than ad-hoc markup per scene.
 */
export interface ContentGroup {
  id: string
  /** Arabic heading. Carries the meaning that `tone` only reinforces. */
  label: string
  items: string[]
  tone?: GroupTone
}

/**
 * All Arabic copy lives here, sourced from the original presentation.
 * Scene components render a SceneContent — they never inline strings.
 */
export interface SceneContent {
  headline?: string
  subheadline?: string
  /**
   * A quoted example the scene is *about* — a prompt, a message, a request.
   * Rendered as a quotation, not as body copy.
   */
  example?: string
  /** Progressive reveals. See `pacing` for whether they cost a key press. */
  steps?: RevealStep[]
  /**
   * How `steps` arrive.
   *
   * `'auto'` (the default) cascades them in on their own, a fraction of a
   * second apart, the moment the scene does. Seven single words should not cost
   * seven presses.
   *
   * `'stepped'` gives each one its own beat, for the four places where that is
   * the design rather than an inconvenience: scenes 4 and 9, where a 3D
   * milestone or pipeline node lights with each line; scene 17, where the
   * machine's beam focuses as each part of the prompt is named; and the finale,
   * where the pause between the four closing lines IS the ending.
   */
  pacing?: 'auto' | 'stepped'
  /** Two or three labelled columns, revealed one per beat. */
  groups?: ContentGroup[]
  /** The single sentence used by 'statementReveal' transitions. */
  statement?: string
  /** The line the scene lands on, rendered last and with weight. */
  keyMessage?: string
  note?: string
}

export interface SceneDef {
  id: string
  world: WorldId
  /** Position in the presentation, 1..33. */
  index: number
  /** Arabic title, also shown in presenter mode. */
  title: string
  type: SceneType
  content: SceneContent
  scene3d: Scene3DId
  interaction?: InteractionId
  /** Seconds budgeted. Feeds the 45-minute total and the presenter timer. */
  durationSec: number
  transition: TransitionId
  /**
   * Arabic presenter-only notes: what to say, what to ask, when to pause,
   * when to trigger the interaction. Never shown to students.
   * Populated in Phase 11, but the field exists now so it does not have to
   * be retrofitted across all 33 scenes later.
   */
  speakerNotes: string[]
}

/* ────────────────────────────────────────────────────────────────────────────
   ENGINE STATE
   ──────────────────────────────────────────────────────────────────────────── */

export interface PresentationState {
  /** 0-based internally; exposed to components 1-based as `sceneNumber`. */
  sceneIndex: number
  /** 0 .. beatCount-1. Beat 0 is the scene at rest. */
  beat: number
  /** Last movement. Transitions and RTL mirroring read this. */
  direction: 1 | -1
  /**
   * The closing coda — the deck's five core rules, which belong to no scene.
   *
   * `null` while the deck is being presented; `0` is the coda at rest and
   * `1..CORE_RULES.length` reveal the rules one press each. It is deliberately
   * *not* a 34th scene: the 33 already total exactly 2700s, and keeping
   * `sceneIndex` pinned to the finale means the progress bar, presenter pacing
   * and the finale 3D all carry on unchanged behind it.
   */
  coda: number | null
}

export type PresentationAction =
  | { type: 'NEXT' }
  | { type: 'PREV' }
  | { type: 'NEXT_SCENE' }
  | { type: 'PREV_SCENE' }
  | { type: 'JUMP_TO_SCENE'; sceneIndex: number }
  | { type: 'FIRST' }
  | { type: 'LAST' }

/** What a key press or gesture is asking the presentation to do. */
export type NavIntent =
  | 'next'
  | 'prev'
  | 'nextScene'
  | 'prevScene'
  | 'first'
  | 'last'
  | 'fullscreen'
  | 'escape'
  | 'presenter'

export interface KeyBinding {
  /** `KeyboardEvent.key` values. Single letters are matched case-insensitively. */
  keys: string[]
  intent: NavIntent
  /** Arabic label for presenter mode and a future help overlay. */
  labelAr: string
}

export interface PresentationActions {
  /** Reveal the next beat, or move to the next scene when fully revealed. */
  next: () => void
  /** Step back a beat, or to the previous scene shown fully revealed. */
  prev: () => void
  /** Skip remaining beats and go to the next scene. */
  nextScene: () => void
  prevScene: () => void
  /** 0-based. Lands at beat 0. */
  jumpToScene: (sceneIndex: number) => void
  first: () => void
  last: () => void
}
