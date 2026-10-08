import { operationSummary } from "../operations/operation-context.js";
import { publicSceneResponse } from "../../domain/rules/scene-public.js";
import type { VillageRouteHandler } from "./route-support.js";
import type { FastifyInstance } from "fastify";
import { activationScope } from "../engine/activation-scope.js";

export function publicSceneRoutes(engine: FastifyInstance): FastifyInstance {
  const owner = activationScope();
  const surface = Object.create(engine) as FastifyInstance;
  for (const method of ["get", "post", "put", "patch", "delete"] as const) {
    const register = engine[method].bind(engine);
    const wrap = (handler: VillageRouteHandler): VillageRouteHandler => {
      const wrapped: VillageRouteHandler = async (request, reply) => {
        const result = await handler(request, reply);
        if (result && typeof result === "object") {
          const payload = result as Record<string, unknown>;
          for (const key of ["session", "visit"]) {
            const saved = payload[key] as Record<string, unknown> | undefined;
            if (saved) {
              const scene = publicSceneResponse(saved);
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
        }
        return result;
      };
      return owner ? owner.bind(wrapped) : wrapped;
    };
    surface[method] = ((path: string, options: unknown, handler?: VillageRouteHandler) =>
      handler
        ? register(path, options as never, wrap(handler) as never)
        : register(path, wrap(options as VillageRouteHandler) as never)) as (typeof engine)[typeof method];
  }
  return surface;
}
