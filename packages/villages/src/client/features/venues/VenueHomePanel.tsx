import { useState } from "react";
import type { VillageVenue } from "../../../shared/contracts/village.js";
import { VenueManageHeading, VenuePeoplePicker } from "./VenueManage.js";
import { playerDisplayName } from "../../shared/presentation.js";
import type { VenueScreenController } from "./screen-contracts.js";

export function VenueHomePanel({
  place,
  controller,
  onBack,
}: {
  place: VillageVenue;
  controller: VenueScreenController;
  onBack(): void;
}) {
  const [person, setPerson] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [targetId, setTargetId] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [busy, setBusy] = useState(false);
  const people = [
    { id: "player", name: playerDisplayName(controller.snapshot) },
    ...controller.snapshot.villagers.map((row) => ({
      id: row.characterId,
      name: row.name,
      portrait: controller.portraits?.[row.characterId],
    })),
  ];
  const ids = new Set([...(place.occupancy.playerHome ? ["player"] : []), ...(place.residentIds ?? [])]);
  const name = people.find((row) => row.id === person)?.name ?? "Villager";
  const targets = controller.snapshot.settings.venues.filter(
    (row) => (row.residenceCapacity ?? 0) > 0 && (!ids.has(person ?? "") || row.id !== place.id),
  );
  const target = targets.find((row) => row.id === targetId);
  const openTarget = person === "player" && target?.id !== place.id;
  const zones =
    target?.zones?.filter((zone) => zone.kind !== "exterior" && (!zone.ownerId || zone.ownerId === person)) ?? [];
  const list = () => {
    setPerson(null);
    setAdding(false);
    setTargetId("");
    setZoneId("");
  };
  const propose = async () => {
    if (!person || !target || (!openTarget && !zoneId) || busy) return;
    if (openTarget) {
      controller.openPlace(target);
      return;
    }
    setBusy(true);
    try {
      if (person === "player") await controller.requestPlayerMove(target.id, zoneId);
      else await controller.proposeResidenceMove(person, target.id, zoneId);
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="villages-manage" aria-label="Home arrangements">
      <VenueManageHeading
        title={person ? name : "Home"}
        back={person || adding ? "Residents" : "Manage"}
        onBack={person || adding ? list : onBack}
        disabled={busy}
      />
      {!person ? (
        <VenuePeoplePicker
          key={String(adding)}
          title={adding ? "Add resident" : "Residents"}
          people={people.filter((row) => adding !== ids.has(row.id))}
          onAdd={!adding ? () => setAdding(true) : undefined}
          addLabel="Add resident"
          onSelect={(id) => {
            setPerson(id);
            setTargetId(adding ? place.id : "");
          }}
        />
      ) : (
        <>
          {ids.has(person) && (
            <dl className="villages-manage-details">
              <dt>Home</dt>
              <dd>{place.name}</dd>
              {place.destinations?.[person]?.sleep && (
                <>
                  <dt>Sleeps in</dt>
                  <dd>
                    {place.zones?.find((zone) => zone.id === place.destinations?.[person]?.sleep)?.name ?? "Zone"}
                  </dd>
                </>
              )}
            </dl>
          )}
          <fieldset disabled={busy || controller.venueEditBusy} className="villages-manage-form">
            <label>
              Move to
              <select
                aria-label="Move to"
                value={targetId}
                onChange={(e) => {
                  setTargetId(e.target.value);
                  setZoneId("");
                }}
              >
                <option value="">Choose a Venue</option>
                {targets.map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.name}
                  </option>
                ))}
              </select>
            </label>
            {target && !openTarget && (
              <label>
                Sleeping Zone
                <select aria-label="Sleeping Zone" value={zoneId} onChange={(e) => setZoneId(e.target.value)}>
                  <option value="">Choose a Zone</option>
                  {zones.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <div className="villages-manage-actions">
              <button type="button" onClick={list}>
                Cancel
              </button>
              <button
                type="button"
                className="villages-manage-primary"
                disabled={!target || (!openTarget && !zoneId)}
                onClick={() => void propose()}
              >
                {openTarget ? "Open Venue" : person === "player" ? "Move here" : "Propose move"}
              </button>
            </div>
          </fieldset>
          {controller.snapshot.residences.some((row) => row.characterId === person && row.status !== "current") && (
            <button type="button" disabled={busy} onClick={() => controller.openVenueRequests(place.id)}>
              View move request
            </button>
          )}
        </>
      )}
    </section>
  );
}
