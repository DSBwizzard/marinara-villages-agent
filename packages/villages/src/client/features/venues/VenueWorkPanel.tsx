import { useState, useLayoutEffect, useCallback } from "react";
import type { VillageVenue } from "../../../shared/contracts/village.js";
import { venueWorkSchema, workTime, type VenueWork } from "../../../shared/helpers/venue-work.js";
import { WorkFields, initialVenueWork } from "../../shared/WorkFields.js";
import { createVillagesClientId } from "../../shared/request-id.js";
import { messageFrom } from "../../shared/api.js";
import type { AccessCommand } from "../../../shared/helpers/venue-access.js";
import { useArrangementRequest, type ArrangementController } from "./arrangement-request.js";

function WorkEditor({
  place,
  person,
  controller,
  onBack,
  onBusyChange,
  zoneId,
}: {
  place: VillageVenue;
  person: string;
  zoneId?: string;
  fixedVenue?: boolean;
  controller: ArrangementController;
  onBack(): void;
  onBusyChange(busy: boolean): void;
}) {
  const [busy, setBusy] = useState(false);
  useLayoutEffect(() => {
    onBusyChange(busy);
    return () => onBusyChange(false);
  }, [busy, onBusyChange]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const people = controller.snapshot.villagers.map((row) => ({
    id: row.characterId,
    name: row.name,
    portrait: undefined,
  }));
  const name = (id: string) => (id === "player" ? "You" : (people.find((row) => row.id === id)?.name ?? "Villager"));
  const zones =
    place.zones?.filter((zone) => zone.kind !== "exterior" && (!zone.ownerId || zone.ownerId === person)) ?? [];
  const submit = useArrangementRequest(controller, person, place.id);
  const records = place.accessView?.work ?? [];
  const offers = place.accessView?.workOffers ?? [];
  const scopedWork = (value: VenueWork): VenueWork =>
    zoneId ? { ...value, zoneId, accessZoneIds: [...new Set([...value.accessZoneIds, zoneId])] } : value;
  const [work, setWork] = useState<VenueWork | null>(() =>
    offers.some((row) => row.characterId === person)
      ? null
      : scopedWork(
          structuredClone(
            records.find((row) => row.characterId === person) ??
              initialVenueWork(
                person,
                zoneId
                  ? [...zones.filter((row) => row.id === zoneId), ...zones.filter((row) => row.id !== zoneId)]
                  : zones,
              ),
          ),
        ),
  );
  const edit = (id: string) => {
    setWork(scopedWork(structuredClone(records.find((row) => row.characterId === id) ?? initialVenueWork(id, zones))));
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
      if (await submit("/venues/" + encodeURIComponent(place.id) + "/access", command)) {
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
                  <dt>Guest invitations</dt>
                  <dd>{offer.terms.inviteGuests ? "Work Zones" : "None"}</dd>
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
            <WorkFields fixedZone={!!zoneId} value={work} zones={zones} onChange={setWork} />
            <div className="villages-manage-actions">
              <button type="button" onClick={onBack}>
                Cancel
              </button>
              <button
                type="button"
                className="villages-manage-primary"
                disabled={!venueWorkSchema.safeParse(work).success || !work.accessZoneIds.includes(work.zoneId)}
                onClick={() => void send({ action: "work-propose", characterId: work.characterId, terms: work })}
              >
                Propose changes
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
      {error && <p role="alert">{error}</p>}
      {notice && <p role="status">{notice}</p>}
    </section>
  );
}

export function VenueWorkPanel(props: {
  fixedVenue?: boolean;
  place: VillageVenue;
  person: string;
  zoneId?: string;
  controller: ArrangementController;
  onBack(): void;
  onBusyChange(busy: boolean): void;
}) {
  const { onBusyChange } = props;
  const [targetId, setTargetId] = useState(props.place.id);
  const [busy, setBusy] = useState(false);
  const changeBusy = useCallback(
    (busy: boolean) => {
      setBusy(busy);
      onBusyChange(busy);
    },
    [onBusyChange],
  );
  const place = props.controller.snapshot.settings.venues.find((row) => row.id === targetId) ?? props.place;
  return (
    <section className="villages-manage" aria-label="Work arrangements">
      <h2>Work</h2>
      {props.fixedVenue === false && (
        <label>
          Venue
          <select aria-label="Venue" value={place.id} disabled={busy} onChange={(e) => setTargetId(e.target.value)}>
            {props.controller.snapshot.settings.venues.map((row) => (
              <option key={row.id} value={row.id}>
                {row.name}
              </option>
            ))}
          </select>
        </label>
      )}
      <WorkEditor
        key={place.id}
        {...props}
        place={place}
        zoneId={place.id === props.place.id ? props.zoneId : undefined}
        onBusyChange={changeBusy}
      />
    </section>
  );
}
