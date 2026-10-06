import type { SetupMapRequest, VillageVenue, VillageVenueImage } from "../../../shared/contracts/village.js";
import { messageFrom, request } from "../../shared/api.js";
import { ELEMENT_TAG } from "../../shared/constants.js";
import { readFileAsDataUrl } from "../../shared/presentation.js";
import { createVillagesClientId } from "../../shared/request-id.js";
import type { SetupVenueDraft } from "../../shared/types.js";
import type { SettingsState } from "../settings/useSettingsState.js";
import type { useFoundingSetupDraftData } from "./controller-hooks.js";
import { requestSetupMapReceipt } from "./FoundingPanels.js";
import type { FoundingState } from "./useFoundingState.js";
import { personalSpaceDraft } from "./villages-founding-editor";
import { useCallback } from "react";

export function useFoundingGenerateSetupTownMap(ports: {
  readonly mapVisualLore: FoundingState["mapVisualLore"];
  readonly persistSetupDraft: (data: import("./draft-model").SetupDraftData) => Promise<void>;
  readonly sceneryStyle: FoundingState["sceneryStyle"];
  readonly setSetupMapBusy: FoundingState["setSetupMapBusy"];
  readonly setSetupMapClock: FoundingState["setSetupMapClock"];
  readonly setSetupMapProblem: FoundingState["setSetupMapProblem"];
  readonly setSetupProblem: FoundingState["setSetupProblem"];
  readonly setupDraftData: ReturnType<typeof useFoundingSetupDraftData>;
  readonly setupLorebookDraft: FoundingState["setupLorebookDraft"];
  readonly setupMapGenerationKey: string;
  readonly setupMapNegativePrompt: FoundingState["setupMapNegativePrompt"];
  readonly setupMapOptions: FoundingState["setupMapOptions"];
  readonly setupMapPrompt: FoundingState["setupMapPrompt"];
  readonly setupMapRequestRef: FoundingState["setupMapRequestRef"];
  readonly setupSetting: FoundingState["setupSetting"];
  readonly setupWorldFacts: FoundingState["setupWorldFacts"];
  readonly snapshot: import("../../../shared/contracts/village").VillageSnapshot;
  readonly updateSetupMapRequest: (value: import("../../../shared/contracts/village").SetupMapRequest) => void;
}) {
  return useCallback(async () => {
    const {
      mapVisualLore,
      persistSetupDraft,
      sceneryStyle,
      setSetupMapBusy,
      setSetupMapClock,
      setSetupMapProblem,
      setSetupProblem,
      setupDraftData,
      setupLorebookDraft,
      setupMapGenerationKey,
      setupMapNegativePrompt,
      setupMapOptions,
      setupMapPrompt,
      setupMapRequestRef,
      setupSetting,
      setupWorldFacts,
      snapshot,
      updateSetupMapRequest,
    } = ports;

    if (setupMapRequestRef.current?.phase === "starting" || setupMapRequestRef.current?.phase === "waiting") return;
    if (setupSetting.trim().length === 0) {
      setSetupMapProblem("Describe what the village is like before generating its map.");
      return;
    }
    setSetupMapBusy(true);
    setSetupMapProblem("");
    setSetupProblem("");
    const pending: SetupMapRequest = {
      id: createVillagesClientId(),
      sourceKey: setupMapGenerationKey,
      startedAt: new Date().toISOString(),
      phase: "starting",
    };
    updateSetupMapRequest(pending);
    setSetupMapClock(Date.now());
    let dispatched = false;
    try {
      // Keep the receipt ID before the paid request, so a reload only retrieves it.
      await persistSetupDraft({ ...setupDraftData, mapRequest: pending, mapProblem: "", interruptedGeneration: false });
      dispatched = true;
      const receipt = await requestSetupMapReceipt("/setup/town-map/generate", {
        method: "POST",
        body: JSON.stringify({
          actionId: pending.id,
          sourceKey: pending.sourceKey,
          structure: setupMapPrompt === snapshot?.settings.townMapLayoutPrompt ? undefined : setupMapPrompt,
          negative:
            setupMapNegativePrompt === snapshot?.settings.townMapNegativePrompt ? undefined : setupMapNegativePrompt,
          setting: setupSetting,
          options: setupMapOptions,
          selectedLorebookIds: setupLorebookDraft,
          sceneryArtStyle: sceneryStyle,
          useVisualLore: mapVisualLore,
          scenarioImprint: snapshot?.isFounded
            ? { origin: "", worldFacts: setupWorldFacts, openingConditions: [], visualCues: [] }
            : null,
        }),
      });
      updateSetupMapRequest({
        id: receipt.id,
        sourceKey: receipt.sourceKey,
        startedAt: receipt.startedAt,
        phase: "waiting",
      });
    } catch (cause) {
      setSetupMapProblem(
        `${messageFrom(cause, "The village map could not be requested.")}${dispatched ? " Check map status before starting another attempt." : ""}`,
      );
      updateSetupMapRequest(dispatched ? { ...pending, phase: "paused" } : null);
      setSetupMapBusy(false);
    }
  }, [
    ports.setupLorebookDraft,
    ports.setupMapNegativePrompt,
    ports.setupMapPrompt,
    ports.setupSetting,
    ports.setupMapOptions,
    ports.setupMapGenerationKey,
    ports.sceneryStyle,
    ports.mapVisualLore,
    ports.setupWorldFacts,
    ports.snapshot?.isFounded,
    ports.snapshot?.settings.townMapLayoutPrompt,
    ports.snapshot?.settings.townMapNegativePrompt,
    ports.persistSetupDraft,
    ports.setupDraftData,
    ports.updateSetupMapRequest,
  ]);
}
export function createFoundingSetupDraftRow(ports: {}) {
  return (venue: SetupVenueDraft) => {
    return {
      id: venue.id,
      name: venue.name,
      venueType: venue.venueType,
      form: venue.form ?? "",
      description: venue.description,
      spaceDescription: venue.spaces?.[0]?.description ?? "",
      layout: venue.layout,
      layoutVersion: venue.layoutVersion,
      areas: [...(venue.spaces ?? []), ...(venue.privateSpaces ?? [])].map((area) => ({
        id: area.id,
        name: "name" in area ? area.name : "Common Space",
        purpose: "purpose" in area ? area.purpose : "",
        venueClass: area.venueClass,
      })),
      venueClass: venue.classes?.includes("gathering") ? "gathering" : "residence",
      residentCharacterId: venue.occupancy.residentCharacterId ?? "",
    };
  };
}
export function createFoundingGenerateSetupImage(ports: {
  readonly element: HTMLElement;
  readonly personaDraft: SettingsState["personaDraft"];
  readonly personalizeHomes: FoundingState["personalizeHomes"];
  readonly sceneryStyle: FoundingState["sceneryStyle"];
  readonly selectedResidentContexts: {
    [k: string]: import("../../../shared/helpers/resident-founding-context").ResidentFoundingContext;
  };
  readonly setSelectedSetupVenueId: FoundingState["setSelectedSetupVenueId"];
  readonly setSetupImageTarget: FoundingState["setSetupImageTarget"];
  readonly setSetupProblem: FoundingState["setSetupProblem"];
  readonly setSetupVenueBusy: FoundingState["setSetupVenueBusy"];
  readonly setSetupVenues: FoundingState["setSetupVenues"];
  readonly setupDraftRow: ReturnType<typeof createFoundingSetupDraftRow>;
  readonly setupFoundingDetails: FoundingState["setupFoundingDetails"];
  readonly setupImageClaim: FoundingState["setupImageClaim"];
  readonly setupImageContextKey: string;
  readonly setupImageContextKeyRef: React.RefObject<string>;
  readonly setupImageTargetRef: FoundingState["setupImageTargetRef"];
  readonly setupImprint: FoundingState["setupImprint"];
  readonly setupLorebookDraft: FoundingState["setupLorebookDraft"];
  readonly setupName: FoundingState["setupName"];
  readonly setupSetting: FoundingState["setupSetting"];
  readonly setupVenuesRef: React.RefObject<import("../../../shared/contracts/village").VillageVenue[]>;
  readonly setupWorldFacts: FoundingState["setupWorldFacts"];
  readonly snapshot: import("../../../shared/contracts/village").VillageSnapshot;
  readonly visualLoreDefault: FoundingState["visualLoreDefault"];
  readonly withSetupImage: (
    venue: import("../../../shared/contracts/village").VillageVenue,
    area: "exterior" | "private" | "interior",
    image: import("../../../shared/contracts/village").VillageVenueImage,
    zoneId?: string,
  ) => import("../../../shared/contracts/village").VillageVenue;
}) {
  return async (venue: SetupVenueDraft, area: "exterior" | "interior" | "private", zoneId?: string) => {
    const {
      element,
      personaDraft,
      personalizeHomes,
      sceneryStyle,
      selectedResidentContexts,
      setSelectedSetupVenueId,
      setSetupImageTarget,
      setSetupProblem,
      setSetupVenueBusy,
      setSetupVenues,
      setupDraftRow,
      setupFoundingDetails,
      setupImageClaim,
      setupImageContextKey,
      setupImageContextKeyRef,
      setupImageTargetRef,
      setupImprint,
      setupLorebookDraft,
      setupName,
      setupSetting,
      setupVenuesRef,
      setupWorldFacts,
      snapshot,
      visualLoreDefault,
      withSetupImage,
    } = ports;

    if (setupImageClaim.current) return;
    const selectedArea = [...(venue.spaces ?? []), ...(venue.privateSpaces ?? [])].find((zone) => zone.id === zoneId);
    const description = selectedArea
      ? selectedArea.description
      : area === "private"
        ? (venue.privateSpaces?.find((room) => room.ownerId === "player")?.description ?? "")
        : area === "exterior"
          ? venue.description
          : (venue.spaces?.[0]?.description ?? "");
    if (!description.trim()) {
      setSelectedSetupVenueId(venue.id);
      setSetupProblem(`Add an ${area} description before generating its image.`);
      window.setTimeout(
        () => element.querySelector<HTMLElement>(`#${ELEMENT_TAG}-setup-${area}-description`)?.focus(),
        0,
      );
      return;
    }
    const sourceKey = setupImageContextKey;
    const physicalImageKey = (row: VillageVenue | undefined) =>
      row &&
      JSON.stringify({
        name: row.name,
        venueType: row.venueType,
        form: row.form,
        description: row.description,
        occupancy: row.occupancy,
        imageContext: row.imageContext,
        zone: [...(row.spaces ?? []), ...(row.privateSpaces ?? [])]
          .filter((zone) => zone.id === zoneId)
          .map(({ id, name, purpose, description, state }) => ({ id, name, purpose, description, state })),
      });
    const venueKey = physicalImageKey(venue);
    setupImageClaim.current = true;
    setupImageTargetRef.current = { venueId: venue.id, zoneId: zoneId ?? "exterior" };
    setSetupImageTarget(setupImageTargetRef.current);
    setSetupVenueBusy(true);
    setSetupProblem("");
    try {
      const image = await request<VillageVenueImage>("/setup/venue-image/generate", {
        method: "POST",
        body: JSON.stringify({
          venue: setupDraftRow(venue),
          area,
          zoneId,
          zoneName: selectedArea?.name,
          zonePurpose: selectedArea?.purpose,
          zoneAppearance: selectedArea?.description,
          privateOwnerId: area === "private" ? "player" : undefined,
          privateDescription: description,
          residentFoundingContext: venue.occupancy.residentCharacterId
            ? selectedResidentContexts[venue.occupancy.residentCharacterId]
            : undefined,
          playerPersonaId: personaDraft,
          sceneryArtStyle: sceneryStyle,
          useAssignedVillagerContext: venue.imageContext?.useAssignedVillagerContext ?? personalizeHomes,
          useVisualLore: venue.imageContext?.useVisualLore ?? visualLoreDefault,
          villageName: setupName,
          setting: setupSetting,
          foundingDetails: setupFoundingDetails,
          scenarioImprint: snapshot?.isFounded ? setupImprint : null,
          worldFacts: snapshot?.isFounded ? setupWorldFacts : [],
          selectedLorebookIds: setupLorebookDraft,
        }),
      });
      if (
        setupImageContextKeyRef.current !== sourceKey ||
        physicalImageKey(setupVenuesRef.current.find((row) => row.id === venue.id)) !== venueKey
      ) {
        setSetupProblem("The venue changed while its image was generated. Generate again.");
        return;
      }
      setSetupVenues((rows) =>
        rows.map((row) =>
          row.id === venue.id && physicalImageKey(row) === venueKey ? withSetupImage(row, area, image, zoneId) : row,
        ),
      );
    } catch (cause) {
      setSetupProblem(messageFrom(cause, "Venue art could not be generated."));
    } finally {
      setSetupVenueBusy(false);
      setupImageClaim.current = false;
      setSetupImageTarget(null);
      setupImageTargetRef.current = null;
    }
  };
}
export function createFoundingUploadSetupImage(ports: {
  readonly patchSetupVenue: (
    id: string,
    next: (
      venue: import("../../../shared/contracts/village").VillageVenue,
    ) => import("../../../shared/contracts/village").VillageVenue,
  ) => void;
  readonly setSetupImageTarget: FoundingState["setSetupImageTarget"];
  readonly setSetupProblem: FoundingState["setSetupProblem"];
  readonly setSetupVenueBusy: FoundingState["setSetupVenueBusy"];
  readonly setupBeginningSourceKey: string;
  readonly setupBeginningSourceKeyRef: React.RefObject<string>;
  readonly setupImageClaim: FoundingState["setupImageClaim"];
  readonly setupImageTargetRef: FoundingState["setupImageTargetRef"];
  readonly setupVenuesRef: React.RefObject<import("../../../shared/contracts/village").VillageVenue[]>;
  readonly snapshot: import("../../../shared/contracts/village").VillageSnapshot;
  readonly withSetupImage: (
    venue: import("../../../shared/contracts/village").VillageVenue,
    area: "exterior" | "private" | "interior",
    image: import("../../../shared/contracts/village").VillageVenueImage,
    zoneId?: string,
  ) => import("../../../shared/contracts/village").VillageVenue;
}) {
  return async (venue: SetupVenueDraft, area: "exterior" | "interior" | "private", file?: File, zoneId?: string) => {
    const {
      patchSetupVenue,
      setSetupImageTarget,
      setSetupProblem,
      setSetupVenueBusy,
      setupBeginningSourceKey,
      setupBeginningSourceKeyRef,
      setupImageClaim,
      setupImageTargetRef,
      setupVenuesRef,
      snapshot,
      withSetupImage,
    } = ports;

    if (!file || setupImageClaim.current) return;
    if (file.size > (snapshot?.settings.maxVenueImageBytes ?? 8_000_000)) {
      setSetupProblem("That venue image is too large. Choose a smaller file.");
      return;
    }
    setupImageClaim.current = true;
    setupImageTargetRef.current = { venueId: venue.id, zoneId: zoneId ?? "exterior" };
    setSetupImageTarget(setupImageTargetRef.current);
    const sourceKey = setupBeginningSourceKey;
    setSetupVenueBusy(true);
    setSetupProblem("");
    try {
      const image = await request<VillageVenueImage>("/setup/venue-image", {
        method: "PUT",
        body: JSON.stringify({ name: venue.name, image: await readFileAsDataUrl(file) }),
      });
      if (
        setupBeginningSourceKeyRef.current !== sourceKey ||
        !setupVenuesRef.current.some(
          (row) =>
            row.id === venue.id &&
            (!zoneId || [...(row.spaces ?? []), ...(row.privateSpaces ?? [])].some((zone) => zone.id === zoneId)),
        )
      )
        return;
      patchSetupVenue(venue.id, (row) => withSetupImage(row, area, image, zoneId));
    } catch (cause) {
      setSetupProblem(messageFrom(cause, "That venue image could not be uploaded."));
    } finally {
      setSetupVenueBusy(false);
      setupImageClaim.current = false;
      setSetupImageTarget(null);
      setupImageTargetRef.current = null;
    }
  };
}
export function createFoundingWithSetupImage(ports: {}) {
  return (
    venue: SetupVenueDraft,
    area: "exterior" | "interior" | "private",
    image: VillageVenueImage,
    zoneId?: string,
  ): SetupVenueDraft => {
    return area === "exterior"
      ? { ...venue, presentation: { ...venue.presentation, image } }
      : area === "private"
        ? {
            ...venue,
            privateSpaces: (venue.privateSpaces ?? [personalSpaceDraft()]).map((room) =>
              (zoneId ? room.id === zoneId : room.ownerId === "player") ? { ...room, image } : room,
            ),
          }
        : {
            ...venue,
            spaces: venue.spaces?.map((space, index) =>
              (zoneId ? space.id === zoneId : index === 0) ? { ...space, image } : space,
            ),
          };
  };
}
