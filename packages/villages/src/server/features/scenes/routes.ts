import { villagesDebugAgentsEnabled } from "../../adapters/engine/runtime-host.js";
import {
  fail,
  readChatId,
  readMessage,
  readPlaceId,
  readSceneRevision,
  readSubmissionId,
  type VenueTurnBody,
} from "../../adapters/http/route-support.js";
import { operationSummary } from "../../adapters/operations/operation-context.js";

import { badRequest } from "../../domain/rules/errors.js";
import { readMovementCompanions } from "../../domain/rules/scene-trespass.js";
import { publicSceneChanges } from "../../domain/rules/scene-public.js";
import { readVenueOperation } from "../../jobs/venue-coordinator.js";
import { assertFoundedVillageReady } from "../founding/preparation.js";
import {
  closeVenueSessionWithReceipts,
  continueVenueWithoutGreeting,
  discardVenueVisitDebug,
  dismissFailedTurn,
  enterVenue,
  greetVenue,
  leaveVenueSession,
  moveVenueZone,
  reactToTrespass,
  retryReply,
  sendVenueTurn,
  travelVenue,
} from "./venue-session.js";
import { dismissSceneNotice, readSceneChanges, readSceneErrorDetails, replaySceneChanges } from "./changes.js";
import { activeVenueSession, touchVenueSession } from "./live-session.js";
import { readVenueVisit } from "./archive.js";
import { sceneQueries } from "./services.js";
import type { FastifyInstance } from "fastify";

