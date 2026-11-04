import { useEffect, useRef, useState } from "react";
import type {
  PlaceDetail,
  PlaceDirectory,
  PlaceOperationView,
  PlaceRequest,
  PlaceSummary,
} from "../../../shared/contracts/places.js";
import type { VillageSnapshot, VillageVenue, VenueClass } from "../../../shared/contracts/village.js";
import { request, messageFrom } from "../../shared/api.js";
import { ModalDialog } from "../../shared/ModalDialog.js";
import { createVillagesClientId } from "../../shared/request-id.js";
import { ClassChoices } from "../projects/ProjectDesign.js";

type Pending = { path: string; body: PlaceRequest; operation?: PlaceOperationView };
export function PlacesDirectory({
  snapshot,
  mapId,
  selectedId = "",
  sceneActive,
  onClose,
  onVisit,
  onProject,
  onPlace,
}: {
  snapshot: VillageSnapshot;
  mapId: string;
  selectedId?: string;
  sceneActive: boolean;
  onClose(): void;
  onVisit(place: VillageVenue): void;
  onProject(snapshot: VillageSnapshot, id: string): void;
  onPlace(place: PlaceSummary): void;
}) {
  const [query, setQuery] = useState(""),
    [cursor, setCursor] = useState("");
  const [page, setPage] = useState<PlaceDirectory>({ items: [], nextCursor: null });
  const [detail, setDetail] = useState<PlaceDetail | null>(null),
    [error, setError] = useState("");
  const [existingVenueId, setExistingVenueId] = useState("");
  const [intent, setIntent] = useState(""),
    [busy, setBusy] = useState(false),
    [refresh, setRefresh] = useState(0);
  const [goal, setGoal] = useState(""),
    [objectives, setObjectives] = useState("");
  const [physical, setPhysical] = useState(false),
    [classes, setClasses] = useState<VenueClass[]>(["community"]);
  const [scope, setScope] = useState<string[]>([]),
    [establish, setEstablish] = useState(false);
  const key = "villages-place-request:" + snapshot.worldScope + ":" + mapId;
  const [pending, setPending] = useState<Pending | null>(() => {
    try {
      return JSON.parse(sessionStorage.getItem(key) ?? "null");
    } catch {
      return null;
    }
  });
  const alive = useRef(true),
    read = useRef(0);
  useEffect(
    () => () => {
      alive.current = false;
    },
    [],
  );
  const select = async (id: string) => {
    const ticket = ++read.current;
    try {
      const row = await request<PlaceDetail | { promoted: true; id: string }>("/places/" + encodeURIComponent(id));
      if (!alive.current || ticket !== read.current) return;
      if ("promoted" in row) {
        setError("This Place is now a Venue. Refresh the map.");
        return;
      }
      setDetail(row);
      setExistingVenueId("");
      setScope(["exterior"]);
      setClasses(row.location.zones?.some((zone) => zone.kind === "staff") ? ["workplace"] : ["community"]);
      setEstablish(false);
      setError("");
    } catch (cause) {
      if (alive.current && ticket === read.current) setError(messageFrom(cause, "Could not read this Place."));
    }
  };
  useEffect(() => {
    if (selectedId) void select(selectedId);
  }, [selectedId]);
  useEffect(() => {
    let current = true;
    const timer = setTimeout(() => {
      void request<PlaceDirectory>("/places?" + new URLSearchParams({ mapId, query, cursor, limit: "50" }))
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
  }, [mapId, query, cursor, refresh]);
  const retain = (value: Pending | null) => {
    if (value) sessionStorage.setItem(key, JSON.stringify(value));
    else sessionStorage.removeItem(key);
    if (alive.current) setPending(value);
  };
  const generate = async (saved: Pending, retry = false, visit = false) => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      retain(saved);
      const operation = await request<PlaceOperationView>(saved.path, {
        method: "POST",
        body: JSON.stringify({
          ...saved.body,
          ...(retry && saved.operation ? { retryOfAttempt: saved.operation.attempt } : {}),
        }),
      });
      retain({ ...saved, operation });
      if (operation.status === "ready") {
        retain(null);
        if (alive.current) {
          setRefresh((n) => n + 1);
          if (operation.placeId) {
            const row = await request<PlaceDetail | { promoted: true; id: string }>(
              "/places/" + encodeURIComponent(operation.placeId),
            );
            if (alive.current) {
              if ("promoted" in row) {
                setDetail(null);
                setExistingVenueId(row.id);
                const venue = snapshot.settings.venues.find((venue) => venue.id === row.id);
                if (visit && venue) onVisit(venue);
                return;
              }
              setDetail(row);
              setScope(["exterior"]);
              if (visit) onVisit(row.location);
            }
          } else setError("No appropriate Place was found.");
        }
      }
    } catch (cause) {
      try {
        const operation = await request<PlaceOperationView>(
          "/places/requests/" + encodeURIComponent(saved.body.requestId),
        );
        retain({ ...saved, operation });
      } catch {
        /* The original request remains recoverable. */
      }
      if (alive.current) setError(messageFrom(cause, "The request did not complete."));
    } finally {
      if (alive.current) setBusy(false);
    }
  };
  const visit = () => {
    if (!detail || sceneActive || busy) return;
    if (detail.prepared) onVisit(detail.location);
    else
      void generate(
        {
          path: "/places/" + encodeURIComponent(detail.id) + "/prepare",
          body: {
            worldScope: snapshot.worldScope,
            requestId: createVillagesClientId(),
            mapId,
            expectedRevision: detail.revision,
            intent: "Visit this Place",
          },
        },
        false,
        true,
      );
  };
  const create = async () => {
    if (!detail || busy) return;
    setBusy(true);
    setError("");
    try {
      const next = await request<VillageSnapshot>("/projects/establishments/" + encodeURIComponent(detail.id), {
        method: "POST",
        body: JSON.stringify({
          worldScope: snapshot.worldScope,
          requestId: createVillagesClientId(),
          classes,
          detail: goal,
          establishment: {
            goal,
            physical,
            zoneIds: scope,
            objectives: objectives
              .split("\n")
              .map((line) => line.trim())
              .filter(Boolean),
          },
        }),
      });
      if (alive.current)
        onProject(
          next,
          next.projects.find((project) => !snapshot.projects.some((prior) => prior.id === project.id))?.id ?? "",
        );
    } catch (cause) {
      if (alive.current) setError(messageFrom(cause, "Could not create the Project."));
    } finally {
      if (alive.current) setBusy(false);
    }
  };
  return (
    <ModalDialog title="Discover Places" onClose={onClose} scrollBody>
      <style>{`.villages-places-directory{display:grid;gap:1rem;padding:1rem;min-width:0;overflow-wrap:anywhere}.villages-places-directory form{display:grid;gap:.8rem}.villages-places-directory label{display:grid;gap:.3rem}dialog.villages-founding-dialog .villages-places-directory label:has(input[type=checkbox]){display:flex;flex-wrap:nowrap;align-items:center;gap:.5rem}dialog.villages-founding-dialog .villages-places-directory input[type=checkbox]{display:inline-block;width:1.1rem;height:1.1rem;min-width:1.1rem;min-height:0;margin:0;padding:0;flex:0 0 auto}.villages-places-directory input:not([type=checkbox]),.villages-places-directory textarea{box-sizing:border-box;width:100%;min-width:0;font:inherit}.villages-places-directory textarea{min-height:5rem;resize:vertical}.villages-places-directory ul{max-height:12rem;overflow:auto;padding-left:1.3rem}.villages-places-directory button{min-height:2.5rem}.villages-places-actions{display:flex;flex-wrap:wrap;gap:.5rem}.villages-places-directory fieldset{min-width:0}`}</style>
      <div className="villages-founding-editor-body villages-places-directory">
        {existingVenueId ? (
          <section>
            <h4>{snapshot.settings.venues.find((venue) => venue.id === existingVenueId)?.name ?? "Existing Venue"}</h4>
            <p>Already established as a Venue.</p>
            <button
              type="button"
              disabled={sceneActive || busy}
              onClick={() => {
                const venue = snapshot.settings.venues.find((venue) => venue.id === existingVenueId);
                if (venue) onVisit(venue);
              }}
            >
              Visit Venue
            </button>
          </section>
        ) : null}
        <form
          autoComplete="off"
          onSubmit={(event) => {
            event.preventDefault();
            void generate({
              path: "/places/explore",
              body: { worldScope: snapshot.worldScope, requestId: createVillagesClientId(), mapId, intent },
            });
          }}
        >
          <label>
            Explore
            <input
              autoComplete="off"
              value={intent}
              maxLength={1000}
              onChange={(event) => setIntent(event.target.value)}
              placeholder="What are you looking for?"
            />
          </label>
          <button disabled={busy || !!pending}>Explore</button>
        </form>
        {pending ? (
          <section aria-label="Saved Place request">
            <p>{pending.operation?.error || "Saved exploration request"}</p>
            <button disabled={busy} onClick={() => void generate(pending, pending.operation?.status === "failed")}>
              {pending.operation?.status === "failed" ? "Retry request" : "Resume saved request"}
            </button>
            <button disabled={busy} onClick={() => retain(null)}>
              Dismiss request
            </button>
          </section>
        ) : null}
        <label>
          Search Places
          <input
            autoComplete="off"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setCursor("");
            }}
            maxLength={200}
          />
        </label>
        <ul>
          {page.items.map((place) => (
            <li key={place.id}>
              <button disabled={busy} onClick={() => void select(place.id)}>
                {place.name}
                {place.report ? " · Reported" : ""}
              </button>
            </li>
          ))}
        </ul>
        {!page.items.length ? <p>No known Places match.</p> : null}
        <div>
          <button disabled={busy || !cursor} onClick={() => setCursor("")}>
            First page
          </button>
          <button disabled={busy || !page.nextCursor} onClick={() => setCursor(page.nextCursor ?? "")}>
            Next page
          </button>
        </div>
        {detail ? (
          <section aria-label="Place details">
            <h4>{detail.name}</h4>
            <p>{detail.description}</p>
            <div className="villages-places-actions">
              <button disabled={busy || sceneActive || !!pending} onClick={visit}>
                {detail.prepared ? "Visit" : "Prepare and visit"}
              </button>
              <button disabled={busy} onClick={() => onPlace(detail)}>
                {detail.x === null ? "Place on map" : "Move marker"}
              </button>
              <button disabled={busy || !detail.prepared || detail.report} onClick={() => setEstablish(!establish)}>
                Establish as Venue
              </button>
            </div>
            {establish ? (
              <form
                autoComplete="off"
                onSubmit={(event) => {
                  event.preventDefault();
                  void create();
                }}
              >
                <label>
                  Ongoing village use
                  <textarea
                    autoComplete="off"
                    required
                    maxLength={1000}
                    value={goal}
                    onChange={(event) => setGoal(event.target.value)}
                  />
                </label>
                <ClassChoices value={classes} onChange={setClasses} />
                <fieldset>
                  <legend>Affected spaces</legend>
                  {detail.location.zones?.map((zone) => (
                    <label key={zone.id}>
                      <input
                        autoComplete="off"
                        type="checkbox"
                        checked={scope.includes(zone.id)}
                        onChange={(event) =>
                          setScope((old) =>
                            event.target.checked ? [...old, zone.id] : old.filter((id) => id !== zone.id),
                          )
                        }
                      />
                      {zone.name}
                    </label>
                  ))}
                </fieldset>
                <label>
                  Objectives · one per line
                  <textarea
                    autoComplete="off"
                    value={objectives}
                    maxLength={4000}
                    onChange={(event) => setObjectives(event.target.value)}
                  />
                </label>
                <label>
                  <input
                    autoComplete="off"
                    type="checkbox"
                    checked={physical}
                    onChange={(event) => setPhysical(event.target.checked)}
                  />
                  Physical work required
                </label>
                <button disabled={busy || !scope.length}>Create establishment draft</button>
              </form>
            ) : null}
          </section>
        ) : null}
        {busy ? <p role="status">Working…</p> : null}
        {error ? <p role="alert">{error}</p> : null}
      </div>
    </ModalDialog>
  );
}
