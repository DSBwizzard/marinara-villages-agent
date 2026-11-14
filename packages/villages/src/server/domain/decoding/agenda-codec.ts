import { z } from "zod";

const id = z.string().min(1).max(160);
export const agendaTime = z
  .object({
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .refine((date) => {
        const value = new Date(date + "T12:00:00Z");
        return Number.isFinite(value.getTime()) && value.toISOString().slice(0, 10) === date;
      }),
    startMinute: z.number().int().min(0).max(1439),
    endMinute: z.number().int().min(1).max(1440),
    venueId: id,
    zoneId: id.optional(),
  })
  .strict()
  .refine((time) => time.endMinute > time.startMinute);

export const agendaEvidence = z
  .object({
    actorId: id,
    time: agendaTime,
    kind: z.enum(["told", "seen", "offer"]),
    activity: z.string().trim().min(1).max(240),
  })
  .strict();

export const agendaOptions = z.array(agendaEvidence.omit({ kind: true })).max(16);
export const agendaVenues = z.array(z.object({ id, zones: z.array(id).max(8) }).strict()).max(10);

export const playerAppointment = z
  .object({
    id,
    resident: z.object({ id, incarnation: id }).strict(),
    playerIncarnation: id,
    time: agendaTime,
    activity: z.string().trim().min(1).max(240),
  })
  .strict();
export const playerAppointments = z
  .array(playerAppointment)
  .max(64)
  .refine((rows) => new Set(rows.map((row) => row.id)).size === rows.length);
