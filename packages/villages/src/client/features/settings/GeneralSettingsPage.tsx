import type { VillageSettings, VillageBackgroundPace } from "../../../shared/contracts/village.js";
import { ELEMENT_TAG } from "../../shared/constants.js";
import type { GeneralSettingsPagePorts } from "./page-contracts.js";
import { VillageWritingSettings } from "./WritingSettings.js";
import { AgentConnections } from "./AgentConnections.js";

export function renderGeneralSettingsPage(ports: GeneralSettingsPagePorts) {
  const {
    category,
    backgroundPanel,
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
          {snapshot?.isFounded ? <VillageWritingSettings /> : null}

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
          {backgroundPanel}
          <AgentConnections />
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
            <span className={`${ELEMENT_TAG}-label`}>Starting over</span>
            <p className={`${ELEMENT_TAG}-empty`}>
              This is not the same thing. It takes the village apart completely — the villagers, their conversations,
              the places, your own details and the map — and hands you an empty one. There is no way back.
            </p>
            <div className={`${ELEMENT_TAG}-row`}>
              {resetArmed ? (
                <>
                  <button
                    type="button"
                    className={`${ELEMENT_TAG}-button ${ELEMENT_TAG}-danger`}
                    disabled={busy}
                    onClick={() => void startOver()}
                  >
                    Yes, empty the village
                  </button>
                  <button
                    type="button"
                    className={`${ELEMENT_TAG}-button`}
                    disabled={busy}
                    onClick={() => setResetArmed(false)}
                  >
                    Keep it
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className={`${ELEMENT_TAG}-button`}
                  disabled={busy || !snapshot}
                  onClick={() => setResetArmed(true)}
                >
                  Reset the village and start over
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
