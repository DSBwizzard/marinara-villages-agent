import { useEffect, useRef, useState } from "react";
import type {
  PlaceDetail,
  PlaceDirectory,
  PlaceKind,
  PlaceOperationView,
  PlaceSummary,
} from "../../../shared/contracts/places.js";
import type { VillageSnapshot, VillageVenue } from "../../../shared/contracts/village.js";
import { request, messageFrom, VillageApiError } from "../../shared/api.js";
import { useVillageActivity } from "../../shared/activity.js";
import { createVillagesClientId } from "../../shared/request-id.js";
import { ELEMENT_TAG as P } from "../../shared/constants.js";
import { StorybookHeading, StorybookSearchIcon } from "../../shared/StorybookHeading.js";
import { LocationDirectoryRow } from "../../shared/LocationDirectoryRow.js";
import { MapIcon } from "./villages-exploration.js";
import { LOCATIONS_DIRECTORY_STYLES } from "./locations-directory-styles.js";

const kinds = [
  ["all", "All"],
  ["venues", "Venues"],
  ["other", "Other locations"],
] as const;

export function PlacesDirectory({
  snapshot,
  mapId,
  search,
  onSearch,
  focusSearch,
  onMap,
  onLocation,
}: {
  snapshot: VillageSnapshot;
  mapId: string;
  search: string;
  onSearch(value: string): void;
  focusSearch: boolean;
  onMap(mapId: string): void;
  onLocation(place: VillageVenue): void;
}) {
  const { viewing = true, visible } = useVillageActivity();
  const active = viewing && visible;
  const lifetime = useRef({ mounted: true, exploring: false, navigation: 0 });
  const owner = lifetime.current;
  const [kind, setKind] = useState<PlaceKind>("all");
  const [filterMap, setFilterMap] = useState("");
  const [cursor, setCursor] = useState("");
  const [result, setResult] = useState<{ key: string; page: PlaceDirectory } | null>(null);
  const [error, setError] = useState("");
  const [exploreError, setExploreError] = useState("");
  const [intent, setIntent] = useState("");
  const [noNewPlace, setNoNewPlace] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const scroll = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const key = JSON.stringify([snapshot.worldScope, search, filterMap, kind, cursor]);
  const page = result?.key === key ? result.page : null;
  useEffect(() => {
    owner.mounted = true;
    return () => {
      owner.mounted = false;
      owner.navigation++;
    };
  }, [owner]);
  useEffect(() => {
    owner.navigation++;
  }, [active, key, owner]);
  useEffect(() => {
    if (!active || !focusSearch) return;
    const frame = requestAnimationFrame(() => searchRef.current?.focus({ preventScroll: true }));
    return () => cancelAnimationFrame(frame);
  }, [active, focusSearch]);
  useEffect(() => {
    if (!active) return;
    let current = true;
    const abort = new AbortController();
    setLoading(true);
    const timer = setTimeout(() => {
      void request<PlaceDirectory>(
        "/places?" + new URLSearchParams({ query: search, mapId: filterMap, kind, cursor, limit: "50" }),
        { signal: abort.signal },
      )
        .then((value) => {
          if (current) {
            setResult({ key, page: value });
            setError("");
          }
        })
        .catch((cause) => {
          if (current) setError(messageFrom(cause, "Could not read locations."));
        })
        .finally(() => {
          if (current) setLoading(false);
        });
    }, 150);
    return () => {
      current = false;
      clearTimeout(timer);
      abort.abort();
    };
  }, [active, search, filterMap, kind, cursor, key, refresh]);
  const firstPage = () => {
    setCursor("");
    if (scroll.current) scroll.current.scrollTop = 0;
  };
  const turnPage = (value: string | null) => {
    if (value === null) return;
    setCursor(value);
    if (scroll.current) scroll.current.scrollTop = 0;
  };
  const select = async (place: PlaceSummary) => {
    const ticket = ++owner.navigation;
    setError("");
    setExploreError("");
    if (place.venue) {
      const venue = snapshot.settings.venues.find((row) => row.id === place.id);
      if (venue) onLocation(venue);
      else setError("Refresh the Village to open this Venue.");
      return;
    }
    try {
      const row = await request<PlaceDetail | { promoted: true; id: string }>(
        "/places/" + encodeURIComponent(place.id),
      );
      if (ticket !== owner.navigation) return;
      if ("promoted" in row) {
        setError("This location is now a Venue. Refresh Locations.");
        setRefresh((n) => n + 1);
      } else onLocation(row.location);
    } catch (cause) {
      if (ticket === owner.navigation) setError(messageFrom(cause, "Could not read this location."));
    }
  };
  const explore = async () => {
    if (owner.exploring) return;
    owner.exploring = true;
    const ticket = ++owner.navigation;
    setBusy(true);
    setError("");
    setExploreError("");
    setNoNewPlace(false);
    let opening = false;
    try {
      const result = await request<PlaceOperationView>("/places/explore", {
        method: "POST",
        body: JSON.stringify({
          worldScope: snapshot.worldScope,
          requestId: createVillagesClientId(),
          mapId: filterMap || mapId,
          intent,
        }),
      });
      if (!owner.mounted) return;
      if (result.status !== "ready") {
        if (ticket === owner.navigation) setExploreError("Couldn’t explore this map.");
        return;
      }
      setRefresh((n) => n + 1);
      if (ticket !== owner.navigation) return;
      if (!result.placeId) setNoNewPlace(true);
      else {
        opening = true;
        const row = await request<PlaceDetail | { promoted: true; id: string }>(
          "/places/" + encodeURIComponent(result.placeId),
        );
        if (ticket !== owner.navigation) return;
        if ("promoted" in row) setNoNewPlace(true);
        else onLocation(row.location);
      }
    } catch (cause) {
      if (!owner.mounted) return;
      const refused =
        cause instanceof VillageApiError &&
        cause.status >= 400 &&
        cause.status < 500 &&
        cause.code !== "RESPONSE_READ_FAILED";
      if (!opening && !refused) setRefresh((n) => n + 1);
      if (ticket === owner.navigation)
        setExploreError(
          opening
            ? "Couldn’t open the location."
            : refused
              ? "Couldn’t explore this map."
              : "Couldn’t confirm the discovery.",
        );
    } finally {
      owner.exploring = false;
      if (owner.mounted) setBusy(false);
    }
  };
  return (
    <section
      className={P + "-locations-directory"}
      aria-label="Locations directory"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          onMap(filterMap);
        }
      }}
    >
      <style>{LOCATIONS_DIRECTORY_STYLES}</style>
      <div ref={scroll} className={P + "-locations-scroll"}>
        <header className={P + "-locations-header"}>
          <StorybookHeading>Locations</StorybookHeading>
          <button type="button" className={P + "-locations-map"} onClick={() => onMap(filterMap)}>
            <MapIcon name="map" />
            Map
          </button>
        </header>
        <label className={P + "-locations-map-filter"}>
          <span className={P + "-sr-only"}>Filter by map</span>
          <select
            value={filterMap}
            onChange={(event) => {
              setFilterMap(event.target.value);
              firstPage();
            }}
          >
            <option value="">All maps</option>
            {snapshot.settings.maps.map((map) => (
              <option key={map.id} value={map.id}>
                {map.name}
              </option>
            ))}
          </select>
        </label>
        <label className={P + "-locations-search"}>
          <span className={P + "-sr-only"}>Search locations</span>
          <StorybookSearchIcon />
          <input
            ref={searchRef}
            autoComplete="off"
            type="search"
            maxLength={200}
            value={search}
            onChange={(event) => {
              onSearch(event.target.value);
              firstPage();
            }}
            placeholder="Search known locations"
          />
        </label>
        <nav className={P + "-locations-filters"} aria-label="Location categories">
          {kinds.map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={kind === value}
              onClick={() => {
                setKind(value);
                firstPage();
              }}
            >
              <span>{label}</span>
              {value !== "all" ? <small>{page?.counts[value] ?? "…"}</small> : null}
            </button>
          ))}
        </nav>
        <form
          className={P + "-locations-discover"}
          autoComplete="off"
          onSubmit={(event) => {
            event.preventDefault();
            void explore();
          }}
        >
          <label htmlFor={P + "-location-intent"}>Discover somewhere new</label>
          <div>
            <input
              id={P + "-location-intent"}
              autoComplete="off"
              value={intent}
              maxLength={1000}
              onChange={(event) => setIntent(event.target.value)}
              placeholder="New location (optional)"
            />
            <button disabled={busy}>Explore</button>
          </div>
        </form>
        {busy ? <p role="status">Exploring…</p> : null}
        {noNewPlace ? <p role="status">No new location found.</p> : null}
        {exploreError || error ? <p role="alert">{exploreError || error}</p> : null}
        {!page && loading ? <p role="status">Loading…</p> : null}
        {page && page.total === 0 ? (
          <p role="status">{search || filterMap || kind !== "all" ? "No matching locations." : "No locations yet."}</p>
        ) : null}
        {([true, false] as const).map((venue) => {
          const items = page?.items.filter((place) => place.venue === venue) ?? [];
          if (!items.length) return null;
          return (
            <section
              className={P + "-locations-group"}
              key={String(venue)}
              aria-label={venue ? "Village Venues" : "Other locations"}
            >
              <header>
                <h2>{venue ? "Village Venues" : "Other locations"}</h2>
                <small>A–Z</small>
              </header>
              <ul>
                {items.map((place) => (
                  <li key={place.id}>
                    <LocationDirectoryRow
                      id={place.id}
                      name={place.name}
                      mapName={snapshot.settings.maps.find((map) => map.id === place.mapId)?.name}
                      venue={place.venue}
                      report={place.report}
                      visited={place.visited}
                      disabled={busy}
                      onOpen={() => void select(place)}
                    />
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
      <footer className={P + "-locations-pagination"} aria-label="Location pages">
        <span>
          {page
            ? page.total
              ? `${page.offset + 1}–${page.offset + page.items.length} of ${page.total}`
              : "0 results"
            : "Loading…"}
        </span>
        <div>
          <button
            type="button"
            disabled={loading || !page?.previousCursor}
            onClick={() => turnPage(page?.previousCursor ?? null)}
          >
            Previous
          </button>
          <button
            type="button"
            disabled={loading || !page?.nextCursor}
            onClick={() => turnPage(page?.nextCursor ?? null)}
          >
            Next <span aria-hidden="true">→</span>
          </button>
        </div>
      </footer>
    </section>
  );
}
