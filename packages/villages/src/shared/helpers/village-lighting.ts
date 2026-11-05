export type VillageLighting = "morning" | "day" | "evening" | "night";

/** Visual daylight is separate from the narrative clock's six-hour activities. */
export function villageLighting(instant: string, timeZone?: string): VillageLighting {
  if (!Number.isFinite(Date.parse(instant))) return "day";
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: timeZone === "local" ? undefined : timeZone,
      hour: "2-digit",
      hourCycle: "h23",
    }).format(new Date(instant)),
  );
  if (hour < 5 || hour >= 20) return "night";
  if (hour < 8) return "morning";
  if (hour < 17) return "day";
  return "evening";
}

export const MAP_LIGHTING_FILTERS: Record<VillageLighting, string> = {
  morning: "sepia(.12) saturate(.95) brightness(1.05)",
  day: "none",
  evening: "sepia(.3) saturate(1.1) brightness(.9)",
  night: "sepia(.15) hue-rotate(165deg) saturate(.7) brightness(.62)",
};
