import { bindActivationService, createActivationBinding } from "../../adapters/engine/activation-scope.js";
import type { PersonaCache } from "./persona-cache-service.js";
export type { PersonaCache } from "./persona-cache-service.js";
const binding = createActivationBinding<PersonaCache>("Persona cache is not configured.");
export function configurePersonaCache(service: PersonaCache): () => void {
  return binding.configure(bindActivationService(service));
}
export async function refreshPlayerPersona(...args: Parameters<PersonaCache["refreshPlayerPersona"]>) {
  return binding.get().refreshPlayerPersona(...args);
}
