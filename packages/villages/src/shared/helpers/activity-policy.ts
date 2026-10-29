import type { VillageBackgroundPace } from "../contracts/village.js";

/** One policy for automatic activity; stored pace values remain compatible. */
export const VILLAGE_ACTIVITY_POLICY = {
  off: { label: "Off", reviews: 0, intervalMs: 0 },
  quiet: { label: "Quiet", reviews: 2, intervalMs: 60 * 60_000 },
  balanced: { label: "Average", reviews: 6, intervalMs: 30 * 60_000 },
  lively: { label: "Busy", reviews: 12, intervalMs: 15 * 60_000 },
} as const satisfies Record<VillageBackgroundPace, { label: string; reviews: number; intervalMs: number }>;
