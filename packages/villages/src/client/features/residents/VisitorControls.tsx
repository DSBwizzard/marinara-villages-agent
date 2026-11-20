import { useEffect, useState } from "react";
import type { CatalogResponse, VillageSnapshot, VillageVisitorView } from "../../../shared/contracts/village.js";
import { messageFrom, request } from "../../shared/api.js";
import { useConfirmation } from "../../shared/confirmation.js";
import { ModalDialog } from "../../shared/ModalDialog.js";
import type { ResidentsScreenController } from "./screen-contracts.js";

type VisitorPorts = Pick<ResidentsScreenController, "snapshot" | "setSnapshot">;

async function saveVisitor({ snapshot, setSnapshot }: VisitorPorts, id: string, enabled?: boolean) {
  const scope = snapshot.worldScope;
  const path = "/visitors/" + encodeURIComponent(id);
  const next = await request<VillageSnapshot>(path + (enabled === undefined ? "/move-in" : ""), {
    method: enabled === undefined ? "POST" : "PUT",
    body: JSON.stringify({ scope, enabled }),
  });
  setSnapshot((current) => (current?.worldScope === scope && next.worldScope === scope ? next : current));
}

export function AddVisitorDialog({ snapshot, setSnapshot, onClose }: VisitorPorts & { onClose(): void }) {
  const [catalog, setCatalog] = useState<CatalogResponse["characters"]>([]);
  const [choice, setChoice] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const abort = new AbortController();
    void request<CatalogResponse>("/catalog", { signal: abort.signal })
      .then((value) => {
        if (!abort.signal.aborted) setCatalog(value.characters);
      })
      .catch((cause) => {
        if (!abort.signal.aborted) setError(messageFrom(cause, "Could not read Character Cards."));
      });
    return () => abort.abort();
  }, [snapshot.worldScope]);
  const available = catalog.filter(
    (card) =>
      !card.inVillage &&
      !snapshot.visitors?.some((person) => person.characterId === card.id) &&
      !snapshot.villagers.some((person) => person.characterId === card.id) &&
      card.id !== snapshot.settings.playerPersonaId,
  );
  return (
    <ModalDialog title="Add Visitor" compact onClose={onClose} dismissible={!busy}>
      <form
        autoComplete="off"
        onSubmit={async (event) => {
          event.preventDefault();
          if (!choice || busy) return;
          setBusy(true);
          setError("");
          try {
            await saveVisitor({ snapshot, setSnapshot }, choice, true);
            onClose();
          } catch (cause) {
            setError(messageFrom(cause, "Could not add Visitor."));
          } finally {
            setBusy(false);
          }
        }}
      >
        <label>
          Character Card
          <select autoComplete="off" value={choice} onChange={(event) => setChoice(event.target.value)} disabled={busy}>
            <option value="">Choose a card</option>
            {available.map((card) => (
              <option key={card.id} value={card.id}>
                {card.name}
              </option>
            ))}
          </select>
        </label>
        {error ? <p role="alert">{error}</p> : null}
        <button type="submit" disabled={!choice || busy}>
          Add Visitor
        </button>
      </form>
    </ModalDialog>
  );
}

export function VisitorProfileControls({
  person,
  snapshot,
  setSnapshot,
}: VisitorPorts & { person: VillageVisitorView }) {
  const confirm = useConfirmation(snapshot.worldScope + ":" + person.characterId);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const visit = person.visit;
  const change = async (enabled?: boolean) => {
    setBusy(true);
    setError("");
    try {
      await saveVisitor({ snapshot, setSnapshot }, person.characterId, enabled);
    } catch (cause) {
      setError(messageFrom(cause, "Could not update Visitor."));
    } finally {
      setBusy(false);
    }
  };
  const offerHome = async (trip: string) => {
    setBusy(true);
    setError("");
    const scope = snapshot.worldScope;
    try {
      const next = await request<VillageSnapshot>("/visitors/" + encodeURIComponent(person.characterId) + "/host", {
        method: "POST",
        body: JSON.stringify({ scope, trip }),
      });
      setSnapshot((current) => (current?.worldScope === scope && next.worldScope === scope ? next : current));
    } catch (cause) {
      setError(messageFrom(cause, "Could not offer a room for this visit."));
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      {visit?.stayingWithPlayer ? <span role="status">Staying with you</span> : null}
      {visit?.offerHome ? (
        <button type="button" disabled={busy} onClick={() => void offerHome(visit.arrivedAt)}>
          Offer to host
        </button>
      ) : null}
      <button type="button" disabled={busy} onClick={() => void change(!person.visitsEnabled)}>
        {person.visitsEnabled ? "Turn visits off" : "Turn visits on"}
      </button>
      {person.met ? (
        <button
          type="button"
          disabled={busy}
          onClick={async () => {
            if (await confirm(`Move ${person.name} into the Village?`, { cancel: "Cancel", confirm: "Move in" }))
              await change();
          }}
        >
          Move in
        </button>
      ) : null}
      {error ? <p role="alert">{error}</p> : null}
    </>
  );
}
