import { useEffect, useRef, useState } from "react";
import type {
  PlaceDetail,
  PlaceDirectory,
  PlaceOperationView,
  PlaceSummary,
} from "../../../shared/contracts/places.js";
import type { VillageSnapshot, VillageVenue } from "../../../shared/contracts/village.js";
import { request, messageFrom } from "../../shared/api.js";
import { createVillagesClientId } from "../../shared/request-id.js";
import { ELEMENT_TAG } from "../../shared/constants.js";
import { LocationNavigator } from "./villages-exploration.js";

export function PlacesDirectory({
  snapshot,
  mapId,
  sceneActive,
  mobile,
  search,
  onSearch,
  focusSearch,
  onClose,
  onVisit,
  onVenue,
  onAdmit,
  venueActions,
}: {
  snapshot: VillageSnapshot;
  mapId: string;
  sceneActive: boolean;
  mobile: boolean;
  search: string;
  onSearch(value: string): void;
  focusSearch: boolean;
  onClose(): void;
  onVisit(place: VillageVenue): void;
  onVenue(place: VillageVenue): void;
  onAdmit(place: PlaceSummary): void;
  venueActions?(place: VillageVenue): { label: string; onSelect: () => void }[];
}) {
  const [page, setPage] = useState<PlaceDirectory>({ items: [], nextCursor: null });
  const [cursor, setCursor] = useState("");
  const [detail, setDetail] = useState<PlaceDetail | null>(null);
  const [selectedId, setSelectedId] = useState("");
  const [error, setError] = useState("");
  const [intent, setIntent] = useState("");
  const [noNewPlace, setNoNewPlace] = useState(false);
  const [busy, setBusy] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const read = useRef(0);
  useEffect(
    () => () => {
      read.current++;
    },
    [],
  );
  useEffect(() => {
    let current = true;
    const timer = setTimeout(() => {
      void request<PlaceDirectory>("/places?" + new URLSearchParams({ query: search, cursor, limit: "50" }))
        .then((value) => {
          if (current) setPage(value);
        })
        .catch((cause) => {
          if (current) setError(messageFrom(cause, "Could not read Places."));
        });
    }, 150);
    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [search, cursor, refresh]);
  const select = async (place: PlaceSummary) => {
    const ticket = ++read.current;
    setSelectedId(place.id);
    setError("");
    if (place.venue) {
      const venue = snapshot.settings.venues.find((row) => row.id === place.id);
      if (venue) onVenue(venue);
      else setError("Refresh the Village to open this Venue.");
      return;
    }
    try {
      const row = await request<PlaceDetail | { promoted: true; id: string }>(
        "/places/" + encodeURIComponent(place.id),
      );
      if (ticket !== read.current) return;
      if ("promoted" in row) {
        setError("This Place is now a Venue. Refresh Places.");
        return;
      }
      setDetail(row);
    } catch (cause) {
      if (ticket === read.current) setError(messageFrom(cause, "Could not read this Place."));
    }
  };
  const explore = async () => {
    if (busy) return;
    const ticket = ++read.current;
    setBusy(true);
    setError("");
    setNoNewPlace(false);
    try {
      const result = await request<PlaceOperationView>("/places/explore", {
        method: "POST",
        body: JSON.stringify({ worldScope: snapshot.worldScope, requestId: createVillagesClientId(), mapId, intent }),
      });
      if (ticket !== read.current || result.status !== "ready") return;
      setCursor("");
      setRefresh((n) => n + 1);
      if (!result.placeId) setNoNewPlace(true);
      else {
        const row = await request<PlaceDetail | { promoted: true; id: string }>(
          "/places/" + encodeURIComponent(result.placeId),
        );
        if (ticket !== read.current) return;
        if ("promoted" in row) {
          setNoNewPlace(true);
        } else {
          setDetail(row);
          setSelectedId(row.id);
          onSearch(row.name);
        }
      }
    } catch {
      // Exploration is optional; a failed attempt returns to idle without request management.
    } finally {
      if (ticket === read.current) setBusy(false);
    }
  };
  const selectedContent = detail ? (
    <section aria-label="Place details">
      <h3>{detail.name}</h3>
      <p>{detail.description}</p>
      {detail.classified ? (
        <p>{detail.location.classes.map((value) => value[0].toUpperCase() + value.slice(1)).join(" · ")}</p>
      ) : null}
      <div className="villages-place-buttons">
        <button disabled={busy || sceneActive} onClick={() => onVisit(detail.location)}>
          Visit
        </button>
        {detail.visited && detail.classified ? (
          <button disabled={busy || sceneActive || detail.report} onClick={() => onAdmit(detail)}>
            Add as Venue
          </button>
        ) : null}
      </div>
    </section>
  ) : null;
  return (
    <LocationNavigator
      mobile={mobile}
      focusSearch={focusSearch}
      search={search}
      onSearch={(value) => {
        setCursor("");
        onSearch(value);
      }}
      disabled={busy}
      onClose={onClose}
      rows={page.items.map((place) => {
        const venue = place.venue && snapshot.settings.venues.find((row) => row.id === place.id);
        return {
          id: place.id,
          name: place.name,
          detail: place.venue ? "Venue" : place.visited ? "Visited" : place.report ? "Reported" : "Place",
          selected: place.id === selectedId,
          content: place.id === detail?.id ? <div className="villages-place-tools">{selectedContent}</div> : null,
          actions: venue ? venueActions?.(venue) : undefined,
          onSelect: () => void select(place),
        };
      })}
    >
      <style>{`.villages-place-tools{display:grid;gap:.6rem;padding:.75rem;min-width:0;overflow-wrap:anywhere}.${ELEMENT_TAG}-location-navigator>.villages-place-tools{flex:none}.villages-place-tools form,.villages-place-tools label{display:grid;gap:.4rem}.villages-place-tools input{box-sizing:border-box;width:100%;min-width:0;font:inherit}.villages-place-tools p{margin:.2rem 0}.villages-place-tools button{min-height:2.5rem}.villages-place-buttons{display:flex;gap:.5rem;flex-wrap:wrap}`}</style>
      <div className="villages-place-tools">
        <form
          autoComplete="off"
          onSubmit={(event) => {
            event.preventDefault();
            void explore();
          }}
        >
          <label>
            <span className={ELEMENT_TAG + "-sr-only"}>Explore</span>
            <input
              autoComplete="off"
              value={intent}
              maxLength={1000}
              onChange={(event) => setIntent(event.target.value)}
              placeholder="New place (optional)"
            />
          </label>
          <button disabled={busy}>Explore</button>
        </form>
        {cursor || page.nextCursor ? (
          <div className="villages-place-buttons">
            <button disabled={busy || !cursor} onClick={() => setCursor("")}>
              First page
            </button>
            <button disabled={busy || !page.nextCursor} onClick={() => setCursor(page.nextCursor ?? "")}>
              Next page
            </button>
          </div>
        ) : null}
        {busy ? <p role="status">Working…</p> : null}
        {noNewPlace ? <p role="status">No new Place found.</p> : null}
        {error ? <p role="alert">{error}</p> : null}
      </div>
    </LocationNavigator>
  );
}
