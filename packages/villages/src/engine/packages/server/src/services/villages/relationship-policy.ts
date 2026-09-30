/** Central tuning for the village's independent social simulation. */
export const RELATIONSHIP_POLICY = {
  minimum: -100,
  maximum: 100,
  adjustments: { minor: 2, meaningful: 5, major: 15 },
  ordinaryDailyWarmth: 2,
  decayGraceDays: 7,
  dayMs: 86_400_000,
  friend: { warmth: 25, trust: 25, retainWarmth: 15, retainTrust: 15 },
  close: { warmth: 50, trust: 50, retainWarmth: 35, retainTrust: 35 },
  staff: { warmth: -100, trust: 50, retainWarmth: -100, retainTrust: 35 },
} as const;

export function relationshipScore(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(-100, Math.min(100, Math.trunc(value))) : 0;
}

export function relationshipLabel(value: number, dimension: "warmth" | "trust"): string {
  const bands =
    dimension === "warmth"
      ? ["Hateful", "Hostile", "Unfriendly", "Cool", "Neutral", "Warm", "Friendly", "Close", "Very close"]
      : [
          "Deep distrust",
          "Distrustful",
          "Wary",
          "Uncertain",
          "Unestablished",
          "Some confidence",
          "Reliable",
          "Trusted",
          "Deeply trusted",
        ];
  const thresholds = [-75, -50, -25, -10, 10, 25, 50, 75];
  return bands[thresholds.filter((threshold) => value >= threshold).length]!;
}

export function relationshipThreshold(
  warmth: number,
  trust: number,
  active: boolean,
  level: "friend" | "close" | "staff",
): boolean {
  const rule = RELATIONSHIP_POLICY[level];
  return warmth >= (active ? rule.retainWarmth : rule.warmth) && trust >= (active ? rule.retainTrust : rule.trust);
}

export function localRelationshipDate(at: string): string {
  const date = new Date(at);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
