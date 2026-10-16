import type { ResidentsState } from "./useResidentsState.js";
import type { CatalogResponse } from "../../../shared/contracts/village.js";
import { messageFrom, request } from "../../shared/api.js";
import { readPersonaPortrait, readPortraits } from "./ResidentPanels.js";
import { useCallback, useEffect } from "react";

export function useResidentsLoadCatalog(ports: {
  readonly setCatalog: React.Dispatch<React.SetStateAction<import("../../../shared/contracts/village").CatalogEntry[]>>;
  readonly setError: React.Dispatch<React.SetStateAction<string>>;
}) {
  return useCallback(async (signal?: AbortSignal) => {
    const { setCatalog, setError } = ports;

    try {
      const response = await request<CatalogResponse>("/catalog", { signal });
      setCatalog(response.characters);
      setError("");
    } catch (cause) {
      if (signal?.aborted) return;
      setError(messageFrom(cause, "Could not read your character library."));
    }
  }, []);
}

export function useResidentPickerLoad(ports: {
  readonly loadCatalog: (signal?: AbortSignal) => Promise<void>;
  readonly pickerOpen: boolean;
}) {
  useEffect(() => {
    const { loadCatalog, pickerOpen } = ports;

    if (!pickerOpen) return;
    const controller = new AbortController();
    void loadCatalog(controller.signal);
    return () => controller.abort();
  }, [ports.pickerOpen, ports.loadCatalog]);
}

/**
 * The faces behind everybody the tab can draw.
 *
 * One call for the whole list rather than one per villager: the Engine's
 * summary route takes ids in a batch, and a village of twelve asking twelve
 * times is twelve chances to be slow for nothing. Only ids nobody has asked
 * about travel, so opening the picker over a list already on screen costs no
 * call at all, and a search that narrows it costs one small call for whoever
 * has just become visible.
 *
 * Nothing here fails loudly. A picture that could not be read is a villager
 * wearing their initial, which is what they wore before any of this existed —
 * there is no error state to reach and no action the player could take, so a
 * failed read is dropped rather than reported. A character who has since been
 * deleted from the library answers with no row and is remembered as having
 * been asked, so the absence is not re-asked for either.
 */
export function useResidentPortraits(ports: {
  readonly portraitsAsked: ResidentsState["portraitsAsked"];
  readonly portraitWanted: string;
  readonly setPortraits: ResidentsState["setPortraits"];
}) {
  useEffect(() => {
    const { portraitsAsked, portraitWanted, setPortraits } = ports;

    const missing = portraitWanted.split("\n").filter((id) => id.length > 0 && !portraitsAsked.current.has(id));
    if (missing.length === 0) return;
    for (const id of missing) portraitsAsked.current.add(id);
    const controller = new AbortController();
    void (async () => {
      try {
        const read = await readPortraits(missing, controller.signal);
        if (!controller.signal.aborted) setPortraits((current) => ({ ...current, ...read }));
      } catch {
        // The initial is already on screen, and it is the whole fallback.
      }
    })();
    return () => controller.abort();
  }, [ports.portraitWanted]);
}

export function usePersonaPortrait(ports: {
  readonly personaPortraitId: string;
  readonly setPersonaPortrait: React.Dispatch<React.SetStateAction<import("../../shared/types").Portrait>>;
}) {
  useEffect(() => {
    const { personaPortraitId, setPersonaPortrait } = ports;

    setPersonaPortrait(null);
    if (personaPortraitId.length === 0) return;
    const controller = new AbortController();
    void (async () => {
      try {
        const read = await readPersonaPortrait(personaPortraitId, controller.signal);
        if (!controller.signal.aborted) setPersonaPortrait(read);
      } catch {
        // No Persona, no portrait, or nobody to ask: the mark is the fallback
        // and it is already what is drawn.
      }
    })();
    return () => controller.abort();
  }, [ports.personaPortraitId]);
}
