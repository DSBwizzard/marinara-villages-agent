import { withVillageClockWork } from "../time/clock-gate.js";
import { operationSummary } from "../operations/operation-context.js";
import { publicSceneResponse } from "../../domain/rules/scene-public.js";
import type { VillageRouteHandler } from "./route-support.js";
import type { FastifyInstance } from "fastify";
import { activationScope } from "../engine/activation-scope.js";

export function publicSceneRoutes(
  engine: FastifyInstance,
  guard?: (method: string, path: string, body: unknown) => Promise<string | null>,
  present?: (request: Parameters<VillageRouteHandler>[0], result: unknown) => Promise<unknown>,
  clockIndependentRoutes: readonly string[] = [],
): FastifyInstance {
  const owner = activationScope();
  const surface = Object.create(engine) as FastifyInstance;
  for (const method of ["get", "post", "put", "patch", "delete"] as const) {
    const register = engine[method].bind(engine);
    const wrap = (handler: VillageRouteHandler, path: string): VillageRouteHandler => {
      const wrapped: VillageRouteHandler = async (request, reply) => {
        const work = async () => {
          const blocked = await guard?.(method, path, request.body);
          if (blocked) return reply.code(409).send({ error: blocked });
          return handler(request, reply);
        };
        let result = await (clockIndependentRoutes.includes(`${method} ${path}`) ? work() : withVillageClockWork(work));
        if (present) result = await present(request, result);
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
                  saved.operation as import("../../domain/models/operation-model.js").VenueOperation | undefined,
                  saved.rejectedSubmissions as import("../../domain/models/scene-model.js").VenueScene["rejectedSubmissions"],
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
        ? register(path, options as never, wrap(handler, path) as never)
        : register(path, wrap(options as VillageRouteHandler, path) as never)) as (typeof engine)[typeof method];
  }
  return surface;
}
