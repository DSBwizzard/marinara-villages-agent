import { createVillagesClientId } from "../../shared/request-id.js";
import type { VillageSnapshot, VillageVenue } from "../../../shared/contracts/village.js";
import { MapStage } from "./MapStage.js";
import { ExplorationNavigation, LocationNavigator, MapIcon, NoticesButton } from "./villages-exploration.js";
import { messageFrom, request } from "../../shared/api.js";
import { ELEMENT_TAG } from "../../shared/constants.js";
import { FullscreenToggle, HomeDateWeather, placeSpot } from "../../shared/presentation.js";
import type { ExplorationScreenController } from "./screen-contracts.js";
import { useState } from "react";

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
  const places = (snapshot?.settings.venues ?? []).filter((venue) => venue.presentation.mapId === selectedMap?.id);
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
  const pins = savedPins
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
          setFocusSearch(true);
          setExploreSheet({ tab: "places" });
        } else {
          setExploreSheet(null);
          openMenu(tab === "people" ? "villagers" : "index");
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
        {!mobile && !placingProjectId ? navigation : null}
        <span className={`${ELEMENT_TAG}-home-bar-actions`}>
          {!placingProjectId ? (
            <NoticesButton
              count={snapshot?.noticeboard.length ?? 0}
              disabled={!snapshot || busy}
              onSelect={() => openMenu("noticeboard")}
            />
          ) : null}
          {!mobile ? <FullscreenToggle /> : null}
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
        <button type="button" disabled={busy} onClick={() => setShowAllMaps(true)}>
          All maps
        </button>
        {room && room.status !== "closed" ? (
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
            {navigatorOpen ? (
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
            ) : !mobile && !placingProjectId ? (
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
                placing={!!placingProjectId && !busy}
                view={savedTownMapView}
                shape={savedTownMapShape}
                onPlace={(x, y) => {
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
                  setExploreSheet(null);
                  setOpenPlaceId(null);
                }}
                mobile={mobile}
                exploration
                navigationView={navigationView}
                onNavigationView={setNavigationView}
              >
                {error || settingsError || lastSceneEnding ? (
                  <div className={`${ELEMENT_TAG}-notice`}>
                    {error ? (
                      <p role="alert" className={`${ELEMENT_TAG}-error`}>
                        {error}
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
      {mobile && !placingProjectId ? navigation : null}
    </div>
  );
}
