import type { VillagePersona, VillagePersonaEntry, VillagePersonaPreview } from "../../domain/models/world.js";
import { badRequest } from "../../domain/rules/errors.js";
import {
  boundText,
  MAX_PLAYER_PERSONA_ID_LENGTH,
  MAX_PLAYER_PERSONA_IDENTITY_LENGTH,
  MAX_PLAYER_PERSONA_NAME_LENGTH,
} from "../../domain/rules/prompt-preset.js";

export interface PersonaQueryPorts {
  findPlayerPersona(id: string): Promise<VillagePersona | null>;
  listPlayerPersonas(): Promise<VillagePersona[]>;
}

/** Persona projections retain only their injected catalog connection. */
export function createPersonaQueries({ findPlayerPersona, listPlayerPersonas }: PersonaQueryPorts) {
  async function readLinkedPersona(personaId: unknown): Promise<{ id: string; name: string; identity: string }> {
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

  /**
   * Every Persona the player could be, for the picker.
   *
   * Narrowed to what a chooser needs: the full identity text is what a villager
   * is told, and sending a library's worth of it down to fill a card strip would
   * be paying for prose nobody reads on the way.
   */
  async function buildVillagePersonaCatalog(): Promise<VillagePersonaEntry[]> {
    const personas = await listPlayerPersonas();
    return personas.map((persona) => ({
      id: persona.id,
      name: persona.name,
      summary: persona.summary,
      isActive: persona.isActive,
      avatarPath: persona.avatarPath,
      avatarCrop: persona.avatarCrop,
    }));
  }

  /** Read only the chosen Persona's authored fields for the Founding preview. */
  async function readVillagePersonaPreview(personaId: string): Promise<VillagePersonaPreview | null> {
    const persona = await findPlayerPersona(personaId);
    // Some Engine readers return the first library record for an unknown id.
    if (!persona || persona.id !== personaId) return null;
    return {
      id: persona.id,
      name: persona.name,
      description: persona.description,
      appearance: persona.appearance,
      personality: persona.personality,
      backstory: persona.backstory,
      avatarPath: persona.avatarPath,
      avatarCrop: persona.avatarCrop,
    };
  }

  return { readLinkedPersona, buildVillagePersonaCatalog, readVillagePersonaPreview };
}
export type PersonaQueries = ReturnType<typeof createPersonaQueries>;
