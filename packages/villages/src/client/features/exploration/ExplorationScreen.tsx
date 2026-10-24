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
    busy,
    catchingUp,
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
  const [collapsed, setCollapsed] = useState(false);
  const [focusSearch, setFocusSearch] = useState(false);
  const places = snapshot?.settings.venues ?? [];
  const navigatorOpen = !placingProjectId && (mobile ? exploreSheet?.tab === "places" : !collapsed);
  const selectPlace = (place: VillageVenue) => {
    setFocusSearch(false);
    explorationOrigin.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    explorationReturnTab.current = "map";
    setOpenPlaceId(place.id);
    const point = placeSpot(place);
    if (point) setNavigationView((current) => ({ zoom: current?.zoom ?? 1, centerX: point.x, centerY: point.y }));
    if (mobile) setExploreSheet({ tab: "places" });
    else setCollapsed(false);
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
    actions: venueExplorationActions(place),
  }));
  const pins = savedPins
    .filter((pin) => pin.kind !== "person")
    .map((pin) => {
      const place = places.find((entry) => entry.id === pin.id);
      return {
        ...pin,
        text: place?.name ?? pin.text,
        selected: pin.id === openPlaceId,
        onSelect: place && !busy ? () => openPlace(place) : undefined,
      };
    });
  const navigation = (
    <ExplorationNavigation
      active={mobile ? (exploreSheet?.tab ?? "map") : "map"}
      disabled={!snapshot || busy}
      onChoose={(tab, button) => {
        explorationOrigin.current = button;
        explorationReturnTab.current = tab;
        if (tab === "map") closeExploration();
        else if (tab === "places") {
          setFocusSearch(true);
          setCollapsed(false);
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
          <button type="button" className={ELEMENT_TAG + "-button"} onClick={() => controller.setMailboxOpen(true)}>
            Mailbox
          </button>
          <NoticesButton
            count={snapshot?.noticeboard.length ?? 0}
            disabled={!snapshot || busy}
            onSelect={() => openMenu("noticeboard")}
          />
          {!mobile ? <FullscreenToggle /> : null}
          {placingProjectId ? (
            <button type="button" className={`${ELEMENT_TAG}-button`} onClick={() => setPlacingProjectId("")}>
              Cancel placement
            </button>
          ) : null}
        </span>
      </div>
      <div className={`${ELEMENT_TAG}-room`}>
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
                setCollapsed(true);
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
              setCollapsed(false);
              setExploreSheet({ tab: "places" });
            }}
          >
            <MapIcon name="places" />
            <span>Places</span>
          </button>
        ) : null}
        <div className={`${ELEMENT_TAG}-home-map-viewport`}>
          <MapStage
            src={townMapImage || null}
            alt={`A map of ${snapshot?.village.name ?? "the village"}.`}
            pins={pins}
            placing={!!placingProjectId}
            view={savedTownMapView}
            shape={savedTownMapShape}
            onPlace={(x, y) => {
              if (!placingProjectId) return;
              const projectId = placingProjectId;
              setBusy(true);
              setError("");
              void request<VillageSnapshot>(`/projects/${encodeURIComponent(projectId)}/place`, {
                method: "POST",
                body: JSON.stringify({
                  x,
                  y,
                  requestId: createVillagesClientId(),
                  expectedRevision: snapshot?.projects.find((project) => project.id === projectId)?.lifecycle?.revision,
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
            {error || settingsError || catchingUp || lastSceneEnding ? (
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
                {catchingUp ? (
                  <span className={`${ELEMENT_TAG}-status`}>
                    Catching up on {snapshot?.village.name ?? "the village"}…
                  </span>
                ) : null}
                {lastSceneEnding ? <p className={`${ELEMENT_TAG}-status`}>{lastSceneEnding}</p> : null}
              </div>
            ) : null}
          </MapStage>
        </div>
      </div>
      {mobile && !placingProjectId ? navigation : null}
    </div>
  );
}
