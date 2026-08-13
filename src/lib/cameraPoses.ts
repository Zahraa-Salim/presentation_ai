import type { Scene3DId } from '@/types'

export interface CameraPose {
  /** World-space camera position. */
  position: [number, number, number]
  /** Point the camera looks at. */
  target: [number, number, number]
  fov: number
}

/**
 * Where the camera sits for each 3D environment.
 *
 * Pure data so the poses can be tuned without touching the controller, and so
 * coverage is testable — a scene referencing a pose that does not exist should
 * fail in CI, not on the projector.
 *
 * The worlds are laid out along X so moving between them is a real traversal
 * rather than a cut: AI World near the origin, then AI Lab, Study Lab, Privacy,
 * and Future City further out.
 */
export const CAMERA_POSES: Record<Scene3DId, CameraPose> = {
  // Neutral fallback.
  void: { position: [0, 0, 12], target: [0, 0, 0], fov: 50 },

  // World 1 — AI World
  opening: { position: [0, 0.5, 14], target: [0, 0, 0], fov: 55 },
  aiHistory: { position: [6, 1.5, 12], target: [2, 0, 0], fov: 50 },

  // World 2 — AI Lab
  aiMind: { position: [24, 1, 10], target: [22, 0, 0], fov: 45 },
  aiMachine: { position: [28, 0.5, 11], target: [26, 0, 0], fov: 50 },

  // World 3 — Study Lab
  toolCity: { position: [48, 6, 18], target: [46, 0, 0], fov: 55 },
  studyLab: { position: [52, 1.5, 8], target: [51, 0.5, 0], fov: 40 },

  // World 4 — Privacy & Cybersecurity
  privacyVault: { position: [72, 1, 10], target: [70, 0, 0], fov: 45 },
  cyberCity: { position: [78, 4, 16], target: [76, 0, 0], fov: 60 },

  // World 5 — Future City
  dependency: { position: [96, 1, 11], target: [94, 0, 0], fov: 45 },
  futureCity: { position: [102, 7, 20], target: [100, 0, 0], fov: 58 },

  finale: { position: [110, 0.5, 13], target: [109, 0, 0], fov: 50 },
}

export function getCameraPose(id: Scene3DId): CameraPose {
  return CAMERA_POSES[id] ?? CAMERA_POSES.void
}
