import type { SetupMapRequest, VillageVenue, VillageVenueImage } from "../../../shared/contracts/village.js";
import { messageFrom, request } from "../../shared/api.js";
import { ELEMENT_TAG } from "../../shared/constants.js";
import { readFileAsDataUrl } from "../../shared/presentation.js";
import { createVillagesClientId } from "../../shared/request-id.js";
import type { SetupVenueDraft } from "../../shared/types.js";

import type { useFoundingSetupDraftData } from "./controller-hooks.js";
import { requestSetupMapReceipt } from "./FoundingPanels.js";
import type { FoundingState } from "./useFoundingState.js";
import { personalSpaceDraft } from "./villages-founding-editor";
import { useCallback } from "react";

export function useFoundingGenerateSetupTownMap(ports: {
  readonly persistSetupDraft: (data: import("./draft-model").SetupDraftData) => Promise<void>;
  readonly sceneryStyle: FoundingState["sceneryStyle"];
  readonly sceneryStyleProfileId: FoundingState["sceneryStyleProfileId"];
  readonly setSetupMapBusy: FoundingState["setSetupMapBusy"];
  readonly setSetupMapProblem: FoundingState["setSetupMapProblem"];
  readonly setSetupProblem: FoundingState["setSetupProblem"];
  readonly setupDraftData: ReturnType<typeof useFoundingSetupDraftData>;
  readonly setupLorebookDraft: FoundingState["setupLorebookDraft"];
  readonly setupLoreTokenBudgetDraft: FoundingState["setupLoreTokenBudgetDraft"];
  readonly setupMapGenerationKey: string;
  readonly setupMapNegativePrompt: FoundingState["setupMapNegativePrompt"];
  readonly setupMapPrompt: FoundingState["setupMapPrompt"];
  readonly setupMapRequestRef: FoundingState["setupMapRequestRef"];
  readonly setupWorldName?: string;
  readonly setupSetting: FoundingState["setupSetting"];
  readonly setupContext: FoundingState["setupContext"];
  readonly snapshot: import("../../../shared/contracts/village").VillageSnapshot;
  readonly updateSetupMapRequest: (value: import("../../../shared/contracts/village").SetupMapRequest) => void;
}) {
  const {
    persistSetupDraft,
    sceneryStyle,
    sceneryStyleProfileId,
    setSetupMapBusy,
    setSetupMapProblem,
    setSetupProblem,
    setupDraftData,
    setupLorebookDraft,
    setupLoreTokenBudgetDraft,
    setupMapGenerationKey,
    setupMapNegativePrompt,
    setupMapPrompt,
    setupMapRequestRef,
    setupSetting,
    setupContext,
    snapshot,
    updateSetupMapRequest,
  } = ports;
  const { setupWorldName } = ports;

  return useCallback(async () => {
    if (setupMapRequestRef.current?.phase === "starting" || setupMapRequestRef.current?.phase === "waiting") return;
    if (setupSetting.trim().length === 0) {
      setSetupMapProblem("Describe the starting location before generating its map.");
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
    let dispatched = false;
    try {
      // Keep the receipt ID before the paid request, so a reload only retrieves it.
      await persistSetupDraft({ ...setupDraftData, mapRequest: pending, mapProblem: "", interruptedGeneration: false });
      dispatched = true;
      const receipt = await requestSetupMapReceipt("/maps/generate", {
        method: "POST",
        body: JSON.stringify({
          actionId: pending.id,
          targetId: "founding-map",
          sourceKey: pending.sourceKey,
          structure: setupMapPrompt === snapshot?.settings.townMapLayoutPrompt ? undefined : setupMapPrompt,
          negative:
            setupMapNegativePrompt === snapshot?.settings.townMapNegativePrompt ? undefined : setupMapNegativePrompt,
          setting: setupSetting,
          worldName: setupWorldName,
          selectedLorebookIds: setupLorebookDraft,
          loreTokenBudget: setupLoreTokenBudgetDraft,
          sceneryArtStyle: sceneryStyle,
          sceneryStyleProfileId,
          worldRules: setupContext.rules,
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
        `${messageFrom(cause, "The starting location map could not be requested.")}${dispatched ? " Check map status before starting another attempt." : ""}`,
      );
      updateSetupMapRequest(dispatched ? { ...pending, phase: "paused" } : null);
      setSetupMapBusy(false);
    }
  }, [
    setupMapRequestRef,
    setupSetting,
    setSetupMapBusy,
    setSetupMapProblem,
    setSetupProblem,
    setupMapGenerationKey,
    updateSetupMapRequest,
    persistSetupDraft,
    setupDraftData,
    setupMapPrompt,
    snapshot?.settings?.townMapLayoutPrompt,
    snapshot?.settings?.townMapNegativePrompt,
    setupMapNegativePrompt,
    setupWorldName,
    setupLorebookDraft,
    setupLoreTokenBudgetDraft,
    sceneryStyle,
    sceneryStyleProfileId,
    setupContext,
  ]);
}
export function createFoundingSetupDraftRow() {
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
      venueClass: venue.classes?.[0] ?? "other",
      residentIds: venue.residentIds ?? [],
      playerHome: venue.occupancy.playerHome,
    };
  };
}
export function createFoundingGenerateSetupImage(ports: {
  readonly element: HTMLElement;
  readonly personaDraft: string;
  readonly personalizeHomes: FoundingState["personalizeHomes"];
  readonly sceneryStyle: FoundingState["sceneryStyle"];
  readonly sceneryStyleProfileId: FoundingState["sceneryStyleProfileId"];
  readonly selectedResidentAdmissions: {
    [k: string]: import("../../../shared/helpers/resident-admission").ResidentAdmission;
  };
  readonly setSelectedSetupVenueId: FoundingState["setSelectedSetupVenueId"];
  readonly setSetupImageTarget: FoundingState["setSetupImageTarget"];
  readonly setSetupProblem: FoundingState["setSetupProblem"];
  readonly setSetupVenueBusy: FoundingState["setSetupVenueBusy"];
  readonly setSetupVenues: FoundingState["setSetupVenues"];
  readonly setupDraftRow: ReturnType<typeof createFoundingSetupDraftRow>;

  readonly setupImageClaim: FoundingState["setupImageClaim"];
  readonly setupImageContextKey: string;
  readonly setupImageContextKeyRef: React.RefObject<string>;
  readonly setupImageTargetRef: FoundingState["setupImageTargetRef"];

  readonly setupLorebookDraft: FoundingState["setupLorebookDraft"];
  readonly setupLoreTokenBudgetDraft: FoundingState["setupLoreTokenBudgetDraft"];
  readonly setupName: FoundingState["setupName"];
  readonly setupWorldName?: string;
  readonly setupSetting: FoundingState["setupSetting"];
  readonly setupVenuesRef: React.RefObject<import("../../../shared/contracts/village").VillageVenue[]>;
  readonly setupContext: FoundingState["setupContext"];
  readonly snapshot: import("../../../shared/contracts/village").VillageSnapshot;
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
      sceneryStyle,
      sceneryStyleProfileId,
      selectedResidentAdmissions,
      setSelectedSetupVenueId,
      setSetupImageTarget,
      setSetupProblem,
      setSetupVenueBusy,
      setSetupVenues,
      setupDraftRow,

      setupImageClaim,
      setupImageContextKey,
      setupImageContextKeyRef,
      setupImageTargetRef,

      setupLorebookDraft,
      setupLoreTokenBudgetDraft,
      setupName,
      setupSetting,
      setupVenuesRef,
      setupContext,
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
        reference: row.pictureReference?.id,
        zone: [...(row.spaces ?? []), ...(row.privateSpaces ?? [])]
          .filter((zone) => zone.id === zoneId)
          .map(({ id, name, purpose, description, pictureReference }) => ({
            id,
            name,
            purpose,
            description,
            reference: pictureReference?.id,
          })),
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
          reference: selectedArea?.pictureReference ?? (area === "exterior" ? venue.pictureReference : undefined),
          privateOwnerId: area === "private" ? selectedArea?.ownerId : undefined,
          privateDescription: description,
          foundingResidentAdmissions: Object.fromEntries(
            (venue.residentIds ?? []).map((id) => [id, selectedResidentAdmissions[id]]),
          ),
          playerPersonaId: personaDraft,
          sceneryArtStyle: sceneryStyle,
          sceneryStyleProfileId,
          useAssignedVillagerContext: true,
          villageName: setupName,
          setting: setupSetting,
          context: setupContext,
          selectedLorebookIds: setupLorebookDraft,
          loreTokenBudget: setupLoreTokenBudgetDraft,
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
      patchSetupVenue(venue.id, (row) =>
        area === "exterior"
          ? { ...row, pictureReference: image, referenceAppliedId: undefined }
          : {
              ...row,
              [area === "private" ? "privateSpaces" : "spaces"]: (area === "private"
                ? row.privateSpaces
                : row.spaces
              )?.map((room, index) =>
                (zoneId ? room.id === zoneId : index === 0)
                  ? { ...room, pictureReference: image, referenceAppliedId: undefined }
                  : room,
              ),
            },
      );
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
export function createFoundingWithSetupImage() {
  return (
    venue: SetupVenueDraft,
    area: "exterior" | "interior" | "private",
    image: VillageVenueImage,
    zoneId?: string,
  ): SetupVenueDraft => {
    return area === "exterior"
      ? {
          ...venue,
          referenceAppliedId: venue.pictureReference?.id,
          daylightReady: true,
          pictureContext: JSON.stringify({
            description: venue.description,
            ...(venue.form ? { form: venue.form } : {}),
          }),
          presentation: { ...venue.presentation, image },
        }
      : area === "private"
        ? {
            ...venue,
            privateSpaces: (venue.privateSpaces ?? [personalSpaceDraft()]).map((room) =>
              (zoneId ? room.id === zoneId : room.ownerId === "player")
                ? {
                    ...room,
                    image,
                    daylightReady: true,
                    pictureContext: JSON.stringify({
                      description: room.description,
                      ...(venue.form ? { form: venue.form } : {}),
                    }),
                    referenceAppliedId: room.pictureReference?.id,
                  }
                : room,
            ),
          }
        : {
            ...venue,
            spaces: venue.spaces?.map((space, index) =>
              (zoneId ? space.id === zoneId : index === 0)
                ? {
                    ...space,
                    image,
                    daylightReady: true,
                    pictureContext: JSON.stringify({
                      description: space.description,
                      ...(venue.form ? { form: venue.form } : {}),
                    }),
                    referenceAppliedId: space.pictureReference?.id,
                  }
                : space,
            ),
          };
  };
}
