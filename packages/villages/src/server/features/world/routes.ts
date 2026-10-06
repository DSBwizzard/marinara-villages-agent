import { fail } from "../../adapters/http/route-support.js";
import { badRequest } from "../../domain/rules/errors.js";
import { listVenueVisitSummaries } from "../scenes/venue-session.js";
import {
  addNotice,
  buildVillageCatalog,
  buildVillageMemories,
  buildVillageSnapshot,
  buildVillageStory,
  reconcileVillage,
  removeChronicleEntry,
  removeNoticeAt,
  removeVillageRecollection,
} from "./village.js";
import type { FastifyInstance } from "fastify";

export function registerSnapshotCatalogRoutes(engine: FastifyInstance) {
  const app = engine;
  app.get("/", async (_request, reply) => {
    try {
      return await buildVillageSnapshot();
    } catch (error) {
      return fail(reply, error, "village snapshot");
    }
  });
  app.get("/catalog", async (_request, reply) => {
    try {
      return { characters: await buildVillageCatalog() };
    } catch (error) {
      return fail(reply, error, "character catalog");
    }
  });
}
export function registerWorldMaintenanceRoutes(engine: FastifyInstance) {
  const app = engine;
  app.post<{ Body: { notice?: unknown } }>("/noticeboard", async (request, reply) => {
    try {
      return await addNotice(request.body?.notice);
    } catch (error) {
      return fail(reply, error, "pinning up a notice");
    }
  });
  app.delete<{ Params: { index: string } }>("/noticeboard/:index", async (request, reply) => {
    try {
      return await removeNoticeAt(request.params.index);
    } catch (error) {
      return fail(reply, error, "taking a notice down");
    }
  });
  app.post<{ Body: { forceStory?: unknown; actionId?: unknown; expectedAttempt?: unknown } }>(
    "/reconcile",
    async (request, reply) => {
      try {
        const forced = request.body?.forceStory === true;
        if (
          forced &&
          (typeof request.body?.actionId !== "string" ||
            !/^[a-zA-Z0-9-]{1,100}$/.test(request.body.actionId) ||
            !Number.isInteger(request.body.expectedAttempt))
        )
          throw badRequest("Refresh before requesting a village event.");
        return await reconcileVillage({
          forceStory: forced,
          actionId: request.body?.actionId as string,
          expectedAttempt: request.body?.expectedAttempt as number,
        });
      } catch (error) {
        return fail(reply, error, "writing down what has been happening");
      }
    },
  );
}
export function registerHistoryRoutes(engine: FastifyInstance) {
  const app = engine;
  app.get<{ Querystring: { offset?: string; limit?: string } }>("/story", async (request, reply) => {
    try {
      const entries = await buildVillageStory();
      const offset = Math.max(0, Number(request.query?.offset ?? 0) || 0);
      const limit = Math.min(100, Math.max(1, Number(request.query?.limit ?? 50) || 50));
      return { entries: entries.slice(offset, offset + limit), total: entries.length };
    } catch (error) {
      return fail(reply, error, "reading the village story");
    }
  });
  app.get("/memories", async (_request, reply) => {
    try {
      const archive = await listVenueVisitSummaries({ limit: 100 });
      return {
        ...(await buildVillageMemories()),
        archive: {
          total: archive.total,
          recent: archive.visits.slice(0, 6),
        },
      };
    } catch (error) {
      return fail(reply, error, "reading villager memories");
    }
  });
  app.delete<{ Params: { id: string } }>("/memories/durable/:id", async (request, reply) => {
    try {
      await removeChronicleEntry(request.params.id);
      return buildVillageMemories();
    } catch (error) {
      return fail(reply, error, "forgetting a durable memory");
    }
  });
  app.delete<{ Params: { id: string } }>("/memories/recollections/:id", async (request, reply) => {
    try {
      await removeVillageRecollection(request.params.id);
      return buildVillageMemories();
    } catch (error) {
      return fail(reply, error, "letting go of a passing recollection");
    }
  });
  app.delete<{ Params: { id: string } }>("/story/:id", async (request, reply) => {
    try {
      await removeChronicleEntry(request.params.id);
      const entries = await buildVillageStory();
      return { entries: entries.slice(0, 50), total: entries.length };
    } catch (error) {
      return fail(reply, error, "forgetting a memory");
    }
  });
}
