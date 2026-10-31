import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { activationScope } from "../adapters/engine/activation-scope.js";
import { publicSceneRoutes } from "../adapters/http/public-scene-routes.js";
import { withRepairWork } from "../adapters/storage/repair-gate.js";
import { villageNow } from "../adapters/time/clock-gate.js";
import { readActive, readSession } from "../adapters/storage/scene-store.js";
import { spinoffLocksScene } from "../domain/models/spinoff-model.js";
import { asRecord } from "../domain/rules/coerce.js";
import { isVillageFounded } from "../domain/rules/world-snapshot.js";
import { registerBackgroundRoutes } from "../features/background/routes.js";
import { prepareReturnCatchup } from "../features/background/return-catchup.js";
import { hasVillagePresence } from "../jobs/background-work.js";
import { peekVillageAuthority } from "../features/world/village-store.js";
import { registerFoundingRoutes } from "../features/founding/routes.js";
import {
  registerSpriteManagerRoutes,
  registerTownMapRoutes,
  registerVenueImageRoutes,
} from "../features/media/routes.js";
import { registerProjectRoutes } from "../features/projects/routes.js";
import { registerRepairRoutes } from "../features/repair/routes.js";
import {
  registerAgendaRoutes,
  registerRelationshipRoutes,
  registerResidentRoutes,
} from "../features/residents/routes.js";
import { registerSceneEntryRoutes, registerSceneOperationRoutes } from "../features/scenes/routes.js";
import { projectSceneResponse } from "../features/scenes/services.js";
import { registerSpinoffRoutes } from "../features/scenes/spinoff-routes.js";
import {
  registerConnectionRoutes,
  registerInterpretationRoutes,
  registerPersonaRoutes,
  registerRuntimeDiagnosticsRoutes,
  registerUsageRoutes,
  registerVillageSettingsRoutes,
} from "../features/settings/routes.js";
import {
  registerVenueAccessRoutes,
  registerVenueCreationRoutes,
  registerVenueManagementRoutes,
} from "../features/venues/routes.js";
import {
  registerHistoryRoutes,
  registerSnapshotCatalogRoutes,
  registerWorldMaintenanceRoutes,
} from "../features/world/routes.js";

/** Register feature routes in their established host-collector order. */
export async function villagesRoutes(engine: FastifyInstance) {
  // Read-only Village browsing remains available; player writes cannot create a second history.
  const guard = async (method: string, path: string, body: unknown) => {
    if (
      method === "get" ||
      path === "/background/presence" ||
      path === "/background/catchup/retry" ||
      path === "/background/catchup/continue" ||
      (path === "/reconcile" && asRecord(body).forceStory !== true)
    )
      return null;
    let state = await peekVillageAuthority();
    if (path === "/setup" && isVillageFounded(state))
      return "This Village is already founded. Use World Configuration.";
    if (!hasVillagePresence() && state.returnCatchup?.capture) {
      await prepareReturnCatchup(villageNow(), randomUUID());
      state = await peekVillageAuthority();
    }
    let alreadyAdvanced = false;
    if (path === "/clock/advance") {
      const request = asRecord(body);
      const receipt =
        state.clock?.advanceReceipts?.find((entry) => entry.actionId === request.actionId) ??
        (state.clock?.lastAdvance?.actionId === request.actionId ? state.clock.lastAdvance : undefined);
      alreadyAdvanced = !!receipt && receipt.milliseconds === request.milliseconds;
    }
    if (
      !alreadyAdvanced &&
      state.returnCatchup?.batch &&
      !["completed", "cancelled"].includes(state.returnCatchup.batch.status)
    )
      return "Village catch-up is still in progress. Finish or continue before changing the Village.";
    if (path.startsWith("/spinoffs/")) return null;
    const active = await readActive();
    if (active.sessionId && spinoffLocksScene((await readSession(active.sessionId)).spinoff))
      return "Your spinoff is still pending. You can browse Villages, but finish or discard it before changing Village state.";
    return null;
  };
  const surface = publicSceneRoutes(engine, projectSceneResponse, guard, [
    "post /setup",
    "get /memories",
    "get /rooms/:id/history",
    "get /rooms/:id/playback",
    "get /memories/inspect",
    "get /memories/:id/evidence",
    "get /memories/inspect/:id",
    "post /memories/:id/forget",
    "post /memories/:id/correct",
  ]);
  registerInterpretationRoutes(surface);
  registerRelationshipRoutes(surface);
  registerSpriteManagerRoutes(surface);
  registerSnapshotCatalogRoutes(surface);
  registerPersonaRoutes(surface);
  registerTownMapRoutes(surface);
  registerResidentRoutes(surface);
  registerSceneEntryRoutes(surface);
  registerSpinoffRoutes(surface);
  registerVenueAccessRoutes(surface);
  registerSceneOperationRoutes(surface);
  registerUsageRoutes(surface);
  registerRuntimeDiagnosticsRoutes(surface);
  registerVillageSettingsRoutes(surface);
  registerConnectionRoutes(surface);
  registerFoundingRoutes(surface);
  registerVenueImageRoutes(surface);
  registerVenueCreationRoutes(surface);
  registerProjectRoutes(surface);
  registerVenueManagementRoutes(surface);
  registerWorldMaintenanceRoutes(surface);
  registerBackgroundRoutes(surface);
  registerHistoryRoutes(surface);
  registerAgendaRoutes(surface);
  // These routes inspect raw saved authority. Do not observe clocks or process outboxes.
  const repairSurface = Object.create(engine) as FastifyInstance;
  const owner = activationScope();
  for (const method of ["get", "post"] as const) {
    repairSurface[method] = ((path: string, handler: (request: never, reply: never) => unknown) => {
      const run = async (request: import("fastify").FastifyRequest, reply: import("fastify").FastifyReply) => {
        const blocked = await guard(method, path, request.body);
        if (blocked) return reply.code(409).send({ error: blocked });
        return withRepairWork(() => Promise.resolve(handler(request as never, reply as never)));
      };
      return engine[method](path, owner ? owner.bind(run) : run);
    }) as unknown as (typeof engine)[typeof method];
  }
  registerRepairRoutes(repairSurface);
}
