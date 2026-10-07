import type { VillageState, VillagePersona } from "../../domain/models/world.js";
import {
  boundText,
  MAX_PLAYER_PERSONA_NAME_LENGTH,
  MAX_PLAYER_PERSONA_IDENTITY_LENGTH,
} from "../../domain/rules/prompt-preset.js";
export interface PersonaCachePorts {
  readVillageState(): Promise<VillageState>;
  mutateVillageState(update: (state: VillageState) => void): Promise<VillageState>;
  findPlayerPersona(id: string): Promise<VillagePersona | null>;
}
/** Own the linked Persona cache's specific saved-world and library connections. */
export function createPersonaCache({ readVillageState, mutateVillageState, findPlayerPersona }: PersonaCachePorts) {
  /**
   * Bring the cached copy of the linked Persona up to date. Returns whether it
   * wrote.
   *
   * This is the only writer of the cache, and it is deliberately off the chat
   * path: the tab asks for it when the village tab opens and when its settings
   * open, and a send asks for nothing at all. Chat turns read the copy.
   *
   * The write is gated on a diff, and that diff is the part worth being careful
   * about. The candidate is built through the same caps the record is coerced
   * with, so the comparison is between two already-bounded strings. Comparing raw
   * resolved text against a bounded stored one would make a Persona whose prose
   * runs past the cap look changed on every single refresh, and re-write the
   * record forever.
   *
   * A Persona that has gone missing keeps its cached copy and only flips the flag.
   * A refresh is not the moment to forget who the player was.
   */
  async function refreshPlayerPersona(): Promise<boolean> {
    const village = await readVillageState();
    if (village.playerPersonaId.length === 0) return false;
    const persona = await findPlayerPersona(village.playerPersonaId);
    const next = {
      name: persona ? boundText(persona.name, MAX_PLAYER_PERSONA_NAME_LENGTH) : village.playerPersonaName,
      identity: persona
        ? boundText(persona.identity, MAX_PLAYER_PERSONA_IDENTITY_LENGTH)
        : village.playerPersonaIdentity,
      missing: persona === null,
    };
    const unchanged =
      next.name === village.playerPersonaName &&
      next.identity === village.playerPersonaIdentity &&
      next.missing === village.playerPersonaMissing;
    if (unchanged) return false;
    let wrote = false;
    await mutateVillageState((state) => {
      wrote = false;
      if (state.playerPersonaId !== village.playerPersonaId) return;
      // A missing source retains the live cache, including concurrent updates.
      const name = persona ? next.name : state.playerPersonaName;
      const identity = persona ? next.identity : state.playerPersonaIdentity;
      if (
        name === state.playerPersonaName &&
        identity === state.playerPersonaIdentity &&
        next.missing === state.playerPersonaMissing
      )
        return;
      state.playerPersonaName = name;
      state.playerPersonaIdentity = identity;
      state.playerPersonaMissing = next.missing;
      wrote = true;
    });
    return wrote;
  }
  return { refreshPlayerPersona };
}
export type PersonaCache = ReturnType<typeof createPersonaCache>;
