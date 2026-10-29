import { useLayoutEffect, useRef, useState } from "react";
import type { VillageSnapshot, VillageVenue } from "../../../shared/contracts/village.js";
import { zoneLayoutKey, type ZoneLayoutChange } from "../../../shared/helpers/zone-layout.js";
import { messageFrom, request } from "../../shared/api.js";
import { venueDisplayZones } from "./venue-view.js";

type LayoutSave = {
  change: ZoneLayoutChange;
  saving: boolean;
  error: string;
};
type PendingLayout = LayoutSave & {
  running: boolean;
  base: string;
  uncertain?: { change: ZoneLayoutChange; base: string };
};

function layoutKey(venue: VillageVenue) {
  return zoneLayoutKey(venueDisplayZones(venue, null), venue.zoneLayout);
}

/** Layout saves belong to the village, so leaving Places does not retire them. */
export function useVenueLayoutAutosave({
  snapshot,
  setSnapshot,
}: {
  snapshot: VillageSnapshot | null;
  setSnapshot: React.Dispatch<React.SetStateAction<VillageSnapshot | null>>;
}) {
  const pending = useRef(new Map<string, PendingLayout>());
  const [venueLayouts, setVenueLayouts] = useState<Record<string, LayoutSave>>({});
  const current = useRef(snapshot);
  const epoch = useRef(0);
  const active = useRef(true);
  const unfounded = snapshot?.isFounded === false;
  useLayoutEffect(() => {
    current.current = snapshot;
  }, [snapshot]);
  useLayoutEffect(() => {
    epoch.current += 1;
    pending.current.clear();
    setVenueLayouts({});
  }, [unfounded]);
  useLayoutEffect(() => {
    active.current = true;
    const entries = pending.current;
    return () => {
      active.current = false;
      epoch.current += 1;
      entries.clear();
    };
  }, []);
  const publish = () => {
    if (active.current)
      setVenueLayouts(Object.fromEntries([...pending.current].map(([id, entry]) => [id, { ...entry }])));
  };
  const drain = async (id: string, entry: PendingLayout) => {
    if (entry.running) return;
    const generation = epoch.current;
    const currentWorld = () => active.current && epoch.current === generation;
    const owns = () => currentWorld() && pending.current.get(id) === entry;
    entry.running = true;
    entry.saving = true;
    entry.error = "";
    publish();
    while (owns()) {
      let submitted = entry.change;
      let base = entry.base;
      try {
        let next: VillageSnapshot | undefined;
        if (entry.uncertain) {
          // A lost HTTP reply may have committed. Read before retrying rather than
          // overwriting a different layout or rejecting our own acknowledged save.
          const observed = await request<VillageSnapshot>("");
          if (!owns()) return;
          const venue = observed.settings.venues.find((venue) => venue.id === id);
          if (!venue) throw new Error("The Venue is no longer available.");
          const key = layoutKey(venue);
          const expected = zoneLayoutKey(entry.uncertain.change.connections, entry.uncertain.change.positions);
          if (key === expected) {
            next = observed;
            submitted = entry.uncertain.change;
            base = entry.uncertain.base;
          } else if (key !== entry.uncertain.base) {
            throw new Error("The layout changed elsewhere. Reload Villages to use the saved layout.");
          }
        }
        if (!next) {
          entry.uncertain = { change: submitted, base };
          next = await request<VillageSnapshot>(`/venues/${encodeURIComponent(id)}/layout`, {
            method: "PUT",
            body: JSON.stringify({ ...submitted, base }),
          });
        }
        if (!owns()) return;
        const saved = next.settings.venues.find((venue) => venue.id === id);
        if (!saved) throw new Error("The Venue is no longer available.");
        const savedKey = layoutKey(saved);
        const visible = current.current?.settings.venues.find((venue) => venue.id === id);
        if (!visible) throw new Error("The Venue is no longer available.");
        if (layoutKey(visible) !== base && layoutKey(visible) !== savedKey)
          throw new Error("The layout changed elsewhere. Reload Villages to use the saved layout.");
        entry.base = savedKey;
        entry.uncertain = undefined;
        setSnapshot((latest) => {
          if (!currentWorld() || !latest || latest.isFounded === false) return latest;
          return {
            ...latest,
            settings: {
              ...latest.settings,
              venues: latest.settings.venues.map((venue) => {
                if (venue.id !== id || layoutKey(venue) !== base) return venue;
                const connections = new Map(venueDisplayZones(saved, null).map((zone) => [zone.id, zone.connectedTo]));
                const merge = <T extends { id?: string; connectedTo?: string[] }>(zones: T[] | undefined) =>
                  zones?.map((zone) => ({
                    ...zone,
                    connectedTo: zone.id ? connections.get(zone.id) : zone.connectedTo,
                  }));
                return {
                  ...venue,
                  zoneLayout: saved.zoneLayout,
                  zones: merge(venue.zones ?? venueDisplayZones(venue, null)),
                  spaces: merge(venue.spaces),
                  privateSpaces: merge(venue.privateSpaces),
                };
              }),
            },
          };
        });
        if (entry.change === submitted) {
          pending.current.delete(id);
          publish();
          return;
        }
      } catch (cause) {
        if (!owns()) return;
        entry.running = false;
        entry.saving = false;
        entry.error = messageFrom(cause, "The layout could not be saved.");
        publish();
        return;
      }
    }
  };
  const generation = epoch.current;
  const saveVenueZoneLayout = (place: VillageVenue, change: ZoneLayoutChange) => {
    if (!active.current || epoch.current !== generation || current.current?.isFounded === false) return;
    const venue = current.current?.settings.venues.find((venue) => venue.id === place.id);
    if (!venue) return;
    let entry = pending.current.get(place.id);
    if (entry) entry.change = change;
    else {
      entry = { change, base: change.base, saving: true, running: false, error: "" };
      pending.current.set(place.id, entry);
    }
    publish();
    void drain(place.id, entry);
  };
  return { venueLayouts, saveVenueZoneLayout };
}
