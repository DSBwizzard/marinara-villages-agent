import { useCallback, useEffect, useRef } from "react";
import type { VillageSnapshot, VillageVenue } from "../../../shared/contracts/village.js";
import { destinationPlaces } from "../../shared/presentation.js";

export interface SettingsDraftValues {
  knowledgeDraft: string;
  personaDraft: string;
  settingDraft: string;
  lorebookDraft: string[];
  loreTokenBudgetDraft: number;
  sceneryStyle: string;
  personalizeHomes: boolean;
  visualLoreDefault: boolean;
  venuesDraft: VillageVenue[];
}
type Setters = {
  [K in keyof SettingsDraftValues as `set${Capitalize<K>}`]: React.Dispatch<
    React.SetStateAction<SettingsDraftValues[K]>
  >;
};
export type SavedSettingsDraft = Pick<
  SettingsDraftValues,
  "knowledgeDraft" | "personaDraft" | "settingDraft" | "lorebookDraft" | "loreTokenBudgetDraft"
>;
function savedValues(snapshot: NonNullable<VillageSnapshot>): SettingsDraftValues {
  return {
    knowledgeDraft: snapshot.settings.promptKnowledge,
    personaDraft: snapshot.settings.playerPersonaId,
    settingDraft: snapshot.settings.setting,
    lorebookDraft: [...snapshot.settings.selectedLorebookIds],
    loreTokenBudgetDraft: snapshot.settings.loreTokenBudget,
    sceneryStyle: snapshot.settings.sceneryArtStyle ?? "",
    personalizeHomes: snapshot.settings.personalizeVenueImagesByDefault !== false,
    visualLoreDefault: snapshot.settings.useVisualLoreByDefault !== false,
    venuesDraft: destinationPlaces(snapshot.settings.venues).map((venue) => ({ ...venue })),
  };
}
const equal = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/** Navigation retains edited fields; reopening refreshes fields that still match their last saved baseline. */
export function useSettingsDraftSession(ports: Setters & { snapshot: VillageSnapshot | null }) {
  const baseline = useRef<SettingsDraftValues | null>(null);
  useEffect(() => {
    if (ports.snapshot?.isFounded === false) baseline.current = null;
  }, [ports.snapshot?.isFounded]);
  const openSettings = useCallback(() => {
    if (!ports.snapshot) return;
    const next = savedValues(ports.snapshot),
      prior = baseline.current;
    const seed = <K extends keyof SettingsDraftValues>(
      key: K,
      setter: React.Dispatch<React.SetStateAction<SettingsDraftValues[K]>>,
    ) => {
      setter((current) => (!prior || equal(current, prior[key]) || equal(current, next[key]) ? next[key] : current));
    };
    seed("knowledgeDraft", ports.setKnowledgeDraft);
    seed("personaDraft", ports.setPersonaDraft);
    seed("settingDraft", ports.setSettingDraft);
    seed("lorebookDraft", ports.setLorebookDraft);
    seed("loreTokenBudgetDraft", ports.setLoreTokenBudgetDraft);
    seed("sceneryStyle", ports.setSceneryStyle);
    seed("personalizeHomes", ports.setPersonalizeHomes);
    seed("visualLoreDefault", ports.setVisualLoreDefault);
    seed("venuesDraft", ports.setVenuesDraft);
    baseline.current = next;
  }, [ports]);
  const acceptSavedSettings = useCallback(
    (nextSnapshot: NonNullable<VillageSnapshot>, submitted: SavedSettingsDraft) => {
      const next = savedValues(nextSnapshot);
      const accept = <K extends keyof SavedSettingsDraft>(
        key: K,
        setter: React.Dispatch<React.SetStateAction<SettingsDraftValues[K]>>,
      ) => {
        setter((current) => (equal(current, submitted[key]) ? next[key] : current));
      };
      accept("knowledgeDraft", ports.setKnowledgeDraft);
      accept("personaDraft", ports.setPersonaDraft);
      accept("settingDraft", ports.setSettingDraft);
      accept("lorebookDraft", ports.setLorebookDraft);
      accept("loreTokenBudgetDraft", ports.setLoreTokenBudgetDraft);
      // Other editable sections keep their own drafts and saving commands.
      baseline.current = baseline.current
        ? {
            ...baseline.current,
            knowledgeDraft: next.knowledgeDraft,
            personaDraft: next.personaDraft,
            settingDraft: next.settingDraft,
            lorebookDraft: next.lorebookDraft,
            loreTokenBudgetDraft: next.loreTokenBudgetDraft,
          }
        : next;
    },
    [ports],
  );
  return { openSettings, acceptSavedSettings };
}
