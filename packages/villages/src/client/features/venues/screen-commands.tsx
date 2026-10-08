import type { VenueClass, VillageSnapshot, VillageVenue } from "../../../shared/contracts/village.js";
import type { AccessCommand } from "../../../shared/helpers/venue-access.js";
import { messageFrom, request } from "../../shared/api.js";
import { useVillageMutationLifetime } from "../../shared/mutation-lifetime.js";
import { venueSpaceFor } from "../../shared/venue.js";
import { editableVenueFields } from "./edit-fields.js";
import type { VenuesState } from "./useVenuesState.js";
import { useLayoutEffect, useMemo, useRef } from "react";

function editorDraftKey(draft: VillageVenue, classes: readonly VenueClass[]) {
  return JSON.stringify([
    draft.classes,
    draft.residenceCapacity,
    draft.state,
    draft.description,
    editableVenueFields(draft, classes),
  ]);
}
function proposalDraftKey(draft: NonNullable<VenuesState["venueProposalDraft"]>) {
  return JSON.stringify([draft.classes, draft.capacity, draft.slot, draft.title, draft.description, draft.extraBeds]);
}

/** Always mounted by the shell; the Venue screen supplies explicit current inputs. */
export function useVenueScreenCommands(ports: {
  snapshot: VillageSnapshot | null;
  screen: string;
  venueId: string | null;
  venuePage: VenuesState["venuePage"];
  venueZoneKey: string;
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
  const unfounded = ports.snapshot?.isFounded === false;
  const committedUnfounded = useRef(unfounded);
  useLayoutEffect(() => {
    committedUnfounded.current = unfounded;
  }, [unfounded]);
  const selectedVenue = ports.snapshot?.settings.venues.find((entry) => entry.id === ports.venueId);
  const activeVenueId = ports.screen === "venue" ? (selectedVenue?.id ?? null) : null;
  const selectedZoneId =
    selectedVenue?.zones?.find((entry) => entry.id === ports.venueZoneKey)?.id ??
    selectedVenue?.zones?.[0]?.id ??
    ports.venueZoneKey;
  const venueSelection = useMemo(() => ({ activeVenueId, page: ports.venuePage }), [activeVenueId, ports.venuePage]);
  const zoneSelection = useMemo(() => ({ venueSelection, key: selectedZoneId }), [venueSelection, selectedZoneId]);
  // Access already remounts its panel when the authoritative access revision changes.
  const accessRevision = selectedVenue?.accessView?.revision;
  const accessSelection = useMemo(() => ({ zoneSelection, accessRevision }), [zoneSelection, accessRevision]);
  const global = useVillageMutationLifetime(ports.snapshot?.isFounded, setBusy, venueSelection);
  const editor = useVillageMutationLifetime(ports.snapshot?.isFounded, setVenueEditBusy, venueSelection);
  const player = useVillageMutationLifetime(ports.snapshot?.isFounded, undefined, venueSelection);
  const access = useVillageMutationLifetime(ports.snapshot?.isFounded, undefined, accessSelection);
  const zone = useVillageMutationLifetime(ports.snapshot?.isFounded, undefined, zoneSelection);
  const isCurrentVenue = (id: string) => !!activeVenueId && activeVenueId === id;
  const beginGlobal = () => {
    if (!activeVenueId) return null;
    const claim = global.begin();
    if (claim)
      claim.onRetire = () => {
        if (committedUnfounded.current === unfounded) setBusy(false);
      };
    return claim;
  };
  const refreshEditor = (
    place: VillageVenue,
    submitted: string,
    classes: readonly VenueClass[],
    next: VillageSnapshot,
    notice: string,
  ) => {
    setSnapshot(next);
    const updated = next.settings.venues.find((entry) => entry.id === place.id);
    if (updated)
      setVenueEditDraft((current) =>
        current?.id === place.id && editorDraftKey(current, classes) === submitted ? structuredClone(updated) : current,
      );
    setVenueEditNotice(notice);
  };
  const saveVenueImageContext = async (
    place: VillageVenue,
    imageContext: NonNullable<VillageVenue["imageContext"]>,
  ) => {
    if (!isCurrentVenue(place.id)) return;
    const claim = beginGlobal();
    if (!claim) return;
    setBusy(true);
    try {
      const next = await request<VillageSnapshot>("/locations/venue/" + encodeURIComponent(place.id), {
        method: "PUT",
        body: JSON.stringify({ name: place.name, description: place.description, imageContext }),
      });
      if (global.owns(claim)) setSnapshot(next);
    } catch (cause) {
      if (global.owns(claim)) setSettingsError(messageFrom(cause, "Image context could not be saved."));
    } finally {
      if (global.finish(claim)) setBusy(false);
    }
  };
  const saveVenueDetails = async (
    place: VillageVenue,
    venueEditDraft: VillageVenue | null,
    occupiedResidence: boolean,
    classes: readonly VenueClass[],
  ) => {
    if (!isCurrentVenue(place.id) || !venueEditDraft || venueEditDraft.id !== place.id) return;
    const claim = editor.begin();
    if (!claim) return;
    let started = false;
    claim.onRetire = () => {
      if (started) setVenueEditBusy(false);
    };
    try {
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
      if (!editor.owns(claim)) return;
      const submitted = editorDraftKey(venueEditDraft, classes);
      started = true;
      setVenueEditBusy(true);
      setVenueEditError("");
      setVenueEditNotice("");
      const next = await request<VillageSnapshot>(`/locations/venue/${encodeURIComponent(place.id)}`, {
        method: "PUT",
        body: JSON.stringify({
          name: venueEditDraft.name,
          venueType: venueEditDraft.venueType,
          description: venueEditDraft.description,
        }),
      });
      if (editor.owns(claim)) refreshEditor(place, submitted, classes, next, "Venue details saved.");
    } catch (cause) {
      if (editor.owns(claim)) setVenueEditError(messageFrom(cause, "The Venue could not be saved."));
    } finally {
      if (editor.finish(claim) && started) setVenueEditBusy(false);
    }
  };
  const proposeRoomEdit = async (
    place: VillageVenue,
    venueEditDraft: VillageVenue | null,
    classes: readonly VenueClass[],
    target: "shared" | "private",
    ownerId = "",
  ) => {
    if (!isCurrentVenue(place.id) || !venueEditDraft || venueEditDraft.id !== place.id) return;
    const claim = editor.begin();
    if (!claim) return;
    let started = false;
    claim.onRetire = () => {
      if (started) setVenueEditBusy(false);
    };
    try {
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
      if (!editor.owns(claim)) return;
      const submitted = editorDraftKey(venueEditDraft, classes);
      started = true;
      setVenueEditBusy(true);
      setVenueEditError("");
      setVenueEditNotice("");
      const next = await request<VillageSnapshot>(`/locations/venue/${encodeURIComponent(place.id)}/edit-proposals`, {
        method: "POST",
        body: JSON.stringify({ target, ownerId, description: space.description, state: space.state }),
      });
      if (editor.owns(claim))
        refreshEditor(
          place,
          submitted,
          classes,
          next,
          `${target === "private" ? "Private Space" : "Common Space"} edit proposed.`,
        );
    } catch (cause) {
      if (editor.owns(claim)) setVenueEditError(messageFrom(cause, "That Zone edit could not be proposed."));
    } finally {
      if (editor.finish(claim) && started) setVenueEditBusy(false);
    }
  };
  const requestPlayerMove = async (placeId: string, playerMovePrivateZoneId: string) => {
    if (!isCurrentVenue(placeId)) return;
    const claim = player.begin();
    if (!claim) return;
    setVenueEditError("");
    try {
      const next = await request<VillageSnapshot>(`/locations/venue/${encodeURIComponent(placeId)}/player-move`, {
        method: "POST",
        body: JSON.stringify({ privateZoneId: playerMovePrivateZoneId }),
      });
      if (player.owns(claim)) setSnapshot(next);
    } catch (cause) {
      if (player.owns(claim)) setVenueEditError(messageFrom(cause, "The move could not be requested."));
    } finally {
      player.finish(claim);
    }
  };
  const changeVenueAccess = async (placeId: string, command: AccessCommand) => {
    if (!isCurrentVenue(placeId) || (command.zoneId !== null && command.zoneId !== selectedZoneId)) return false;
    const claim = access.begin();
    if (!claim) return false;
    try {
      const next = await request<VillageSnapshot>("/venues/" + encodeURIComponent(placeId) + "/access", {
        method: "POST",
        body: JSON.stringify(command),
      });
      if (!access.owns(claim)) return false;
      setSnapshot(next);
      return true;
    } catch (cause) {
      if (access.owns(claim)) throw cause;
      return false;
    } finally {
      access.finish(claim);
    }
  };
  const retryPrivateSpacePreparation = async () => {
    const claim = beginGlobal();
    if (!claim) return;
    setBusy(true);
    try {
      const next = await request<VillageSnapshot>("/private-spaces/retry", { method: "POST" });
      if (global.owns(claim)) setSnapshot(next);
    } catch (cause) {
      if (global.owns(claim)) setSettingsError(messageFrom(cause, "Private preparation failed."));
    } finally {
      if (global.finish(claim)) setBusy(false);
    }
  };
  const saveVenueZone = async (placeId: string, zoneId: string, body: unknown) => {
    if (!isCurrentVenue(placeId) || zoneId !== selectedZoneId) return false;
    const claim = zone.begin();
    if (!claim) return false;
    try {
      const next = await request<VillageSnapshot>(
        `/venues/${encodeURIComponent(placeId)}/zones/${encodeURIComponent(zoneId)}`,
        {
          method: "PUT",
          body: JSON.stringify(body),
        },
      );
      if (!zone.owns(claim)) return false;
      setSnapshot(next);
      return true;
    } catch (cause) {
      if (!zone.owns(claim)) return false;
      setPlaceProblem({ id: placeId, text: messageFrom(cause, "The zone could not be saved.") });
      throw cause;
    } finally {
      zone.finish(claim);
    }
  };
  const proposeResidenceMove = async (residentId: string, moveTargetId: string, movePrivateZoneId: string) => {
    if (!activeVenueId) return;
    const claim = editor.begin();
    if (!claim) return;
    claim.onRetire = () => setVenueEditBusy(false);
    setVenueEditBusy(true);
    try {
      const next = await request<VillageSnapshot>("/residences/proposals", {
        method: "POST",
        body: JSON.stringify({
          characterId: residentId,
          venueId: moveTargetId,
          privateZoneId: movePrivateZoneId,
        }),
      });
      if (editor.owns(claim)) setSnapshot(next);
    } catch (cause) {
      if (editor.owns(claim)) setVenueEditError(messageFrom(cause, "The move could not be requested."));
    } finally {
      if (editor.finish(claim)) setVenueEditBusy(false);
    }
  };
  const submitVenueProposal = async (
    place: VillageVenue,
    venueProposalDraft: NonNullable<VenuesState["venueProposalDraft"]>,
  ) => {
    if (!isCurrentVenue(place.id)) return;
    const claim = editor.begin();
    if (!claim) return;
    claim.onRetire = () => setVenueEditBusy(false);
    const submitted = proposalDraftKey(venueProposalDraft);
    setVenueEditBusy(true);
    setVenueEditError("");
    try {
      const next = await request<VillageSnapshot>(`/locations/venue/${encodeURIComponent(place.id)}/proposals`, {
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
      });
      if (!editor.owns(claim)) return;
      setSnapshot(next);
      setVenueProposalDraft((current) => (current && proposalDraftKey(current) === submitted ? null : current));
      setVenueEditNotice("Proposal submitted.");
    } catch (cause) {
      if (editor.owns(claim)) setVenueEditError(messageFrom(cause, "The proposal could not be saved."));
    } finally {
      if (editor.finish(claim)) setVenueEditBusy(false);
    }
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
