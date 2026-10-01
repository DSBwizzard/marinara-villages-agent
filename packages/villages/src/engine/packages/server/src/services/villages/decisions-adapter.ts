import { readFile, realpath } from "node:fs/promises";
import { dirname, join, basename } from "node:path";
import { pathToFileURL } from "node:url";

/** Audited runtime imports: never bundle Engine implementations into Villages. */
export const DECISION_ENGINE_MODULES = [
  "services/decision/decision-default.js",
  "services/storage/connections.storage.js",
  "services/storage/app-settings.storage.js",
] as const;
export const TESTED_DECISION_ENGINE_BUILDS = ["ead04150a132"] as const;
export type EngineDecisionBackend = {
  model?: string;
  maxStateTokens: number;
  calibration: { defaultThreshold: number; questionShape?: string };
  deferPreGeneration: boolean;
  ask(state: unknown, questions: { id: string; instructions: string }[]): Promise<Map<string, number> | null>;
};
type ModuleSet = {
  resolveDecisionBackend: (
    dependencies: Record<string, unknown>,
    signal?: AbortSignal,
  ) => Promise<EngineDecisionBackend | null>;
  DECISION_SETTINGS_KEYS: { localDefault: string; thinkingPreGeneration: string };
  createConnectionsStorage: (db: unknown) => {
    getDefaultForDecision(): Promise<unknown>;
    getWithKey(id: string): Promise<unknown>;
  };
  createAppSettingsStorage: (db: unknown) => { get(key: string): Promise<string | null> };
};
export type DecisionAdapterStatus = { available: boolean; reason: string; engineBuild: string | null };
let database: unknown;
let entry = "";
let modules: Promise<ModuleSet> | undefined;
let build: string | null = null;
let failure = "Engine Decisions adapter has not been configured";

/** Only activation supplies the live Engine DB; no client can select paths or credentials. */
export function configureDecisionsAdapter(context: { app?: { db?: unknown } }, serverEntry = process.argv[1] ?? "") {
  database = context.app?.db;
  entry = serverEntry;
  modules = undefined;
  build = null;
  failure = database ? "" : "This Engine did not provide its live database";
  return () => {
    database = undefined;
    modules = undefined;
    entry = "";
    build = null;
    failure = "Villages is inactive";
  };
}

export async function loadDecisionEngineModules(serverEntry: string): Promise<ModuleSet & { engineBuild: string }> {
  const main = await realpath(serverEntry);
  const dist = dirname(main);
  if (basename(main) !== "index.js" || basename(dist) !== "dist") throw new Error("Unsupported Engine server layout");
  const manifest = JSON.parse(await readFile(join(dirname(dist), "package.json"), "utf8"));
  if (manifest.name !== "@marinara-engine/server" || manifest.type !== "module")
    throw new Error("Unverified Engine server identity");
  const metadata = JSON.parse(await readFile(join(dist, "config/build-meta.json"), "utf8"));
  if (!TESTED_DECISION_ENGINE_BUILDS.some((commit) => commit === metadata.commit))
    throw new Error("This Engine build has not been tested with Villages Decisions");
  const urls = await Promise.all(
    DECISION_ENGINE_MODULES.map(async (relative) => pathToFileURL(await realpath(join(dist, relative))).href),
  );
  // Canonical URLs share the running server's ESM instances, including its queues and sidecars.
  const [decisions, connections, settings] = await Promise.all(urls.map((url) => import(url)));
  if (
    typeof decisions.resolveDecisionBackend !== "function" ||
    typeof decisions.DECISION_SETTINGS_KEYS?.localDefault !== "string" ||
    typeof decisions.DECISION_SETTINGS_KEYS?.thinkingPreGeneration !== "string" ||
    typeof connections.createConnectionsStorage !== "function" ||
    typeof settings.createAppSettingsStorage !== "function"
  )
    throw new Error("Incompatible Engine Decisions contract");
  return {
    resolveDecisionBackend: decisions.resolveDecisionBackend,
    DECISION_SETTINGS_KEYS: decisions.DECISION_SETTINGS_KEYS,
    createConnectionsStorage: connections.createConnectionsStorage,
    createAppSettingsStorage: settings.createAppSettingsStorage,
    engineBuild: metadata.commit,
  };
}

async function prepare(): Promise<ModuleSet> {
  if (!database) throw new Error(failure);
  modules ??= loadDecisionEngineModules(entry).then((loaded) => {
    build = loaded.engineBuild;
    return loaded;
  });
  return modules;
}
export async function decisionAdapterStatus(): Promise<DecisionAdapterStatus> {
  try {
    const loaded = await prepare();
    const settings = loaded.createAppSettingsStorage(database);
    const connections = loaded.createConnectionsStorage(database);
    const selected = await settings.get(loaded.DECISION_SETTINGS_KEYS.localDefault);
    const configured = !!selected || !!(await connections.getDefaultForDecision());
    return {
      available: configured,
      reason: configured ? "" : "No Engine Decision model is selected",
      engineBuild: build,
    };
  } catch {
    return {
      available: false,
      reason: "Engine Decisions integration is unavailable or incompatible",
      engineBuild: build,
    };
  }
}
export async function resolveVillagesDecisionBackend(signal: AbortSignal): Promise<EngineDecisionBackend | null> {
  const loaded = await prepare();
  const settings = loaded.createAppSettingsStorage(database);
  const connections = loaded.createConnectionsStorage(database);
  return loaded.resolveDecisionBackend(
    {
      getLocalDefault: () => settings.get(loaded.DECISION_SETTINGS_KEYS.localDefault),
      getThinkingPreGeneration: async () =>
        (await settings.get(loaded.DECISION_SETTINGS_KEYS.thinkingPreGeneration)) === "true",
      getDefaultConnection: () => connections.getDefaultForDecision(),
      getConnectionWithKey: (id: string) => connections.getWithKey(id),
      debugMode: false,
    },
    signal,
  );
}
