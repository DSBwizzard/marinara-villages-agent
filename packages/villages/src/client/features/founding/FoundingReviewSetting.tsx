import type { ReactNode } from "react";
import { FOUNDING_SETTING_BRIEF_LIMIT } from "../../../shared/contracts/founding.js";
import { FoundingField } from "./FoundingField.js";
import { VillageLorebookPicker } from "./FoundingPanels.js";
import type { FoundingScreenController } from "./screen-contracts.js";

export type ReviewSettingSection = "World" | "Village" | "Map" | "Lorebooks";

export function FoundingReviewSetting({
  controller,
  villageName,
  mapFields,
  disabled,
  section,
  onSection,
  villageBriefError,
}: {
  controller: FoundingScreenController;
  villageName: ReactNode;
  mapFields: ReactNode;
  disabled: boolean;
  section: ReviewSettingSection;
  onSection(section: ReviewSettingSection): void;
  villageBriefError: string;
}) {
  return (
    <div className="villages-review-setting-editor">
      <nav aria-label="Setting sections">
        {(["World", "Village", "Map", "Lorebooks"] as const).map((title) => (
          <button type="button" key={title} aria-pressed={section === title} onClick={() => onSection(title)}>
            {title}
          </button>
        ))}
      </nav>
      <fieldset disabled={disabled}>
        {section === "World" ? (
          <>
            <FoundingField title="World name" optional>
              <input
                aria-label="World name"
                autoComplete="off"
                maxLength={120}
                value={controller.setupWorldName}
                onChange={(event) => controller.setSetupWorldName(event.target.value)}
              />
            </FoundingField>
            <FoundingField title="World description" optional>
              <textarea
                rows={2}
                maxLength={FOUNDING_SETTING_BRIEF_LIMIT}
                value={controller.setupWorkspace.settingWorldBrief || ""}
                onChange={(event) => {
                  const settingWorldBrief = event.target.value;
                  controller.setSetupWorkspace((workspace) => ({ ...workspace, settingWorldBrief }));
                }}
              />
            </FoundingField>
            <FoundingField title="World rules" optional>
              <textarea
                rows={2}
                maxLength={4096}
                aria-label="World rules"
                value={controller.setupContext.rules}
                onChange={(event) => {
                  const rules = event.target.value;
                  controller.setSetupContext((context) => ({ ...context, rules }));
                }}
              />
            </FoundingField>
          </>
        ) : section === "Village" ? (
          <>
            {villageName}
            <FoundingField title="What is the village like?" error={villageBriefError}>
              <textarea
                rows={3}
                maxLength={FOUNDING_SETTING_BRIEF_LIMIT}
                value={controller.setupWorkspace.settingBrief || ""}
                onChange={(event) => {
                  const settingBrief = event.target.value;
                  controller.setSetupWorkspace((workspace) => ({ ...workspace, settingBrief }));
                }}
              />
            </FoundingField>
          </>
        ) : section === "Map" ? (
          mapFields
        ) : (
          <VillageLorebookPicker
            books={controller.lorebooks}
            error={controller.lorebooksError}
            selected={controller.setupLorebookDraft}
            onChange={(ids) => {
              controller.setSetupLorebookDraft(ids);
              onSection("Map");
            }}
            founding={{ inline: false, onBack: () => onSection("Map") }}
            disabled={disabled}
            budget={{
              value: controller.setupLoreTokenBudgetDraft,
              onChange: controller.setSetupLoreTokenBudgetDraft,
              min: controller.snapshot?.settings.loreTokenBudgetMin ?? 0,
              max: controller.snapshot?.settings.loreTokenBudgetMax ?? 3200,
              disabled,
            }}
          />
        )}
      </fieldset>
    </div>
  );
}
