import { SCENES } from '@/data/scenes'
import { WORLDS } from '@/data/worlds'
import { INTERACTIONS } from '@/data/interactions'
import { isTodo } from '@/lib/todo'
import { getSceneBeatCount, getTotalBeats } from '@/lib/beats'
import type { WorldId } from '@/types'

const EXPECTED_SCENES = 33
const TARGET_MINUTES = 45

export interface ContentReport {
  errors: string[]
  warnings: string[]
  totalScenes: number
  totalMinutes: number
  totalBeats: number
  todoCount: number
  perWorld: {
    world: WorldId
    scenes: number
    beats: number
    minutes: number
    budget: number
  }[]
}

/**
 * Structural checks on the presentation data.
 *
 * This exists so that timing drift and broken references surface while
 * editing content — not during the rehearsal in Phase 15, when 33 scenes
 * slipping 30 seconds each would already be 16 minutes over budget.
 */
export function validateContent(): ContentReport {
  const errors: string[] = []
  const warnings: string[] = []

  // ---- Scene count -------------------------------------------------------
  if (SCENES.length !== EXPECTED_SCENES) {
    errors.push(`Expected ${EXPECTED_SCENES} scenes, found ${SCENES.length}.`)
  }

  // ---- Unique ids --------------------------------------------------------
  const seen = new Set<string>()
  for (const scene of SCENES) {
    if (seen.has(scene.id)) errors.push(`Duplicate scene id "${scene.id}".`)
    seen.add(scene.id)
  }

  // ---- Contiguous 1..N indices in array order ----------------------------
  SCENES.forEach((scene, i) => {
    if (scene.index !== i + 1) {
      errors.push(
        `Scene "${scene.id}" has index ${scene.index} but sits at position ${i + 1}.`,
      )
    }
  })

  // ---- Each world appears as one unbroken block --------------------------
  const worldRuns: WorldId[] = []
  for (const scene of SCENES) {
    if (worldRuns.at(-1) !== scene.world) worldRuns.push(scene.world)
  }
  const repeated = worldRuns.filter((w, i) => worldRuns.indexOf(w) !== i)
  if (repeated.length > 0) {
    errors.push(
      `Worlds must be contiguous; these are split across the running order: ${[...new Set(repeated)].join(', ')}.`,
    )
  }

  // ---- Interaction references resolve both ways --------------------------
  const interactionIds = new Set(INTERACTIONS.map((i) => i.id))
  for (const scene of SCENES) {
    if (scene.interaction && !interactionIds.has(scene.interaction)) {
      errors.push(
        `Scene "${scene.id}" references unknown interaction "${scene.interaction}".`,
      )
    }
    if (scene.type === 'interactive' && !scene.interaction) {
      errors.push(`Scene "${scene.id}" is interactive but has no interaction.`)
    }
  }
  for (const interaction of INTERACTIONS) {
    const host = SCENES.find((s) => s.id === interaction.sceneId)
    if (!host) {
      errors.push(
        `Interaction "${interaction.id}" points at unknown scene "${interaction.sceneId}".`,
      )
    } else if (host.interaction !== interaction.id) {
      errors.push(
        `Interaction "${interaction.id}" and scene "${host.id}" do not reference each other.`,
      )
    }
  }

  // ---- Timing ------------------------------------------------------------
  const totalSec = SCENES.reduce((sum, s) => sum + s.durationSec, 0)
  const totalMinutes = totalSec / 60
  if (Math.abs(totalMinutes - TARGET_MINUTES) > 1) {
    errors.push(
      `Total runtime is ${totalMinutes.toFixed(1)} min; target is ${TARGET_MINUTES} min.`,
    )
  }

  const perWorld = WORLDS.map((world) => {
    const scenes = SCENES.filter((s) => s.world === world.id)
    const minutes = scenes.reduce((sum, s) => sum + s.durationSec, 0) / 60
    if (Math.abs(minutes - world.budgetMin) > 0.5) {
      warnings.push(
        `World "${world.id}" is budgeted ${world.budgetMin} min but its scenes total ${minutes.toFixed(1)} min.`,
      )
    }
    return {
      world: world.id,
      scenes: scenes.length,
      beats: scenes.reduce((sum, s) => sum + getSceneBeatCount(s), 0),
      minutes,
      budget: world.budgetMin,
    }
  })

  // ---- Interaction time fits inside its host scene -----------------------
  for (const interaction of INTERACTIONS) {
    const host = SCENES.find((s) => s.id === interaction.sceneId)
    if (host && interaction.estimatedSec > host.durationSec) {
      warnings.push(
        `Interaction "${interaction.id}" needs ${interaction.estimatedSec}s but scene "${host.id}" only budgets ${host.durationSec}s.`,
      )
    }
  }

  // ---- Outstanding content gaps ------------------------------------------
  let todoCount = 0
  const countTodo = (value: string | undefined) => {
    if (value && isTodo(value)) todoCount += 1
  }
  for (const scene of SCENES) {
    countTodo(scene.title)
    countTodo(scene.content.headline)
    countTodo(scene.content.subheadline)
    countTodo(scene.content.statement)
    countTodo(scene.content.note)
    scene.content.steps?.forEach((step) => countTodo(step.text))
  }
  for (const interaction of INTERACTIONS) {
    countTodo(interaction.promptAr)
    interaction.options.forEach((o) => countTodo(o.label))
    interaction.facilitationAr.forEach(countTodo)
  }

  return {
    errors,
    warnings,
    totalScenes: SCENES.length,
    totalMinutes,
    totalBeats: getTotalBeats(),
    todoCount,
    perWorld,
  }
}

/** Logs the report once at startup. Dev only — stripped from production. */
export function reportContent(): void {
  if (!import.meta.env.DEV) return

  const report = validateContent()

  console.groupCollapsed(
    `%c PRESENTATION %c ${report.totalScenes} scenes · ${report.totalBeats} beats · ${report.totalMinutes.toFixed(1)} min · ${report.todoCount} TODO `,
    'background:#4f9dff;color:#05060f;font-weight:700;border-radius:3px 0 0 3px',
    'background:#111528;color:#e8ecfb;border-radius:0 3px 3px 0',
  )
  console.table(report.perWorld)
  report.errors.forEach((e) => console.error('✕', e))
  report.warnings.forEach((w) => console.warn('!', w))
  if (report.errors.length === 0 && report.warnings.length === 0) {
    console.log('✓ Structure and timing check out.')
  }
  if (report.todoCount > 0) {
    console.info(
      `${report.todoCount} content slots still need the original deck.`,
    )
  }
  console.groupEnd()
}
