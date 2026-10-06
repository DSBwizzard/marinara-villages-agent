import { configureDecisionsAdapter } from "../adapters/engine/decisions-adapter.js";
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

// The route registration and refresh timer share one teardown path so a failed
// activation or uninstall cannot leave either running.

type ActivationContext = {
  app?: { db?: unknown };
  api: {
    runtime: CapabilityRuntimeHost;
    registerPrivilegedRoutes(
      routes: FastifyPluginAsync,
      options: { prefix: string },
    ): Promise<() => void | Promise<void>>;
  };
};

let active = false;

export async function activate({ api, app }: ActivationContext) {
  const cleanups: Array<() => void | Promise<void>> = [
    configureVillagesRuntime(api.runtime),
    startTownMapGeneration(),
    configureDecisionsAdapter({ app }),
    stopInterpretationComparisons,
  ];
  const unwind = async () => {
    for (const cleanup of cleanups.reverse()) await cleanup();
  };
  try {
    await readRuntimeDebug().catch((error) =>
      villagesLogger().warn("[villages] runtime logging settings could not be read: %s", String(error)),
    );
    await recoverVenueSceneWork();
    cleanups.push(stopVenueCoordinator);
    cleanups.push(await api.registerPrivilegedRoutes(villagesRoutes, { prefix: "/api/villages" }));
    // Started only once the routes are up, so a package that failed to activate
    // never leaves a timer behind pointing at a village nobody can reach.
    cleanups.push(startBackgroundWork());
    cleanups.push(startVillageRefreshScheduler());
    cleanups.push(startProgressRecovery());
    const { startPrivateSpacePreparation } = await import("../jobs/private-space-preparation.js");
    cleanups.push(startPrivateSpacePreparation());
    active = true;
  } catch (error) {
    // Never leave a half-wired package holding a runtime slot.
    await unwind();
    throw error;
  }
  return async () => {
    active = false;
    await unwind();
  };
}

export async function selfCheck() {
  if (!active) throw new Error("Villages routes did not activate");
  // Prove the document store is reachable. This only reads, and returns the
  // default village when nothing has been saved yet.
  await readVillageState();
}
