import type {
  VillageLorebookOption,
  VillageSettings,
  VillageSnapshot,
  VillageBackgroundPace,
} from "../../../shared/contracts/village.js";

/** Inputs consumed by renderGeneralSettingsPage; assembled by the shell. */
export type GeneralSettingsPagePorts = {
  readonly category: "general" | "advanced";
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

/** Inputs consumed by renderVillageSettingsPage; assembled by the shell. */
export type VillageSettingsPagePorts = {
  readonly category: "world" | "visual";
  readonly reportLocalDraftStatus: import("./local-draft-status.js").ReportLocalDraftStatus;
  readonly setSnapshot: React.Dispatch<React.SetStateAction<VillageSnapshot>>;
  readonly busy: boolean;
  readonly loreTokenBudgetDraft: number;
  readonly lorebookDraft: string[];
  readonly lorebooks: VillageLorebookOption[];
  readonly lorebooksError: string;
  readonly mobile: boolean;
  readonly personalizeHomes: boolean;
  readonly saveScenerySettings: (automaticZonePictures?: boolean) => Promise<void>;
  readonly saveSettings: () => Promise<void>;
  readonly sceneryStyle: string;
  readonly sceneryStyleProfileId: string | null;
  readonly setLoreTokenBudgetDraft: React.Dispatch<React.SetStateAction<number>>;
  readonly setLorebookDraft: React.Dispatch<React.SetStateAction<string[]>>;
  readonly setPersonalizeHomes: React.Dispatch<React.SetStateAction<boolean>>;
  readonly setSceneryStyle: React.Dispatch<React.SetStateAction<string>>;
  readonly setSceneryStyleProfileId: React.Dispatch<React.SetStateAction<string | null>>;
  readonly setVisualLoreDefault: React.Dispatch<React.SetStateAction<boolean>>;
  readonly settingsError: string;
  readonly snapshot: VillageSnapshot | null;
  readonly visualLoreDefault: boolean;
};
