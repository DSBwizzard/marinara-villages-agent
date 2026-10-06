import {
  RESIDENT_HISTORY_MODES,
  RESIDENT_STORY_ROLES,
} from "../../../engine/packages/shared/src/villages/resident-founding-context.js";
import { request } from "../../shared/api.js";
import { ELEMENT_TAG } from "../../shared/constants.js";
import type { MapElementChoice, SetupVenueDraft } from "../../shared/types.js";
import type { VillageController } from "../../shell/useVillageController.js";
import { defaultView, MapStage } from "../exploration/MapStage.js";
import { AvatarFace } from "../residents/ResidentPanels.js";
import { AgentConnections } from "../settings/SettingsPanels.js";
import { VillagesBurstPreview } from "../settings/villages-burst-preview.js";
import {
  FOUNDING_SCENARIOS,
  FoundingPersonaSelector,
  FoundingVillagerPicker,
  SETUP_STEPS,
  VillageLorebookPicker,
} from "./FoundingPanels.js";
import { evenlySpacedFoundingPins } from "./villages-founding-draft.js";
import { SCENERY_STYLES, venueHasCommon, venueHasPrivate } from "./villages-founding-editor";
import { FoundingWorkspace } from "./villages-founding-workspace";
import { type FoundingIssue, foundingVenueIssues } from "./villages-founding-workspace-state";
import { DEFAULT_PLAYER_ROLE, PlayerRoleFields, PlayerRoleSummary } from "./villages-player-role.js";
import { ResidentFoundingEditors } from "./villages-resident-founding.js";

