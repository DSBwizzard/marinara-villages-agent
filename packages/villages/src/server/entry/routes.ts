import { publicSceneRoutes } from "../adapters/http/public-scene-routes.js";
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
import type { FastifyInstance } from "fastify";

/** Register feature routes in their established host-collector order. */
export async function villagesRoutes(engine: FastifyInstance) {
  const surface = publicSceneRoutes(engine);
  registerInterpretationRoutes(surface);
  registerRelationshipRoutes(surface);
  registerSpriteManagerRoutes(surface);
  registerSnapshotCatalogRoutes(surface);
  registerPersonaRoutes(surface);
  registerTownMapRoutes(surface);
  registerResidentRoutes(surface);
  registerSceneEntryRoutes(surface);
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
