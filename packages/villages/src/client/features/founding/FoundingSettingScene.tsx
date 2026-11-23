import { FOUNDING_SETTING_BRIEF_LIMIT } from "../../../shared/contracts/founding.js";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { FoundingDialog } from "./FoundingDialog.js";
import { FoundingField } from "./FoundingField.js";
import { type foundingMariSprite } from "./FoundingGuide.js";
import { FoundingReader } from "./FoundingReader.js";
import { VillageLorebookPicker } from "./FoundingPanels.js";
import type { FoundingScreenController } from "./screen-contracts.js";

type SettingBeat = NonNullable<FoundingScreenController["setupWorkspace"]["settingBeat"]>;
const worldQuestion = "What World does your Village take place in?";
const script: Record<SettingBeat, readonly string[]> = {
  welcome: [
    "Oh, hello! I’m Mari. I was hoping you’d stop by.",
    "Welcome to Villages. Come on over. The view’s good from here.",
    "You’ll make a life with a community here. That could mean a dockside town, a spaceship crew, or six neighbors with one catastrophically shared laundry room.",
    "Let’s give your people a place to call home. I’ll walk you through the World, your Village, and your first Map.",
  ],
  "world-overview": [
    "See these five layers? We’ll start at the top and work our way down. I promise there’s no quiz.",
    "The World is the big backdrop. If your Village belongs to a world you already know, tell me enough to get my bearings. You can leave it open if you’re still deciding.",
  ],
  world: [`${worldQuestion} One sentence will do. If you haven’t decided, we can leave the horizon blurry.`],
  lorebooks: [
    "Got Lorebooks? I’ll look up people and customs when I draft your setting. Villages can keep using those books for Scenes, new places, and daily routines.",
    "Which Lorebooks should I have on my desk?",
  ],
  "village-overview": [
    "The Village is your whole community and the places it calls home. That’s the big picture. We’ll spend most of our time in the places on its Maps.",
    "What should we call your Village? Give me a name and a little about the community. What’s a regular Tuesday like there?",
  ],
  village: [
    "A Map is where we actually play. It’s how you get to the places your community uses.",
    "Each Map covers one locale. It might be a ship’s deck, a forest clearing, or an entire planet. You can add more Maps when you need them.",
    "Where should your first Map take us? Give that spot a name and tell me what we’d see when we get there.",
  ],
};
const expressions = {
  welcome: ["wave", "happy", "happy", "neutral"],
  "world-overview": ["presenting", "presenting"],
  world: ["thoughtful"],
  lorebooks: ["thoughtful", "happy"],
  "village-overview": ["presenting", "neutral"],
  village: ["happy-side", "happy-side", "presenting"],
} as const;
export function settingBeat(workspace: FoundingScreenController["setupWorkspace"]): SettingBeat {
  return workspace.settingBeat ?? (workspace.suggestionRequest?.draftSetting ? "village" : "welcome");
}

