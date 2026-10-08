import type {
  PersonaEntry,
  TownMapView,
  VillageLorebookOption,
  VillageSettings,
  VillageSnapshot,
  VillageStoryPace,
  VillageVenue,
} from "../../../shared/contracts/village.js";
import type { MapFrameShape, MapZoomRange, MenuPage } from "../../shared/types.js";

type TownMapPick = { image: string; size: { width: number; height: number } };

/** Inputs consumed by renderGeneralSettingsPage; assembled by the shell. */
export type GeneralSettingsPagePorts = {
  readonly backgroundPanel: React.JSX.Element;
  readonly busy: boolean;
  readonly resetArmed: boolean;
  readonly saveCharacterSpeechColors: (characterSpeechColors: boolean) => Promise<void>;
  readonly saveSendOnEnter: (sendOnEnter: boolean) => Promise<void>;
  readonly saveStoryPace: (storyPace: VillageStoryPace) => Promise<void>;
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
  readonly addVenue: () => void;
  readonly backgroundPanel: React.JSX.Element;
  readonly busy: boolean;
  readonly discardTownMapDraft: () => void;
  readonly framingMap: boolean;
  readonly generateReplacementMap: () => Promise<void>;
  readonly insertMacro: (token: string) => void;
  readonly knowledgeDraft: string;
  readonly knowledgeRef: React.RefObject<HTMLTextAreaElement | null>;
  readonly loreTokenBudgetDraft: number;
  readonly lorebookDraft: string[];
  readonly lorebooks: VillageLorebookOption[];
  readonly lorebooksError: string;
  readonly mapGenerating: boolean;
  readonly mapPinDraft: Record<string, { x: number | null; y: number | null }>;
  readonly mapRemoveDraft: boolean;
  readonly mapReplaceOpen: boolean;
  readonly mobile: boolean;
  readonly nameOfCharacter: (characterId: string | null) => string;
  readonly openPlace: (place: VillageVenue) => void;
  readonly openSetup: (fresh: boolean, village: VillageSnapshot | null) => void;
  readonly panelMapView: TownMapView;
  readonly personaDraft: string;
  readonly personalizeHomes: boolean;
  readonly personas: PersonaEntry[];
  readonly pickTownMap: (file: File | undefined) => Promise<void>;
  readonly placeCount: number;
  readonly placingMapVenueId: string | null;
  readonly reframingMap: boolean;
  readonly removeVenue: (id: string) => Promise<void>;
  readonly saveScenerySettings: () => Promise<void>;
  readonly saveSettings: () => Promise<void>;
  readonly saveTownMap: () => Promise<void>;
  readonly saveVenue: (draft: VillageVenue) => Promise<void>;
  readonly sceneryStyle: string;
  readonly selectedMapVenueId: string | null;
  readonly setKnowledgeDraft: React.Dispatch<React.SetStateAction<string>>;
  readonly setLoreTokenBudgetDraft: React.Dispatch<React.SetStateAction<number>>;
  readonly setLorebookDraft: React.Dispatch<React.SetStateAction<string[]>>;
  readonly setMapPinDraft: React.Dispatch<React.SetStateAction<Record<string, { x: number | null; y: number | null }>>>;
  readonly setMapRemoveDraft: React.Dispatch<React.SetStateAction<boolean>>;
  readonly setPersonaDraft: React.Dispatch<React.SetStateAction<string>>;
  readonly setPersonalizeHomes: React.Dispatch<React.SetStateAction<boolean>>;
  readonly setPlacingMapVenueId: React.Dispatch<React.SetStateAction<string | null>>;
  readonly setReframingMap: React.Dispatch<React.SetStateAction<boolean>>;
  readonly setSceneryStyle: React.Dispatch<React.SetStateAction<string>>;
  readonly setSelectedMapVenueId: React.Dispatch<React.SetStateAction<string | null>>;
  readonly setSettingDraft: React.Dispatch<React.SetStateAction<string>>;
  readonly setTownMapDraft: React.Dispatch<React.SetStateAction<TownMapView | null>>;
  readonly setTownMapPick: React.Dispatch<React.SetStateAction<TownMapPick | null>>;
  readonly setVenueEditDraft: React.Dispatch<React.SetStateAction<VillageVenue | null>>;
  readonly setVenueSearch: React.Dispatch<React.SetStateAction<string>>;
  readonly setVisualLoreDefault: React.Dispatch<React.SetStateAction<boolean>>;
  readonly settingDraft: string;
  readonly settingsError: string;
  readonly snapshot: VillageSnapshot | null;
  readonly startMapReplacement: () => void;
  readonly suggestPlaces: () => Promise<void>;
  readonly townMapAdvice: { tone: "ok" | "warn"; text: string };
  readonly townMapImage: string;
  readonly townMapPick: TownMapPick | null;
  readonly townMapShape: MapFrameShape;
  readonly townMapSrc: string;
  readonly townMapZoom: MapZoomRange;
  readonly venueEditDraft: VillageVenue | null;
  readonly venueSearch: string;
  readonly venuesDraft: VillageVenue[];
  readonly visualLoreDefault: boolean;
};
