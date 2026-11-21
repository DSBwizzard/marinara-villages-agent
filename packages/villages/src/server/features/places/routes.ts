import type { FastifyInstance } from "fastify";
import { fail, readPlaceId } from "../../adapters/http/route-support.js";
import { listPlaces, readPlace, generatePlace, placePosition } from "./services.js";
import { prepareMapNpcs } from "./npc-population.js";
import { readVillageState } from "../world/village-store.js";
import { buildVillageSnapshot } from "../world/snapshot.js";
import { villageWorldScope } from "../../domain/rules/village-identity.js";
import { conflict, badRequest } from "../../domain/rules/errors.js";
import { z } from "zod";

export function registerPlaceRoutes(app: FastifyInstance) {
  app.post<{ Body: unknown }>("/npcs/prepare", async (request, reply) => {
    try {
      const parsed = z
        .object({
          mapId: z.string().min(1).max(200),
          worldScope: z.string().min(1).max(100),
          requestId: z.string().uuid(),
        })
        .strict()
        .safeParse(request.body);
      if (!parsed.success) throw badRequest("Invalid NPC preparation request.");
      if (villageWorldScope(await readVillageState()) !== parsed.data.worldScope)
        throw conflict("The Village changed.");
      await prepareMapNpcs(parsed.data.mapId, parsed.data.requestId);
      return buildVillageSnapshot();
    } catch (error) {
      return fail(reply, error, "preparing NPCs");
    }
  });
  app.post<{ Params: { id: string }; Body: unknown }>("/places/:id/position", async (request, reply) => {
    try {
      return await placePosition(readPlaceId(request.params.id), request.body);
    } catch (error) {
      return fail(reply, error, "placing a Place");
    }
  });
  app.get<{ Querystring: Record<string, unknown> }>("/places", async (request, reply) => {
    try {
      return await listPlaces(request.query);
    } catch (error) {
      return fail(reply, error, "reading Places");
    }
  });
  app.post<{ Body: unknown }>("/places/explore", async (request, reply) => {
    try {
      return await generatePlace(request.body);
    } catch (error) {
      return fail(reply, error, "exploring");
    }
  });
  app.get<{ Params: { id: string } }>("/places/:id", async (request, reply) => {
    try {
      return await readPlace(readPlaceId(request.params.id));
    } catch (error) {
      return fail(reply, error, "reading a Place");
    }
  });
  app.post<{ Params: { id: string }; Body: unknown }>("/places/:id/prepare", async (request, reply) => {
    try {
      return await generatePlace(request.body, readPlaceId(request.params.id));
    } catch (error) {
      return fail(reply, error, "preparing a Place");
    }
  });
}
