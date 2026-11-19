import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { VillageConnectionSettings } from "../../../shared/contracts/village.js";
import { messageFrom, request, requestHost } from "../../shared/api.js";
import {
  CONNECTION_SETUP_PROBLEMS,
  ELEMENT_TAG as P,
  VILLAGES_IMAGE_CONNECTION_DISABLED,
} from "../../shared/constants.js";
import { ModalDialog } from "../../shared/ModalDialog.js";
import { connectionOptionsFrom } from "../../shared/presentation.js";
import { VillageIcon } from "../../shared/VillageIcon.js";
import type { EngineConnectionRow, VillageConnectionOption } from "../../shared/types.js";

const jobs = [
  { key: "systemConnectionId", label: "System", purpose: "Drafts and village activity" },
  { key: "narrationConnectionId", label: "GM", purpose: "Scenes and dialogue" },
  { key: "imageConnectionId", label: "Images", purpose: "Maps and artwork" },
] as const;

type ConnectionJob = (typeof jobs)[number];
type ConnectionChoice = { key: ConnectionJob["key"]; id: string };

const CONNECTION_READ_TIMEOUT_MS = 15_000;

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
  const [pending, setPending] = useState<ConnectionChoice | null>(null);
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
    const timeout = AbortSignal.timeout(CONNECTION_READ_TIMEOUT_MS);
    const signal = AbortSignal.any([controller.signal, timeout]);
    const current = ++generation.current;
    read.current = controller;
    setRefreshing(true);
    void (async () => {
      try {
        const [chosen, rows] = await Promise.all([
          request<VillageConnectionSettings>("/connections", { signal }),
          requestHost<EngineConnectionRow[]>("/api/connections", { signal }),
        ]);
        if (!alive.current || generation.current !== current) return;
        setSettings(chosen);
        setOptions(connectionOptionsFrom(Array.isArray(rows) ? rows : []));
        setReadFailed(false);
        setError("");
      } catch (cause) {
        if (alive.current && generation.current === current && !controller.signal.aborted) {
          setReadFailed(true);
          setError(
            timeout.aborted
              ? "Checking model connections timed out."
              : messageFrom(cause, "This agent's connections could not be read."),
          );
        }
      } finally {
        controller.abort();
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

  const choose = useCallback(
    (choice: ConnectionChoice) => {
      if (!alive.current || saving.current || read.current || readFailed) return false;
      saving.current = true;
      const current = ++generation.current;
      setPending(choice);
      setError("");
      void (async () => {
        try {
          const next = await request<VillageConnectionSettings>("/connections", {
            method: "PUT",
            body: JSON.stringify({ [choice.key]: choice.id }),
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
          setPending(null);
          if (alive.current && refreshAfterSave.current) {
            refreshAfterSave.current = false;
            refresh();
          }
        }
      })();
      return true;
    },
    [readFailed, refresh],
  );

  const language = options.filter((option) => option.category === "language");
  const required = [settings?.systemConnectionId, settings?.narrationConnectionId];
  const setupProblem = pending
    ? CONNECTION_SETUP_PROBLEMS.saving
    : readFailed
      ? CONNECTION_SETUP_PROBLEMS.failed
      : refreshing || !settings
        ? CONNECTION_SETUP_PROBLEMS.reading
        : required.some((id) => !id)
          ? CONNECTION_SETUP_PROBLEMS.required
          : required.some((id) => !language.some((option) => option.id === id))
            ? CONNECTION_SETUP_PROBLEMS.missing
            : "";
  return {
    settings,
    options,
    error,
    readFailed,
    pending,
    saving: pending !== null,
    refreshing,
    setupProblem,
    busy: pending !== null || refreshing || readFailed,
    choose,
    refresh,
  };
}

export function AgentConnections() {
  const connections = useAgentConnections(true);
  return <AgentConnectionsControls connections={connections} />;
}

export function AgentConnectionsControls({
  connections,
  kind,
  compact = false,
  disabled = false,
}: {
  connections: ReturnType<typeof useAgentConnections>;
  kind?: "founding" | "images";
  compact?: boolean;
  disabled?: boolean;
}) {
  const { settings, options, error, readFailed, busy, pending, choose, refresh } = connections;
  const [job, setJob] = useState<ConnectionJob | null>(null);
  const [search, setSearch] = useState("");
  const titleId = useId();
  const pendingId = useId();
  const language = options.filter((option) => option.category === "language");
  const images = options.filter((option) => option.category === "image_generation");
  const progress = !readFailed && (connections.refreshing || !settings) ? CONNECTION_SETUP_PROBLEMS.reading : "";
  const founding = kind === "founding";

  const pickingImages = job?.key === "imageConnectionId";
  const modelOptions = pickingImages ? images : language;
  const currentOption = job && modelOptions.find((option) => option.id === settings?.[job.key]);
  const query = search.trim().toLowerCase();
  const matches = modelOptions.filter((option) => `${option.name} ${option.detail}`.toLowerCase().includes(query));
  const specialChoices = [];
  if (pickingImages)
    specialChoices.push({ id: VILLAGES_IMAGE_CONNECTION_DISABLED, name: "Disabled", detail: "", needsReview: false });
  if (!founding || pickingImages)
    specialChoices.push({ id: "", name: "Use Engine default", detail: "", needsReview: false });
  const problem = error ? (
    <div
      className={`${P}-model-problem`}
      role="alert"
      data-founding-problem={founding ? "" : undefined}
      tabIndex={founding ? -1 : undefined}
    >
      <span>{error}</span>
      {readFailed ? (
        <button type="button" onClick={() => refresh()}>
          Retry
        </button>
      ) : null}
    </div>
  ) : null;
  const feedback = progress ? (
    <p role="status" data-founding-problem={founding ? "" : undefined} tabIndex={founding ? -1 : undefined}>
      {progress}
    </p>
  ) : (
    problem
  );

  return (
    <section
      className={`${P}-model-connections`}
      aria-label={compact ? (kind === "images" ? "Image connection" : "Model Connections") : undefined}
      aria-labelledby={compact ? undefined : titleId}
    >
      {compact ? null : <h2 id={titleId}>Model Connections</h2>}
      {job ? null : feedback}
      {pending ? (
        <span id={pendingId} className={`${P}-model-status`} role="status">
          {CONNECTION_SETUP_PROBLEMS.saving}
        </span>
      ) : null}
      {settings ? (
        <div className={`${P}-model-rows`}>
          {jobs
            .filter((entry) => kind !== "images" || entry.key === "imageConnectionId")
            .map((entry) => {
              const artwork = entry.key === "imageConnectionId";
              const saving = pending?.key === entry.key;
              const id = saving ? pending.id : settings[entry.key];
              const selected = (artwork ? images : language).find((option) => option.id === id);
              const off = artwork && id === VILLAGES_IMAGE_CONNECTION_DISABLED;
              const missing = !!id && !off && !selected;
              const needsChoice = founding && !artwork && !id;
              let value = "Engine default";
              if (off) value = "Disabled";
              else if (missing) value = "Missing connection";
              else if (needsChoice) value = "Choose a model";
              else if (selected) value = selected.name;
              return (
                <button
                  key={entry.key}
                  type="button"
                  className={`${P}-model-row`}
                  aria-haspopup="dialog"
                  aria-disabled={pending ? true : undefined}
                  aria-describedby={saving ? pendingId : undefined}
                  data-founding-problem={saving && founding ? "" : undefined}
                  disabled={(busy && !pending) || disabled}
                  onClick={() => {
                    if (pending) return;
                    setSearch("");
                    setJob(entry);
                  }}
                >
                  <span className={`${P}-model-icon`}>
                    <JobIcon job={entry} />
                  </span>
                  <span>
                    <strong>{entry.label}</strong>
                    <small>{entry.purpose}</small>
                  </span>
                  <span
                    className={`${P}-model-assignment`}
                    data-needs-choice={missing || needsChoice || selected?.needsReview || undefined}
                  >
                    <strong>{value}</strong>
                    {selected?.detail ? <small>{selected.detail}</small> : null}
                    {selected?.needsReview ? <small data-needs-review>Needs Engine review</small> : null}
                  </span>
                  <span className={saving ? `${P}-model-pending ${P}-spin` : `${P}-model-chevron`} aria-hidden="true" />
                </button>
              );
            })}
        </div>
      ) : null}
      {job && settings ? (
        <ModalDialog title={job.label} onClose={() => setJob(null)} className={`${P}-model-picker`}>
          <div className={`${P}-model-picker-body`}>
            <p>{job.purpose}</p>
            {feedback}
            {settings[job.key] &&
            settings[job.key] !== VILLAGES_IMAGE_CONNECTION_DISABLED &&
            !currentOption &&
            !readFailed ? (
              <p className={`${P}-model-problem`} role="status">
                Saved connection is missing
              </p>
            ) : null}
            {currentOption?.needsReview ? (
              <p className={`${P}-model-problem`} role="status">
                Review this connection in Engine before using it to generate.
              </p>
            ) : null}
            <input
              type="search"
              autoComplete="off"
              aria-label={pickingImages ? "Search image models" : "Search language models"}
              placeholder={pickingImages ? "Search image models" : "Search language models"}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <div className={`${P}-model-choices`}>
              {[...specialChoices, ...matches].map((option) => {
                const current = option.id === settings[job.key];
                return (
                  <button
                    type="button"
                    key={option.id}
                    aria-current={current || undefined}
                    disabled={busy || disabled}
                    onClick={() => {
                      if (current || choose({ key: job.key, id: option.id })) setJob(null);
                    }}
                  >
                    <span>
                      <strong>{option.name}</strong>
                      {option.detail ? <small>{option.detail}</small> : null}
                      {option.needsReview ? <small data-needs-review>Needs Engine review</small> : null}
                    </span>
                    {current ? <span aria-hidden="true">✓</span> : null}
                  </button>
                );
              })}
            </div>
            {!modelOptions.length && !busy ? <p>Add a compatible model in Engine’s Connections panel.</p> : null}
            {modelOptions.length > 0 && !matches.length ? <p>No matching models.</p> : null}
            <button type="button" disabled={busy || disabled} onClick={() => refresh()}>
              Refresh list
            </button>
          </div>
        </ModalDialog>
      ) : null}
    </section>
  );
}

function JobIcon({ job }: { job: ConnectionJob }) {
  if (job.key === "systemConnectionId") return <VillageIcon name="settings" />;
  return (
    <svg
      className="mari-rgb-static-icon"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {job.key === "narrationConnectionId" ? (
        <path d="M12 6c-2.5-2-6-2.5-9-1v14c3-1.5 6.5-1 9 1 2.5-2 6-2.5 9-1V5c-3-1.5-6.5-1-9 1Zm0 0v14" />
      ) : (
        <>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="15.5" cy="9" r="1.5" />
          <path d="m3 16 5-5 9 9" />
        </>
      )}
    </svg>
  );
}
