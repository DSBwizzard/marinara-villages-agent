import { FOUNDING_SETTING_BRIEF_LIMIT, type FoundingSetting } from "../../../shared/contracts/founding.js";
import type { ReactNode, Ref } from "react";
import { FoundingField } from "./FoundingField.js";
import type { FoundingScreenController } from "./screen-contracts.js";

const art = "/api/capability-packages/villages/assets/mari-founding-";
export const foundingMariSprite = (pose: "neutral" | "happy" | "playful") => art + pose + ".webp";

export function FoundingSettingScene({
  controller,
  onConnections,
  onEditSetting,
  editSettingButton,
  next,
}: {
  controller: FoundingScreenController;
  onConnections(): void;
  onEditSetting(): void;
  editSettingButton: Ref<HTMLButtonElement>;
  next: ReactNode;
}) {
  const { setupWorkspace, setSetupWorkspace, setupSuggestionsBusy, draftSetupSetting } = controller;
  const request = setupWorkspace.suggestionRequest;
  const pending = request && !request.failure;
  const waitingForMari = pending && request.draftSetting;
  const error = setupWorkspace.settingProblem || (request?.draftSetting ? request.failure : "");
  const connectionError = !!error && /connection|model.*not found/iu.test(error);
  const drafted = !!setupWorkspace.settingDraft && !waitingForMari;
  const pose = drafted ? "happy" : "neutral";
  const brief = setupWorkspace.settingBrief ?? "";
  return (
    <section className="villages-setting-guide" aria-label="Professor Mari">
      <div className="villages-setting-stage" aria-hidden="true">
        <img key={pose} src={foundingMariSprite(pose)} alt="" />
      </div>
      <div className="villages-setting-dialogue">
        <strong>Professor Mari</strong>
        <p aria-live="polite">
          {setupSuggestionsBusy && waitingForMari
            ? "I’m putting those details together. You can keep editing your setting."
            : drafted
              ? "How does that feel? Look over the setting before we meet your villagers."
              : "Where do your people call home? Tell me a little about it so I can draft your setting."}
        </p>
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
          {error ? (
            <p role="alert">
              {/Language model connection not found/iu.test(error)
                ? "The System connection is unavailable. Choose another connection or review it in Engine."
                : error}
            </p>
          ) : null}
          <div className="villages-setting-dialogue-actions">
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
