import type { PlayerRole } from "../../../shared/contracts/player-role.js";
import type { ScenarioImprint, SetupMapRequest } from "../../../shared/contracts/village.js";
import type { ResidentFoundingContext } from "../../../shared/helpers/resident-founding-context.js";
import type { FoundingScenarioId, SetupMapSource, SetupVenueDraft, TownMapOptions } from "../../shared/types.js";
import { DEFAULT_TOWN_MAP_OPTIONS, emptyScenarioImprint } from "./FoundingPanels.js";
import { type AreaDraftCache, SCENERY_STYLES } from "./villages-founding-editor";
import { emptyFoundingWorkspace, type FoundingIssue } from "./villages-founding-workspace-state";
import { DEFAULT_PLAYER_ROLE } from "./villages-player-role.js";
import { useRef, useState } from "react";

/** Always mounted by the application controller so navigation retains this feature state. */
export function useFoundingState() {
  const [setupLorebookDraft, setSetupLorebookDraft] = useState<string[]>([]);

  const [setupLoreTokenBudgetDraft, setSetupLoreTokenBudgetDraft] = useState(1600);

  // The founding wizard. Its own name and setting drafts rather than the menu's,
  // so a half-typed founding cannot be overwritten by the menu opening and a
  // menu edit cannot be founded by accident.
  const [setupStep, setSetupStep] = useState(0);

  const [setupName, setSetupName] = useState("");

  const [setupSetting, setSetupSetting] = useState("");

  const [setupFoundingReason, setSetupFoundingReason] = useState<FoundingScenarioId>("custom");

  const [setupFoundingDetails, setSetupFoundingDetails] = useState<string>("");

  const [setupFoundingGuidance, setSetupFoundingGuidance] = useState("");

  const [setupPlayerRole, setSetupPlayerRole] = useState<PlayerRole | null>({ ...DEFAULT_PLAYER_ROLE });

  const [setupImprint, setSetupImprint] = useState<ScenarioImprint>(emptyScenarioImprint);

  const [setupWorldFacts, setSetupWorldFacts] = useState<string[]>([]);

  const [setupVenues, setSetupVenues] = useState<SetupVenueDraft[]>([]);

  const [setupFoundingVillagerIds, setSetupFoundingVillagerIds] = useState<string[]>([]);

  const [setupResidentContexts, setSetupResidentContexts] = useState<Record<string, ResidentFoundingContext>>({});

  const [setupRoleExpanded, setSetupRoleExpanded] = useState(false);

  const [setupKeyboardSpot, setSetupKeyboardSpot] = useState({ x: 0.5, y: 0.5 });

  const [setupEditorOpen, setSetupEditorOpen] = useState(false);

  const setupEditorOriginal = useRef<SetupVenueDraft | null>(null);

  const setupEditorAuthoredOriginal = useRef<string[]>([]);

  const setupEditorZoneOriginal = useRef<AreaDraftCache["current"] | undefined>(undefined);

  const [sceneryStyle, setSceneryStyle] = useState(SCENERY_STYLES["Painted illustration"]);

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

  const [setupMapOptions, setSetupMapOptions] = useState<TownMapOptions>(DEFAULT_TOWN_MAP_OPTIONS);

  const [setupMapSource, setSetupMapSource] = useState<SetupMapSource>("generate");

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

  const [setupMapClock, setSetupMapClock] = useState(Date.now());

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
    setupLorebookDraft,
    setSetupLorebookDraft,
    setupLoreTokenBudgetDraft,
    setSetupLoreTokenBudgetDraft,
    setupStep,
    setSetupStep,
    setupName,
    setSetupName,
    setupSetting,
    setSetupSetting,
    setupFoundingReason,
    setSetupFoundingReason,
    setupFoundingDetails,
    setSetupFoundingDetails,
    setupFoundingGuidance,
    setSetupFoundingGuidance,
    setupPlayerRole,
    setSetupPlayerRole,
    setupImprint,
    setSetupImprint,
    setupWorldFacts,
    setSetupWorldFacts,
    setupVenues,
    setSetupVenues,
    setupFoundingVillagerIds,
    setSetupFoundingVillagerIds,
    setupResidentContexts,
    setSetupResidentContexts,
    setupRoleExpanded,
    setSetupRoleExpanded,
    setupKeyboardSpot,
    setSetupKeyboardSpot,
    setupEditorOpen,
    setSetupEditorOpen,
    setupEditorOriginal,
    setupEditorAuthoredOriginal,
    setupEditorZoneOriginal,
    sceneryStyle,
    setSceneryStyle,
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
    setupMapOptions,
    setSetupMapOptions,
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
    setupMapClock,
    setSetupMapClock,
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
