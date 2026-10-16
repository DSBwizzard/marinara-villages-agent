import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { fail } from "../../adapters/http/route-support.js";
import { readActive, readSession } from "../../adapters/storage/scene-store.js";
import { spinoffs } from "./spinoffs.js";

const begin = z
  .object({
    sessionId: z.string().min(1).max(200),
    residentId: z.string().min(1).max(200),
    revision: z.number().int().nonnegative(),
    requestId: z.string().uuid(),
  })
  .strict();
const action = z
  .object({ sessionId: z.string().min(1).max(200), acceptedIds: z.array(z.string().max(250)).max(3).default([]) })
  .strict();
const preparation = z.object({ sessionId: z.string().min(1).max(200), retry: z.boolean().default(false) }).strict();
export function registerSpinoffRoutes(app: FastifyInstance) {
  app.get("/spinoffs/active", async (_request, reply) => {
    try {
      const active = await readActive();
      if (!active.sessionId) return { spinoff: null };
      const scene = await readSession(active.sessionId);
      return { spinoff: scene.spinoff ? await spinoffs().reconcile(scene.id) : null };
    } catch (error) {
      return fail(reply, error, "reading the spinoff");
    }
  });
  app.post("/spinoffs/begin", async (request, reply) => {
    try {
      const input = begin.parse(request.body);
      return { spinoff: await spinoffs().begin(input.sessionId, input.residentId, input.revision, input.requestId) };
    } catch (error) {
      return fail(reply, error, "starting the spinoff");
    }
  });
  app.post("/spinoffs/prepare", async (request, reply) => {
    try {
      const input = preparation.parse(request.body);
      return { spinoff: await spinoffs().prepare(input.sessionId, input.retry) };
    } catch (error) {
      return fail(reply, error, "preparing spinoff memories");
    }
  });
  app.post("/spinoffs/resolve", async (request, reply) => {
    try {
      const input = action.parse(request.body);
      return { spinoff: await spinoffs().resolve(input.sessionId, input.acceptedIds) };
    } catch (error) {
      return fail(reply, error, "saving spinoff memories");
    }
  });
}
