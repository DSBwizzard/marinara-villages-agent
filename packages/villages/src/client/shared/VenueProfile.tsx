import type { ComponentProps, ReactNode, Ref } from "react";
import type { VillageVenue } from "../../shared/contracts/village.js";
import { ArtworkImage } from "./ArtworkImage.js";
import { ELEMENT_TAG as P } from "./constants.js";
import { VENUE_FALLBACK_DAY_URL, VENUE_FALLBACK_URL } from "./desk-art.js";
import { VenueSections } from "./VenueNavigation.js";

export function VenueProfile({
  profileRef,
  headingRef,
  name,
  location = false,
  entranceImage,
  zoneImage,
  fallback,
  daylight = fallback === "day",
  roomBackdrop,
  onKeyDown,
  navigation,
  tabs,
  children,
}: {
  profileRef?: Ref<HTMLElement>;
  headingRef?: Ref<HTMLHeadingElement>;
  name: string;
  location?: boolean;
  entranceImage?: string;
  zoneImage?: { url: string; name: string };
  fallback?: "day" | "night";
  daylight?: boolean;
  roomBackdrop?: boolean;
  onKeyDown?: ComponentProps<"section">["onKeyDown"];
  navigation: ReactNode;
  tabs: ComponentProps<typeof VenueSections>;
  children: ReactNode;
}) {
  return (
    <section
      ref={profileRef}
      className={P + "-venue-profile"}
      aria-label={location ? "Location" : "Venue"}
      data-room-backdrop={roomBackdrop || undefined}
      data-storybook-backdrop={!!fallback || undefined}
      data-storybook-daylight={daylight || undefined}
      onKeyDown={onKeyDown}
    >
      <figure className={P + "-venue-photo"}>
        {fallback ? (
          <img
            className={P + "-venue-storybook-photo"}
            src={fallback === "day" ? VENUE_FALLBACK_DAY_URL : VENUE_FALLBACK_URL}
            alt=""
          />
        ) : entranceImage ? (
          <ArtworkImage src={entranceImage} alt={zoneImage ? "" : name} />
        ) : null}
        {zoneImage ? (
          <ArtworkImage className={P + "-venue-zone-photo"} src={zoneImage.url} alt={zoneImage.name} />
        ) : null}
      </figure>
      <div className={P + "-venue-navigation"}>{navigation}</div>
      <header className={P + "-workspace-venue-header"}>
        <h1 className={P + "-storybook-heading"} ref={headingRef} tabIndex={headingRef ? -1 : undefined}>
          {name}
        </h1>
      </header>
      <VenueSections {...tabs} />
      <main className={P + "-venue-profile-body"}>{children}</main>
    </section>
  );
}

export function AssignedVillagers({
  place,
  nameOfCharacter,
  locked = false,
}: {
  place: VillageVenue;
  nameOfCharacter(id: string): string;
  locked?: boolean;
}) {
  const residents = new Set(
    place.residentIds ?? (place.occupancy.residentCharacterId ? [place.occupancy.residentCharacterId] : []),
  );
  if (place.occupancy.playerHome) residents.add("player");
  const assignments = [
    ...[...residents].map((id) => ({ id, role: "Resident" })),
    ...(place.workerIds ?? []).map((id) => ({ id, role: "Worker" })),
  ];
  return (
    <section className={P + "-venue-people"}>
      <h2>{locked && assignments.length === 1 ? "Assigned villager" : "Assigned villagers"}</h2>
      {assignments.length ? (
        <ul className={P + "-venue-assignments"}>
          {assignments.map(({ id, role }) => (
            <li key={role + id}>
              <span>{nameOfCharacter(id)}</span>
              <small>{role}</small>
            </li>
          ))}
        </ul>
      ) : (
        <p>No assigned villagers.</p>
      )}
    </section>
  );
}