export function registerSceneEntryRoutes(engine: FastifyInstance) {
  const app = engine;
  app.get<{ Params: { id: string }; Querystring: unknown }>("/rooms/:id/playback", async (request, reply) => {
    try {
      return await sceneQueries().readPlaybackPage(readChatId(request.params.id), request.query);
    } catch (error) {
      return fail(reply, error, "reading Scene playback");
    }
  });
  app.get<{ Params: { id: string }; Querystring: unknown }>("/rooms/:id/history", async (request, reply) => {
    try {
      return await sceneQueries().readHistoryPage(readChatId(request.params.id), request.query);
    } catch (error) {
      return fail(reply, error, "reading Scene history");
    }
  });
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
      zoneId?: unknown;
      expectedSceneRevision?: unknown;
      travel?: { sourceId?: unknown; offerId?: unknown };
      follow?: unknown;
    };
  }>("/rooms", async (request, reply) => {
    try {
      await assertFoundedVillageReady();
      if (request.body?.travel)
        return {
          session: await travelVenue(
            readChatId(request.body.travel.sourceId),
            readSubmissionId(request.body.travel.offerId),
            readSceneRevision(request.body.expectedSceneRevision),
          ),
        };
      return {
        session: await enterVenue(
          readPlaceId(request.body?.venueId),
          request.body?.zoneId === undefined ? undefined : readPlaceId(request.body.zoneId),
          request.body?.expectedSceneRevision === undefined
            ? undefined
            : readSceneRevision(request.body.expectedSceneRevision),
          request.body?.follow === true,
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
      expectedSceneRevision?: unknown;
      retryOfAttemptId?: string;
      operationId?: unknown;
      trespass?: unknown;
      companions?: unknown;
      follow?: unknown;
    };
  }>("/rooms/zone", async (request, reply) => {
    try {
      return {
        session: await moveVenueZone(
          readChatId(request.body?.sessionId),
          readPlaceId(request.body?.zoneId),
          readSceneRevision(request.body?.expectedSceneRevision),
          request.body?.retryOfAttemptId,
          request.body?.operationId === undefined ? undefined : readSubmissionId(request.body.operationId),
          request.body?.trespass === true,
          readMovementCompanions(request.body?.companions),
          request.body?.follow === true,
        ),
      };
    } catch (error) {
      return fail(reply, error, "moving between zones");
    }
  });
}
export function registerSceneOperationRoutes(engine: FastifyInstance) {
  const app = engine;
  app.post<{
    Body: { sessionId?: unknown; reactionId?: unknown; expectedSceneRevision?: unknown; retryOfAttemptId?: string };
  }>("/rooms/react", async (request, reply) => {
    try {
      return await reactToTrespass(
        readChatId(request.body?.sessionId),
        readSubmissionId(request.body?.reactionId),
        readSceneRevision(request.body?.expectedSceneRevision),
        request.body?.retryOfAttemptId,
      );
    } catch (error) {
      return fail(reply, error, "reacting to trespassing");
    }
  });
  app.get<{ Params: { id: string } }>("/rooms/:id/error-details", async (request, reply) => {
    try {
      return await readSceneErrorDetails(readChatId(request.params.id));
    } catch (error) {
      return fail(reply, error, "reading Scene error details");
    }
  });
  app.post<{ Body: { sessionId?: unknown; retryOfAttemptId?: string; recovery?: boolean } }>(
    "/rooms/greet",
    async (request, reply) => {
      try {
        await assertFoundedVillageReady();
        return {
          session: await greetVenue(
            readChatId(request.body?.sessionId),
            request.body?.retryOfAttemptId,
            request.body?.recovery === true,
          ),
        };
      } catch (error) {
        return fail(reply, error, "opening a venue scene");
      }
    },
  );
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
  app.post<{ Body: { sessionId?: unknown } }>("/rooms/debug/discard", async (request, reply) => {
    try {
      await discardVenueVisitDebug(readChatId(request.body?.sessionId));
      return { discarded: true };
    } catch (error) {
      return fail(reply, error, "discarding a debug Scene");
    }
  });
  app.get<{ Params: { id: string }; Querystring: { cursor?: string; limit?: string; shownWishes?: string } }>(
    "/rooms/:id/changes",
    async (request, reply) => {
      try {
        return publicSceneChanges(
          await readSceneChanges(
            readChatId(request.params.id),
            request.query?.cursor,
            Number(request.query?.limit ?? 20),
            request.query?.shownWishes,
          ),
        );
      } catch (error) {
        return fail(reply, error, "reading saved Scene changes");
      }
    },
  );
  app.get<{ Params: { id: string }; Querystring: { cursor?: string; limit?: string } }>(
    "/rooms/:id/changes/diagnostics",
    async (request, reply) => {
      try {
        return await readSceneChanges(
          readChatId(request.params.id),
          request.query?.cursor,
          Number(request.query?.limit ?? 10),
        );
      } catch (error) {
        return fail(reply, error, "reading owner Scene diagnostics");
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
  app.post<{ Params: { id: string } }>("/rooms/:id/changes/replay", async (request, reply) => {
    try {
      return publicSceneChanges(await replaySceneChanges(readChatId(request.params.id)));
    } catch (error) {
      return fail(reply, error, "replaying saved changes without model requests");
    }
  });
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
  app.post<{
    Params: { id: string; operationId: string };
    Body: { attemptId?: unknown; expectedSceneRevision?: unknown };
  }>("/rooms/:id/operations/:operationId/dismiss", async (request, reply) => {
    try {
      return await sceneQueries().projectSceneResponse(
        await dismissFailedTurn(
          readChatId(request.params.id),
          readSubmissionId(request.params.operationId),
          readSubmissionId(request.body?.attemptId),
          readSceneRevision(request.body?.expectedSceneRevision),
        ),
      );
    } catch (error) {
      return fail(reply, error, "clearing a failed Scene reply");
    }
  });
  app.post<{ Body: VenueTurnBody }>("/rooms/turn", async (request, reply) => {
    try {
      await assertFoundedVillageReady();
      const mode = request.body?.mode;
      if (mode !== "chat" && mode !== "contact") throw badRequest("Unsupported Scene action.");
      if (mode === "contact" && request.body?.contact?.delivery === "device")
        throw badRequest("Device links are not supported by Contact.");
      const rememberFor = request.body?.rememberFor;
      if (
        rememberFor !== undefined &&
        (mode !== "chat" || typeof rememberFor !== "string" || !rememberFor || rememberFor.length > 200)
      )
        throw badRequest("Choose a recipient for the reminder.");
      return await sendVenueTurn({
        sessionId: readChatId(request.body?.sessionId),
        message: readMessage(request.body?.message),
        mode,
        targetId: typeof request.body?.targetId === "string" ? request.body.targetId : "",
        ...(typeof rememberFor === "string" ? { rememberFor } : {}),
        ...(mode === "contact"
          ? {
              contact: {
                // Preserve saved Contact request fingerprints, including requests that omitted kind.
                kind: request.body?.contact?.kind === "call" ? ("call" as const) : ("knock" as const),
                boundaryZoneId:
                  typeof request.body?.contact?.boundaryZoneId === "string" ? request.body.contact.boundaryZoneId : "",
                targetId: typeof request.body?.targetId === "string" ? request.body.targetId : "",
                quote: readMessage(request.body?.message),
                ...(request.body?.contact?.delivery === "loud" ? { delivery: "loud" as const } : {}),
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
  app.post<{ Body: { sessionId?: unknown; requestId?: unknown; token?: unknown } }>(
    "/rooms/retry",
    async (request, reply) => {
      try {
        await assertFoundedVillageReady();
        const token = request.body?.token;
        if (typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token)) throw badRequest("Invalid Retry target.");
        return await retryReply(readChatId(request.body?.sessionId), readSubmissionId(request.body?.requestId), token);
      } catch (error) {
        return fail(reply, error, "retrying a Scene reply");
      }
    },
  );
  app.post<{
    Body: {
      sessionId?: unknown;
      submissionId?: unknown;
      message?: unknown;
      expectedSceneRevision?: unknown;
      retryOfAttemptId?: string;
      replaceOfOperationId?: unknown;
    };
  }>("/rooms/leave", async (request, reply) => {
    try {
      return await leaveVenueSession(
        readChatId(request.body?.sessionId),
        readSubmissionId(request.body?.submissionId),
        typeof request.body?.message === "string" ? request.body.message : "",
        readSceneRevision(request.body?.expectedSceneRevision),
        request.body?.retryOfAttemptId,
        request.body?.replaceOfOperationId === undefined
          ? undefined
          : readSubmissionId(request.body.replaceOfOperationId),
      );
    } catch (error) {
      return fail(reply, error, "leaving a venue naturally");
    }
  });
  app.post<{
    Body: {
      sessionId?: unknown;
      expectedSceneRevision?: unknown;
      retryOfAttemptId?: string;
      abandonOperationId?: unknown;
    };
  }>("/rooms/end", async (request, reply) => {
    try {
      return await closeVenueSessionWithReceipts(
        readChatId(request.body?.sessionId),
        readSceneRevision(request.body?.expectedSceneRevision),
        request.body?.retryOfAttemptId,
        request.body?.abandonOperationId === undefined ? undefined : readSubmissionId(request.body.abandonOperationId),
      );
    } catch (error) {
      return fail(reply, error, "ending a Scene");
    }
  });
  app.get<{ Params: { id: string } }>("/rooms/:id/recovery", async (request, reply) => {
    try {
      return { visit: await readVenueVisit(request.params.id) };
    } catch (error) {
      return fail(reply, error, "reading a Scene");
    }
  });
}
