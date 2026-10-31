import { useEffect, useRef, useState } from "react";
import { MAP_UPLOAD_GUIDANCE } from "../../../shared/helpers/town-map-upload.js";
import { SceneryStylePicker } from "../../shared/SceneryStylePicker.js";
import { ELEMENT_TAG } from "../../shared/constants.js";
import type { MobileMapView } from "../exploration/MapStage.js";
import { defaultView, MapStage } from "../exploration/MapStage.js";
import { AgentConnections } from "../settings/AgentConnections.js";
import { FoundingAdmissions } from "./FoundingAdmissions.js";
import { CircumstanceInput, FoundingField } from "./FoundingField.js";
import {
  FoundingPersonaSelector,
  FoundingVillagerPicker,
  LoreTokenBudgetField,
  SETUP_STEPS,
  VillageLorebookPicker,
} from "./FoundingPanels.js";
import { QuickStartButton } from "./QuickStartButton.js";
import { QuickStartVenues } from "./QuickStartVenues.js";
import { arrangeQuickStartVenues } from "./quick-start-placement.js";
import { useFoundingKeyboardOverlay } from "./useFoundingKeyboardOverlay.js";
import type { FoundingScreenController } from "./screen-contracts.js";
import { venueHasCommon, venueHasPrivate } from "./villages-founding-editor";
import { type FoundingIssue, foundingVenueIssues } from "./villages-founding-workspace-state";
import { playerBackgroundProblem, PlayerBackgroundSummary } from "./villages-player-background.js";
const MAP_EXAMPLES = [
  "An inn beside the river, with homes around a central square.",
  "Bedrooms along an indoor corridor, with a shared kitchen at one end.",
  "Leave out cars and parking lots; connect the shops with covered paths.",
  "Show only the station interior; leave out planets, stars, and exterior views.",
];
const PLACE_ERRORS = {
  name: "Give the village a name.",
  setting: "Describe the place.",
};
export function FoundingScreen({ controller }: { controller: FoundingScreenController }) {
  const {
    busy,
    catalog,
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
    sceneryStyle,
    sceneryStyleProfileId,
    screen,
    selectedResidentAdmissions,
    selectedSetupVenueId,
    setConnectionSetupProblem,
    setMapVisualLore,
    setMovingSetupVenueId,
    setPersonaDraft,
    setSceneryStyle,
    setSceneryStyleProfileId,
    setSelectedSetupVenueId,
    setSetupFocusIssue,
    setSetupSpriteRevisions,
    setupSpriteRevisions,
    setSetupFoundingVillagerIds,
    setSetupLorebookDraft,
    setSetupMapBusy,
    setSetupMapNegativePrompt,
    setSetupMapProblem,
    setSetupMapPrompt,
    setSetupMapReviewed,
    setSetupMapSource,
    setSetupName,
    setSetupPlayerBackground,
    setSetupProblem,
    setSetupResidentAdmissions,
    setSetupSetting,
    setSetupShowIssues,
    setSetupVenues,
    setSetupWorkspace,
    settingsError,
    setupEditorOpen,
    setupFocusIssue,
    setupFoundingVillagerIds,
    setupImageClaim,
    setupLoreTokenBudgetDraft,
    setupLorebookDraft,
    setupMapBusy,
    setupMapImageSource,
    setupMapNegativePrompt,
    setupMapProblem,
    setupMapPrompt,
    setupMapRequest,
    setupMapShape,
    setupMapSize,
    setupMapSource,
    setupMapSrc,
    setupName,
    setupPlacementError,
    setupPlayerBackground,
    setupProblem,
    setupResidentAdmissions,
    setupWorldName,
    setSetupWorldName,
    setupSetting,
    setupStep,
    setupSuggestionsBusy,
    setupSuggestionsClaim,
    setupVenueBusy,
    setupVenues,
    setupWorkspace,
    snapshot,
    suggestSetupVenues,
    updateSetupMapRequest,
    uploadSetupImage,
  } = controller;
  const rootRef = useRef<HTMLDivElement>(null);
  useFoundingKeyboardOverlay(rootRef, screen === "setup");
  const [mapNavigation, setMapNavigation] = useState<MobileMapView | null>(null);
  const cameraSource = useRef<string | null>(null);
  useEffect(() => {
    setMapNavigation(null);
    cameraSource.current = null;
  }, [setupMapSrc]);
  useEffect(() => {
    if (
      screen !== "setup" ||
      setupStep < 3 ||
      !setupMapSrc ||
      !setupVenues.length ||
      cameraSource.current === setupMapSrc
    )
      return;
    cameraSource.current = setupMapSrc;
    const venue = setupVenues.find((row) => row.id === selectedSetupVenueId) ?? setupVenues[0]!;
    setMapNavigation({ zoom: 1, centerX: venue.presentation.x ?? 0.5, centerY: venue.presentation.y ?? 0.5 });
  }, [screen, setupStep, setupMapSrc, setupVenues, selectedSetupVenueId]);
  const [validationAttempt, setValidationAttempt] = useState(0);
  const focusedValidationAttempt = useRef(0);
  const [validatedFields, setValidatedFields] = useState<string[]>([]);
  const clearFieldValidation = (field: string) => setValidatedFields((fields) => fields.filter((key) => key !== field));
  const backgroundError = validatedFields.includes("playerBackground")
    ? playerBackgroundProblem(setupPlayerBackground)
    : "";
  const personaError =
    validatedFields.includes("persona") && (!personaDraft || !personas?.some((persona) => persona.id === personaDraft));
  const villagersError =
    validatedFields.includes("villagers") &&
    (setupFoundingVillagerIds.length < 1 ||
      setupFoundingVillagerIds.length > 3 ||
      setupFoundingVillagerIds.some((id) => !catalog?.some((person) => person.id === id)));
  const inlineProblem =
    Object.values(PLACE_ERRORS).includes(setupProblem) ||
    !!backgroundError ||
    setupProblem === "Choose an available Persona." ||
    setupProblem === "Choose one to three available founding villagers." ||
    (!!connectionSetupProblem && setupProblem === connectionSetupProblem);
  useEffect(() => {
    if (focusedValidationAttempt.current === validationAttempt) return;
    focusedValidationAttempt.current = validationAttempt;
    if (!setupProblem || !inlineProblem) return;
    const frame = requestAnimationFrame(() => {
      const root = rootRef.current;
      const target = [...(root?.querySelectorAll<HTMLElement>('[aria-invalid="true"], [data-founding-problem]') ?? [])]
        .filter((element) => element.getClientRects().length > 0)
        .sort((a, b) => {
          const first = a.getBoundingClientRect(),
            second = b.getBoundingClientRect();
          return first.top - second.top || first.left - second.left;
        })[0];
      target?.focus({ preventScroll: true });
      target?.scrollIntoView({ block: "center" });
    });
    return () => cancelAnimationFrame(frame);
  }, [setupProblem, inlineProblem, backgroundError, validationAttempt]);
  if (screen === "setup") {
    const wizardVillagers = setupFoundingVillagerIds.map((id) => ({
      id,
      name: catalog?.find((person) => person.id === id)?.name ?? nameOfCharacter(id) ?? "Unavailable character",
    }));
    const placed = setupVenues.filter((venue) => venue.presentation.x !== null && venue.presentation.y !== null).length;
    const nextPin =
      setupVenues.find((venue) => venue.id === movingSetupVenueId) ??
      setupVenues.find((venue) => venue.id === selectedSetupVenueId) ??
      (setupWorkspace.paused
        ? undefined
        : setupVenues.find((venue) => venue.presentation.x === null || venue.presentation.y === null));
    const setupIssues = foundingVenueIssues(setupVenues, false);
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
    const mapReady = !!setupMapSrc && !setupMapBusy;
    const map = (interactive: boolean) => (
      <div className="villages-forging-map">
        {setupMapProblem ? (
          <p className={`${ELEMENT_TAG}-error`} role="alert">
            {setupMapProblem}
          </p>
        ) : null}
        {interactive && !mapReady && !setupMapBusy ? (
          <p className="villages-forging-placement" role="status">
            {setupMapProblem
              ? "Map artwork failed. Return to Map to review the error and try again."
              : "Generate or upload map artwork on Map."}
          </p>
        ) : null}
        <div className={`${ELEMENT_TAG}-setup-map-viewport`} aria-label="Venue placement map">
          <MapStage
            src={setupMapSrc}
            alt={`Map of ${setupName || "your village"}`}
            pins={draftPins.map((pin) => ({
              ...pin,
              selected: nextPin?.id === pin.id,
              onSelect: interactive
                ? () => {
                    setSelectedSetupVenueId(pin.id);
                    setMovingSetupVenueId(pin.id);
                    setSetupWorkspace((state) => ({ ...state, paused: false, view: "map" }));
                  }
                : pin.onSelect,
            }))}
            placing={
              interactive &&
              !!nextPin &&
              mapReady &&
              !setupEditorOpen &&
              setupWorkspace.view !== "details" &&
              !setupSuggestionsBusy &&
              !setupVenueBusy
            }
            view={defaultView("contain")}
            shape={setupMapShape}
            onPlace={interactive ? (x, y, size) => placeSetupPin(x, y, size, nextPin?.id) : undefined}
            compact={false}
            mobile={false}
            fitToRoom={false}
            exploration
            navigationView={mapNavigation}
            onNavigationView={setMapNavigation}
            navigationControlsWhilePlacing
            keyboardPlacementId={interactive ? nextPin?.id : undefined}
            onNudgePin={
              interactive && mapReady && !setupSuggestionsBusy && !setupVenueBusy
                ? (id, dx, dy) => {
                    const venue = setupVenues.find((row) => row.id === id);
                    if (!venue) return;
                    setSelectedSetupVenueId(id);
                    placeSetupPin(
                      Math.round(Math.max(0, Math.min(1, (venue.presentation.x ?? 0.5) + dx)) * 10000) / 10000,
                      Math.round(Math.max(0, Math.min(1, (venue.presentation.y ?? 0.5) + dy)) * 10000) / 10000,
                      undefined,
                      id,
                    );
                  }
                : undefined
            }
          />
        </div>
      </div>
    );
    const chooseRoster = (ids: string[]) => {
      clearFieldValidation("villagers");
      setSetupFoundingVillagerIds(ids);
      setSetupMapReviewed(false);
      setSetupProblem("");
    };
    return (
      <div
        className={`${ELEMENT_TAG}-root ${ELEMENT_TAG}-home ${ELEMENT_TAG}-setup-root villages-forging-v2`}
        data-step={setupStep}
        data-map-first={setupStep === 3 ? "true" : undefined}
        ref={rootRef}
      >
        <header className={`${ELEMENT_TAG}-setup-heading villages-forging-heading`}>
          <ol className="villages-forging-steps" aria-label="Founding phases">
            {SETUP_STEPS.map((label, index) => (
              <li
                key={label}
                aria-label={label}
                aria-current={index === setupStep ? "step" : undefined}
                data-active={index === setupStep}
              >
                <span aria-hidden="true">{index + 1}</span>
                <span aria-hidden="true">{label}</span>
              </li>
            ))}
          </ol>
          <h1>Forging the Village</h1>
        </header>
        <main className="villages-forging-body" data-step={setupStep}>
          <div hidden={setupStep !== 1}>
            <div className="villages-forging-columns villages-people-columns">
              <section className="villages-forging-card">
                <h3 aria-label="You">You</h3>
                {personaError ? (
                  <p role="alert" data-founding-problem tabIndex={-1}>
                    Choose an available Persona.
                  </p>
                ) : null}
                <FoundingPersonaSelector
                  personas={personas}
                  draft={personaDraft}
                  onDraft={(id) => {
                    setPersonaDraft(id);
                    clearFieldValidation("persona");
                  }}
                  disabled={busy}
                />

                <h3 className="villages-initial-residents" aria-label="Initial residents">
                  Initial residents
                </h3>
                {villagersError ? (
                  <p role="alert" data-founding-problem tabIndex={-1}>
                    Choose one to three available founding villagers.
                  </p>
                ) : null}
                <FoundingVillagerPicker
                  spriteRevisions={setupSpriteRevisions}
                  onSpritePrepared={(id, revision) =>
                    setSetupSpriteRevisions((prior) => {
                      const next = { ...prior };
                      if (revision === undefined) delete next[id];
                      else next[id] = revision;
                      return next;
                    })
                  }
                  catalog={catalog}
                  portraits={portraits}
                  selectedIds={setupFoundingVillagerIds}
                  onChange={chooseRoster}
                  disabled={busy}
                />
              </section>
              <FoundingAdmissions
                people={wizardVillagers}
                playerBackground={setupPlayerBackground ?? ""}
                admissions={setupResidentAdmissions}
                onPlayer={setSetupPlayerBackground}
                onAdmissions={setSetupResidentAdmissions}
                disabled={busy}
              />
            </div>
          </div>
          {setupStep === 0 ? (
            <>
              <div className="villages-place-panels">
                <section className="villages-forging-card">
                  <h3>Place</h3>
                  <FoundingField
                    title="Village Timezone"
                    help="Villages runs on real-time. Select the timezone you wish for Villages' clock to use."
                  >
                    <select
                      aria-label="Village Timezone"
                      disabled={busy}
                      value={
                        controller.setupTimeZone || snapshot?.clock?.timeZone || snapshot?.village.timeZone || "UTC"
                      }
                      onChange={(event) => controller.setSetupTimeZone?.(event.target.value)}
                    >
                      {Array.from(
                        new Set([
                          snapshot?.clock?.timeZone || snapshot?.village.timeZone || "UTC",
                          controller.setupTimeZone || "",
                          ...(typeof Intl.supportedValuesOf === "function"
                            ? Intl.supportedValuesOf("timeZone")
                            : ["UTC", "America/Los_Angeles", "America/New_York", "Europe/London", "Asia/Tokyo"]),
                        ]),
                      )
                        .filter(Boolean)
                        .sort()
                        .map((zone) => (
                          <option key={zone} value={zone}>
                            {zone.replaceAll("_", " ")}
                          </option>
                        ))}
                    </select>
                  </FoundingField>
                  <FoundingField
                    title="Village Name"
                    error={validatedFields.includes("place-name") && !setupName.trim() ? PLACE_ERRORS.name : ""}
                  >
                    <input
                      autoComplete="off"
                      aria-label="Village Name"
                      placeholder="Crystalwood Heights"
                      maxLength={snapshot?.settings.villageNameMaxLength ?? 80}
                      value={setupName}
                      disabled={busy}
                      onChange={(event) => {
                        setSetupName(event.target.value);
                        clearFieldValidation("place-name");
                      }}
                    />
                  </FoundingField>
                  <FoundingField
                    title="Village world"
                    help="Optionally name the world where the Village is located. Use the same name for a character’s Homeworld if they come from this world. Matching names identify a shared world, without assuming acquaintance or shared private knowledge. Leave blank if unspecified; source cards and lore still apply."
                  >
                    <input
                      aria-label="Village world"
                      autoComplete="off"
                      maxLength={120}
                      placeholder="Optional"
                      value={setupWorldName}
                      disabled={busy}
                      onChange={(event) => setSetupWorldName(event.target.value)}
                    />
                  </FoundingField>
                  <FoundingField
                    title="Place"
                    error={
                      validatedFields.includes("place-setting") && !setupSetting.trim() ? PLACE_ERRORS.setting : ""
                    }
                  >
                    <textarea
                      autoComplete="off"
                      placeholder="An abandoned farm beside a forest in a present-day world without magic."
                      aria-label="Place"
                      maxLength={snapshot?.settings.settingMaxLength ?? 4096}
                      rows={4}
                      value={setupSetting}
                      disabled={busy}
                      onChange={(event) => {
                        setSetupSetting(event.target.value);
                        clearFieldValidation("place-setting");
                      }}
                    />
                  </FoundingField>
                </section>
                <section className="villages-forging-card villages-place-options">
                  {snapshot?.settings.foundingDetails ? (
                    <details>
                      <summary>Founding history</summary>
                      <p>{snapshot.settings.foundingDetails}</p>
                    </details>
                  ) : null}
                  <VillageLorebookPicker
                    books={lorebooks}
                    error={lorebooksError}
                    selected={setupLorebookDraft}
                    onChange={setSetupLorebookDraft}
                    disabled={busy}
                  />
                  <LoreTokenBudgetField
                    value={setupLoreTokenBudgetDraft}
                    onChange={controller.setSetupLoreTokenBudgetDraft}
                    min={snapshot?.settings.loreTokenBudgetMin ?? 0}
                    max={snapshot?.settings.loreTokenBudgetMax ?? 3200}
                    disabled={busy}
                  />
                </section>
              </div>
            </>
          ) : null}
          <div className="villages-forging-card villages-founding-connections" hidden={setupStep !== 0}>
            {connectionSetupProblem && validatedFields.includes("connections") ? (
              <p role="alert" data-founding-problem tabIndex={-1}>
                {connectionSetupProblem}
              </p>
            ) : null}
            <AgentConnections onSetupProblem={setConnectionSetupProblem} compact />
          </div>
          {setupStep === 2 ? (
            <section className="villages-forging-card villages-map-panel" aria-label="Map artwork">
              <h3 aria-label="Map">Map</h3>
              <div className="villages-place-map-editor">
                <div className="villages-map-sources" role="group" aria-label="Map source">
                  {(
                    [
                      ["simple", "Simple map", "Start now and replace the artwork later."],
                      ["generate", "Generate artwork", "Generate a map from the information provided so far"],
                      ["upload", "Upload image", "Use your own map artwork."],
                    ] as const
                  ).map(([value, label, description]) => (
                    <button
                      key={value}
                      type="button"
                      aria-label={label}
                      aria-pressed={setupMapSource === value}
                      onClick={() => {
                        if (setupMapSource === "upload" && value === "generate") setSetupMapProblem("");
                        setSetupMapSource(value);
                        setSetupMapReviewed(false);
                      }}
                    >
                      <span className="villages-map-source-indicator" aria-hidden="true" />
                      <span>
                        <span className="villages-map-source-title">{label}</span>
                        <small>{description}</small>
                      </span>
                    </button>
                  ))}
                </div>
                {setupMapSource === "generate" ? (
                  <>
                    <FoundingField
                      title="Map Details"
                      optional
                      help="Describe what you want shown, arranged, or left out of the artwork."
                    >
                      <CircumstanceInput
                        examples={MAP_EXAMPLES}
                        aria-label="Map Details"
                        rows={3}
                        maxLength={1500}
                        value={setupMapPrompt === snapshot?.settings.townMapLayoutPrompt ? "" : setupMapPrompt}
                        onChange={(event) => setSetupMapPrompt(event.target.value)}
                      />
                    </FoundingField>
                    <label>
                      Art Style
                      <SceneryStylePicker
                        profileId={sceneryStyleProfileId}
                        onChange={(id) => {
                          setSceneryStyleProfileId(id);
                          if (id !== null) setSceneryStyle("");
                        }}
                      />
                    </label>
                    {sceneryStyleProfileId === null ? (
                      <label>
                        Style Description
                        <textarea
                          autoComplete="off"
                          aria-label="Scenery Style Description"
                          maxLength={600}
                          value={sceneryStyle}
                          onChange={(event) => setSceneryStyle(event.target.value)}
                        />
                      </label>
                    ) : null}
                    <details>
                      <summary>More options</summary>
                      <label>
                        Things to Avoid
                        <textarea
                          autoComplete="off"
                          value={setupMapNegativePrompt}
                          maxLength={1500}
                          onChange={(event) => setSetupMapNegativePrompt(event.target.value)}
                        />
                      </label>
                      <label>
                        <input
                          autoComplete="off"
                          type="checkbox"
                          checked={mapVisualLore}
                          onChange={(event) => setMapVisualLore(event.target.checked)}
                        />
                        Use Village Lorebooks for map artwork
                      </label>
                    </details>
                    <button
                      type="button"
                      className="villages-forging-primary villages-map-generate"
                      disabled={busy || setupMapBusy || !setupSetting.trim()}
                      onClick={() => void generateSetupTownMap()}
                    >
                      {setupMapBusy
                        ? "Generating map…"
                        : setupMapImageSource === "generate"
                          ? "Generate again"
                          : "Generate map"}
                    </button>
                    {setupMapProblem ? (
                      <p className={`${ELEMENT_TAG}-error`} role="alert">
                        {setupMapProblem}
                      </p>
                    ) : null}
                    {!setupSetting.trim() ? <p>Add a Setting description first.</p> : null}
                  </>
                ) : null}
                {setupMapSource === "upload" ? (
                  <>
                    <p className="villages-map-context">{MAP_UPLOAD_GUIDANCE}</p>
                    <label>
                      Upload image
                      <input
                        autoComplete="off"
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
                {setupMapSrc ? (
                  <figure>
                    <img
                      className="villages-forging-preview"
                      src={setupMapSrc}
                      width={setupMapSize?.width}
                      height={setupMapSize?.height}
                      alt="Selected village map"
                    />
                    {setupMapSize &&
                    setupMapImageSource === "generate" &&
                    Math.abs(setupMapSize.width / setupMapSize.height - 1.5) > 0.2 ? (
                      <figcaption>
                        The image provider returned a different shape from the requested 3:2 landscape map. This preview
                        keeps the original proportions.
                      </figcaption>
                    ) : null}
                  </figure>
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
              </div>
            </section>
          ) : null}
          {setupStep === 3 ? (
            <>
              <div className="villages-venue-heading">
                <h2>Starting Venues</h2>
                <div className="villages-quick-switch" role="group" aria-label="Venue setup">
                  <QuickStartButton
                    busy={setupSuggestionsBusy}
                    disabled={setupVenueBusy || !setupVenues.length}
                    pending={!!setupWorkspace.suggestionRequest}
                    onGenerate={() => void suggestSetupVenues({ quickStart: true })}
                  />
                </div>
              </div>
              <QuickStartVenues
                venues={setupVenues}
                people={wizardVillagers}
                selectedId={selectedSetupVenueId}
                state={setupWorkspace}
                busy={setupSuggestionsBusy}
                imageBusy={setupVenueBusy || setupSuggestionsBusy}
                focusIssue={setupFocusIssue}
                saveError={draftSaveError || undefined}
                problem={setupProblem || undefined}
                map=<>
                  {map(true)}
                  {setupPlacementError ? <p role="alert">{setupPlacementError}</p> : null}
                </>
                onState={setSetupWorkspace}
                onSelect={(venue) => {
                  setSelectedSetupVenueId(venue.id);
                  setSetupFocusIssue(null);
                  setMovingSetupVenueId(null);
                  setSetupWorkspace((state) => ({ ...state, paused: true, view: "details" }));
                }}
                onPatch={(venue) => patchSetupVenue(venue.id, () => venue)}
                onGenerateImage={(venue, area, zoneId) => void generateSetupImage(venue, area, zoneId)}
                onUploadImage={(venue, area, file, zoneId) => void uploadSetupImage(venue, area, file, zoneId)}
                onArrange={() => {
                  setMapNavigation(null);
                  setSetupVenues((venues) => arrangeQuickStartVenues(venues, true));
                  setSetupMapReviewed(false);
                }}
                onMove={(venue) => {
                  if (!venue) {
                    setSelectedSetupVenueId(null);
                    setMovingSetupVenueId(null);
                    setSetupWorkspace((state) => ({ ...state, paused: true, view: "map" }));
                    return;
                  }
                  setMapNavigation((current) => ({
                    zoom: current?.zoom ?? 1,
                    centerX: venue.presentation.x ?? 0.5,
                    centerY: venue.presentation.y ?? 0.5,
                  }));
                  setSelectedSetupVenueId(venue.id);
                  setMovingSetupVenueId(venue.id);
                  setSetupWorkspace((state) => ({ ...state, paused: false, view: "map" }));
                }}
              />
            </>
          ) : null}
          {setupStep === 4 ? (
            <>
              <h2>Review {setupName}</h2>
              <p>Check your complete starting situation before founding.</p>
              <div className="villages-forging-columns">
                <div>
                  <section className="villages-forging-card">
                    <div className="villages-forging-card-heading">
                      <h3>People & starting notes</h3>
                      <button type="button" onClick={() => gotoSetupStep(1)}>
                        Change people & starting notes
                      </button>
                    </div>
                    <p>{personas?.find((person) => person.id === personaDraft)?.name ?? "Selected Persona"} · You</p>
                    {wizardVillagers.map((person) => {
                      const context = selectedResidentAdmissions[person.id];
                      return (
                        <div key={person.id} className="villages-resident-review">
                          <strong>{person.name}</strong>
                          {context ? (
                            <>
                              {context.homeworld ? <p>Homeworld: {context.homeworld}</p> : null}
                              {context.startingSituation ? <p>{context.startingSituation}</p> : null}
                            </>
                          ) : null}
                        </div>
                      );
                    })}
                    <PlayerBackgroundSummary background={setupPlayerBackground} />
                  </section>
                  <section className="villages-forging-card">
                    <div className="villages-forging-card-heading">
                      <h3>Place</h3>
                      <button type="button" onClick={() => gotoSetupStep(1)}>
                        Change place
                      </button>
                    </div>
                    <p>{setupSetting}</p>
                    {setupWorldName ? <p>Village world: {setupWorldName}</p> : null}
                    {snapshot?.settings.foundingDetails ? (
                      <details>
                        <summary>Founding history</summary>
                        <p>{snapshot.settings.foundingDetails}</p>
                      </details>
                    ) : null}
                    <p>{setupLorebookDraft.length} lorebooks selected</p>
                  </section>
                  <section className="villages-forging-card">
                    <div className="villages-forging-card-heading">
                      <h3>Map</h3>
                      <button type="button" onClick={() => gotoSetupStep(2)}>
                        Change map
                      </button>
                    </div>
                    <p>
                      {setupMapSource === "simple"
                        ? "Simple map"
                        : setupMapSource === "upload"
                          ? "Uploaded artwork"
                          : "Chosen artwork"}
                    </p>
                    {setupMapPrompt && setupMapPrompt !== snapshot?.settings.townMapLayoutPrompt ? (
                      <p>Map Details: {setupMapPrompt}</p>
                    ) : null}
                  </section>
                  <section className="villages-forging-card">
                    <div className="villages-forging-card-heading">
                      <h3>Starting Venues</h3>
                      <button type="button" onClick={() => gotoSetupStep(3)}>
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
                            {room.name} · {room.purpose} · {room.description}
                            {room.roomSpecification ? <> Room specification: {room.roomSpecification}</> : null}
                          </p>
                        ))}
                      </details>
                    ))}
                  </section>
                </div>
                <section className="villages-forging-card">
                  {map(false)}
                  <p>
                    {placed} of {setupVenues.length} Venues placed
                  </p>
                  <h3>After founding</h3>
                  <p>Prepare Venues, private spaces, Agendas, and initial Wishes before the first Scene.</p>
                </section>
              </div>
            </>
          ) : null}
          {setupProblem && !inlineProblem ? (
            <p className={`${ELEMENT_TAG}-error`} role="alert">
              {setupProblem}
            </p>
          ) : null}
          {setupMapProblem && setupStep !== 2 && setupStep !== 3 ? (
            <p className={`${ELEMENT_TAG}-error`} role="alert">
              {setupMapProblem}
            </p>
          ) : null}
          {setupMapRequest?.phase === "paused" && setupStep !== 2 ? (
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
            {draftSaveError
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
              void exitSetupDraft();
            }}
          >
            Save & exit
          </button>
          <button
            type="button"
            className="villages-forging-primary"
            disabled={busy || setupEditorOpen || setupSuggestionsBusy || setupVenueBusy || !!draftSaveError}
            onClick={() => {
              setValidationAttempt((attempt) => attempt + 1);
              setValidatedFields((fields) => [
                ...new Set([
                  ...fields,
                  "connections",
                  "place-name",
                  "place-setting",
                  ...(setupStep >= 1
                    ? [
                        "persona",
                        "playerBackground",
                        "villagers",
                        ...setupFoundingVillagerIds.map((id) => "backstory:" + id),
                      ]
                    : []),
                ]),
              ]);
              if (setupStep === 3 && setupIssues.length) {
                setSetupShowIssues(true);
                openIssue(setupIssues[0]);
                return;
              }
              if (setupStep === 4) void foundVillage();
              else gotoSetupStep(setupStep + 1);
            }}
          >
            {busy
              ? "Saving village…"
              : setupStep === 4
                ? "Found village"
                : setupStep === 3
                  ? "Review village"
                  : setupStep === 2
                    ? "Continue to Venues"
                    : setupStep === 1
                      ? "Continue to Map"
                      : "Continue to People"}
          </button>
        </footer>
      </div>
    );
  }
  return null;
}
