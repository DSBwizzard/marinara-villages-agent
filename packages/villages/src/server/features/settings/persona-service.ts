import { findPlayerPersona } from "../../adapters/engine/catalog.js";
import { badRequest } from "../../domain/rules/errors.js";
import {
  boundText,
  MAX_PLAYER_PERSONA_ID_LENGTH,
  MAX_PLAYER_PERSONA_IDENTITY_LENGTH,
  MAX_PLAYER_PERSONA_NAME_LENGTH,
} from "../../domain/rules/prompt-preset.js";

export async function readLinkedPersona(personaId: unknown): Promise<{ id: string; name: string; identity: string }> {
  if (typeof personaId !== "string") throw badRequest("Your Persona must be an id.");
  const id = boundText(personaId, MAX_PLAYER_PERSONA_ID_LENGTH);
  if (id.length === 0) throw badRequest("Choose a Persona — the village needs one to know who you are.");
  const persona = await findPlayerPersona(id);
  if (!persona) throw badRequest("That Persona is no longer in your library.");
  return {
    id,
    name: boundText(persona.name, MAX_PLAYER_PERSONA_NAME_LENGTH),
    identity: boundText(persona.identity, MAX_PLAYER_PERSONA_IDENTITY_LENGTH),
  };
}
