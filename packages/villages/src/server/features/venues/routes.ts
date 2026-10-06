import { fail, readPlaceId, readVenueId } from "../../adapters/http/route-support.js";
import { retryPrivateSpaces } from "../../jobs/private-space-preparation.js";
import { buildVillageSnapshot } from "../world/snapshot.js";
import {
  approveVillageResidence,
  changeVenueAccess,
  completeVillageResidence,
  createVillageVenue,
  decideVillageHomeUpgrade,
  decideVillageResidence,
  decideVillageVenueRequest,
  deleteVillageVenue,
  previewVillageVenueDeletion,
  proposeResidenceSpaceEdit,
  proposeVillageResidence,
  retryResidencePrivateSpaceAdaptation,
  updateVillageVenue,
  updateVillageZone,
} from "../world/village.js";
import { decideVillagerVenueImprovement, proposePlayerMove, proposeVenueChange } from "./venue-mailbox.js";
import type { FastifyInstance } from "fastify";

export function registerVenueAccessRoutes(engine: FastifyInstance) {
  const app = engine;
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
    "/venues/:venueId/zones/:zoneId",
    async (request, reply) => {
      try {
        return await updateVillageZone(
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
  app.post<{ Params: { requestId: string } }>("/venue-upgrades/:requestId/approve", async (request, reply) => {
    try {
      return await decideVillageHomeUpgrade(readVenueId(request.params.requestId), true);
    } catch (error) {
      return fail(reply, error, "approving a home upgrade");
    }
  });
  app.post<{ Params: { requestId: string } }>("/venue-upgrades/:requestId/deny", async (request, reply) => {
    try {
      return await decideVillageHomeUpgrade(readVenueId(request.params.requestId), false);
    } catch (error) {
      return fail(reply, error, "denying a home upgrade");
    }
  });
  app.put<{ Params: { venueId: string }; Body: unknown }>("/locations/venue/:venueId", async (request, reply) => {
    try {
      return await updateVillageVenue(readVenueId(request.params.venueId), request.body);
    } catch (error) {
      return fail(reply, error, "updating a place");
    }
  });
  app.post<{ Params: { venueId: string }; Body: unknown }>(
    "/locations/venue/:venueId/edit-proposals",
    async (request, reply) => {
      try {
        return await proposeResidenceSpaceEdit(readVenueId(request.params.venueId), request.body);
      } catch (error) {
        return fail(reply, error, "proposing a Residence edit");
      }
    },
  );
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
        await proposeVenueChange(readVenueId(request.params.venueId), request.body);
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
        await proposePlayerMove(
          readVenueId(request.params.venueId),
          typeof request.body?.privateZoneId === "string" ? request.body.privateZoneId : "",
        );
        return await buildVillageSnapshot();
      } catch (error) {
        return fail(reply, error, "requesting a player move");
      }
    },
  );
  app.post<{
    Params: { mailId: string };
    Body: { approved?: unknown; title?: unknown; description?: unknown; extraBeds?: unknown; slot?: unknown };
  }>("/venue-mail/:mailId/decision", async (request, reply) => {
    try {
      await decideVillagerVenueImprovement(
        readVenueId(request.params.mailId),
        request.body?.approved === true,
        request.body,
      );
      return await buildVillageSnapshot();
    } catch (error) {
      return fail(reply, error, "deciding a Venue improvement");
    }
  });
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
  app.post<{ Body: { characterId?: unknown } }>("/residences/private-space/retry", async (request, reply) => {
    try {
      return await retryResidencePrivateSpaceAdaptation(request.body?.characterId);
    } catch (error) {
      return fail(reply, error, "adapting a private space");
    }
  });
}
