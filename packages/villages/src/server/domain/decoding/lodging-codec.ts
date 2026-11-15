import { z } from "zod";

const id = z.string().min(1).max(200);
export const lodgingOption = z
  .object({
    host: id,
    venue: id,
    zone: id,
    placeName: z.string(),
    zoneName: z.string(),
  })
  .strict();
export const lodgingOptions = z.array(lodgingOption).max(6);
export const lodgingProposal = z
  .object({
    guest: id,
    venue: id,
    zone: id,
    until: z
      .object({ dayOffset: z.number().int().min(0).max(7), minute: z.number().int().min(0).max(1439) })
      .strict()
      .optional(),
  })
  .strict();
export const lodgingTerms = lodgingProposal
  .omit({ until: true })
  .extend({
    host: id,
    expiresAt: z.iso.datetime(),
  })
  .strict();
