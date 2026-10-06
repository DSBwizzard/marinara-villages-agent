import type { MemoryLibrary, VillagerAgendaView, VillagerRefreshPreview } from "../../../shared/contracts/village.js";
import type { PortraitMap } from "../../shared/types.js";
import type { DossierNavigation, DossierSection } from "./villages-dossier.js";
import { useRef, useState } from "react";

/** Always mounted by the application controller so navigation retains this feature state. */
export function useResidentsState() {
  const [memoryLibrary, setMemoryLibrary] = useState<MemoryLibrary | null>(null);

  /**
   * What each villager is privately after, read when the debug option is opened.
   *
   * The only place any of this is ever shown, and deliberately the only place:
   * a wish is what a villager does things for rather than a task they were given,
   * and the only part the player has in one is the verb that settles it.
   * Putting the list on the villager tile or in the chat would turn a private
   * motivation into an objective, which is the one shape the whole slice exists
   * to avoid.
   */
  const [agendas, setAgendas] = useState<VillagerAgendaView[] | null>(null);

  /**
   * Which pin on the map is showing its doors.
   *
   * A place with somebody standing in it offers two answers rather than taking
   * one on the player's behalf, and this is which pin is holding that choice
   * open. An id rather than a record, for the same reason `venueId` is: the
   * village is re-read on a timer, and a place that has left the map in the
   * meantime simply stops having any doors to draw.
   */
  const [personProfile, setPersonProfile] = useState<DossierNavigation | null>(null);

  const [profileInspection, setProfileInspection] = useState<DossierSection | null>(null);

  const [rosterSearch, setRosterSearch] = useState("");

  const profileOrigin = useRef<{ selector: string; scroll: Array<{ selector: string; top: number }> }>({
    selector: "",
    scroll: [],
  });

  const [spriteManagerId, setSpriteManagerId] = useState<string | null>(null);

  const spriteLeaveGuard = useRef<(() => boolean) | null>(null);

  const spriteProfileScroll = useRef(0);

  /**
   * Portraits, by character id, as the Engine has been willing to hand them over.
   *
   * Held in the tab rather than read per drawer, because the same picture is
   * drawn in three places — the villager list, the picker, and the conversation —
   * and a second request for a picture already in hand is a second request the
   * Engine has to answer for nothing. A character with no entry is a character
   * with no picture, which is an ordinary character and not a failure.
   */
  const [portraits, setPortraits] = useState<PortraitMap>({});

  const [refreshPreviews, setRefreshPreviews] = useState<Record<string, VillagerRefreshPreview>>({});

  const [refreshBusyId, setRefreshBusyId] = useState("");

  /**
   * Save the automatic-update switches.
   *
   * These two settings are the only ones in the tab that are saved the moment
   * they are clicked rather than into a draft a button sends later, and the
   * reason is what they control. They are read by the server's own timer, which
   * has no idea whether this panel is open, so a switch waiting for a Save
   * press would leave the village doing the wrong thing for as long as the
   * panel was left sitting there. A checkbox is also read as already true the
   * moment it is clicked, in a way a text box is not, so the honest thing is to
   * make it true.
   *
   * Either half may be sent alone — the route writes only the fields it is
   * given — and the response carries the whole snapshot, so every switch is
   * redrawn from what was actually stored rather than from what was clicked.
   * That is what keeps a switch from showing a setting the village did not
   * accept.
   */
  const [spriteFlipSaving, setSpriteFlipSaving] = useState(false);

  const [spriteFlipDraft, setSpriteFlipDraft] = useState<boolean | null>(null);

  const [spriteFlipError, setSpriteFlipError] = useState("");

  /**
   * Portraits already asked about, including the ones the Engine had none of.
   *
   * A ref rather than a fact read off `portraits`, because "nobody has asked
   * about this character" and "asked, and there is no picture" leave the same
   * empty entry behind — and without somewhere to tell them apart the tab would
   * ask for the same missing faces on every render for as long as the drawer was
   * open.
   */
  const portraitsAsked = useRef<Set<string>>(new Set());
  return {
    memoryLibrary,
    setMemoryLibrary,
    agendas,
    setAgendas,
    personProfile,
    setPersonProfile,
    profileInspection,
    setProfileInspection,
    rosterSearch,
    setRosterSearch,
    profileOrigin,
    spriteManagerId,
    setSpriteManagerId,
    spriteLeaveGuard,
    spriteProfileScroll,
    portraits,
    setPortraits,
    refreshPreviews,
    setRefreshPreviews,
    refreshBusyId,
    setRefreshBusyId,
    spriteFlipSaving,
    setSpriteFlipSaving,
    spriteFlipDraft,
    setSpriteFlipDraft,
    spriteFlipError,
    setSpriteFlipError,
    portraitsAsked,
  };
}

export type ResidentsState = ReturnType<typeof useResidentsState>;
