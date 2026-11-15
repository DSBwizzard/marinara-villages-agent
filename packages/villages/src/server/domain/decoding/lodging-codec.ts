import { z } from "zod";

const id = z.string().min(1).max(200);
export const stayCondition = z.string().trim().min(6).max(180);
export const lodgingOption = z
  .object({
    host: id,
    venue: id,
    zone: id,
    placeName: z.string(),
    zoneName: z.string(),
    pending: z.object({ id, guest: id, condition: stayCondition }).strict().optional(),
  })
  .strict();
export const lodgingOptions = z.array(lodgingOption).max(6);
export const lodgingProposal = z
  .object({
    guest: id,
    venue: id,
    zone: id,
    condition: stayCondition.optional(),
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
    expiresAt: z.iso.datetime().optional(),
  })
  .strict()
  .refine((terms) => !!(terms.condition || terms.expiresAt));
