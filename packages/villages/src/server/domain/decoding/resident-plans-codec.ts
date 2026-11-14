import { z } from "zod";
import type { ResidentPlans } from "../models/resident-plans.js";
import { playerAppointments } from "./agenda-codec.js";

const id = z.string().min(1).max(160),
  date = z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine(
      (value) =>
        Number.isFinite(Date.parse(value + "T12:00:00.000Z")) &&
        new Date(value + "T12:00:00.000Z").toISOString().slice(0, 10) === value,
    ),
  minute = z.number().int().min(0).max(1440);
export const socialPlanSchema = z
  .object({
    id,
    dateKey: date,
    actors: z
      .array(z.object({ id, incarnation: id }).strict())
      .min(1)
      .max(2),
    venueId: id,
    zoneId: id,
    startMinute: minute,
    endMinute: minute,
    revisions: z.record(z.string(), z.string().regex(/^[a-f0-9]{64}$/)),
    kind: z.enum(["meeting", "avoidance"]),
    status: z.enum(["planned", "completed", "cancelled"]),
    followThrough: z.literal(true).optional(),
    wishId: id.optional(),
  })
  .strict()
  .refine(
    (plan) =>
      plan.endMinute - plan.startMinute >= 30 &&
      plan.endMinute - plan.startMinute <= 60 &&
      plan.actors.length === (plan.kind === "meeting" ? 2 : 1) &&
      (!plan.followThrough || plan.kind === "meeting") &&
      (!plan.wishId || plan.followThrough === true) &&
      new Set(plan.actors.map((actor) => actor.id)).size === plan.actors.length &&
      plan.actors.every((actor) => actor.id !== "player" && Object.hasOwn(plan.revisions, actor.id)) &&
      Object.keys(plan.revisions).length === plan.actors.length,
  );
const residentPlans = z
  .object({
    selectedDate: z.string().refine((value) => value === "" || date.safeParse(value).success),
    plans: z.array(socialPlanSchema).max(64),
    appointments: playerAppointments.optional(),
  })
  .strict()
  .refine(
    (value) =>
      new Set(value.plans.map((plan) => plan.id)).size === value.plans.length &&
      value.plans.every((plan) => plan.dateKey <= value.selectedDate),
  );
export const emptyResidentPlans = (): ResidentPlans => ({ selectedDate: "", plans: [] });
export function readResidentPlans(raw: unknown): ResidentPlans {
  return residentPlans.parse(raw);
}
