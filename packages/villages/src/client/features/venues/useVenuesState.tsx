import type { VenueClass, VillageVenue } from "../../shared/types.js";
import { useState } from "react";

/** Always mounted by the application controller so navigation retains this feature state. */
export function useVenuesState() {
  /**
   * Which place the venue screen is standing in.
   *
   * An id rather than the record, because the record is re-read on a timer and
   * after every model call: a copy kept here would be a room whose picture could
   * appear while the player was looking at it and never reach the screen. The
   * cost is that this can point at a place that has since been deleted, and the
   * screen says so rather than pretending.
   */
  const [venueId, setVenueId] = useState<string | null>(null);

  const [venuePage, setVenuePage] = useState<"view" | "edit" | "proposal">("view");

  const [venueZoneKey, setVenueZoneKey] = useState("exterior");

  const [venueEditDraft, setVenueEditDraft] = useState<VillageVenue | null>(null);

  const [venueProposalDraft, setVenueProposalDraft] = useState<{
    classes: VenueClass[];
    capacity: number;
    slot: number;
    title: string;
    description: string;
    extraBeds: number;
  } | null>(null);

  const [venueEditBusy, setVenueEditBusy] = useState(false);

  const [venueEditError, setVenueEditError] = useState("");

  const [venueEditNotice, setVenueEditNotice] = useState("");

  const [moveTargetId, setMoveTargetId] = useState("");

  const [playerMovePrivateZoneId, setPlayerMovePrivateZoneId] = useState("");

  const [movePrivateZoneId, setMovePrivateZoneId] = useState("");

  const [venuesDraft, setVenuesDraft] = useState<VillageVenue[]>([]);

  const [venueSearch, setVenueSearch] = useState("");

  /**
   * Which place is being drawn, or given a picture, or having one taken away —
   * by id, or "" for none.
   *
   * Its own flag rather than the panel's shared `busy`, because drawing is the
   * one thing in this tab that can take a minute. A shared flag would grey out
   * the map, the noticeboard and every save button for as long as a model takes,
   * and the panel would be unusable for exactly as long as it is most worth
   * using. Only the row being worked on goes quiet.
   */
  const [placeBusyId, setPlaceBusyId] = useState("");

  /**
   * What the last picture attempt had to say, and which place it was about.
   *
   * Held as a pair rather than as a single sentence so the message is drawn
   * under the row it belongs to: two places being given pictures in a row would
   * otherwise leave the first one's refusal sitting under the second one's name.
   */
  const [placeProblem, setPlaceProblem] = useState<{ id: string; text: string } | null>(null);
  return {
    venueId,
    setVenueId,
    venuePage,
    setVenuePage,
    venueZoneKey,
    setVenueZoneKey,
    venueEditDraft,
    setVenueEditDraft,
    venueProposalDraft,
    setVenueProposalDraft,
    venueEditBusy,
    setVenueEditBusy,
    venueEditError,
    setVenueEditError,
    venueEditNotice,
    setVenueEditNotice,
    moveTargetId,
    setMoveTargetId,
    playerMovePrivateZoneId,
    setPlayerMovePrivateZoneId,
    movePrivateZoneId,
    setMovePrivateZoneId,
    venuesDraft,
    setVenuesDraft,
    venueSearch,
    setVenueSearch,
    placeBusyId,
    setPlaceBusyId,
    placeProblem,
    setPlaceProblem,
  };
}
