import { z } from "zod";

export const playerAccessChangesSchema = z
  .array(
    z
      .object({
        action: z.enum(["added", "changed", "removed"]),
        entry: z
          .object({
            id: z.string().regex(/^[a-f0-9]{64}$/u),
            placeId: z.string().min(1).max(200),
            place: z.string().min(1).max(400),
            room: z.string().min(1).max(400).optional(),
            kind: z.enum(["home", "member", "visit", "standing", "stay", "ban", "refused"]),
            endsAt: z.iso.datetime().optional(),
            thisVisit: z.literal(true).optional(),
            escorted: z.literal(true).optional(),
            visitorHours: z.literal(true).optional(),
          })
          .strict(),
      })
      .strict(),
  )
  .min(1)
  .max(256);
