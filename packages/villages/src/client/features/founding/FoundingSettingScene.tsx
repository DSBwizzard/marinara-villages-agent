import { FOUNDING_SETTING_BRIEF_LIMIT, type FoundingSetting } from "../../../shared/contracts/founding.js";
import { useRef, type ReactNode, type Ref } from "react";
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
  onConnections,
  onEditSetting,
  onBeatChange,
  editSettingButton,
  next,
}: {
  controller: FoundingScreenController;
  onConnections(): void;
  onEditSetting(): void;
  onBeatChange(): void;
  editSettingButton: Ref<HTMLButtonElement>;
  next: ReactNode;
}) {
  const { setupWorkspace, setSetupWorkspace, setupSuggestionsBusy, draftSetupSetting } = controller;
  const beat = settingBeat(setupWorkspace);
  const lineRef = useRef<HTMLParagraphElement>(null);
  const moveTo = (settingBeat: SettingBeat) => {
    setSetupWorkspace((workspace) => ({ ...workspace, settingBeat }));
    onBeatChange();
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
  const dialogue = {
    welcome:
      "Villages is about sharing life with a community. It could be a town, a ship’s crew, or the people in one building. We’ll start with their world, then choose who lives there and where they spend their days.",
    world: "What’s the larger world like? A sentence is plenty. It’ll help me suggest a place that fits.",
    lorebooks:
      "Do you have any lorebooks about this world or its people? I can use the entries that fit your idea when I draft.",
    village:
      setupSuggestionsBusy && waitingForMari
        ? "I’m putting those details together. You can keep editing your setting."
        : drafted
          ? "How does that feel? Look over the setting before we meet your villagers."
          : "Tell me about this village. Who calls it home, and where should we begin?",
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
              Let’s get started
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
        {beat === "village" ? (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void draftSetupSetting(true);
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
              <button
                type="submit"
                className="villages-forging-primary"
                disabled={
                  !brief.trim() ||
                  controller.busy ||
                  setupSuggestionsBusy ||
                  !!controller.draftSaveError ||
                  (!!pending && !waitingForMari)
                }
              >
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
                Edit setting
              </button>
              {waitingForMari && !setupSuggestionsBusy ? (
                <button
                  type="button"
                  onClick={() =>
                    setSetupWorkspace((workspace) =>
                      workspace.suggestionRequest?.id === request.id
                        ? { ...workspace, suggestionRequest: undefined, settingProblem: undefined }
                        : workspace,
                    )
                  }
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

export function SettingProposal({
  proposal,
  title,
  value,
  onUse,
  onDismiss,
}: {
  proposal: FoundingSetting[keyof FoundingSetting] | undefined;
  title: string;
  value: string;
  onUse(value: string): void;
  onDismiss(): void;
}) {
  if (!proposal || proposal === value) return null;
  return (
    <div className="villages-setting-proposal">
      <strong>{title}</strong>
      <p>{proposal}</p>
      <div>
        <button type="button" onClick={() => onUse(proposal)}>
          Use suggestion
        </button>
        <button type="button" onClick={onDismiss}>
          Dismiss
        </button>
      </div>
    </div>
  );
}
