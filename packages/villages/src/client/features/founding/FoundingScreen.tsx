import { foundingVenueShapeProblem } from "../../../shared/helpers/founding-venues.js";
import { simpleFoundingMap } from "./simple-map.js";
import { assignFoundingHome, foundingHomeMembers, reconcileFoundingRoster } from "./founding-homes.js";
import { useCallback, useEffect, useRef, useState, type ReactNode, type Ref } from "react";
import { CONNECTION_SETUP_PROBLEMS, ELEMENT_TAG } from "../../shared/constants.js";
import { useLetterFont } from "../../shared/letter-font-css.js";
import type { MobileMapView } from "../exploration/MapStage.js";
import { defaultView, MapStage } from "../exploration/MapStage.js";
import { AgentConnectionsControls, useAgentConnections } from "../settings/AgentConnections.js";
import { Appearance } from "../residents/Appearance.js";
import { FoundingPagination } from "./FoundingPagination.js";
import { FoundingDialog } from "./FoundingDialog.js";
import {
  FOUNDING_CIRCUMSTANCE_MAX_LENGTH,
  foundingCircumstanceText,
  foundingCircumstanceFromText,
} from "../../../shared/helpers/founding-circumstance.js";
import { FoundingField } from "./FoundingField.js";
import { FoundingGuide } from "./FoundingGuide.js";
import { FoundingSettingScene, settingBeat } from "./FoundingSettingScene.js";
import { FoundingPersonaSelector, FoundingVillagerPicker, SETUP_STEPS } from "./FoundingPanels.js";
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
const FOUNDING_ROOT = `${ELEMENT_TAG}-root ${ELEMENT_TAG}-home ${ELEMENT_TAG}-setup-root villages-forging-v2`;
const PHONE_LAYOUT = "(max-width:727px)";
const CHAPTER_MENUS = [undefined, "people", "venues", "review"] as const;

function FoundingChapter({
  step,
  mobileScene,
  mobileMenuRef,
  guide,
  bodyRef,
  children,
}: {
  step: number;
  mobileScene: boolean;
  mobileMenuRef: Ref<HTMLHeadingElement>;
  guide: ReactNode;
  bodyRef: Ref<HTMLElement>;
  children: ReactNode;
}) {
  return (
    <div className="villages-founding-chapter" data-guided={step > 0 || undefined}>
      {guide}
      <main className="villages-forging-body" data-step={step} ref={bodyRef} hidden={mobileScene}>
        <h2
          className="villages-founding-menu-title"
          hidden={step === 0 || step === 3}
          tabIndex={-1}
          ref={mobileMenuRef}
        >
          {step === 1 ? "People" : "Venues and Map"}
        </h2>
        {children}
      </main>
    </div>
  );
}

