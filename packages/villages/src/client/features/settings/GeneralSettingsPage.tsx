import type { VillageBackgroundPace, VillageSettings } from "../../../shared/contracts/village.js";
import { ELEMENT_TAG } from "../../shared/constants.js";
import { AgentConnectionsControls } from "./AgentConnections.js";
import type { GeneralSettingsPagePorts } from "./page-contracts.js";
import { VillageWritingSettings } from "./WritingSettings.js";

export function renderGeneralSettingsPage(ports: GeneralSettingsPagePorts) {
  const {
    category,
    writing,
    connections,
    busy,
    resetArmed,
    saveCharacterSpeechColors,
    saveSendOnEnter,
    saveBackgroundPace,
    saveVisitRetention,
    setResetArmed,
    settingsError,
    snapshot,
    startOver,
  } = ports;
  return (
    <section className={`${ELEMENT_TAG}-panel ${ELEMENT_TAG}-menu-content`} role="main">
      {category === "general" ? (
        <>
          {snapshot?.isFounded ? <VillageWritingSettings writing={writing} /> : null}

          {snapshot ? (
            <div className={`${ELEMENT_TAG}-field`}>
              <label className={`${ELEMENT_TAG}-row`} htmlFor={`${ELEMENT_TAG}-send-on-enter`}>
                <input
                  autoComplete="off"
                  id={`${ELEMENT_TAG}-send-on-enter`}
                  type="checkbox"
                  checked={snapshot.settings.sendOnEnter === true}
                  disabled={busy}
                  onChange={(event) => void saveSendOnEnter(event.target.checked)}
                />
                <span>Send on Enter</span>
              </label>
            </div>
          ) : null}

          {snapshot ? (
            <div className={`${ELEMENT_TAG}-field`}>
              <label className={`${ELEMENT_TAG}-row`} htmlFor={`${ELEMENT_TAG}-speech-colors`}>
                <input
                  autoComplete="off"
                  id={`${ELEMENT_TAG}-speech-colors`}
                  type="checkbox"
                  checked={snapshot.settings.characterSpeechColors}
                  disabled={busy}
                  onChange={(event) => void saveCharacterSpeechColors(event.target.checked)}
                />
                <span>Character chat colors</span>
              </label>
            </div>
          ) : null}

          {snapshot ? (
            <div className={`${ELEMENT_TAG}-field`}>
              <label className={`${ELEMENT_TAG}-label`} htmlFor={`${ELEMENT_TAG}-background-pace`}>
                Resident activity and Wishes
              </label>
              <select
                id={`${ELEMENT_TAG}-background-pace`}
                value={snapshot.settings.backgroundPace}
                disabled={busy}
                onChange={(event) => void saveBackgroundPace(event.target.value as VillageBackgroundPace)}
              >
                {snapshot.settings.backgroundPaces.map((pace) => (
                  <option key={pace} value={pace}>
                    {pace.charAt(0).toUpperCase() + pace.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </>
      ) : (
        <>
          <AgentConnectionsControls connections={connections} disabled={busy} />
          {snapshot ? (
            <div className={`${ELEMENT_TAG}-field`}>
              <label className={`${ELEMENT_TAG}-label`} htmlFor={`${ELEMENT_TAG}-visit-retention`}>
                Scene transcripts
              </label>
              <p className={`${ELEMENT_TAG}-empty`}>
                Exact Scene logs are kept forever by default. Automatic cleanup skips Scenes with memory pending and
                keeps filed memories and world changes.
              </p>
              <select
                id={`${ELEMENT_TAG}-visit-retention`}
                value={snapshot.settings.visitRetention.mode}
                disabled={busy}
                onChange={(event) => {
                  const mode = event.target.value as VillageSettings["visitRetention"]["mode"];
                  void saveVisitRetention({ mode, value: mode === "count" ? 100 : mode === "days" ? 365 : 0 });
                }}
              >
                <option value="forever">Keep forever</option>
                <option value="count">Keep latest Scenes</option>
                <option value="days">Retire after days</option>
              </select>
              {snapshot.settings.visitRetention.mode !== "forever" ? (
                <input
                  autoComplete="off"
                  key={`${snapshot.settings.visitRetention.mode}:${snapshot.settings.visitRetention.value}`}
                  type="number"
                  aria-label={
                    snapshot.settings.visitRetention.mode === "count"
                      ? "Number of Scenes to keep"
                      : "Days to keep Scenes"
                  }
                  min={snapshot.settings.visitRetention.mode === "count" ? 1 : 30}
                  max={snapshot.settings.visitRetention.mode === "count" ? 1000 : 3650}
                  defaultValue={snapshot.settings.visitRetention.value}
                  onBlur={(event) => {
                    const value = Number(event.target.value);
                    if (value !== snapshot.settings.visitRetention.value)
                      void saveVisitRetention({ mode: snapshot.settings.visitRetention.mode, value });
                  }}
                />
              ) : null}
            </div>
          ) : null}

          <div className={`${ELEMENT_TAG}-field`}>
            <span className={`${ELEMENT_TAG}-label`}>Erase Village</span>
            <p className={`${ELEMENT_TAG}-empty`}>
              Permanently erase this Village and its progress. This cannot be undone.
            </p>
            <div className={`${ELEMENT_TAG}-row`}>
              {resetArmed ? (
                <>
                  <button
                    type="button"
                    className={`${ELEMENT_TAG}-button ${ELEMENT_TAG}-danger`}
                    disabled={busy || writing.busy || connections.saving}
                    onClick={() => void startOver()}
                  >
                    Erase Village permanently
                  </button>
                  <button
                    type="button"
                    className={`${ELEMENT_TAG}-button`}
                    disabled={busy}
                    onClick={() => setResetArmed(false)}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className={`${ELEMENT_TAG}-button`}
                  disabled={busy || writing.busy || connections.saving || !snapshot}
                  onClick={() => setResetArmed(true)}
                >
                  Erase Village
                </button>
              )}
            </div>
          </div>
        </>
      )}
      {settingsError ? (
        <p className={`${ELEMENT_TAG}-error`} role="alert">
          {settingsError}
        </p>
      ) : null}
    </section>
  );
}
