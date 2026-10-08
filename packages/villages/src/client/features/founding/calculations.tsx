import { residentFoundingProblems } from "../../../shared/helpers/resident-founding-context.js";
import { placeSpot } from "../../shared/presentation.js";
import type { MapFrameShape, MapPin } from "../../shared/types.js";

export function calculateResidentContextProblem(ports: {
  selectedResidentContexts: {
    [k: string]: import("../../../shared/helpers/resident-founding-context").ResidentFoundingContext;
  };
  snapshot: import("../../../shared/contracts/village").VillageSnapshot;
}) {
  const { selectedResidentContexts, snapshot } = ports;
  return !snapshot?.isFounded &&
    Object.values(selectedResidentContexts).some((context) =>
      Object.values(residentFoundingProblems(context)).some(Boolean),
    )
    ? "Complete the highlighted resident background fields in People."
    : "";
}
export function calculateSetupHomeCount(ports: { setupFoundingVillagerIds: string[] }) {
  const { setupFoundingVillagerIds } = ports;
  return setupFoundingVillagerIds.length;
}
export function calculateSetupBeginningSourceKey(ports: {
  personaDraft: string;
  personalizeHomes: boolean;
  sceneryStyle: string;
  selectedResidentContexts: {
    [k: string]: import("../../../shared/helpers/resident-founding-context").ResidentFoundingContext;
  };
  setupFoundingDetails: string;
  setupFoundingGuidance: string;
  setupFoundingReason: "custom" | "rebuild" | "pioneer" | "prosper" | "none";
  setupLorebookDraft: string[];
  setupLoreTokenBudgetDraft: number;
  setupSetting: string;
  visualLoreDefault: boolean;
}) {
  const {
    personaDraft,
    personalizeHomes,
    sceneryStyle,
    selectedResidentContexts,
    setupFoundingDetails,
    setupFoundingGuidance,
    setupFoundingReason,
    setupLorebookDraft,
    setupLoreTokenBudgetDraft,
    setupSetting,
    visualLoreDefault,
  } = ports;
  return JSON.stringify({
    residentContexts: selectedResidentContexts,
    scenario: setupFoundingReason,
    premise: setupFoundingDetails.trim(),
    direction: setupFoundingGuidance.trim(),
    setting: setupSetting.trim(),
    lorebooks: setupLorebookDraft,
    loreBudget: setupLoreTokenBudgetDraft,
    persona: personaDraft,
    artStyle: sceneryStyle,
    personalityDefault: personalizeHomes,
    visualLoreDefault,
  });
}
export function calculateSetupImageContextKey(ports: {
  personaDraft: string;
  personalizeHomes: boolean;
  setupBeginningSourceKey: string;
  setupImprint: import("../../../shared/contracts/village").ScenarioImprint;
  setupName: string;
  setupWorldFacts: string[];
  visualLoreDefault: boolean;
}) {
  const {
    personaDraft,
    personalizeHomes,
    setupBeginningSourceKey,
    setupImprint,
    setupName,
    setupWorldFacts,
    visualLoreDefault,
  } = ports;
  return JSON.stringify({
    source: setupBeginningSourceKey,
    name: setupName,
    imprint: setupImprint,
    worldFacts: setupWorldFacts,
    persona: personaDraft,
    personalizeHomes,
    visualLoreDefault,
  });
}
export function calculateSetupMapGenerationKey(ports: {
  mapVisualLore: boolean;
  sceneryStyle: string;
  setupLorebookDraft: string[];
  setupMapNegativePrompt: string;
  setupMapOptions: import("../../shared/types").TownMapOptions;
  setupMapPrompt: string;
  setupSetting: string;
  setupWorldFacts: string[];
  snapshot: import("../../../shared/contracts/village").VillageSnapshot;
}) {
  const {
    mapVisualLore,
    sceneryStyle,
    setupLorebookDraft,
    setupMapNegativePrompt,
    setupMapOptions,
    setupMapPrompt,
    setupSetting,
    setupWorldFacts,
    snapshot,
  } = ports;
  return JSON.stringify({
    setting: setupSetting.trim(),
    worldFacts: snapshot?.isFounded ? setupWorldFacts : null,
    lorebooks: setupLorebookDraft,
    artStyle: sceneryStyle,
    useVisualLore: mapVisualLore,
    structure: setupMapPrompt,
    negative: setupMapNegativePrompt,
    options: setupMapOptions,
  });
}
export function calculateSetupMapSeconds(ports: {
  setupMapClock: number;
  setupMapRequest: import("../../../shared/contracts/village").SetupMapRequest;
}) {
  const { setupMapClock, setupMapRequest } = ports;
  return Math.max(
    0,
    Math.floor((setupMapClock - Date.parse(setupMapRequest?.startedAt ?? new Date().toISOString())) / 1000),
  );
}
export function calculateSetupMapProgress(ports: { setupMapSeconds: number }) {
  const { setupMapSeconds } = ports;
  return `Waiting for map artwork — ${Math.floor(setupMapSeconds / 60)}m ${setupMapSeconds % 60}s. Image generation can take several minutes. You can continue editing.`;
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
  return setupMapSource === "none"
    ? null
    : setupMapSource === "existing"
      ? townMapImage || null
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
  setupEditorZoneOriginal: React.RefObject<{
    common?: {
      id: string;
      name?: string;
      ownerId?: string;
      purpose?: string;
      access?: import("../../../shared/helpers/venue-access").ZoneAccessPolicy;
      accessView?: import("../../../shared/helpers/venue-access").ZoneAccessView;
      controllerIds?: string[];
      venueClass: "residence" | "workplace" | "gathering" | "other";
      description: string;
      image: import("../../../shared/contracts/village").VillageVenueImage;
      state: {
        condition: string;
        items: string[];
        publicFacts: string[];
        features: { id: string; text: string; sourceCharacterId: string; locked: boolean; updatedAt: string }[];
        traces: { id: string; kind: string; text: string; recipientId: string; createdAt: string }[];
        updatedAt: string;
      };
    };
    personal?: {
      id: string;
      name?: string;
      ownerId?: string;
      purpose?: string;
      access?: import("../../../shared/helpers/venue-access").ZoneAccessPolicy;
      accessView?: import("../../../shared/helpers/venue-access").ZoneAccessView;
      controllerIds?: string[];
      venueClass: "residence" | "workplace" | "gathering" | "other";
      description: string;
      image: import("../../../shared/contracts/village").VillageVenueImage;
      state: {
        condition: string;
        items: string[];
        publicFacts: string[];
        features: { id: string; text: string; sourceCharacterId: string; locked: boolean; updatedAt: string }[];
        traces: { id: string; kind: string; text: string; recipientId: string; createdAt: string }[];
        updatedAt: string;
      };
    } & {
      ownerId: string;
      name?: string;
      purpose?: string;
      access?: import("../../../shared/helpers/venue-access").ZoneAccessPolicy;
      accessView?: import("../../../shared/helpers/venue-access").ZoneAccessView;
      controllerIds?: string[];
      adaptationPending?: boolean;
      initialImageAttemptedAt?: string;
    };
  }>;
  setupVenues: import("../../../shared/contracts/village").VillageVenue[];
  setupZoneDrafts: React.RefObject<
    Record<
      string,
      {
        common?: {
          id: string;
          name?: string;
          ownerId?: string;
          purpose?: string;
          access?: import("../../../shared/helpers/venue-access").ZoneAccessPolicy;
          accessView?: import("../../../shared/helpers/venue-access").ZoneAccessView;
          controllerIds?: string[];
          venueClass: "residence" | "workplace" | "gathering" | "other";
          description: string;
          image: import("../../../shared/contracts/village").VillageVenueImage;
          state: {
            condition: string;
            items: string[];
            publicFacts: string[];
            features: { id: string; text: string; sourceCharacterId: string; locked: boolean; updatedAt: string }[];
            traces: { id: string; kind: string; text: string; recipientId: string; createdAt: string }[];
            updatedAt: string;
          };
        };
        personal?: {
          id: string;
          name?: string;
          ownerId?: string;
          purpose?: string;
          access?: import("../../../shared/helpers/venue-access").ZoneAccessPolicy;
          accessView?: import("../../../shared/helpers/venue-access").ZoneAccessView;
          controllerIds?: string[];
          venueClass: "residence" | "workplace" | "gathering" | "other";
          description: string;
          image: import("../../../shared/contracts/village").VillageVenueImage;
          state: {
            condition: string;
            items: string[];
            publicFacts: string[];
            features: { id: string; text: string; sourceCharacterId: string; locked: boolean; updatedAt: string }[];
            traces: { id: string; kind: string; text: string; recipientId: string; createdAt: string }[];
            updatedAt: string;
          };
        } & {
          ownerId: string;
          name?: string;
          purpose?: string;
          access?: import("../../../shared/helpers/venue-access").ZoneAccessPolicy;
          accessView?: import("../../../shared/helpers/venue-access").ZoneAccessView;
          controllerIds?: string[];
          adaptationPending?: boolean;
          initialImageAttemptedAt?: string;
        };
      }
    >
  >;
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
        text: venue.name || (venue.category === "public-center" ? "Gathering Place" : "Residence"),
        label: `${index + 1}. ${venue.name || (venue.category === "public-center" ? "Gathering Place" : "Residence")}`,
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
