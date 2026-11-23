import { z } from "zod";

const id = z.string().trim().min(1).max(160);
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/u)
  .refine((value) => {
    const parsed = new Date(value + "T12:00:00Z");
    return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
  });
export const undertakingPlanSchema = z
  .object({
    goal: z.string().trim().min(1).max(2000),
    zoneId: id,
    roles: z
      .array(z.object({ actorId: id, role: z.string().trim().min(1).max(240) }).strict())
      .min(1)
      .max(3),
    milestones: z
      .array(
        z.object({ id, title: z.string().trim().min(1).max(240), kind: z.enum(["preparation", "first-use"]) }).strict(),
      )
      .min(1)
      .max(6),
    schedule: z
      .object({
        firstDate: date,
        startMinute: z.number().int().min(0).max(1439),
        endMinute: z.number().int().min(1).max(1440),
        weekly: z.boolean(),
      })
      .strict()
      .refine((value) => value.endMinute - value.startMinute >= 15 && value.endMinute - value.startMinute <= 180)
      .optional(),
    constructionId: id.optional(),
  })
  .strict()
  .refine(
    (plan) =>
      new Set(plan.roles.map((role) => role.actorId)).size === plan.roles.length &&
      new Set(plan.milestones.map((step) => step.id)).size === plan.milestones.length &&
      plan.milestones.at(-1)?.kind === "first-use" &&
      plan.milestones.slice(0, -1).every((step) => step.kind === "preparation"),
  );

export const undertakingSchema = z
  .object({
    plan: undertakingPlanSchema,
    completed: z
      .array(z.object({ milestoneId: id, at: z.iso.datetime(), episodeId: id, evidenceId: id }).strict())
      .max(6),
  })
  .strict()
  .refine((value) => value.completed.every((step, index) => step.milestoneId === value.plan.milestones[index]?.id));
