import { foundingVenueShapeProblem } from "../../../shared/helpers/founding-venues.js";
import { simpleFoundingMap } from "./simple-map.js";
import { foundingHomeMembers, selectFoundingHomes } from "./founding-homes.js";
import { useConfirmation } from "../../shared/confirmation.js";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode, type Ref } from "react";
import { CardFlipSprite } from "../../shared/CardFlipSprite.js";
import { CONNECTION_SETUP_PROBLEMS, ELEMENT_TAG } from "../../shared/constants.js";
import { useLetterFont } from "../../shared/letter-font-css.js";
import type { MobileMapView } from "../exploration/MapStage.js";
import { defaultView, MapStage } from "../exploration/MapStage.js";
import { AgentConnectionsControls, useAgentConnections } from "../settings/AgentConnections.js";
import { VillageIcon } from "../../shared/VillageIcon.js";
import { Appearance } from "../residents/Appearance.js";
import { FoundingPagination } from "./FoundingPagination.js";
import { LoreActivitySlot } from "../../shared/LoreActivity.js";
import { FoundingDialog } from "./FoundingDialog.js";
import {
  FOUNDING_CIRCUMSTANCE_MAX_LENGTH,
  foundingCircumstanceText,
  foundingCircumstanceFromText,
} from "../../../shared/helpers/founding-circumstance.js";
import { FoundingField } from "./FoundingField.js";
import { FoundingGuide, foundingMariSprite } from "./FoundingGuide.js";
import { FoundingHierarchy } from "./FoundingHierarchy.js";
import { FoundingSettingScene, settingBeat } from "./FoundingSettingScene.js";
import { FoundingPersonaSelector, FoundingVillagerPicker } from "./FoundingPanels.js";
import { FOUNDING_STEP, SETUP_STEPS } from "./founding-steps.js";
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
  brief: "Tell Mari a little about your Village.",
  locationName: "Name the starting location.",
  setting: "Describe the starting location.",
};
const FOUNDING_ROOT = `${ELEMENT_TAG}-root ${ELEMENT_TAG}-home ${ELEMENT_TAG}-setup-root villages-forging-v2`;
const PHONE_LAYOUT = "(max-width:727px)";
const CHAPTER_MENUS = [undefined, "people", "maps", "venues", "review"] as const;

function FoundingChapter({
  step,
  explanation,
  mobileScene,
  mobileTitle,
  mobileHeader,
  mobileReplies,
  onCloseMenu,
  guide,
  bodyRef,
  children,
}: {
  step: number;
  explanation: boolean;
  mobileScene: boolean;
  mobileTitle?: string;
  mobileHeader?: ReactNode;
  mobileReplies: ReactNode;
  onCloseMenu(): void;
  guide: ReactNode;
  bodyRef: Ref<HTMLElement>;
  children: ReactNode;
}) {
  const body = (
    <main className="villages-forging-body" data-step={step} ref={bodyRef}>
      {children}
    </main>
  );
  return (
    <div
      className="villages-founding-chapter"
      data-guided={step > 0 || undefined}
      data-explanation={explanation || undefined}
    >
      {guide}
      {explanation ? null : mobileTitle ? (
        mobileScene ? null : (
          <FoundingDialog
            title={mobileTitle}
            headerContent={mobileHeader}
            className={`villages-chapter-menu${step === FOUNDING_STEP.Venues ? " villages-chapter-map" : ""}`}
            headerless={step === FOUNDING_STEP.Venues}
            scrollBody
            onClose={onCloseMenu}
          >
            {body}
            <footer className="villages-founding-menu-actions">{mobileReplies}</footer>
          </FoundingDialog>
        )
      ) : (
        body
      )}
    </div>
  );
}

