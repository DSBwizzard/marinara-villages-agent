import { bindActivationService, createActivationBinding } from "../../adapters/engine/activation-scope.js";
import type { PersonaQueries } from "./persona-service.js";
export type { PersonaQueries } from "./persona-service.js";
const binding = createActivationBinding<PersonaQueries>("Persona queries are not configured.");
export function configurePersonaQueries(service: PersonaQueries): () => void {
  return binding.configure(bindActivationService(service));
}
export function personaQueries(): PersonaQueries {
  return binding.get();
}
export async function readLinkedPersona(...args: Parameters<PersonaQueries["readLinkedPersona"]>) {
  return personaQueries().readLinkedPersona(...args);
}
export async function buildVillagePersonaCatalog(...args: Parameters<PersonaQueries["buildVillagePersonaCatalog"]>) {
  return personaQueries().buildVillagePersonaCatalog(...args);
}
export async function readVillagePersonaPreview(...args: Parameters<PersonaQueries["readVillagePersonaPreview"]>) {
  return personaQueries().readVillagePersonaPreview(...args);
}
