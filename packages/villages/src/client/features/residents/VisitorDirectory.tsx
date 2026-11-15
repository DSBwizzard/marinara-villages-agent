import { useEffect, useRef, useState } from "react";
import type { CatalogResponse, VillageSnapshot, VillageVisitorView } from "../../../shared/contracts/village.js";
import { messageFrom, request } from "../../shared/api.js";
import { useConfirmation } from "../../shared/confirmation.js";
import { ELEMENT_TAG } from "../../shared/constants.js";
import { ModalDialog } from "../../shared/ModalDialog.js";
import { Appearance } from "./Appearance.js";
import { AvatarFace } from "./ResidentPanels.js";
import type { RosterScreenController } from "./screen-contracts.js";
import { VillagesRelationships } from "./villages-relationships.js";

export function VisitorDirectory({ controller }: { controller: RosterScreenController }) {
  const { snapshot, portraits, openVenue, setSnapshot } = controller;
  const scope = snapshot.worldScope;
  const [catalog, setCatalog] = useState<CatalogResponse["characters"]>([]);
  const [choice, setChoice] = useState("");
  const [artwork, setArtwork] = useState<VillageVisitorView | null>(null);
  const [relationship, setRelationship] = useState("");
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const leaveArt = useRef<(() => Promise<boolean>) | null>(null);
  const confirm = useConfirmation(scope);
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
  }, [scope]);
  const visitors = snapshot.visitors ?? [];
  const available = catalog.filter(
    (card) =>
      !card.inVillage &&
      !visitors.some((person) => person.characterId === card.id) &&
      !snapshot.villagers.some((person) => person.characterId === card.id) &&
      card.id !== snapshot.settings.playerPersonaId,
  );
  const open = (id: string) => {
    const venue = snapshot.settings.venues.find((row) => row.id === id);
    if (venue) openVenue(venue);
  };
  const update = (next: VillageSnapshot) =>
    setSnapshot((current) => (current?.worldScope === scope && next.worldScope === scope ? next : current));
  const change = async (id: string, enabled?: boolean) => {
    setWorking(true);
    setError("");
    try {
      const path = "/visitors/" + encodeURIComponent(id);
      update(
        await request<VillageSnapshot>(path + (enabled === undefined ? "/move-in" : ""), {
          method: enabled === undefined ? "POST" : "PUT",
          body: JSON.stringify({ scope, enabled }),
        }),
      );
      if (choice === id) setChoice("");
    } catch (cause) {
      setError(messageFrom(cause, "Could not update Visitor."));
    } finally {
      setWorking(false);
    }
  };
  const closeArt = async () => {
    if (!leaveArt.current || (await leaveArt.current())) setArtwork(null);
  };
  return (
    <section className={`${ELEMENT_TAG}-visitor-directory`} aria-label="Visitors" aria-busy={working}>
      {snapshot.visitorNotice ? (
        <p>
          <button type="button" onClick={() => open(snapshot.visitorNotice!.venueId)}>
            {snapshot.visitorNotice.name ?? "A Visitor"} at {snapshot.visitorNotice.venueName}
          </button>
        </p>
      ) : null}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (choice && !working) void change(choice, true);
        }}
      >
        <label>
          Character Card
          <select value={choice} onChange={(event) => setChoice(event.target.value)}>
            <option value="">Choose a card</option>
            {available.map((card) => (
              <option value={card.id} key={card.id}>
                {card.name}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" disabled={!choice || working}>
          Add Visitor
        </button>
      </form>
      {error ? <p role="alert">{error}</p> : null}
      {visitors.map((person) => (
        <article key={person.characterId}>
          <div className={`${ELEMENT_TAG}-visitor-heading`}>
            <AvatarFace
              portrait={portraits[person.characterId]}
              name={person.name}
              className={`${ELEMENT_TAG}-avatar`}
            />
            <strong>{person.name}</strong>
            <small>
              {person.visitsEnabled ? (person.met ? "Visits enabled" : "Awaiting first meeting") : "Visits off"}
            </small>
          </div>
          <div className={`${ELEMENT_TAG}-visitor-actions`}>
            <button
              type="button"
              disabled={working}
              onClick={() => void change(person.characterId, !person.visitsEnabled)}
            >
              {person.visitsEnabled ? "Turn visits off" : "Turn visits on"}
            </button>
            <button type="button" onClick={() => setArtwork(person)}>
              Appearance
            </button>
            {person.met ? (
              <>
                <button
                  type="button"
                  aria-expanded={relationship === person.characterId}
                  onClick={() => setRelationship(relationship === person.characterId ? "" : person.characterId)}
                >
                  Relationships
                </button>
                <button
                  type="button"
                  disabled={working}
                  onClick={async () => {
                    if (
                      await confirm(`Move ${person.name} into the Village?`, { cancel: "Cancel", confirm: "Move in" })
                    )
                      await change(person.characterId);
                  }}
                >
                  Move in
                </button>
              </>
            ) : null}
          </div>
          {relationship === person.characterId ? (
            <VillagesRelationships
              request={request}
              prefix={ELEMENT_TAG}
              onVenue={open}
              characterId={person.characterId}
            />
          ) : null}
        </article>
      ))}
      {artwork ? (
        <ModalDialog title="Appearance" headerless onClose={() => void closeArt()}>
          <Appearance
            characterId={artwork.characterId}
            name={artwork.name}
            portrait={portraits[artwork.characterId]}
            resident
            onLeaveGuard={(guard) => {
              leaveArt.current = guard;
            }}
            onSave={async () => update(await request<VillageSnapshot>(""))}
            onBack={() => void closeArt()}
          />
        </ModalDialog>
      ) : null}
    </section>
  );
}
