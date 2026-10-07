import type { VillageSnapshot, VillageVenue } from "../../../shared/contracts/village.js";
import { MapStage } from "../../features/exploration/MapStage.js";
import {
  BrowseList,
  DesktopPanel,
  ExplorationNavigation,
  type ExplorationRow,
  MobileSheet,
  NoticesButton,
  VenuePreview,
} from "../../features/exploration/villages-exploration";
import { AvatarFace } from "../../features/residents/ResidentPanels.js";
import { messageFrom, request } from "../../shared/api.js";
import { ELEMENT_TAG } from "../../shared/constants.js";
import { FullscreenToggle, HomeDateWeather } from "../../shared/presentation.js";
import type { ExplorationScreenController } from "./screen-contracts.js";

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
    openPerson,
    openPlaceId,
    placingProjectId,
    portraits,
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

  const explorationNavigation = (
    <ExplorationNavigation
      active={exploreSheet?.tab ?? "map"}
      disabled={!snapshot || busy}
      onChoose={(tab, button) => {
        explorationOrigin.current = button;
        explorationReturnTab.current = tab;
        setOpenPlaceId(null);
        if (tab === "map") closeExploration();
        else if (tab === "more") {
          setExploreSheet(null);
          openMenu("index");
        } else setExploreSheet({ tab });
      }}
    />
  );

  return (
    <div
      className={`${ELEMENT_TAG}-root ${ELEMENT_TAG}-home ${ELEMENT_TAG}-home-full`}
      data-mobile={mobile ? "true" : "false"}
    >
      <div className={`${ELEMENT_TAG}-home-bar`}>
        <HomeDateWeather weather={snapshot?.village.weather ?? ""} />
        {!mobile && !placingProjectId ? explorationNavigation : null}
        <span className={`${ELEMENT_TAG}-home-bar-actions`}>
          <NoticesButton
            count={snapshot?.noticeboard.length ?? 0}
            disabled={!snapshot || busy}
            onSelect={() => openMenu("noticeboard")}
          />
          {!mobile ? <FullscreenToggle /> : null}
          {placingProjectId ? (
            <button
              type="button"
              className={`${ELEMENT_TAG}-button`}
              onClick={() => {
                setPlacingProjectId("");
              }}
            >
              Cancel placement
            </button>
          ) : null}
        </span>
      </div>
      <div className={`${ELEMENT_TAG}-room`}>
        <div className={`${ELEMENT_TAG}-home-map-viewport`}>
          <MapStage
            src={townMapImage || null}
            alt={`A map of ${snapshot?.village.name ?? "the village"}.`}
            pins={savedPins}
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
                body: JSON.stringify({ x, y }),
              })
                .then((next) => {
                  setSnapshot(next);
                  setPlacingProjectId("");
                  setFocusedProjectId(projectId);
                  openMenu("projects");
                })
                .catch((cause) => setError(messageFrom(cause, "The blueprint could not be placed here.")))
                .finally(() => setBusy(false));
            }}
            // A press on the picture itself is the way out of a pin's doors: the map
            // is the one thing on the screen that is not one of the choices, so it is
            // what "never mind" looks like here. See `openPlaceId`.
            onDismiss={() => {
              setExploreSheet(null);
              setOpenPlaceId(null);
            }}
            // The homepage is the whole tab, so the room it is drawn in is also the
            // ceiling on how big it can be. Every other stage sits in a column that
            // is sized by the prose beside it and has no ceiling to respect.
            fitToRoom={!mobile}
            mobile={mobile}
            exploration={mobile && !placingProjectId}
            navigationView={navigationView}
            onNavigationView={setNavigationView}
            photoPins
          >
            {/* Anything that went wrong, or anything the village is in the middle of
            doing, held at the foot of the picture rather than in a bar across it.
            It is only ever there while there is something to say, which is what
            lets it sit over the map.

            One container for all of it, rather than one per kind. They are all
            pinned to the same corner, and two of these on screen at once — an
            error and a house waiting to be placed — used to be two boxes in the
            same place, drawn over each other. */}
            {error || settingsError || catchingUp || lastSceneEnding ? (
              <div className={`${ELEMENT_TAG}-notice`}>
                {error ? (
                  <p className={`${ELEMENT_TAG}-error`} role="alert">
                    {error}
                  </p>
                ) : null}
                {settingsError ? (
                  <p className={`${ELEMENT_TAG}-error`} role="alert">
                    {settingsError}
                  </p>
                ) : null}
                {/* The village is writing about time it has not been open for. The
                map does not change until it is done, so without this a slow
                catch-up is indistinguishable from a village that does nothing. */}
                {catchingUp ? (
                  <span className={`${ELEMENT_TAG}-status`}>
                    Catching up on what {snapshot?.village.name ?? "the village"} has been doing…
                  </span>
                ) : null}
                {lastSceneEnding ? <p className={`${ELEMENT_TAG}-status`}>{lastSceneEnding}</p> : null}
              </div>
            ) : null}
          </MapStage>
        </div>
        {!placingProjectId && snapshot && (exploreSheet || openPlaceId)
          ? (() => {
              const venues = snapshot.settings.venues;
              const venue = venues.find((entry) => entry.id === openPlaceId);
              const selectVenue = (entry: VillageVenue) => {
                setExploreSheet(null);
                setOpenPlaceId(entry.id);
              };
              const placeRows: ExplorationRow[] = venues.map((entry) => ({
                id: entry.id,
                name: entry.name,
                detail:
                  entry.classes
                    .map((value) => (value === "other" ? "Venue" : value[0].toUpperCase() + value.slice(1)))
                    .join(" · ") || "Venue",
                image: entry.presentation.image?.url,
                onSelect: () => selectVenue(entry),
              }));
              const peopleRows: ExplorationRow[] = snapshot.villagers.map((person) => {
                const current = venues.find((entry) => entry.id === person.place?.id);
                return {
                  id: "villager:" + person.characterId,
                  name: person.name,
                  detail: current?.name ?? "Current location unavailable",
                  face: (
                    <AvatarFace
                      portrait={portraits[person.characterId]}
                      name={person.name}
                      className={ELEMENT_TAG + "-explore-face"}
                    />
                  ),
                  onSelect: () => {
                    openPerson({ actorId: person.characterId, returnTo: "home" });
                  },
                };
              });
              const title =
                exploreSheet?.tab === "places" ? "Places" : exploreSheet?.tab === "people" ? "People" : venue?.name;
              if (!title) return null;
              const rows = exploreSheet?.tab === "people" ? peopleRows : placeRows;
              const Panel = mobile ? MobileSheet : DesktopPanel;
              return (
                <Panel title={title} onClose={closeExploration}>
                  {exploreSheet ? (
                    <BrowseList
                      rows={rows}
                      label={title}
                      disabled={busy}
                      search={explorationSearch[exploreSheet.tab]}
                      onSearch={(value) =>
                        setExplorationSearch((current) => ({ ...current, [exploreSheet.tab]: value }))
                      }
                    />
                  ) : venue ? (
                    <VenuePreview
                      image={savedPins.find((pin) => pin.id === venue.id)?.image ?? venue.presentation.image?.url}
                      type={
                        venue.classes
                          .map((value) => (value === "other" ? "Venue" : value[0].toUpperCase() + value.slice(1)))
                          .join(" · ") || "Venue"
                      }
                      disabled={busy}
                      actions={venueExplorationActions(venue)}
                    />
                  ) : null}
                </Panel>
              );
            })()
          : null}
      </div>
      {mobile && !placingProjectId ? explorationNavigation : null}

      {/* ── DORMANT 0.4.45 — the notice that told a phone held upright to turn.
            It covered the whole row rather than the map's own box, because on a
          portrait phone the map was a letterboxed strip with nowhere to put a
          sentence. The map is drawn upright now and the sentence is no longer
          true; the component is dormant beside its own definition and the CSS is
          dormant in the stylesheet. Put this line back to bring it back. */}
      {/* <RotateNotice /> */}
    </div>
  );
}
