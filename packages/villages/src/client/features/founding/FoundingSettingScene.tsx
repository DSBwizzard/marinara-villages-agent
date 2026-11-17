import { FOUNDING_SETTING_BRIEF_LIMIT } from "../../../shared/contracts/founding.js";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { FoundingField } from "./FoundingField.js";
import { FoundingSpeaker, foundingMariSprite } from "./FoundingGuide.js";
import { FoundingHierarchy } from "./FoundingHierarchy.js";
import { LoreTokenBudgetField, VillageLorebookPicker } from "./FoundingPanels.js";
import type { FoundingScreenController } from "./screen-contracts.js";

type SettingBeat = NonNullable<FoundingScreenController["setupWorkspace"]["settingBeat"]> | "manual";
const manualSettingLine =
  "All yours. Name the village, then pick which part we’ll map first. Tell me what daily life looks like there. The sign painter can wait.";
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
  const lineRef = useRef<HTMLParagraphElement>(null);
  const draftButton = useRef<HTMLButtonElement>(null);
  const promptTitle = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (enteringScene) lineRef.current?.focus({ preventScroll: true });
  }, [enteringScene]);
  useEffect(() => {
    if (confirmReplace) lineRef.current?.focus();
  }, [confirmReplace]);
  const moveTo = (settingBeat: SettingBeat) => {
    const openEditor =
      settingBeat === "manual" ||
      (!phone &&
        settingBeat === "village" &&
        !!setupWorkspace.settingDraft &&
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
    onBeatChange();
    if (!openEditor || !phone)
      requestAnimationFrame(() => {
        lineRef.current?.parentElement?.scrollTo({ top: 0 });
        lineRef.current?.focus({ preventScroll: true });
      });
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
  const firstLayer = !manual && beat === "lorebooks";
  const nextPrompt = { lorebooks: "world", world: "village-overview", "village-overview": "village" } as const;
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
  const mobilePrompt =
    phone &&
    (beat === "world" ||
      beat === "lorebooks" ||
      beat === "village-overview" ||
      (beat === "village" && !confirmReplace && !waitingForMari && !setupSuggestionsBusy))
      ? beat
      : undefined;
  useEffect(() => {
    if (mobilePrompt) promptTitle.current?.focus({ preventScroll: true });
  }, [mobilePrompt]);
  const canDraft =
    !!brief.trim() &&
    !controller.busy &&
    !setupSuggestionsBusy &&
    !controller.draftSaveError &&
    !connectionProblem &&
    (!pending || waitingForMari);
  const dialogue = {
    welcome: phone
      ? "Oh, hey! Welcome to Villages. Make a life with a community in a city, kingdom, spaceship, or one alarmingly dramatic apartment building. Want my help setting up, or ready to dive in?"
      : "Oh, hey! Welcome to Villages.\n\nVillages is a social game where you make a life with a community. The Village itself can be a city, a kingdom, a spaceship, or even one alarmingly dramatic apartment building.\n\nBefore you begin, we need to set up the Village. Would you like my help, or do you want to dive in on your own?",
    manual: manualSettingLine,
    world:
      "What’s the wider world like? A sentence will do. Defining a broader World is optional, just like paying attention in your high school history class.",
    lorebooks: manual
      ? "Do you have any lorebooks you’d like to use for the World, the Village, or the people who live there?"
      : "The first layer is the World, where your Village takes place. You can leave it undefined or use it to ground the Village in an established universe.\n\nSpeaking of lore, you can share Lorebooks to fill in details for the drafts we make, like the greater World, local customs, or who already lives there. Do you have any you’d like Villages to use?",
    "village-overview":
      "The next layer is the Village itself. This is the big picture, your playable game space as a whole. You generally won’t interact directly with this layer or the World above it.",
    village: confirmReplace
      ? "Hang on, there’s already something here. If I draft it again, I’ll replace what’s in your setting for the village and its first map. Want me to go ahead?"
      : setupSuggestionsBusy && waitingForMari
        ? "I’m putting it together. Keep editing if inspiration rudely interrupts."
        : phone && waitingForMari
          ? "I still have your draft request. Want me to check on it?"
          : drafted
            ? "There’s your draft. Go ahead and meddle with the name, starting location, or description. That’s the fun bit."
            : "You’ll interact with the Village through its Maps. A Map is the playing area you use to visit places and do things with your community.\n\nEach Map covers one locale. It could be a city block seen from above, the inside of a cruise ship, a forest glade, or an entire planet. A Village can have multiple Maps.\n\nGive me a name for the Village as a whole, and choose what you want your first Map to be!",
  }[beat];
  const submitBrief = () => {
    if (!canDraft) return;
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
  const loreBudget = pickedBooks ? (
    <LoreTokenBudgetField
      value={controller.setupLoreTokenBudgetDraft}
      onChange={controller.setSetupLoreTokenBudgetDraft}
      min={controller.snapshot?.settings.loreTokenBudgetMin ?? 0}
      max={controller.snapshot?.settings.loreTokenBudgetMax ?? 3200}
      disabled={controller.busy || setupSuggestionsBusy}
    />
  ) : null;
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
  if (mobilePrompt) {
    const title = {
      world: "The wider world",
      lorebooks: "Lorebooks",
      "village-overview": "The Village",
      village: "Your first Map",
    }[mobilePrompt];
    const back = {
      world: previousWorld,
      lorebooks: manual ? "world" : "welcome",
      "village-overview": "world",
      village: "village-overview",
    } as const;
    return (
      <>
        {illustration}
        <form
          className="villages-founding-mobile-menu villages-forging-card"
          aria-labelledby="founding-prompt-title"
          autoComplete="off"
          onSubmit={(event) => {
            event.preventDefault();
            if (mobilePrompt === "village") submitBrief();
            else if (mobilePrompt === "world" && manual) moveTo("lorebooks");
            else if (mobilePrompt !== "lorebooks" || !manual) moveTo(nextPrompt[mobilePrompt]);
          }}
        >
          <h2 id="founding-prompt-title" tabIndex={-1} ref={promptTitle}>
            {title}
          </h2>
          {firstLayer ? <p>Villages contain five layers.</p> : null}
          <p className="villages-setting-line">{dialogue}</p>
          {mobilePrompt === "world" ? (
            worldField
          ) : mobilePrompt === "lorebooks" ? (
            <>
              <VillageLorebookPicker
                inline
                books={controller.lorebooks}
                error={controller.lorebooksError}
                selected={controller.setupLorebookDraft}
                onChange={controller.setSetupLorebookDraft}
                disabled={controller.busy || setupSuggestionsBusy}
              />
              {loreBudget}
            </>
          ) : mobilePrompt === "village" ? (
            <>
              {briefField}
              {loreNotice}
              {errorNotice}
              {connectionError ? (
                <button type="button" onClick={onConnections}>
                  Model Connections
                </button>
              ) : null}
            </>
          ) : null}
          <div className="villages-founding-menu-actions">
            <button type="button" onClick={() => moveTo(back[mobilePrompt])}>
              Back
            </button>
            {mobilePrompt === "village" ? (
              <button type="button" className="villages-forging-primary" onClick={onEditSetting}>
                Enter my setting
              </button>
            ) : null}
            {mobilePrompt === "lorebooks" && manual ? (
              next
            ) : (
              <button
                type="submit"
                className={mobilePrompt === "village" ? undefined : "villages-forging-primary"}
                disabled={mobilePrompt === "village" && !canDraft}
              >
                {mobilePrompt === "village" ? (drafted ? "Draft again with Mari" : "Draft with Mari") : "Next"}
              </button>
            )}
          </div>
        </form>
      </>
    );
  }
  return (
    <section
      className="villages-setting-guide"
      data-hierarchy={!!hierarchy || undefined}
      aria-label={title ? undefined : "Professor Mari"}
    >
      {illustration ?? stage}
      {title}
      <div className="villages-setting-dialogue" hidden={!!title}>
        <FoundingSpeaker pose={pose} />
        {firstLayer ? <p>Villages contain five layers.</p> : null}
        <p className="villages-setting-line" aria-live="polite" tabIndex={-1} ref={lineRef}>
          {dialogue}
        </p>
        {beat === "welcome" ? (
          <div className="villages-founding-replies">
            <button type="button" className="villages-forging-primary" onClick={() => moveTo("lorebooks")}>
              Draft with Mari
            </button>
            <button type="button" onClick={() => moveTo("manual")}>
              Set it up myself
            </button>
          </div>
        ) : null}
        {beat === "manual" ? (
          <div className="villages-founding-replies">
            <button type="button" onClick={() => moveTo("welcome")}>
              Back
            </button>
            {next}
          </div>
        ) : null}
        {beat === "world" ? (
          <>
            {worldField}
            <div className="villages-founding-replies">
              <button type="button" onClick={() => moveTo(previousWorld)}>
                Back
              </button>
              <button
                type="button"
                className="villages-forging-primary"
                onClick={() => moveTo(manual ? "lorebooks" : "village-overview")}
              >
                {manual ? "Next" : world.trim() ? "Use this world" : "Skip world description"}
              </button>
            </div>
          </>
        ) : null}
        {beat === "lorebooks" ? (
          <>
            {loreBudget}
            <div className="villages-founding-replies">
              <button type="button" onClick={() => moveTo(manual ? "world" : "welcome")}>
                Back
              </button>
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
              />
              {manual ? (
                next
              ) : (
                <button type="button" onClick={() => moveTo("world")}>
                  {pickedBooks > 0 ? "Keep selected lorebooks" : "Skip for now"}
                </button>
              )}
            </div>
          </>
        ) : null}
        {beat === "village-overview" ? (
          <div className="villages-founding-replies">
            <button type="button" onClick={() => moveTo("world")}>
              Back
            </button>
            <button type="button" className="villages-forging-primary" onClick={() => moveTo("village")}>
              Next
            </button>
          </div>
        ) : null}
        {beat === "village" && confirmReplace ? (
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
        ) : null}
        {beat === "village" && !confirmReplace && phone ? (
          <>
            {errorNotice}
            <div className="villages-founding-replies">
              {waitingForMari ? (
                <button type="button" className="villages-forging-primary" onClick={submitBrief} disabled={!canDraft}>
                  {setupSuggestionsBusy ? "Drafting…" : "Resume draft with Mari"}
                </button>
              ) : null}
              <button type="button" onClick={onEditSetting}>
                Edit setting
              </button>
              {connectionError ? (
                <button type="button" onClick={onConnections}>
                  Model Connections
                </button>
              ) : null}
              {dismiss}
            </div>
          </>
        ) : beat === "village" && !confirmReplace ? (
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
              <button
                type="button"
                disabled={!!waitingForMari || setupSuggestionsBusy}
                onClick={() => moveTo("village-overview")}
              >
                Back
              </button>
              <button type="submit" ref={draftButton} className="villages-forging-primary" disabled={!canDraft}>
                {setupSuggestionsBusy && waitingForMari
                  ? "Drafting…"
                  : waitingForMari
                    ? "Resume draft with Mari"
                    : drafted
                      ? "Draft again with Mari"
                      : "Draft with Mari"}
              </button>
              {connectionError ? (
                <button type="button" onClick={onConnections}>
                  Model Connections
                </button>
              ) : null}
              {dismiss}
            </div>
          </form>
        ) : null}
      </div>
    </section>
  );
}
