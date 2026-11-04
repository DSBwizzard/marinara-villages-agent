import type { FastifyInstance } from "fastify";
import { fail, readPlaceId } from "../../adapters/http/route-support.js";
import { listPlaces, readPlace, generatePlace, readPlaceOperation, placePosition } from "./services.js";

export function registerPlaceRoutes(app: FastifyInstance) {
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
  app.get<{ Params: { id: string } }>("/places/requests/:id", async (request, reply) => {
    try {
      return await readPlaceOperation(readPlaceId(request.params.id));
    } catch (error) {
      return fail(reply, error, "reading exploration progress");
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
