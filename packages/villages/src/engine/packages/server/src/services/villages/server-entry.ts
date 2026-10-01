// The route registration and refresh timer share one teardown path so a failed
// activation or uninstall cannot leave either running.
import type { CapabilityRuntimeHost } from "@marinara-engine/shared";
import type { FastifyPluginAsync } from "fastify";
import { villagesRoutes } from "../../routes/villages.routes.js";
import { startBackgroundWork } from "./background-work.js";
import { readRuntimeDebug } from "./runtime-debug.js";
import { configureVillagesRuntime, villagesLogger } from "./package-runtime.js";
import { configureDecisionsAdapter } from "./decisions-adapter.js";
import { stopInterpretationComparisons } from "./interpretation-diagnostics.js";
import { startVillageRefreshScheduler } from "./village-refresh-scheduler.js";
import { readVillageState } from "./village-store.js";
import { stopVenueCoordinator } from "./venue-coordinator.js";
import { startProgressRecovery, recoverVenueSceneWork } from "./venue-session.js";

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
    const { startPrivateSpacePreparation } = await import("./private-space-preparation.js");
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
