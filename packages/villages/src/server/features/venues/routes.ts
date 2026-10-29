import type { FastifyInstance } from "fastify";
import { fail, readPlaceId, readVenueId } from "../../adapters/http/route-support.js";
import { retryPrivateSpaces } from "../../jobs/private-space-preparation.js";
import { createRenovationProject } from "../projects/project-lifecycle.js";
import {
  approveVillageResidence,
  completeVillageResidence,
  decideVillageResidence,
  movePlayerToResidence,
  proposeVillageResidence,
} from "../venues/residences.js";
import { buildVillageSnapshot } from "../world/snapshot.js";
import {
  changeVenueAccess,
  createVillageVenue,
  deleteVillageVenue,
  previewVillageVenueDeletion,
  updateVillageVenue,
  renameVillageZone,
  updateVenueZoneLayout,
} from "./services.js";
import { decideVillageVenueRequest } from "./venue-requests.js";

export function registerVenueAccessRoutes(engine: FastifyInstance) {
  const app = engine;
  app.put<{ Params: { venueId: string }; Body: unknown }>("/venues/:venueId/layout", async (request, reply) => {
    try {
      return await updateVenueZoneLayout(readPlaceId(request.params.venueId), request.body);
    } catch (error) {
      return fail(reply, error, "editing the Zone layout");
    }
  });
  app.post("/private-spaces/retry", async (_request, reply) => {
    try {
      await retryPrivateSpaces();
      return await buildVillageSnapshot();
    } catch (error) {
      return fail(reply, error, "preparing private spaces");
    }
  });
  app.post<{ Params: { venueId: string }; Body: unknown }>("/venues/:venueId/access", async (request, reply) => {
    try {
      return await changeVenueAccess(readPlaceId(request.params.venueId), request.body);
    } catch (error) {
      return fail(reply, error, "changing access");
    }
  });
  app.put<{ Params: { venueId: string; zoneId: string }; Body: unknown }>(
    "/venues/:venueId/zones/:zoneId/name",
    async (request, reply) => {
      try {
        return await renameVillageZone(
          readPlaceId(request.params.venueId),
          readPlaceId(request.params.zoneId),
          request.body,
        );
      } catch (error) {
        return fail(reply, error, "editing a zone");
      }
    },
  );
}
export function registerVenueCreationRoutes(engine: FastifyInstance) {
  const app = engine;
  app.post<{ Body: unknown }>("/locations/venue", async (request, reply) => {
    try {
      return await createVillageVenue(request.body);
    } catch (error) {
      return fail(reply, error, "creating a place");
    }
  });
}
export function registerVenueManagementRoutes(engine: FastifyInstance) {
  const app = engine;
  app.post<{ Params: { requestId: string }; Body: unknown }>(
    "/venue-requests/:requestId/approve",
    async (request, reply) => {
      try {
        return await decideVillageVenueRequest(readVenueId(request.params.requestId), true, request.body);
      } catch (error) {
        return fail(reply, error, "approving a venue request");
      }
    },
  );
  app.post<{ Params: { requestId: string } }>("/venue-requests/:requestId/deny", async (request, reply) => {
    try {
      return await decideVillageVenueRequest(readVenueId(request.params.requestId), false, null);
    } catch (error) {
      return fail(reply, error, "denying a venue request");
    }
  });
  app.put<{ Params: { venueId: string }; Body: unknown }>("/locations/venue/:venueId", async (request, reply) => {
    try {
      return await updateVillageVenue(readVenueId(request.params.venueId), request.body);
    } catch (error) {
      return fail(reply, error, "updating a place");
    }
  });
  app.get<{ Params: { venueId: string } }>("/locations/venue/:venueId/dependencies", async (request, reply) => {
    try {
      return await previewVillageVenueDeletion(readVenueId(request.params.venueId));
    } catch (error) {
      return fail(reply, error, "checking place dependencies");
    }
  });
  app.delete<{ Params: { venueId: string }; Body: { confirmed?: unknown } }>(
    "/locations/venue/:venueId",
    async (request, reply) => {
      try {
        return await deleteVillageVenue(readVenueId(request.params.venueId), request.body?.confirmed === true);
      } catch (error) {
        return fail(reply, error, "deleting a place");
      }
    },
  );
  app.post<{ Body: { characterId?: unknown; venueId?: unknown; privateZoneId?: string } }>(
    "/residences/proposals",
    async (request, reply) => {
      try {
        return await proposeVillageResidence(
          request.body?.characterId,
          request.body?.venueId,
          "player",
          "",
          typeof request.body?.privateZoneId === "string" ? request.body.privateZoneId : "",
        );
      } catch (error) {
        return fail(reply, error, "proposing a residence");
      }
    },
  );
  app.post<{ Params: { venueId: string }; Body: unknown }>(
    "/locations/venue/:venueId/proposals",
    async (request, reply) => {
      try {
        await createRenovationProject(readVenueId(request.params.venueId), request.body);
        return await buildVillageSnapshot();
      } catch (error) {
        return fail(reply, error, "proposing a Venue change");
      }
    },
  );
  app.post<{ Params: { venueId: string }; Body: { privateZoneId?: string } }>(
    "/locations/venue/:venueId/player-move",
    async (request, reply) => {
      try {
        await movePlayerToResidence(
          readVenueId(request.params.venueId),
          typeof request.body?.privateZoneId === "string" ? request.body.privateZoneId : "",
        );
        return await buildVillageSnapshot();
      } catch (error) {
        return fail(reply, error, "requesting a player move");
      }
    },
  );
  app.post<{ Body: { characterId?: unknown } }>("/residences/approvals", async (request, reply) => {
    try {
      return await approveVillageResidence(request.body?.characterId);
    } catch (error) {
      return fail(reply, error, "approving a residence");
    }
  });
  app.post<{ Body: { characterId?: unknown } }>("/residences/denials", async (request, reply) => {
    try {
      return await decideVillageResidence(request.body?.characterId, false, "player");
    } catch (error) {
      return fail(reply, error, "denying a residence change");
    }
  });
  app.post<{ Body: { characterId?: unknown } }>("/residences/debug/complete-now", async (request, reply) => {
    try {
      return await completeVillageResidence(request.body?.characterId, true);
    } catch (error) {
      return fail(reply, error, "completing a residence change");
    }
  });
}
