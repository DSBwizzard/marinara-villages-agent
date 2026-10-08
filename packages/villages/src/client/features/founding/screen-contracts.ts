import type { PortraitMap } from "../../shared/types.js";

import type { createFoundingChooseSetupScenario } from "./setup-controller.js";

import type { FoundingState } from "./useFoundingState.js";

import type { createFoundingExitSetupDraft } from "./draft-controller.js";

import type { useFoundVillage } from "./actions.js";

import type { createFoundingGenerateSetupImage } from "./image-controller.js";

import type { useFoundingGenerateSetupTownMap } from "./image-controller.js";

import type { createFoundingGotoSetupStep } from "./setup-controller.js";

import type { usePatchSetupVenue } from "./actions.js";

import type { usePickSetupTownMap } from "./actions.js";

import type { usePlaceSetupPin } from "./actions.js";

import type { createFoundingRetrySetupSaving } from "./draft-controller.js";

import type { useFoundingSelectedResidentContexts } from "./controller-hooks.js";

import type { createFoundingSuggestSetupVenues } from "./setup-controller.js";

import type { useUpdateSetupMapRequest } from "./actions.js";

import type { createFoundingUploadSetupImage } from "./image-controller.js";

import type { useRetryPreparation } from "./actions.js";

import type { createFoundingNewSetupDraft } from "./draft-controller.js";

import type { createFoundingRestoreSetupDraft } from "./draft-controller.js";

