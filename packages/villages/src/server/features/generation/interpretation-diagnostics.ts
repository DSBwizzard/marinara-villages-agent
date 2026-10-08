import {
  activationScope,
  bindActivationService,
  createActivationBinding,
} from "../../adapters/engine/activation-scope.js";
import { villagesDocuments } from "../../adapters/engine/runtime-host.js";
import { outsideVenueOperation } from "../../adapters/operations/operation-context.js";
import { mutateDocument } from "../../adapters/storage/document-store.js";
import { systemInterpretations } from "./system-interpretation.js";
import {
  createInterpretationDiagnostics,
  type InterpretationDiagnostics,
  type Diagnostics,
} from "./interpretation-diagnostics-service.js";
import type { InterpretationBatch, InterpretationTrace } from "../../domain/models/interpretation-model.js";
const binding = createActivationBinding<InterpretationDiagnostics>(
  "Villages interpretation diagnostics are not configured.",
);
const standalone = createInterpretationDiagnostics({
  villagesDocuments,
  outsideVenueOperation,
  mutateDocument,
  systemInterpretations,
});
function selected(): InterpretationDiagnostics {
  if (activationScope()) return binding.get();
  return binding.maybe() ?? standalone;
}
export function configureInterpretationDiagnostics(service: InterpretationDiagnostics): () => void {
  return binding.configure(bindActivationService(service));
}
export async function readInterpretationDiagnostics(sceneId: string): Promise<Diagnostics> {
  return selected().readInterpretationDiagnostics(sceneId);
}
export async function writeInterpretationDiagnostics(sceneId: string, traces: InterpretationTrace[]) {
  return selected().writeInterpretationDiagnostics(sceneId, traces);
}
export async function removeInterpretationDiagnostics(sceneId: string) {
  return selected().removeInterpretationDiagnostics(sceneId);
}
export function stopInterpretationComparisons(sceneId?: string) {
  return selected().stopInterpretationComparisons(sceneId);
}
export function scheduleSystemComparisons(sceneId: string, batch: InterpretationBatch): void {
  return selected().scheduleSystemComparisons(sceneId, batch);
}
