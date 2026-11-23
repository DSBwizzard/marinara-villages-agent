import { useState } from "react";
import type { VillageVenue } from "../../../shared/contracts/village.js";
import { venueWorkSchema, workTime, type VenueWork } from "../../../shared/helpers/venue-work.js";
import { WorkFields } from "../../shared/WorkFields.js";
import { createVillagesClientId } from "../../shared/request-id.js";
import { messageFrom } from "../../shared/api.js";
import type { AccessCommand } from "../../../shared/helpers/venue-access.js";
import type { VenueScreenController } from "./screen-contracts.js";

export function VenueWorkPanel({ place, controller }: { place: VillageVenue; controller: VenueScreenController }) {
  const [work, setWork] = useState<VenueWork | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const people = controller.snapshot.villagers;
  const name = (id: string) =>
    id === "player" ? "You" : (people.find((row) => row.characterId === id)?.name ?? "Villager");
  const zones =
    place.zones?.filter((zone) => zone.kind !== "exterior" && (!zone.ownerId || zone.ownerId === work?.characterId)) ??
    [];
  const send = async (
    details:
      | { action: "work-propose"; characterId: string; terms: VenueWork | null }
      | { action: "work-decide"; offerId: string; accept: boolean },
  ) => {
    if (!place.accessView || busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const command: AccessCommand = {
        ...details,
        operationId: createVillagesClientId(),
        expectedRevision: place.accessView.revision,
        zoneId: null,
      };
      if (await controller.changeVenueAccess(place.id, command)) {
        setWork(null);
        setNotice("Proposal saved. Current work continues until everyone agrees.");
      }
    } catch (cause) {
      setError(messageFrom(cause, "Work could not be saved."));
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="villages-access-panel" aria-label="Work arrangements">
      <h3>Work</h3>
      <fieldset disabled={busy}>
        {(place.accessView?.work ?? []).map((row) => (
          <div key={row.characterId}>
            <strong>{name(row.characterId)}</strong>
            <p>
              {row.activity} · {row.days.map((day) => day.slice(0, 3)).join(", ")} · {workTime(row.startMinute)}–
              {workTime(row.endMinute)}
            </p>
            <button type="button" onClick={() => setWork(structuredClone(row))}>
              Propose change
            </button>
            <button
              type="button"
              onClick={() => void send({ action: "work-propose", characterId: row.characterId, terms: null })}
            >
              Propose ending work
            </button>
          </div>
        ))}
        {(place.accessView?.workOffers ?? []).map((offer) => (
          <div key={offer.id}>
            <strong>{name(offer.characterId)} · Pending</strong>
            <p>
              {offer.terms
                ? `${offer.terms.activity} · ${offer.terms.days.map((day) => day.slice(0, 3)).join(", ")} · ${workTime(offer.terms.startMinute)}–${workTime(offer.terms.endMinute)}`
                : "End this work arrangement"}
            </p>
            <p>
              Usual Zone: {place.zones?.find((zone) => zone.id === offer.terms?.zoneId)?.name ?? "—"}. Work access:{" "}
              {offer.terms?.accessZoneIds
                .map((id) => place.zones?.find((zone) => zone.id === id)?.name ?? "Unseen Zone")
                .join(", ") || "None"}
              .
            </p>
            <p>
              Waiting for{" "}
              {offer.requiredIds
                .filter((id) => !offer.approvedIds.includes(id))
                .map(name)
                .join(", ")}
              . Discuss this proposal with them.
            </p>
            {offer.requiredIds.includes("player") && !offer.approvedIds.includes("player") && (
              <button
                type="button"
                onClick={() => void send({ action: "work-decide", offerId: offer.id, accept: true })}
              >
                Agree to these terms
              </button>
            )}
            <button
              type="button"
              onClick={() => void send({ action: "work-decide", offerId: offer.id, accept: false })}
            >
              {offer.proposerId === "player" ? "Withdraw" : "Decline"}
            </button>
          </div>
        ))}
        <label>
          Propose work for
          <select
            aria-label="Propose work for"
            value={work?.characterId ?? ""}
            onChange={(e) => {
              const id = e.target.value;
              setWork(
                id
                  ? structuredClone(
                      place.accessView?.work?.find((row) => row.characterId === id) ?? {
                        characterId: id,
                        activity: "Working",
                        zoneId: zones[0]?.id ?? "",
                        accessZoneIds: zones[0] ? [zones[0].id] : [],
                        days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                        startMinute: 540,
                        endMinute: 1020,
                      },
                    )
                  : null,
              );
            }}
          >
            <option value="">Choose a Villager</option>
            {people.map((person) => (
              <option key={person.characterId} value={person.characterId}>
                {person.name}
              </option>
            ))}
          </select>
        </label>
        {work && (
          <>
            <WorkFields value={work} zones={zones} onChange={setWork} />
            <button
              type="button"
              disabled={!venueWorkSchema.safeParse(work).success || !work.accessZoneIds.includes(work.zoneId)}
              onClick={() => void send({ action: "work-propose", characterId: work.characterId, terms: work })}
            >
              Propose work
            </button>
            <button type="button" onClick={() => setWork(null)}>
              Cancel
            </button>
          </>
        )}
      </fieldset>
      {error && <p role="alert">{error}</p>}
      {notice && <p role="status">{notice}</p>}
    </section>
  );
}
