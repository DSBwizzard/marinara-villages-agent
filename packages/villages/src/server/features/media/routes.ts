import {
  type CharacterParams,
  fail,
  readCharacterId,
  readVenueId,
  readVenueSpaceClass,
  SETTINGS_BODY_LIMIT,
  VENUE_IMAGE_BODY_LIMIT,
} from "../../adapters/http/route-support.js";
import { imageTarget } from "../venues/services.js";
import { buildVillageSnapshot } from "../world/snapshot.js";
import { readVillageTownMapImage, replaceVillageTownMap } from "./town-map-review.js";
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

export function registerSpriteManagerRoutes(engine: FastifyInstance) {
  const app = engine;
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
  app.get("/town-map", async (_request, reply) => {
    try {
      return await readVillageTownMapImage();
    } catch (error) {
      return fail(reply, error, "reading the town map");
    }
  });
  app.put<{ Body: unknown }>("/town-map", { bodyLimit: SETTINGS_BODY_LIMIT }, async (request, reply) => {
    try {
      return await replaceVillageTownMap(request.body);
    } catch (error) {
      return fail(reply, error, "replacing the village map");
    }
  });
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
      spaceClass?: unknown;
      privateSpaceId?: unknown;
      privateOwnerId?: unknown;
      zoneId?: unknown;
    };
  }>("/locations/venue/image", async (request, reply) => {
    try {
      return await generateVillageLocationImage(
        readVenueId(request.body?.venueId),
        // A connection the tab named wins; anything else is left to the
        // package's own choice. The value is not validated here because
        // whether it draws images is a question only the Engine can answer,
        // and it already answers it with a better message than this could.
        typeof request.body?.connectionId === "string" ? request.body.connectionId : undefined,
        readVenueSpaceClass(request.body?.spaceClass),
        typeof request.body?.privateOwnerId === "string" ? request.body.privateOwnerId : "",
        false,
        await imageTarget(request.body),
      );
    } catch (error) {
      return fail(reply, error, "drawing a place");
    }
  });
  app.put<{
    Body: {
      venueId?: unknown;
      image?: unknown;
      spaceClass?: unknown;
      privateSpaceId?: unknown;
      privateOwnerId?: unknown;
      zoneId?: unknown;
    };
  }>("/locations/venue/image", { bodyLimit: VENUE_IMAGE_BODY_LIMIT }, async (request, reply) => {
    try {
      return await storeVillageVenueImage(
        readVenueId(request.body?.venueId),
        request.body?.image,
        readVenueSpaceClass(request.body?.spaceClass),
        typeof request.body?.privateOwnerId === "string" ? request.body.privateOwnerId : "",
        await imageTarget(request.body),
      );
    } catch (error) {
      return fail(reply, error, "keeping a place's picture");
    }
  });
  app.delete<{
    Body: {
      venueId?: unknown;
      spaceClass?: unknown;
      privateSpaceId?: unknown;
      privateOwnerId?: unknown;
      zoneId?: unknown;
    };
  }>("/locations/venue/image", async (request, reply) => {
    try {
      await setVillageVenueImage(
        readVenueId(request.body?.venueId),
        null,
        readVenueSpaceClass(request.body?.spaceClass),
        typeof request.body?.privateOwnerId === "string" ? request.body.privateOwnerId : "",
        false,
        await imageTarget(request.body),
      );
      return await buildVillageSnapshot();
    } catch (error) {
      return fail(reply, error, "taking a place's picture away");
    }
  });
}
