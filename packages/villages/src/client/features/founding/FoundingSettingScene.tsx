import { FOUNDING_SETTING_BRIEF_LIMIT } from "../../../shared/contracts/founding.js";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { FoundingDialog } from "./FoundingDialog.js";
import { FoundingField } from "./FoundingField.js";
import { FoundingSpeaker, foundingMariSprite } from "./FoundingGuide.js";
import { FoundingHierarchy } from "./FoundingHierarchy.js";
import { VillageLorebookPicker } from "./FoundingPanels.js";
import type { FoundingScreenController } from "./screen-contracts.js";

type SettingBeat = NonNullable<FoundingScreenController["setupWorkspace"]["settingBeat"]> | "manual";
const script: Record<SettingBeat, readonly string[]> = {
  welcome: [
    "Oh, hey!",
    "Welcome to Villages.",
    "Villages is a social game where you make a life with a community. The village itself can be anything: a city, a kingdom, a spaceship, or even one alarmingly dramatic apartment building.",
    "Before you begin, we need to set the Village itself up. Would you like my help, or do you want to dive in on your own?",
  ],
  manual: [
    "All yours. Name the village, then pick which part we’ll map first. Tell me what daily life looks like there. The sign painter can wait.",
  ],
  lorebooks: [
    "Villages contain five layers.",
    "The first layer is the World. This is the world itself that your Village takes place in. You don't have to define a World if you don't want to, but it can help ground the Village in an established lore and universe if you want.",
    "Speaking of lore, now is a good time to mention that Lorebooks can be used in Villages. If you want, you can share any Lorebooks you have that can fill in details for the drafts we make, like the greater World, local customs or who already lives there.",
    "Do you have any Lorebooks you want to have Villages use to describe the World, Village, people, etc?",
  ],
  world: [
    "What’s the wider world like? A sentence will do. Defining a broader World is optional, just like paying attention in your high school history class.",
  ],
  "village-overview": [
    "The next layer is the Village itself. This is the big picture, and represents your playable game space as a whole. You don't generally interact with this layer, or the World layer above it.",
  ],
  village: [
    "Instead, you'll interact with the Village through a series of Maps. A Map is the actual playing area of that part of your Village, and you interact with it frequently to visit areas or perform activities with your community.",
    "A single Map represents one defined locale. A Map can be an aerial view of a city block, the interior of a cruise ship, a beautiful glade in the forest, or an entire planet. And don't worry, a Village can have multiple Maps.",
    "Now, give me a name for the Village as a whole, and choose what you want your first Map to be!",
  ],
};
export function settingBeat(workspace: FoundingScreenController["setupWorkspace"]): SettingBeat {
  if (
    workspace.settingBeat === "village" &&
    workspace.settingManual === true &&
    !workspace.suggestionRequest?.draftSetting
  )
    return "manual";
  return workspace.settingBeat ?? (workspace.suggestionRequest?.draftSetting ? "village" : "welcome");
}

