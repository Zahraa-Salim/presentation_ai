import type { NovaEmotion } from '@/types'

/**
 * Which state NOVA holds on each scene.
 *
 * Pure data, keyed by scene id, exactly like `cameraPoses.ts` and
 * `novaExpressions.ts` — so the companion has no switch statements buried in
 * render code, and so coverage is testable. A scene without an entry should
 * fail in CI, not surface as a mascot pulling a face at the wrong moment.
 *
 * Deliberately **one state per scene**, switched on navigation and nothing
 * else. A companion that shifts on every beat moves while the presenter is
 * mid-sentence, and the movement in the corner of the eye is exactly what makes
 * a mascot cost attention rather than add warmth.
 *
 * Character rule, from CLAUDE.md: NOVA is here to help and must never
 * encourage emotional dependency. Four of the mappings below are educational
 * calls rather than aesthetic ones, and each is pinned by a test in
 * `robot.test.ts` with the reason attached.
 */

/**
 * Screen corner, named physically rather than logically.
 *
 * The `start`/`end` convention is a Tailwind rule for the DOM, where it flips
 * under RTL. This is WebGL: nothing flips, and a name that meant "left" in this
 * deck and "right" in another would be a trap rather than a convenience.
 */
export type RobotCorner = 'bottom-right' | 'bottom-left'

export interface RobotBehavior {
  emotion: NovaEmotion
  /** Absent entirely. For scenes whose design is a bare screen. */
  hidden?: boolean
  /** Multiplier on the default size. Only where a scene is unusually dense. */
  scale?: number
  corner?: RobotCorner
}

/** Scenes whose whole design is a clean screen. */
const HIDDEN: RobotBehavior = { emotion: 'idle', hidden: true }

export const ROBOT_BEHAVIORS: Record<string, RobotBehavior> = {
  // ── World 1 — AI World ──────────────────────────────────────────────────
  // The opening statement holds alone in darkness. Nothing else belongs there.
  opening: HIDDEN,
  'opening-poll': { emotion: 'look' },
  'ai-is-everywhere': { emotion: 'look' },
  'ai-is-not-new': { emotion: 'thinking' },
  'ai-is-not-a-trend': HIDDEN,

  // ── World 2 — AI Lab ────────────────────────────────────────────────────
  'not-mind-reader': { emotion: 'confused' },
  context: { emotion: 'thinking' },
  /*
    `AI مش سحر.` as the brain dissolves into machinery — the highest-stakes
    visual in the deck. A mascot in the corner competes with it for the one
    moment that has to land.
  */
  'not-magic': HIDDEN,
  'how-ai-works': { emotion: 'thinking' },
  'why-ai-makes-mistakes': { emotion: 'confused' },

  // ── World 3 — Study Lab ─────────────────────────────────────────────────
  'tools-overview': { emotion: 'look' },
  'study-tools': { emotion: 'thinking' },
  'creative-tools': { emotion: 'happy' },
  'coding-tools': { emotion: 'thinking' },
  'which-ai-for-which-task': { emotion: 'look' },
  'weak-prompt': { emotion: 'confused' },
  // The payoff: the same request, asked properly.
  'strong-prompt': { emotion: 'happy' },
  'prompt-framework': { emotion: 'thinking' },
  'study-companion': { emotion: 'thinking' },
  'ask-to-teach': { emotion: 'look' },
  'ai-and-learning': { emotion: 'thinking' },

  // ── World 4 — Privacy & Cybersecurity ───────────────────────────────────
  /*
    `look`, never `happy` — and never `celebrate`.

    The scene asks the class whether an AI is your friend. A delighted mascot
    answers yes before anyone has thought about it, which is the opposite of
    what the next three scenes go on to teach.
  */
  'is-chatgpt-a-friend': { emotion: 'look' },
  'why-ai-feels-like-a-friend': { emotion: 'look' },
  // Friend / life coach / secret keeper — the boundary scene.
  'friend-lifecoach-secretkeeper': { emotion: 'warning' },
  'what-to-share': { emotion: 'look' },
  'what-not-to-share': { emotion: 'warning' },
  // Twelve items sorted and two messages compared: the densest screen in the
  // deck, so the companion gives up some room.
  'ai-cybersecurity': { emotion: 'warning', scale: 0.85 },
  'before-send': HIDDEN,

  // ── World 5 — Future City ───────────────────────────────────────────────
  'tool-vs-replacement': { emotion: 'idle' },
  /*
    `thinking`, not `sad`. The scene is about stepping back and thinking for
    yourself, not about being punished for having leaned on a tool.
  */
  dependency: { emotion: 'thinking' },
  /*
    `idle`, and never `sad` or `confused`. The whole point of the scene is that
    not using AI is not a failure — a disappointed companion argues that it is.
  */
  'non-ai-user': { emotion: 'idle' },
  'future-jobs': { emotion: 'look' },
  // The closing line gets the screen to itself.
  final: HIDDEN,
}

/**
 * Falls back to resting rather than throwing: an unmapped scene should look
 * unremarkable on the projector, never take the canvas down.
 */
export function getRobotBehavior(sceneId: string): RobotBehavior {
  return ROBOT_BEHAVIORS[sceneId] ?? { emotion: 'idle' }
}
