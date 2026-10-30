import { readWorldName } from "../../../shared/helpers/resident-admission.js";
import { readSceneryStyleProfileId } from "../../domain/rules/image-style-profiles.js";
import type { VillageSnapshot, VillageState, VillageBackgroundPace } from "../../domain/models/world.js";
import { badRequest } from "../../domain/rules/errors.js";
import { readLoreTokenBudget, readSelectedLorebookIds } from "../../domain/rules/lore-policy.js";
import { remapVenues } from "../../domain/rules/prompt-preset.js";
import { readSceneryStyle } from "../../domain/rules/scenery-context.js";
import { readBool } from "../../domain/rules/village-projections.js";
import { readPromptBox, readVillageName, readVillageSetting } from "../../domain/rules/world-input.js";

export interface VillageSettingsPorts {
  mutateVillageState(update: (state: VillageState) => void): Promise<VillageState>;
  buildVillageSnapshot(): Promise<VillageSnapshot>;
  readLinkedPersona(id: unknown): Promise<{ id: string; name: string; identity: string }>;
  runVillageBootstrap(): Promise<VillageSnapshot>;
  villagesLogger(): { warn(message: string, ...args: unknown[]): void };
  activityChanged?: () => void;
}

/** Settings retain only their injected coordination ports; construction starts no work. */
export function createVillageSettings({
  mutateVillageState,
  buildVillageSnapshot,
  readLinkedPersona,
  runVillageBootstrap,
  villagesLogger,
  activityChanged,
}: VillageSettingsPorts) {
  /** Store the box: what a villager in this village knows. */
  async function setVillagePromptKnowledge(value: unknown): Promise<VillageSnapshot> {
    const text = readPromptBox(value, "The information villagers know");
    await mutateVillageState((state) => {
      state.promptKnowledge = text;
    });
    return buildVillageSnapshot();
  }

  async function setVillageLoreSettings(idsValue?: unknown, budgetValue?: unknown): Promise<VillageSnapshot> {
    const ids = idsValue === undefined ? undefined : readSelectedLorebookIds(idsValue);
    const budget = budgetValue === undefined ? undefined : readLoreTokenBudget(budgetValue);
    await mutateVillageState((state) => {
      if (ids) state.selectedLorebookIds = ids;
      if (budget !== undefined) state.loreTokenBudget = budget;
    });
    return buildVillageSnapshot();
  }

  /** Set the allowance for optional resident planning and new Wishes. */
  async function setVillageBackgroundPace(value: unknown): Promise<VillageSnapshot> {
    const paces: readonly VillageBackgroundPace[] = ["off", "quiet", "balanced", "lively"];
    if (typeof value !== "string" || !paces.includes(value as VillageBackgroundPace)) {
      throw badRequest("Choose Off, Quiet, Average or Busy for Pace.");
    }
    await mutateVillageState((state) => {
      state.backgroundPace = value as VillageBackgroundPace;
    });
    activityChanged?.();
    return buildVillageSnapshot();
  }

  async function setVillageNarrativeConsequence(value: unknown): Promise<VillageSnapshot> {
    if (typeof value !== "string" || !["gentle", "moderate", "dramatic"].includes(value))
      throw badRequest("Choose Gentle, Moderate or Dramatic for Consequence.");
    await mutateVillageState((state) => {
      state.narrativeConsequence = value as "gentle" | "moderate" | "dramatic";
    });
    activityChanged?.();
    return buildVillageSnapshot();
  }

  async function setVillageSpriteCardFlipEnabled(value: unknown): Promise<VillageSnapshot> {
    if (typeof value !== "boolean") throw badRequest("Card-flip sprite changes must be on or off.");
    await mutateVillageState((state) => {
      state.spriteCardFlipEnabled = value;
    });
    return buildVillageSnapshot();
  }

  async function setVillageSpriteVariantsEnabled(value: unknown): Promise<VillageSnapshot> {
    if (typeof value !== "boolean") throw badRequest("Random sprite variants must be on or off.");
    await mutateVillageState((state) => {
      state.spriteVariantsEnabled = value;
    });
    return buildVillageSnapshot();
  }

  async function setVillageSendOnEnter(value: unknown): Promise<VillageSnapshot> {
    if (typeof value !== "boolean") throw badRequest("Send on Enter must be on or off.");
    await mutateVillageState((state) => {
      state.sendOnEnter = value;
    });
    return buildVillageSnapshot();
  }

  async function setVillageCharacterSpeechColors(value: unknown): Promise<VillageSnapshot> {
    if (typeof value !== "boolean") throw badRequest("Character speech colors must be on or off.");
    await mutateVillageState((state) => {
      state.characterSpeechColors = value;
    });
    return buildVillageSnapshot();
  }

  /** Rename the village. */
  async function setVillageName(value: unknown): Promise<VillageSnapshot> {
    const name = readVillageName(value);
    await mutateVillageState((state) => {
      state.name = name;
    });
    return buildVillageSnapshot();
  }

  /**
   * The Persona a write is about to link, as the three fields the cache holds.
   *
   * Both doors that set the player — founding the village and changing it in
   * settings — have to answer the same question in the same way, so the read and
   * its two refusals live here rather than twice over.
   *
   * It refuses an empty id because there is no longer a "none" to fall back on:
   * the typed name and description that used to stand in for a Persona are gone,
   * so a village with no Persona would have no answer at all to who the player is.
   * It refuses an id that does not resolve for the same reason from the other
   * side — storing it would put the village straight into the state the tab calls
   * a broken link, on the very turn the player was picking someone who exists.
   */

  /**
   * Store who the player is: the Persona they are.
   *
   * There were two other fields here once — a name and a description the player
   * typed by hand — and they are gone rather than merely unread. A village has one
   * answer to who the player is now, and keeping a second one only ever gave the
   * two a way to disagree about it.
   *
   * The Persona is resolved at the write rather than at every read, and that is
   * the trade this whole change turns on: one library read when the player picks
   * someone, instead of one on every single chat turn.
   */
  async function setVillagePlayer(input: { personaId?: unknown }): Promise<VillageSnapshot> {
    const persona = await readLinkedPersona(input.personaId);
    await mutateVillageState((state) => {
      state.playerPersonaId = persona.id;
      state.playerPersonaName = persona.name;
      state.playerPersonaIdentity = persona.identity;
      state.playerPersonaMissing = false;
    });
    return buildVillageSnapshot();
  }

  /**
   * Store what the village IS.
   *
   * This is the fork in the whole design: the setting alone says nothing about
   * who lives here, and saving one for a village that has no places yet is the
   * moment to invent them. The bootstrap runs only on that transition — once a
   * village has venues, editing the wording of its setting must never overwrite
   * places the player has since renamed, reworded or added by hand.
   */
  async function setVillageWorldName(value: unknown): Promise<VillageSnapshot> {
    const worldName = readWorldName(value);
    if (worldName === null) throw badRequest("Use a world name within 120 characters.");
    await mutateVillageState((state) => {
      state.worldName = worldName;
    });
    return buildVillageSnapshot();
  }

  async function setVillageSetting(value: unknown): Promise<VillageSnapshot> {
    const setting = readVillageSetting(value);
    let shouldPropose = false;
    await mutateVillageState((state) => {
      state.setting = setting;
      // The houses are places now, and a village with four houses and nowhere to
      // send anybody is exactly the village that needs places invented. Counting
      // every stored place here would read the roofs as the answer and leave a
      // village of four cottages and nothing else.
      shouldPropose = setting.length > 0 && remapVenues(state.venues).length === 0;
    });

    if (shouldPropose) {
      // The setting is saved either way. A model that is offline, unconfigured or
      // merely unhelpful must not cost the player the text they just typed; they
      // are told in the tab that no places arrived and can ask again.
      try {
        await runVillageBootstrap();
      } catch (error) {
        villagesLogger().warn("[villages] could not propose places for the new setting: %s", String(error));
      }
    }
    return buildVillageSnapshot();
  }

  async function setScenerySettings(value: {
    sceneryArtStyle?: unknown;
    sceneryStyleProfileId?: unknown;
    automaticZonePictures?: unknown;
    personalizeVenueImagesByDefault?: unknown;
    useVisualLoreByDefault?: unknown;
  }): Promise<VillageSnapshot> {
    await mutateVillageState((state) => {
      if (value.automaticZonePictures !== undefined) {
        const enabled = readBool(value.automaticZonePictures);
        if (enabled !== (state.automaticZonePictures !== false))
          state.zonePictureEpoch = (state.zonePictureEpoch ?? 0) + 1;
        state.automaticZonePictures = enabled;
      }
      if (value.sceneryStyleProfileId !== undefined)
        state.sceneryStyleProfileId = readSceneryStyleProfileId(value.sceneryStyleProfileId);
      if (value.sceneryArtStyle !== undefined) state.sceneryArtStyle = readSceneryStyle(value.sceneryArtStyle);
      if (value.personalizeVenueImagesByDefault !== undefined)
        state.personalizeVenueImagesByDefault = readBool(value.personalizeVenueImagesByDefault);
      if (value.useVisualLoreByDefault !== undefined)
        state.useVisualLoreByDefault = readBool(value.useVisualLoreByDefault);
    });
    return buildVillageSnapshot();
  }

  return {
    setVillagePromptKnowledge,
    setVillageLoreSettings,
    setVillageBackgroundPace,
    setVillageNarrativeConsequence,
    setVillageSpriteCardFlipEnabled,
    setVillageSpriteVariantsEnabled,
    setVillageSendOnEnter,
    setVillageCharacterSpeechColors,
    setVillageName,
    setVillagePlayer,
    setVillageSetting,
    setVillageWorldName,
    setScenerySettings,
  };
}
export type VillageSettings = ReturnType<typeof createVillageSettings>;