export function FoundingSettingScene({
  controller,
  connectionProblem,
  phone,
  editorOpen,
  enteringScene,
  title,
  villageNameField,
  villageInvalid,
  villageBriefError,
  mapFields,
  mapEditorHeader,
  onValidateVillage,
  onEditSetting,
  onBeatChange,
  onExpressionChange,
  next,
}: {
  controller: FoundingScreenController;
  connectionProblem: string;
  phone: boolean;
  editorOpen: boolean;
  enteringScene: boolean;
  title: ReactNode;
  villageNameField: ReactNode;
  villageInvalid: boolean;
  villageBriefError: string;
  mapFields: ReactNode;
  mapEditorHeader: ReactNode;
  onValidateVillage(): boolean;
  onEditSetting(): void;
  onBeatChange(): void;
  onExpressionChange(pose: Parameters<typeof foundingMariSprite>[0]): void;
  next: ReactNode;
}) {
  const { setupWorkspace, setSetupWorkspace, setupSuggestionsBusy, draftSetupSetting } = controller;
  const beat = settingBeat(setupWorkspace);
  const [confirmReplace, setConfirmReplace] = useState(false);
  const [turn, setTurn] = useState<{ beat: SettingBeat; index: number }>(() => ({
    beat,
    index: beat === "village" && setupWorkspace.settingEditorOpen ? script[beat].length - 1 : 0,
  }));
  const [popup, setPopup] = useState<"world" | "village">();
  const lineRef = useRef<HTMLParagraphElement>(null);
  const draftButton = useRef<HTMLButtonElement>(null);
  const focusLine = () =>
    requestAnimationFrame(() => {
      lineRef.current?.parentElement?.scrollTo({ top: 0 });
      lineRef.current?.focus({ preventScroll: true });
    });
  const closePopup = () => {
    setPopup(undefined);
    focusLine();
  };
  useEffect(() => {
    if (enteringScene) lineRef.current?.focus({ preventScroll: true });
  }, [enteringScene]);
  useEffect(() => {
    if (confirmReplace) lineRef.current?.focus();
  }, [confirmReplace]);
  useEffect(() => {
    if (beat !== "village-overview" || !villageInvalid) return;
    setTurn({ beat, index: script[beat].length - 1 });
  }, [beat, villageInvalid]);
  const moveTo = (settingBeat: SettingBeat, showLast = false) => {
    const openEditor =
      !phone &&
      settingBeat === "village" &&
      showLast &&
      !setupWorkspace.settingProblem &&
      !setupWorkspace.suggestionRequest?.draftSetting;
    setSetupWorkspace((workspace) => ({
      ...workspace,
      settingBeat,
      settingEditorOpen: openEditor,
      mobileMenu: undefined,
    }));
    setTurn({ beat: settingBeat, index: showLast ? script[settingBeat].length - 1 : 0 });
    const openedPopup = phone
      ? settingBeat === "world"
        ? "world"
        : settingBeat === "village-overview" && showLast
          ? "village"
          : undefined
      : undefined;
    setPopup(openedPopup);
    onBeatChange();
    const openLorebooks = settingBeat === "lorebooks" && showLast;
    if (!openedPopup && !openLorebooks && (!openEditor || !phone)) focusLine();
  };
  const request = setupWorkspace.suggestionRequest;
  const pending = request && !request.failure;
  const waitingForMari = pending && request.draftSetting;
  const error = setupWorkspace.settingProblem || (request?.draftSetting ? request.failure : "");
  const brief = setupWorkspace.settingBrief ?? "";
  const world = setupWorkspace.settingWorldBrief ?? "";
  const canDraft =
    !!brief.trim() &&
    (!!controller.setupName.trim() || waitingForMari) &&
    !controller.busy &&
    !setupSuggestionsBusy &&
    !controller.draftSaveError &&
    !connectionProblem &&
    (!pending || waitingForMari);
  const draftDialogue = confirmReplace
    ? "Hang on, there’s already something here. If I draft it again, I’ll replace your first Map details. Want me to go ahead?"
    : setupSuggestionsBusy && waitingForMari
      ? "I’m putting it together. Keep editing if inspiration rudely interrupts."
      : phone && waitingForMari
        ? "I still have your Map draft request. Want me to check on it?"
        : undefined;
  const lines = beat === "village" && draftDialogue ? [draftDialogue] : script[beat];
  const lineIndex = Math.min(
    lines.length - 1,
    turn.beat === beat
      ? turn.index
      : (beat === "village" && setupWorkspace.settingEditorOpen) || (beat === "village-overview" && villageInvalid)
        ? lines.length - 1
        : 0,
  );
  const expression = expressions[beat][Math.min(lineIndex, expressions[beat].length - 1)]!;
  useEffect(() => onExpressionChange(expression), [expression, onExpressionChange]);
  const lastLine = lineIndex === lines.length - 1;
  const namingVillage = beat === "village-overview" && lastLine;
  const finishVillage = () => {
    if (onValidateVillage()) moveTo("village");
  };
  const showLine = (index: number) => {
    setTurn({ beat, index });
    if (!phone && beat === "village") {
      setSetupWorkspace((workspace) => ({ ...workspace, settingEditorOpen: index === lines.length - 1 }));
    }
    if (beat !== "lorebooks" || index !== lines.length - 1) focusLine();
  };
  const previous = {
    welcome: undefined,
    "world-overview": "welcome",
    world: "world-overview",
    lorebooks: "world",
    "village-overview": "lorebooks",
    village: "village-overview",
  } as const;
  const back = () => {
    if (lineIndex > 0) showLine(lineIndex - 1);
    else if (previous[beat]) moveTo(previous[beat], true);
  };
  const submitBrief = () => {
    if (!canDraft) return;
    setPopup(undefined);
    if (phone) setSetupWorkspace((workspace) => ({ ...workspace, settingEditorOpen: false }));
    const { setupLocationName, setupSetting } = controller;
    if (!waitingForMari && [setupLocationName, setupSetting].some((value) => value.trim())) setConfirmReplace(true);
    else void draftSetupSetting("request");
  };
  const worldField = (
    <>
      <FoundingField title="World name" optional>
        <input
          autoComplete="off"
          maxLength={120}
          value={controller.setupWorldName}
          placeholder="e.g. The Shattered Isles"
          disabled={controller.busy}
          onChange={(event) => controller.setSetupWorldName(event.currentTarget.value)}
        />
      </FoundingField>
      <FoundingField title="World description" optional>
        <textarea
          autoComplete="off"
          rows={2}
          maxLength={FOUNDING_SETTING_BRIEF_LIMIT}
          value={world}
          placeholder="e.g. A chain of island kingdoms linked by trade ships."
          onChange={(event) => {
            const value = event.currentTarget.value;
            setSetupWorkspace((workspace) => ({ ...workspace, settingWorldBrief: value }));
          }}
        />
      </FoundingField>
      <FoundingField title="World rules" optional>
        <textarea
          autoComplete="off"
          aria-label="World rules"
          maxLength={4096}
          rows={2}
          value={controller.setupContext.rules}
          placeholder="e.g. Magic only works after sunset."
          disabled={controller.busy}
          onChange={(event) => {
            const rules = event.currentTarget.value;
            controller.setSetupContext((context) => ({ ...context, rules }));
          }}
        />
      </FoundingField>
    </>
  );
  const loreBudget = {
    value: controller.setupLoreTokenBudgetDraft,
    onChange: controller.setSetupLoreTokenBudgetDraft,
    min: controller.snapshot?.settings.loreTokenBudgetMin ?? 0,
    max: controller.snapshot?.settings.loreTokenBudgetMax ?? 3200,
    disabled: controller.busy || setupSuggestionsBusy,
  };
  const villageFields = (
    <>
      {villageNameField}
      <FoundingField title="What is the village like?" error={villageBriefError}>
        <textarea
          rows={2}
          autoComplete="off"
          maxLength={FOUNDING_SETTING_BRIEF_LIMIT}
          value={brief}
          readOnly={!!waitingForMari}
          placeholder="We live aboard a converted cargo ship…"
          onChange={(event) => {
            const value = event.currentTarget.value;
            setSetupWorkspace((workspace) => ({ ...workspace, settingBrief: value }));
          }}
        />
      </FoundingField>
    </>
  );
  const errorNotice = error ? (
    <p role="alert">
      {/Language model connection not found/iu.test(error)
        ? "The System connection is unavailable. Choose another connection or review it in Engine."
        : error}
    </p>
  ) : null;
  const dismiss =
    waitingForMari && !setupSuggestionsBusy ? (
      <button
        type="button"
        onClick={() => {
          if (controller.setupSuggestionsClaim.current) return;
          setSetupWorkspace((workspace) =>
            workspace.suggestionRequest?.id === request.id
              ? { ...workspace, suggestionRequest: undefined, settingProblem: undefined }
              : workspace,
          );
        }}
      >
        Dismiss request
      </button>
    ) : null;
  const backReply =
    previous[beat] || lineIndex ? (
      <button type="button" data-reader-direction="back" onClick={back}>
        Back
      </button>
    ) : null;
  const draftLabel = waitingForMari ? (setupSuggestionsBusy ? "Drafting Map…" : "Resume Map draft") : "Suggest";
  const suggestReply =
    brief.trim() || waitingForMari ? (
      <button
        type="button"
        className="villages-founding-draft-map"
        ref={draftButton}
        disabled={!canDraft}
        onClick={submitBrief}
      >
        {draftLabel}
      </button>
    ) : null;
  const closeEditor = () => {
    setSetupWorkspace((workspace) => ({ ...workspace, settingEditorOpen: false }));
    focusLine();
  };
  const inactive = phone && editorOpen;
  return (
    <section
      className="villages-setting-guide"
      aria-label={title ? undefined : "Professor Mari"}
      aria-hidden={inactive || undefined}
      inert={inactive || undefined}
    >
      {title}
      <FoundingReader text={lines[lineIndex]!} lineRef={lineRef} hidden={!!title}>
        {!phone && beat === "village" && lastLine ? <section aria-label="Your first Map">{mapFields}</section> : null}
        {!lastLine ? (
          <div className="villages-founding-replies">
            {backReply}
            <button
              type="button"
              className="villages-forging-primary"
              data-reader-direction="next"
              onClick={() => showLine(lineIndex + 1)}
            >
              Next
            </button>
          </div>
        ) : beat === "welcome" ? (
          <div className="villages-founding-replies">
            {backReply}
            <button
              type="button"
              className="villages-forging-primary"
              data-reader-direction="next"
              onClick={() => moveTo("world-overview")}
            >
              Next
            </button>
          </div>
        ) : beat === "world" ? (
          <>
            {!phone ? worldField : null}
            <div className="villages-founding-replies">
              {backReply}
              <button
                type="button"
                className="villages-forging-primary"
                data-reader-direction="next"
                onClick={() => {
                  if (phone) setPopup("world");
                  else moveTo("lorebooks");
                }}
              >
                Next
              </button>
            </div>
          </>
        ) : beat === "lorebooks" ? (
          <div className="villages-founding-replies">
            {backReply}
            <VillageLorebookPicker
              books={controller.lorebooks}
              error={controller.lorebooksError}
              selected={controller.setupLorebookDraft}
              onChange={(ids) => {
                controller.setSetupLorebookDraft(ids);
                moveTo("village-overview");
              }}
              disabled={controller.busy || setupSuggestionsBusy}
              founding={{ inline: !phone, onBack: back }}
              budget={loreBudget}
            />
          </div>
        ) : beat === "world-overview" || beat === "village-overview" ? (
          <>
            {namingVillage && !phone ? villageFields : null}
            <div className="villages-founding-replies">
              {backReply}
              <button
                type="button"
                className="villages-forging-primary"
                data-reader-direction="next"
                onClick={() => {
                  if (beat === "world-overview") moveTo("world");
                  else if (phone) setPopup("village");
                  else finishVillage();
                }}
              >
                Next
              </button>
            </div>
          </>
        ) : confirmReplace ? (
          <div className="villages-founding-replies">
            <button
              type="button"
              onClick={() => {
                setConfirmReplace(false);
                if (phone) onEditSetting();
                else requestAnimationFrame(() => draftButton.current?.focus());
              }}
            >
              Keep my Map
            </button>
            <button
              type="button"
              className="villages-forging-primary"
              data-reader-direction="next"
              disabled={!canDraft}
              onClick={() => {
                setConfirmReplace(false);
                void draftSetupSetting("replace");
              }}
            >
              Replace and draft
            </button>
          </div>
        ) : (
          <>
            {errorNotice}
            <div className="villages-founding-replies">
              {!waitingForMari ? backReply : null}
              {phone ? (
                <button
                  type="button"
                  className="villages-forging-primary"
                  data-reader-direction="next"
                  onClick={onEditSetting}
                >
                  Next
                </button>
              ) : null}
              {!phone ? next : null}
              {dismiss}
              {!phone ? suggestReply : null}
            </div>
          </>
        )}
      </FoundingReader>
      {phone && editorOpen ? (
        <FoundingDialog title="Your first Map" headerContent={mapEditorHeader} onClose={closeEditor}>
          {mapFields}
          <footer className="villages-founding-replies">
            <button type="button" disabled={controller.busy} onClick={closeEditor}>
              Back
            </button>
            {next}
            {suggestReply}
          </footer>
        </FoundingDialog>
      ) : null}
      {phone && popup === "world" && beat === "world" ? (
        <FoundingDialog
          title="The wider world"
          className="villages-setting-fields-dialog"
          scrollBody
          onClose={closePopup}
        >
          <div className="villages-setting-fields">{worldField}</div>
          <footer>
            <button type="button" onClick={closePopup}>
              Back
            </button>
            <button
              type="button"
              className="villages-forging-primary"
              data-reader-direction="next"
              onClick={() => moveTo("lorebooks")}
            >
              Next
            </button>
          </footer>
        </FoundingDialog>
      ) : null}
      {phone && namingVillage && popup === "village" ? (
        <FoundingDialog title="Your Village" className="villages-setting-fields-dialog" scrollBody onClose={closePopup}>
          <div className="villages-setting-fields">{villageFields}</div>
          <footer>
            <button type="button" onClick={closePopup}>
              Back
            </button>
            <button
              type="button"
              className="villages-forging-primary"
              data-reader-direction="next"
              onClick={finishVillage}
            >
              Next
            </button>
          </footer>
        </FoundingDialog>
      ) : null}
    </section>
  );
}
