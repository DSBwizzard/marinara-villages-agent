import {
  buildVillageAgendas,
  clearVillagerAgenda,
  correctCompletedWish,
  setVillagerScheduleInfluence,
} from "../residents/resident-agendas.js";
import { previewVillagerRefresh, applyVillagerRefresh } from "./resident-cards.js";
import { type CharacterParams, fail, readCharacterId } from "../../adapters/http/route-support.js";
import { badRequest } from "../../domain/rules/errors.js";
import { buildVillageSnapshot } from "../world/snapshot.js";
import { addVillager, removeVillager, editIdentityDescription } from "./resident-roster.js";
import { clarifyRelationships, readRelationshipsInspect, readRelationshipsView } from "./relationships.js";
import { generateResidentSignature, readResidentSignature } from "./resident-signature.js";
import { recoverSocialOutbox } from "./relationship-social.js";
import { z } from "zod";
import { socialMail } from "./social-mail.js";
import { readWishHistoryPage } from "./wishes/wish-archive.js";
import { retireResidentWish } from "./wishes/wish-lifecycle.js";
import type { FastifyInstance } from "fastify";

export function registerRelationshipRoutes(engine: FastifyInstance) {
  engine.get("/mailbox", async (_request, reply) => {
    try {
      return await socialMail().readMailbox();
    } catch (error) {
      return fail(reply, error, "read Mailbox");
    }
  });
  engine.post("/mailbox/threads", async (request, reply) => {
    try {
      return await socialMail().send(request.body);
    } catch (error) {
      return fail(reply, error, "send personal mail");
    }
  });
  engine.post<{ Params: { threadId: string } }>("/mailbox/threads/:threadId/messages", async (request, reply) => {
    try {
      return await socialMail().send(request.body, request.params.threadId);
    } catch (error) {
      return fail(reply, error, "reply to personal mail");
    }
  });
  engine.post<{ Params: { threadId: string } }>("/mailbox/threads/:threadId/read", async (request, reply) => {
    try {
      return await socialMail().readThread(request.params.threadId);
    } catch (error) {
      return fail(reply, error, "read personal thread");
    }
  });
  engine.post<{ Params: { threadId: string; messageId: string } }>(
    "/mailbox/threads/:threadId/messages/:messageId/cancel",
    async (request, reply) => {
      try {
        return await socialMail().cancel(request.params.threadId, request.params.messageId);
      } catch (error) {
        return fail(reply, error, "cancel personal mail");
      }
    },
  );
  engine.post<{ Params: { threadId: string; messageId: string } }>(
    "/mailbox/threads/:threadId/messages/:messageId/retry",
    async (request, reply) => {
      try {
        return await socialMail().retry(
          request.params.threadId,
          request.params.messageId,
          z.object({ requestId: z.string() }).parse(request.body).requestId,
        );
      } catch (error) {
        return fail(reply, error, "retry personal mail");
      }
    },
  );
  engine.post<{ Params: { id: string } }>("/mailbox/invitations/:id/response", async (request, reply) => {
    try {
      return await socialMail().respond(request.params.id, request.body);
    } catch (error) {
      return fail(reply, error, "respond to invitation");
    }
  });

  engine.post<{ Params: { id: string } }>("/relationships/outbox/:id/recovery", async (request, reply) => {
    try {
      await recoverSocialOutbox(request.params.id, request.body);
      return readRelationshipsInspect();
    } catch (error) {
      return fail(reply, error, "recover encounter");
    }
  });
  engine.post("/relationships/clarifications", async (request, reply) => {
    try {
      return await clarifyRelationships(request.body);
    } catch (error) {
      return fail(reply, error, "clarify starting history");
    }
  });
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
  engine.get("/relationships/inspect", async (_request, reply) => {
    try {
      return await readRelationshipsInspect();
    } catch (error) {
      return fail(reply, error, "inspect relationships");
    }
  });
}
export function registerResidentRoutes(engine: FastifyInstance) {
  const app = engine;
  app.patch<{ Params: CharacterParams; Body: unknown }>(
    "/villagers/:characterId/description",
    async (request, reply) => {
      try {
        await editIdentityDescription(readCharacterId(request.params.characterId), request.body);
        return await buildVillageSnapshot();
      } catch (error) {
        return fail(reply, error, "editing a Villager description");
      }
    },
  );
  app.post<{ Body: { characterId?: unknown; admission?: unknown; spriteSetupRevision?: number } }>(
    "/villagers",
    async (request, reply) => {
      try {
        await addVillager(
          readCharacterId(request.body?.characterId),
          request.body?.spriteSetupRevision,
          request.body?.admission,
        );
        return await buildVillageSnapshot();
      } catch (error) {
        return fail(reply, error, "adding a villager");
      }
    },
  );
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
}
