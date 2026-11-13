import { foundingVenueShapeProblem } from "../../../shared/helpers/founding-venues.js";
import { simpleFoundingMap } from "./simple-map.js";
import { assignFoundingHome, foundingHomeMembers, reconcileFoundingRoster } from "./founding-homes.js";
import { useCallback, useEffect, useRef, useState } from "react";
import { ELEMENT_TAG } from "../../shared/constants.js";
import { useLetterFont } from "../../shared/letter-font-css.js";
import type { MobileMapView } from "../exploration/MapStage.js";
import { defaultView, MapStage } from "../exploration/MapStage.js";
import { AgentConnections } from "../settings/AgentConnections.js";
import { SpriteSetupDialog } from "../residents/SpriteSetupDialog.js";
import { FoundingPagination } from "./FoundingPagination.js";
import { FoundingDialog } from "./FoundingDialog.js";
import {
  FOUNDING_CIRCUMSTANCE_MAX_LENGTH,
  foundingCircumstanceText,
  foundingCircumstanceFromText,
} from "../../../shared/helpers/founding-circumstance.js";
import { FoundingField } from "./FoundingField.js";
import { FoundingGuide } from "./FoundingGuide.js";
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
import { SceneryStyleFields, venueHasCommon, venueHasPrivate } from "./villages-founding-editor";
import { type FoundingIssue, foundingVenueIssues } from "./villages-founding-workspace-state";
import { playerBackgroundProblem } from "./villages-player-background.js";
const PLACE_ERRORS = {
  name: "Give the village a name.",
  locationName: "Name the starting location.",
  setting: "Describe the starting location.",
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
    movingSetupVenueId,
    nameOfCharacter,
    patchSetupVenue,
    personaDraft,
    personas,
    pickSetupTownMap,
    placeSetupPin,
    portraits,
    retrySetupSaving,
    screen,
    selectedSetupVenueId,
    setConnectionSetupProblem,
    setMovingSetupVenueId,
    setPersonaDraft,
    setSelectedSetupVenueId,
    setSetupFocusIssue,
    setSetupSpriteRevisions,
    setupSpriteRevisions,
    setSetupFoundingVillagerIds,
    setSetupLorebookDraft,
    setSetupMapBusy,
    setSetupMapProblem,
    setSetupMapReviewed,
    setSetupName,
    setSetupLocationName,
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
    setupMapProblem,
    setupMapPrompt,
    setupMapRequest,
    setupMapShape,
    setupMapSource,
    setupMapSrc,
    setupName,
    setupLocationName,
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
  const [artSettingsOpen, setArtSettingsOpen] = useState(false);
  const [spriteId, setSpriteId] = useState<string | null>(null);
  const [reviewPage, setReviewPage] = useState(0);
  useLetterFont(screen === "setup" ? "lora" : undefined);
  const [openVenueFromMap, setOpenVenueFromMap] = useState<{ id: string }>();
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
    setValidatedFields((fields) => (fields.includes("map") ? fields.filter((field) => field !== "map") : fields));
  }, [setupStep, screen]);
  useFoundingKeyboardOverlay(rootRef, screen === "setup");
  const mapUpload = useRef<HTMLInputElement>(null);
  const draftStatus = draftSaveError
    ? "Draft not saved"
    : draftSaving
      ? "Saving…"
      : draftSavedAt
        ? `Saved ${new Date(draftSavedAt).toLocaleTimeString()}`
        : "Preparing draft storage…";
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
    const mapReady = !setupMapBusy;
    const venueShapeProblem = foundingVenueShapeProblem(setupVenues, setupContext.communityVenueId);
    const map = (interactive: boolean) => (
      <div className="villages-forging-map">
        {setupMapProblem ? (
          <p className={`${ELEMENT_TAG}-error`} role="alert">
            {setupMapProblem}
          </p>
        ) : null}
        <div className={`${ELEMENT_TAG}-setup-map-viewport`} aria-label="Venue placement map">
          <MapStage
            src={setupMapSrc || simpleFoundingMap()}
            alt={`Map of ${setupLocationName || "your starting location"}`}
            pins={draftPins.map((pin) => ({
              ...pin,
              selected: selectedSetupVenueId === pin.id,
              onSelect:
                interactive && !setupVenueBusy && !setupSuggestionsBusy
                  ? () => {
                      setSelectedSetupVenueId(pin.id);
                      setSetupFocusIssue(null);
                      setOpenVenueFromMap({ id: pin.id });
                      setMovingSetupVenueId(null);
                      setSetupWorkspace((state) => ({ ...state, paused: true, view: "details" }));
                    }
                  : undefined,
            }))}
            placing={
              interactive && !!nextPin && mapReady && !setupEditorOpen && !setupSuggestionsBusy && !setupVenueBusy
            }
            view={defaultView("contain")}
            shape={setupMapShape}
            onPlace={interactive ? (x, y, size) => placeSetupPin(x, y, size, nextPin?.id) : undefined}
            onMovePin={
              interactive && mapReady && !setupEditorOpen && !setupSuggestionsBusy && !setupVenueBusy
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
            keyboardPlacementId={interactive ? (nextPin?.id ?? selectedSetupVenueId ?? setupVenues[0]?.id) : undefined}
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
        rows.length && foundingVenueShapeProblem(rows, setupContext.communityVenueId)
          ? rows
          : arrangeQuickStartVenues(reconcileFoundingRoster(rows, actors, added, setupContext.communityVenueId)),
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
          <h1>Begin your Village</h1>
          <FoundingGuide>
            {
              [
                "Give your village a name and tell me where it begins.",
                "Choose who starts here, then set up how they appear in Scenes.",
                "Open a Venue from the map or the list. Its Zones show where people can sleep and visit.",
                "Check where everyone lives and sleeps, then set the scene for the first day.",
              ][setupStep]!
            }
          </FoundingGuide>

          {setupStep === 0 ? (
            <button
              type="button"
              className="villages-founding-art-settings-button"
              disabled={busy || setupVenueBusy || setupSuggestionsBusy || setupMapBusy || !!setupMapRequest}
              onClick={() => setArtSettingsOpen(true)}
            >
              Art settings
            </button>
          ) : null}
        </header>
        {setupStep === 0 && artSettingsOpen ? (
          <FoundingDialog title="Art settings" onClose={() => setArtSettingsOpen(false)}>
            <div className="villages-founding-editor-body">
              <SceneryStyleFields
                value={controller.sceneryStyle}
                profileId={controller.sceneryStyleProfileId}
                onChange={controller.setSceneryStyle}
                onProfileChange={controller.setSceneryStyleProfileId}
              />
              <label>
                Map details
                <textarea
                  autoComplete="off"
                  aria-label="Map details"
                  maxLength={1500}
                  rows={3}
                  value={setupMapPrompt}
                  onChange={(event) => controller.setSetupMapPrompt(event.target.value)}
                />
              </label>
              <label>
                Exclude from map
                <textarea
                  autoComplete="off"
                  aria-label="Exclude from map"
                  maxLength={1500}
                  rows={2}
                  value={controller.setupMapNegativePrompt}
                  onChange={(event) => controller.setSetupMapNegativePrompt(event.target.value)}
                />
              </label>
            </div>
            <footer>
              <button type="button" onClick={() => setArtSettingsOpen(false)}>
                Done
              </button>
            </footer>
          </FoundingDialog>
        ) : null}
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
            <div className="villages-founding-setting">
              <section className="villages-forging-card">
                <h3>Village</h3>
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
                <FoundingField title="World" optional>
                  <input
                    autoComplete="off"
                    aria-label="World"
                    maxLength={120}
                    value={setupWorldName}
                    disabled={busy}
                    onChange={(event) => setSetupWorldName(event.target.value)}
                  />
                </FoundingField>
              </section>
              <section className="villages-forging-card">
                <h3>Starting location</h3>
                <FoundingField
                  title="Location name"
                  error={
                    validatedFields.includes("location-name") && !setupLocationName.trim()
                      ? PLACE_ERRORS.locationName
                      : ""
                  }
                >
                  <input
                    autoComplete="off"
                    aria-label="Location name"
                    maxLength={80}
                    value={setupLocationName}
                    disabled={busy}
                    onChange={(event) => {
                      setSetupLocationName(event.target.value);
                      clearFieldValidation("location-name");
                    }}
                  />
                </FoundingField>
                <FoundingField
                  title="Location description"
                  error={validatedFields.includes("place-setting") && !setupSetting.trim() ? PLACE_ERRORS.setting : ""}
                >
                  <textarea
                    autoComplete="off"
                    aria-label="Location description"
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
            </div>
            <section className="villages-forging-card villages-place-options">
              <div className="villages-founding-tabs" role="group" aria-label="Village context">
                {["World rules", "Lorebooks", "Connections"].map((view) => (
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
                locationName={setupLocationName}
                saveStatus={draftStatus}
                onRetrySaving={() => void retrySetupSaving()}
                actions={
                  <QuickStartButton
                    busy={busy || setupSuggestionsBusy}
                    disabled={setupVenueBusy || !!setupMapRequest}
                    pending={!!setupWorkspace.suggestionRequest && !setupWorkspace.suggestionRequest.failure}
                    failed={!!setupWorkspace.suggestionRequest?.failure}
                    onGenerate={() => void suggestSetupVenues({ quickStart: true, separateHomes: true })}
                  />
                }
                mapArtwork={
                  <>
                    <button
                      type="button"
                      disabled={busy || setupMapBusy || setupSuggestionsBusy || setupVenueBusy || !setupSetting.trim()}
                      onClick={() => {
                        if (setupMapRequest?.phase === "paused") {
                          setSetupMapProblem("");
                          setSetupMapBusy(true);
                          updateSetupMapRequest({ ...setupMapRequest, phase: "waiting" });
                        } else void generateSetupTownMap();
                      }}
                    >
                      {setupMapBusy
                        ? "Generating map…"
                        : setupMapRequest?.phase === "paused"
                          ? "Check map status"
                          : "Generate artwork"}
                    </button>
                    <button
                      type="button"
                      disabled={busy || setupMapBusy || !!setupMapRequest || setupVenueBusy || setupSuggestionsBusy}
                      onClick={() => mapUpload.current?.click()}
                    >
                      Upload image
                    </button>
                    <input
                      ref={mapUpload}
                      autoComplete="off"
                      hidden
                      aria-label="Upload map image"
                      type="file"
                      accept="image/*"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        event.target.value = "";
                        if (file) void pickSetupTownMap(file);
                      }}
                    />
                  </>
                }
                communityVenueId={setupContext.communityVenueId}
                people={wizardVillagers}
                selectedId={selectedSetupVenueId}
                busy={setupSuggestionsBusy}
                imageBusy={setupVenueBusy || setupSuggestionsBusy}
                focusIssue={setupFocusIssue}
                saveError={draftSaveError || undefined}
                problem={
                  setupProblem ||
                  (venueShapeProblem ? venueShapeProblem + " Use Suggest to replace this older draft." : undefined)
                }
                map=<>
                  {map(true)}
                  {setupPlacementError ? <p role="alert">{setupPlacementError}</p> : null}
                </>
                onSelect={(venue) => {
                  setSelectedSetupVenueId(venue.id);
                  setSetupFocusIssue(null);
                  setMovingSetupVenueId(null);
                  setSetupWorkspace((state) => ({ ...state, paused: true, view: "details" }));
                }}
                onPatch={(venue) => patchSetupVenue(venue.id, () => venue)}
                openFromMap={openVenueFromMap}
                onMapOpened={() => setOpenVenueFromMap(undefined)}
                onMoveResident={(venueId, actorId) => {
                  try {
                    setSetupVenues(assignFoundingHome(setupVenues, venueId, actorId, true));
                    return "";
                  } catch (cause) {
                    return cause instanceof Error ? cause.message : "Could not move this resident.";
                  }
                }}
                onGenerateImage={(venue, area, zoneId) => void generateSetupImage(venue, area, zoneId)}
                onUploadImage={(venue, area, file, zoneId) => void uploadSetupImage(venue, area, file, zoneId)}
              />
            </div>
          ) : null}
          {setupStep === 3 ? (
            <>
              <h2>Review {setupName}</h2>
              <div className="villages-forging-columns">
                <div>
                  <section className="villages-forging-card">
                    <div className="villages-forging-card-heading">
                      <h3>People</h3>
                      <button type="button" onClick={() => gotoSetupStep(1)}>
                        Change people
                      </button>
                    </div>
                    {[
                      {
                        id: "player",
                        name:
                          (personas?.find((person) => person.id === personaDraft)?.name ?? "Your Persona") + " (you)",
                      },
                      ...wizardVillagers,
                    ].map((person) => {
                      const home = setupVenues.find((venue) => foundingHomeMembers(venue).includes(person.id));
                      const sleep = [...(home?.spaces ?? []), ...(home?.privateSpaces ?? [])].find(
                        (zone) => zone.id === home?.destinations?.[person.id]?.sleep,
                      );
                      return (
                        <p key={person.id}>
                          <strong>{person.name}</strong> · {home?.name || "Choose a home"}
                          {sleep ? ` · Sleeps in ${sleep.name || "Zone"}` : ""}
                        </p>
                      );
                    })}
                  </section>
                  <section className="villages-forging-card">
                    <div className="villages-forging-card-heading">
                      <h3>Starting location · {setupLocationName}</h3>
                      <button type="button" onClick={() => gotoSetupStep(0)}>
                        Change setting
                      </button>
                    </div>
                    <p>{setupSetting}</p>
                    {setupContext.rules ? <p>World rules: {setupContext.rules}</p> : null}
                    {setupWorldName ? <p>World: {setupWorldName}</p> : null}
                    <p>{setupLorebookDraft.length} lorebooks selected</p>
                  </section>
                  <section className="villages-forging-card">
                    <div className="villages-forging-card-heading">
                      <h3>Map · {setupLocationName}</h3>
                      <button type="button" onClick={() => gotoSetupStep(2)}>
                        Change map
                      </button>
                    </div>
                    <p>{setupMapSource === "upload" ? "Uploaded artwork" : "Chosen artwork"}</p>
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
                  <FoundingField title="First day" optional>
                    <textarea
                      autoComplete="off"
                      aria-label="First day"
                      placeholder="What’s happening when the village begins?"
                      maxLength={FOUNDING_CIRCUMSTANCE_MAX_LENGTH}
                      rows={4}
                      value={foundingCircumstanceText(
                        setupContext.circumstances.filter((row) => row.scope === "village"),
                      )}
                      disabled={busy}
                      onChange={(event) =>
                        setSetupContext((context) => ({
                          ...context,
                          circumstances: [
                            ...foundingCircumstanceFromText(event.target.value),
                            ...context.circumstances.filter((row) => row.scope === "zone"),
                          ],
                        }))
                      }
                    />
                  </FoundingField>
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
            {draftStatus}
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
          {setupStep === 2 && validatedFields.includes("map") && !setupMapSrc ? (
            <span role="alert" className="villages-forging-map-warning">
              Upload or generate a map image before continuing.
            </span>
          ) : null}
          <button
            type="button"
            className="villages-forging-primary"
            disabled={
              busy ||
              spriteBusy ||
              setupEditorOpen ||
              setupSuggestionsBusy ||
              setupVenueBusy ||
              !!draftSaveError ||
              (setupStep === 2 && (setupMapBusy || !!setupMapRequest))
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
                  "location-name",
                  "place-setting",
                  ...(setupStep === 2 ? ["map"] : []),
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
              if (setupStep === 2 && !setupMapSrc) return;
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