type FoundingScreenProps = {
  controller: FoundingScreenController;
  storybookDaylight: boolean;
  appearanceControl?: ReactNode;
};
export function FoundingScreen({ controller, storybookDaylight, appearanceControl }: FoundingScreenProps) {
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
    (setupStep === FOUNDING_STEP.Venues && !setupWorkspace.suggestionRequest?.draftSetting
      ? setupWorkspace.suggestionRequest?.failure
      : "") ||
    "";
  const venueConnectionUnavailable =
    setupStep === FOUNDING_STEP.Venues && /^Language model connection not found(?::|\.?$)/iu.test(rawSetupProblem);
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
  const [starterIntro, setStarterIntro] = useState(false);
  const explainingStarters = setupStep === FOUNDING_STEP.Maps && starterIntro && !draftSaveError;
  const confirmStarterHomes = useConfirmation(setupVenues);
  const mobileScene =
    phone && !!chapterMenu && (explainingStarters || setupWorkspace.mobileMenu !== chapterMenu) && !draftSaveError;
  const beat = settingBeat(setupWorkspace);
  const [settingExpression, setSettingExpression] = useState<Parameters<typeof foundingMariSprite>[0]>("wave");
  const [arrival, setArrival] = useState<"fading" | "turning" | "greeting">();
  const fading = arrival === "fading";
  const turning = arrival === "turning";
  const enteringScene = arrival === "greeting" && setupStep === FOUNDING_STEP.Setting && beat === "welcome";
  const showTitle =
    fading ||
    (setupStep === FOUNDING_STEP.Setting &&
      beat === "welcome" &&
      setupWorkspace.settingBeat === undefined &&
      setupWorkspace.settingIntroPending === true &&
      !draftSaveError);
  const chooseConnections =
    setupStep === FOUNDING_STEP.Setting && setupWorkspace.settingIntroPending === "connections" && !fading;
  const prelude = showTitle || chooseConnections || turning;
  const desktopMap =
    !phone && !explainingStarters && (setupStep === FOUNDING_STEP.Maps || setupStep === FOUNDING_STEP.Venues);
  const hierarchyLayer =
    desktopMap || (phone && setupStep === FOUNDING_STEP.Venues && !mobileScene)
      ? undefined
      : explainingStarters
        ? "Venue"
        : setupStep === FOUNDING_STEP.Setting && !prelude && beat !== "welcome"
          ? beat === "village-overview"
            ? "Village"
            : beat === "village"
              ? "Map"
              : "World"
          : setupStep === FOUNDING_STEP.Maps
            ? "Map"
            : setupStep === FOUNDING_STEP.Venues
              ? "Venue"
              : undefined;
  const mariPose =
    prelude && !turning
      ? "looking-up"
      : setupStep === FOUNDING_STEP.Setting
        ? settingExpression
        : explainingStarters
          ? "presenting"
          : setupStep === FOUNDING_STEP.People
            ? "happy"
            : setupStep === FOUNDING_STEP.Review
              ? "proud"
              : "playful";
  const mariFacing = mariPose === "happy-side" ? "left" : mariPose === "looking-up" ? "right" : "front";
  const mariFlipEnabled = snapshot?.settings.spriteCardFlipEnabled !== false;
  useEffect(() => {
    if (!fading && !turning) return;
    const timer = window.setTimeout(() => setArrival(fading ? undefined : "greeting"), fading ? 350 : 500);
    return () => window.clearTimeout(timer);
  }, [fading, turning]);
  const hasSettingDraft = !!setupWorkspace.settingDraft;
  const settingEditorOpen =
    setupWorkspace.settingEditorOpen ??
    (beat === "village" &&
      hasSettingDraft &&
      !setupWorkspace.suggestionRequest?.draftSetting &&
      !setupWorkspace.settingProblem);
  const setSettingEditorOpen = useCallback(
    (open: boolean) =>
      setSetupWorkspace((workspace) =>
        workspace.settingEditorOpen === open ? workspace : { ...workspace, settingEditorOpen: open },
      ),
    [setSetupWorkspace],
  );
  const [artSettingsOpen, setArtSettingsOpen] = useState(false);
  const [reviewPage, setReviewPage] = useState(0);
  useLetterFont(screen === "setup" ? "lora" : undefined);
  const [openVenueFromMap, setOpenVenueFromMap] = useState<{ id: string }>();
  const reviewIndex = Math.min(reviewPage, Math.max(0, Math.ceil(setupVenues.length / 3) - 1));
  const rootRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLElement>(null);
  const mariMoveFrom = useRef<{ element: HTMLElement; bounds: DOMRect }[]>([]);
  const rememberMariPosition = () => {
    if (phone) return;
    mariMoveFrom.current = Array.from(
      rootRef.current?.querySelectorAll<HTMLElement>(".villages-setting-stage") ?? [],
      (element) => ({ element, bounds: element.getBoundingClientRect() }),
    );
  };
  useLayoutEffect(() => {
    const previous = mariMoveFrom.current;
    mariMoveFrom.current = [];
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (phone || !previous.length || motion.matches) return;
    const animations = previous.flatMap(({ element, bounds }) => {
      if (!element.isConnected || !bounds.width || !bounds.height) return [];
      const target = element.getBoundingClientRect();
      if (!target.width || !target.height) return [];
      return element.animate(
        [
          {
            transform: `translate(${bounds.x - target.x}px, ${bounds.y - target.y}px) scale(${bounds.width / target.width}, ${bounds.height / target.height})`,
            transformOrigin: "top left",
          },
          { transform: "none", transformOrigin: "top left" },
        ],
        { duration: 220, easing: "ease" },
      );
    });
    const dialogue = rootRef.current?.querySelector<HTMLElement>(".villages-chapter-guide");
    if (dialogue)
      animations.push(
        dialogue.animate([{ visibility: "hidden" }, { visibility: "visible" }], {
          duration: 0,
          delay: 220,
          fill: "backwards",
        }),
      );
    if (desktopMap && bodyRef.current) {
      animations.push(
        bodyRef.current.animate(
          [
            { opacity: 0, visibility: "hidden" },
            { opacity: 1, visibility: "visible" },
          ],
          { duration: 180, delay: 220, easing: "ease-out", fill: "backwards" },
        ),
      );
    }
    const stop = () => animations.forEach((animation) => animation.cancel());
    motion.addEventListener("change", stop);
    return () => {
      stop();
      motion.removeEventListener("change", stop);
    };
  }, [desktopMap, phone]);
  const connectionGate = useRef<HTMLElement>(null);
  const chapterLine = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (chooseConnections) connectionGate.current?.focus({ preventScroll: true });
  }, [chooseConnections]);
  useEffect(() => {
    rootRef.current?.scrollTo({ top: 0 });
    bodyRef.current?.parentElement?.scrollTo({ top: 0 });
    bodyRef.current?.scrollTo({ top: 0 });
    setValidatedFields((fields) => (fields.includes("map") ? fields.filter((field) => field !== "map") : fields));
  }, [setupStep, screen]);
  useEffect(() => {
    if (screen === "setup" && (mobileScene || explainingStarters)) chapterLine.current?.focus({ preventScroll: true });
  }, [screen, phone, chapterMenu, mobileScene, explainingStarters]);
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
      setupStep < FOUNDING_STEP.Maps ||
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
  const villageNameError = validatedFields.includes("place-name") && !setupName.trim();
  const villageBrief = setupWorkspace.settingBrief?.trim();
  const villageBriefError = validatedFields.includes("village-brief") && !villageBrief ? PLACE_ERRORS.brief : "";
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
    if (setupStep === FOUNDING_STEP.Setting && beat !== "village-overview" && inlineProblem && !settingEditorOpen) {
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
      if (!phone) target?.focus({ preventScroll: true });
      target?.scrollIntoView({ block: "center" });
    });
    return () => cancelAnimationFrame(frame);
  }, [
    setupProblem,
    inlineProblem,
    backgroundError,
    validationAttempt,
    setupStep,
    beat,
    settingEditorOpen,
    setSettingEditorOpen,
    phone,
  ]);
  if (screen === "setup") {
    const connectionPrompt = (
      <>
        <AgentConnectionsControls connections={connections} kind="founding" compact />
        {appearanceControl}
        <button
          type="button"
          className="villages-forging-primary"
          disabled={!!connections.setupProblem || !!draftSaveError}
          onClick={() => {
            const turn = mariFlipEnabled && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            setArrival(turn ? "turning" : "greeting");
            setSetupWorkspace((workspace) => ({
              ...workspace,
              settingIntroPending: undefined,
              settingBeat: "welcome",
            }));
          }}
        >
          Next
        </button>
      </>
    );
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
    ) : chooseConnections && !phone ? (
      <section
        className="villages-founding-connections"
        aria-label="Choose your models"
        tabIndex={-1}
        ref={connectionGate}
      >
        {connectionPrompt}
      </section>
    ) : turning || chooseConnections ? (
      <span hidden />
    ) : null;
    const openConnectionPicker = () => {
      if (connectionPickerOpen) return;
      connections.refresh();
      setConnectionPickerOpen(true);
    };
    const modelButton = (
      <button
        type="button"
        className="villages-founding-models"
        aria-label={setupStep === FOUNDING_STEP.Maps ? "Art settings" : "Model Connections"}
        title={setupStep === FOUNDING_STEP.Maps ? "Art settings" : "Model Connections"}
        aria-haspopup="dialog"
        disabled={
          setupStep === FOUNDING_STEP.Maps &&
          (busy || setupVenueBusy || setupSuggestionsBusy || setupMapBusy || !!setupMapRequest)
        }
        onClick={() => {
          if (setupStep === FOUNDING_STEP.Maps) {
            connections.refresh();
            setArtSettingsOpen(true);
          } else openConnectionPicker();
        }}
      >
        <VillageIcon name="settings" />
      </button>
    );
    const openSettingEditor = () => setSettingEditorOpen(true);
    const changeStep = (step: number, openMenu = false) => {
      rememberMariPosition();
      setSetupFocusIssue(null);
      setStarterIntro(step === FOUNDING_STEP.Maps && setupStep === FOUNDING_STEP.People && !openMenu);
      if (openMenu && step === FOUNDING_STEP.Setting) setSettingEditorOpen(true);
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
    const selectedPin = setupVenues.find((venue) => venue.id === selectedSetupVenueId) ?? setupVenues[0];
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
    const venueShapeProblem = foundingVenueShapeProblem(setupVenues);
    const standardHomes = setupVenues.every(
      (venue) => !venue.classes?.includes("residence") || foundingHomeMembers(venue).length === 1,
    );
    const missingSharedVenue =
      standardHomes && setupVenues.filter((venue) => !venue.classes?.includes("residence")).length < 2;
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
            pins={(setupStep === FOUNDING_STEP.Maps ? [] : draftPins).map((pin) => ({
              ...pin,
              selected: (phone ? selectedPin?.id : selectedSetupVenueId) === pin.id,
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
              !phone &&
              interactive &&
              !!nextPin &&
              mapReady &&
              !setupEditorOpen &&
              !setupSuggestionsBusy &&
              !setupVenueBusy
            }
            view={defaultView("contain")}
            shape={setupMapShape}
            onPlace={!phone && interactive ? (x, y, size) => placeSetupPin(x, y, size, nextPin?.id) : undefined}
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
            keyboardPlacementId={
              !phone && interactive ? (nextPin?.id ?? selectedSetupVenueId ?? setupVenues[0]?.id) : undefined
            }
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
      const actors = [
        { id: "player", name: "Your" },
        ...ids.map((id) => ({
          id,
          name: catalog?.find((person) => person.id === id)?.name ?? "Villager",
        })),
      ];
      if (standardHomes) {
        const homes = selectFoundingHomes(
          setupVenues,
          setupWorkspace.unusedHomes ?? [],
          actors,
          setupContext.openingVenueId,
        );
        setSetupVenues(arrangeQuickStartVenues(homes.venues));
        setSetupWorkspace((workspace) => ({ ...workspace, unusedHomes: homes.unusedHomes }));
      }
      setSetupFoundingVillagerIds(ids);
      setSetupMapReviewed(false);
      setSetupProblem("");
    };
    const replaceLegacyHomes = async () => {
      const id = setupContext.openingVenueId;
      const retained = setupVenues.filter((venue) => !venue.classes?.includes("residence"));
      if (
        !(await confirmStarterHomes(
          "Replace the old Residences and their room details and artwork with one starter home per resident?",
          { cancel: "Cancel", confirm: "Replace Residences" },
        ))
      )
        return;
      const homes = selectFoundingHomes(
        retained,
        setupWorkspace.unusedHomes ?? [],
        [{ id: "player", name: "Your" }, ...wizardVillagers],
        id,
      );
      const replacedIds = new Set(setupVenues.filter((venue) => !retained.includes(venue)).map((venue) => venue.id));
      setSetupContext((context) => ({
        ...context,
        circumstances: context.circumstances.filter((row) => row.scope !== "zone" || !replacedIds.has(row.venueId)),
      }));
      setSetupVenues(arrangeQuickStartVenues(homes.venues));
      setSetupWorkspace((workspace) => ({ ...workspace, unusedHomes: homes.unusedHomes }));
      setSelectedSetupVenueId(null);
      setSetupFocusIssue(null);
      setSetupMapReviewed(false);
      setSetupProblem("");
    };
    const chapterDisabled = busy || setupEditorOpen || setupSuggestionsBusy || setupVenueBusy || !!draftSaveError;
    const advanceDisabled =
      chapterDisabled || (setupStep === FOUNDING_STEP.Maps && (setupMapBusy || !!setupMapRequest));
    const validateVillage = () => {
      const problem = !setupName.trim() ? PLACE_ERRORS.name : !villageBrief ? PLACE_ERRORS.brief : "";
      if (!problem) return true;
      setValidatedFields((fields) => [...new Set([...fields, "place-name", "village-brief"])]);
      setValidationAttempt((attempt) => attempt + 1);
      setSetupProblem(problem);
      return false;
    };
    const advanceSetup = () => {
      if (connectionSetupProblem) {
        openConnectionPicker();
        return;
      }
      if (setupStep === FOUNDING_STEP.Setting && beat === "village" && !validateVillage()) {
        setSetupWorkspace((workspace) => ({ ...workspace, settingBeat: "village-overview", settingEditorOpen: false }));
        bodyRef.current?.scrollTo({ top: 0 });
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
          ...(setupStep === FOUNDING_STEP.Maps ? ["map"] : []),
          ...(setupStep >= FOUNDING_STEP.People
            ? ["persona", "playerBackground", "villagers", ...setupFoundingVillagerIds.map((id) => "backstory:" + id)]
            : []),
        ]),
      ]);
      if (setupStep === FOUNDING_STEP.Maps && !setupMapSrc) {
        requestAnimationFrame(() =>
          bodyRef.current?.querySelector<HTMLElement>(".villages-forging-map-warning")?.focus(),
        );
        return;
      }
      if (setupStep === FOUNDING_STEP.Venues && venueShapeProblem) {
        setSetupProblem(venueShapeProblem);
        return;
      }
      if (setupStep === FOUNDING_STEP.Venues && setupIssues.length) {
        setSetupShowIssues(true);
        openIssue(setupIssues[0]);
        return;
      }
      if (setupStep === FOUNDING_STEP.Review) void foundVillage();
      else changeStep(setupStep + 1, setupStep === FOUNDING_STEP.Maps);
    };
    const nextReply = (
      <button
        type="button"
        className="villages-forging-primary villages-founding-next-reply"
        data-reader-direction="next"
        disabled={advanceDisabled}
        onClick={advanceSetup}
      >
        {busy ? "Saving village…" : setupStep === FOUNDING_STEP.Review ? "Found village" : "Next"}
      </button>
    );
    const villageNameField = (
      <FoundingField title="Village name" error={villageNameError ? PLACE_ERRORS.name : ""}>
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
    );
    const settingFields = (
      <>
        <FoundingField
          title="First map name"
          error={
            validatedFields.includes("location-name") && !setupLocationName.trim() ? PLACE_ERRORS.locationName : ""
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
      </>
    );
    const closeChapterMenu = () => setSetupWorkspace((workspace) => ({ ...workspace, mobileMenu: undefined }));
    const canCloseChapterMenu = !busy && !setupEditorOpen;
    const guide =
      setupStep > FOUNDING_STEP.Setting ? (
        <FoundingGuide
          scene
          inactive={phone && !mobileScene}
          lineRef={chapterLine}
          replies={
            <>
              <button
                type="button"
                data-reader-direction="back"
                disabled={busy || setupEditorOpen}
                onClick={() => {
                  changeStep(setupStep - 1, explainingStarters);
                }}
              >
                Back
              </button>
              {phone || explainingStarters ? (
                <button
                  type="button"
                  className="villages-forging-primary"
                  data-reader-direction="next"
                  disabled={chapterDisabled}
                  onClick={() => {
                    rememberMariPosition();
                    setStarterIntro(false);
                    if (phone) setSetupWorkspace((workspace) => ({ ...workspace, mobileMenu: chapterMenu }));
                  }}
                >
                  Next
                </button>
              ) : (
                nextReply
              )}
            </>
          }
        >
          {explainingStarters
            ? "A new Village starts with 2 public locations, and each of you gets a home with two rooms to start. Don't worry, you can cram everyone into the same house later if you want to. I won't judge."
            : [
                "",
                "Choose who you’ll play and who lives here. I recommend making sure your Villagers have Sprites assigned to their Character Card, otherwise they’ll spend every Scene doing their best impression of a passport photo.",
                desktopMap
                  ? "Let’s give our first Map a face. Upload an image you have, or generate one here."
                  : "Let’s give our first Map a face. Upload an image you have, or generate one here. Then we can put the places on it.",
                "Here are your starting Venues. You can give them names and place them on the Map.",
                "One last look. Check the Map and everyone’s bed. For an event on arrival, add it under First day. A quiet morning works too.",
              ][setupStep]!}
        </FoundingGuide>
      ) : null;
    return (
      <div
        data-mobile={phone ? "true" : "false"}
        className={FOUNDING_ROOT}
        data-step={setupStep}
        data-desktop-map={desktopMap || undefined}
        data-lighting={storybookDaylight ? "day" : "night"}
        data-scene-arrival={enteringScene || undefined}
        data-title={showTitle || undefined}
        data-prelude={prelude || undefined}
        data-title-fading={fading || undefined}
        data-mari-turning={turning || undefined}
        aria-busy={fading || turning || undefined}
        ref={rootRef}
      >
        <div className="villages-founding-lore">
          <LoreActivitySlot />
        </div>
        <div className="villages-setting-stage" aria-hidden="true">
          <CardFlipSprite
            url={foundingMariSprite(mariPose)}
            facing={mariFacing}
            mirrored={mariFacing === "left"}
            view={mariFacing === "front" ? "front" : "side"}
            framing="full"
            enabled={mariFlipEnabled}
            animate
            stepKey={mariPose}
            transformOrigin="var(--shoe-center, 50%) bottom"
          />
        </div>
        {hierarchyLayer ? <FoundingHierarchy current={hierarchyLayer} /> : null}
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
        {!prelude && (!phone || (!settingEditorOpen && (!chapterMenu || mobileScene))) ? modelButton : null}
        {connectionPickerOpen ? (
          <FoundingDialog title="Model Connections" onClose={() => setConnectionPickerOpen(false)}>
            <div className="villages-founding-editor-body">
              <AgentConnectionsControls connections={connections} kind="founding" compact />
              {appearanceControl}
            </div>
            <footer>
              <button type="button" disabled={connections.saving} onClick={() => setConnectionPickerOpen(false)}>
                Back
              </button>
            </footer>
          </FoundingDialog>
        ) : null}
        {setupStep === FOUNDING_STEP.Maps && artSettingsOpen ? (
          <FoundingDialog title="Art settings" onClose={() => setArtSettingsOpen(false)}>
            <div className="villages-founding-editor-body">
              <AgentConnectionsControls connections={connections} kind="images" compact />
              {appearanceControl}
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
              <button type="button" disabled={connections.saving} onClick={() => setArtSettingsOpen(false)}>
                Back
              </button>
            </footer>
          </FoundingDialog>
        ) : null}
        {phone && chooseConnections ? (
          <FoundingDialog
            title="Choose your models"
            onClose={() => setSetupWorkspace((workspace) => ({ ...workspace, settingIntroPending: true }))}
          >
            {connectionPrompt}
          </FoundingDialog>
        ) : null}
        <FoundingChapter
          step={setupStep}
          explanation={explainingStarters}
          bodyRef={bodyRef}
          guide={guide}
          mobileScene={mobileScene}
          mobileTitle={phone && chapterMenu ? SETUP_STEPS[setupStep] : undefined}
          mobileHeader={
            <>
              <h3>{SETUP_STEPS[setupStep]}</h3>
              {modelButton}
            </>
          }
          mobileReplies={
            <>
              <button
                type="button"
                disabled={!canCloseChapterMenu}
                onClick={() => {
                  if (setupStep === FOUNDING_STEP.Maps || setupStep === FOUNDING_STEP.Venues)
                    changeStep(setupStep - 1, true);
                  else closeChapterMenu();
                }}
              >
                Back
              </button>
              {nextReply}
            </>
          }
          onCloseMenu={closeChapterMenu}
        >
          <div hidden={setupStep !== FOUNDING_STEP.People}>
            <div className="villages-people-panel">
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
                  appearance={(id) =>
                    setupStep === FOUNDING_STEP.People ? (
                      <Appearance
                        key={id}
                        characterId={id}
                        name={wizardVillagers.find((person) => person.id === id)?.name ?? "Resident"}
                      />
                    ) : null
                  }
                  catalog={catalog}
                  portraits={portraits}
                  selectedIds={setupFoundingVillagerIds}
                  onChange={chooseRoster}
                  disabled={busy}
                />
              </section>
            </div>
          </div>
          <div hidden={setupStep !== FOUNDING_STEP.Setting} className="villages-place-panels">
            {setupStep === FOUNDING_STEP.Setting ? (
              <FoundingSettingScene
                controller={controller}
                connectionProblem={connections.setupProblem}
                phone={phone}
                editorOpen={settingEditorOpen && !prelude}
                enteringScene={enteringScene}
                title={title}
                villageNameField={villageNameField}
                villageInvalid={villageNameError || !!villageBriefError}
                villageBriefError={villageBriefError}
                mapFields={settingFields}
                mapEditorHeader={
                  <>
                    <h3>Your first Map</h3>
                    {modelButton}
                  </>
                }
                onValidateVillage={validateVillage}
                onEditSetting={openSettingEditor}
                onBeatChange={() => {
                  setArrival(undefined);
                  bodyRef.current?.scrollTo({ top: 0 });
                }}
                onExpressionChange={setSettingExpression}
                next={nextReply}
              />
            ) : null}
          </div>
          {setupStep === FOUNDING_STEP.Maps ? (
            <section
              className="villages-forging-card villages-quick-map-panel villages-founding-map-artwork"
              aria-label="Map artwork"
            >
              <div className="villages-quick-map-toolbar">
                <h2>{setupLocationName || "Your first Map"}</h2>
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
              </div>
              {validatedFields.includes("map") && !setupMapSrc ? (
                <p role="alert" className="villages-forging-map-warning" tabIndex={-1}>
                  Upload or generate a map image before continuing.
                </p>
              ) : null}
              {!setupMapSrc && setupMapProblem ? (
                <p className={`${ELEMENT_TAG}-error`} role="alert">
                  {setupMapProblem}
                </p>
              ) : null}
              {setupMapSrc ? (
                <section className="villages-quick-map" aria-label="Map artwork preview">
                  {map(false)}
                </section>
              ) : (
                <p>Upload or generate your first Map.</p>
              )}
            </section>
          ) : null}
          {setupStep === FOUNDING_STEP.Venues ? (
            <div className="villages-founding-places">
              <QuickStartVenues
                daylight={storybookDaylight}
                mobile={phone}
                inlineVenue={desktopMap || phone}
                venues={setupVenues}
                locationName={setupLocationName}
                onRetrySaving={() => void retrySetupSaving()}
                actions={
                  <>
                    {phone ? modelButton : null}
                    <QuickStartButton
                      busy={busy || setupSuggestionsBusy}
                      disabled={setupVenueBusy || !!setupMapRequest || !!pendingSetting}
                      pending={
                        !!setupWorkspace.suggestionRequest &&
                        !pendingSetting &&
                        !setupWorkspace.suggestionRequest.failure
                      }
                      failed={
                        !!setupWorkspace.suggestionRequest?.failure && !setupWorkspace.suggestionRequest.draftSetting
                      }
                      onGenerate={() => void suggestSetupVenues({ quickStart: true, separateHomes: true })}
                    />
                  </>
                }
                people={wizardVillagers}
                selectedId={selectedSetupVenueId}
                busy={setupSuggestionsBusy}
                imageBusy={setupVenueBusy || setupSuggestionsBusy}
                focusIssue={setupFocusIssue}
                saveError={draftSaveError || undefined}
                problem={setupProblem || venueShapeProblem}
                problemAction={
                  venueShapeProblem && (missingSharedVenue || !standardHomes) ? (
                    <button
                      type="button"
                      disabled={
                        busy ||
                        !!draftSaveError ||
                        setupVenueBusy ||
                        setupSuggestionsBusy ||
                        (!!setupWorkspace.suggestionRequest && !setupWorkspace.suggestionRequest.failure)
                      }
                      onClick={() =>
                        missingSharedVenue ? chooseRoster(setupFoundingVillagerIds) : void replaceLegacyHomes()
                      }
                    >
                      {missingSharedVenue ? "Add shared Venue" : "Use starter homes"}
                    </button>
                  ) : venueConnectionUnavailable ? (
                    <button type="button" onClick={openConnectionPicker}>
                      Check Model Connections
                    </button>
                  ) : undefined
                }
                map={
                  <>
                    {map(true)}
                    {setupPlacementError ? <p role="alert">{setupPlacementError}</p> : null}
                  </>
                }
                onSelect={(venue) => {
                  setSelectedSetupVenueId(venue.id);
                  setSetupFocusIssue(null);
                  setMovingSetupVenueId(null);
                  setSetupWorkspace((state) => ({ ...state, paused: true, view: "details" }));
                }}
                onPatch={(venue) => patchSetupVenue(venue.id, () => venue)}
                openFromMap={openVenueFromMap}
                onMapOpened={() => setOpenVenueFromMap(undefined)}
                onGenerateImage={(venue, area, zoneId) => void generateSetupImage(venue, area, zoneId)}
                onUploadImage={(venue, area, file, zoneId) => void uploadSetupImage(venue, area, file, zoneId)}
              />
            </div>
          ) : null}
          {setupStep === FOUNDING_STEP.Review ? (
            <>
              {!phone ? <h2>Review {setupName}</h2> : null}
              <div className="villages-forging-columns">
                <div>
                  <section className="villages-forging-card">
                    <div className="villages-forging-card-heading">
                      <h3>People</h3>
                      <button type="button" onClick={() => changeStep(FOUNDING_STEP.People, true)}>
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
                      <button type="button" onClick={() => changeStep(FOUNDING_STEP.Setting, true)}>
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
                      <button type="button" onClick={() => changeStep(FOUNDING_STEP.Maps, true)}>
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
                      <button type="button" onClick={() => changeStep(FOUNDING_STEP.Venues, true)}>
                        Change starting Venues
                      </button>
                    </div>
                    {setupVenues.slice(reviewIndex * 3, reviewIndex * 3 + 3).map((venue, index) => (
                      <details key={venue.id}>
                        <summary>
                          {index + 1}. {venue.name} · {venue.form} · Exterior
                          {venueHasCommon(venue) ? " / Common" : ""}
                          {venueHasPrivate(venue) ? " / Private" : ""}
                        </summary>
                        <p>{venue.description}</p>
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
                  <p>Prepare local routines and optional initial Wishes, then meet in one of your public locations.</p>
                </section>
              </div>
            </>
          ) : null}
          {setupProblem &&
          !inlineProblem &&
          !venueConnectionUnavailable &&
          !(setupStep === FOUNDING_STEP.Venues && setupWorkspace.view === "details") ? (
            <p className={`${ELEMENT_TAG}-error`} role="alert">
              {setupProblem}
            </p>
          ) : null}
          {setupMapProblem && setupStep !== FOUNDING_STEP.Maps && setupStep !== FOUNDING_STEP.Review ? (
            <p className={`${ELEMENT_TAG}-error`} role="alert">
              {setupMapProblem}
            </p>
          ) : null}
          {setupMapRequest?.phase === "paused" && setupStep !== FOUNDING_STEP.Maps ? (
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
        </FoundingChapter>
      </div>
    );
  }
  return null;
}
