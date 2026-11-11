import { createVillagesClientId } from "../../shared/request-id.js";
import { useVillageActivity } from "../../shared/activity.js";
import type { VillageSnapshot, VillageVenue } from "../../../shared/contracts/village.js";
import { MapStage } from "./MapStage.js";
import { ExplorationNavigation, LocationNavigator, MapIcon } from "./villages-exploration.js";
import { messageFrom, request } from "../../shared/api.js";
import { ELEMENT_TAG } from "../../shared/constants.js";
import { StorybookHeading } from "../../shared/StorybookHeading.js";
import { HomeDateWeather, placeSpot } from "../../shared/presentation.js";
import { useVillageLighting } from "../../shared/useVillageLighting.js";
import type { ExplorationScreenController } from "./screen-contracts.js";
import { type CSSProperties, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { PlacesDirectory } from "./PlacesDirectory.js";
import { StreetView } from "./StreetView.js";
import type { PlaceDetail, PlaceDirectory, PlaceSummary } from "../../../shared/contracts/places.js";

type MarkerDraft = {
  mapId: string;
  revision: number;
  placements: Record<string, { x: number | null; y: number | null }>;
  original: string;
  selected: string;
};

export function ExplorationScreen({ controller }: { controller: ExplorationScreenController }) {
  const lighting = useVillageLighting(controller.snapshot?.village);
  const { visible } = useVillageActivity();
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
  const mapChoice = useRef<HTMLButtonElement>(null);
  const mapHeading = useRef<HTMLHeadingElement>(null);
  const choosingMap = useRef(showAllMaps);
  useEffect(() => {
    if (showAllMaps) mapHeading.current?.focus({ preventScroll: true });
    else if (choosingMap.current) mapChoice.current?.focus({ preventScroll: true });
    choosingMap.current = showAllMaps;
  }, [showAllMaps]);
  const [discoveryOpen, setDiscoveryOpen] = useState(false),
    [discoveryId, setDiscoveryId] = useState("");
  const [showPlaces, setShowPlaces] = useState(false),
    [placeMarkers, setPlaceMarkers] = useState<PlaceSummary[]>([]);
  const [bounds, setBounds] = useState("0,0,1,1"),
    [placingPlace, setPlacingPlace] = useState<PlaceSummary | null>(null);
  const mapId = selectedMap?.id;
  useEffect(() => {
    if (!visible) return;
    if (!showPlaces || !mapId) {
      setPlaceMarkers([]);
      return;
    }
    let current = true;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      void request<PlaceDirectory>("/places?" + new URLSearchParams({ mapId, bounds, limit: "100" }), {
        signal: controller.signal,
      })
        .then((page) => {
          if (current) setPlaceMarkers(page.items);
        })
        .catch((cause) => {
          if (current) setError(messageFrom(cause, "Could not read Place markers."));
        });
    }, 150);
    return () => {
      current = false;
      controller.abort();
      clearTimeout(timer);
    };
  }, [showPlaces, mapId, bounds, setError, visible]);
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
  const [street, setStreet] = useState<{ id: string; worldScope: string; origin: string } | null>(null);
  const mapViewport = useRef<HTMLDivElement>(null);
  const mapFocus = useRef("");
  const streetPlace =
    street?.worldScope === snapshot?.worldScope &&
    !navigatorOpen &&
    !showAllMaps &&
    !markerDraft &&
    !placingPlace &&
    !placingProjectId
      ? places.find((place) => place.id === street?.id)
      : undefined;
  const mapPin = useCallback(
    (id: string) => mapViewport.current?.querySelector<HTMLButtonElement>(`button[data-pin-id="${CSS.escape(id)}"]`),
    [],
  );
  const openStreet = (place: VillageVenue) => {
    const frame = mapViewport.current?.getBoundingClientRect();
    const pin = mapPin(place.id)?.getBoundingClientRect();
    const origin =
      streetPlace && street
        ? street.origin
        : frame && pin
          ? `${pin.x + pin.width / 2 - frame.x}px ${pin.y + pin.height / 2 - frame.y}px`
          : "center";
    setStreet({ id: place.id, worldScope: snapshot.worldScope, origin });
    setOpenPlaceId(place.id);
  };
  const returnToMap = () => {
    if (streetPlace) {
      mapFocus.current = streetPlace.id;
      setOpenPlaceId(streetPlace.id);
    }
    setStreet(null);
  };
  useLayoutEffect(() => {
    if (streetPlace || !mapFocus.current) return;
    mapPin(mapFocus.current)?.focus({ preventScroll: true });
    mapFocus.current = "";
  }, [mapPin, streetPlace]);
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
            onSelect:
              place && !busy && !placingProjectId && !placingPlace
                ? () => (navigatorOpen ? openPlace(place) : openStreet(place))
                : undefined,
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
          if (streetPlace) returnToMap();
          else closeExploration();
          setShowAllMaps(false);
        } else if (tab === "places") {
          setStreet(null);
          setFocusSearch(true);
          setExploreSheet({ tab: "places" });
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
          <span role="img" aria-label={lighting} title={lighting}>
            {lighting === "night" ? "🌙" : lighting === "evening" ? "🌇" : lighting === "morning" ? "🌅" : "☀️"}
          </span>
        </span>
        {!mobile && !placingProjectId && !markerDraft ? navigation : null}
        <span className={`${ELEMENT_TAG}-home-bar-actions`}>
          <button
            type="button"
            className={ELEMENT_TAG + "-mailbox-launch"}
            aria-label={snapshot?.mailboxUnread ? "Mailbox · Unread mail" : "Mailbox"}
            title="Mailbox"
            disabled={!!markerDraft}
            onClick={() => controller.setMailboxOpen(true)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m3 6 9 7 9-7" />
            </svg>
            {snapshot?.mailboxUnread ? <span className={ELEMENT_TAG + "-mailbox-dot"} aria-hidden="true" /> : null}
          </button>
          {room && room.status !== "closed" && !markerDraft ? (
            <button type="button" className={`${ELEMENT_TAG}-button`} onClick={returnToScene}>
              Return to Scene
            </button>
          ) : null}
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
      {placingPlace || markerDraft ? (
        <div className={ELEMENT_TAG + "-maps-toolbar"}>
          {placingPlace ? (
            <>
              <span>Choose a map position for {placingPlace.name}.</span>
              <button type="button" onClick={() => setPlacingPlace(null)}>
                Cancel placement
              </button>
            </>
          ) : null}
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
            ) : null
          ) : null}
        </div>
      ) : null}
      <div className={ELEMENT_TAG + "-room"}>
        {showAllMaps ? (
          <div className={ELEMENT_TAG + "-maps-overview"}>
            <div className={ELEMENT_TAG + "-maps-heading"}>
              <h2 tabIndex={-1} ref={mapHeading}>
                Maps
              </h2>
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
                onDiscover={() => {
                  setDiscoveryId("");
                  setDiscoveryOpen(true);
                }}
                onClose={() => {
                  closeExploration();
                  setFocusSearch(false);
                }}
                rows={rows}
              />
            ) : null}
            <div className={`${ELEMENT_TAG}-home-map-paper`}>
              <div className={`${ELEMENT_TAG}-places-title`}>
                <StorybookHeading>Places</StorybookHeading>
              </div>
              {!placingProjectId && !markerDraft && !streetPlace ? (
                <div className={`${ELEMENT_TAG}-map-tools`}>
                  <button
                    type="button"
                    aria-label="Choose map"
                    ref={mapChoice}
                    disabled={busy}
                    onClick={() => setShowAllMaps(true)}
                  >
                    <MapIcon name="map" />
                    <span>{selectedMap?.name ?? "Maps"}</span>
                    <span aria-hidden="true">▾</span>
                  </button>
                  <details
                    onClick={(event) => {
                      if (event.target instanceof Element && event.target.closest("button"))
                        event.currentTarget.open = false;
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Escape") {
                        event.preventDefault();
                        event.currentTarget.open = false;
                        event.currentTarget.querySelector("summary")?.focus();
                      }
                    }}
                  >
                    <summary role="button" aria-label="Map options">
                      <MapIcon name="more" />
                    </summary>
                    <div className={`${ELEMENT_TAG}-map-options`}>
                      <label>
                        <input
                          autoComplete="off"
                          type="checkbox"
                          checked={showPlaces}
                          onChange={(event) => setShowPlaces(event.target.checked)}
                        />
                        Places layer
                      </label>
                      {selectedMap ? (
                        <button type="button" disabled={busy} onClick={startMarkers}>
                          {hasSavedMarkers ? "Resume marker edits" : "Move markers"}
                        </button>
                      ) : null}
                    </div>
                  </details>
                </div>
              ) : null}
              <div
                className={`${ELEMENT_TAG}-home-map-viewport`}
                ref={mapViewport}
                data-street={streetPlace ? true : undefined}
                style={streetPlace ? ({ "--street-origin": street?.origin } as CSSProperties) : undefined}
              >
                <MapStage
                  inert={!!streetPlace}
                  navigationControlsOnMobile={navigatorOpen}
                  key={selectedMap?.id}
                  lighting={lighting}
                  src={townMapImage || null}
                  alt={`A map of ${selectedMap?.name ?? snapshot?.village.name ?? "the village"}.`}
                  pins={[
                    ...pins,
                    ...(!markerDraft && showPlaces
                      ? placeMarkers
                          .filter((place) => place.x !== null && place.y !== null)
                          .map((place) => ({
                            id: place.id,
                            x: place.x!,
                            y: place.y!,
                            text: place.name,
                            tone: "venue" as const,
                            onSelect: () => {
                              setDiscoveryId(place.id);
                              setDiscoveryOpen(true);
                            },
                          }))
                      : []),
                  ]}
                  placing={(!!placingProjectId || !!placingPlace || !!markerDraft?.selected) && !busy}
                  view={savedTownMapView}
                  shape={savedTownMapShape}
                  onPlace={(x, y) => {
                    if (placingPlace && !busy) {
                      const place = placingPlace;
                      setBusy(true);
                      setError("");
                      void request<PlaceDetail>("/places/" + encodeURIComponent(place.id) + "/position", {
                        method: "POST",
                        body: JSON.stringify({
                          requestId: createVillagesClientId(),
                          expectedRevision: place.revision,
                          expectedMapRevision: selectedMap?.revision,
                          mapId: selectedMap?.id,
                          x,
                          y,
                        }),
                      })
                        .then(() => request<VillageSnapshot>("/"))
                        .then((next) => {
                          setSnapshot(next);
                          setPlacingPlace(null);
                        })
                        .catch((cause) => setError(messageFrom(cause, "Could not place this location.")))
                        .finally(() => setBusy(false));
                      return;
                    }
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
                  onViewportBounds={setBounds}
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
                {streetPlace ? (
                  <StreetView
                    place={streetPlace}
                    places={places}
                    lighting={lighting}
                    busy={busy}
                    error={error}
                    ending={lastSceneEnding}
                    actions={venueExplorationActions(streetPlace).filter(
                      (action) => action.label !== "Visit" || !room || room.status === "closed",
                    )}
                    onPath={openStreet}
                    onMap={returnToMap}
                  />
                ) : null}
              </div>
            </div>
          </>
        )}
      </div>
      {mobile && !placingProjectId && !markerDraft ? navigation : null}
      {discoveryOpen && selectedMap ? (
        <PlacesDirectory
          key={snapshot.worldScope + ":" + selectedMap.id}
          snapshot={snapshot}
          mapId={selectedMap.id}
          selectedId={discoveryId}
          sceneActive={!!room && room.status !== "closed"}
          onClose={() => setDiscoveryOpen(false)}
          onVisit={(place) => {
            setDiscoveryOpen(false);
            venueExplorationActions(place)
              .find((action) => action.label === "Visit")
              ?.onSelect();
          }}
          onPlace={(place) => {
            setDiscoveryOpen(false);
            setPlacingPlace(place);
            setShowAllMaps(false);
          }}
          onProject={(next, id) => {
            setSnapshot(next);
            setDiscoveryOpen(false);
            setFocusedProjectId(id);
            openMenu("projects");
          }}
        />
      ) : null}
    </div>
  );
}
