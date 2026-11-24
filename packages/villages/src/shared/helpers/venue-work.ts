import { z } from "zod";
import type { VillageVenue } from "../contracts/village.js";
import { contactNeighborIds } from "./zone-contact.js";

export const WORK_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
const id = z.string().trim().min(1).max(200);
export const venueWorkSchema = z
  .object({
    characterId: id,
    activity: z.string().trim().min(1).max(240),
    zoneId: id,
    accessZoneIds: z.array(id).max(6),
    inviteGuests: z.boolean().optional(),
    days: z.array(z.enum(WORK_DAYS)).min(1).max(7),
    startMinute: z.number().int().min(0).max(1439),
    endMinute: z.number().int().min(1).max(1440),
  })
  .strict()
  .refine((work) => work.startMinute < work.endMinute, "Work must finish later on the same day.");
export type VenueWork = z.infer<typeof venueWorkSchema>;
export function venueWorkProblem(venue: VillageVenue, work: VenueWork): string {
  const zones = venue.zones ?? [...(venue.spaces ?? []), ...(venue.privateSpaces ?? [])];
  if (
    !work.accessZoneIds.includes(work.zoneId) ||
    new Set(work.accessZoneIds).size !== work.accessZoneIds.length ||
    new Set(work.days).size !== work.days.length ||
    work.accessZoneIds.some((id) => {
      const zone = zones.find((row) => row.id === id);
      return (
        !zone || ("kind" in zone && zone.kind === "exterior") || (zone.ownerId && zone.ownerId !== work.characterId)
      );
    })
  )
    return "Choose the work Zone and only the rooms this worker may use.";
  const reachable = new Set(["exterior"]),
    queue = ["exterior"];
  for (const id of queue)
    for (const next of contactNeighborIds(zones, id))
      if (work.accessZoneIds.includes(next) && !reachable.has(next)) {
        reachable.add(next);
        queue.push(next);
      }
  return reachable.has(work.zoneId) ? "" : "Include every Zone on the worker’s route from Entrance.";
}
export const workOfferSchema = z
  .object({
    id,
    proposerId: id,
    characterId: id,
    terms: venueWorkSchema.nullable(),
    previous: venueWorkSchema.nullable(),
    requiredIds: z.array(id).min(1).max(100),
    approvedIds: z.array(id).max(100),
  })
  .strict();
export type WorkOffer = z.infer<typeof workOfferSchema>;
export const workOfferViewSchema = workOfferSchema.omit({ previous: true });
export type WorkOfferView = z.infer<typeof workOfferViewSchema>;
export function workOverlap(a: VenueWork, b: VenueWork): boolean {
  return (
    a.characterId === b.characterId &&
    a.days.some((day) => b.days.includes(day)) &&
    a.startMinute < b.endMinute &&
    b.startMinute < a.endMinute
  );
}
export function workTime(minute: number): string {
  return `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
}
