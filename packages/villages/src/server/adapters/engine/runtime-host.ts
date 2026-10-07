import { createActivationBinding } from "./activation-scope.js";
import { pipelineStorage } from "../observability/metrics-context.js";
import type {
  CapabilityDocumentStore,
  CapabilityPersistenceHost,
  CapabilityResourceHost,
  CapabilityRuntimeHost,
  CapabilityRuntimeLogger,
} from "@marinara-engine/shared";

export const VILLAGES_PACKAGE_ID = "villages";
let registration = 0;
const measuredDocuments = new WeakMap<CapabilityDocumentStore, CapabilityDocumentStore>();
const fallbackLogger: CapabilityRuntimeLogger = {
  debug: (message, ...args) => console.debug(message, ...args),
  info: (message, ...args) => console.info(message, ...args),
  warn: (message, ...args) => console.warn(message, ...args),
  error: (error, message, ...args) => console.error(message, ...args, error),
  debugOverride: (enabled, message, ...args) => {
    if (enabled) console.debug(message, ...args);
  },
};
function safeLogger(target: CapabilityRuntimeLogger): CapabilityRuntimeLogger {
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

/** Captures one host and epoch; construction starts no timers, requests or writes. */
export function createRuntimeConnections(next: CapabilityRuntimeHost) {
  const token = ++registration;
  let active = true;
  function requireHost(): CapabilityRuntimeHost {
    if (!active) throw new Error("The Villages package runtime is not configured.");
    return next;
  }
  function villagesDocuments(): CapabilityDocumentStore {
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
  function villagesResources(): CapabilityResourceHost {
    const resources = requireHost().resources;
    if (!resources) {
      throw new Error("This Engine version did not provide the character library to packages.");
    }
    return resources;
  }
  function villagesPersistence(): CapabilityPersistenceHost {
    const persistence = requireHost().persistence;
    if (!persistence) {
      throw new Error("This Engine version did not provide chat persistence to packages.");
    }
    return persistence;
  }

  function villagesLogger(): CapabilityRuntimeLogger {
    return safeLogger(next.logger ?? fallbackLogger);
  }
  function villagesDebugAgentsEnabled(): boolean {
    return requireHost().isDebugAgentsEnabled() === true;
  }
  return {
    requireHost,
    villagesDocuments,
    villagesResources,
    villagesPersistence,
    villagesLogger,
    villagesDebugAgentsEnabled,
    epoch: () => (active ? token : null),
    dispose: () => {
      active = false;
    },
  };
}
export type RuntimeConnections = ReturnType<typeof createRuntimeConnections>;
const connections = createActivationBinding<RuntimeConnections>("The Villages package runtime is not configured.");
export function configureRuntimeHost(next: CapabilityRuntimeHost): () => void {
  const runtime = createRuntimeConnections(next);
  const release = connections.configure(runtime);
  return () => {
    runtime.dispose();
    release();
  };
}
export function villagesRuntimeEpoch(): number | null {
  return connections.maybe()?.epoch() ?? null;
}
export function requireHost(): CapabilityRuntimeHost {
  return connections.get().requireHost();
}
export function villagesDocuments(): CapabilityDocumentStore {
  return connections.get().villagesDocuments();
}
export function villagesResources(): CapabilityResourceHost {
  return connections.get().villagesResources();
}
export function villagesPersistence(): CapabilityPersistenceHost {
  return connections.get().villagesPersistence();
}
export function villagesLogger(): CapabilityRuntimeLogger {
  return connections.maybe()?.villagesLogger() ?? safeLogger(fallbackLogger);
}
export function villagesDebugAgentsEnabled(): boolean {
  return connections.get().villagesDebugAgentsEnabled();
}