export function FoundingSettingScene({
  controller,
  connectionProblem,
  phone,
  enteringScene,
  title,
  onConnections,
  onEditSetting,
  onBeatChange,
  next,
}: {
  controller: FoundingScreenController;
  connectionProblem: string;
  phone: boolean;
  enteringScene: boolean;
  title: ReactNode;
  onConnections(): void;
  onEditSetting(): void;
  onBeatChange(): void;
  next: ReactNode;
}) {
  const { setupWorkspace, setSetupWorkspace, setupSuggestionsBusy, draftSetupSetting } = controller;
  const beat = settingBeat(setupWorkspace);
  const manual = setupWorkspace.settingManual === true;
  const [confirmReplace, setConfirmReplace] = useState(false);
  const [turn, setTurn] = useState<{ beat: SettingBeat; index: number }>();
  const [popup, setPopup] = useState<"world" | "draft">();
  const lineRef = useRef<HTMLParagraphElement>(null);
  const draftButton = useRef<HTMLButtonElement>(null);
  const focusLine = () =>
    requestAnimationFrame(() => {
      lineRef.current?.parentElement?.scrollTo({ top: 0 });
      lineRef.current?.focus({ preventScroll: true });
    });
  useEffect(() => {
    if (enteringScene) lineRef.current?.focus({ preventScroll: true });
  }, [enteringScene]);
  useEffect(() => {
    if (confirmReplace) lineRef.current?.focus();
  }, [confirmReplace]);
  const moveTo = (settingBeat: SettingBeat, showLast = false) => {
    const openEditor =
      settingBeat === "manual" ||
      (!phone &&
        settingBeat === "village" &&
        (showLast || !!setupWorkspace.settingDraft) &&
        !setupWorkspace.settingProblem &&
        !setupWorkspace.suggestionRequest?.draftSetting);
    setSetupWorkspace((workspace) => ({
      ...workspace,
      settingBeat: settingBeat === "manual" ? "village" : settingBeat,
      settingManual:
        settingBeat === "manual" || (manual && (settingBeat === "world" || settingBeat === "lorebooks")) || undefined,
      settingEditorOpen: openEditor,
      mobileMenu: undefined,
    }));
    setTurn(showLast ? { beat: settingBeat, index: script[settingBeat].length - 1 } : undefined);
    setPopup(undefined);
    onBeatChange();
    if (!openEditor || !phone) focusLine();
  };
  const request = setupWorkspace.suggestionRequest;
  const pending = request && !request.failure;
  const waitingForMari = pending && request.draftSetting;
  const error = setupWorkspace.settingProblem || (request?.draftSetting ? request.failure : "");
  const connectionError = !!connectionProblem || (!!error && /connection|model.*not found/iu.test(error));
  const drafted = !!setupWorkspace.settingDraft && !waitingForMari;
  const pose = beat === "welcome" || (beat === "village" && drafted) ? "happy" : "neutral";
  const brief = setupWorkspace.settingBrief ?? "";
  const world = setupWorkspace.settingWorldBrief ?? "";
  const pickedBooks = controller.setupLorebookDraft.length;
  const previousWorld = manual ? "manual" : "lorebooks";
  const hierarchy =
    !manual && beat !== "welcome" && beat !== "manual" ? (
      <FoundingHierarchy current={beat === "village-overview" ? "Village" : beat === "village" ? "Map" : "World"} />
    ) : null;
  const stage = (
    <div className="villages-setting-stage" aria-hidden="true">
      <img key={pose} src={foundingMariSprite(pose)} alt="" />
      {title ? <img className="villages-mari-looking-up" src={foundingMariSprite("looking-up")} alt="" /> : null}
    </div>
  );
  const illustration = hierarchy ? (
    <div className="villages-setting-illustration">
      {stage}
      {hierarchy}
    </div>
  ) : null;
  const canDraft =
    !!brief.trim() &&
    !controller.busy &&
    !setupSuggestionsBusy &&
    !controller.draftSaveError &&
    !connectionProblem &&
    (!pending || waitingForMari);
  const draftDialogue = confirmReplace
    ? "Hang on, there’s already something here. If I draft it again, I’ll replace what’s in your setting for the village and its first map. Want me to go ahead?"
    : setupSuggestionsBusy && waitingForMari
      ? "I’m putting it together. Keep editing if inspiration rudely interrupts."
      : phone && waitingForMari
        ? "I still have your draft request. Want me to check on it?"
        : drafted
          ? "There’s your draft. Go ahead and meddle with the name, starting location, or description. That’s the fun bit."
          : undefined;
  const lines =
    beat === "village" && draftDialogue
      ? [draftDialogue]
      : beat === "lorebooks" && manual
        ? [script.lorebooks[3]!]
        : script[beat];
  const lineIndex = Math.min(
    lines.length - 1,
    turn?.beat === beat ? turn.index : beat === "village" && setupWorkspace.settingEditorOpen ? lines.length - 1 : 0,
  );
  const lastLine = lineIndex === lines.length - 1;
  const showLine = (index: number) => {
    setTurn({ beat, index });
    if (!phone && beat === "village") {
      setSetupWorkspace((workspace) => ({ ...workspace, settingEditorOpen: index === lines.length - 1 }));
    }
    focusLine();
  };
  const previous = {
    welcome: undefined,
    manual: "welcome",
    world: previousWorld,
    lorebooks: manual ? "world" : "welcome",
    "village-overview": "world",
    village: "village-overview",
  } as const;
  const back = () => {
    if (lineIndex > 0) showLine(lineIndex - 1);
    else if (previous[beat]) moveTo(previous[beat], true);
  };
  const advanceWorld = () => moveTo(manual ? "lorebooks" : "village-overview");
  const submitBrief = () => {
    if (!canDraft) return;
    setPopup(undefined);
    const { setupName, setupLocationName, setupSetting } = controller;
    if (!waitingForMari && [setupName, setupLocationName, setupSetting].some((value) => value.trim()))
      setConfirmReplace(true);
    else void draftSetupSetting("request");
  };
  const worldField = (
    <>
      {!manual ? (
        <FoundingField title={phone ? "World description" : "The larger world"} optional>
          <textarea
            autoComplete="off"
            rows={phone ? 4 : 2}
            maxLength={FOUNDING_SETTING_BRIEF_LIMIT}
            value={world}
            placeholder="A network of settlements on old cargo routes…"
            onChange={(event) => {
              const value = event.currentTarget.value;
              setSetupWorkspace((workspace) => ({ ...workspace, settingWorldBrief: value }));
            }}
          />
        </FoundingField>
      ) : null}
      <FoundingField title="World name" optional>
        <input
          autoComplete="off"
          maxLength={120}
          value={controller.setupWorldName}
          disabled={controller.busy}
          onChange={(event) => controller.setSetupWorldName(event.currentTarget.value)}
        />
      </FoundingField>
      <FoundingField title="World rules" optional>
        <textarea
          autoComplete="off"
          aria-label="World rules"
          maxLength={4096}
          rows={2}
          value={controller.setupContext.rules}
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
  const briefField = (
    <FoundingField title={phone ? "Village description" : "Tell Mari about your village"}>
      <textarea
        rows={phone ? 4 : 2}
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
  );
  const loreNotice =
    pickedBooks > 0 ? (
      <p className="villages-setting-lore-notice">
        {pickedBooks} {pickedBooks === 1 ? "lorebook" : "lorebooks"} selected for drafting
      </p>
    ) : null;
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
      <button type="button" onClick={back}>
        Back
      </button>
    ) : null;
  const draftLabel = waitingForMari
    ? setupSuggestionsBusy
      ? "Drafting…"
      : "Resume draft with Mari"
    : drafted
      ? "Draft again with Mari"
      : "Draft with Mari";
  const draftForm = (
    <form
      autoComplete="off"
      onSubmit={(event) => {
        event.preventDefault();
        submitBrief();
      }}
    >
      {briefField}
      {loreNotice}
      {errorNotice}
      <div className="villages-setting-dialogue-actions">
        {!phone && !waitingForMari ? backReply : null}
        <button type="submit" ref={draftButton} className="villages-forging-primary" disabled={!canDraft}>
          {draftLabel}
        </button>
        {connectionError && !phone ? (
          <button type="button" onClick={onConnections}>
            Model Connections
          </button>
        ) : null}
        {dismiss}
      </div>
    </form>
  );
  return (
    <section
      className="villages-setting-guide"
      data-conversation={!title || undefined}
      data-hierarchy={!!hierarchy || undefined}
      aria-label={title ? undefined : "Professor Mari"}
    >
      {illustration ?? stage}
      {title}
      <div className="villages-setting-dialogue" hidden={!!title}>
        <FoundingSpeaker pose={pose} />
        <p aria-live="polite" tabIndex={-1} ref={lineRef}>
          {lines[lineIndex]}
        </p>
        {!lastLine ? (
          <div className="villages-founding-replies">
            {backReply}
            <button type="button" className="villages-forging-primary" onClick={() => showLine(lineIndex + 1)}>
              Next
            </button>
          </div>
        ) : beat === "welcome" ? (
          <div className="villages-founding-replies">
            {backReply}
            <button type="button" className="villages-forging-primary" onClick={() => moveTo("lorebooks")}>
              Draft with Mari
            </button>
            <button type="button" onClick={() => moveTo("manual")}>
              Set it up myself
            </button>
          </div>
        ) : beat === "manual" ? (
          <div className="villages-founding-replies">
            {backReply}
            {phone ? (
              <button type="button" className="villages-forging-primary" onClick={onEditSetting}>
                Enter my setting
              </button>
            ) : (
              next
            )}
          </div>
        ) : beat === "world" ? (
          <>
            {!phone ? worldField : null}
            <div className="villages-founding-replies">
              {backReply}
              {phone ? (
                <button type="button" className="villages-forging-primary" onClick={() => setPopup("world")}>
                  Describe world
                </button>
              ) : null}
              <button type="button" className={phone ? undefined : "villages-forging-primary"} onClick={advanceWorld}>
                {manual ? "Next" : world.trim() ? "Use this world" : "Skip world description"}
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
                if (!manual) moveTo("world");
              }}
              disabled={controller.busy || setupSuggestionsBusy}
              triggerLabel={pickedBooks ? "Change lorebooks" : "Choose lorebooks"}
              budget={loreBudget}
            />
            {manual ? (
              next
            ) : (
              <button type="button" onClick={() => moveTo("world")}>
                {pickedBooks > 0 ? "Keep selected lorebooks" : "Skip for now"}
              </button>
            )}
          </div>
        ) : beat === "village-overview" ? (
          <div className="villages-founding-replies">
            {backReply}
            <button type="button" className="villages-forging-primary" onClick={() => moveTo("village")}>
              Next
            </button>
          </div>
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
              Keep my setting
            </button>
            <button
              type="button"
              className="villages-forging-primary"
              disabled={!canDraft}
              onClick={() => {
                setConfirmReplace(false);
                void draftSetupSetting("replace");
              }}
            >
              Replace and draft
            </button>
          </div>
        ) : phone ? (
          <>
            {errorNotice}
            <div className="villages-founding-replies">
              {!waitingForMari ? backReply : null}
              <button type="button" className="villages-forging-primary" onClick={onEditSetting}>
                {drafted || waitingForMari ? "Edit setting" : "Enter my setting"}
              </button>
              <button
                type="button"
                disabled={waitingForMari ? !canDraft : setupSuggestionsBusy}
                onClick={waitingForMari ? submitBrief : () => setPopup("draft")}
              >
                {draftLabel}
              </button>
              {connectionError ? (
                <button type="button" onClick={onConnections}>
                  Model Connections
                </button>
              ) : null}
              {dismiss}
            </div>
          </>
        ) : (
          draftForm
        )}
      </div>
      {phone && popup === "world" && beat === "world" ? (
        <FoundingDialog title="The wider world" onClose={() => setPopup(undefined)}>
          {worldField}
          <footer>
            <button type="button" className="villages-forging-primary" onClick={advanceWorld}>
              Done
            </button>
          </footer>
        </FoundingDialog>
      ) : null}
      {phone && popup === "draft" && beat === "village" ? (
        <FoundingDialog title="Draft with Mari" onClose={() => setPopup(undefined)}>
          {draftForm}
        </FoundingDialog>
      ) : null}
    </section>
  );
}