/** Values and actions used by FoundingScreen; independent of shell implementation. */
export type FoundingScreenController = {
  readonly busy: boolean;
  readonly catalog: import("../../../shared/contracts/village").CatalogEntry[];
  readonly chooseSetupScenario: ReturnType<typeof createFoundingChooseSetupScenario>;
  readonly connectionSetupProblem: FoundingState["connectionSetupProblem"];
  readonly draftPins: import("../../shared/types").MapPin[];
  readonly draftSaveError: FoundingState["draftSaveError"];
  readonly draftSavedAt: FoundingState["draftSavedAt"];
  readonly draftSaving: FoundingState["draftSaving"];
  readonly exitSetupDraft: ReturnType<typeof createFoundingExitSetupDraft>;
  readonly foundVillage: ReturnType<typeof useFoundVillage>;
  readonly generateSetupImage: ReturnType<typeof createFoundingGenerateSetupImage>;
  readonly generateSetupTownMap: ReturnType<typeof useFoundingGenerateSetupTownMap>;
  readonly gotoSetupStep: ReturnType<typeof createFoundingGotoSetupStep>;
  readonly lorebooks: import("../../../shared/contracts/village").VillageLorebookOption[];
  readonly lorebooksError: string;
  readonly mapVisualLore: FoundingState["mapVisualLore"];
  readonly movingSetupVenueId: FoundingState["movingSetupVenueId"];
  readonly nameOfCharacter: (characterId: string | null) => string;
  readonly patchSetupVenue: ReturnType<typeof usePatchSetupVenue>;
  readonly personaDraft: string;
  readonly personas: import("../../../shared/contracts/village").PersonaEntry[];
  readonly pickSetupTownMap: ReturnType<typeof usePickSetupTownMap>;
  readonly placeSetupPin: ReturnType<typeof usePlaceSetupPin>;
  readonly portraits: PortraitMap;
  readonly retrySetupSaving: ReturnType<typeof createFoundingRetrySetupSaving>;
  readonly savedTownMapView: import("../../../shared/contracts/village").TownMapView;
  readonly sceneryStyle: FoundingState["sceneryStyle"];
  readonly screen: "room" | "venue" | "home" | "menu" | "setup" | "resume" | "preparing" | "person";
  readonly selectedResidentContexts: ReturnType<typeof useFoundingSelectedResidentContexts>;
  readonly selectedSetupVenueId: FoundingState["selectedSetupVenueId"];
  readonly setConnectionSetupProblem: FoundingState["setConnectionSetupProblem"];
  readonly setMapVisualLore: FoundingState["setMapVisualLore"];
  readonly setMovingSetupVenueId: FoundingState["setMovingSetupVenueId"];
  readonly setPersonaDraft: React.Dispatch<React.SetStateAction<string>>;
  readonly setSceneryStyle: FoundingState["setSceneryStyle"];
  readonly setScreen: React.Dispatch<
    React.SetStateAction<"room" | "venue" | "home" | "menu" | "setup" | "resume" | "preparing" | "person">
  >;
  readonly setSelectedSetupVenueId: FoundingState["setSelectedSetupVenueId"];
  readonly setSetupEditorOpen: FoundingState["setSetupEditorOpen"];
  readonly setSetupFocusIssue: FoundingState["setSetupFocusIssue"];
  readonly setSetupFoundingDetails: FoundingState["setSetupFoundingDetails"];
  readonly setSetupFoundingGuidance: FoundingState["setSetupFoundingGuidance"];
  readonly setSetupFoundingVillagerIds: FoundingState["setSetupFoundingVillagerIds"];
  readonly setSetupKeyboardSpot: FoundingState["setSetupKeyboardSpot"];
  readonly setSetupLoreTokenBudgetDraft: FoundingState["setSetupLoreTokenBudgetDraft"];
  readonly setSetupLorebookDraft: FoundingState["setSetupLorebookDraft"];
  readonly setSetupMapBusy: FoundingState["setSetupMapBusy"];
  readonly setSetupMapGeneratedKey: FoundingState["setSetupMapGeneratedKey"];
  readonly setSetupMapNegativePrompt: FoundingState["setSetupMapNegativePrompt"];
  readonly setSetupMapOptions: FoundingState["setSetupMapOptions"];
  readonly setSetupMapProblem: FoundingState["setSetupMapProblem"];
  readonly setSetupMapPrompt: FoundingState["setSetupMapPrompt"];
  readonly setSetupMapReviewed: FoundingState["setSetupMapReviewed"];
  readonly setSetupMapSource: FoundingState["setSetupMapSource"];
  readonly setSetupName: FoundingState["setSetupName"];
  readonly setSetupPlacementError: FoundingState["setSetupPlacementError"];
  readonly setSetupPlayerRole: FoundingState["setSetupPlayerRole"];
  readonly setSetupProblem: FoundingState["setSetupProblem"];
  readonly setSetupResidentContexts: FoundingState["setSetupResidentContexts"];
  readonly setSetupRoleExpanded: FoundingState["setSetupRoleExpanded"];
  readonly setSetupSetting: FoundingState["setSetupSetting"];
  readonly setSetupShowIssues: FoundingState["setSetupShowIssues"];
  readonly setSetupVenues: FoundingState["setSetupVenues"];
  readonly setSetupWorkspace: FoundingState["setSetupWorkspace"];
  readonly setSetupWorldFacts: FoundingState["setSetupWorldFacts"];
  readonly settingsError: string;
  readonly setupBeginningSourceKey: string;
  readonly setupEditorOpen: FoundingState["setupEditorOpen"];
  readonly setupFocusIssue: FoundingState["setupFocusIssue"];
  readonly setupFoundingDetails: FoundingState["setupFoundingDetails"];
  readonly setupFoundingGuidance: FoundingState["setupFoundingGuidance"];
  readonly setupFoundingReason: FoundingState["setupFoundingReason"];
  readonly setupFoundingVillagerIds: FoundingState["setupFoundingVillagerIds"];
  readonly setupImageClaim: FoundingState["setupImageClaim"];
  readonly setupImageTarget: FoundingState["setupImageTarget"];
  readonly setupKeyboardSpot: FoundingState["setupKeyboardSpot"];
  readonly setupLoreTokenBudgetDraft: FoundingState["setupLoreTokenBudgetDraft"];
  readonly setupLorebookDraft: FoundingState["setupLorebookDraft"];
  readonly setupMapBusy: FoundingState["setupMapBusy"];
  readonly setupMapGeneratedKey: FoundingState["setupMapGeneratedKey"];
  readonly setupMapGenerationKey: string;
  readonly setupMapImageSource: FoundingState["setupMapImageSource"];
  readonly setupMapNegativePrompt: FoundingState["setupMapNegativePrompt"];
  readonly setupMapOptions: FoundingState["setupMapOptions"];
  readonly setupMapProblem: FoundingState["setupMapProblem"];
  readonly setupMapProgress: string;
  readonly setupMapPrompt: FoundingState["setupMapPrompt"];
  readonly setupMapRequest: FoundingState["setupMapRequest"];
  readonly setupMapReviewed: FoundingState["setupMapReviewed"];
  readonly setupMapShape: import("../../shared/types").MapFrameShape;
  readonly setupMapSize: FoundingState["setupMapSize"];
  readonly setupMapSource: FoundingState["setupMapSource"];
  readonly setupMapSrc: string;
  readonly setupName: FoundingState["setupName"];
  readonly setupPlacementError: FoundingState["setupPlacementError"];
  readonly setupPlayerRole: FoundingState["setupPlayerRole"];
  readonly setupProblem: FoundingState["setupProblem"];
  readonly setupResidentContexts: FoundingState["setupResidentContexts"];
  readonly setupRoleExpanded: FoundingState["setupRoleExpanded"];
  readonly setupSetting: FoundingState["setupSetting"];
  readonly setupShowIssues: FoundingState["setupShowIssues"];
  readonly setupStep: FoundingState["setupStep"];
  readonly setupSuggestionsBusy: FoundingState["setupSuggestionsBusy"];
  readonly setupSuggestionsClaim: FoundingState["setupSuggestionsClaim"];
  readonly setupSuggestionsKey: FoundingState["setupSuggestionsKey"];
  readonly setupVenueBusy: FoundingState["setupVenueBusy"];
  readonly setupVenues: FoundingState["setupVenues"];
  readonly setupWorkspace: FoundingState["setupWorkspace"];
  readonly setupWorldFacts: FoundingState["setupWorldFacts"];
  readonly snapshot: import("../../../shared/contracts/village").VillageSnapshot;
  readonly suggestSetupVenues: ReturnType<typeof createFoundingSuggestSetupVenues>;
  readonly updateSetupMapRequest: ReturnType<typeof useUpdateSetupMapRequest>;
  readonly uploadSetupImage: ReturnType<typeof createFoundingUploadSetupImage>;
};

