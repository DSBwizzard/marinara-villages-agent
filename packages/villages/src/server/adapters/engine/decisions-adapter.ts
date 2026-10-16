import { guardedClockGeneration } from "../time/clock-gate.js";
import type {
  CapabilityDecisionRequest,
  CapabilityDecisionResult,
  CapabilityRuntimeHost,
} from "@marinara-engine/shared";
import { activationScope, bindActivationService, createActivationBinding } from "./activation-scope.js";

export type DecisionAdapterStatus = { available: boolean; reason: string };

/** The capability, including its receiver and disposal fence, belongs to one activation. */
export function createDecisionsAdapter(runtime: CapabilityRuntimeHost) {
  const capability = runtime.decisions;
  let active = true;
  const assertActive = () => {
    if (!active) throw new Error("Villages is inactive");
  };
  async function status(): Promise<DecisionAdapterStatus> {
    const available = active && typeof capability?.evaluate === "function";
    return {
      available,
      reason: available ? "" : "This Engine does not expose the Decisions capability introduced in PR #7369",
    };
  }
  async function evaluate(request: CapabilityDecisionRequest): Promise<CapabilityDecisionResult | null> {
    assertActive();
    request.signal?.throwIfAborted();
    if (typeof capability?.evaluate !== "function") return null;
    const result = await guardedClockGeneration(() => capability.evaluate(request));
    assertActive();
    request.signal?.throwIfAborted();
    return result;
  }
  return {
    status,
    evaluate,
    dispose: () => {
      active = false;
    },
  };
}
export type DecisionsAdapter = ReturnType<typeof createDecisionsAdapter>;
const adapters = createActivationBinding<DecisionsAdapter>("Engine Decisions adapter has not been configured");

export function configureDecisionsAdapter(runtime: CapabilityRuntimeHost) {
  const adapter = createDecisionsAdapter(runtime);
  adapters.configure(bindActivationService(adapter));
  return adapter.dispose;
}
export async function decisionAdapterStatus(): Promise<DecisionAdapterStatus> {
  return adapters.maybe()?.status() ?? { available: false, reason: "Engine Decisions capability is unavailable" };
}
export async function evaluateVillagesDecisions(request: CapabilityDecisionRequest) {
  const adapter = adapters.maybe();
  if (!adapter)
    throw new Error(
      activationScope()?.active === false ? "Villages is inactive" : "Engine Decisions adapter has not been configured",
    );
  return adapter.evaluate(request);
}
