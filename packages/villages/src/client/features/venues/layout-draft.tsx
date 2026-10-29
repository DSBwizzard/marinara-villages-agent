import { useLayoutEffect, useRef, useState } from "react";
import type { VillageSnapshot, VillageVenue } from "../../../shared/contracts/village.js";
import { zoneLayoutKey, type ZoneLayoutChange } from "../../../shared/helpers/zone-layout.js";
import { messageFrom, request } from "../../shared/api.js";
import { venueDisplayZones } from "./venue-view.js";
import { connectionProblem } from "../../../shared/helpers/zone-contact.js";

type LayoutSave = {
  change: ZoneLayoutChange;
  saving: boolean;
  error: string;
};
type PendingLayout = LayoutSave & {
  promise?: Promise<boolean>;
  base: string;
  uncertain?: { change: ZoneLayoutChange; base: string };
};

function layoutKey(venue: VillageVenue) {
  return zoneLayoutKey(venueDisplayZones(venue, null), venue.zoneLayout);
}
function mergeLayout(venue: VillageVenue, saved: VillageVenue): VillageVenue {
  const connections = new Map(venueDisplayZones(saved, null).map((zone) => [zone.id, zone.connectedTo]));
  const merge = <T extends { id?: string; connectedTo?: string[] }>(zones: T[] | undefined) =>
    zones?.map((zone) => ({ ...zone, connectedTo: zone.id ? connections.get(zone.id) : zone.connectedTo }));
  return {
    ...venue,
    zoneLayout: saved.zoneLayout,
    zones: merge(venue.zones ?? venueDisplayZones(venue, null)),
    spaces: merge(venue.spaces),
    privateSpaces: merge(venue.privateSpaces),
  };
}

/** Drafts remain local until navigation commits them. */
export function useVenueLayoutDraft({
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
    const generation = epoch.current;
    const currentWorld = () => active.current && epoch.current === generation;
    const owns = () => currentWorld() && pending.current.get(id) === entry;
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
          if (!owns()) return false;
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
        if (!owns()) return false;
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
                return mergeLayout(venue, saved);
              }),
            },
          };
        });
        if (entry.change === submitted) {
          pending.current.delete(id);
          publish();
          return true;
        }
      } catch (cause) {
        if (!owns()) return false;
        entry.saving = false;
        entry.error = messageFrom(cause, "The layout could not be saved.");
        publish();
        return false;
      }
    }
    return false;
  };
  const generation = epoch.current;
  const stageVenueZoneLayout = (place: VillageVenue, change: ZoneLayoutChange) => {
    if (!active.current || epoch.current !== generation || current.current?.isFounded === false) return;
    const venue = current.current?.settings.venues.find((venue) => venue.id === place.id);
    if (!venue) return;
    let entry = pending.current.get(place.id);
    if (entry?.saving) return;
    if (entry) {
      entry.change = change;
      entry.error = "";
    } else {
      entry = { change, base: change.base, saving: false, error: "" };
      pending.current.set(place.id, entry);
    }
    publish();
  };
  const commitVenueZoneLayout = (id: string): Promise<boolean> => {
    if (!active.current || epoch.current !== generation) return Promise.resolve(false);
    const entry = pending.current.get(id);
    if (!entry) return Promise.resolve(true);
    if (entry.promise) return entry.promise;
    if (connectionProblem(entry.change.connections)) return Promise.resolve(false);
    const promise = drain(id, entry).then((saved) => saved === true);
    entry.promise = promise;
    void promise.finally(() => {
      if (entry.promise === promise) entry.promise = undefined;
    });
    return promise;
  };
  const discardVenueZoneLayout = async (id: string): Promise<boolean> => {
    const owns = () => active.current && epoch.current === generation;
    const entry = pending.current.get(id);
    if (!owns() || entry?.saving) return false;
    if (entry?.uncertain) {
      entry.saving = true;
      publish();
      try {
        const observed = await request<VillageSnapshot>("");
        if (!owns() || pending.current.get(id) !== entry) return false;
        const saved = observed.settings.venues.find((venue) => venue.id === id);
        if (!saved) throw new Error("The Venue is no longer available.");
        const expected = zoneLayoutKey(entry.uncertain.change.connections, entry.uncertain.change.positions);
        setSnapshot((latest) =>
          !owns() || !latest
            ? latest
            : {
                ...latest,
                settings: {
                  ...latest.settings,
                  venues: latest.settings.venues.map((venue) =>
                    venue.id === id && [entry.base, expected].includes(layoutKey(venue))
                      ? mergeLayout(venue, saved)
                      : venue,
                  ),
                },
              },
        );
      } catch (cause) {
        if (owns() && pending.current.get(id) === entry) {
          entry.saving = false;
          entry.error = messageFrom(cause, "The saved layout could not be checked.");
          publish();
        }
        return false;
      }
    }
    pending.current.delete(id);
    publish();
    return true;
  };
  return { venueLayouts, stageVenueZoneLayout, commitVenueZoneLayout, discardVenueZoneLayout };
}
