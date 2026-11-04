import type { SocialActivity } from "../models/social-activity.js";
const object = (v: unknown): Record<string, unknown> =>
  v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
const shortActivityText = (v: unknown, length = 320) => (typeof v === "string" ? v.trim().slice(0, length) : "");
export function coerceSocialActivities(value: unknown): SocialActivity[] {
  if (!Array.isArray(value)) return [];
  return value
    .flatMap((entry) => {
      const raw = object(entry);
      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(shortActivityText(raw.dateKey)) ||
        !shortActivityText(raw.wishId) ||
        !Number.isInteger(raw.startMinute) ||
        !Number.isInteger(raw.endMinute) ||
        (raw.startMinute as number) < 0 ||
        (raw.endMinute as number) > 1440 ||
        (raw.startMinute as number) >= (raw.endMinute as number) ||
        !shortActivityText(raw.activity) ||
        !shortActivityText(raw.baseRevision)
      )
        return [];
      return [
        {
          wishId: shortActivityText(raw.wishId),
          dateKey: raw.dateKey as string,
          startMinute: raw.startMinute as number,
          endMinute: raw.endMinute as number,
          venueId: shortActivityText(raw.venueId),
          zoneId: shortActivityText(raw.zoneId) || undefined,
          activity: shortActivityText(raw.activity, 240),
          baseRevision: shortActivityText(raw.baseRevision),
        },
      ];
    })
    .slice(-8);
}
