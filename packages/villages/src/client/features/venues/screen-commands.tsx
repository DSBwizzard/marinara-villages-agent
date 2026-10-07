import type { VenueClass, VillageSnapshot, VillageVenue } from "../../../shared/contracts/village.js";
import type { AccessCommand } from "../../../shared/helpers/venue-access.js";
import { messageFrom, request } from "../../shared/api.js";
import { venueSpaceFor } from "../../shared/venue.js";
import { editableVenueFields } from "./edit-fields.js";
import type { VenuesState } from "./useVenuesState.js";

/** Always mounted by the shell; the Venue screen supplies explicit current inputs. */
export function useVenueScreenCommands(ports: {
  setBusy: React.Dispatch<React.SetStateAction<boolean>>;
  setSettingsError: React.Dispatch<React.SetStateAction<string>>;
  setSnapshot: React.Dispatch<React.SetStateAction<VillageSnapshot | null>>;
  setVenueEditBusy: VenuesState["setVenueEditBusy"];
  setVenueEditError: VenuesState["setVenueEditError"];
  setVenueEditNotice: VenuesState["setVenueEditNotice"];
  setVenueEditDraft: VenuesState["setVenueEditDraft"];
  setVenueProposalDraft: VenuesState["setVenueProposalDraft"];
  setPlaceProblem: VenuesState["setPlaceProblem"];
}) {
  const {
    setBusy,
    setSettingsError,
    setSnapshot,
    setVenueEditBusy,
    setVenueEditError,
    setVenueEditNotice,
    setVenueEditDraft,
    setVenueProposalDraft,
    setPlaceProblem,
  } = ports;
  const refreshEditor = (place: VillageVenue, next: VillageSnapshot, notice: string) => {
    setSnapshot(next);
    const updated = next.settings.venues.find((entry) => entry.id === place.id);
    if (updated) setVenueEditDraft(structuredClone(updated));
    setVenueEditNotice(notice);
  };
  const saveVenueImageContext = async (
    place: VillageVenue,
    imageContext: NonNullable<VillageVenue["imageContext"]>,
  ) => {
    setBusy(true);
    try {
      setSnapshot(
        await request<VillageSnapshot>("/locations/venue/" + encodeURIComponent(place.id), {
          method: "PUT",
          body: JSON.stringify({ name: place.name, description: place.description, imageContext }),
        }),
      );
    } catch (cause) {
      setSettingsError(messageFrom(cause, "Image context could not be saved."));
    } finally {
      setBusy(false);
    }
  };
  const saveVenueDetails = async (
    place: VillageVenue,
    venueEditDraft: VillageVenue | null,
    occupiedResidence: boolean,
    classes: readonly VenueClass[],
  ) => {
    if (!venueEditDraft) return;
    if (
      venueEditDraft.form !== place.form ||
      JSON.stringify(venueEditDraft.classes) !== JSON.stringify(place.classes) ||
      JSON.stringify(venueEditDraft.workerIds ?? []) !== JSON.stringify(place.workerIds ?? []) ||
      JSON.stringify(venueEditDraft.state) !== JSON.stringify(place.state) ||
      venueEditDraft.presentation.x !== place.presentation.x ||
      venueEditDraft.presentation.y !== place.presentation.y
    ) {
      setVenueEditError("Physical edits and map moves need an earned route. Edit only the name or description here.");
      return;
    }
    if (occupiedResidence) {
      const draftFields = editableVenueFields(venueEditDraft, classes);
      const currentFields = editableVenueFields(place, classes);
      const sharedIndex = classes.indexOf("residence");
      const roomChanges =
        (sharedIndex >= 0 &&
          JSON.stringify(draftFields.spaces[sharedIndex]) !== JSON.stringify(currentFields.spaces[sharedIndex])) ||
        JSON.stringify(draftFields.privateSpaces) !== JSON.stringify(currentFields.privateSpaces);
      if (roomChanges && !window.confirm("Saving Venue details will discard unsaved Zone changes. Continue?")) return;
    }
    setVenueEditBusy(true);
    setVenueEditError("");
    setVenueEditNotice("");
    try {
      const next = await request<VillageSnapshot>(`/locations/venue/${encodeURIComponent(place.id)}`, {
        method: "PUT",
        body: JSON.stringify({
          name: venueEditDraft.name,
          venueType: venueEditDraft.venueType,
          description: venueEditDraft.description,
        }),
      });
      refreshEditor(place, next, "Venue details saved.");
    } catch (cause) {
      setVenueEditError(messageFrom(cause, "The Venue could not be saved."));
    } finally {
      setVenueEditBusy(false);
    }
  };
  const proposeRoomEdit = async (
    place: VillageVenue,
    venueEditDraft: VillageVenue | null,
    classes: readonly VenueClass[],
    target: "shared" | "private",
    ownerId = "",
  ) => {
    if (!venueEditDraft) return;
    const space =
      target === "private"
        ? venueEditDraft.privateSpaces?.find((entry) => entry.ownerId === ownerId)
        : venueSpaceFor(venueEditDraft, "residence");
    if (!space) return;
    const remainingDraft = structuredClone(venueEditDraft);
    if (target === "shared")
      remainingDraft.spaces = remainingDraft.spaces?.map((entry) =>
        entry.venueClass === "residence" ? venueSpaceFor(place, "residence") : entry,
      );
    else
      remainingDraft.privateSpaces = remainingDraft.privateSpaces?.map((entry) =>
        entry.ownerId === ownerId
          ? (place.privateSpaces?.find((current) => current.ownerId === ownerId) ?? entry)
          : entry,
      );
    if (
      JSON.stringify(editableVenueFields(remainingDraft, classes)) !==
        JSON.stringify(editableVenueFields(place, classes)) &&
      !window.confirm("Submitting this Zone edit will discard other unsaved changes. Continue?")
    )
      return;
    setVenueEditBusy(true);
    setVenueEditError("");
    setVenueEditNotice("");
    try {
      const next = await request<VillageSnapshot>(`/locations/venue/${encodeURIComponent(place.id)}/edit-proposals`, {
        method: "POST",
        body: JSON.stringify({ target, ownerId, description: space.description, state: space.state }),
      });
      refreshEditor(place, next, `${target === "private" ? "Private Space" : "Common Space"} edit proposed.`);
    } catch (cause) {
      setVenueEditError(messageFrom(cause, "That Zone edit could not be proposed."));
    } finally {
      setVenueEditBusy(false);
    }
  };
  const requestPlayerMove = (placeId: string, playerMovePrivateZoneId: string) => {
    setVenueEditError("");
    return request<VillageSnapshot>(`/locations/venue/${encodeURIComponent(placeId)}/player-move`, {
      method: "POST",
      body: JSON.stringify({ privateZoneId: playerMovePrivateZoneId }),
    })
      .then(setSnapshot)
      .catch((cause) => setVenueEditError(messageFrom(cause, "The move could not be requested.")));
  };
  const changeVenueAccess = async (placeId: string, command: AccessCommand) => {
    setSnapshot(
      await request<VillageSnapshot>("/venues/" + encodeURIComponent(placeId) + "/access", {
        method: "POST",
        body: JSON.stringify(command),
      }),
    );
  };
  const retryPrivateSpacePreparation = async () => {
    setBusy(true);
    try {
      setSnapshot(await request<VillageSnapshot>("/private-spaces/retry", { method: "POST" }));
    } catch (cause) {
      setSettingsError(messageFrom(cause, "Private preparation failed."));
    } finally {
      setBusy(false);
    }
  };
  const saveVenueZone = async (placeId: string, zoneId: string, body: unknown) => {
    try {
      setSnapshot(
        await request<VillageSnapshot>(`/venues/${encodeURIComponent(placeId)}/zones/${encodeURIComponent(zoneId)}`, {
          method: "PUT",
          body: JSON.stringify(body),
        }),
      );
    } catch (cause) {
      setPlaceProblem({ id: placeId, text: messageFrom(cause, "The zone could not be saved.") });
      throw cause;
    }
  };
  const proposeResidenceMove = (residentId: string, moveTargetId: string, movePrivateZoneId: string) => {
    setVenueEditBusy(true);
    return request<VillageSnapshot>("/residences/proposals", {
      method: "POST",
      body: JSON.stringify({
        characterId: residentId,
        venueId: moveTargetId,
        privateZoneId: movePrivateZoneId,
      }),
    })
      .then(setSnapshot)
      .catch((cause) => setVenueEditError(messageFrom(cause, "The move could not be requested.")))
      .finally(() => setVenueEditBusy(false));
  };
  const submitVenueProposal = (
    place: VillageVenue,
    venueProposalDraft: NonNullable<VenuesState["venueProposalDraft"]>,
  ) => {
    setVenueEditBusy(true);
    setVenueEditError("");
    return request<VillageSnapshot>(`/locations/venue/${encodeURIComponent(place.id)}/proposals`, {
      method: "POST",
      body: JSON.stringify({
        classes: venueProposalDraft.classes,
        capacity: venueProposalDraft.capacity,
        ...(venueProposalDraft.title.trim()
          ? {
              slot: venueProposalDraft.slot,
              improvement: {
                title: venueProposalDraft.title,
                description: venueProposalDraft.description,
                extraBeds: venueProposalDraft.extraBeds,
              },
            }
          : {}),
        title: venueProposalDraft.title || `Change ${place.name}`,
        detail: venueProposalDraft.description || `Change Venue Classes or capacity at ${place.name}.`,
      }),
    })
      .then((next) => {
        setSnapshot(next);
        setVenueProposalDraft(null);
        setVenueEditNotice("Proposal submitted.");
      })
      .catch((cause) => setVenueEditError(messageFrom(cause, "The proposal could not be saved.")))
      .finally(() => setVenueEditBusy(false));
  };
  return {
    saveVenueImageContext,
    saveVenueDetails,
    proposeRoomEdit,
    requestPlayerMove,
    changeVenueAccess,
    retryPrivateSpacePreparation,
    saveVenueZone,
    proposeResidenceMove,
    submitVenueProposal,
  };
}
