import type { VillageSettings, VillageStoryPace } from "../../../shared/contracts/village.js";
import { ELEMENT_TAG } from "../../shared/constants.js";
import { storyPaceSummary } from "../../shared/presentation.js";
import type { MenuScreenController } from "./screen-contracts.js";
import { AgentConnections } from "./SettingsPanels.js";

export function renderGeneralSettingsPage(
  ports: Pick<
    MenuScreenController,
    | "backgroundPanel"
    | "busy"
    | "resetArmed"
    | "saveCharacterSpeechColors"
    | "saveSendOnEnter"
    | "saveStoryPace"
    | "saveVisitRetention"
    | "setResetArmed"
    | "settingsError"
    | "snapshot"
    | "startOver"
  >,
) {
  const {
    backgroundPanel,
    busy,
    resetArmed,
    saveCharacterSpeechColors,
    saveSendOnEnter,
    saveStoryPace,
    saveVisitRetention,
    setResetArmed,
    settingsError,
    snapshot,
    startOver,
  } = ports;
  return (
    <section className={`${ELEMENT_TAG}-panel ${ELEMENT_TAG}-menu-content`} role="main">
      {backgroundPanel}
      <h2 className={`${ELEMENT_TAG}-panel-title`}>General settings</h2>

      {/* Drawn before the village is founded as well as after, because
                these belong to the agent rather than to the village. */}
      <AgentConnections />

      {snapshot ? (
        <div className={`${ELEMENT_TAG}-field`}>
          <label className={`${ELEMENT_TAG}-row`} htmlFor={`${ELEMENT_TAG}-send-on-enter`}>
            <input
              id={`${ELEMENT_TAG}-send-on-enter`}
              type="checkbox"
              checked={snapshot.settings.sendOnEnter === true}
              disabled={busy}
              onChange={(event) => void saveSendOnEnter(event.target.checked)}
            />
            <span>Send on Enter</span>
          </label>
          <span className={`${ELEMENT_TAG}-hint`}>
            Send Scene messages with Enter. Off inserts a new line. Shift+Enter always inserts a new line.
          </span>
        </div>
      ) : null}

      {snapshot ? (
        <div className={`${ELEMENT_TAG}-field`}>
          <label className={`${ELEMENT_TAG}-row`} htmlFor={`${ELEMENT_TAG}-speech-colors`}>
            <input
              id={`${ELEMENT_TAG}-speech-colors`}
              type="checkbox"
              checked={snapshot.settings.characterSpeechColors}
              disabled={busy}
              onChange={(event) => void saveCharacterSpeechColors(event.target.checked)}
            />
            <span>Character chat colors</span>
          </label>
          <span className={`${ELEMENT_TAG}-hint`}>
            Show names and spoken words in the colors captured from each villager’s card. Use Compare card and Apply
            refresh to adopt later color changes.
          </span>
        </div>
      ) : null}

      {snapshot ? (
        <div className={`${ELEMENT_TAG}-field`}>
          <label className={`${ELEMENT_TAG}-label`} htmlFor={`${ELEMENT_TAG}-story-pace`}>
            Background events and wishes
          </label>
          <p className={`${ELEMENT_TAG}-empty`}>
            Controls automatic Events, resident housing proposals from those events, and new wishes. Off pauses these.
            Time, schedules, approved moves, construction, and existing wish expiry continue. Scenes and other
            generation features use their own controls. All enabled levels allow at most one new wish per resident per
            day and two active wishes; quiet days can have none.
          </p>
          <select
            id={`${ELEMENT_TAG}-story-pace`}
            value={snapshot.settings.storyPace}
            disabled={busy}
            onChange={(event) => void saveStoryPace(event.target.value as VillageStoryPace)}
          >
            {snapshot.settings.storyPaces.map((pace) => (
              <option key={pace} value={pace}>
                {pace.charAt(0).toUpperCase() + pace.slice(1)}
              </option>
            ))}
          </select>
          <span className={`${ELEMENT_TAG}-hint`}>{storyPaceSummary(snapshot.settings.storyPace)}</span>
        </div>
      ) : null}

      {snapshot ? (
        <div className={`${ELEMENT_TAG}-field`}>
          <label className={`${ELEMENT_TAG}-label`} htmlFor={`${ELEMENT_TAG}-visit-retention`}>
            Scene transcripts
          </label>
          <p className={`${ELEMENT_TAG}-empty`}>
            Exact Scene logs are kept forever by default. Automatic cleanup skips Scenes with memory pending and keeps
            filed memories and world changes.
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
              key={`${snapshot.settings.visitRetention.mode}:${snapshot.settings.visitRetention.value}`}
              type="number"
              aria-label={
                snapshot.settings.visitRetention.mode === "count" ? "Number of Scenes to keep" : "Days to keep Scenes"
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
          This is not the same thing. It takes the village apart completely — the villagers, their conversations, the
          places, the noticeboard, your own details and the map — and hands you an empty one. There is no way back.
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

      {settingsError ? (
        <p className={`${ELEMENT_TAG}-error`} role="alert">
          {settingsError}
        </p>
      ) : null}
    </section>
  );
}
