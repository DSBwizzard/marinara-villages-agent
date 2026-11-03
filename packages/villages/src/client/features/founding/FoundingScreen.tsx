import { freshRowKey } from "../../shared/presentation.js";
import { newSetupVenue } from "./FoundingPanels.js";
import { assignFoundingHome, reconcileFoundingRoster } from "./founding-homes.js";
import { useCallback, useEffect, useRef, useState } from "react";
import { MAP_UPLOAD_GUIDANCE } from "../../../shared/helpers/town-map-upload.js";
import { SceneryStylePicker } from "../../shared/SceneryStylePicker.js";
import { ELEMENT_TAG } from "../../shared/constants.js";
import type { MobileMapView } from "../exploration/MapStage.js";
import { defaultView, MapStage } from "../exploration/MapStage.js";
import { AgentConnections } from "../settings/AgentConnections.js";
import { SpriteSetupDialog } from "../residents/SpriteSetupDialog.js";
import { FoundingPagination } from "./FoundingPagination.js";
import {
  FOUNDING_CIRCUMSTANCE_MAX_LENGTH,
  foundingCircumstanceText,
  foundingCircumstanceFromText,
} from "../../../shared/helpers/founding-circumstance.js";
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
import { playerBackgroundProblem } from "./villages-player-background.js";
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
    setSetupProblem,
    setSetupPlacementError,
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
    setupMapSource,
    setupMapSrc,
    setupName,
    setupPlacementError,
    setupPlayerBackground,
    setupProblem: currentSetupProblem,
    setupWorldName,
    setSetupWorldName,
    setupSetting,
    setupContext,
    setSetupContext,
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
  const setupProblem = currentSetupProblem || setupWorkspace.suggestionRequest?.failure || "";
  const [contextView, setContextView] = useState("World rules");
  const [spriteId, setSpriteId] = useState<string | null>(null);
  const [reviewPage, setReviewPage] = useState(0);
  const availableSpriteIds = setupFoundingVillagerIds.filter((id) => catalog?.some((person) => person.id === id));
  const activeSpriteId = spriteId && availableSpriteIds.includes(spriteId) ? spriteId : (availableSpriteIds[0] ?? null);
  const [spriteBusy, setSpriteBusy] = useState(false);
  const spriteWorking = useRef(false);
  const spriteBusyChanged = useCallback((value: boolean) => {
    spriteWorking.current = value;
    setSpriteBusy(value);
  }, []);
  const spriteSaved = useCallback(
    (revision?: number) => {
      if (!activeSpriteId) return;
      setSetupSpriteRevisions((prior) => {
        if (prior[activeSpriteId] === revision) return prior;
        const next = { ...prior };
        if (revision === undefined) delete next[activeSpriteId];
        else next[activeSpriteId] = revision;
        return next;
      });
    },
    [activeSpriteId, setSetupSpriteRevisions],
  );
  const reviewIndex = Math.min(reviewPage, Math.max(0, Math.ceil(setupVenues.length / 3) - 1));
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    rootRef.current?.scrollTo({ top: 0 });
  }, [setupStep]);
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
      setupStep < 2 ||
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
    const nextPin = setupWorkspace.paused ? undefined : setupVenues.find((venue) => venue.id === movingSetupVenueId);
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
              selected: selectedSetupVenueId === pin.id,
              onSelect: interactive
                ? () => {
                    setSelectedSetupVenueId(pin.id);
                    setMovingSetupVenueId(null);
                    setSetupWorkspace((state) => ({ ...state, paused: true, view: "map" }));
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
            onMovePin={
              interactive &&
              mapReady &&
              !setupEditorOpen &&
              setupWorkspace.view !== "details" &&
              !setupSuggestionsBusy &&
              !setupVenueBusy
                ? (id, x, y, size) => {
                    setSelectedSetupVenueId(id);
                    placeSetupPin(x, y, size, id);
                  }
                : undefined
            }
            onMoveInvalid={() => setSetupPlacementError("Place the Venue inside the map.")}
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
      if (spriteWorking.current) return;
      clearFieldValidation("villagers");
      const actors = [
        { id: "player", name: "Your" },
        ...ids.map((id) => ({
          id,
          name: catalog?.find((person) => person.id === id)?.name ?? "Villager",
        })),
      ];
      const added = ids.filter((id) => !setupFoundingVillagerIds.includes(id));
      if (!setupFoundingVillagerIds.length) added.push("player");
      setSetupVenues((rows) =>
        arrangeQuickStartVenues(reconcileFoundingRoster(rows, actors, added, setupContext.communityVenueId)),
      );
      setSetupFoundingVillagerIds(ids);
      setSetupMapReviewed(false);
      setSetupProblem("");
    };
    return (
      <div
        className={`${ELEMENT_TAG}-root ${ELEMENT_TAG}-home ${ELEMENT_TAG}-setup-root villages-forging-v2`}
        data-step={setupStep}
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
                    if (spriteWorking.current) return;
                    setPersonaDraft(id);
                    clearFieldValidation("persona");
                  }}
                  disabled={busy || spriteBusy}
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
                  onEditSprites={(id) => {
                    if (spriteWorking.current) return;
                    setSpriteId(id);
                    requestAnimationFrame(() => {
                      const root = rootRef.current;
                      const body = root?.querySelector<HTMLElement>(".villages-forging-body");
                      const pane = root?.querySelector<HTMLElement>(".villages-founding-sprites");
                      if (root && root.clientWidth < 728 && body && pane)
                        body.scrollTop += pane.getBoundingClientRect().top - body.getBoundingClientRect().top;
                    });
                  }}
                  activeId={activeSpriteId}
                  catalog={catalog}
                  portraits={portraits}
                  selectedIds={setupFoundingVillagerIds}
                  onChange={chooseRoster}
                  disabled={busy || spriteBusy}
                />
              </section>
              <section className="villages-forging-card villages-founding-sprites" aria-label="Resident sprites">
                {setupStep === 1 && activeSpriteId ? (
                  <SpriteSetupDialog
                    key={activeSpriteId}
                    embedded
                    characterId={activeSpriteId}
                    name={wizardVillagers.find((person) => person.id === activeSpriteId)?.name ?? "Resident"}
                    portrait={portraits[activeSpriteId]}
                    selectedRevision={setupSpriteRevisions[activeSpriteId]}
                    onClose={() => setSpriteId(null)}
                    onDone={spriteSaved}
                    onBusyChange={spriteBusyChanged}
                  />
                ) : (
                  <>
                    <h3>Resident sprites</h3>
                    <p>Choose a resident to set up their artwork.</p>
                  </>
                )}
              </section>
            </div>
          </div>
          <div hidden={setupStep !== 0} className="villages-place-panels">
            <section className="villages-forging-card">
              <h3>Setting</h3>
              <FoundingField
                title="Village Name"
                error={validatedFields.includes("place-name") && !setupName.trim() ? PLACE_ERRORS.name : ""}
              >
                <input
                  autoComplete="off"
                  aria-label="Village Name"
                  maxLength={snapshot?.settings.villageNameMaxLength ?? 80}
                  value={setupName}
                  disabled={busy}
                  onChange={(event) => {
                    setSetupName(event.target.value);
                    clearFieldValidation("place-name");
                  }}
                />
              </FoundingField>
              <FoundingField title="Village world" optional>
                <input
                  autoComplete="off"
                  aria-label="Village world"
                  maxLength={120}
                  value={setupWorldName}
                  disabled={busy}
                  onChange={(event) => setSetupWorldName(event.target.value)}
                />
              </FoundingField>
              <FoundingField
                title="Local area"
                error={validatedFields.includes("place-setting") && !setupSetting.trim() ? PLACE_ERRORS.setting : ""}
              >
                <textarea
                  autoComplete="off"
                  aria-label="Local area"
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
              <small>Engine time · {snapshot?.clock?.timeZone || snapshot?.village.timeZone || "UTC"}</small>
            </section>
            <section className="villages-forging-card villages-place-options">
              <div className="villages-founding-tabs" role="group" aria-label="Village context">
                {["World rules", "Circumstances", "Lorebooks", "Connections"].map((view) => (
                  <button key={view} aria-pressed={contextView === view} onClick={() => setContextView(view)}>
                    {view}
                  </button>
                ))}
              </div>
              <div className="villages-founding-context">
                {contextView === "World rules" ? (
                  <FoundingField title="World rules" optional>
                    <textarea
                      autoComplete="off"
                      aria-label="World rules"
                      maxLength={4096}
                      rows={7}
                      value={setupContext.rules}
                      disabled={busy}
                      onChange={(event) => setSetupContext((context) => ({ ...context, rules: event.target.value }))}
                    />
                  </FoundingField>
                ) : null}
                {contextView === "Circumstances" ? (
                  <>
                    <FoundingField title="Starting circumstances" optional>
                      <textarea
                        autoComplete="off"
                        aria-label="Starting circumstances"
                        maxLength={FOUNDING_CIRCUMSTANCE_MAX_LENGTH}
                        rows={7}
                        value={foundingCircumstanceText(setupContext.circumstances)}
                        disabled={busy}
                        onChange={(event) =>
                          setSetupContext((context) => ({
                            ...context,
                            circumstances: foundingCircumstanceFromText(event.target.value),
                          }))
                        }
                      />
                    </FoundingField>
                    {setupContext.circumstances.some((row) => row.scope === "zone") ? (
                      <p role="status">Saved circumstance scopes retained until edited.</p>
                    ) : null}
                  </>
                ) : null}
                {contextView === "Lorebooks" ? (
                  <>
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
                  </>
                ) : null}
                <div hidden={contextView !== "Connections"}>
                  {connectionSetupProblem && validatedFields.includes("connections") ? (
                    <p role="alert" data-founding-problem tabIndex={-1}>
                      {connectionSetupProblem}
                    </p>
                  ) : null}
                  <AgentConnections onSetupProblem={setConnectionSetupProblem} compact />
                </div>
              </div>
            </section>
          </div>
          {setupStep === 2 ? (
            <div className="villages-founding-places">
              <QuickStartVenues
                venues={setupVenues}
                actions={
                  <>
                    {(["residence", "other"] as const).map((kind) => (
                      <button
                        key={kind}
                        type="button"
                        disabled={busy || setupSuggestionsBusy || setupVenueBusy || setupVenues.length >= 16}
                        onClick={() => {
                          const venue = newSetupVenue(freshRowKey(), kind, 0.5, 0.5);
                          if (kind === "residence") venue.name = "New home";
                          venue.presentation = { ...venue.presentation, x: null, y: null };
                          setSetupVenues((rows) =>
                            rows.length < 16 ? arrangeQuickStartVenues([...rows, venue]) : rows,
                          );
                          setSelectedSetupVenueId(venue.id);
                          setSetupFocusIssue(null);
                          setMovingSetupVenueId(null);
                          setSetupWorkspace((state) => ({ ...state, paused: true, view: "details" }));
                          setSetupMapReviewed(false);
                        }}
                      >
                        {kind === "residence" ? "+ Add home" : "+ Add Venue"}
                      </button>
                    ))}
                    {setupWorkspace.suggestionRequest ? (
                      <QuickStartButton
                        busy={busy || setupSuggestionsBusy}
                        pending={!setupWorkspace.suggestionRequest.failure}
                        failed={!!setupWorkspace.suggestionRequest.failure}
                        onGenerate={(draftEntranceImage) =>
                          void suggestSetupVenues({ ...setupWorkspace.suggestionRequest, draftEntranceImage })
                        }
                      />
                    ) : null}
                  </>
                }
                mapArtwork={
                  <>
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
                  </>
                }
                onAssignHome={(venue, actorId, assigned) => {
                  try {
                    setSetupVenues(assignFoundingHome(setupVenues, venue.id, actorId, assigned));
                    setSetupContext((context) => ({
                      rules: context.rules,
                      circumstances: context.circumstances,
                      communityVenueId: context.communityVenueId,
                    }));
                    setSetupMapReviewed(false);
                    setSetupProblem("");
                  } catch (error) {
                    setSetupProblem(error instanceof Error ? error.message : "Check this home's capacity.");
                  }
                }}
                onCommunityVenue={(venue) => {
                  setSetupContext((context) => ({ ...context, communityVenueId: venue.id }));
                  setSetupMapReviewed(false);
                  setSetupProblem("");
                }}
                communityVenueId={setupContext.communityVenueId}
                onRemove={(venue) => {
                  setSetupVenues((rows) => rows.filter((row) => row.id !== venue.id));
                  setSelectedSetupVenueId(null);
                  setSetupMapReviewed(false);
                }}
                people={wizardVillagers}
                selectedId={selectedSetupVenueId}
                movingVenueId={movingSetupVenueId}
                suggestions={
                  <QuickStartButton
                    busy={busy || setupSuggestionsBusy}
                    disabled={setupVenueBusy}
                    pending={!!setupWorkspace.suggestionRequest && !setupWorkspace.suggestionRequest.failure}
                    failed={
                      !!setupWorkspace.suggestionRequest?.failure &&
                      setupWorkspace.suggestionRequest.venueId === selectedSetupVenueId
                    }
                    onGenerate={(draftEntranceImage) =>
                      void suggestSetupVenues({
                        venueId: selectedSetupVenueId ?? undefined,
                        fullVenue: true,
                        draftEntranceImage,
                      })
                    }
                  />
                }
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
            </div>
          ) : null}
          {setupStep === 3 ? (
            <>
              <h2>Review {setupName}</h2>
              <p>Check your complete starting situation before founding.</p>
              <div className="villages-forging-columns">
                <div>
                  <section className="villages-forging-card">
                    <div className="villages-forging-card-heading">
                      <h3>People</h3>
                      <button type="button" onClick={() => gotoSetupStep(1)}>
                        Change people
                      </button>
                    </div>
                    <p>{personas?.find((person) => person.id === personaDraft)?.name ?? "Selected Persona"} · You</p>
                    {wizardVillagers.map((person) => (
                      <p key={person.id}>{person.name}</p>
                    ))}
                  </section>
                  <section className="villages-forging-card">
                    <div className="villages-forging-card-heading">
                      <h3>Setting</h3>
                      <button type="button" onClick={() => gotoSetupStep(0)}>
                        Change setting
                      </button>
                    </div>
                    <p>{setupSetting}</p>
                    {setupContext.rules ? <p>World rules: {setupContext.rules}</p> : null}
                    {setupContext.circumstances
                      .filter((row) => row.summary.trim())
                      .map((row, index) => (
                        <p key={index}>
                          {row.scope === "village"
                            ? "Village-wide"
                            : `${setupVenues.find((venue) => venue.id === row.venueId)?.name} / ${row.zoneId}`}
                          : {row.summary}
                        </p>
                      ))}
                    {setupWorldName ? <p>Village world: {setupWorldName}</p> : null}
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
                      <button type="button" onClick={() => gotoSetupStep(2)}>
                        Change starting Venues
                      </button>
                    </div>
                    {setupVenues.slice(reviewIndex * 3, reviewIndex * 3 + 3).map((venue, index) => (
                      <details key={venue.id}>
                        <summary>
                          {index + 1}. {venue.name} · {venue.form} · Exterior{venueHasCommon(venue) ? " / Common" : ""}
                          {venueHasPrivate(venue) ? " / Private" : ""}
                        </summary>
                        <p>{venue.description}</p>
                        {venue.id === setupContext.communityVenueId ? (
                          <p>Community Venue · public and unowned at Founding</p>
                        ) : null}
                        {venue.residentIds?.length || venue.occupancy.playerHome ? (
                          <p>
                            Household:{" "}
                            {[
                              ...(venue.occupancy.playerHome ? ["You"] : []),
                              ...(venue.residentIds ?? []).map(
                                (id) => wizardVillagers.find((person) => person.id === id)?.name ?? id,
                              ),
                            ].join(", ")}
                          </p>
                        ) : (
                          <p>No assigned household</p>
                        )}
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
                    <FoundingPagination
                      page={reviewIndex}
                      count={Math.ceil(setupVenues.length / 3)}
                      onPage={setReviewPage}
                      label="Review Venues"
                    />
                  </section>
                </div>
                <section className="villages-forging-card">
                  {map(false)}
                  <p>
                    {placed} of {setupVenues.length} Venues placed
                  </p>
                  <h3>After founding</h3>
                  <p>Prepare local routines and optional initial Wishes, then meet at the Community Venue.</p>
                </section>
              </div>
            </>
          ) : null}
          {setupProblem && !inlineProblem && !(setupStep === 2 && setupWorkspace.view === "details") ? (
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
            <button
              type="button"
              disabled={busy || spriteBusy || setupEditorOpen}
              onClick={() => {
                if (!spriteWorking.current) gotoSetupStep(setupStep - 1);
              }}
            >
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
            disabled={busy || spriteBusy || setupEditorOpen || setupVenueBusy || setupSuggestionsBusy}
            onClick={() => {
              if (spriteWorking.current || setupImageClaim.current || setupSuggestionsClaim.current) return;
              void exitSetupDraft();
            }}
          >
            Exit
          </button>
          <button
            type="button"
            className="villages-forging-primary"
            disabled={
              busy || spriteBusy || setupEditorOpen || setupSuggestionsBusy || setupVenueBusy || !!draftSaveError
            }
            onClick={() => {
              if (spriteWorking.current) return;
              if (setupStep === 0 && connectionSetupProblem) setContextView("Connections");
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
                ? "Found village"
                : setupStep === 2
                  ? "Review village"
                  : setupStep === 1
                    ? "Continue to Venues and Map"
                    : "Continue to People"}
          </button>
        </footer>
      </div>
    );
  }
  return null;
}
