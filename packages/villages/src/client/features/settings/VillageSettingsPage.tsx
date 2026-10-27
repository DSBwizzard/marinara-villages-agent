import { MapsPanel } from "./MapsPanel.js";
import { WorldNameSettings } from "./WorldNameSettings.js";
import { ELEMENT_TAG } from "../../shared/constants.js";

import { VillageLorebookPicker, LoreTokenBudgetField } from "../founding/FoundingPanels.js";
import { SceneryStyleFields } from "../founding/villages-founding-editor";
import type { VillageSettingsPagePorts } from "./page-contracts.js";
import { VillageWritingSettings } from "./WritingSettings.js";

export function renderVillageSettingsPage(ports: VillageSettingsPagePorts) {
  const {
    backgroundPanel,
    busy,
    loreTokenBudgetDraft,
    lorebookDraft,
    lorebooks,
    lorebooksError,
    mobile,
    personalizeHomes,
    saveScenerySettings,
    saveSettings,
    sceneryStyle,
    sceneryStyleProfileId,
    setLoreTokenBudgetDraft,
    setLorebookDraft,
    setPersonalizeHomes,
    setSceneryStyle,
    setSceneryStyleProfileId,
    setVisualLoreDefault,
    settingsError,
    snapshot,
    visualLoreDefault,
  } = ports;
  return (
    <div className={`${ELEMENT_TAG}-menu-body ${ELEMENT_TAG}-menu-content`} role="main">
      <p>
        Village timezone · <strong>{snapshot.clock?.timeZone || snapshot.village.timeZone}</strong>
      </p>
      <section className={ELEMENT_TAG + "-venue-card"}>
        <label>
          <input
            autoComplete="off"
            type="checkbox"
            disabled={busy}
            checked={snapshot.settings.automaticZonePictures !== false}
            onChange={(event) => void saveScenerySettings(event.target.checked)}
          />
          Automatic Zone pictures
        </label>
        <SceneryStyleFields
          value={sceneryStyle}
          profileId={sceneryStyleProfileId}
          onChange={setSceneryStyle}
          onProfileChange={setSceneryStyleProfileId}
        />
        <label>
          <input
            autoComplete="off"
            type="checkbox"
            checked={personalizeHomes}
            onChange={(event) => setPersonalizeHomes(event.target.checked)}
          />
          Personalize new venue images by default
        </label>
        <label>
          <input
            autoComplete="off"
            type="checkbox"
            checked={visualLoreDefault}
            onChange={(event) => setVisualLoreDefault(event.target.checked)}
          />
          Use visual lore by default
        </label>
        <button type="button" disabled={busy} onClick={() => void saveScenerySettings()}>
          Save scenery settings
        </button>
      </section>

      {backgroundPanel}
      {snapshot ? (
        <section className={`${ELEMENT_TAG}-panel`}>
          <h2 className={`${ELEMENT_TAG}-panel-title`}>Village settings</h2>

          <VillageWritingSettings />

          <MapsPanel
            snapshot={snapshot}
            onSnapshot={ports.setSnapshot}
            mobile={mobile}
            reportLocalDraftStatus={ports.reportLocalDraftStatus}
          />

          <WorldNameSettings
            key={snapshot.settings.worldName}
            onSnapshot={ports.setSnapshot}
            initial={snapshot.settings.worldName ?? ""}
            reportLocalDraftStatus={ports.reportLocalDraftStatus}
          />
          <VillageLorebookPicker
            books={lorebooks}
            error={lorebooksError}
            selected={lorebookDraft}
            onChange={setLorebookDraft}
            disabled={busy}
          />
          <LoreTokenBudgetField
            value={loreTokenBudgetDraft}
            onChange={setLoreTokenBudgetDraft}
            min={snapshot.settings.loreTokenBudgetMin ?? 0}
            max={snapshot.settings.loreTokenBudgetMax ?? 3200}
            disabled={busy}
          />

          <div className={`${ELEMENT_TAG}-row`}>
            <button
              type="button"
              className={`${ELEMENT_TAG}-button`}
              onClick={() => void saveSettings()}
              disabled={busy}
            >
              Save settings
            </button>
          </div>
        </section>
      ) : null}

      {settingsError ? (
        <p className={`${ELEMENT_TAG}-error`} role="alert">
          {settingsError}
        </p>
      ) : null}
    </div>
  );
}
