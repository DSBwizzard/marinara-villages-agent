import type { VillageBackgroundPace } from "../../../shared/contracts/village.js";
import { VILLAGE_ACTIVITY_POLICY } from "../../../shared/helpers/activity-policy.js";
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
    saveSendOnEnter,
    saveBackgroundPace,
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
              <label className={`${ELEMENT_TAG}-label`} htmlFor={`${ELEMENT_TAG}-background-pace`}>
                Pace
              </label>
              <select
                id={`${ELEMENT_TAG}-background-pace`}
                value={snapshot.settings.backgroundPace}
                disabled={busy}
                onChange={(event) => void saveBackgroundPace(event.target.value as VillageBackgroundPace)}
              >
                {snapshot.settings.backgroundPaces.map((pace) => (
                  <option key={pace} value={pace}>
                    {VILLAGE_ACTIVITY_POLICY[pace].label}
                  </option>
                ))}
              </select>
              <label className={`${ELEMENT_TAG}-label`} htmlFor={`${ELEMENT_TAG}-consequence`}>
                Consequence
              </label>
              <select
                id={`${ELEMENT_TAG}-consequence`}
                value={snapshot.settings.narrativeConsequence ?? "gentle"}
                disabled={busy}
                onChange={(event) =>
                  void saveBackgroundPace(
                    snapshot.settings.backgroundPace,
                    event.target.value as import("../../../shared/contracts/village.js").VillageNarrativeConsequence,
                  )
                }
              >
                <option value="gentle">Gentle</option>
                <option value="moderate">Moderate</option>
                <option value="dramatic">Dramatic</option>
              </select>
            </div>
          ) : null}
        </>
      ) : (
        <>
          <AgentConnectionsControls connections={connections} disabled={busy} />
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
