import type { VillageConnectionSettings } from "../../../shared/contracts/village.js";
import { messageFrom, request, requestHost } from "../../shared/api.js";
import { ELEMENT_TAG, VILLAGES_IMAGE_CONNECTION_DISABLED } from "../../shared/constants.js";
import { connectionOptionsFrom } from "../../shared/presentation.js";
import type { EngineConnectionRow, VillageConnectionOption } from "../../shared/types.js";
import { useCallback, useEffect, useState } from "react";
/**
 * One connection picker.
 *
 * `Engine default` is the first option and the empty string, which is what the
 * server stores to mean "let the Engine choose". It is deliberately not a
 * fabricated id: an agent that has never been set up has no connection to name,
 * and the Engine already knows what to do with that.
 *
 * A choice whose connection has since been deleted still has to be drawn. A
 * `<select>` whose value matches no option silently shows its first one, so the
 * player would be told they had chosen the Engine default when what is stored
 * is the id of something that is gone. The missing id is added as an option
 * instead, so the box says what is actually saved and the next save can clear
 * it.
 */
function ConnectionPicker({
  id,
  label,
  options,
  value,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  options: readonly VillageConnectionOption[];
  value: string;
  disabled: boolean;
  onChange: (next: string) => void;
}) {
  const gone = value.length > 0 && !options.some((option) => option.id === value);
  return (
    <div className={`${ELEMENT_TAG}-field`}>
      <label className={`${ELEMENT_TAG}-label`} htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        className={`${ELEMENT_TAG}-select`}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Engine default</option>
        {gone ? <option value={value}>Missing — this connection is gone</option> : null}
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * Which connection the village sends which kind of work to.
 *
 * Three pickers rather than one, because the work is not worth the same money.
 * The heavy lifting is one long call about the whole village; the conversations
 * are short and frequent; pictures are drawn only ever because somebody pressed
 * a button. A player on one good model and one cheap one should be able to say
 * so.
 *
 * Read and written through routes of its own rather than the settings patch.
 * These choices belong to the AGENT and not to the village, and emptying the
 * village would otherwise take them with it — which is exactly the setting
 * nobody wants to enter twice.
 */
export function AgentConnections({
  onSetupProblem,
  onImageWarningChange,
  compact = false,
}: {
  onSetupProblem?: (problem: string) => void;
  onImageWarningChange?: (needed: boolean) => void;
  compact?: boolean;
}) {
  const [settings, setSettings] = useState<VillageConnectionSettings | null>(null);
  const [options, setOptions] = useState<VillageConnectionOption[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  /**
   * Read once, when the panel is first drawn.
   *
   * Two servers, one screen, and they have to agree before anything is drawn:
   * the Engine knows which connections exist, the village knows which were
   * chosen. A picker built from one of them alone would either offer nothing or
   * offer something the save cannot honour, so a failure in either is reported
   * as the panel failing rather than half-drawn.
   */
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [chosen, rows] = await Promise.all([
          request<VillageConnectionSettings>("/connections"),
          requestHost<EngineConnectionRow[]>("/api/connections"),
        ]);
        if (cancelled) return;
        setSettings(chosen);
        setOptions(connectionOptionsFrom(Array.isArray(rows) ? rows : []));
      } catch (cause) {
        if (!cancelled) setError(messageFrom(cause, "This agent's connections could not be read."));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Save the moment a picker moves, the same way the automatic-update switches
   * do. The reply is what was actually stored rather than what was sent, so
   * every box is redrawn from the server's own answer — a picker that showed a
   * choice the server refused would be worse than one that showed nothing.
   */
  const choose = useCallback(
    async (patch: { systemConnectionId?: string; narrationConnectionId?: string; imageConnectionId?: string }) => {
      setBusy(true);
      setError("");
      try {
        setSettings(
          await request<VillageConnectionSettings>("/connections", { method: "PUT", body: JSON.stringify(patch) }),
        );
      } catch (cause) {
        setError(messageFrom(cause, "That connection could not be saved."));
      } finally {
        setBusy(false);
      }
    },
    [],
  );

  const talk = options.filter((option) => option.category === "language");
  const pictures = options.filter((option) => option.category === "image_generation");
  const hasEngineImageDefault = pictures.some((option) => option.defaultForAgents);
  const imageNeedsWarning =
    settings !== null &&
    (settings.imageConnectionId === VILLAGES_IMAGE_CONNECTION_DISABLED ||
      pictures.length === 0 ||
      (settings.imageConnectionId.length === 0 && !hasEngineImageDefault));

  useEffect(() => {
    if (!onSetupProblem) return;
    const systemId = settings?.systemConnectionId ?? "";
    const narrationId = settings?.narrationConnectionId ?? "";
    if (!settings) {
      onSetupProblem("Connections are still loading.");
    } else if (systemId.length === 0 || narrationId.length === 0) {
      onSetupProblem("Choose both System and Narration connections before continuing.");
    } else if (!talk.some((option) => option.id === systemId) || !talk.some((option) => option.id === narrationId)) {
      onSetupProblem("Choose available language connections for System and Narration.");
    } else {
      onSetupProblem("");
    }
  }, [onSetupProblem, settings, talk]);

  useEffect(() => {
    onImageWarningChange?.(imageNeedsWarning);
  }, [imageNeedsWarning, onImageWarningChange]);

  return (
    <div className={`${ELEMENT_TAG}-field ${compact ? `${ELEMENT_TAG}-connections-compact` : ""}`}>
      <span className={`${ELEMENT_TAG}-label`}>Connections</span>
      {settings ? (
        <div className={compact ? `${ELEMENT_TAG}-connections-grid` : ""}>
          <ConnectionPicker
            id={`${ELEMENT_TAG}-connection-system`}
            label="System"
            options={talk}
            value={settings.systemConnectionId}
            disabled={busy}
            onChange={(next) => void choose({ systemConnectionId: next })}
          />
          <ConnectionPicker
            id={`${ELEMENT_TAG}-connection-narration`}
            label="Narration"
            options={talk}
            value={settings.narrationConnectionId}
            disabled={busy}
            onChange={(next) => void choose({ narrationConnectionId: next })}
          />
          <div className={`${ELEMENT_TAG}-field`}>
            <label className={`${ELEMENT_TAG}-label`} htmlFor={`${ELEMENT_TAG}-connection-image`}>
              Images
            </label>
            <select
              id={`${ELEMENT_TAG}-connection-image`}
              className={`${ELEMENT_TAG}-select`}
              value={settings.imageConnectionId}
              disabled={busy}
              onChange={(event) => void choose({ imageConnectionId: event.target.value })}
            >
              <option value={VILLAGES_IMAGE_CONNECTION_DISABLED}>Disabled</option>
              <option value="">Use Engine default</option>
              {settings.imageConnectionId.length > 0 &&
              settings.imageConnectionId !== VILLAGES_IMAGE_CONNECTION_DISABLED &&
              !pictures.some((option) => option.id === settings.imageConnectionId) ? (
                <option value={settings.imageConnectionId}>Missing — this connection is gone</option>
              ) : null}
              {pictures.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : error.length === 0 ? (
        <span className={`${ELEMENT_TAG}-hint`}>Reading this agent&apos;s connections…</span>
      ) : null}
      {error ? (
        <p className={`${ELEMENT_TAG}-error`} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
