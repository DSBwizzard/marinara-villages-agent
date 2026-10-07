import {
  buildVillageAgendas,
  clearVillagerAgenda,
  clearVillagerRemap,
  correctCompletedWish,
  setVillagerScheduleInfluence,
  setVillagerScheduleIngestion,
} from "../residents/resident-agendas.js";
import { previewVillagerRefresh, applyVillagerRefresh } from "./resident-cards.js";
import { type CharacterParams, fail, readCharacterId } from "../../adapters/http/route-support.js";
import { badRequest } from "../../domain/rules/errors.js";
import { buildVillageSnapshot } from "../world/snapshot.js";
import { addVillager, removeVillager } from "../world/village.js";
import { changeRelationshipCreator, readRelationshipsView } from "./relationships.js";
import { generateResidentSignature, readResidentSignature } from "./resident-signature.js";
import { readWishHistoryPage } from "./wishes/wish-archive.js";
import { retireResidentWish } from "./wishes/wish-lifecycle.js";
import type { FastifyInstance } from "fastify";

export function registerRelationshipRoutes(engine: FastifyInstance) {
  const app = engine;
  engine.get("/relationships", async (_request, reply) => {
    try {
      return await readRelationshipsView();
    } catch (error) {
      return fail(reply, error, "read relationships");
    }
  });
  engine.post<{ Params: { characterId: string; wishId: string } }>(
    "/villagers/:characterId/wishes/:wishId/retire",
    async (request, reply) => {
      try {
        await retireResidentWish(readCharacterId(request.params.characterId), request.params.wishId);
        return await readRelationshipsView();
      } catch (error) {
        return fail(reply, error, "retiring wish");
      }
    },
  );
  engine.post("/relationships/creator", async (request, reply) => {
    try {
      return await changeRelationshipCreator(request.body);
    } catch (error) {
      return fail(reply, error, "relationship creator");
    }
  });
}
export function registerResidentRoutes(engine: FastifyInstance) {
  const app = engine;
  app.post<{ Body: { characterId?: unknown } }>("/villagers", async (request, reply) => {
    try {
      await addVillager(readCharacterId(request.body?.characterId));
      return await buildVillageSnapshot();
    } catch (error) {
      return fail(reply, error, "adding a villager");
    }
  });
  app.get<{ Params: CharacterParams }>("/villagers/:characterId/refresh", async (request, reply) => {
    try {
      return await previewVillagerRefresh(readCharacterId(request.params.characterId));
    } catch (error) {
      return fail(reply, error, "previewing a villager refresh");
    }
  });
  app.get<{ Params: CharacterParams }>("/villagers/:characterId/signature", async (request, reply) => {
    try {
      return await readResidentSignature(readCharacterId(request.params.characterId));
    } catch (error) {
      return fail(reply, error, "reading a Villager signature");
    }
  });
  app.post<{ Params: CharacterParams; Body: unknown }>("/villagers/:characterId/signature", async (request, reply) => {
    try {
      return await generateResidentSignature(readCharacterId(request.params.characterId), request.body);
    } catch (error) {
      return fail(reply, error, "generating a Villager signature");
    }
  });
  app.post<{ Params: CharacterParams }>("/villagers/:characterId/refresh", async (request, reply) => {
    try {
      return await applyVillagerRefresh(readCharacterId(request.params.characterId));
    } catch (error) {
      return fail(reply, error, "refreshing a villager snapshot");
    }
  });
  app.delete<{ Params: CharacterParams }>("/villagers/:characterId", async (request, reply) => {
    try {
      await removeVillager(readCharacterId(request.params.characterId));
      return await buildVillageSnapshot();
    } catch (error) {
      return fail(reply, error, "removing a villager");
    }
  });
}
export function registerAgendaRoutes(engine: FastifyInstance) {
  const app = engine;
  app.get<{ Params: CharacterParams; Querystring: { cursor?: string } }>(
    "/agendas/:characterId/history",
    async (request, reply) => {
      try {
        return await readWishHistoryPage(readCharacterId(request.params.characterId), request.query.cursor);
      } catch (error) {
        return fail(reply, error, "reading wish history");
      }
    },
  );
  app.get("/agendas", async (_request, reply) => {
    try {
      return { villagers: await buildVillageAgendas() };
    } catch (error) {
      return fail(reply, error, "reading what the villagers wish for");
    }
  });
  app.delete<{ Params: CharacterParams }>("/agendas/:characterId", async (request, reply) => {
    try {
      await clearVillagerAgenda(readCharacterId(request.params.characterId));
      return { villagers: await buildVillageAgendas() };
    } catch (error) {
      return fail(reply, error, "forgetting what a villager wishes for");
    }
  });
  app.post<{ Params: CharacterParams; Body: { actionId?: unknown } }>(
    "/agendas/:characterId/regenerate",
    async (request, reply) => {
      try {
        if (typeof request.body?.actionId !== "string" || !/^[a-zA-Z0-9-]{1,100}$/.test(request.body.actionId))
          throw badRequest("Choose an agenda request identity.");
        await clearVillagerAgenda(readCharacterId(request.params.characterId), request.body.actionId);
        return { villagers: await buildVillageAgendas() };
      } catch (error) {
        return fail(reply, error, "regenerating a villager's agenda");
      }
    },
  );
  app.post<{ Params: CharacterParams & { wishId: string } }>(
    "/agendas/:characterId/completed/:wishId/correct",
    async (request, reply) => {
      try {
        await correctCompletedWish(readCharacterId(request.params.characterId), request.params.wishId);
        return { villagers: await buildVillageAgendas() };
      } catch (error) {
        return fail(reply, error, "correcting a completed wish");
      }
    },
  );
  app.patch<{ Params: CharacterParams; Body: unknown }>("/agendas/:characterId/influence", async (request, reply) => {
    try {
      await setVillagerScheduleInfluence(readCharacterId(request.params.characterId), request.body);
      return { villagers: await buildVillageAgendas() };
    } catch (error) {
      return fail(reply, error, "changing schedule influence");
    }
  });
  app.patch<{ Params: CharacterParams; Body: { ingestSchedule?: unknown } }>(
    "/agendas/:characterId/ingestion",
    async (request, reply) => {
      try {
        if (typeof request.body?.ingestSchedule !== "boolean")
          throw badRequest("Choose whether to use the Marinara schedule.");
        await setVillagerScheduleIngestion(readCharacterId(request.params.characterId), request.body.ingestSchedule);
        return { deprecated: true, villagers: await buildVillageAgendas() };
      } catch (error) {
        return fail(reply, error, "changing schedule influence");
      }
    },
  );
  app.delete<{ Params: CharacterParams }>("/remaps/:characterId", async (request, reply) => {
    try {
      await clearVillagerRemap(readCharacterId(request.params.characterId));
      return {
        deprecated: true,
        message: "Schedule translation is retired. Use optional Agenda influence.",
        villagers: await buildVillageAgendas(),
      };
    } catch (error) {
      return fail(reply, error, "forgetting a villager's translation");
    }
  });
}
