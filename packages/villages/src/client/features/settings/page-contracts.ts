import type {
  PersonaEntry,
  VillageLorebookOption,
  VillageSettings,
  VillageSnapshot,
  VillageBackgroundPace,
  VillageVenue,
} from "../../../shared/contracts/village.js";
import type { MenuPage } from "../../shared/types.js";

/** Inputs consumed by renderGeneralSettingsPage; assembled by the shell. */
export type GeneralSettingsPagePorts = {
  readonly backgroundPanel: React.JSX.Element;
  readonly busy: boolean;
  readonly resetArmed: boolean;
  readonly saveCharacterSpeechColors: (characterSpeechColors: boolean) => Promise<void>;
  readonly saveSendOnEnter: (sendOnEnter: boolean) => Promise<void>;
  readonly saveBackgroundPace: (backgroundPace: VillageBackgroundPace) => Promise<void>;
  readonly saveVisitRetention: (visitRetention: VillageSettings["visitRetention"]) => Promise<void>;
  readonly setResetArmed: React.Dispatch<React.SetStateAction<boolean>>;
  readonly settingsError: string;
  readonly snapshot: VillageSnapshot | null;
  readonly startOver: () => Promise<void>;
};

/** Inputs consumed by renderMenuIndexPage; assembled by the shell. */
export type MenuIndexPagePorts = {
  readonly backgroundPanel: React.JSX.Element;
  readonly busy: boolean;
  readonly openMenu: (tab: MenuPage) => void;
  readonly snapshot: VillageSnapshot | null;
};

/** Inputs consumed by renderVillageSettingsPage; assembled by the shell. */
export type VillageSettingsPagePorts = {
  readonly setSnapshot: React.Dispatch<React.SetStateAction<VillageSnapshot>>;
  readonly addVenue: () => void;
  readonly backgroundPanel: React.JSX.Element;
  readonly busy: boolean;
  readonly insertMacro: (token: string) => void;
  readonly knowledgeDraft: string;
  readonly knowledgeRef: React.RefObject<HTMLTextAreaElement | null>;
  readonly loreTokenBudgetDraft: number;
  readonly lorebookDraft: string[];
  readonly lorebooks: VillageLorebookOption[];
  readonly lorebooksError: string;
  readonly mobile: boolean;
  readonly nameOfCharacter: (characterId: string | null) => string;
  readonly openPlace: (place: VillageVenue) => void;
  readonly openSetup: (fresh: boolean, village: VillageSnapshot | null) => void;
  readonly personaDraft: string;
  readonly personalizeHomes: boolean;
  readonly personas: PersonaEntry[];
  readonly placeCount: number;
  readonly removeVenue: (id: string) => Promise<void>;
  readonly saveScenerySettings: (automaticZonePictures?: boolean) => Promise<void>;
  readonly saveSettings: () => Promise<void>;
  readonly saveVenue: (draft: VillageVenue) => Promise<void>;
  readonly sceneryStyle: string;
  readonly sceneryStyleProfileId: string | null;
  readonly setKnowledgeDraft: React.Dispatch<React.SetStateAction<string>>;
  readonly setLoreTokenBudgetDraft: React.Dispatch<React.SetStateAction<number>>;
  readonly setLorebookDraft: React.Dispatch<React.SetStateAction<string[]>>;
  readonly setPersonaDraft: React.Dispatch<React.SetStateAction<string>>;
  readonly setPersonalizeHomes: React.Dispatch<React.SetStateAction<boolean>>;
  readonly setSceneryStyle: React.Dispatch<React.SetStateAction<string>>;
  readonly setSceneryStyleProfileId: React.Dispatch<React.SetStateAction<string | null>>;
  readonly setSettingDraft: React.Dispatch<React.SetStateAction<string>>;
  readonly setVenueEditDraft: React.Dispatch<React.SetStateAction<VillageVenue | null>>;
  readonly setVenueSearch: React.Dispatch<React.SetStateAction<string>>;
  readonly setVisualLoreDefault: React.Dispatch<React.SetStateAction<boolean>>;
  readonly settingDraft: string;
  readonly settingsError: string;
  readonly snapshot: VillageSnapshot | null;
  readonly suggestPlaces: () => Promise<void>;
  readonly venueEditDraft: VillageVenue | null;
  readonly venueSearch: string;
  readonly venuesDraft: VillageVenue[];
  readonly visualLoreDefault: boolean;
};
