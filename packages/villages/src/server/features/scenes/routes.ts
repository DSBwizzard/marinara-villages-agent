import { villagesDebugAgentsEnabled } from "../../adapters/engine/runtime-host.js";
import {
  fail,
  readCharacterId,
  readChatId,
  readMessage,
  readPlaceId,
  readSceneRevision,
  readSubmissionId,
  type VenueTurnBody,
} from "../../adapters/http/route-support.js";
import { operationSummary } from "../../adapters/operations/operation-context.js";
import type { VillageVenueClass } from "../../domain/models/world.js";
import { badRequest, conflict } from "../../domain/rules/errors.js";
import { readVenueOperation } from "../../jobs/venue-coordinator.js";
import { imageTarget } from "../venues/image-target.js";
import { assertFoundedVillageReady } from "../founding/preparation.js";
import {
  closeVenueSessionWithReceipts,
  continueVenueWithoutGreeting,
  discardVenueVisitDebug,
  enterResidencePrivateSpace,
  enterVenue,
  greetVenue,
  leaveVenueSession,
  moveVenueZone,
  retrySceneChangeInterpretation,
  sendVenueTurn,
} from "./venue-session.js";
import { dismissSceneNotice, readSceneChanges, replaySceneChanges } from "./changes.js";
import { activeVenueSession, touchVenueSession } from "./live-session.js";
import { deleteAllVenueVisits, deleteVenueVisit, listVenueVisitSummaries, readVenueVisit } from "./archive.js";
import type { FastifyInstance } from "fastify";

