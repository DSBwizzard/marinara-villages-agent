import { useState } from "react";
import type { VillageVenue } from "../../../shared/contracts/village.js";
import { VenueZoneRow } from "../../shared/VenueNavigation.js";
import { useDeskLeaveGuard } from "../../shared/DeskWorkspace.js";
import { ELEMENT_TAG as P } from "../../shared/constants.js";
import { VenueHomePanel } from "./VenueHomePanel.js";
import { VenueWorkPanel } from "./VenueWorkPanel.js";
import { type ArrangementController } from "./arrangement-request.js";
export function PersonArrangements({ person, controller }: { person: string; controller: ArrangementController }) {
  const places = controller.snapshot.settings.venues;
  const home = places.find((row) =>
    person === "player" ? row.occupancy.playerHome : row.residentIds?.includes(person),
  );
  const work = places.find(
    (row) =>
      row.accessView?.work?.some((work) => work.characterId === person) ||
      row.accessView?.workOffers?.some((offer) => offer.characterId === person),
  );
  const [kind, setKind] = useState<"home" | "work" | null>(null);
  const [busy, setBusy] = useState(false);
  useDeskLeaveGuard(async () => !busy, busy);
  const back = () => {
    if (!busy) setKind(null);
  };
  if (!kind)
    return (
      <nav className={P + "-venue-zone-picker"} aria-label="Assignments">
        <VenueZoneRow name="Home" accessLabel={home?.name} onOpen={() => setKind("home")} />
        {person !== "player" && <VenueZoneRow name="Work" accessLabel={work?.name} onOpen={() => setKind("work")} />}
      </nav>
    );
  const fallback: VillageVenue =
    home ??
    places.find(
      (row) => row.constructionStatus !== "worksite" && row.zones?.some((zone) => zone.kind !== "exterior"),
    ) ??
    places[0]!;
  return (
    <section className="villages-person-arrangements">
      <button type="button" className={P + "-venue-back"} disabled={busy} onClick={back}>
        ← Assignments
      </button>
      {kind === "home" ? (
        fallback && (
          <VenueHomePanel
            key={person}
            fixedVenue={false}
            place={fallback}
            person={person}
            controller={controller}
            onBack={back}
            onBusyChange={setBusy}
          />
        )
      ) : (work ?? fallback) ? (
        <VenueWorkPanel
          key={person}
          fixedVenue={false}
          place={(work ?? fallback)!}
          person={person}
          controller={controller}
          onBack={back}
          onBusyChange={setBusy}
        />
      ) : null}
    </section>
  );
}
