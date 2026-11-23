import type { ComponentProps, ReactNode, Ref } from "react";
import { ArtworkImage } from "./ArtworkImage.js";
import { ELEMENT_TAG as P } from "./constants.js";
import { VENUE_FALLBACK_DAY_URL, VENUE_FALLBACK_URL } from "./desk-art.js";
import { VenueSections } from "./VenueNavigation.js";

export function VenueProfile({
  profileRef,
  headingRef,
  heading,
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
  heading?: ReactNode;
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
      aria-label={tabs.zone ? "Zone" : location ? "Location" : "Venue"}
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
        {heading ?? (
          <h1 className={P + "-storybook-heading"} ref={headingRef} tabIndex={headingRef ? -1 : undefined}>
            {name}
          </h1>
        )}
      </header>
      <VenueSections {...tabs} />
      <main className={P + "-venue-profile-body"}>{children}</main>
    </section>
  );
}