export function registerSceneEntryRoutes(engine: FastifyInstance) {
  const app = engine;
  app.get("/rooms/active", async (_request, reply) => {
    try {
      const session = await activeVenueSession();
      return {
        session,
        operation: operationSummary(session?.operation),
        debugDiscardEnabled: villagesDebugAgentsEnabled(),
      };
    } catch (error) {
      return fail(reply, error, "reading the active venue");
    }
  });
  app.post<{
    Body: {
      venueId?: unknown;
      spaceClass?: unknown;
      zoneId?: unknown;
      privateSpaceId?: unknown;
      privateOwnerId?: unknown;
      entryArea?: unknown;
      expectedSceneRevision?: unknown;
    };
  }>("/rooms", async (request, reply) => {
    try {
      await assertFoundedVillageReady();
      const spaceClass = request.body?.spaceClass;
      if (
        spaceClass !== undefined &&
        spaceClass !== "residence" &&
        spaceClass !== "workplace" &&
        spaceClass !== "gathering" &&
        spaceClass !== "other"
      )
        throw badRequest("Choose a valid Venue Class space.");
      const entryArea = request.body?.entryArea;
      if (
        entryArea !== undefined &&
        entryArea !== "outside" &&
        entryArea !== "shared" &&
        entryArea !== "private" &&
        entryArea !== "public"
      )
        throw badRequest("Choose a valid Venue area.");
      return {
        session: await enterVenue(
          readPlaceId(request.body?.venueId),
          spaceClass as VillageVenueClass | undefined,
          typeof request.body?.privateOwnerId === "string" ? request.body.privateOwnerId : "",
          entryArea as "public" | "private" | "shared" | "outside" | undefined,
          await imageTarget(request.body),
          request.body?.expectedSceneRevision === undefined
            ? undefined
            : readSceneRevision(request.body.expectedSceneRevision),
        ),
      };
    } catch (error) {
      return fail(reply, error, "entering a venue");
    }
  });
  app.post<{
    Body: {
      sessionId?: unknown;
      zoneId?: unknown;
      privateSpaceId?: unknown;
      expectedSceneRevision?: unknown;
      retryOfAttemptId?: string;
      operationId?: unknown;
    };
  }>("/rooms/zone", async (request, reply) => {
    try {
      if (request.body?.zoneId && request.body?.privateSpaceId && request.body.zoneId !== request.body.privateSpaceId)
        throw conflict("Conflicting private space targets.");
      return {
        session: await moveVenueZone(
          readChatId(request.body?.sessionId),
          readPlaceId(request.body?.privateSpaceId ?? request.body?.zoneId),
          readSceneRevision(request.body?.expectedSceneRevision),
          request.body?.retryOfAttemptId,
          request.body?.operationId === undefined ? undefined : readSubmissionId(request.body.operationId),
        ),
      };
    } catch (error) {
      return fail(reply, error, "moving between zones");
    }
  });
}
export function registerSceneOperationRoutes(engine: FastifyInstance) {
  const app = engine;
  app.post<{ Body: { sessionId?: unknown; retryOfAttemptId?: string } }>("/rooms/greet", async (request, reply) => {
    try {
      await assertFoundedVillageReady();
      return { session: await greetVenue(readChatId(request.body?.sessionId), request.body?.retryOfAttemptId) };
    } catch (error) {
      return fail(reply, error, "opening a venue scene");
    }
  });
  app.post<{ Body: { sessionId?: unknown } }>("/rooms/continue", async (request, reply) => {
    try {
      await assertFoundedVillageReady();
      return { session: await continueVenueWithoutGreeting(readChatId(request.body?.sessionId)) };
    } catch (error) {
      return fail(reply, error, "continuing a venue without an opening");
    }
  });
  app.post<{ Body: { sessionId?: unknown } }>("/rooms/activity", async (request, reply) => {
    try {
      return { session: await touchVenueSession(readChatId(request.body?.sessionId)) };
    } catch (error) {
      return fail(reply, error, "updating venue activity");
    }
  });
  app.post<{ Body: { sessionId?: unknown; ownerId?: unknown; expectedSceneRevision?: unknown } }>(
    "/rooms/enter-private",
    async (request, reply) => {
      try {
        await assertFoundedVillageReady();
        return {
          session: await enterResidencePrivateSpace(
            readChatId(request.body?.sessionId),
            readCharacterId(request.body?.ownerId),
            readSceneRevision(request.body?.expectedSceneRevision),
          ),
        };
      } catch (error) {
        return fail(reply, error, "entering a private Residence space");
      }
    },
  );
  app.post<{ Body: { sessionId?: unknown } }>("/rooms/debug/discard", async (request, reply) => {
    try {
      await discardVenueVisitDebug(readChatId(request.body?.sessionId));
      return { discarded: true };
    } catch (error) {
      return fail(reply, error, "discarding a debug Scene");
    }
  });
  app.get<{ Params: { id: string }; Querystring: { cursor?: string; limit?: string } }>(
    "/rooms/:id/changes",
    async (request, reply) => {
      try {
        return await readSceneChanges(
          readChatId(request.params.id),
          request.query?.cursor,
          Number(request.query?.limit ?? 20),
        );
      } catch (error) {
        return fail(reply, error, "reading saved Scene changes");
      }
    },
  );
  app.get<{ Params: { id: string } }>("/rooms/:id/operation", async (request, reply) => {
    try {
      return { operation: await readVenueOperation(readChatId(request.params.id)) };
    } catch (error) {
      return fail(reply, error, "reading scene operation");
    }
  });
  app.post<{ Params: { id: string }; Body: { noticeId?: unknown } }>(
    "/rooms/:id/notices/dismiss",
    { bodyLimit: 2048 },
    async (request, reply) => {
      try {
        const noticeId = request.body?.noticeId;
        if (typeof noticeId !== "string" || !noticeId.trim() || noticeId.length > 1024)
          throw badRequest("A notice id must be between 1 and 1024 characters.");
        return await dismissSceneNotice(readChatId(request.params.id), noticeId.trim());
      } catch (error) {
        return fail(reply, error, "saving notice dismissal");
      }
    },
  );
  app.post<{ Params: { id: string; noticeId: string } }>(
    "/rooms/:id/notices/:noticeId/dismiss",
    async (request, reply) => {
      try {
        return await dismissSceneNotice(readChatId(request.params.id), readChatId(request.params.noticeId));
      } catch (error) {
        return fail(reply, error, "saving notice dismissal");
      }
    },
  );
  app.post<{ Params: { id: string } }>("/rooms/:id/changes/replay", async (request, reply) => {
    try {
      return await replaySceneChanges(readChatId(request.params.id));
    } catch (error) {
      return fail(reply, error, "replaying saved changes without model requests");
    }
  });
  app.post<{ Params: { id: string; submissionId: string }; Body: { domain?: string; retryOfAttemptId?: string } }>(
    "/rooms/:id/changes/:submissionId/interpret",
    async (request, reply) => {
      try {
        const domain = request.body?.domain;
        if (domain !== "memories" && domain !== "relationships" && domain !== "wishes")
          throw badRequest("Choose memories, relationships, or wishes.");
        return await retrySceneChangeInterpretation(
          readChatId(request.params.id),
          readChatId(request.params.submissionId),
          domain,
          request.body?.retryOfAttemptId,
        );
      } catch (error) {
        return fail(reply, error, "explicitly retrying a change interpretation");
      }
    },
  );
  app.get<{ Params: { id: string; operationId: string } }>(
    "/rooms/:id/operations/:operationId",
    async (request, reply) => {
      try {
        return {
          operation: await readVenueOperation(
            readChatId(request.params.id),
            readSubmissionId(request.params.operationId),
          ),
        };
      } catch (error) {
        return fail(reply, error, "reading scene operation");
      }
    },
  );
  app.post<{ Body: VenueTurnBody }>("/rooms/turn", async (request, reply) => {
    try {
      await assertFoundedVillageReady();
      const mode = request.body?.mode;
      if (mode !== "chat" && mode !== "ask" && mode !== "fulfill" && mode !== "act" && mode !== "contact")
        throw badRequest("Choose Chat, Ask, Fulfill, Act, or Knock / Call.");
      return await sendVenueTurn({
        sessionId: readChatId(request.body?.sessionId),
        message: readMessage(request.body?.message),
        mode,
        targetId: typeof request.body?.targetId === "string" ? request.body.targetId : "",
        ...(mode === "contact"
          ? {
              contact: {
                kind: request.body?.contact?.kind === "call" ? ("call" as const) : ("knock" as const),
                boundaryZoneId:
                  typeof request.body?.contact?.boundaryZoneId === "string" ? request.body.contact.boundaryZoneId : "",
                targetId: typeof request.body?.targetId === "string" ? request.body.targetId : "",
                quote: readMessage(request.body?.message),
                ...(request.body?.contact?.delivery === "device" ? { delivery: "device" as const } : {}),
                ...(typeof request.body?.contact?.deviceFeatureId === "string"
                  ? { deviceFeatureId: request.body.contact.deviceFeatureId }
                  : {}),
              },
            }
          : {}),
        submissionId: readSubmissionId(request.body?.submissionId),
        expectedSceneRevision: readSceneRevision(request.body?.expectedSceneRevision),
        retryOfAttemptId: request.body?.retryOfAttemptId,
        replaceOfOperationId:
          request.body?.replaceOfOperationId === undefined
            ? undefined
            : readSubmissionId(request.body.replaceOfOperationId),
      });
    } catch (error) {
      return fail(reply, error, "sending a venue turn");
    }
  });
  app.post<{
    Body: {
      sessionId?: unknown;
      submissionId?: unknown;
      message?: unknown;
      expectedSceneRevision?: unknown;
      retryOfAttemptId?: string;
    };
  }>("/rooms/leave", async (request, reply) => {
    try {
      return await leaveVenueSession(
        readChatId(request.body?.sessionId),
        readSubmissionId(request.body?.submissionId),
        typeof request.body?.message === "string" ? request.body.message : "",
        readSceneRevision(request.body?.expectedSceneRevision),
        request.body?.retryOfAttemptId,
      );
    } catch (error) {
      return fail(reply, error, "leaving a venue naturally");
    }
  });
  app.post<{ Body: { sessionId?: unknown; expectedSceneRevision?: unknown; retryOfAttemptId?: string } }>(
    "/rooms/end",
    async (request, reply) => {
      try {
        return await closeVenueSessionWithReceipts(
          readChatId(request.body?.sessionId),
          readSceneRevision(request.body?.expectedSceneRevision),
          request.body?.retryOfAttemptId,
        );
      } catch (error) {
        return fail(reply, error, "ending a Scene");
      }
    },
  );
  app.get<{ Querystring: { venueId?: string; characterId?: string; offset?: string; limit?: string } }>(
    "/rooms/archive",
    async (request, reply) => {
      try {
        return await listVenueVisitSummaries({
          placeId: request.query?.venueId,
          characterId: request.query?.characterId,
          offset: Number(request.query?.offset ?? 0),
          limit: Number(request.query?.limit ?? 20),
        });
      } catch (error) {
        return fail(reply, error, "listing Scenes");
      }
    },
  );
  app.get<{ Params: { id: string } }>("/rooms/archive/:id", async (request, reply) => {
    try {
      return { visit: await readVenueVisit(request.params.id) };
    } catch (error) {
      return fail(reply, error, "reading a Scene");
    }
  });
  app.delete<{ Params: { id: string } }>("/rooms/archive/:id", async (request, reply) => {
    try {
      await deleteVenueVisit(request.params.id);
      return { deleted: true };
    } catch (error) {
      return fail(reply, error, "deleting a Scene");
    }
  });
  app.delete("/rooms/archive", async (_request, reply) => {
    try {
      await deleteAllVenueVisits();
      return { deleted: true };
    } catch (error) {
      return fail(reply, error, "deleting Scenes");
    }
  });
}
