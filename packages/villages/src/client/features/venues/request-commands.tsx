import type { VenueRequest, VillageSnapshot } from "../../../shared/contracts/village.js";
import { messageFrom, request } from "../../shared/api.js";
import { useCallback } from "react";

/** Always mounted by the shell; the requests page supplies only explicit command inputs. */
export function useVenueRequestCommands(ports: {
  setBusy: React.Dispatch<React.SetStateAction<boolean>>;
  setSettingsError: React.Dispatch<React.SetStateAction<string>>;
  setSnapshot: React.Dispatch<React.SetStateAction<VillageSnapshot | null>>;
  setRequestEdits: React.Dispatch<React.SetStateAction<Record<string, VenueRequest["venueDraft"]>>>;
}) {
  const { setBusy, setSettingsError, setSnapshot, setRequestEdits } = ports;
  const generateRequestDescription = useCallback(
    (entry: VenueRequest, draft: VenueRequest["venueDraft"]) => {
      const edit = (patch: Partial<typeof draft>) =>
        setRequestEdits((current) => ({ ...current, [entry.id]: { ...draft, ...patch } }));
      setBusy(true);
      setSettingsError("");
      return request<{ descriptions: Record<string, string> }>("/locations/venue/descriptions/draft", {
        method: "POST",
        body: JSON.stringify({
          venues: [{ id: entry.id, name: draft.name, classes: draft.classes }],
        }),
      })
        .then((result) => edit({ description: result.descriptions[entry.id] ?? "" }))
        .catch((cause) => setSettingsError(messageFrom(cause, "The description draft could not be generated.")))
        .finally(() => setBusy(false));
    },
    [setBusy, setSettingsError, setRequestEdits],
  );
  const decideHomeUpgrade = useCallback(
    (entry: { id: string }, approved: boolean) => {
      setBusy(true);
      setSettingsError("");
      return request<VillageSnapshot>(
        `/venue-upgrades/${encodeURIComponent(entry.id)}/${approved ? "approve" : "deny"}`,
        { method: "POST" },
      )
        .then(setSnapshot)
        .catch((cause) => setSettingsError(messageFrom(cause, "The upgrade request could not be decided.")))
        .finally(() => setBusy(false));
    },
    [setBusy, setSettingsError, setSnapshot],
  );
  const completeResidenceMove = useCallback(
    (entry: { characterId: string }) => {
      setBusy(true);
      setSettingsError("");
      return request<VillageSnapshot>("/residences/debug/complete-now", {
        method: "POST",
        body: JSON.stringify({ characterId: entry.characterId }),
      })
        .then(setSnapshot)
        .catch((cause) => setSettingsError(messageFrom(cause, "The move could not be completed.")))
        .finally(() => setBusy(false));
    },
    [setBusy, setSettingsError, setSnapshot],
  );
  const decideResidenceMove = useCallback(
    (entry: { characterId: string }, approved: boolean) => {
      setBusy(true);
      setSettingsError("");
      return request<VillageSnapshot>(`/residences/${approved ? "approvals" : "denials"}`, {
        method: "POST",
        body: JSON.stringify({ characterId: entry.characterId }),
      })
        .then(setSnapshot)
        .catch((cause) => setSettingsError(messageFrom(cause, "The move request could not be decided.")))
        .finally(() => setBusy(false));
    },
    [setBusy, setSettingsError, setSnapshot],
  );
  return { generateRequestDescription, decideHomeUpgrade, completeResidenceMove, decideResidenceMove };
}
