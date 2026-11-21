import { ELEMENT_TAG } from "../../shared/constants.js";
import { SpriteVisualSettings } from "./SpriteVisualSettings.js";
import { MapsPanel } from "./MapsPanel.js";
import { WorldNameSettings } from "./WorldNameSettings.js";

import { LoreTokenBudgetField, VillageLorebookPicker } from "../founding/FoundingPanels.js";
import { SceneryStyleFields } from "../founding/villages-founding-editor";
import type { VillageSettingsPagePorts } from "./page-contracts.js";

export function renderVillageSettingsPage(ports: VillageSettingsPagePorts) {
  const {
    category,
    busy,
    loreTokenBudgetDraft,
    lorebookDraft,
    lorebooks,
    lorebooksError,
    mobile,
    scenerySettings,
    spriteVisualSettings,
    saveSettings,
    sceneryStyle,
    sceneryStyleProfileId,
    setLoreTokenBudgetDraft,
    setLorebookDraft,
    setSceneryStyle,
    setSceneryStyleProfileId,
    settingsError,
    snapshot,
  } = ports;
  return (
    <div className={`${ELEMENT_TAG}-menu-body ${ELEMENT_TAG}-menu-content`} role="main">
      {category === "visual" ? (
        <>
          <SpriteVisualSettings settings={spriteVisualSettings} disabled={busy} />
          <section className={ELEMENT_TAG + "-venue-card"}>
            <label>
              <input
                autoComplete="off"
                type="checkbox"
                disabled={busy && !scenerySettings.saving}
                aria-describedby={`${ELEMENT_TAG}-dynamic-images-help`}
                checked={
                  scenerySettings.draft.automaticZonePictures ?? snapshot.settings.automaticZonePictures !== false
                }
                onChange={(event) => void scenerySettings.save({ automaticZonePictures: event.target.checked })}
              />
              Dynamic Images
            </label>
            <small id={`${ELEMENT_TAG}-dynamic-images-help`} className={`${ELEMENT_TAG}-hint`}>
              Refresh Zone pictures after lasting changes. Uses image generation.
            </small>
            <SceneryStyleFields
              disabled={busy && !scenerySettings.saving}
              hint="Used for new map and Venue artwork. Existing pictures stay unchanged."
              value={sceneryStyle}
              profileId={sceneryStyleProfileId}
              onChange={setSceneryStyle}
              onProfileChange={setSceneryStyleProfileId}
              onCommit={(next, debounce) =>
                void scenerySettings.save(
                  { sceneryArtStyle: next.value, sceneryStyleProfileId: next.profileId },
                  debounce,
                )
              }
            />
            {scenerySettings.saving ? (
              <p role="status" className={`${ELEMENT_TAG}-hint`}>
                Saving…
              </p>
            ) : null}
            {scenerySettings.error ? (
              <p role="alert" className={`${ELEMENT_TAG}-error`}>
                {scenerySettings.error}
                <button
                  type="button"
                  className={`${ELEMENT_TAG}-button`}
                  disabled={busy}
                  onClick={() => void scenerySettings.retry()}
                >
                  Retry
                </button>
              </p>
            ) : null}
          </section>
        </>
      ) : (
        <>
          <p>
            Village timezone · <strong>{snapshot.clock?.timeZone || snapshot.village.timeZone}</strong>
          </p>
          {snapshot ? (
            <section className={`${ELEMENT_TAG}-panel`}>
              <fieldset disabled={busy} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
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
              </fieldset>
            </section>
          ) : null}
        </>
      )}
      {settingsError ? (
        <p className={`${ELEMENT_TAG}-error`} role="alert">
          {settingsError}
        </p>
      ) : null}
    </div>
  );
}
