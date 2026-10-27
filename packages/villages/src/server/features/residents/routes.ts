import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { type CharacterParams, fail, readCharacterId } from "../../adapters/http/route-support.js";
import { badRequest } from "../../domain/rules/errors.js";
import {
  buildVillageAgendas,
  clearVillagerAgenda,
  setVillagerScheduleInfluence,
} from "../residents/resident-agendas.js";
import { buildVillageSnapshot } from "../world/snapshot.js";
import { readVillageState } from "../world/village-store.js";
import { recoverSocialOutbox } from "./relationship-social.js";
import { clarifyRelationships, readRelationshipsInspect, readRelationshipsView } from "./relationships.js";
import { applyVillagerRefresh, previewVillagerRefresh } from "./resident-cards.js";
import { addVillager, editIdentityDescription, removeVillager } from "./resident-roster.js";
import { generateResidentSignature, readResidentSignature } from "./resident-signature.js";
import { socialMail } from "./social-mail.js";
import { wishes } from "./wishes/service.js";

export function registerRelationshipRoutes(engine: FastifyInstance) {
  engine.get<{ Params: { characterId: string } }>("/villagers/:characterId/wishes/inspect", async (request, reply) => {
    try {
      const state = await readVillageState();
      const resident = state.villagers.find((r) => r.characterId === request.params.characterId);
      if (!resident) throw badRequest("Choose a resident.");
      return { wishes: resident.wishes };
    } catch (error) {
      return fail(reply, error, "inspect Wishes");
    }
  });
  engine.patch<{ Params: { characterId: string; wishId: string }; Body: { followed: boolean } }>(
    "/villagers/:characterId/wishes/:wishId/follow",
    async (request, reply) => {
      try {
        if (typeof request.body?.followed !== "boolean") throw badRequest("Choose following.");
        await wishes().setWishFollowing(
          readCharacterId(request.params.characterId),
          request.params.wishId,
          request.body.followed,
        );
        return await readRelationshipsView();
      } catch (error) {
        return fail(reply, error, "following Wish");
      }
    },
  );
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
      const { messageId } = z.object({ messageId: z.string().min(1) }).parse(request.body);
      return await socialMail().readLetter(request.params.threadId, messageId);
    } catch (error) {
      return fail(reply, error, "read personal thread");
    }
  });
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

  app.patch<{ Params: CharacterParams; Body: unknown }>("/agendas/:characterId/influence", async (request, reply) => {
    try {
      await setVillagerScheduleInfluence(readCharacterId(request.params.characterId), request.body);
      return { villagers: await buildVillageAgendas() };
    } catch (error) {
      return fail(reply, error, "changing schedule influence");
    }
  });
}
