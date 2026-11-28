import { configuredEmbeddingModel } from "../../../shared/helpers/embedding-connections.js";
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
  { key: "embedding", label: "Embedding", purpose: "Finds related memories" },
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

  const preparingEmbedding = settings?.embeddingStatus === "preparing" ? settings.embedding : undefined;
  useEffect(() => {
    if (!enabled || !preparingEmbedding) return;
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      try {
        const next = await request<VillageConnectionSettings>("/connections", {
          signal: AbortSignal.any([controller.signal, AbortSignal.timeout(CONNECTION_READ_TIMEOUT_MS)]),
        });
        if (controller.signal.aborted) return;
        setSettings((current) =>
          current && current.embedding === preparingEmbedding && next.embedding === preparingEmbedding
            ? { ...current, embeddingStatus: next.embeddingStatus }
            : current,
        );
      } catch {
        // Model preparation is optional and cannot interrupt the connection picker.
      }
      if (!controller.signal.aborted) timer = setTimeout(poll, 1800);
    };
    timer = setTimeout(poll, 1800);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [enabled, preparingEmbedding]);

  const choose = useCallback(
    (choice: ConnectionChoice, onSaved?: () => void) => {
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
          if (alive.current && generation.current === current) {
            setSettings(next);
            onSaved?.();
          }
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
            : required.some((id) => language.find((option) => option.id === id)?.needsReview)
              ? CONNECTION_SETUP_PROBLEMS.review
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
  onContinue,
}: {
  connections: ReturnType<typeof useAgentConnections>;
  kind?: "founding" | "images";
  compact?: boolean;
  disabled?: boolean;
  onContinue?(): void;
}) {
  const { settings, options, error, readFailed, busy, pending, choose, refresh } = connections;
  const [job, setJob] = useState<ConnectionJob | null>(null);
  const [search, setSearch] = useState("");
  const [recommend, setRecommend] = useState<"images" | "embedding" | null>(null);
  const [embeddingConnections, setEmbeddingConnections] = useState(false);
  const titleId = useId();
  const pendingId = useId();
  const language = options.filter((option) => option.category === "language");
  const images = options.filter((option) => option.category === "image_generation");
  const progress = !readFailed && (connections.refreshing || !settings) ? CONNECTION_SETUP_PROBLEMS.reading : "";
  const founding = kind === "founding";
  const imageReady = images.some((option) => option.id === settings?.imageConnectionId && !option.needsReview);

  const localEmbedding = { id: "local", name: "Engine local model", detail: "", needsReview: false };
  const embeddingOptions = options.flatMap((option) => {
    const detail = configuredEmbeddingModel(options, option);
    return detail ? [{ ...option, id: "connection:" + option.id, detail }] : [];
  });
  const embedding = settings?.embedding ?? "off";
  const embeddingReady =
    embedding === "local"
      ? settings?.embeddingStatus !== "unavailable"
      : embeddingOptions.some((option) => option.id === embedding && !option.needsReview) &&
        settings?.embeddingStatus !== "unavailable";
  const pickingImages = job?.key === "imageConnectionId";
  const pickingEmbedding = job?.key === "embedding";
  const modelOptions = pickingEmbedding
    ? embeddingConnections
      ? embeddingOptions
      : []
    : pickingImages
      ? images
      : language;
  const selectedConnection = job ? (pickingEmbedding ? embedding : settings?.[job.key]) : undefined;
  const currentOption = (pickingEmbedding ? [localEmbedding, ...embeddingOptions] : modelOptions).find(
    (option) => option.id === selectedConnection,
  );
  const query = search.trim().toLowerCase();
  const matches = modelOptions.filter((option) => (option.name + " " + option.detail).toLowerCase().includes(query));
  const specialChoices = [];
  if (pickingEmbedding && !embeddingConnections)
    specialChoices.push(
      localEmbedding,
      { id: "engine-connections", name: "Use an Engine connection", detail: "", needsReview: false },
      { id: "off", name: "Play without embeddings", detail: "", needsReview: false },
    );
  if (pickingImages)
    specialChoices.push({ id: VILLAGES_IMAGE_CONNECTION_DISABLED, name: "Disabled", detail: "", needsReview: false });
  if (!pickingEmbedding && (!founding || pickingImages))
    specialChoices.push({ id: "", name: "Use Engine default", detail: "", needsReview: false });

  function openPicker(entry: ConnectionJob) {
    setSearch("");
    setEmbeddingConnections(false);
    setJob(entry);
  }

  function continueAfterImages() {
    if (embeddingReady) {
      setRecommend(null);
      onContinue?.();
    } else setRecommend("embedding");
  }
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
              const semantic = entry.key === "embedding";
              const id = saving ? pending.id : semantic ? embedding : settings[entry.key];
              const selected = (semantic ? [localEmbedding, ...embeddingOptions] : artwork ? images : language).find(
                (option) => option.id === id,
              );
              const off = semantic ? id === "off" : artwork && id === VILLAGES_IMAGE_CONNECTION_DISABLED;
              const missing = !!id && !off && !selected;
              const needsChoice = founding && !artwork && !semantic && !id;
              const valid = !!selected && !selected.needsReview && (!semantic || settings.embeddingStatus === "ready");
              const availability = semantic && !off && !saving ? settings.embeddingStatus : undefined;
              const status = saving
                ? "Saving…"
                : availability === "preparing"
                  ? id === "local"
                    ? "Preparing local model"
                    : "Checking connection"
                  : availability === "unavailable"
                    ? "Unavailable"
                    : selected?.needsReview
                      ? "Needs review"
                      : missing
                        ? "Unavailable"
                        : valid
                          ? "✓ Ready"
                          : artwork || semantic
                            ? "Optional"
                            : "Required";
              let value = "Engine default";
              if (off) value = semantic ? "No embedding model" : "Disabled";
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
                    openPicker(entry);
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
                    {founding || availability ? (
                      <span className={`${P}-model-readiness`} data-valid={valid || undefined}>
                        {status}
                      </span>
                    ) : null}
                  </span>
                  <span className={saving ? `${P}-model-pending ${P}-spin` : `${P}-model-chevron`} aria-hidden="true" />
                </button>
              );
            })}
        </div>
      ) : null}
      {founding && onContinue ? (
        <footer className="villages-founding-connections-footer">
          <button
            type="button"
            className="villages-forging-primary"
            disabled={!!connections.setupProblem || disabled}
            onClick={() => {
              if (imageReady) continueAfterImages();
              else setRecommend("images");
            }}
          >
            Next
          </button>
        </footer>
      ) : null}
      {recommend && onContinue ? (
        <ModalDialog
          title={recommend === "images" ? "Image connection" : "Embedding model"}
          className={
            recommend === "images"
              ? "villages-founding-image-recommendation"
              : "villages-founding-embedding-recommendation"
          }
          compact
          onClose={() => setRecommend(null)}
        >
          <p>
            {recommend === "images"
              ? "An image connection is highly recommended for maps and artwork."
              : "We recommend an embedding model for better memory recall."}
          </p>
          {recommend === "embedding" ? problem : null}
          <footer>
            <button
              type="button"
              className={recommend === "embedding" ? "villages-forging-primary" : undefined}
              disabled={busy || disabled}
              onClick={() => {
                openPicker(recommend === "images" ? jobs[2] : jobs[3]);
                setRecommend(null);
              }}
            >
              {recommend === "images" ? "Choose image connection" : "Choose embedding model"}
            </button>
            <button
              type="button"
              className={recommend === "images" ? "villages-forging-primary" : undefined}
              disabled={busy || !!connections.setupProblem || disabled}
              onClick={() => {
                if (recommend === "images") continueAfterImages();
                else {
                  const continueWithout = () => {
                    setRecommend(null);
                    onContinue();
                  };
                  choose({ key: "embedding", id: "off" }, continueWithout);
                }
              }}
            >
              {recommend === "images" ? "Continue without images" : "Continue without embeddings"}
            </button>
          </footer>
        </ModalDialog>
      ) : null}
      {job && settings ? (
        <ModalDialog
          title={pickingEmbedding && embeddingConnections ? "Embedding connections" : job.label}
          onClose={() => setJob(null)}
          className={`${P}-model-picker`}
          dismissible={!kind}
          showCloseButton={!kind}
          focusHeaderOnMobile={!!kind}
        >
          <div className={`${P}-model-picker-body`}>
            <p>{job.purpose}</p>
            {feedback}
            {selectedConnection &&
            selectedConnection !== "off" &&
            selectedConnection !== VILLAGES_IMAGE_CONNECTION_DISABLED &&
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
            {pickingEmbedding && embeddingConnections ? (
              <p>This connection may send Scene text and memory excerpts to its provider. Charges may apply.</p>
            ) : null}
            {!pickingEmbedding || embeddingConnections ? (
              <input
                type="search"
                autoComplete="off"
                aria-label={
                  pickingEmbedding
                    ? "Search embedding connections"
                    : pickingImages
                      ? "Search image models"
                      : "Search language models"
                }
                placeholder={
                  pickingEmbedding
                    ? "Search embedding connections"
                    : pickingImages
                      ? "Search image models"
                      : "Search language models"
                }
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            ) : null}
            <div className={`${P}-model-choices`}>
              {[...specialChoices, ...matches].map((option) => {
                const current = option.id === selectedConnection;
                const opensConnections = pickingEmbedding && option.id === "engine-connections";
                return (
                  <button
                    type="button"
                    key={option.id}
                    aria-current={current || undefined}
                    disabled={busy || disabled || (pickingEmbedding && option.needsReview)}
                    onClick={() => {
                      if (opensConnections) {
                        setEmbeddingConnections(true);
                        return;
                      }
                      const retry =
                        pickingEmbedding && settings.embeddingStatus === "unavailable" && option.id !== "off";
                      if ((current && !retry) || choose({ key: job.key, id: option.id })) setJob(null);
                    }}
                  >
                    <span>
                      <strong>{option.name}</strong>
                      {option.detail ? <small>{option.detail}</small> : null}
                      {option.needsReview ? <small data-needs-review>Needs Engine review</small> : null}
                    </span>
                    {current ? (
                      <span aria-hidden="true">✓</span>
                    ) : opensConnections ? (
                      <span className={P + "-model-chevron"} aria-hidden="true" />
                    ) : null}
                  </button>
                );
              })}
            </div>
            {(!pickingEmbedding || embeddingConnections) && !modelOptions.length && !busy ? (
              <p>Add a compatible model in Engine’s Connections panel.</p>
            ) : null}
            {modelOptions.length > 0 && !matches.length ? <p>No matching models.</p> : null}
            {!pickingEmbedding || embeddingConnections ? (
              <button type="button" disabled={busy || disabled} onClick={() => refresh()}>
                Refresh list
              </button>
            ) : null}
          </div>
          {kind || embeddingConnections ? (
            <footer>
              <button
                type="button"
                onClick={() => {
                  if (embeddingConnections) {
                    setEmbeddingConnections(false);
                    setSearch("");
                  } else setJob(null);
                }}
              >
                Back
              </button>
            </footer>
          ) : null}
        </ModalDialog>
      ) : null}
    </section>
  );
}

function JobIcon({ job }: { job: ConnectionJob }) {
  if (job.key === "systemConnectionId" || job.key === "embedding") return <VillageIcon name="settings" />;
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
