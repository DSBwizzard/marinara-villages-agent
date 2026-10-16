import { bindActivationService, createActivationBinding } from "../../adapters/engine/activation-scope.js";
import type { ResidentSignatures } from "./resident-signature-service.js";
export type { ResidentSignatures } from "./resident-signature-service.js";
export { signaturePrompt } from "../../domain/rules/resident-signature-prompt.js";
const binding = createActivationBinding<ResidentSignatures>("Resident signatures are not configured.");
export function configureResidentSignatures(service: ResidentSignatures): () => void {
  return binding.configure(bindActivationService(service));
}
export function residentSignatures(): ResidentSignatures {
  return binding.get();
}
export async function readResidentSignature(...args: Parameters<ResidentSignatures["readResidentSignature"]>) {
  return residentSignatures().readResidentSignature(...args);
}
export async function generateResidentSignature(...args: Parameters<ResidentSignatures["generateResidentSignature"]>) {
  return residentSignatures().generateResidentSignature(...args);
}
