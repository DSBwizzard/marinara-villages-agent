import type { PlayerBackground } from "../../../shared/contracts/player-background.js";
import type { SetupMapRequest, VillageLorebookOption } from "../../../shared/contracts/village.js";
import type { ResidentAdmission } from "../../../shared/helpers/resident-admission.js";
import type { SetupMapSource, SetupVenueDraft } from "../../shared/types.js";
import type { SetupDraftData } from "./draft-model.js";
import type { SavedDeviceDraft } from "../../shared/device-drafts.js";
import { type AreaDraftCache } from "./villages-founding-editor";
import { emptyFoundingWorkspace, type FoundingIssue } from "./villages-founding-workspace-state";
import { DEFAULT_PLAYER_BACKGROUND } from "./villages-player-background.js";
import { useRef, useState } from "react";

/** Always mounted by the application controller so navigation retains this feature state. */
export function useFoundingState() {
  const [savedSetupDraft, setSavedSetupDraft] = useState<SavedDeviceDraft<SetupDraftData> | null>(null);
  const [lorebooks, setLorebooks] = useState<VillageLorebookOption[] | null>(null);
  const [lorebooksError, setLorebooksError] = useState("");
  const pendingDraftSaves = useRef(0);
  const [setupLorebookDraft, setSetupLorebookDraft] = useState<string[]>([]);

  const [setupLoreTokenBudgetDraft, setSetupLoreTokenBudgetDraft] = useState(1600);

  // The founding wizard. Its own name and setting drafts rather than the menu's,
  // so a half-typed founding cannot be overwritten by the menu opening and a
  // menu edit cannot be founded by accident.
  const [setupStep, setSetupStep] = useState(0);

  const [setupName, setSetupName] = useState("");
  const [setupTimeZone, setSetupTimeZone] = useState("");

  const [setupWorldName, setSetupWorldName] = useState("");
  const [setupSetting, setSetupSetting] = useState("");

  const [setupPlayerBackground, setSetupPlayerBackground] = useState<PlayerBackground | null>(
    DEFAULT_PLAYER_BACKGROUND,
  );

  const [setupWorldFacts, setSetupWorldFacts] = useState<string[]>([]);

  const [setupVenues, setSetupVenues] = useState<SetupVenueDraft[]>([]);

  const [setupFoundingVillagerIds, setSetupFoundingVillagerIds] = useState<string[]>([]);
  const [setupSpriteRevisions, setSetupSpriteRevisions] = useState<Record<string, number>>({});

  const [setupResidentAdmissions, setSetupResidentAdmissions] = useState<Record<string, ResidentAdmission>>({});

  const [setupKeyboardSpot, setSetupKeyboardSpot] = useState({ x: 0.5, y: 0.5 });

  const [setupEditorOpen, setSetupEditorOpen] = useState(false);

  const setupEditorOriginal = useRef<SetupVenueDraft | null>(null);

  const setupEditorAuthoredOriginal = useRef<string[]>([]);

  const setupEditorZoneOriginal = useRef<AreaDraftCache["current"] | undefined>(undefined);

  const [sceneryStyle, setSceneryStyle] = useState("");
  const [sceneryStyleProfileId, setSceneryStyleProfileId] = useState<string | null>("");

  const [personalizeHomes, setPersonalizeHomes] = useState(true);

  const [visualLoreDefault, setVisualLoreDefault] = useState(true);

  const [mapVisualLore, setMapVisualLore] = useState(true);

  const [selectedSetupVenueId, setSelectedSetupVenueId] = useState<string | null>(null);

  const [setupWorkspace, setSetupWorkspace] = useState(emptyFoundingWorkspace);

  const [setupShowIssues, setSetupShowIssues] = useState(false);

  const [setupFocusIssue, setSetupFocusIssue] = useState<FoundingIssue | null>(null);

  const [setupImageTarget, setSetupImageTarget] = useState<{ venueId: string; zoneId: string } | null>(null);

  const setupImageTargetRef = useRef<{ venueId: string; zoneId: string } | null>(null);

  const setupImageClaim = useRef(false);

  const [movingSetupVenueId, setMovingSetupVenueId] = useState<string | null>(null);

  const [setupVenueBusy, setSetupVenueBusy] = useState(false);

  const [setupPlacementError, setSetupPlacementError] = useState("");

  const [setupMapSource, setSetupMapSource] = useState<SetupMapSource>("simple");

  const [setupMapImage, setSetupMapImage] = useState("");

  const [setupMapImageSource, setSetupMapImageSource] = useState<"generate" | "upload" | null>(null);

  const [setupMapGeneratedKey, setSetupMapGeneratedKey] = useState("");

  const [setupMapSize, setSetupMapSize] = useState<{ width: number; height: number } | null>(null);

  const [setupMapPrompt, setSetupMapPrompt] = useState("");

  const [setupMapNegativePrompt, setSetupMapNegativePrompt] = useState("");

  const [setupMapBusy, setSetupMapBusy] = useState(false);

  const [setupMapProblem, setSetupMapProblem] = useState("");

  const [setupMapRequest, setSetupMapRequest] = useState<SetupMapRequest | null>(null);

  const setupMapRequestRef = useRef<SetupMapRequest | null>(null);

  const [preparationProblem, setPreparationProblem] = useState("");

  const [connectionSetupProblem, setConnectionSetupProblem] = useState("Connections are still loading.");

  /** Why the wizard cannot finish yet, said next to the button that would finish it. */
  const [setupProblem, setSetupProblem] = useState("");

  const [setupMapReviewed, setSetupMapReviewed] = useState(false);

  const [setupAuthoredFields, setSetupAuthoredFields] = useState<Record<string, string[]>>({});

  const [setupSuggestionsKey, setSetupSuggestionsKey] = useState("");

  const [setupSuggestionsBusy, setSetupSuggestionsBusy] = useState(false);

  const setupSuggestionsClaim = useRef(false);

  const [draftReady, setDraftReady] = useState(false);

  const [draftSaveError, setDraftSaveError] = useState("");

  const [draftSaving, setDraftSaving] = useState(false);

  const [draftSavedAt, setDraftSavedAt] = useState("");

  const draftRevision = useRef(0);

  const draftSaveQueue = useRef<Promise<void>>(Promise.resolve());

  const draftBlocked = useRef(false);

  const setupZoneDrafts = useRef<Record<string, AreaDraftCache["current"]>>({});

  // A village that has not been founded opens the wizard by itself, because
  // there is nothing a homepage could usefully show yet. Only once: a player who
  // backs out to look at the bare map is not asking to be sent back in on every
  // snapshot that arrives afterwards.
  const setupOfferedRef = useRef(false);
  return {
    savedSetupDraft,
    setSavedSetupDraft,
    lorebooks,
    setLorebooks,
    lorebooksError,
    setLorebooksError,
    pendingDraftSaves,
    setupLorebookDraft,
    setSetupLorebookDraft,
    setupLoreTokenBudgetDraft,
    setSetupLoreTokenBudgetDraft,
    setupStep,
    setSetupStep,
    setupName,
    setSetupName,
    setupTimeZone,
    setSetupTimeZone,
    setupWorldName,
    setSetupWorldName,
    setupSetting,
    setSetupSetting,

    setupPlayerBackground,
    setSetupPlayerBackground,

    setupWorldFacts,
    setSetupWorldFacts,
    setupVenues,
    setSetupVenues,
    setupSpriteRevisions,
    setSetupSpriteRevisions,
    setupFoundingVillagerIds,
    setSetupFoundingVillagerIds,
    setupResidentAdmissions,
    setSetupResidentAdmissions,
    setupKeyboardSpot,
    setSetupKeyboardSpot,
    setupEditorOpen,
    setSetupEditorOpen,
    setupEditorOriginal,
    setupEditorAuthoredOriginal,
    setupEditorZoneOriginal,
    sceneryStyle,
    sceneryStyleProfileId,
    setSceneryStyle,
    setSceneryStyleProfileId,
    personalizeHomes,
    setPersonalizeHomes,
    visualLoreDefault,
    setVisualLoreDefault,
    mapVisualLore,
    setMapVisualLore,
    selectedSetupVenueId,
    setSelectedSetupVenueId,
    setupWorkspace,
    setSetupWorkspace,
    setupShowIssues,
    setSetupShowIssues,
    setupFocusIssue,
    setSetupFocusIssue,
    setupImageTarget,
    setSetupImageTarget,
    setupImageTargetRef,
    setupImageClaim,
    movingSetupVenueId,
    setMovingSetupVenueId,
    setupVenueBusy,
    setSetupVenueBusy,
    setupPlacementError,
    setSetupPlacementError,
    setupMapSource,
    setSetupMapSource,
    setupMapImage,
    setSetupMapImage,
    setupMapImageSource,
    setSetupMapImageSource,
    setupMapGeneratedKey,
    setSetupMapGeneratedKey,
    setupMapSize,
    setSetupMapSize,
    setupMapPrompt,
    setSetupMapPrompt,
    setupMapNegativePrompt,
    setSetupMapNegativePrompt,
    setupMapBusy,
    setSetupMapBusy,
    setupMapProblem,
    setSetupMapProblem,
    setupMapRequest,
    setSetupMapRequest,
    setupMapRequestRef,
    preparationProblem,
    setPreparationProblem,
    connectionSetupProblem,
    setConnectionSetupProblem,
    setupProblem,
    setSetupProblem,
    setupMapReviewed,
    setSetupMapReviewed,
    setupAuthoredFields,
    setSetupAuthoredFields,
    setupSuggestionsKey,
    setSetupSuggestionsKey,
    setupSuggestionsBusy,
    setSetupSuggestionsBusy,
    setupSuggestionsClaim,
    draftReady,
    setDraftReady,
    draftSaveError,
    setDraftSaveError,
    draftSaving,
    setDraftSaving,
    draftSavedAt,
    setDraftSavedAt,
    draftRevision,
    draftSaveQueue,
    draftBlocked,
    setupZoneDrafts,
    setupOfferedRef,
  };
}

export type FoundingState = ReturnType<typeof useFoundingState>;