export function FoundingScreen({
  controller,
  host,
  storybookDaylight,
}: {
  controller: FoundingScreenController;
  host?: HTMLElement;
  storybookDaylight: boolean;
}) {
  const {
    busy,
    catalog,
    connectionSetupProblem,
    draftPins,
    draftNeedsReplacement,
    draftSaveError,
    foundVillage,
    generateSetupImage,
    generateSetupTownMap,
    gotoSetupStep,
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
    setupSetting,
    setupContext,
    setSetupContext,
    setupStep,
    setupSuggestionsBusy,
    setupVenueBusy,
    setupVenues,
    setupWorkspace,
    snapshot,
    suggestSetupVenues,
    updateSetupMapRequest,
    uploadSetupImage,
  } = controller;
  const pendingSetting = setupWorkspace.suggestionRequest?.draftSetting && !setupWorkspace.suggestionRequest.failure;
  const rawSetupProblem =
    currentSetupProblem ||
    (setupStep === 2 && !setupWorkspace.suggestionRequest?.draftSetting
      ? setupWorkspace.suggestionRequest?.failure
      : "") ||
    "";
  const venueConnectionUnavailable =
    setupStep === 2 && /^Language model connection not found(?::|\.?$)/iu.test(rawSetupProblem);
  const setupProblem = venueConnectionUnavailable
    ? "The System connection is unavailable. Choose another model or review it in Engine."
    : rawSetupProblem;
  const connections = useAgentConnections(screen === "setup");
  useEffect(() => {
    if (screen === "setup") setConnectionSetupProblem(connections.setupProblem);
  }, [screen, connections.setupProblem, setConnectionSetupProblem]);
  const [connectionPickerOpen, setConnectionPickerOpen] = useState(false);
  const [phone, setPhone] = useState(() => window.matchMedia(PHONE_LAYOUT).matches);
  useEffect(() => {
    const layout = window.matchMedia(PHONE_LAYOUT);
    const update = () => setPhone(layout.matches);
    update();
    layout.addEventListener("change", update);
    return () => layout.removeEventListener("change", update);
  }, []);
  const chapterMenu = CHAPTER_MENUS[setupStep];
  const mobileScene = phone && !!chapterMenu && setupWorkspace.mobileMenu !== chapterMenu && !draftSaveError;
  const beat = settingBeat(setupWorkspace);
  const manualSetting = beat === "manual";
  const [arrival, setArrival] = useState<"fading" | "turning" | "greeting">();
  const fading = arrival === "fading";
  const turning = arrival === "turning";
  const enteringScene = arrival === "greeting" && setupStep === 0 && beat === "welcome";
  const showTitle =
    fading ||
    (setupStep === 0 &&
      beat === "welcome" &&
      setupWorkspace.settingBeat === undefined &&
      setupWorkspace.settingIntroPending === true &&
      !draftSaveError);
  const chooseConnections = setupStep === 0 && setupWorkspace.settingIntroPending === "connections" && !fading;
  const prelude = showTitle || chooseConnections || turning;
  useEffect(() => {
    if (!fading && !turning) return;
    const timer = window.setTimeout(() => setArrival(fading ? undefined : "greeting"), fading ? 350 : 500);
    return () => window.clearTimeout(timer);
  }, [fading, turning]);
  const hasSettingDraft = !!setupWorkspace.settingDraft;
  const settingEditorOpen =
    manualSetting ||
    (setupWorkspace.settingEditorOpen ??
      (beat === "village" &&
        hasSettingDraft &&
        !setupWorkspace.suggestionRequest?.draftSetting &&
        !setupWorkspace.settingProblem));
  const setSettingEditorOpen = useCallback(
    (open: boolean) =>
      setSetupWorkspace((workspace) =>
        workspace.settingEditorOpen === open ? workspace : { ...workspace, settingEditorOpen: open },
      ),
    [setSetupWorkspace],
  );
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
  const bodyRef = useRef<HTMLElement>(null);
  const settingTitle = useRef<HTMLHeadingElement>(null);
  const connectionTitle = useRef<HTMLHeadingElement>(null);
  const chapterLine = useRef<HTMLParagraphElement>(null);
  const chapterTitle = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (chooseConnections) connectionTitle.current?.focus({ preventScroll: true });
  }, [chooseConnections]);
  useEffect(() => {
    rootRef.current?.scrollTo({ top: 0 });
    bodyRef.current?.parentElement?.scrollTo({ top: 0 });
    bodyRef.current?.scrollTo({ top: 0 });
    setValidatedFields((fields) => (fields.includes("map") ? fields.filter((field) => field !== "map") : fields));
  }, [setupStep, screen]);
  useEffect(() => {
    if (screen !== "setup" || setupStep !== 0 || !settingEditorOpen || !phone) return;
    bodyRef.current?.scrollTo({ top: 0 });
    settingTitle.current?.focus({ preventScroll: true });
  }, [screen, setupStep, settingEditorOpen, phone]);
  useEffect(() => {
    if (screen !== "setup" || !phone || !chapterMenu) return;
    bodyRef.current?.scrollTo({ top: 0 });
    (mobileScene ? chapterLine : chapterTitle).current?.focus({ preventScroll: true });
  }, [screen, phone, chapterMenu, mobileScene]);
  useFoundingKeyboardOverlay(rootRef, screen === "setup");
  const mapUpload = useRef<HTMLInputElement>(null);
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
    Object.values(CONNECTION_SETUP_PROBLEMS).includes(setupProblem);
  useEffect(() => {
    if (focusedValidationAttempt.current === validationAttempt) return;
    if (setupStep === 0 && inlineProblem && !settingEditorOpen) {
      setSettingEditorOpen(true);
      return;
    }
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
  }, [
    setupProblem,
    inlineProblem,
    backgroundError,
    validationAttempt,
    setupStep,
    settingEditorOpen,
    setSettingEditorOpen,
  ]);
  if (screen === "setup") {
    const title = showTitle ? (
      <div className="villages-founding-title" inert={fading}>
        <div className="villages-founding-logo">
          <h1>Villages</h1>
          <svg className="mari-rgb-static-icon" viewBox="0 15 600 104" aria-hidden="true" focusable="false">
            <path
              fill="currentColor"
              d="M8 102
                    Q30 98 57 96 V85 L73 72 L90 86 V94 H106 V77 L126 60 L146 75 V91
                    H160 V66 L182 48 L203 66 V89 H217 V76 L233 64 H238 V55 H245 V67 L257 78 V88
                    H269 V65 L291 42 L310 62 V87 H328 V59 H340 V38 L350 25 L360 38 V59 H373 V87
                    H392 V81 H400 V69 H426 V76 H447 V92 H458 V84 L473 72 L488 85 V94 H501
                    C502 87 508 83 515 83 C522 83 528 88 529 95 H545 V85 L560 73 L576 86 V98
                    Q587 99 594 103 Q561 98 529 100 C487 101 445 108 399 112
                    C334 118 283 119 230 110 C152 97 81 94 8 102 Z"
            />
          </svg>
        </div>
        <button
          type="button"
          onClick={() => {
            if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) setArrival("fading");
            setSetupWorkspace((workspace) => ({
              ...workspace,
              settingIntroPending: "connections",
            }));
          }}
        >
          START
        </button>
      </div>
    ) : chooseConnections ? (
      <section
        className="villages-setting-dialogue villages-founding-connections"
        aria-labelledby="founding-models-title"
      >
        <h2 id="founding-models-title" tabIndex={-1} ref={connectionTitle}>
          Choose your models
        </h2>
        <AgentConnectionsControls connections={connections} kind="language" compact />
        <div className="villages-founding-menu-actions">
          <button
            type="button"
            onClick={() => setSetupWorkspace((workspace) => ({ ...workspace, settingIntroPending: true }))}
          >
            Back
          </button>
          <button
            type="button"
            className="villages-forging-primary"
            disabled={!!connections.setupProblem || !!draftSaveError}
            onClick={() => {
              setArrival(window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "greeting" : "turning");
              setSetupWorkspace((workspace) => ({
                ...workspace,
                settingIntroPending: undefined,
                settingBeat: "welcome",
              }));
            }}
          >
            Next
          </button>
        </div>
      </section>
    ) : turning ? (
      <span hidden />
    ) : null;
    const openConnectionPicker = () => {
      if (connectionPickerOpen) return;
      connections.refresh();
      setConnectionPickerOpen(true);
    };
    const openSettingEditor = () => {
      setSettingEditorOpen(true);
      if (!phone) requestAnimationFrame(() => settingTitle.current?.focus());
    };
    const changeStep = (step: number, openMenu = false) => {
      if (openMenu && step === 0) setSettingEditorOpen(true);
      if (phone && openMenu) {
        setSetupWorkspace((workspace) => ({ ...workspace, mobileMenu: CHAPTER_MENUS[step] }));
      }
      gotoSetupStep(step);
    };
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
    const nextReply = (
      <button
        type="button"
        className="villages-forging-primary villages-founding-next-reply"
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
          if (connectionSetupProblem) {
            openConnectionPicker();
            return;
          }
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
          if (setupStep === 0 && manualSetting && setupName.trim() && setupLocationName.trim() && setupSetting.trim()) {
            setSetupWorkspace((workspace) => ({ ...workspace, settingBeat: "world", settingEditorOpen: false }));
            bodyRef.current?.scrollTo({ top: 0 });
            return;
          }
          if (setupStep === 2 && !setupMapSrc) {
            requestAnimationFrame(() =>
              bodyRef.current?.querySelector<HTMLElement>(".villages-forging-map-warning")?.focus(),
            );
            return;
          }
          if (setupStep === 2 && setupIssues.length) {
            setSetupShowIssues(true);
            openIssue(setupIssues[0]);
            return;
          }
          if (setupStep === 3) void foundVillage();
          else changeStep(setupStep + 1);
        }}
      >
        {busy
          ? "Saving village…"
          : (phone && setupStep < 3) || (setupStep === 0 && manualSetting)
            ? "Next"
            : ["Let’s meet the villagers", "Let’s set up their homes", "Let’s look it over", "Found village"][
                setupStep
              ]}
      </button>
    );
    const guide =
      setupStep > 0 && (!phone || mobileScene) ? (
        <FoundingGuide
          scene
          lineRef={chapterLine}
          pose={setupStep === 1 ? "playful" : setupStep === 3 ? "happy" : "neutral"}
          replies={
            <>
              <button
                type="button"
                disabled={busy || spriteBusy || setupEditorOpen}
                onClick={() => {
                  if (!spriteWorking.current) changeStep(setupStep - 1);
                }}
              >
                Back
              </button>
              {phone ? (
                <button
                  type="button"
                  className="villages-forging-primary"
                  onClick={() => setSetupWorkspace((workspace) => ({ ...workspace, mobileMenu: chapterMenu }))}
                >
                  Next
                </button>
              ) : (
                nextReply
              )}
            </>
          }
        >
          {
            [
              "",
              "Time to cast the locals. The people you choose are already part of this community. Pick who you’ll play, then choose the neighbors and how they’ll look in Scenes. I promise the casting committee is just you.",
              "A Venue is a place on the map, and its Zones are the spots inside. Open a Venue to decide who can visit, who gets personal space, and where everyone sleeps. Yes, the couch counts.",
              "Take one last look at the map and where everyone sleeps. If you want anything happening as you arrive, add it under First day. A quiet morning is also legal, despite what certain neighbors will tell you.",
            ][setupStep]!
          }
        </FoundingGuide>
      ) : null;
    return (
      <div
        className={FOUNDING_ROOT}
        data-step={setupStep}
        data-lighting={storybookDaylight ? "day" : "night"}
        data-scene-arrival={enteringScene || undefined}
        data-title={showTitle || undefined}
        data-prelude={prelude || undefined}
        data-title-fading={fading || undefined}
        data-mari-turning={turning || undefined}
        aria-busy={fading || turning || undefined}
        ref={rootRef}
      >
        <ol className="villages-forging-steps" aria-label="Founding phases" role="list">
          {SETUP_STEPS.map((label, index) => (
            <li
              key={label}
              aria-label={label}
              aria-current={index === setupStep ? "step" : undefined}
              data-complete={index < setupStep || undefined}
              title={label}
            >
              <span aria-hidden="true" className="villages-founding-star">
                ✦
              </span>
              {index === setupStep ? (
                <span className="villages-founding-step-label" aria-hidden="true">
                  {label}
                </span>
              ) : null}
            </li>
          ))}
        </ol>
        {connectionPickerOpen ? (
          <FoundingDialog
            title="Model Connections"
            onClose={() => setConnectionPickerOpen(false)}
            dismissible={!connections.saving}
            showCloseButton={!connections.saving}
          >
            <div className="villages-founding-editor-body">
              <AgentConnectionsControls connections={connections} kind="language" compact />
            </div>
            <footer>
              <button type="button" disabled={connections.saving} onClick={() => setConnectionPickerOpen(false)}>
                Done
              </button>
            </footer>
          </FoundingDialog>
        ) : null}
        {setupStep === 2 && artSettingsOpen ? (
          <FoundingDialog title="Art settings" onClose={() => setArtSettingsOpen(false)}>
            <div className="villages-founding-editor-body">
              <SceneryStyleFields
                asButtons
                value={controller.sceneryStyle}
                profileId={controller.sceneryStyleProfileId}
                onChange={controller.setSceneryStyle}
                onProfileChange={controller.setSceneryStyleProfileId}
              />
              <AgentConnectionsControls connections={connections} kind="images" compact />
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
        <FoundingChapter
          step={setupStep}
          bodyRef={bodyRef}
          guide={guide}
          mobileScene={mobileScene}
          mobileMenuRef={setupStep === 3 ? null : chapterTitle}
        >
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
                      root
                        ?.querySelector<HTMLElement>(".villages-founding-sprites")
                        ?.scrollIntoView({ block: "nearest" });
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
              <section className="villages-forging-card villages-founding-sprites" aria-label="Resident appearance">
                {setupStep === 1 && activeSpriteId ? (
                  <Appearance
                    key={activeSpriteId}
                    host={host}
                    characterId={activeSpriteId}
                    name={wizardVillagers.find((person) => person.id === activeSpriteId)?.name ?? "Resident"}
                    portrait={portraits[activeSpriteId]}
                    selectedRevision={setupSpriteRevisions[activeSpriteId]}
                    onSave={spriteSaved}
                    onBusyChange={spriteBusyChanged}
                  />
                ) : (
                  <>
                    <h3>Appearance</h3>
                  </>
                )}
              </section>
            </div>
          </div>
          <div
            hidden={setupStep !== 0}
            className="villages-place-panels"
            data-editing={settingEditorOpen || undefined}
            data-intro={(beat !== "village" && !manualSetting) || undefined}
          >
            {setupStep === 0 && (!phone || !settingEditorOpen) ? (
              <FoundingSettingScene
                controller={controller}
                connectionProblem={connections.setupProblem}
                phone={phone}
                enteringScene={enteringScene}
                title={title}
                onConnections={openConnectionPicker}
                onEditSetting={openSettingEditor}
                onBeatChange={() => {
                  setArrival(undefined);
                  bodyRef.current?.scrollTo({ top: 0 });
                }}
                next={nextReply}
              />
            ) : null}
            <section className="villages-founding-setting villages-forging-card" aria-label="Your setting">
              <h2 tabIndex={-1} ref={settingTitle}>
                Your setting
              </h2>
              {phone && hasSettingDraft ? <p>Mari’s draft is ready to edit.</p> : null}
              <FoundingField
                title="Village name"
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
              <FoundingField
                title="First map name"
                error={
                  validatedFields.includes("location-name") && !setupLocationName.trim()
                    ? PLACE_ERRORS.locationName
                    : ""
                }
              >
                <input
                  autoComplete="off"
                  placeholder="e.g. The market district"
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
                title="What’s the first map area like?"
                error={validatedFields.includes("place-setting") && !setupSetting.trim() ? PLACE_ERRORS.setting : ""}
              >
                <textarea
                  autoComplete="off"
                  aria-label="Location description"
                  maxLength={snapshot?.settings.settingMaxLength ?? 4096}
                  rows={3}
                  value={setupSetting}
                  disabled={busy}
                  onChange={(event) => {
                    setSetupSetting(event.target.value);
                    clearFieldValidation("place-setting");
                  }}
                />
              </FoundingField>
              {phone ? (
                <div className="villages-founding-menu-actions">
                  <button
                    type="button"
                    onClick={() => {
                      if (manualSetting) {
                        setSetupWorkspace((workspace) => ({
                          ...workspace,
                          settingBeat: "welcome",
                          settingManual: undefined,
                          settingEditorOpen: false,
                        }));
                      } else setSettingEditorOpen(false);
                      bodyRef.current?.scrollTo({ top: 0 });
                      requestAnimationFrame(() => {
                        if (manualSetting)
                          bodyRef.current?.querySelector<HTMLButtonElement>(".villages-setting-guide button")?.focus();
                      });
                    }}
                  >
                    Back
                  </button>
                  {nextReply}
                </div>
              ) : null}
            </section>
          </div>
          {setupStep === 2 ? (
            <div className="villages-founding-places">
              {validatedFields.includes("map") && !setupMapSrc ? (
                <p role="alert" className="villages-forging-map-warning" tabIndex={-1}>
                  Upload or generate a map image before continuing.
                </p>
              ) : null}
              <QuickStartVenues
                venues={setupVenues}
                locationName={setupLocationName}
                onRetrySaving={() => void retrySetupSaving()}
                actions={
                  <QuickStartButton
                    busy={busy || setupSuggestionsBusy}
                    disabled={setupVenueBusy || !!setupMapRequest || !!pendingSetting}
                    pending={
                      !!setupWorkspace.suggestionRequest && !pendingSetting && !setupWorkspace.suggestionRequest.failure
                    }
                    failed={
                      !!setupWorkspace.suggestionRequest?.failure && !setupWorkspace.suggestionRequest.draftSetting
                    }
                    onGenerate={() => void suggestSetupVenues({ quickStart: true, separateHomes: true })}
                  />
                }
                mapArtwork={
                  <>
                    <button
                      type="button"
                      disabled={busy || setupVenueBusy || setupSuggestionsBusy || setupMapBusy || !!setupMapRequest}
                      onClick={() => setArtSettingsOpen(true)}
                    >
                      Art settings
                    </button>
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
                problemAction={
                  venueConnectionUnavailable ? (
                    <button type="button" onClick={openConnectionPicker}>
                      Check Model Connections
                    </button>
                  ) : undefined
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
              <h2 tabIndex={-1} ref={chapterTitle}>
                Review {setupName}
              </h2>
              <div className="villages-forging-columns">
                <div>
                  <section className="villages-forging-card">
                    <div className="villages-forging-card-heading">
                      <h3>People</h3>
                      <button type="button" onClick={() => changeStep(1, true)}>
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
                      <h3>Setting</h3>
                      <button type="button" onClick={() => changeStep(0, true)}>
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
                      <h3>First map · {setupLocationName}</h3>
                      <button type="button" onClick={() => changeStep(2, true)}>
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
                      <button type="button" onClick={() => changeStep(2, true)}>
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
          {setupProblem &&
          !inlineProblem &&
          !venueConnectionUnavailable &&
          !(setupStep === 2 && setupWorkspace.view === "details") ? (
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
                {draftNeedsReplacement ? "Replace unreadable draft" : "Retry saving draft"}
              </button>
            </div>
          ) : null}
          {settingsError ? <p role="alert">{settingsError}</p> : null}
          {phone && chapterMenu ? (
            <div className="villages-founding-menu-actions">
              <button
                type="button"
                disabled={busy || spriteBusy || setupEditorOpen}
                onClick={() => setSetupWorkspace((workspace) => ({ ...workspace, mobileMenu: undefined }))}
              >
                Back
              </button>
              {nextReply}
            </div>
          ) : null}
        </FoundingChapter>
      </div>
    );
  }
  return null;
}
