import type { VillageMap, VillageSnapshot, TownMapView } from "../../../shared/contracts/village.js";
import { useEffect, useRef, useState } from "react";
import { messageFrom, request, VillageApiError } from "../../shared/api.js";
import { createVillagesClientId } from "../../shared/request-id.js";
import { readFileAsDataUrl, measureImage } from "../../shared/presentation.js";
import { townMapImageProblem } from "../../../shared/helpers/town-map-upload.js";
import { readDeviceDraft, saveDeviceDraft, removeDeviceDraft } from "../../shared/device-drafts.js";
import { MapStage, defaultView, TOWN_MAP_FITS } from "../exploration/MapStage.js";
import { ELEMENT_TAG as P } from "../../shared/constants.js";
import type { ReportLocalDraftStatus } from "./local-draft-status.js";

type Draft = {
  id: string;
  name: string;
  details: string;
  image: string;
  width: number;
  height: number;
  view: TownMapView;
  revision: number;
  requestId: string;
  phase: "" | "starting" | "waiting" | "paused";
  placements: Record<string, { x: number | null; y: number | null }>;
};
type Receipt = {
  status: "running" | "complete" | "failed" | "interrupted";
  error: string;
  result: { image: string; width: number; height: number } | null;
};

export function MapsPanel({
  snapshot,
  onSnapshot,
  mobile,
  reportLocalDraftStatus,
}: {
  snapshot: VillageSnapshot;
  onSnapshot(next: VillageSnapshot): void;
  mobile: boolean;
  reportLocalDraftStatus: ReportLocalDraftStatus;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  return (
    <section className={P + "-maps-settings"} aria-label="Maps">
      <div className={P + "-row"}>
        <h3>Maps</h3>
        <button type="button" className={P + "-button"} disabled={editing !== null} onClick={() => setEditing("new")}>
          Add map
        </button>
      </div>
      {snapshot.settings.maps.map((map) => (
        <div key={map.id} className={P + "-maps-saved-row"}>
          <img src={map.artwork.url} alt="" loading="lazy" />
          <span>
            <strong>{map.name}</strong>
            <small>
              {snapshot.settings.venues.filter((venue) => venue.presentation.mapId === map.id).length} Venues
            </small>
          </span>
          <button
            type="button"
            className={P + "-button"}
            disabled={editing !== null}
            onClick={() => setEditing(map.id)}
          >
            Edit map
          </button>
        </div>
      ))}
      {editing !== null ? (
        <MapEditor
          key={editing}
          snapshot={snapshot}
          map={snapshot.settings.maps.find((map) => map.id === editing)}
          onSnapshot={onSnapshot}
          onClose={() => setEditing(null)}
          mobile={mobile}
          reportLocalDraftStatus={reportLocalDraftStatus}
        />
      ) : null}
    </section>
  );
}
function MapEditor({
  snapshot,
  map,
  onSnapshot,
  onClose,
  mobile,
  reportLocalDraftStatus,
}: {
  snapshot: VillageSnapshot;
  map?: VillageMap;
  onSnapshot(next: VillageSnapshot): void;
  onClose(): void;
  mobile: boolean;
  reportLocalDraftStatus: ReportLocalDraftStatus;
}) {
  const initial = (): Draft => ({
    id: map?.id ?? createVillagesClientId(),
    name: map?.name ?? "",
    details: "",
    image: "",
    width: map?.width ?? 2560,
    height: map?.height ?? 1440,
    view: map?.view ?? defaultView("cover"),
    revision: map?.revision ?? 0,
    requestId: "",
    phase: "",
    placements: Object.fromEntries([
      ...snapshot.settings.venues
        .filter((venue) => venue.presentation.mapId === map?.id)
        .map((venue) => [venue.id, { x: venue.presentation.x, y: venue.presentation.y }]),
      ...snapshot.projects
        .filter(
          (project) =>
            project.kind === "new-venue" &&
            !["complete", "cancelled"].includes(project.status) &&
            !project.venueId &&
            project.venueDraft?.position.mapId === map?.id,
        )
        .map((project) => [
          "project:" + project.id,
          { x: project.venueDraft!.position.x, y: project.venueDraft!.position.y },
        ]),
    ]),
  });
  const [draft, setDraft] = useState<Draft>(initial);
  const original = useRef(draft);
  const [ready, setReady] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const label = (id: string) =>
    id.startsWith("project:")
      ? (snapshot.projects.find((project) => project.id === id.slice(8))?.title ?? "")
      : (snapshot.settings.venues.find((venue) => venue.id === id)?.name ?? "");
  const [placing, setPlacing] = useState("");
  useEffect(() => {
    reportLocalDraftStatus("map", {
      dirty: JSON.stringify(draft) !== JSON.stringify(original.current),
      busy: busy || !ready,
    });
  }, [draft, busy, ready, reportLocalDraftStatus]);
  useEffect(() => () => reportLocalDraftStatus("map", null), [reportLocalDraftStatus]);
  const revision = useRef(0),
    checking = useRef(false),
    attempt = useRef(0),
    writes = useRef(Promise.resolve()),
    alive = useRef(true);
  const draftKey = "map:" + snapshot.settings.maps[0].id + ":" + (map?.id ?? "new");
  useEffect(() => {
    alive.current = true;
    void readDeviceDraft<Draft>(draftKey)
      .then((saved) => {
        if (!alive.current) return;
        if (saved) {
          revision.current = saved.revision;
          setDraft(saved.data);
        }
        setReady(true);
      })
      .catch((cause) => {
        if (alive.current) setError(messageFrom(cause, "Could not load the map draft."));
      });
    return () => {
      alive.current = false;
    };
  }, [draftKey]);
  const persist = (next: Draft) => {
    const write = writes.current.then(async () => {
      const saved = await saveDeviceDraft(draftKey, next, revision.current);
      revision.current = saved.revision;
    });
    writes.current = write.catch(() => {});
    return write;
  };
  const check = async (candidate = draft) => {
    if (checking.current) return;
    checking.current = true;
    const epoch = attempt.current;
    const current = () => alive.current && epoch === attempt.current;
    try {
      const receipt = await request<Receipt>(
        "/maps/generation/" + encodeURIComponent(candidate.id) + "/" + encodeURIComponent(candidate.requestId),
      );
      if (!current()) return;
      if (receipt.status === "complete" && receipt.result) {
        const next = { ...candidate, ...receipt.result, phase: "" as const };
        await persist(next);
        if (current()) {
          setDraft(next);
          setError("");
        }
      } else if (receipt.status === "running") {
        setDraft({ ...candidate, phase: "waiting" });
      } else {
        const next = { ...candidate, phase: "" as const };
        await persist(next);
        if (current()) {
          setDraft(next);
          setError(receipt.error || "Artwork did not complete. Generate again only when you choose.");
        }
      }
    } catch (cause) {
      if (current()) {
        if (cause instanceof VillageApiError && cause.status === 404) {
          const next = { ...candidate, requestId: "", phase: "" as const };
          await persist(next);
          if (current()) setDraft(next);
        } else setDraft({ ...candidate, phase: "paused" });
        setError(messageFrom(cause, "Check map status before requesting more artwork."));
      }
    } finally {
      checking.current = false;
    }
  };
  useEffect(() => {
    if (!ready || busy || (draft.phase !== "starting" && draft.phase !== "waiting")) return;
    const timer = window.setTimeout(() => void check(draft), 1500);
    return () => window.clearTimeout(timer);
  });
  const generate = async () => {
    if (!ready || busy || draft.phase || !draft.name.trim()) return;
    attempt.current++;
    setBusy(true);
    setError("");
    const pending: Draft = { ...draft, requestId: createVillagesClientId(), phase: "starting" };
    try {
      await persist(pending);
      setDraft(pending);
      const inputs = {
        targetId: draft.id,
        actionId: pending.requestId,
        setting: snapshot.settings.setting,
        structure: "Map name: " + draft.name + ". " + draft.details,
        sceneryArtStyle: snapshot.settings.sceneryArtStyle,
        sceneryStyleProfileId: snapshot.settings.sceneryStyleProfileId,
        selectedLorebookIds: snapshot.settings.selectedLorebookIds,
        loreTokenBudget: snapshot.settings.loreTokenBudget,
        useVisualLore: snapshot.settings.useVisualLoreByDefault,
      };
      await request<Receipt>("/maps/generate", {
        method: "POST",
        body: JSON.stringify({ ...inputs, sourceKey: JSON.stringify(inputs) }),
      });
      if (alive.current) setDraft({ ...pending, phase: "waiting" });
    } catch (cause) {
      if (alive.current) {
        setDraft({ ...pending, phase: "paused" });
        setError(messageFrom(cause, "Check map status before generating again."));
      }
    } finally {
      if (alive.current) setBusy(false);
    }
  };
  const upload = async (file?: File) => {
    if (!file) return;
    attempt.current++;
    setBusy(true);
    setError("");
    try {
      if (file.size > Math.floor((snapshot.settings.townMapImageMaxLength - 64) * 0.75))
        throw new Error("Choose a smaller map image.");
      const image = await readFileAsDataUrl(file),
        size = await measureImage(image);
      const problem = townMapImageProblem(size);
      if (problem) throw new Error(problem);
      const next = { ...draft, image, ...size, view: defaultView("cover"), requestId: "", phase: "" as const };
      await persist(next);
      if (alive.current) setDraft(next);
    } catch (cause) {
      if (alive.current) setError(messageFrom(cause, "Could not use this map image."));
    } finally {
      if (alive.current) setBusy(false);
    }
  };
  const save = async () => {
    setBusy(true);
    setError("");
    try {
      await persist(draft);
      const next = await request<VillageSnapshot>(map ? "/maps/" + encodeURIComponent(map.id) : "/maps", {
        method: map ? "PUT" : "POST",
        body: JSON.stringify({
          id: draft.id,
          name: draft.name,
          image: draft.image || undefined,
          view: draft.view,
          expectedRevision: draft.revision,
          ...(map
            ? { placements: Object.entries(draft.placements).map(([venueId, point]) => ({ venueId, ...point })) }
            : {}),
        }),
      });
      await removeDeviceDraft(draftKey);
      if (alive.current) {
        onSnapshot(next);
        onClose();
      }
    } catch (cause) {
      if (alive.current) setError(messageFrom(cause, "The map could not be saved."));
    } finally {
      if (alive.current) setBusy(false);
    }
  };
  const waiting = !!draft.phase,
    disabled = !ready || busy || waiting;
  return (
    <div className={P + "-maps-editor"} aria-label={map ? "Edit map" : "Add map"}>
      <h3>{map ? "Edit map" : "Add map"}</h3>
      <label>
        Map name
        <input
          autoComplete="off"
          aria-label="Map name"
          maxLength={80}
          value={draft.name}
          disabled={disabled}
          onChange={(event) => setDraft({ ...draft, name: event.target.value })}
        />
      </label>
      <label>
        Map details
        <textarea
          autoComplete="off"
          aria-label="Map details"
          rows={2}
          maxLength={1000}
          value={draft.details}
          disabled={disabled}
          onChange={(event) => setDraft({ ...draft, details: event.target.value })}
        />
      </label>
      <div className={P + "-row"}>
        <button
          type="button"
          className={P + "-button"}
          disabled={disabled || !draft.name.trim()}
          onClick={() => void generate()}
        >
          Generate artwork
        </button>
        <label className={P + "-button"}>
          Upload image
          <input
            autoComplete="off"
            aria-label="Upload map image"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/avif"
            disabled={disabled}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              void upload(file);
            }}
          />
        </label>
        {waiting ? (
          <button type="button" className={P + "-button"} disabled={busy} onClick={() => void check()}>
            Check map status
          </button>
        ) : null}
      </div>
      {draft.image || map ? (
        <>
          <div className={P + "-map-edit-canvas"} inert={disabled}>
            <MapStage
              src={draft.image || map!.artwork.url}
              alt="Map preview"
              shape={{ width: draft.width, height: draft.height }}
              view={draft.view}
              onView={(view) => {
                if (!disabled) setDraft({ ...draft, view });
              }}
              mobile={mobile}
              pins={Object.entries(draft.placements).flatMap(([id, point]) =>
                point.x === null || point.y === null
                  ? []
                  : [
                      {
                        id,
                        x: point.x,
                        y: point.y,
                        text: label(id),
                        tone: "venue" as const,
                        onSelect: () => setPlacing(id),
                      },
                    ],
              )}
              placing={!!placing}
              onPlace={(x, y) => {
                if (disabled) return;
                setDraft({ ...draft, placements: { ...draft.placements, [placing]: { x, y } } });
                setPlacing("");
              }}
            />
          </div>
          <div className={P + "-row"}>
            {TOWN_MAP_FITS.map((option) => (
              <button
                key={option.fit}
                type="button"
                className={P + "-button"}
                disabled={disabled}
                aria-pressed={draft.view.fit === option.fit}
                onClick={() => setDraft({ ...draft, view: { ...draft.view, fit: option.fit } })}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      ) : null}
      {map ? (
        <label>
          Place marker
          <select
            aria-label="Place marker"
            disabled={disabled}
            value={placing}
            onChange={(event) => setPlacing(event.target.value)}
          >
            <option value="">Choose Venue</option>
            {Object.keys(draft.placements).map((id) => (
              <option key={id} value={id}>
                {label(id)}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      {map && map.revision !== draft.revision ? (
        <button
          type="button"
          className={P + "-button"}
          disabled={busy}
          onClick={() => setDraft({ ...draft, revision: map.revision, placements: initial().placements })}
        >
          Review latest placements
        </button>
      ) : null}
      {error ? <p role="alert">{error}</p> : null}
      <div className={P + "-row"}>
        <button type="button" className={P + "-button"} disabled={busy} onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className={P + "-button"}
          disabled={disabled || !draft.name.trim() || (!draft.image && !map)}
          onClick={() => void save()}
        >
          Save map
        </button>
      </div>
    </div>
  );
}
