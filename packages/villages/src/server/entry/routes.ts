import type { FastifyInstance } from "fastify";
import { publicSceneRoutes } from "../adapters/http/public-scene-routes.js";
import { readActive, readSession } from "../adapters/storage/scene-store.js";
import { spinoffLocksScene } from "../domain/models/spinoff-model.js";
import { asRecord } from "../domain/rules/coerce.js";
import { registerBackgroundRoutes } from "../features/background/routes.js";
import { registerFoundingRoutes } from "../features/founding/routes.js";
import {
  registerSpriteManagerRoutes,
  registerTownMapRoutes,
  registerVenueImageRoutes,
} from "../features/media/routes.js";
import { registerProjectRoutes } from "../features/projects/routes.js";
import {
  registerAgendaRoutes,
  registerRelationshipRoutes,
  registerResidentRoutes,
} from "../features/residents/routes.js";
import { registerSceneEntryRoutes, registerSceneOperationRoutes } from "../features/scenes/routes.js";
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
      path.startsWith("/spinoffs/") ||
      path === "/background/presence" ||
      (path === "/reconcile" && asRecord(body).forceStory !== true)
    )
      return null;
    const active = await readActive();
    if (active.sessionId && spinoffLocksScene((await readSession(active.sessionId)).spinoff))
      return "Your spinoff is still pending. You can browse Villages, but finish or discard it before changing Village state.";
    return null;
  };
  const surface = publicSceneRoutes(engine, guard, [
    "get /memories",
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
}
