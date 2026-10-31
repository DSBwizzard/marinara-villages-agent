import type { FastifyInstance } from "fastify";
import { activationScope } from "../engine/activation-scope.js";
import { withRepairWork } from "../storage/repair-gate.js";
import { withVillageClockWork } from "../time/clock-gate.js";
import { fail, type VillageRouteHandler } from "./route-support.js";

export function publicSceneRoutes(
  engine: FastifyInstance,
  projectScene: (scene: Record<string, unknown>) => Promise<unknown>,
  guard?: (method: string, path: string, body: unknown) => Promise<string | null>,
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
          const result = await handler(request, reply);
          if (result && typeof result === "object") {
            const payload = result as Record<string, unknown>;
            for (const key of ["session", "visit"]) {
              const saved = payload[key] as Record<string, unknown> | undefined;
              if (saved) {
                try {
                  payload[key] = await projectScene(saved);
                } catch (error) {
                  return fail(reply, error, "reading Scene playback");
                }
              }
            }
          }
          return result;
        };
        return withRepairWork(() =>
          clockIndependentRoutes.includes(`${method} ${path}`) ? work() : withVillageClockWork(work),
        );
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
