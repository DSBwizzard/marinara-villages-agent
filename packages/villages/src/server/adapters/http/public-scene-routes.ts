import { operationSummary } from "../operations/operation-context.js";
import type { VillageRouteHandler } from "./route-support.js";
import type { FastifyInstance } from "fastify";

export function publicSceneRoutes(engine: FastifyInstance): FastifyInstance {
  const surface = Object.create(engine) as FastifyInstance;
  for (const method of ["get", "post", "put", "patch", "delete"] as const) {
    const register = engine[method].bind(engine);
    const wrap =
      (handler: VillageRouteHandler): VillageRouteHandler =>
      async (request, reply) => {
        const result = await handler(request, reply);
        if (result && typeof result === "object") {
          const payload = result as Record<string, unknown>;
          for (const key of ["session", "visit"]) {
            const scene = payload[key] as Record<string, unknown> | undefined;
            if (scene)
              payload[key] = {
                ...scene,
                relationshipReview: scene.relationshipReview
                  ? {
                      applied: (scene.relationshipReview as { applied?: boolean }).applied,
                      receipts: (scene.relationshipReview as { receipts?: unknown[] }).receipts ?? [],
                    }
                  : undefined,
                operation: operationSummary(
                  scene.operation as import("../../domain/models/operation-model.js").VenueOperation | undefined,
                ),
              };
          }
        }
        return result;
      };
    surface[method] = ((path: string, options: unknown, handler?: VillageRouteHandler) =>
      handler
        ? register(path, options as never, wrap(handler) as never)
        : register(path, wrap(options as VillageRouteHandler) as never)) as (typeof engine)[typeof method];
  }
  return surface;
}
