import {
  type CharacterParams,
  fail,
  readCharacterId,
  readVenueId,
  readPlaceId,
  SETTINGS_BODY_LIMIT,
  VENUE_IMAGE_BODY_LIMIT,
} from "../../adapters/http/route-support.js";
import { buildVillageSnapshot } from "../world/snapshot.js";
import { createVillageMap, updateVillageMap } from "./town-map-review.js";
import { setVillageVenueImage } from "../venues/services.js";
import {
  generateVillageLocationImage,
  storeVillageVenueImage,
  setZonePictureFrozen,
  retryZonePicture,
} from "./location-image.js";
import {
  adoptSpriteArtwork,
  importSpriteArtwork,
  listSpriteLibrary,
  readSpriteManager,
  removeSpriteArtwork,
  removeSpriteAssignment,
  saveSpriteArtwork,
  setSpriteDefault,
  setSpriteFraming,
} from "./sprite-manager.js";
import { readVillageImageStyleCatalog } from "./image-generation.js";
import type { FastifyInstance } from "fastify";
import { spriteSetup } from "./sprite-setup.js";

export function registerSpriteManagerRoutes(engine: FastifyInstance) {
  const app = engine;
  app.get<{ Params: CharacterParams }>("/characters/:characterId/sprites/setup/settled", async (request, reply) => {
    try {
      return await spriteSetup().settled(readCharacterId(request.params.characterId));
    } catch (error) {
      return fail(reply, error, "reading settled sprite setup");
    }
  });
  app.get<{ Params: CharacterParams }>("/characters/:characterId/sprites/setup", async (request, reply) => {
    try {
      return await spriteSetup().read(readCharacterId(request.params.characterId));
    } catch (error) {
      return fail(reply, error, "reading sprite setup");
    }
  });
  for (const action of ["prepare", "save", "frame", "apply"] as const) {
    app.post<{ Params: CharacterParams; Body: unknown }>(
      "/characters/:characterId/sprites/setup/" + action,
      async (request, reply) => {
        const controller = new AbortController();
        const abort = () => {
          if (!reply.raw.writableEnded) controller.abort();
        };
        reply.raw.on("close", abort);
        try {
          const service = spriteSetup(),
            id = readCharacterId(request.params.characterId);
          if (action === "prepare") return await service.prepare(id, controller.signal, request.body);
          if (action === "save") return await service.save(id, request.body);
          if (action === "frame") return await service.frame(id, request.body);
          return await service.applyResident(id, request.body);
        } catch (error) {
          return fail(reply, error, "preparing sprites");
        } finally {
          reply.raw.off("close", abort);
        }
      },
    );
  }
  app.get<{ Params: CharacterParams }>("/villagers/:characterId/sprites/manager", async (request, reply) => {
    try {
      return await readSpriteManager(readCharacterId(request.params.characterId));
    } catch (error) {
      return fail(reply, error, "reading Sprite Manager");
    }
  });
  const managerActions: Record<string, (id: string, body: unknown) => Promise<unknown>> = {
    import: importSpriteArtwork,
    library: listSpriteLibrary,
    adopt: adoptSpriteArtwork,
    save: saveSpriteArtwork,
    default: setSpriteDefault,
    framing: setSpriteFraming,
    remove: removeSpriteArtwork,
    unassign: removeSpriteAssignment,
  };
  for (const [action, handler] of Object.entries(managerActions)) {
    app.post<{ Params: CharacterParams; Body: unknown }>(
      "/villagers/:characterId/sprites/manager/" + action,
      { bodyLimit: 32_000_000 },
      async (request, reply) => {
        try {
          return await handler(readCharacterId(request.params.characterId), request.body);
        } catch (error) {
          return fail(reply, error, "updating Sprite Manager");
        }
      },
    );
  }
}
export function registerTownMapRoutes(engine: FastifyInstance) {
  const app = engine;
  app.get("/image-style-profiles", async (_request, reply) => {
    try {
      return await readVillageImageStyleCatalog();
    } catch (error) {
      return fail(reply, error, "reading Engine image styles");
    }
  });
  app.post<{ Body: unknown }>("/maps", { bodyLimit: SETTINGS_BODY_LIMIT }, async (request, reply) => {
    try {
      return await createVillageMap(request.body);
    } catch (error) {
      return fail(reply, error, "adding a map");
    }
  });
  app.put<{ Params: { id: string }; Body: unknown }>(
    "/maps/:id",
    { bodyLimit: SETTINGS_BODY_LIMIT },
    async (request, reply) => {
      try {
        return await updateVillageMap(request.params.id, request.body);
      } catch (error) {
        return fail(reply, error, "editing a map");
      }
    },
  );
}
export function registerVenueImageRoutes(engine: FastifyInstance) {
  const app = engine;
  app.post<{ Body: { venueId: string; zoneId: string } }>("/locations/venue/image/retry", async (request, reply) => {
    try {
      if (typeof request.body?.zoneId !== "string") return reply.code(400).send({ error: "Choose a Zone." });
      return await retryZonePicture(readVenueId(request.body.venueId), request.body.zoneId);
    } catch (error) {
      return fail(reply, error, "retrying artwork");
    }
  });
  app.patch<{ Body: { venueId: string; zoneId: string; frozen: boolean } }>(
    "/locations/venue/image/freeze",
    async (request, reply) => {
      try {
        if (typeof request.body?.zoneId !== "string" || typeof request.body?.frozen !== "boolean")
          return reply.code(400).send({ error: "Choose a Zone and freeze state." });
        return await setZonePictureFrozen(readVenueId(request.body.venueId), request.body.zoneId, request.body.frozen);
      } catch (error) {
        return fail(reply, error, "saving picture preference");
      }
    },
  );
  app.post<{
    Body: {
      venueId?: unknown;
      connectionId?: unknown;
      zoneId?: unknown;
    };
  }>("/locations/venue/image", async (request, reply) => {
    try {
      return await generateVillageLocationImage(
        readVenueId(request.body?.venueId),
        readPlaceId(request.body?.zoneId),
        typeof request.body?.connectionId === "string" ? request.body.connectionId : undefined,
      );
    } catch (error) {
      return fail(reply, error, "drawing a place");
    }
  });
  app.put<{
    Body: {
      venueId?: unknown;
      image?: unknown;
      zoneId?: unknown;
    };
  }>("/locations/venue/image", { bodyLimit: VENUE_IMAGE_BODY_LIMIT }, async (request, reply) => {
    try {
      return await storeVillageVenueImage(
        readVenueId(request.body?.venueId),
        readPlaceId(request.body?.zoneId),
        request.body?.image,
      );
    } catch (error) {
      return fail(reply, error, "keeping a place's picture");
    }
  });
  app.delete<{
    Body: {
      venueId?: unknown;
      zoneId?: unknown;
    };
  }>("/locations/venue/image", async (request, reply) => {
    try {
      await setVillageVenueImage(readVenueId(request.body?.venueId), readPlaceId(request.body?.zoneId), null);
      return await buildVillageSnapshot();
    } catch (error) {
      return fail(reply, error, "taking a place's picture away");
    }
  });
}