/** Values and actions used by PreparationScreen; independent of shell implementation. */
export type PreparationScreenController = {
  readonly preparationProblem: FoundingState["preparationProblem"];
  readonly retryPreparation: ReturnType<typeof useRetryPreparation>;
  readonly screen: "room" | "venue" | "home" | "menu" | "setup" | "resume" | "preparing" | "person";
  readonly snapshot: import("../../../shared/contracts/village").VillageSnapshot;
};

/** Values and actions used by ResumeScreen; independent of shell implementation. */
export type ResumeScreenController = {
  readonly draftSaveError: FoundingState["draftSaveError"];
  readonly draftSavedAt: FoundingState["draftSavedAt"];
  readonly newSetupDraft: ReturnType<typeof createFoundingNewSetupDraft>;
  readonly restoreSetupDraft: ReturnType<typeof createFoundingRestoreSetupDraft>;
  readonly savedSetupDraft: import("./villages-founding-draft").SavedFoundingDraft<
    import("./draft-model").SetupDraftData
  >;
  readonly screen: "room" | "venue" | "home" | "menu" | "setup" | "resume" | "preparing" | "person";
  readonly setSetupStep: FoundingState["setSetupStep"];
  readonly setupMapBusy: FoundingState["setupMapBusy"];
  readonly setupSuggestionsBusy: FoundingState["setupSuggestionsBusy"];
  readonly setupVenueBusy: FoundingState["setupVenueBusy"];
};
