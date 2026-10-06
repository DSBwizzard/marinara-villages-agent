import { villagesLogger } from "../../adapters/engine/runtime-host.js";
import { fail, type VillageRouteHandler } from "../../adapters/http/route-support.js";
import { badRequest } from "../../domain/rules/errors.js";
import { publicSceneResponse } from "../../domain/rules/scene-public.js";
import { readVillageSceneLock } from "./spinoff.js";
import type { FastifyInstance } from "fastify";

const SCENE_EXIT_PATHS: string[] = [
  // Opening a scene for a villager, or forgetting the link to one.
  "/villagers/:characterId/scene",
  // Reading a scene back into the village, which is how one ends.
  "/villagers/:characterId/scene/end",
];
function sceneLockMessage(name: string): string {
  const who = name.length > 0 ? name : "A villager";
  return `${who} is away in a scene. Bring them home before doing anything else in the village.`;
}
function lockFirst(handler: VillageRouteHandler): VillageRouteHandler {
  return async (request, reply) => {
    try {
      const lock = await readVillageSceneLock();
      if (lock) return fail(reply, badRequest(sceneLockMessage(lock.name)), "a locked village");
    } catch (error) {
      villagesLogger().warn("[villages] could not read the scene lock: %s", String(error));
    }
    return handler(request, reply);
  };
}
export function sceneLockedRoutes(engine: FastifyInstance): FastifyInstance {
  const raw = engine as unknown as Record<string, (path: string, ...rest: unknown[]) => unknown>;
  // ponytail: this surface carries the five route methods and nothing else, which
  // is exactly what the host gives a package and all this file uses. `engine` stays
  // in scope for the one thing a route cannot express — `addContentTypeParser`, if a
  // route ever needs a body type the host does not already parse — so reaching for
  // it there would be a decision rather than an accident.
  const register = (method: "get" | "post" | "put" | "patch" | "delete") => {
    const target = raw[method];
    return (path: string, optionsOrHandler: unknown, handler?: unknown) => {
      // Two shapes, both used in this file: `(path, handler)`, and
      // `(path, options, handler)` where `PATCH /settings` states its own body
      // limit. Restated here rather than imported because the host's own
      // normalisation is not exported.
      const supplied = (typeof optionsOrHandler === "function" ? optionsOrHandler : handler) as VillageRouteHandler;
      const projected: VillageRouteHandler = async (request, reply) => {
        const result = await supplied(request, reply);
        return result === reply ? result : publicSceneResponse(result);
      };
      const locked = method === "get" || SCENE_EXIT_PATHS.includes(path) ? projected : lockFirst(projected);
      const options = typeof optionsOrHandler === "object" && optionsOrHandler !== null ? optionsOrHandler : undefined;
      // Called with `engine` as the receiver rather than as a bare function: the
      // host's collector does not care, but the tests hand over a real Fastify
      // instance, and a real Fastify instance needs its own `this`.
      if (options === undefined) target.call(engine, path, locked);
      else target.call(engine, path, options, locked);
    };
  };
  return {
    delete: register("delete"),
    get: register("get"),
    patch: register("patch"),
    post: register("post"),
    put: register("put"),
  } as unknown as FastifyInstance;
}
