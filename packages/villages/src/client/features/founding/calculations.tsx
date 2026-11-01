import type { AreaDraftCache } from "./villages-founding-editor.js";
import { residentAdmissionProblems } from "../../../shared/helpers/resident-admission.js";
import { placeSpot } from "../../shared/presentation.js";
import type { MapFrameShape, MapPin } from "../../shared/types.js";
import { simpleFoundingMap } from "./simple-map.js";

export function calculateResidentContextProblem(ports: {
  selectedResidentAdmissions: {
    [k: string]: import("../../../shared/helpers/resident-admission").ResidentAdmission;
  };
  snapshot: import("../../../shared/contracts/village").VillageSnapshot;
}) {
  const { selectedResidentAdmissions, snapshot } = ports;
  return !snapshot?.isFounded &&
    Object.values(selectedResidentAdmissions).some((context) =>
      Object.values(residentAdmissionProblems(context)).some(Boolean),
    )
    ? "Check starting notes in People."
    : "";
}
export function calculateSetupBeginningSourceKey(ports: {
  personaDraft: string;
  personalizeHomes: boolean;
  sceneryStyle: string;
  sceneryStyleProfileId: string | null;
  selectedResidentAdmissions: {
    [k: string]: import("../../../shared/helpers/resident-admission").ResidentAdmission;
  };

  setupLorebookDraft: string[];
  setupLoreTokenBudgetDraft: number;
  setupWorldName?: string;
  setupSetting: string;
  setupName?: string;
  setupWorldFacts?: string[];

  visualLoreDefault: boolean;
}) {
  const {
    personaDraft,
    personalizeHomes,
    sceneryStyle,
    sceneryStyleProfileId,
    selectedResidentAdmissions,

    setupLorebookDraft,
    setupLoreTokenBudgetDraft,
    setupSetting,
    visualLoreDefault,
  } = ports;
  return JSON.stringify({
    name: ports.setupName,
    worldFacts: ports.setupWorldFacts,
    worldName: ports.setupWorldName,
    residentAdmissions: selectedResidentAdmissions,
    setting: setupSetting.trim(),
    lorebooks: setupLorebookDraft,
    loreBudget: setupLoreTokenBudgetDraft,
    persona: personaDraft,
    artStyle: sceneryStyle,
    styleProfileId: sceneryStyleProfileId,
    personalityDefault: personalizeHomes,
    visualLoreDefault,
  });
}
export function calculateSetupImageContextKey(ports: {
  personaDraft: string;
  personalizeHomes: boolean;
  setupBeginningSourceKey: string;

  setupName: string;
  setupWorldFacts: string[];
  visualLoreDefault: boolean;
}) {
  const {
    personaDraft,
    personalizeHomes,
    setupBeginningSourceKey,

    setupName,
    setupWorldFacts,
    visualLoreDefault,
  } = ports;
  return JSON.stringify({
    source: setupBeginningSourceKey,
    name: setupName,
    worldFacts: setupWorldFacts,
    persona: personaDraft,
    personalizeHomes,
    visualLoreDefault,
  });
}
export function calculateSetupMapGenerationKey(ports: {
  mapVisualLore: boolean;
  sceneryStyle: string;
  sceneryStyleProfileId: string | null;
  setupLorebookDraft: string[];
  setupLoreTokenBudgetDraft: number;
  setupMapNegativePrompt: string;
  setupMapPrompt: string;
  setupWorldName?: string;
  setupSetting: string;
  setupWorldFacts: string[];
  snapshot: import("../../../shared/contracts/village").VillageSnapshot;
}) {
  const {
    mapVisualLore,
    sceneryStyle,
    sceneryStyleProfileId,
    setupLorebookDraft,
    setupLoreTokenBudgetDraft,
    setupMapNegativePrompt,
    setupMapPrompt,
    setupSetting,
    setupWorldFacts,
    snapshot,
  } = ports;
  return JSON.stringify({
    setting: setupSetting.trim(),
    worldName: ports.setupWorldName,
    worldFacts: snapshot?.isFounded ? setupWorldFacts : null,
    lorebooks: setupLorebookDraft,
    loreBudget: setupLoreTokenBudgetDraft,
    artStyle: sceneryStyle,
    styleProfileId: sceneryStyleProfileId,
    useVisualLore: mapVisualLore,
    structure: setupMapPrompt,
    negative: setupMapNegativePrompt,
  });
}
export function calculateSetupMapShape(ports: {
  setupMapImageSource: "generate" | "upload";
  setupMapSize: { width: number; height: number };
  setupMapSource: import("../../shared/types").SetupMapSource;
  snapshot: import("../../../shared/contracts/village").VillageSnapshot;
}): MapFrameShape | null {
  const { setupMapImageSource, setupMapSize, setupMapSource, snapshot } = ports;
  return snapshot
    ? setupMapSource === "existing"
      ? { width: snapshot.settings.townMapExpectedWidth, height: snapshot.settings.townMapExpectedHeight }
      : setupMapSource === "simple"
        ? { width: 1536, height: 1024 }
        : setupMapSize && setupMapImageSource === setupMapSource
          ? setupMapSize
          : { width: snapshot.settings.townMapGenerationWidth, height: snapshot.settings.townMapGenerationHeight }
    : null;
}
export function calculateSetupMapSrc(ports: {
  setupMapImage: string;
  setupMapImageSource: "generate" | "upload";
  setupMapSource: import("../../shared/types").SetupMapSource;
  townMapImage: string;
}) {
  const { setupMapImage, setupMapImageSource, setupMapSource, townMapImage } = ports;
  return setupMapSource === "existing"
    ? townMapImage || null
    : setupMapSource === "simple"
      ? simpleFoundingMap()
      : setupMapImageSource === setupMapSource
        ? setupMapImage || null
        : null;
}
export function calculatePlaceCount(ports: {
  snapshot: import("../../../shared/contracts/village").VillageSnapshot;
  venuesDraft: import("../../../shared/contracts/village").VillageVenue[];
}) {
  const { snapshot, venuesDraft } = ports;
  return (
    (snapshot?.settings.venues.length ?? 0) +
    venuesDraft.filter((draft) => !snapshot?.settings.venues.some((saved) => saved.id === draft.id)).length
  );
}
export function calculateDraftPins(ports: {
  selectedSetupVenueId: string;
  setMovingSetupVenueId: React.Dispatch<React.SetStateAction<string>>;
  setSelectedSetupVenueId: React.Dispatch<React.SetStateAction<string>>;
  setSetupEditorOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSetupWorkspace: React.Dispatch<
    React.SetStateAction<import("./villages-founding-workspace-state").FoundingWorkspaceState>
  >;
  setupAuthoredFields: Record<string, string[]>;
  setupEditorAuthoredOriginal: React.RefObject<string[]>;
  setupEditorOriginal: React.RefObject<import("../../../shared/contracts/village").VillageVenue>;
  setupEditorZoneOriginal: React.RefObject<AreaDraftCache["current"] | undefined>;
  setupVenues: import("../../../shared/contracts/village").VillageVenue[];
  setupZoneDrafts: React.RefObject<Record<string, AreaDraftCache["current"]>>;
}): MapPin[] {
  const {
    selectedSetupVenueId,
    setMovingSetupVenueId,
    setSelectedSetupVenueId,
    setSetupEditorOpen,
    setSetupWorkspace,
    setupAuthoredFields,
    setupEditorAuthoredOriginal,
    setupEditorOriginal,
    setupEditorZoneOriginal,
    setupVenues,
    setupZoneDrafts,
  } = ports;
  return setupVenues.flatMap((venue, index) => {
    const spot = placeSpot(venue);
    if (!spot) return [];
    return [
      {
        id: venue.id,
        x: spot.x,
        y: spot.y,
        text: venue.name || (venue.category === "public-center" ? "Community Place" : "Residence"),
        label: `${index + 1}. ${venue.name || (venue.category === "public-center" ? "Community Place" : "Residence")}`,
        image: venue.presentation.image?.url ?? null,
        tone: venue.category === "public-center" ? "venue" : venue.occupancy.playerHome ? "player" : "resident",
        selected: selectedSetupVenueId === venue.id,
        onSelect: () => {
          setupEditorOriginal.current = structuredClone(venue);
          setupEditorAuthoredOriginal.current = [...(setupAuthoredFields[venue.id] ?? [])];
          setupEditorZoneOriginal.current = structuredClone(setupZoneDrafts.current[venue.id]);
          setSelectedSetupVenueId(venue.id);
          setSetupEditorOpen(false);
          setMovingSetupVenueId(null);
          setSetupWorkspace((current) => ({ ...current, paused: true, view: "details" }));
        },
      },
    ];
  });
}
