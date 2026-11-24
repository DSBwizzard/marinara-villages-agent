import { z } from "zod";
import { venueWorkSchema } from "./venue-work.js";
import type { VillageVenue } from "../contracts/village.js";
const id = z.string().min(1).max(200);
export const foundingPeopleSchema = z
  .object({
    residentIds: z.array(id).max(3),
    playerHome: z.boolean(),

    managerIds: z.array(id).max(4),
    work: z.array(venueWorkSchema).max(3),
    destinations: z.record(id, z.object({ home: id.optional(), sleep: id.optional(), work: id.optional() }).strict()),
  })
  .strict();
export type FoundingPeoplePlan = z.infer<typeof foundingPeopleSchema>;
export function applyFoundingPeople<T extends VillageVenue>(venue: T, people?: FoundingPeoplePlan): T {
  if (!people) return venue;
  return {
    ...venue,
    residentIds: people.residentIds,
    occupancy: { ...venue.occupancy, playerHome: people.playerHome },

    workerIds: people.work.map((work) => work.characterId),
    destinations: people.destinations,
    access: {
      version: 1,
      revision: 0,
      visitorHours: null,
      permissions: [],
      bans: [],
      exceptions: [],
      changes: [],
      visitDenials: [],
      receipts: {},
      ...venue.access,
      managerIds: people.managerIds,
      work: people.work,
      workOffers: [],
    },
  };
}
