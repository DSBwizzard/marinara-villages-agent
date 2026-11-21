import { asRecord } from "../../domain/rules/coerce.js";
import { badRequest } from "../../domain/rules/errors.js";
import type { VillageNarrationStyle } from "../../domain/rules/narration-style.js";
import type { mutateVillageState, readVillageState } from "../world/village-store.js";

/** The active venue's per-village writing controls. Old preset documents are not read here. */
export type VillageWritingView = VillageNarrationStyle;

export interface VillageWritingPorts {
  readVillageState: typeof readVillageState;
  mutateVillageState: typeof mutateVillageState;
}

/** Current settings composition owns explicit ports; construction starts no work. */
export function createVillageWriting({ readVillageState, mutateVillageState }: VillageWritingPorts) {
  async function readVillageWriting(): Promise<VillageWritingView> {
    const style = (await readVillageState()).narrationStyle;
    return {
      tense: style.tense,
      person: style.person,
      rating: style.rating,
    };
  }

  async function saveVillageWriting(body: unknown): Promise<void> {
    const patch = asRecord(body);
    const accepted: Partial<VillageNarrationStyle> = {};
    if (patch.tense !== undefined) {
      if (patch.tense !== "present" && patch.tense !== "past") throw badRequest("Choose present or past tense.");
      accepted.tense = patch.tense;
    }
    if (patch.person !== undefined) {
      if (patch.person !== "first" && patch.person !== "second" && patch.person !== "third")
        throw badRequest("Choose first, second, or third person.");
      accepted.person = patch.person;
    }
    if (patch.rating !== undefined) {
      if (patch.rating !== "sfw" && patch.rating !== "nsfw") throw badRequest("Choose SFW or NSFW.");
      accepted.rating = patch.rating;
    }
    if (Object.keys(accepted).length === 0) throw badRequest("No writing setting was supplied.");
    await mutateVillageState((state) => {
      Object.assign(state.narrationStyle, accepted);
    });
  }

  return { readVillageWriting, saveVillageWriting };
}

export type VillageWriting = ReturnType<typeof createVillageWriting>;
