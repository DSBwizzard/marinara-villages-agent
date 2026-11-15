import { FOUNDING_SETTING_BRIEF_LIMIT } from "../../../shared/contracts/founding.js";
import { useEffect, useRef, useState, type ReactNode, type Ref } from "react";
import { FoundingField } from "./FoundingField.js";
import { VillageLorebookPicker } from "./FoundingPanels.js";
import type { FoundingScreenController } from "./screen-contracts.js";

type SettingBeat = NonNullable<FoundingScreenController["setupWorkspace"]["settingBeat"]>;
export function settingBeat(workspace: FoundingScreenController["setupWorkspace"]): SettingBeat {
  return workspace.settingBeat ?? (workspace.suggestionRequest?.draftSetting ? "village" : "welcome");
}

const art = "/api/capability-packages/villages/assets/mari-founding-";
export const foundingMariSprite = (pose: "neutral" | "happy" | "playful") => art + pose + ".webp";

export function FoundingSettingScene({
  controller,
  enteringScene,
  onConnections,
  onEditSetting,
  onBeatChange,
  editSettingButton,
  next,
}: {
  controller: FoundingScreenController;
  enteringScene: boolean;
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
  useEffect(() => {
    if (enteringScene) lineRef.current?.focus({ preventScroll: true });
  }, [enteringScene]);
  useEffect(() => {
    if (confirmReplace) lineRef.current?.focus();
  }, [confirmReplace]);
  const moveTo = (settingBeat: SettingBeat) => {
    const openEditor =
      settingBeat === "village" &&
      !!setupWorkspace.settingDraft &&
      !setupWorkspace.settingProblem &&
      !setupWorkspace.suggestionRequest?.draftSetting;
    setSetupWorkspace((workspace) => ({ ...workspace, settingBeat, settingEditorOpen: openEditor }));
    onBeatChange();
    if (!openEditor || !window.matchMedia("(max-width:727px)").matches)
      requestAnimationFrame(() => lineRef.current?.focus());
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
  const canDraft =
    !!brief.trim() &&
    !controller.busy &&
    !setupSuggestionsBusy &&
    !controller.draftSaveError &&
    (!pending || waitingForMari);
  const dialogue = {
    welcome:
      "Hey, you made it. I’m Mari. In Villages, you live alongside a community. A ship’s crew counts. So does one suspiciously dramatic apartment building. We’ll start with their world, then pick the people and places.",
    world:
      "Give me a sentence about the wider world. It’ll help me draft a starting place that fits. Save volume twelve for office hours.",
    lorebooks:
      "Got lorebooks about this world or its people? Pick what you want me to read. I’ll use the relevant bits in your draft. Yes, the reading is optional.",
    village: confirmReplace
      ? "Hang on, there’s already something here. If I draft it again, I’ll replace what’s in your setting, including any world name and rules. Want me to go ahead?"
      : setupSuggestionsBusy && waitingForMari
        ? "I’m putting it together. Keep editing if inspiration rudely interrupts."
        : drafted
          ? "There’s your draft. Go ahead and meddle with the name, starting location, or description. That’s the fun bit."
          : "Where do these people call home? Give me the messy version. I’ll draft the name, starting location, and description.",
  }[beat];
  return (
    <section className="villages-setting-guide" aria-label="Professor Mari">
      <div className="villages-setting-stage" aria-hidden="true">
        <img key={pose} src={foundingMariSprite(pose)} alt="" />
      </div>
      <div className="villages-setting-dialogue">
        <strong>Professor Mari</strong>
        <p aria-live="polite" tabIndex={-1} ref={lineRef}>
          {dialogue}
        </p>
        {beat === "welcome" ? (
          <div className="villages-founding-replies">
            <button type="button" className="villages-forging-primary" onClick={() => moveTo("world")}>
              Let’s talk about the world
            </button>
          </div>
        ) : null}
        {beat === "world" ? (
          <>
            <FoundingField title="The larger world" optional>
              <textarea
                autoComplete="off"
                rows={2}
                maxLength={FOUNDING_SETTING_BRIEF_LIMIT}
                value={world}
                placeholder="A network of settlements on old cargo routes…"
                onChange={(event) => {
                  const value = event.currentTarget.value;
                  setSetupWorkspace((workspace) => ({ ...workspace, settingWorldBrief: value }));
                }}
              />
            </FoundingField>
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
                requestAnimationFrame(() => draftButton.current?.focus());
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
        {beat === "village" && !confirmReplace ? (
          <form
            autoComplete="off"
            onSubmit={(event) => {
              event.preventDefault();
              if (!canDraft) return;
              const { setupName, setupLocationName, setupSetting, setupWorldName, setupContext } = controller;
              if (
                !waitingForMari &&
                [setupName, setupLocationName, setupSetting, setupWorldName, setupContext.rules].some((value) =>
                  value.trim(),
                )
              ) {
                setConfirmReplace(true);
              } else {
                void draftSetupSetting("request");
              }
            }}
          >
            <FoundingField title="Tell Mari about your village">
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
            {pickedBooks > 0 ? (
              <p className="villages-setting-lore-notice">
                {pickedBooks} {pickedBooks === 1 ? "lorebook" : "lorebooks"} selected for drafting
              </p>
            ) : null}
            {error ? (
              <p role="alert">
                {/Language model connection not found/iu.test(error)
                  ? "The System connection is unavailable. Choose another connection or review it in Engine."
                  : error}
              </p>
            ) : null}
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
              {waitingForMari && !setupSuggestionsBusy ? (
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
              ) : null}
              {next}
            </div>
          </form>
        ) : null}
      </div>
    </section>
  );
}
