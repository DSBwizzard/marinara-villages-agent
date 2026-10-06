import { fail } from "../../adapters/http/route-support.js";
import { badRequest } from "../../domain/rules/errors.js";
import { backgroundWorkSummaries, retryBackgroundJob, villageBackgroundPresence } from "../../jobs/background-work.js";
import { buildVillageSnapshot, reconcileVillage } from "../world/village.js";
import type { FastifyInstance } from "fastify";

export function registerBackgroundRoutes(engine: FastifyInstance) {
  const app = engine;
  app.post<{ Body: { sessionId?: unknown; visible?: unknown } }>("/background/presence", async (request, reply) => {
    try {
      if (typeof request.body?.sessionId !== "string" || typeof request.body.visible !== "boolean")
        throw badRequest("Choose a browser session and visibility.");
      // Catch up before admitting recurring work. An old paused story must not spend on a missed day.
      const snapshot = await villageBackgroundPresence(request.body.sessionId, request.body.visible, {
        beforeResume: () => reconcileVillage(),
      });
      return {
        status: "ready",
        snapshot: snapshot ? { ...snapshot, backgroundWork: await backgroundWorkSummaries() } : null,
      };
    } catch (error) {
      return fail(reply, error, "updating village presence");
    }
  });
  app.post<{ Body: { id?: unknown; expectedAttempt?: unknown; actionId?: unknown } }>(
    "/background/retry",
    async (request, reply) => {
      try {
        if (
          typeof request.body?.id !== "string" ||
          typeof request.body.actionId !== "string" ||
          !Number.isInteger(request.body.expectedAttempt)
        )
          throw badRequest("Choose a background job to retry.");
        await retryBackgroundJob(request.body.id, request.body.expectedAttempt as number, request.body.actionId);
        return await buildVillageSnapshot();
      } catch (error) {
        return fail(reply, error, "retrying village background work");
      }
    },
  );
}
