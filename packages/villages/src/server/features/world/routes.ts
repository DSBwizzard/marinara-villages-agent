import { inspectDevelopment, setDevelopment, reconcileDevelopment } from "./development.js";
import { observeVillageClock, resolveVillageClock } from "../../adapters/time/clock-gate.js";
import type { VillageTimeAdvance } from "../../../shared/contracts/clock.js";
import { buildVillageCatalog } from "../residents/resident-cards.js";
import { addNotice, removeNoticeAt } from "../settings/village-settings.js";
import { fail } from "../../adapters/http/route-support.js";
import { badRequest } from "../../domain/rules/errors.js";
import { buildVillageSnapshot } from "./snapshot.js";
import {
  buildVillageMemories,
  reconcileVillage,
  readVillageMemoryEvidence,
  forgetMemory,
  correctMemory,
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
  app.get("/clock", async (_request, reply) => {
    try {
      return await observeVillageClock();
    } catch (error) {
      return fail(reply, error, "reading Village time");
    }
  });
  // Development control: remove this route and its UI before admitting active playtesters.
  app.post<{ Body: VillageTimeAdvance }>("/clock/advance", async (request, reply) => {
    try {
      if (!request.body || typeof request.body !== "object") throw badRequest("Choose a time advance.");
      return await reconcileVillage({ advanceTime: request.body });
    } catch (error) {
      return fail(reply, error, "advancing Village time");
    }
  });
  app.get("/development", async (_request, reply) => {
    try {
      return await inspectDevelopment();
    } catch (error) {
      return fail(reply, error, "reading resident development");
    }
  });
  app.patch<{ Body: { enabled: unknown } }>("/development", async (request, reply) => {
    try {
      return await setDevelopment(request.body?.enabled);
    } catch (error) {
      return fail(reply, error, "saving resident development");
    }
  });
  app.post<{ Body: { actionId?: unknown } }>("/development/review", async (_request, reply) => {
    try {
      if (typeof _request.body?.actionId !== "string" || !/^[a-zA-Z0-9-]{1,100}$/.test(_request.body.actionId))
        throw badRequest("Choose a review request identity.");
      await reconcileDevelopment(undefined, _request.body.actionId);
      return await inspectDevelopment();
    } catch (error) {
      return fail(reply, error, "reviewing resident development");
    }
  });
  app.post<{ Body: { revision?: unknown; choice?: unknown } }>("/clock/recover", async (request, reply) => {
    try {
      const { revision, choice } = request.body ?? {};
      if (!Number.isSafeInteger(revision) || (choice !== "accept" && choice !== "check"))
        throw badRequest("Refresh the clock notice and choose an action.");
      await resolveVillageClock(revision as number, choice);
      return await buildVillageSnapshot();
    } catch (error) {
      return fail(reply, error, "resolving the village clock");
    }
  });
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
        if (request.body?.forceStory === true)
          throw badRequest("Force Village Update has been removed. Refresh the Village.");
        return await reconcileVillage();
      } catch (error) {
        return fail(reply, error, "writing down what has been happening");
      }
    },
  );
}
type MemoryQuery = { characterId?: string; query?: string; limit?: string; afterId?: string; revision?: string };
function memoryQuery(query: MemoryQuery) {
  return {
    characterId: query.characterId,
    query: query.query,
    ...(query.limit ? { limit: Number(query.limit) } : {}),
    ...(query.afterId ? { cursor: { revision: Number(query.revision), afterId: query.afterId } } : {}),
  };
}
export function registerHistoryRoutes(app: FastifyInstance) {
  app.get<{ Querystring: MemoryQuery }>("/memories", async (request, reply) => {
    try {
      return await buildVillageMemories(memoryQuery(request.query));
    } catch (error) {
      return fail(reply, error, "reading Memories");
    }
  });
  app.get<{ Querystring: MemoryQuery }>("/memories/inspect", async (request, reply) => {
    try {
      return await buildVillageMemories({ ...memoryQuery(request.query), inspection: true });
    } catch (error) {
      return fail(reply, error, "inspecting Memories");
    }
  });
  app.get<{ Params: { id: string } }>("/memories/:id/evidence", async (request, reply) => {
    try {
      return await readVillageMemoryEvidence(request.params.id);
    } catch (error) {
      return fail(reply, error, "reading memory evidence");
    }
  });
  app.get<{ Params: { id: string }; Querystring: { characterId?: string } }>(
    "/memories/inspect/:id",
    async (request, reply) => {
      try {
        return await readVillageMemoryEvidence(request.params.id, true, request.query.characterId);
      } catch (error) {
        return fail(reply, error, "inspecting memory evidence");
      }
    },
  );
  app.post<{ Params: { id: string }; Body: import("../../../shared/contracts/village.js").MemoryForgetRequest }>(
    "/memories/:id/forget",
    async (request, reply) => {
      try {
        await forgetMemory(request.params.id, request.body);
        return { forgotten: true };
      } catch (error) {
        return fail(reply, error, "forgetting memory");
      }
    },
  );
  app.post<{ Params: { id: string }; Body: import("../../../shared/contracts/village.js").MemoryCorrectRequest }>(
    "/memories/:id/correct",
    async (request, reply) => {
      try {
        await correctMemory(request.params.id, request.body);
        return { corrected: true };
      } catch (error) {
        return fail(reply, error, "correcting memory");
      }
    },
  );
}