export function FoundingScreen({ controller }: { controller: VillageController }) {
  const {
    busy,
    catalog,
    chooseSetupScenario,
    connectionSetupProblem,
    draftPins,
    draftSaveError,
    draftSavedAt,
    draftSaving,
    exitSetupDraft,
    foundVillage,
    generateSetupImage,
    generateSetupTownMap,
    gotoSetupStep,
    lorebooks,
    lorebooksError,
    mapVisualLore,
    movingSetupVenueId,
    nameOfCharacter,
    patchSetupVenue,
    personaDraft,
    personas,
    pickSetupTownMap,
    placeSetupPin,
    portraits,
    retrySetupSaving,
    savedTownMapView,
    sceneryStyle,
    screen,
    selectedResidentContexts,
    selectedSetupVenueId,
    setConnectionSetupProblem,
    setMapVisualLore,
    setMovingSetupVenueId,
    setPersonaDraft,
    setSceneryStyle,
    setScreen,
    setSelectedSetupVenueId,
    setSetupEditorOpen,
    setSetupFocusIssue,
    setSetupFoundingDetails,
    setSetupFoundingGuidance,
    setSetupFoundingVillagerIds,
    setSetupKeyboardSpot,
    setSetupLoreTokenBudgetDraft,
    setSetupLorebookDraft,
    setSetupMapBusy,
    setSetupMapGeneratedKey,
    setSetupMapNegativePrompt,
    setSetupMapOptions,
    setSetupMapProblem,
    setSetupMapPrompt,
    setSetupMapReviewed,
    setSetupMapSource,
    setSetupName,
    setSetupPlacementError,
    setSetupPlayerRole,
    setSetupProblem,
    setSetupResidentContexts,
    setSetupRoleExpanded,
    setSetupSetting,
    setSetupShowIssues,
    setSetupVenues,
    setSetupWorkspace,
    setSetupWorldFacts,
    settingsError,
    setupBeginningSourceKey,
    setupEditorOpen,
    setupFocusIssue,
    setupFoundingDetails,
    setupFoundingGuidance,
    setupFoundingReason,
    setupFoundingVillagerIds,
    setupImageClaim,
    setupImageTarget,
    setupKeyboardSpot,
    setupLoreTokenBudgetDraft,
    setupLorebookDraft,
    setupMapBusy,
    setupMapGeneratedKey,
    setupMapGenerationKey,
    setupMapImageSource,
    setupMapNegativePrompt,
    setupMapOptions,
    setupMapProblem,
    setupMapProgress,
    setupMapPrompt,
    setupMapRequest,
    setupMapReviewed,
    setupMapShape,
    setupMapSize,
    setupMapSource,
    setupMapSrc,
    setupName,
    setupPlacementError,
    setupPlayerRole,
    setupProblem,
    setupResidentContexts,
    setupRoleExpanded,
    setupSetting,
    setupShowIssues,
    setupStep,
    setupSuggestionsBusy,
    setupSuggestionsClaim,
    setupSuggestionsKey,
    setupVenueBusy,
    setupVenues,
    setupWorkspace,
    setupWorldFacts,
    snapshot,
    suggestSetupVenues,
    updateSetupMapRequest,
    uploadSetupImage,
  } = controller;

  if (screen === "setup") {
    const wizardVillagers = setupFoundingVillagerIds.map((id) => ({
      id,
      name: catalog?.find((person) => person.id === id)?.name ?? nameOfCharacter(id) ?? "Unavailable character",
    }));
    const placed = setupVenues.filter((venue) => venue.presentation.x !== null && venue.presentation.y !== null).length;
    const nextPin =
      setupVenues.find((venue) => venue.id === movingSetupVenueId) ??
      (setupWorkspace.paused
        ? undefined
        : setupVenues.find((venue) => venue.presentation.x === null || venue.presentation.y === null));
    const setupIssues = foundingVenueIssues(setupVenues, snapshot?.isFounded ?? false);
    const openIssue = (issue: FoundingIssue) => {
      setSelectedSetupVenueId(issue.venueId);
      setSetupFocusIssue(issue);
      setSetupWorkspace((state) => ({
        ...state,
        view: issue.field === "placement" ? "map" : "details",
        paused: issue.field !== "placement",
        sections: {
          ...state.sections,
          [issue.venueId]:
            issue.zoneId || issue.field === "description" || issue.field === "layout" ? "zones" : "venue",
        },
        zones: { ...state.zones, [issue.venueId]: issue.zoneId ?? "exterior" },
      }));
      setMovingSetupVenueId(issue.field === "placement" ? issue.venueId : null);
    };
    const selectVenue = (venue: SetupVenueDraft) => {
      const unplaced = venue.presentation.x === null || venue.presentation.y === null;
      setSelectedSetupVenueId(venue.id);
      setSetupFocusIssue(null);
      setMovingSetupVenueId(unplaced ? venue.id : null);
      setSetupWorkspace((state) => ({ ...state, view: unplaced ? "map" : "details", paused: !unplaced }));
      setSetupEditorOpen(false);
    };
    const moveVenue = (venue: SetupVenueDraft) => {
      setSelectedSetupVenueId(venue.id);
      setMovingSetupVenueId(venue.id);
      setSetupWorkspace((state) => ({ ...state, paused: false, view: "map" }));
      setSetupPlacementError("");
    };
    const mapReady = setupMapSource === "none" || (!!setupMapSrc && !setupMapBusy);
    const map = (interactive: boolean) => (
      <div className="villages-forging-map">
        {setupMapProblem && setupMapSource !== "none" ? (
          <p className={`${ELEMENT_TAG}-error`} role="alert">
            {setupMapProblem}
          </p>
        ) : null}
        {interactive && !mapReady ? (
          <p className="villages-forging-placement" role="status">
            {setupMapBusy
              ? setupMapProgress
              : setupMapProblem
                ? "Map artwork failed. Return to Place to review the error and try again, or select Simple map."
                : "Choose map artwork on Place, or select Simple map."}
          </p>
        ) : null}
        <div
          className={`${ELEMENT_TAG}-setup-map-viewport`}
          tabIndex={interactive ? 0 : -1}
          aria-label="Venue placement map. Arrow keys choose a spot; Enter places a Venue."
          onKeyDown={(event) => {
            if (!interactive || event.target !== event.currentTarget || setupEditorOpen || !nextPin || !mapReady)
              return;
            if (event.key === "Enter") {
              event.preventDefault();
              const stage = event.currentTarget.querySelector<HTMLElement>(`.${ELEMENT_TAG}-stage`);
              const photo = stage?.querySelector<HTMLElement>(`.${ELEMENT_TAG}-pin-photo`)?.getBoundingClientRect();
              const photoSize = stage
                ? parseFloat(getComputedStyle(stage).getPropertyValue("--founding-photo-width")) || 88
                : 88;
              placeSetupPin(setupKeyboardSpot.x, setupKeyboardSpot.y, {
                width: Number(stage?.dataset.pictureWidth) || 1000,
                height: Number(stage?.dataset.pictureHeight) || 700,
                photoWidth: photo?.width ?? photoSize,
                photoHeight: photo?.height ?? photoSize,
              });
            } else if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
              event.preventDefault();
              setSetupKeyboardSpot((spot) => ({
                x: Math.max(
                  0.02,
                  Math.min(
                    0.98,
                    spot.x + (event.key === "ArrowLeft" ? -0.025 : event.key === "ArrowRight" ? 0.025 : 0),
                  ),
                ),
                y: Math.max(
                  0.02,
                  Math.min(0.98, spot.y + (event.key === "ArrowUp" ? -0.025 : event.key === "ArrowDown" ? 0.025 : 0)),
                ),
              }));
            }
          }}
        >
          <MapStage
            src={setupMapSrc}
            alt={`Map of ${setupName || "your village"}`}
            pins={draftPins}
            placing={interactive && !!nextPin && mapReady && !setupEditorOpen && !snapshot?.isFounded}
            view={
              interactive
                ? defaultView("contain")
                : setupMapSource === "existing"
                  ? savedTownMapView
                  : defaultView("contain")
            }
            shape={setupMapShape}
            onPlace={interactive && !snapshot?.isFounded ? placeSetupPin : undefined}
            compact={false}
            mobile={false}
            fitToRoom={interactive}
            compactPhotos={interactive}
            onMovePin={
              interactive && !snapshot?.isFounded && mapReady
                ? (id, x, y, size) => {
                    setSelectedSetupVenueId(id);
                    placeSetupPin(x, y, size, id);
                  }
                : undefined
            }
            onMoveInvalid={() =>
              setSetupPlacementError("Drop the photograph inside the map. Its original position is kept.")
            }
            placementCursor={interactive ? setupKeyboardSpot : undefined}
          />
        </div>
        {interactive ? (
          <>
            <p>
              Select a Venue’s Move button, then click its new spot. Arrow keys and Enter also place Venue photographs.
            </p>
            {setupMapSource === "none" ? (
              <p>Spaces Venue photographs evenly on this logical map.</p>
            ) : placed === setupVenues.length && !setupMapReviewed ? (
              <button type="button" onClick={() => setSetupMapReviewed(true)}>
                I checked all Venue photographs against this map
              </button>
            ) : null}
          </>
        ) : null}
      </div>
    );
    const chooseRoster = (ids: string[]) => {
      setSetupFoundingVillagerIds(ids);
      setSetupMapReviewed(false);
      setSetupProblem("");
    };
    return (
      <div
        className={`${ELEMENT_TAG}-root ${ELEMENT_TAG}-home ${ELEMENT_TAG}-setup-root villages-forging-v2`}
        data-step={setupStep}
      >
        <header className={`${ELEMENT_TAG}-setup-heading`}>
          <h1>
            Villages <span>· Village Forging</span>
          </h1>
        </header>
        <nav className="villages-forging-steps" aria-label="Founding steps">
          {SETUP_STEPS.map((label, index) => (
            <button
              key={label}
              type="button"
              aria-current={index === setupStep ? "step" : undefined}
              data-active={index === setupStep}
              disabled={busy || setupEditorOpen || (index === 3 && (setupVenueBusy || setupSuggestionsBusy))}
              onClick={() => gotoSetupStep(index)}
            >
              {index + 1} {label}
            </button>
          ))}
        </nav>
        <main className="villages-forging-body" data-step={setupStep}>
          <p className="villages-forging-kicker" hidden={setupStep === 0}>
            Step {setupStep + 1} of 4 · {SETUP_STEPS[setupStep]}
          </p>
          <div hidden={setupStep !== 0}>
            <div className="villages-forging-columns">
              <section className="villages-forging-card">
                <h3>You</h3>
                <FoundingPersonaSelector
                  personas={personas}
                  draft={personaDraft}
                  onDraft={setPersonaDraft}
                  disabled={busy}
                />
                <h3 className="villages-desktop-role-heading">Your role</h3>
                {!snapshot?.isFounded ? (
                  <>
                    <button
                      type="button"
                      className="villages-mobile-role-toggle"
                      aria-expanded={setupRoleExpanded}
                      aria-controls="villages-founding-role-fields"
                      onClick={() => setSetupRoleExpanded((value) => !value)}
                    >
                      Your role · {setupPlayerRole?.title || "Customize role"}
                    </button>
                    <div
                      id="villages-founding-role-fields"
                      className="villages-founding-role-editor"
                      data-expanded={setupRoleExpanded}
                    >
                      <PlayerRoleFields
                        compact
                        role={setupPlayerRole ?? DEFAULT_PLAYER_ROLE}
                        onChange={setSetupPlayerRole}
                        disabled={busy}
                      />
                    </div>
                  </>
                ) : (
                  <PlayerRoleSummary role={setupPlayerRole} />
                )}
              </section>
              <section className="villages-forging-card">
                <h3>Founding villagers</h3>
                <FoundingVillagerPicker
                  catalog={catalog}
                  portraits={portraits}
                  selectedIds={setupFoundingVillagerIds}
                  onChange={chooseRoster}
                  disabled={busy || !!snapshot?.isFounded}
                />
                <div className="villages-people-connections">
                  <details open={!!connectionSetupProblem}>
                    <summary>Connections · {connectionSetupProblem ? "Needs setup" : "Ready"}</summary>
                    <p>System and Narration are required. Images are optional.</p>
                    <AgentConnections onSetupProblem={setConnectionSetupProblem} compact />
                  </details>
                </div>
              </section>
            </div>
          </div>
          {setupStep === 0 && !snapshot?.isFounded && wizardVillagers.length ? (
            <ResidentFoundingEditors
              people={wizardVillagers.map((person) => ({ characterId: person.id, name: person.name }))}
              contexts={setupResidentContexts}
              onChange={(id, context) => setSetupResidentContexts((current) => ({ ...current, [id]: context }))}
              avatar={(id, name) => (
                <AvatarFace
                  portrait={portraits[id]}
                  name={name}
                  className={ELEMENT_TAG + "-identity-card-face"}
                  glyph="person"
                />
              )}
              disabled={busy}
            />
          ) : null}
          {setupStep === 1 ? (
            <>
              <h2>Define your place</h2>
              <div className="villages-forging-columns">
                <section className="villages-forging-card">
                  <label>
                    Village name
                    <input
                      aria-label="Village name"
                      maxLength={snapshot?.settings.villageNameMaxLength ?? 80}
                      value={setupName}
                      disabled={busy}
                      onChange={(event) => setSetupName(event.target.value)}
                    />
                  </label>
                  <label>
                    Where are we?
                    <textarea
                      aria-label="Where are we?"
                      maxLength={snapshot?.settings.settingMaxLength ?? 1200}
                      rows={4}
                      value={setupSetting}
                      disabled={busy}
                      onChange={(event) => setSetupSetting(event.target.value)}
                    />
                  </label>
                  <p>Describe the place, surrounding world, and ongoing conditions. It can already be established.</p>
                  <label>
                    What brings you together?
                    <textarea
                      aria-label="What brings you together?"
                      maxLength={snapshot?.settings.foundingDetailsMaxLength ?? 2000}
                      rows={4}
                      value={setupFoundingDetails}
                      disabled={busy || !!snapshot?.isFounded}
                      onChange={(event) => setSetupFoundingDetails(event.target.value)}
                    />
                  </label>
                  <p>
                    Everyday reasons or unusual events are both welcome. Individual motives can emerge through play.
                  </p>
                  {!snapshot?.isFounded ? (
                    <details>
                      <summary>Starting circumstance examples</summary>
                      <div className="villages-forging-actions">
                        {FOUNDING_SCENARIOS.filter((scenario) => scenario.value !== "none").map((scenario) => (
                          <button
                            key={scenario.value}
                            type="button"
                            aria-pressed={setupFoundingReason === scenario.value}
                            onClick={() => chooseSetupScenario(scenario.value)}
                          >
                            {scenario.label}
                          </button>
                        ))}
                      </div>
                    </details>
                  ) : null}
                  <details>
                    <summary>Village lorebooks · {setupLorebookDraft.length} selected</summary>
                    <VillageLorebookPicker
                      books={lorebooks}
                      error={lorebooksError}
                      selected={setupLorebookDraft}
                      onChange={setSetupLorebookDraft}
                      disabled={busy}
                    />
                    <label>
                      Lorebook token budget
                      <input
                        aria-label="Lorebook token budget"
                        type="number"
                        min={snapshot?.settings.loreTokenBudgetMin ?? 200}
                        max={snapshot?.settings.loreTokenBudgetMax ?? 3200}
                        step={100}
                        value={setupLoreTokenBudgetDraft}
                        onChange={(event) => setSetupLoreTokenBudgetDraft(Number(event.target.value))}
                      />
                    </label>
                  </details>
                  <details>
                    <summary>Optional narrative direction</summary>
                    <label>
                      Narrative direction
                      <textarea
                        aria-label="Narrative direction"
                        maxLength={500}
                        value={setupFoundingGuidance}
                        disabled={busy || !!snapshot?.isFounded}
                        onChange={(event) => setSetupFoundingGuidance(event.target.value)}
                      />
                    </label>
                    <p>A creative preference, not a guaranteed future.</p>
                  </details>
                  {snapshot?.isFounded ? (
                    <label>
                      Current world facts
                      <textarea
                        value={setupWorldFacts.join("\n")}
                        onChange={(event) => setSetupWorldFacts(event.target.value.split(/\r?\n/u))}
                      />
                    </label>
                  ) : null}
                </section>
                <section className="villages-forging-card">
                  <h3>Map</h3>
                  {snapshot?.isFounded ? (
                    <p>
                      Change artwork and Venue photographs in Village Settings → Village Map. Existing locations are
                      retained.
                    </p>
                  ) : (
                    <>
                      <div className="villages-forging-actions" role="group" aria-label="Map source">
                        {(
                          [
                            ["none", "Simple map"],
                            ["generate", "Generate artwork"],
                            ["upload", "Upload"],
                          ] as const
                        ).map(([value, label]) => (
                          <button
                            key={value}
                            type="button"
                            aria-pressed={setupMapSource === value}
                            onClick={() => {
                              setSetupMapSource(value);
                              setSetupMapReviewed(value === "none");
                            }}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                      {setupMapSource === "generate" ? (
                        <>
                          <label>
                            Map layout
                            <textarea
                              aria-label="Map layout"
                              rows={3}
                              maxLength={1500}
                              value={setupMapPrompt}
                              onChange={(event) => setSetupMapPrompt(event.target.value)}
                              placeholder="For example: bedrooms along the east corridor; lounge near the center."
                            />
                          </label>
                          <p>Guides the artwork. You will place the Venue photographs yourself.</p>
                          <label>
                            Art style
                            <select
                              aria-label="Scenery style preset"
                              value={
                                Object.keys(SCENERY_STYLES).find(
                                  (key) => SCENERY_STYLES[key as keyof typeof SCENERY_STYLES] === sceneryStyle,
                                ) ?? "Custom"
                              }
                              onChange={(event) =>
                                setSceneryStyle(SCENERY_STYLES[event.target.value as keyof typeof SCENERY_STYLES])
                              }
                            >
                              {Object.keys(SCENERY_STYLES).map((key) => (
                                <option key={key}>{key}</option>
                              ))}
                            </select>
                          </label>
                          <details>
                            <summary>Customize style description</summary>
                            <textarea
                              aria-label="Scenery style description"
                              maxLength={600}
                              value={sceneryStyle}
                              onChange={(event) => setSceneryStyle(event.target.value)}
                            />
                          </details>
                          <button
                            type="button"
                            disabled={busy || setupMapBusy || !setupSetting.trim()}
                            onClick={() => void generateSetupTownMap()}
                          >
                            {setupMapBusy
                              ? "Generating map…"
                              : setupMapImageSource === "generate"
                                ? "Generate again"
                                : "Generate map"}
                          </button>
                          {setupMapBusy ? <p role="status">{setupMapProgress}</p> : null}
                          {setupMapProblem ? (
                            <p className={`${ELEMENT_TAG}-error`} role="alert">
                              {setupMapProblem}
                            </p>
                          ) : null}
                          <VillagesBurstPreview request={request} action="images" args={{ count: 1 }} />
                          <details>
                            <summary>Advanced artwork options</summary>
                            {(
                              [
                                ["roads", "Roads and paths"],
                                ["structures", "Structures"],
                                ["water", "Water"],
                              ] as const
                            ).map(([key, label]) => (
                              <label key={key}>
                                {label}
                                <select
                                  value={setupMapOptions[key]}
                                  onChange={(event) =>
                                    setSetupMapOptions((current) => ({
                                      ...current,
                                      [key]: event.target.value as MapElementChoice,
                                    }))
                                  }
                                >
                                  <option value="auto">Auto</option>
                                  <option value="include">Include</option>
                                  <option value="exclude">Exclude</option>
                                </select>
                              </label>
                            ))}
                            <label>
                              Negative tags
                              <textarea
                                value={setupMapNegativePrompt}
                                maxLength={1500}
                                onChange={(event) => setSetupMapNegativePrompt(event.target.value)}
                              />
                            </label>
                            <label>
                              <input
                                type="checkbox"
                                checked={mapVisualLore}
                                onChange={(event) => setMapVisualLore(event.target.checked)}
                              />
                              Use Village lorebooks for map artwork
                            </label>
                          </details>
                        </>
                      ) : null}
                      {setupMapSource === "upload" ? (
                        <>
                          <label>
                            Upload map image
                            <input
                              aria-label="Upload map image"
                              type="file"
                              accept="image/*"
                              disabled={setupMapBusy}
                              onChange={(event) => {
                                void pickSetupTownMap(event.target.files?.[0]);
                                event.target.value = "";
                              }}
                            />
                          </label>
                          {setupMapProblem ? (
                            <p className={`${ELEMENT_TAG}-error`} role="alert">
                              {setupMapProblem}
                            </p>
                          ) : null}
                        </>
                      ) : null}
                      {setupMapSource === "none" ? (
                        <p>
                          A logical map keeps Venue positions without artwork. Automatic spacing is available on Venues.
                        </p>
                      ) : setupMapSrc ? (
                        <figure>
                          <img
                            className="villages-forging-preview"
                            src={setupMapSrc}
                            width={setupMapSize?.width}
                            height={setupMapSize?.height}
                            alt="Selected village map"
                          />
                          {setupMapSize ? (
                            <figcaption>
                              {setupMapSize.width} × {setupMapSize.height} pixels.
                              {setupMapImageSource === "generate" &&
                              Math.abs(setupMapSize.width / setupMapSize.height - 1.5) > 0.2
                                ? " The image provider returned a different shape from the requested 3:2 landscape map. This preview keeps the original proportions."
                                : ""}
                            </figcaption>
                          ) : null}
                        </figure>
                      ) : (
                        <p>
                          {setupMapBusy
                            ? "Creating map artwork. Continue editing spaces while this runs."
                            : "Choose artwork here, or use Simple map."}
                        </p>
                      )}
                      {setupMapSource === "generate" &&
                      setupMapImageSource === "generate" &&
                      setupMapGeneratedKey !== setupMapGenerationKey ? (
                        <div className="villages-forging-notice">
                          <p>Your inputs changed. The previous artwork is kept. Review it before continuing.</p>
                          <button
                            type="button"
                            onClick={() => {
                              setSetupMapGeneratedKey(setupMapGenerationKey);
                              setSetupMapReviewed(false);
                            }}
                          >
                            Use this saved artwork
                          </button>
                        </div>
                      ) : null}
                    </>
                  )}
                </section>
              </div>
            </>
          ) : null}
          {setupStep === 2 ? (
            <FoundingWorkspace
              venues={setupVenues}
              people={wizardVillagers}
              selectedId={selectedSetupVenueId}
              placementId={nextPin?.id ?? null}
              state={setupWorkspace}
              map={
                <>
                  {map(true)}
                  {setupPlacementError ? <p role="alert">{setupPlacementError}</p> : null}
                </>
              }
              existing={snapshot?.isFounded ?? false}
              mapReady={mapReady}
              issues={setupIssues}
              showIssues={setupShowIssues}
              focusIssue={setupFocusIssue}
              imageTarget={setupImageTarget}
              imageBusy={setupVenueBusy}
              suggestionsBusy={setupSuggestionsBusy}
              suggestionsChanged={!!setupSuggestionsKey && setupSuggestionsKey !== setupBeginningSourceKey}
              usagePreview={<VillagesBurstPreview request={request} action="images" args={{ count: 1 }} />}
              onState={setSetupWorkspace}
              onSelect={selectVenue}
              onMove={moveVenue}
              onContinue={() => {
                setMovingSetupVenueId(null);
                setSetupWorkspace((state) => ({ ...state, paused: false, view: "map" }));
              }}
              onArrange={
                setupMapSource === "none" && !snapshot?.isFounded
                  ? () => {
                      const spots = evenlySpacedFoundingPins(setupVenues.length);
                      setSetupVenues((rows) =>
                        rows.map((row, index) => ({ ...row, presentation: { ...row.presentation, ...spots[index] } })),
                      );
                      setSetupMapReviewed(true);
                      setMovingSetupVenueId(null);
                      setSetupPlacementError("");
                    }
                  : undefined
              }
              onPatch={(venue) => patchSetupVenue(venue.id, () => venue)}
              onDraft={() => void suggestSetupVenues()}
              onIssue={openIssue}
              onGenerate={(venue, area, zoneId) => void generateSetupImage(venue, area, zoneId)}
              onUpload={(venue, area, file, zoneId) => void uploadSetupImage(venue, area, file, zoneId)}
            />
          ) : null}
          {setupStep === 3 ? (
            <>
              <h2>Review {setupName}</h2>
              <p>Check your complete starting situation before founding.</p>
              <div className="villages-forging-columns">
                <div>
                  <section className="villages-forging-card">
                    <div className="villages-forging-card-heading">
                      <h3>People & role</h3>
                      <button type="button" onClick={() => gotoSetupStep(0)}>
                        Change people & role
                      </button>
                    </div>
                    <p>{personas?.find((person) => person.id === personaDraft)?.name ?? "Selected Persona"} · You</p>
                    {wizardVillagers.map((person) => {
                      const context = selectedResidentContexts[person.id];
                      return (
                        <div key={person.id} className="villages-resident-review">
                          <strong>{person.name}</strong>
                          {!snapshot?.isFounded && context ? (
                            <>
                              <p>
                                {RESIDENT_STORY_ROLES[context.storyRole]} ·{" "}
                                {RESIDENT_HISTORY_MODES[context.historyMode]}
                              </p>
                              {context.storyRole === "custom" ? <p>{context.customDescription}</p> : null}
                              {context.background ? <p>{context.background}</p> : null}
                            </>
                          ) : null}
                        </div>
                      );
                    })}
                    <PlayerRoleSummary role={setupPlayerRole} />
                    <p>Your role and founding circumstances become fixed after founding.</p>
                  </section>
                  <section className="villages-forging-card">
                    <div className="villages-forging-card-heading">
                      <h3>Place & map</h3>
                      <button type="button" onClick={() => gotoSetupStep(1)}>
                        Change place & map
                      </button>
                    </div>
                    <p>{setupSetting}</p>
                    <p>{setupFoundingDetails}</p>
                    {setupFoundingGuidance ? <p>Direction: {setupFoundingGuidance}</p> : null}
                    <p>
                      {setupMapSource === "none"
                        ? "Logical map"
                        : setupMapSource === "upload"
                          ? "Uploaded artwork"
                          : "Chosen artwork"}{" "}
                      · {setupLorebookDraft.length} lorebooks selected
                    </p>
                    {setupMapPrompt ? <p>Map layout: {setupMapPrompt}</p> : null}
                  </section>
                  <section className="villages-forging-card">
                    <div className="villages-forging-card-heading">
                      <h3>Starting Venues</h3>
                      <button type="button" onClick={() => gotoSetupStep(2)}>
                        Change starting Venues
                      </button>
                    </div>
                    {setupVenues.map((venue, index) => (
                      <details key={venue.id}>
                        <summary>
                          {index + 1}. {venue.name} · {venue.form} · Exterior{venueHasCommon(venue) ? " / Common" : ""}
                          {venueHasPrivate(venue) ? " / Private" : ""}
                        </summary>
                        <p>{venue.description}</p>
                        {venue.spaces?.map((space) => (
                          <p key={space.id}>
                            {space.name}: {space.description}
                          </p>
                        ))}
                        {venue.privateSpaces?.map((room) => (
                          <p key={room.id}>
                            {room.name} · {room.purpose} · Private contents stay hidden until invited.
                          </p>
                        ))}
                      </details>
                    ))}
                  </section>
                </div>
                <section className="villages-forging-card">
                  {map(false)}
                  <p>
                    {placed} of {setupVenues.length} photographs placed
                  </p>
                  <h3>After founding</h3>
                  <p>Prepare Venues, private spaces, Agendas, and initial Wishes before the first Scene.</p>
                </section>
              </div>
            </>
          ) : null}
          {setupProblem ? (
            <p className={`${ELEMENT_TAG}-error`} role="alert">
              {setupProblem}
            </p>
          ) : null}
          {setupMapBusy && setupStep !== 1 && setupStep !== 2 ? <p role="status">{setupMapProgress}</p> : null}
          {setupMapProblem && setupStep !== 1 && setupStep !== 2 ? (
            <p className={`${ELEMENT_TAG}-error`} role="alert">
              {setupMapProblem}
            </p>
          ) : null}
          {setupMapRequest?.phase === "paused" ? (
            <button
              type="button"
              onClick={() => {
                setSetupMapProblem("");
                setSetupMapBusy(true);
                updateSetupMapRequest({ ...setupMapRequest, phase: "waiting" });
              }}
            >
              Check map status
            </button>
          ) : null}
          {draftSaveError ? (
            <div role="alert" className="villages-forging-notice">
              <p>{draftSaveError}</p>
              <button type="button" onClick={() => void retrySetupSaving()}>
                Retry saving draft
              </button>
            </div>
          ) : null}
          {settingsError ? <p role="alert">{settingsError}</p> : null}
        </main>
        <footer className={`${ELEMENT_TAG}-setup-footer villages-forging-footer`}>
          {setupStep > 0 ? (
            <button type="button" disabled={busy || setupEditorOpen} onClick={() => gotoSetupStep(setupStep - 1)}>
              Back
            </button>
          ) : null}
          <span role="status" className="villages-forging-saved">
            {snapshot?.isFounded
              ? "Editing existing village"
              : draftSaveError
                ? "Draft not saved"
                : draftSaving
                  ? "Saving…"
                  : draftSavedAt
                    ? `Saved ${new Date(draftSavedAt).toLocaleTimeString()}`
                    : "Preparing draft storage…"}
          </span>
          <button
            type="button"
            disabled={busy || setupEditorOpen || setupVenueBusy || setupSuggestionsBusy}
            onClick={() => {
              if (setupImageClaim.current || setupSuggestionsClaim.current) return;
              if (snapshot?.isFounded) setScreen("home");
              else void exitSetupDraft();
            }}
          >
            {snapshot?.isFounded ? "Cancel changes" : "Save & exit"}
          </button>
          <button
            type="button"
            className="villages-forging-primary"
            disabled={busy || setupEditorOpen || setupSuggestionsBusy || setupVenueBusy || !!draftSaveError}
            onClick={() => {
              if (setupStep === 2 && setupIssues.length) {
                setSetupShowIssues(true);
                openIssue(setupIssues[0]);
                return;
              }
              if (setupStep === 3) void foundVillage();
              else gotoSetupStep(setupStep + 1);
            }}
          >
            {busy
              ? "Saving village…"
              : setupStep === 3
                ? snapshot?.isFounded
                  ? "Save this village"
                  : "Found village"
                : setupStep === 2
                  ? "Review village"
                  : setupStep === 1
                    ? "Continue to Venues"
                    : "Continue to place"}
          </button>
        </footer>
      </div>
    );
  }
  return null;
}
