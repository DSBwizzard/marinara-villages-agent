import { pipelineStorage } from "../observability/metrics-context.js";
import type {
  CapabilityDocumentStore,
  CapabilityPersistenceHost,
  CapabilityResourceHost,
  CapabilityRuntimeHost,
  CapabilityRuntimeLogger,
} from "@marinara-engine/shared";

export const VILLAGES_PACKAGE_ID = "villages";
let host: CapabilityRuntimeHost | null = null;
let registration = 0;
export function villagesRuntimeEpoch(): number | null {
  return host ? registration : null;
}
const measuredDocuments = new WeakMap<CapabilityDocumentStore, CapabilityDocumentStore>();
export function configureRuntimeHost(next: CapabilityRuntimeHost): () => void {
  const token = ++registration;
  host = next;

  return () => {
    if (registration === token) host = null;
  };
}
export function requireHost(): CapabilityRuntimeHost {
  if (!host) throw new Error("The Villages package runtime is not configured.");
  return host;
}
export function villagesDocuments(): CapabilityDocumentStore {
  const documents = requireHost().persistence?.documents;
  if (!documents) {
    throw new Error(
      "This Engine version did not provide the package document store, so Villages cannot remember anything.",
    );
  }
  let measured = measuredDocuments.get(documents);
  if (!measured) {
    measured = new Proxy(documents, {
      get(target, key) {
        const value = Reflect.get(target, key);
        if (typeof value !== "function") return value;
        return (...args: unknown[]) => {
          if (key === "getById" || key === "list") pipelineStorage("reads");
          if (key === "create" || key === "update") pipelineStorage("writes");
          return value.apply(target, args);
        };
      },
    });
    measuredDocuments.set(documents, measured);
  }
  return measured;
}
export function villagesResources(): CapabilityResourceHost {
  const resources = requireHost().resources;
  if (!resources) {
    throw new Error("This Engine version did not provide the character library to packages.");
  }
  return resources;
}
export function villagesPersistence(): CapabilityPersistenceHost {
  const persistence = requireHost().persistence;
  if (!persistence) {
    throw new Error("This Engine version did not provide chat persistence to packages.");
  }
  return persistence;
}
const fallbackLogger: CapabilityRuntimeLogger = {
  debug: (message, ...args) => console.debug(message, ...args),
  info: (message, ...args) => console.info(message, ...args),
  warn: (message, ...args) => console.warn(message, ...args),
  error: (error, message, ...args) => console.error(message, ...args, error),
  debugOverride: (enabled, message, ...args) => {
    if (enabled) console.debug(message, ...args);
  },
};
export function villagesLogger(): CapabilityRuntimeLogger {
  const target = host?.logger ?? fallbackLogger;
  return {
    debug: (...args) => {
      try {
        target.debug(...args);
      } catch {
        /* logging is best effort */
      }
    },
    info: (...args) => {
      try {
        target.info(...args);
      } catch {
        /* logging is best effort */
      }
    },
    warn: (...args) => {
      try {
        target.warn(...args);
      } catch {
        /* logging is best effort */
      }
    },
    error: (...args) => {
      try {
        target.error(...args);
      } catch {
        /* logging is best effort */
      }
    },
    debugOverride: (...args) => {
      try {
        target.debugOverride(...args);
      } catch {
        /* logging is best effort */
      }
    },
  };
}
export function villagesDebugAgentsEnabled(): boolean {
  return requireHost().isDebugAgentsEnabled() === true;
}
