import { FOUNDING_SETTING_BRIEF_LIMIT } from "../../../shared/contracts/founding.js";
import { useEffect, useRef, useState, type ReactNode, type Ref } from "react";
import { FoundingField } from "./FoundingField.js";
import { FoundingSpeaker, foundingMariSprite } from "./FoundingGuide.js";
import { VillageLorebookPicker } from "./FoundingPanels.js";
import type { FoundingScreenController } from "./screen-contracts.js";

type SettingBeat = NonNullable<FoundingScreenController["setupWorkspace"]["settingBeat"]> | "manual";
const manualSettingLine =
  "All yours. Give the village a name, pick where we’ll first meet the locals, and tell me what it’s like there. A working name is fine. The sign painter can wait.";
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
  phone,
  enteringScene,
  title,
  onConnections,
  onEditSetting,
  onBeatChange,
  editSettingButton,
  next,
}: {
  controller: FoundingScreenController;
  phone: boolean;
  enteringScene: boolean;
  title: ReactNode;
  onConnections(): void;
  onEditSetting(): void;
  onBeatChange(): void;
  editSettingButton: Ref<HTMLButtonElement>;
  next: ReactNode;
}) {
  const { setupWorkspace, setSetupWorkspace, setupSuggestionsBusy, draftSetupSetting } = controller;
  const beat = settingBeat(setupWorkspace);
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
      (settingBeat === "village" &&
        !!setupWorkspace.settingDraft &&
        !setupWorkspace.settingProblem &&
        !setupWorkspace.suggestionRequest?.draftSetting);
    setSetupWorkspace((workspace) => ({
      ...workspace,
      settingBeat: settingBeat === "manual" ? "village" : settingBeat,
      settingManual: settingBeat === "manual" || undefined,
      settingEditorOpen: openEditor,
      mobileMenu: undefined,
    }));
    onBeatChange();
    if (!openEditor || !phone) requestAnimationFrame(() => lineRef.current?.focus());
  };
  const request = setupWorkspace.suggestionRequest;
  const pending = request && !request.failure;
  const waitingForMari = pending && request.draftSetting;
  const error = setupWorkspace.settingProblem || (request?.draftSetting ? request.failure : "");
  const connectionError = !!error && /connection|model.*not found/iu.test(error);
  const drafted = !!setupWorkspace.settingDraft && !waitingForMari;
  const pose = beat === "welcome" || (beat === "village" && drafted) ? "happy" : "neutral";
  const brief = setupWorkspace.settingBrief ?? "";
  const world = setupWorkspace.settingWorldBrief ?? "";
  const pickedBooks = controller.setupLorebookDraft.length;
  const mobilePrompt =
    phone &&
    (beat === "world" && setupWorkspace.mobileMenu === "world"
      ? "world"
      : beat === "village" && setupWorkspace.mobileMenu === "brief" && !confirmReplace && !waitingForMari
        ? "brief"
        : undefined);
  const openPrompt = (mobileMenu?: "world" | "brief") => {
    setSetupWorkspace((workspace) => ({ ...workspace, mobileMenu }));
    onBeatChange();
    if (!mobileMenu) requestAnimationFrame(() => lineRef.current?.focus({ preventScroll: true }));
  };
  useEffect(() => {
    if (mobilePrompt) promptTitle.current?.focus({ preventScroll: true });
  }, [mobilePrompt]);
  const canDraft =
    !!brief.trim() &&
    !controller.busy &&
    !setupSuggestionsBusy &&
    !controller.draftSaveError &&
    (!pending || waitingForMari);
  const dialogue = {
    welcome: phone
      ? "Oh, hey! I’m Mari. In Villages, you make a life with a community. A ship’s crew counts. So does one alarmingly dramatic apartment building. Want to draft together?"
      : "Oh, hey! I’m Mari. In Villages, you make a life with a community. A ship’s crew counts. So does one alarmingly dramatic apartment building. Want to draft a village with me, or set it up yourself?",
    manual: manualSettingLine,
    world: phone
      ? "It helps to know what’s beyond your village. A port on a trade route lives differently from a lonely moon outpost. What’s the wider world like?"
      : "Knowing what’s beyond the village helps me draft a home that fits. A stop on a busy trade route feels different from an outpost on an isolated moon. What’s the wider world like? A sentence will do. If you’re still figuring it out, we can skip ahead.",
    lorebooks:
      "Lorebooks can fill in details for the draft, like local customs or who already lives there. Do you have any you’d like me to read? Homework is optional, I promise.",
    village: confirmReplace
      ? "Hang on, there’s already something here. If I draft it again, I’ll replace what’s in your setting, including any world name and rules. Want me to go ahead?"
      : setupSuggestionsBusy && waitingForMari
        ? "I’m putting it together. Keep editing if inspiration rudely interrupts."
        : phone && waitingForMari
          ? "I still have your draft request. Want me to check on it?"
          : drafted
            ? "There’s your draft. Go ahead and meddle with the name, starting location, or description. That’s the fun bit."
            : "This is where your story starts. A few details about everyday life will help me draft a name, a starting location, and a description. Where do these people call home, and what’s it like there? Give me the messy version.",
  }[beat];
  const submitBrief = () => {
    if (!canDraft) return;
    if (phone) openPrompt();
    const { setupName, setupLocationName, setupSetting, setupWorldName, setupContext } = controller;
    if (
      !waitingForMari &&
      [setupName, setupLocationName, setupSetting, setupWorldName, setupContext.rules].some((value) => value.trim())
    )
      setConfirmReplace(true);
    else void draftSetupSetting("request");
  };
  const worldField = (
    <FoundingField title={phone ? "World description" : "The larger world"} optional={!phone}>
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
  );
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
    const describingWorld = mobilePrompt === "world";
    return (
      <form
        className="villages-founding-mobile-menu villages-forging-card"
        aria-labelledby="founding-prompt-title"
        autoComplete="off"
        onSubmit={(event) => {
          event.preventDefault();
          if (describingWorld) moveTo("lorebooks");
          else submitBrief();
        }}
      >
        <h2 id="founding-prompt-title" tabIndex={-1} ref={promptTitle}>
          {describingWorld ? "The wider world" : "Tell Mari about your village"}
        </h2>
        {describingWorld ? (
          worldField
        ) : (
          <>
            {briefField}
            {loreNotice}
          </>
        )}
        <div className="villages-founding-menu-actions">
          <button type="button" onClick={() => openPrompt()}>
            Back to Mari
          </button>
          <button
            type="submit"
            className="villages-forging-primary"
            disabled={describingWorld ? !world.trim() : !canDraft}
          >
            {describingWorld ? "Use this world" : drafted ? "Draft again with Mari" : "Draft with Mari"}
          </button>
        </div>
      </form>
    );
  }
  return (
    <section className="villages-setting-guide" aria-label={title ? undefined : "Professor Mari"}>
      <div className="villages-setting-stage" aria-hidden="true">
        <img key={pose} src={foundingMariSprite(pose)} alt="" />
        {title ? <img className="villages-mari-looking-up" src={foundingMariSprite("looking-up")} alt="" /> : null}
      </div>
      {title}
      <div className="villages-setting-dialogue" hidden={!!title}>
        <FoundingSpeaker pose={pose} />
        <p aria-live="polite" tabIndex={-1} ref={lineRef}>
          {dialogue}
        </p>
        {beat === "welcome" ? (
          <div className="villages-founding-replies">
            <button type="button" className="villages-forging-primary" onClick={() => moveTo("world")}>
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
        {beat === "world" && phone ? (
          <div className="villages-founding-replies">
            <button type="button" className="villages-forging-primary" onClick={() => openPrompt("world")}>
              Describe the world
            </button>
            <button type="button" onClick={() => moveTo("lorebooks")}>
              {world.trim() ? "Use this world" : "Skip for now"}
            </button>
            <button type="button" onClick={() => moveTo("welcome")}>
              Back
            </button>
          </div>
        ) : beat === "world" ? (
          <>
            {worldField}
            <div className="villages-founding-replies">
              <button type="button" onClick={() => moveTo("welcome")}>
                Back
              </button>
              <button type="button" className="villages-forging-primary" onClick={() => moveTo("lorebooks")}>
                {world.trim() ? "Use this world" : "I only know the village so far"}
              </button>
            </div>
          </>
        ) : null}
        {beat === "lorebooks" ? (
          <div className="villages-founding-replies">
            <button type="button" onClick={() => moveTo("world")}>
              Back
            </button>
            <VillageLorebookPicker
              books={controller.lorebooks}
              error={controller.lorebooksError}
              selected={controller.setupLorebookDraft}
              onChange={(ids) => {
                controller.setSetupLorebookDraft(ids);
                moveTo("village");
              }}
              disabled={controller.busy || setupSuggestionsBusy}
              triggerLabel={pickedBooks ? "Change lorebooks" : "Choose lorebooks"}
            />
            <button type="button" onClick={() => moveTo("village")}>
              {pickedBooks > 0 ? "Keep selected lorebooks" : "Skip for now"}
            </button>
          </div>
        ) : null}
        {beat === "village" && confirmReplace ? (
          <div className="villages-founding-replies">
            <button
              type="button"
              onClick={() => {
                setConfirmReplace(false);
                if (phone) openPrompt("brief");
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
              ) : (
                <button
                  type="button"
                  className="villages-forging-primary"
                  ref={drafted ? editSettingButton : undefined}
                  onClick={() => (drafted ? onEditSetting() : openPrompt("brief"))}
                >
                  {drafted ? "Review setting" : "Describe your village"}
                </button>
              )}
              <button
                type="button"
                ref={drafted ? undefined : editSettingButton}
                onClick={() => (drafted ? openPrompt("brief") : onEditSetting())}
              >
                {drafted ? "Draft again" : "Edit setting"}
              </button>
              {connectionError ? (
                <button type="button" onClick={onConnections}>
                  Model Connections
                </button>
              ) : null}
              {dismiss}
              {!waitingForMari && !setupSuggestionsBusy ? (
                <button type="button" onClick={() => moveTo("lorebooks")}>
                  Back
                </button>
              ) : null}
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
                onClick={() => moveTo("lorebooks")}
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
              <button
                type="button"
                ref={editSettingButton}
                className="villages-setting-edit-link"
                onClick={onEditSetting}
              >
                {drafted ? "Review setting" : "Edit setting"}
              </button>
              {dismiss}
              {next}
            </div>
          </form>
        ) : null}
      </div>
    </section>
  );
}
