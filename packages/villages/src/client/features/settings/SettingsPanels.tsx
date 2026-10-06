import type { VillageConnectionSettings, VillageWritingView } from "../../../shared/contracts/village.js";
import { messageFrom, request, requestHost } from "../../shared/api.js";
import { ELEMENT_TAG } from "../../shared/constants.js";
import { connectionOptionsFrom } from "../../shared/presentation.js";
import type { EngineConnectionRow, VillageConnectionOption } from "../../shared/types.js";
import { VILLAGES_IMAGE_CONNECTION_DISABLED } from "../founding/FoundingPanels.js";
import { useCallback, useEffect, useState } from "react";

export function VillagesRuntimeDebug() {
  const [settings, setSettings] = useState<{
    verbose: boolean;
    effective: boolean;
    engineEnabled: boolean;
    showUsageMeter?: boolean;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    const visibility = (event: Event) =>
      setSettings((current) =>
        current
          ? {
              ...current,
              showUsageMeter: (event as CustomEvent<boolean>).detail,
            }
          : current,
      );
    window.addEventListener("villages-usage-visibility", visibility);
    void request<{ verbose: boolean; effective: boolean; engineEnabled: boolean }>("/debug/runtime", {
      signal: controller.signal,
    })
      .then(setSettings)
      .catch((cause) => {
        if (!controller.signal.aborted) setError(messageFrom(cause, "Runtime logging settings could not be read."));
      });
    return () => {
      controller.abort();
      window.removeEventListener("villages-usage-visibility", visibility);
    };
  }, []);
  const save = async (verbose: boolean) => {
    const previous = settings;
    if (previous) setSettings({ ...previous, verbose, effective: verbose || previous.engineEnabled });
    setSaving(true);
    setError("");
    try {
      setSettings(await request("/debug/runtime", { method: "PATCH", body: JSON.stringify({ verbose }) }));
    } catch (cause) {
      setSettings(previous);
      setError(messageFrom(cause, "Runtime logging settings could not be saved."));
    } finally {
      setSaving(false);
    }
  };
  return (
    <section className={ELEMENT_TAG + "-panel"}>
      <label>
        <input
          type="checkbox"
          checked={settings?.showUsageMeter !== false}
          disabled={!settings || saving}
          onChange={async (event) => {
            setSaving(true);
            try {
              const next = await request<typeof settings>("/debug/runtime", {
                method: "PATCH",
                body: JSON.stringify({ showUsageMeter: event.currentTarget.checked }),
              });
              setSettings(next);
              window.dispatchEvent(
                new CustomEvent("villages-usage-visibility", { detail: next?.showUsageMeter !== false }),
              );
            } catch (cause) {
              setError(messageFrom(cause, "Usage display setting could not be saved."));
            } finally {
              setSaving(false);
            }
          }}
        />{" "}
        Show AI usage meter
      </label>
      <label>
        <input
          type="checkbox"
          checked={settings?.verbose ?? false}
          disabled={!settings || saving}
          onChange={(event) => void save(event.currentTarget.checked)}
        />{" "}
        Verbose runtime logging
      </label>
      <p className={ELEMENT_TAG + "-status"}>
        Print Villages prompts, replies, routing, and error details to the server terminal. Output includes conversation
        text and private Scene context.
      </p>
      {settings ? (
        <p className={ELEMENT_TAG + "-status"} role="status">
          Terminal logging: {settings.effective ? "on" : "off"}
          {settings.engineEnabled ? " (also enabled by DEBUG_AGENTS)" : ""}.
        </p>
      ) : null}
      {error ? (
        <p className={ELEMENT_TAG + "-status"} role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}

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
  hint,
  options,
  value,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  hint: string;
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
      <span className={`${ELEMENT_TAG}-hint`}>{hint}</span>
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
      {compact ? (
        <p className={`${ELEMENT_TAG}-hint`}>Choose models for village planning, conversations, and artwork.</p>
      ) : (
        <p className={`${ELEMENT_TAG}-empty`}>
          The village spends model calls on three kinds of work, and they are not worth the same money. The heavy
          lifting is one long call about the whole village. The conversations are short and frequent. Pictures are drawn
          only when you ask for one. Leave any of these alone and the agent&apos;s own choice is used.
        </p>
      )}
      {settings ? (
        <div className={compact ? `${ELEMENT_TAG}-connections-grid` : ""}>
          <ConnectionPicker
            id={`${ELEMENT_TAG}-connection-system`}
            label="System"
            hint={
              compact
                ? "Founding, daily planning, and recaps."
                : "Founding the village, the write-up each time the day turns over, and the village's reading of what happened while you were away."
            }
            options={talk}
            value={settings.systemConnectionId}
            disabled={busy}
            onChange={(next) => void choose({ systemConnectionId: next })}
          />
          <ConnectionPicker
            id={`${ELEMENT_TAG}-connection-narration`}
            label="Narration"
            hint={
              compact
                ? "Villagers' speech and conversation recaps."
                : "Everything the villagers say to you, and how the conversation reads back afterwards."
            }
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
            <span className={`${ELEMENT_TAG}-hint`}>
              {compact ? (
                "Maps and places. Recommended."
              ) : (
                <>
                  This is the connection that Villages uses to generate images such as the Village map, Venue
                  backgrounds, etc.{" "}
                  <span className={`${ELEMENT_TAG}-image-recommendation`}>
                    The intended experience includes an image generation connection to bring the world to life, and is{" "}
                    <em>highly</em> recommended.
                  </span>
                </>
              )}
            </span>
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

/** Per-village writing controls. Each save returns the server's effective settings. */
function useVillageWriting() {
  const [view, setView] = useState<VillageWritingView | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void request<VillageWritingView>("/narration")
      .then((next) => {
        if (!cancelled) setView(next);
      })
      .catch((cause) => {
        if (!cancelled) setError(messageFrom(cause, "Village writing settings could not be read."));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const save = useCallback(
    async (patch: {
      tense?: VillageWritingView["tense"];
      person?: VillageWritingView["person"];
      rating?: VillageWritingView["rating"];
      writingGuidance?: string;
    }): Promise<VillageWritingView | null> => {
      setBusy(true);
      setSaved(false);
      setError("");
      try {
        const next = await request<VillageWritingView>("/narration", { method: "PUT", body: JSON.stringify(patch) });
        setView(next);
        setSaved(true);
        return next;
      } catch (cause) {
        setError(messageFrom(cause, "That writing change could not be saved."));
        return null;
      } finally {
        setBusy(false);
      }
    },
    [],
  );

  return { view, error, busy, saved, save };
}

export function VillageWritingSettings() {
  const { view, error, busy, saved, save } = useVillageWriting();
  const [guidanceDraft, setGuidanceDraft] = useState<string | null>(null);
  const draft = guidanceDraft ?? view?.writingGuidance ?? "";

  return (
    <div className={ELEMENT_TAG + "-field"}>
      <span className={ELEMENT_TAG + "-label"}>Additional writing guidance</span>
      <p className={ELEMENT_TAG + "-empty"}>
        Optionally guide scene presentation. Narration follows your prose preferences; each resident keeps their own
        personality, voice, and mannerisms from their character card. Scene facts and your choices remain in charge.
        Leave this empty for Villages&apos; own scene writing. Saved changes apply to the next generated venue turn.
      </p>
      {view ? (
        <>
          <textarea
            className={ELEMENT_TAG + "-textarea"}
            aria-label="Additional writing guidance"
            value={draft}
            rows={5}
            maxLength={view.writingGuidanceMaxLength}
            disabled={busy}
            onChange={(event) => setGuidanceDraft(event.target.value)}
          />
          <button
            type="button"
            className={ELEMENT_TAG + "-button"}
            disabled={busy || draft === view.writingGuidance}
            onClick={() => {
              void save({ writingGuidance: draft }).then((next) => {
                if (next) setGuidanceDraft(next.writingGuidance);
              });
            }}
          >
            Apply guidance
          </button>
          <button
            type="button"
            className={ELEMENT_TAG + "-button"}
            disabled={busy || !draft}
            onClick={() => {
              void save({ writingGuidance: "" }).then((next) => {
                if (next) setGuidanceDraft(next.writingGuidance);
              });
            }}
          >
            Clear guidance
          </button>
          <div className={ELEMENT_TAG + "-row"}>
            <label className={ELEMENT_TAG + "-field"}>
              <span className={ELEMENT_TAG + "-label"}>Tense</span>
              <select
                value={view.tense}
                disabled={busy}
                onChange={(event) => void save({ tense: event.target.value as VillageWritingView["tense"] })}
              >
                <option value="present">Present</option>
                <option value="past">Past</option>
              </select>
            </label>
            <label className={ELEMENT_TAG + "-field"}>
              <span className={ELEMENT_TAG + "-label"}>Person</span>
              <select
                value={view.person}
                disabled={busy}
                onChange={(event) => void save({ person: event.target.value as VillageWritingView["person"] })}
              >
                <option value="first">First person (I)</option>
                <option value="second">Second person (you)</option>
                <option value="third">Third person (player name)</option>
              </select>
            </label>
            <label className={ELEMENT_TAG + "-field"}>
              <span className={ELEMENT_TAG + "-label"}>Content rating</span>
              <select
                value={view.rating}
                disabled={busy}
                onChange={(event) => void save({ rating: event.target.value as VillageWritingView["rating"] })}
              >
                <option value="sfw">SFW</option>
                <option value="nsfw">NSFW</option>
              </select>
            </label>
          </div>
          <span className={ELEMENT_TAG + "-hint"}>
            Rating applies to venue narration and dialogue only. NSFW allows adult content when the scene calls for it.
          </span>
        </>
      ) : !error ? (
        <span className={ELEMENT_TAG + "-hint"}>Reading village writing settings…</span>
      ) : null}
      {busy ? <span className={ELEMENT_TAG + "-hint"}>Saving…</span> : null}
      {saved && !busy ? (
        <span className={ELEMENT_TAG + "-hint"} role="status">
          Saved for the next venue turn.
        </span>
      ) : null}
      {error ? (
        <p className={ELEMENT_TAG + "-error"} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
