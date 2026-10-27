import { createVillagesClientId } from "../../shared/request-id.js";
import type { VillageSnapshot, VillageVenue } from "../../../shared/contracts/village.js";
import { MapStage } from "./MapStage.js";
import { ExplorationNavigation, LocationNavigator, MapIcon } from "./villages-exploration.js";
import { messageFrom, request } from "../../shared/api.js";
import { ELEMENT_TAG } from "../../shared/constants.js";
import { HomeDateWeather, placeSpot } from "../../shared/presentation.js";
import type { ExplorationScreenController } from "./screen-contracts.js";
import { useEffect, useState } from "react";

type MarkerDraft = {
  mapId: string;
  revision: number;
  placements: Record<string, { x: number | null; y: number | null }>;
  original: string;
  selected: string;
};

export function ExplorationScreen({ controller }: { controller: ExplorationScreenController }) {
  const {
    selectedMap,
    setSelectedMapId,
    showAllMaps,
    setShowAllMaps,
    room,
    returnToScene,
    busy,
    closeExploration,
    error,
    explorationOrigin,
    explorationReturnTab,
    explorationSearch,
    exploreSheet,
    lastSceneEnding,
    mobile,
    navigationView,
    openMenu,
    openPlace,
    openPlaceId,
    placingProjectId,
    savedPins,
    savedTownMapShape,
    savedTownMapView,
    setBusy,
    setError,
    setExplorationSearch,
    setExploreSheet,
    setFocusedProjectId,
    setNavigationView,
    setOpenPlaceId,
    setPlacingProjectId,
    setSnapshot,
    settingsError,
    snapshot,
    townMapImage,
    venueExplorationActions,
  } = controller;
  const [focusSearch, setFocusSearch] = useState(false);
  const [markerDraft, setMarkerDraft] = useState<MarkerDraft | null>(null);
  const [markerError, setMarkerError] = useState("");
  const [hasSavedMarkers, setHasSavedMarkers] = useState(false);
  const markerKey =
    selectedMap && snapshot?.settings.maps[0]?.id
      ? `villages-marker-draft:${snapshot.settings.maps[0].id}:${selectedMap.id}`
      : "";
  useEffect(() => {
    try {
      setHasSavedMarkers(!!markerKey && !!sessionStorage.getItem(markerKey));
    } catch {
      setHasSavedMarkers(false);
    }
  }, [markerKey]);
  const updateMarkerDraft = (draft: MarkerDraft) => {
    try {
      if (!markerKey) throw new Error("Missing map");
      sessionStorage.setItem(markerKey, JSON.stringify(draft));
      setHasSavedMarkers(true);
      setMarkerDraft(draft);
      setMarkerError("");
      return true;
    } catch {
      setMarkerError("Marker draft could not be saved on this device. Try again or cancel.");
      return false;
    }
  };
  useEffect(() => {
    if (!markerDraft || JSON.stringify(markerDraft.placements) === markerDraft.original) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [markerDraft]);
  const places = (snapshot?.settings.venues ?? []).filter((venue) => venue.presentation.mapId === selectedMap?.id);
  const startMarkers = () => {
    if (!selectedMap || !snapshot) return;
    try {
      const saved = markerKey && sessionStorage.getItem(markerKey);
      if (saved) {
        const draft = JSON.parse(saved) as MarkerDraft;
        if (draft.mapId === selectedMap.id && draft.placements && typeof draft.original === "string") {
          setMarkerError("");
          setExploreSheet(null);
          setOpenPlaceId(null);
          setMarkerDraft(draft);
          return;
        }
      }
    } catch {
      setMarkerError("Could not restore the marker draft on this device.");
      return;
    }
    const placements = Object.fromEntries([
      ...places.map((venue) => [venue.id, { x: venue.presentation.x, y: venue.presentation.y }]),
      ...snapshot.projects
        .filter(
          (project) =>
            project.kind === "new-venue" &&
            !["complete", "cancelled"].includes(project.status) &&
            !project.venueId &&
            project.venueDraft?.position.mapId === selectedMap.id,
        )
        .map((project) => [
          "project:" + project.id,
          { x: project.venueDraft!.position.x, y: project.venueDraft!.position.y },
        ]),
    ]);
    if (
      !updateMarkerDraft({
        mapId: selectedMap.id,
        revision: selectedMap.revision,
        placements,
        original: JSON.stringify(placements),
        selected: "",
      })
    )
      return;
    setExploreSheet(null);
    setOpenPlaceId(null);
  };
  const moveMarker = (id: string, x: number, y: number) => {
    if (!markerDraft?.placements[id]) return;
    updateMarkerDraft({ ...markerDraft, selected: id, placements: { ...markerDraft.placements, [id]: { x, y } } });
  };
  const saveMarkers = async () => {
    if (!markerDraft || busy) return;
    setBusy(true);
    setMarkerError("");
    try {
      const next = await request<VillageSnapshot>(`/maps/${encodeURIComponent(markerDraft.mapId)}`, {
        method: "PUT",
        body: JSON.stringify({
          expectedRevision: markerDraft.revision,
          placements: Object.entries(markerDraft.placements).map(([venueId, point]) => ({ venueId, ...point })),
        }),
      });
      setSnapshot(next);
      try {
        sessionStorage.removeItem(markerKey);
      } catch {
        setMarkerError("Markers saved, but the local draft could not be cleared. Cancel it when storage is available.");
        return;
      }
      setHasSavedMarkers(false);
      setMarkerDraft(null);
    } catch (cause) {
      setMarkerError(messageFrom(cause, "The marker positions could not be saved."));
    } finally {
      setBusy(false);
    }
  };
  const navigatorOpen = !placingProjectId && exploreSheet?.tab === "places";
  const selectPlace = (place: VillageVenue) => {
    setFocusSearch(false);
    explorationOrigin.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    explorationReturnTab.current = "map";
    setOpenPlaceId(place.id);
    const point = placeSpot(place);
    if (point) setNavigationView((current) => ({ zoom: current?.zoom ?? 1, centerX: point.x, centerY: point.y }));
    setExploreSheet({ tab: "places" });
  };
  const rows = places.map((place) => ({
    id: place.id,
    name: place.name,
    detail: [
      place.classes
        .map((value) => (value === "other" ? "Venue" : value[0].toUpperCase() + value.slice(1)))
        .join(" · ") || "Venue",
      !placeSpot(place) ? "Not on map" : "",
    ]
      .filter(Boolean)
      .join(" · "),
    selected: openPlaceId === place.id,
    onSelect: () => selectPlace(place),
    actions: venueExplorationActions(place).filter(
      (action) => action.label !== "Visit" || !room || room.status === "closed",
    ),
  }));
  const pins = markerDraft
    ? places.flatMap((place) => {
        const point = markerDraft.placements[place.id];
        if (point?.x == null || point.y == null) return [];
        return [
          {
            id: place.id,
            x: point.x,
            y: point.y,
            text: place.name,
            tone: "venue" as const,
            selected: place.id === markerDraft.selected,
            onSelect: !busy ? () => updateMarkerDraft({ ...markerDraft, selected: place.id }) : undefined,
          },
        ];
      })
    : savedPins
        .filter((pin) => pin.kind !== "person")
        .map((pin) => {
          const place = places.find((entry) => entry.id === pin.id);
          return {
            ...pin,
            text: place?.name ?? pin.text,
            selected: pin.id === openPlaceId,
            onSelect: place && !busy && !placingProjectId ? () => openPlace(place) : undefined,
          };
        });
  const navigation = (
    <ExplorationNavigation
      active={mobile ? (exploreSheet?.tab ?? "map") : "map"}
      disabled={!snapshot || busy}
      onChoose={(tab, button) => {
        explorationOrigin.current = button;
        explorationReturnTab.current = tab;
        if (tab === "map") {
          closeExploration();
          setShowAllMaps(false);
        } else if (tab === "places") {
          const first = places[0] ?? snapshot?.settings.venues[0];
          if (first) openPlace(first);
          else {
            setFocusSearch(true);
            setExploreSheet({ tab: "places" });
          }
        } else {
          setExploreSheet(null);
          openMenu(tab === "people" ? "villagers" : tab === "projects" ? "projects" : "index");
        }
      }}
    />
  );
  return (
    <div
      className={`${ELEMENT_TAG}-root ${ELEMENT_TAG}-home ${ELEMENT_TAG}-home-full`}
      data-mobile={mobile ? "true" : "false"}
    >
      <div className={`${ELEMENT_TAG}-home-bar`}>
        <span className={`${ELEMENT_TAG}-map-identity`}>
          <strong>{snapshot?.village.name}</strong>
          <HomeDateWeather weather={snapshot?.village.weather ?? ""} village={snapshot?.village} />
        </span>
        {!mobile && !placingProjectId && !markerDraft ? navigation : null}
        <span className={`${ELEMENT_TAG}-home-bar-actions`}>
          <button
            type="button"
            className={ELEMENT_TAG + "-button"}
            disabled={!!markerDraft}
            onClick={() => controller.setMailboxOpen(true)}
          >
            Mailbox
          </button>
          {placingProjectId ? (
            <button
              type="button"
              className={`${ELEMENT_TAG}-button`}
              disabled={busy}
              onClick={() => {
                setPlacingProjectId("");
                openMenu("projects");
              }}
            >
              Cancel placement
            </button>
          ) : null}
        </span>
      </div>
      <div className={ELEMENT_TAG + "-maps-toolbar"}>
        <button type="button" disabled={busy || !!markerDraft} onClick={() => setShowAllMaps(true)}>
          All maps
        </button>
        {!showAllMaps && !placingProjectId && selectedMap ? (
          markerDraft ? (
            <>
              <label>
                Venue{" "}
                <select
                  aria-label="Move Venue"
                  disabled={busy}
                  value={markerDraft.selected}
                  onChange={(event) => updateMarkerDraft({ ...markerDraft, selected: event.target.value })}
                >
                  <option value="">Choose Venue</option>
                  {places.map((place) => (
                    <option key={place.id} value={place.id}>
                      {place.name}
                    </option>
                  ))}
                </select>
              </label>
              <span>Choose a Venue, then tap the map or use arrow keys on the map or marker.</span>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  try {
                    sessionStorage.removeItem(markerKey);
                  } catch {
                    setMarkerError("Could not discard the marker draft. Try again.");
                    return;
                  }
                  setHasSavedMarkers(false);
                  setMarkerDraft(null);
                  setMarkerError("");
                }}
              >
                Cancel
              </button>
              <button type="button" disabled={busy} onClick={() => void saveMarkers()}>
                Save markers
              </button>
            </>
          ) : (
            <button type="button" disabled={busy} onClick={startMarkers}>
              {hasSavedMarkers ? "Resume marker edits" : "Move markers"}
            </button>
          )
        ) : null}
        {room && room.status !== "closed" && !markerDraft ? (
          <button type="button" onClick={returnToScene}>
            Return to Scene
          </button>
        ) : null}
      </div>
      <div className={ELEMENT_TAG + "-room"}>
        {showAllMaps ? (
          <div className={ELEMENT_TAG + "-maps-overview"}>
            <div className={ELEMENT_TAG + "-maps-heading"}>
              <h2>Maps</h2>
              <button type="button" onClick={() => openMenu("village")}>
                Manage maps
              </button>
            </div>
            <div className={ELEMENT_TAG + "-maps-grid"}>
              {(snapshot?.settings.maps ?? []).map((map) => (
                <button type="button" key={map.id} onClick={() => setSelectedMapId(map.id)}>
                  <img src={map.artwork.url} alt="" loading="lazy" />
                  <strong>{map.name}</strong>
                  <small>
                    {snapshot.settings.venues.filter((venue) => venue.presentation.mapId === map.id).length} Venues
                  </small>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {!markerDraft && navigatorOpen ? (
              <LocationNavigator
                mobile={mobile}
                focusSearch={focusSearch}
                search={explorationSearch.places}
                onSearch={(value) => setExplorationSearch((current) => ({ ...current, places: value }))}
                disabled={busy}
                onClose={() => {
                  if (mobile) closeExploration();
                  else {
                    setExploreSheet(null);
                  }
                  setFocusSearch(false);
                }}
                rows={rows}
              />
            ) : !placingProjectId && !markerDraft ? (
              <button
                type="button"
                className={`${ELEMENT_TAG}-navigator-toggle`}
                aria-label="Show places"
                onClick={() => {
                  setFocusSearch(true);
                  setExploreSheet({ tab: "places" });
                }}
              >
                <MapIcon name="places" />
                <span>Places</span>
              </button>
            ) : null}
            <div className={`${ELEMENT_TAG}-home-map-viewport`}>
              <MapStage
                key={selectedMap?.id}
                src={townMapImage || null}
                alt={`A map of ${selectedMap?.name ?? snapshot?.village.name ?? "the village"}.`}
                pins={pins}
                placing={(!!placingProjectId || !!markerDraft?.selected) && !busy}
                view={savedTownMapView}
                shape={savedTownMapShape}
                onPlace={(x, y) => {
                  if (markerDraft?.selected && !busy) {
                    moveMarker(markerDraft.selected, x, y);
                    return;
                  }
                  if (!placingProjectId || busy) return;
                  const projectId = placingProjectId;
                  setBusy(true);
                  setError("");
                  void request<VillageSnapshot>(`/projects/${encodeURIComponent(projectId)}/place`, {
                    method: "POST",
                    body: JSON.stringify({
                      x,
                      y,
                      mapId: selectedMap?.id,
                      expectedMapRevision: selectedMap?.revision,
                      requestId: createVillagesClientId(),
                      expectedRevision: snapshot?.projects.find((project) => project.id === projectId)?.lifecycle
                        ?.revision,
                    }),
                  })
                    .then((next) => {
                      setSnapshot(next);
                      setPlacingProjectId("");
                      setFocusedProjectId(projectId);
                      openMenu("projects");
                    })
                    .catch((cause) => setError(messageFrom(cause, "The Project could not be placed here.")))
                    .finally(() => setBusy(false));
                }}
                onDismiss={() => {
                  if (markerDraft) return;
                  setExploreSheet(null);
                  setOpenPlaceId(null);
                }}
                mobile={mobile}
                exploration
                navigationView={navigationView}
                onNavigationView={setNavigationView}
                keyboardPlacementId={markerDraft?.selected}
                onNudgePin={
                  markerDraft && !busy
                    ? (id, dx, dy) => {
                        const point = markerDraft.placements[id];
                        if (!point) return;
                        moveMarker(
                          id,
                          Math.round(Math.max(0, Math.min(1, (point.x ?? 0.5) + dx)) * 10000) / 10000,
                          Math.round(Math.max(0, Math.min(1, (point.y ?? 0.5) + dy)) * 10000) / 10000,
                        );
                      }
                    : undefined
                }
              >
                {error || settingsError || lastSceneEnding || markerError ? (
                  <div className={`${ELEMENT_TAG}-notice`}>
                    {error ? (
                      <p role="alert" className={`${ELEMENT_TAG}-error`}>
                        {error}
                      </p>
                    ) : null}
                    {markerError ? (
                      <p role="alert" className={`${ELEMENT_TAG}-error`}>
                        {markerError}
                      </p>
                    ) : null}
                    {settingsError ? (
                      <p role="alert" className={`${ELEMENT_TAG}-error`}>
                        {settingsError}
                      </p>
                    ) : null}
                    {lastSceneEnding ? <p className={`${ELEMENT_TAG}-status`}>{lastSceneEnding}</p> : null}
                  </div>
                ) : null}
                {!places.length && !placingProjectId ? (
                  <div className={ELEMENT_TAG + "-maps-empty"}>No Venues on this map.</div>
                ) : null}
              </MapStage>
            </div>
          </>
        )}
      </div>
      {mobile && !placingProjectId && !markerDraft ? navigation : null}
    </div>
  );
}
