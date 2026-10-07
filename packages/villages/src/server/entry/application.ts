import { configureDecisionsAdapter } from "../adapters/engine/decisions-adapter.js";
import {
  bindActivationService,
  createActivationScope,
  type ActivationScope,
} from "../adapters/engine/activation-scope.js";
import { villagesLogger } from "../adapters/engine/runtime-host.js";
import { readRuntimeDebug } from "../adapters/observability/runtime-debug.js";
import { stopInterpretationComparisons } from "../features/generation/interpretation-diagnostics.js";
import { recoverVenueSceneWork, startProgressRecovery } from "../features/scenes/venue-session.js";
import { readVillageState } from "../features/world/village-store.js";
import { startBackgroundWork } from "../jobs/background-work.js";
import { startTownMapGeneration } from "../jobs/town-map-generation.js";
import { stopVenueCoordinator } from "../jobs/venue-coordinator.js";
import { startVillageRefreshScheduler } from "../jobs/village-refresh-scheduler.js";
import { villagesRoutes } from "./routes.js";
import { configureVillagesRuntime } from "./runtime.js";
import type { CapabilityRuntimeHost } from "@marinara-engine/shared";
import type { FastifyPluginAsync } from "fastify";

export type ActivationContext = {
  app?: { db?: unknown };
  api: {
    runtime: CapabilityRuntimeHost;
    registerPrivilegedRoutes(
      routes: FastifyPluginAsync,
      options: { prefix: string },
    ): Promise<() => void | Promise<void>>;
  };
};

type Cleanup = () => void | Promise<void>;
/** Assembly ports keep lifecycle tests independent of Engine and providers. */
export interface ApplicationServices {
  configureRuntime(runtime: CapabilityRuntimeHost): Cleanup;
  startTownMapGeneration(): Cleanup;
  configureDecisions(context: { app?: { db?: unknown } }): Cleanup;
  stopInterpretationComparisons: Cleanup;
  readRuntimeDebug(): Promise<unknown>;
  warnRuntimeDebug(error: unknown): void;
  recoverVenueSceneWork(): Promise<unknown>;
  stopVenueCoordinator: Cleanup;
  routes: FastifyPluginAsync;
  startBackgroundWork(): Cleanup;
  startRefreshScheduler(): Cleanup;
  startProgressRecovery(): Cleanup;
  startPrivateSpacePreparation(): Promise<Cleanup>;
  readVillageState(): Promise<unknown>;
}
const applicationServices: ApplicationServices = {
  configureRuntime: configureVillagesRuntime,
  startTownMapGeneration,
  configureDecisions: configureDecisionsAdapter,
  stopInterpretationComparisons,
  readRuntimeDebug,
  warnRuntimeDebug(error) {
    villagesLogger().warn("[villages] runtime logging settings could not be read: %s", String(error));
  },
  recoverVenueSceneWork,
  stopVenueCoordinator,
  routes: villagesRoutes,
  startBackgroundWork,
  startRefreshScheduler: startVillageRefreshScheduler,
  startProgressRecovery,
  async startPrivateSpacePreparation() {
    const { startPrivateSpacePreparation } = await import("../jobs/private-space-preparation.js");
    return startPrivateSpacePreparation();
  },
  readVillageState,
};
/** An activation owns its registrations and job cleanup in their existing order. */
export async function startVillagesApplication(
  context: ActivationContext,
  services: ApplicationServices = applicationServices,
) {
  if (services !== applicationServices) return assembleApplication(context, services);
  const scope = createActivationScope();
  return scope.run(() => assembleApplication(context, { ...services, routes: scope.bind(services.routes) }, scope));
}

async function assembleApplication(
  { api, app }: ActivationContext,
  services: ApplicationServices,
  scope?: ActivationScope,
) {
  const cleanups: Cleanup[] = [];
  let stopping: Promise<void> | undefined;
  const unwind = () => {
    // Memoize before calling any disposer, including a synchronous one.
    stopping ??= Promise.resolve().then(async () => {
      const failures: unknown[] = [];
      try {
        while (cleanups.length) {
          const cleanup = cleanups.pop()!;
          try {
            await cleanup();
          } catch (error) {
            failures.push(error);
          }
        }
      } finally {
        scope?.dispose();
      }
      if (failures.length) throw new AggregateError(failures, "Villages cleanup failed");
    });
    return stopping;
  };
  try {
    cleanups.push(services.configureRuntime(api.runtime));
    cleanups.push(services.startTownMapGeneration());
    cleanups.push(services.configureDecisions({ app }));
    cleanups.push(services.stopInterpretationComparisons);
    await services.readRuntimeDebug().catch(services.warnRuntimeDebug);
    cleanups.push(services.stopVenueCoordinator);
    await services.recoverVenueSceneWork();
    cleanups.push(await api.registerPrivilegedRoutes(services.routes, { prefix: "/api/villages" }));
    // Started only once the routes are up, so a package that failed to activate
    // never leaves a timer behind pointing at a village nobody can reach.
    cleanups.push(services.startBackgroundWork());
    cleanups.push(services.startRefreshScheduler());
    cleanups.push(services.startProgressRecovery());
    cleanups.push(await services.startPrivateSpacePreparation());
  } catch (error) {
    // Never leave a half-wired package holding a runtime slot.
    try {
      await unwind();
    } catch (cleanupError) {
      throw new AggregateError(
        [error, ...(cleanupError instanceof AggregateError ? cleanupError.errors : [cleanupError])],
        "Villages activation and cleanup failed",
        { cause: error },
      );
    }
    throw error;
  }
  const application = {
    stop: unwind,
    async selfCheck() {
      await services.readVillageState();
    },
  };
  return scope ? bindActivationService(application) : application;
}
