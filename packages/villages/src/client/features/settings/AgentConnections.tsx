import { useCallback, useEffect, useRef, useState } from "react";
import type { VillageConnectionSettings } from "../../../shared/contracts/village.js";
import { messageFrom, request, requestHost } from "../../shared/api.js";
import { ELEMENT_TAG, VILLAGES_IMAGE_CONNECTION_DISABLED } from "../../shared/constants.js";
import { connectionOptionsFrom } from "../../shared/presentation.js";
import type { EngineConnectionRow, VillageConnectionOption } from "../../shared/types.js";
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
export function useAgentConnections(enabled: boolean, viewing = false) {
  const [settings, setSettings] = useState<VillageConnectionSettings | null>(null);
  const [options, setOptions] = useState<VillageConnectionOption[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [readFailed, setReadFailed] = useState(false);
  const alive = useRef(false);
  const generation = useRef(0);
  const read = useRef<AbortController | null>(null);
  const saving = useRef(false);
  const refreshAfterSave = useRef(false);

  const refresh = useCallback((force = false) => {
    if (!alive.current) return;
    if (read.current) {
      if (!force) return;
      generation.current++;
      read.current.abort();
      read.current = null;
    }
    if (saving.current) {
      refreshAfterSave.current = true;
      return;
    }
    const controller = new AbortController();
    const current = ++generation.current;
    read.current = controller;
    setRefreshing(true);
    void (async () => {
      try {
        const [chosen, rows] = await Promise.all([
          request<VillageConnectionSettings>("/connections", { signal: controller.signal }),
          requestHost<EngineConnectionRow[]>("/api/connections", { signal: controller.signal }),
        ]);
        if (!alive.current || generation.current !== current) return;
        setSettings(chosen);
        setOptions(connectionOptionsFrom(Array.isArray(rows) ? rows : []));
        setReadFailed(false);
        setError("");
      } catch (cause) {
        if (alive.current && generation.current === current && !controller.signal.aborted) {
          setReadFailed(true);
          setError(messageFrom(cause, "This agent's connections could not be read."));
        }
      } finally {
        if (read.current === controller) read.current = null;
        if (alive.current && generation.current === current) setRefreshing(false);
      }
    })();
  }, []);

  const invalidate = useCallback(() => {
    generation.current++;
    read.current?.abort();
    read.current = null;
  }, []);

  useEffect(() => {
    if (!enabled) {
      setSettings(null);
      setOptions([]);
      setError("");
      setReadFailed(false);
      setRefreshing(false);
      return;
    }
    alive.current = true;
    refresh();
    return () => {
      alive.current = false;
      invalidate();
      refreshAfterSave.current = false;
    };
  }, [enabled, invalidate, refresh]);

  useEffect(() => {
    if (enabled && viewing) refresh(true);
  }, [enabled, viewing, refresh]);

  /**
   * Save the moment a picker moves, the same way the automatic-update switches
   * do. The reply is what was actually stored rather than what was sent, so
   * every box is redrawn from the server's own answer — a picker that showed a
   * choice the server refused would be worse than one that showed nothing.
   */
  const choose = useCallback(
    async (patch: { systemConnectionId?: string; narrationConnectionId?: string; imageConnectionId?: string }) => {
      if (!alive.current || saving.current || read.current || readFailed) return;
      saving.current = true;
      const current = ++generation.current;
      setBusy(true);
      setError("");
      try {
        const next = await request<VillageConnectionSettings>("/connections", {
          method: "PUT",
          body: JSON.stringify(patch),
        });
        if (alive.current && generation.current === current) setSettings(next);
      } catch (cause) {
        if (alive.current && generation.current === current) {
          setReadFailed(true);
          setError(
            messageFrom(cause, "That connection could not be saved. Check the saved connections before continuing."),
          );
        }
      } finally {
        saving.current = false;
        if (alive.current) {
          setBusy(false);
          if (refreshAfterSave.current) {
            refreshAfterSave.current = false;
            refresh();
          }
        }
      }
    },
    [readFailed, refresh],
  );

  return {
    settings,
    options,
    error,
    readFailed,
    saving: busy,
    busy: busy || refreshing || readFailed,
    choose,
    refresh,
  };
}

export function AgentConnections(props: {
  onSetupProblem?: (problem: string) => void;
  onImageWarningChange?: (needed: boolean) => void;
  compact?: boolean;
}) {
  const connections = useAgentConnections(true);
  return <AgentConnectionsControls {...props} connections={connections} />;
}

export function AgentConnectionsControls({
  connections,
  onSetupProblem,
  onImageWarningChange,
  compact = false,
  disabled = false,
}: {
  disabled?: boolean;
  connections: ReturnType<typeof useAgentConnections>;
  onSetupProblem?: (problem: string) => void;
  onImageWarningChange?: (needed: boolean) => void;
  compact?: boolean;
}) {
  const { settings, options, error, readFailed, busy, choose, refresh } = connections;

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
    if (connections.readFailed) {
      onSetupProblem("Check connections before continuing.");
    } else if (connections.saving || !settings) {
      onSetupProblem("Connections are still loading.");
    } else if (systemId.length === 0 || narrationId.length === 0) {
      onSetupProblem("Choose both System and Narration connections before continuing.");
    } else if (!talk.some((option) => option.id === systemId) || !talk.some((option) => option.id === narrationId)) {
      onSetupProblem("Choose available language connections for System and Narration.");
    } else {
      onSetupProblem("");
    }
  }, [connections.readFailed, connections.saving, onSetupProblem, settings, talk]);

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
            disabled={busy || disabled}
            onChange={(next) => void choose({ systemConnectionId: next })}
          />
          <ConnectionPicker
            id={`${ELEMENT_TAG}-connection-narration`}
            label="Narration"
            options={talk}
            value={settings.narrationConnectionId}
            disabled={busy || disabled}
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
              disabled={busy || disabled}
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
          {readFailed ? (
            <button type="button" onClick={() => refresh()}>
              Retry
            </button>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}
