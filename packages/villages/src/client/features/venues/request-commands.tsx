import type { VenueRequest, VillageSnapshot } from "../../../shared/contracts/village.js";
import { messageFrom, request } from "../../shared/api.js";
import { useVillageMutationLifetime } from "../../shared/mutation-lifetime.js";
import { useCallback, useLayoutEffect, useRef } from "react";

/** Always mounted by the shell; the requests page supplies only explicit command inputs. */
export function useVenueRequestCommands(ports: {
  snapshot: VillageSnapshot | null;
  setBusy: React.Dispatch<React.SetStateAction<boolean>>;
  setSettingsError: React.Dispatch<React.SetStateAction<string>>;
  setSnapshot: React.Dispatch<React.SetStateAction<VillageSnapshot | null>>;
  setRequestEdits: React.Dispatch<React.SetStateAction<Record<string, VenueRequest["venueDraft"]>>>;
}) {
  const { setBusy, setSettingsError, setSnapshot, setRequestEdits } = ports;
  const lifetime = useVillageMutationLifetime(ports.snapshot?.isFounded, setBusy);
  const requestSources = useRef(ports.snapshot?.venueRequests ?? []);
  useLayoutEffect(() => {
    requestSources.current = ports.snapshot?.venueRequests ?? [];
  }, [ports.snapshot]);
  const generateRequestDescription = useCallback(
    async (entry: VenueRequest, draft: VenueRequest["venueDraft"]) => {
      const claim = lifetime.begin();
      if (!claim) return;
      setBusy(true);
      setSettingsError("");
      try {
        const submitted = JSON.stringify([draft.name, draft.classes, draft.description]);
        const result = await request<{ descriptions: Record<string, string> }>("/locations/venue/descriptions/draft", {
          method: "POST",
          body: JSON.stringify({
            venues: [{ id: entry.id, name: draft.name, classes: draft.classes }],
          }),
        });
        if (!lifetime.owns(claim)) return;
        setRequestEdits((current) => {
          const source = requestSources.current.find((request) => request.id === entry.id);
          const latest = current[entry.id] ?? source?.venueDraft;
          if (!source || !latest || JSON.stringify([latest.name, latest.classes, latest.description]) !== submitted)
            return current;
          return { ...current, [entry.id]: { ...latest, description: result.descriptions[entry.id] ?? "" } };
        });
      } catch (cause) {
        if (lifetime.owns(claim)) setSettingsError(messageFrom(cause, "The description draft could not be generated."));
      } finally {
        if (lifetime.finish(claim)) setBusy(false);
      }
    },
    [lifetime, setBusy, setSettingsError, setRequestEdits],
  );
  const decideHomeUpgrade = useCallback(
    async (entry: { id: string }, approved: boolean) => {
      const claim = lifetime.begin();
      if (!claim) return;
      setBusy(true);
      setSettingsError("");
      try {
        const next = await request<VillageSnapshot>(
          `/venue-upgrades/${encodeURIComponent(entry.id)}/${approved ? "approve" : "deny"}`,
          { method: "POST" },
        );
        if (lifetime.owns(claim)) setSnapshot(next);
      } catch (cause) {
        if (lifetime.owns(claim)) setSettingsError(messageFrom(cause, "The upgrade request could not be decided."));
      } finally {
        if (lifetime.finish(claim)) setBusy(false);
      }
    },
    [lifetime, setBusy, setSettingsError, setSnapshot],
  );
  const completeResidenceMove = useCallback(
    async (entry: { characterId: string }) => {
      const claim = lifetime.begin();
      if (!claim) return;
      setBusy(true);
      setSettingsError("");
      try {
        const next = await request<VillageSnapshot>("/residences/debug/complete-now", {
          method: "POST",
          body: JSON.stringify({ characterId: entry.characterId }),
        });
        if (lifetime.owns(claim)) setSnapshot(next);
      } catch (cause) {
        if (lifetime.owns(claim)) setSettingsError(messageFrom(cause, "The move could not be completed."));
      } finally {
        if (lifetime.finish(claim)) setBusy(false);
      }
    },
    [lifetime, setBusy, setSettingsError, setSnapshot],
  );
  const decideResidenceMove = useCallback(
    async (entry: { characterId: string }, approved: boolean) => {
      const claim = lifetime.begin();
      if (!claim) return;
      setBusy(true);
      setSettingsError("");
      try {
        const next = await request<VillageSnapshot>(`/residences/${approved ? "approvals" : "denials"}`, {
          method: "POST",
          body: JSON.stringify({ characterId: entry.characterId }),
        });
        if (lifetime.owns(claim)) setSnapshot(next);
      } catch (cause) {
        if (lifetime.owns(claim)) setSettingsError(messageFrom(cause, "The move request could not be decided."));
      } finally {
        if (lifetime.finish(claim)) setBusy(false);
      }
    },
    [lifetime, setBusy, setSettingsError, setSnapshot],
  );
  return { generateRequestDescription, decideHomeUpgrade, completeResidenceMove, decideResidenceMove };
}
