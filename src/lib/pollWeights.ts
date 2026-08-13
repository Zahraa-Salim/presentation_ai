/**
 * Relative bar weights for the presenter-driven poll.
 *
 * The class raises hands, the presenter clicks the option that dominated, and
 * the bars settle at relative lengths. No count or percentage is ever produced
 * or shown: in a lesson about not accepting AI output uncritically, presenting
 * invented statistics to students would be exactly the wrong thing to model.
 *
 * Deterministic — the same selection always yields the same shape.
 */

/** Descending weights for the options that were not selected. */
const RUNNER_UP_WEIGHTS = [0.45, 0.25, 0.15, 0.1, 0.08]

/** Level, neutral bars before the presenter has chosen. */
const RESTING_WEIGHT = 0.12

export function getPollWeights(
  optionCount: number,
  selectedIndex: number | null,
): number[] {
  if (optionCount <= 0) return []

  if (selectedIndex === null) {
    return Array.from({ length: optionCount }, () => RESTING_WEIGHT)
  }

  let runnerUp = 0

  return Array.from({ length: optionCount }, (_, index) => {
    if (index === selectedIndex) return 1

    const weight =
      RUNNER_UP_WEIGHTS[runnerUp] ??
      RUNNER_UP_WEIGHTS[RUNNER_UP_WEIGHTS.length - 1]
    runnerUp += 1
    return weight
  })
}
