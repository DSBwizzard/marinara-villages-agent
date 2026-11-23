import { useState } from "react";
import type { VillageVenue } from "../../../shared/contracts/village.js";
import { venueWorkSchema, workTime, type VenueWork } from "../../../shared/helpers/venue-work.js";
import { WorkFields, initialVenueWork } from "../../shared/WorkFields.js";
import { VenuePeoplePicker, VenueManageHeading } from "./VenueManage.js";
import { createVillagesClientId } from "../../shared/request-id.js";
import { messageFrom } from "../../shared/api.js";
import type { AccessCommand } from "../../../shared/helpers/venue-access.js";
import type { VenueScreenController } from "./screen-contracts.js";

export function VenueWorkPanel({
  place,
  controller,
  onBack,
}: {
  place: VillageVenue;
  controller: VenueScreenController;
  onBack(): void;
}) {
  const [work, setWork] = useState<VenueWork | null>(null);
  const [person, setPerson] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const people = controller.snapshot.villagers.map((row) => ({
    id: row.characterId,
    name: row.name,
    portrait: controller.portraits?.[row.characterId],
  }));
  const name = (id: string) => (id === "player" ? "You" : (people.find((row) => row.id === id)?.name ?? "Villager"));
  const zones =
    place.zones?.filter((zone) => zone.kind !== "exterior" && (!zone.ownerId || zone.ownerId === person)) ?? [];
  const records = place.accessView?.work ?? [];
  const offers = place.accessView?.workOffers ?? [];
  const workerIds = new Set([
    ...(place.workerIds ?? []),
    ...records.map((row) => row.characterId),
    ...offers.map((row) => row.characterId),
  ]);
  const edit = (id: string) => {
    setPerson(id);
    setWork(
      structuredClone(
        records.find((row) => row.characterId === id) ??
          initialVenueWork(
            id,
            place.zones?.filter((zone) => zone.kind !== "exterior" && (!zone.ownerId || zone.ownerId === id)) ?? [],
          ),
      ),
    );
    setError("");
    setNotice("");
  };
  const list = () => {
    setPerson(null);
    setWork(null);
    setAdding(false);
    setError("");
    setNotice("");
  };
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
        setNotice("Saved proposal.");
      }
    } catch (cause) {
      setError(messageFrom(cause, "Could not save work."));
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="villages-manage" aria-label="Work arrangements">
      {person && <VenueManageHeading title={name(person)} back="Workers" onBack={list} disabled={busy} />}
      {!person ? (
        <VenuePeoplePicker
          key={String(adding)}
          title={adding ? "Add worker" : "Workers"}
          heading={adding ? "Add worker" : "Work"}
          back={adding ? "Workers" : "Manage"}
          onBack={adding ? list : onBack}
          people={people.filter((row) => adding !== workerIds.has(row.id))}
          disabled={busy}
          onSelect={(id) => {
            if (offers.some((offer) => offer.characterId === id) && !adding) {
              setPerson(id);
              setWork(null);
            } else edit(id);
          }}
          onAdd={!adding ? () => setAdding(true) : undefined}
          addLabel="Add worker"
        />
      ) : (
        <fieldset disabled={busy}>
          {offers
            .filter((offer) => offer.characterId === person)
            .map((offer) => (
              <section className="villages-work-offer" key={offer.id} aria-label="Pending work proposal">
                <h3>Pending</h3>
                {offer.terms ? (
                  <dl className="villages-manage-details">
                    <dt>Activity</dt>
                    <dd>{offer.terms.activity}</dd>
                    <dt>Zone</dt>
                    <dd>{place.zones?.find((zone) => zone.id === offer.terms?.zoneId)?.name ?? "Unseen Zone"}</dd>
                    <dt>Days</dt>
                    <dd>{offer.terms.days.map((day) => day.slice(0, 3)).join(", ")}</dd>
                    <dt>Hours</dt>
                    <dd>
                      {workTime(offer.terms.startMinute)}–{workTime(offer.terms.endMinute)}
                    </dd>
                    <dt>Work access</dt>
                    <dd>
                      {offer.terms.accessZoneIds
                        .map((id) => place.zones?.find((zone) => zone.id === id)?.name ?? "Unseen Zone")
                        .join(", ")}
                    </dd>
                  </dl>
                ) : (
                  <p>End this work arrangement</p>
                )}
                <p>
                  Waiting for{" "}
                  {offer.requiredIds
                    .filter((id) => !offer.approvedIds.includes(id))
                    .map(name)
                    .join(", ")}
                  .
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
              </section>
            ))}
          {work ? (
            <>
              <WorkFields value={work} zones={zones} onChange={setWork} />
              <div className="villages-manage-actions">
                <button type="button" onClick={list}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="villages-manage-primary"
                  disabled={!venueWorkSchema.safeParse(work).success || !work.accessZoneIds.includes(work.zoneId)}
                  onClick={() => void send({ action: "work-propose", characterId: work.characterId, terms: work })}
                >
                  Propose work
                </button>
              </div>
              {records.some((row) => row.characterId === person) && (
                <button
                  type="button"
                  onClick={() => void send({ action: "work-propose", characterId: person, terms: null })}
                >
                  Propose ending work
                </button>
              )}
            </>
          ) : (
            <button type="button" onClick={() => edit(person)}>
              Propose work
            </button>
          )}
        </fieldset>
      )}
      {error && <p role="alert">{error}</p>}
      {notice && <p role="status">{notice}</p>}
    </section>
  );
}
