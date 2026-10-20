import { useCallback, useEffect, useRef, useState } from "react";
import type { SpriteFrame, SpriteSetupAssignment, SpriteSetupState } from "../../../shared/contracts/sprites.js";
import { request, requestHost, messageFrom } from "../../shared/api.js";
import { createVillagesClientId } from "../../shared/request-id.js";
import type { EngineConnectionRow, VillageConnectionOption, Portrait } from "../../shared/types.js";
import { connectionOptionsFrom } from "../../shared/presentation.js";

type Props = {
  characterId: string;
  name: string;
  portrait?: Portrait;
  onClose(revision?: number): void;
  onDone(revision?: number): void | Promise<void>;
  existing?: boolean;
  preserveSelection?: boolean;
};
const analysisConnectionKey = "villages-sprite-analysis-connection";
const complete = (item: SpriteSetupAssignment) => item.included && Boolean(item.name.trim() && item.direction);
const needsAnalysis = (item: SpriteSetupAssignment, data: SpriteSetupState) =>
  item.included &&
  !complete(item) &&
  !item.name.trim() &&
  !item.useWhen.trim() &&
  !item.direction &&
  !data.suggestions.some((suggestion) => suggestion.artworkId === item.artworkId);
export function SpriteSetupDialog({ characterId, name, onClose, onDone, existing, preserveSelection }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const abort = useRef<AbortController | null>(null);
  const importAbort = useRef<AbortController | null>(null);
  const working = useRef(false);
  const [data, setData] = useState<SpriteSetupState | null>(null);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [connections, setConnections] = useState<VillageConnectionOption[]>([]);
  const [connectionId, setConnectionId] = useState(() => {
    try {
      return window.localStorage.getItem(analysisConnectionKey) ?? "";
    } catch {
      return "";
    }
  });
  const [connectionError, setConnectionError] = useState("");
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [activeArtwork, setActiveArtwork] = useState("");
  const reviewDialog = useRef<HTMLDialogElement>(null);
  const activeButton = useRef<HTMLButtonElement | null>(null);
  const [framing, setFraming] = useState<string>("");
  const [frameDraft, setFrameDraft] = useState<SpriteFrame | null>(null);
  const base = `/characters/${encodeURIComponent(characterId)}/sprites/setup`;
  useEffect(() => {
    if (activeArtwork) reviewDialog.current?.showModal();
  }, [activeArtwork]);
  const importArtwork = useCallback(
    async (controller = new AbortController()) => {
      importAbort.current = controller;
      setImporting(true);
      try {
        const value = await request<SpriteSetupState>(base + "/prepare", {
          method: "POST",
          signal: controller.signal,
        });
        if (!controller.signal.aborted) setData(value);
      } catch (cause) {
        if (!controller.signal.aborted) setError(messageFrom(cause, "Could not import sprites."));
      } finally {
        setImporting(false);
      }
    },
    [base],
  );
  useEffect(() => {
    const controller = new AbortController();
    importAbort.current = controller;
    dialog.current?.showModal();
    void requestHost<EngineConnectionRow[]>("/api/connections", { signal: controller.signal })
      .then((rows) =>
        setConnections(
          connectionOptionsFrom(rows).filter((item) => item.category === "language" && item.id !== "random"),
        ),
      )
      .catch((cause) => {
        if (!controller.signal.aborted) setConnectionError(messageFrom(cause, "Could not load analysis connections."));
      });
    void request<SpriteSetupState>(base, { signal: controller.signal })
      .then(async (value) => {
        if (controller.signal.aborted) return;
        setData(value);
        if (
          value.files.some((file) => !value.manager.artwork.some((art) => art.engineSource?.filename === file.filename))
        ) {
          await importArtwork(controller);
        }
      })
      .catch((cause) => {
        if (!controller.signal.aborted) setError(messageFrom(cause, "Could not load sprites."));
      });
    return () => {
      controller.abort();
      importAbort.current?.abort();
      abort.current?.abort();
    };
  }, [base, importArtwork]);
  async function perform(action: () => Promise<void>) {
    if (working.current) return;
    working.current = true;
    setBusy(true);
    setError("");
    try {
      await action();
    } catch (cause) {
      setError(messageFrom(cause, "Could not save sprite setup."));
    } finally {
      working.current = false;
      setBusy(false);
    }
  }
  function edit(artworkId: string, patch: Partial<SpriteSetupAssignment>) {
    setData(
      (prior) =>
        prior && {
          ...prior,
          assignments: prior.assignments.map((item) =>
            item.artworkId === artworkId
              ? {
                  ...(prior.suggestions.find((suggestion) => suggestion.artworkId === artworkId) ?? item),
                  ...patch,
                  approved: false,
                }
              : item,
          ),
          suggestions: prior.suggestions.filter((item) => item.artworkId !== artworkId),
        },
    );
  }
  async function save(useSprites: boolean, validateForUse = false) {
    if (!data) return null;
    // Only the final action accepts suggestions. Back, framing and analysis save drafts.
    const acceptReview = useSprites && validateForUse;
    const saved = await request<SpriteSetupState>(base + "/save", {
      method: "POST",
      body: JSON.stringify({
        revision: data.revision,
        assignments: acceptReview
          ? candidates.map((item) => ({ ...item, approved: complete(item) }))
          : data.assignments,
        defaultArtworkId: acceptReview ? (defaultItem?.artworkId ?? "") : data.defaultArtworkId,
        useSprites,
        validateForUse,
        pendingSuggestionIds: acceptReview ? [] : data.suggestions.map((item) => item.artworkId),
      }),
    });
    setData(saved);
    return saved;
  }
  async function finish(useSprites: boolean) {
    if (!useSprites && (!data || importing)) {
      importAbort.current?.abort();
      try {
        await onDone();
      } catch (cause) {
        setData(await request<SpriteSetupState>(base + "/settled"));
        throw cause;
      }
      return;
    }
    const saved = await save(useSprites, true);
    if (!saved) return;
    if (existing)
      await request(base + "/apply", {
        method: "POST",
        body: JSON.stringify({ revision: saved.revision, residentToken: data.residentToken }),
      });
    await onDone(saved.revision);
  }
  async function close() {
    if (!data || importing) {
      importAbort.current?.abort();
      // An already selected founding character keeps its reviewed choice after partial imports.
      const saved = preserveSelection ? await request<SpriteSetupState>(base + "/settled") : undefined;
      onClose(saved?.revision);
      return;
    }
    const saved = data.revision ? await save(data.useSprites) : data;
    onClose(saved?.revision);
  }
  async function analyze(artworkId?: string) {
    if (!connections.some((item) => item.id === connectionId)) {
      setError("Choose a vision-capable sprite analysis connection.");
      return;
    }
    const saved = await save(data.useSprites);
    if (!saved) return;
    const ids = artworkId
      ? [artworkId]
      : saved.assignments
          .filter((item) => needsAnalysis(item, saved))
          .map((item) => item.artworkId)
          .slice(0, 40);
    if (!ids.length) {
      setError("No sprites need analysis.");
      return;
    }
    const controller = new AbortController();
    abort.current = controller;
    setAnalyzing(true);
    setProgress({ done: 0, total: ids.length });
    try {
      let latest = saved;
      for (const [index, artworkId] of ids.entries()) {
        controller.signal.throwIfAborted();
        latest = await request<SpriteSetupState>(base + "/analyze", {
          method: "POST",
          signal: controller.signal,
          body: JSON.stringify({
            revision: latest.revision,
            requestId: createVillagesClientId(),
            artworkIds: [artworkId],
            finalize: index === ids.length - 1,
            connectionId,
          }),
        });
        setData(latest);
        if (latest.errors[artworkId]) {
          setError(latest.errors[artworkId]);
          break;
        }
        setProgress({ done: index + 1, total: ids.length });
      }
    } catch (cause) {
      setData(await request<SpriteSetupState>(base));
      if (!controller.signal.aborted) throw cause;
    } finally {
      abort.current = null;
      setAnalyzing(false);
    }
  }
  const candidates =
    data?.assignments.map(
      (item) => data.suggestions.find((suggestion) => suggestion.artworkId === item.artworkId) ?? item,
    ) ?? [];
  const included = candidates.filter((item) => item.included);
  const completeCount = included.filter(complete).length;
  const analysisCount = data?.assignments.filter((item) => needsAnalysis(item, data)).length ?? 0;
  const excludedCount = candidates.length - included.length;
  const defaultItem = candidates.find(
    (item) => complete(item) && item.artworkId === (data?.defaultArtworkId || data?.suggestedDefaultArtworkId),
  );
  const canFinish = Boolean(defaultItem && completeCount === included.length);
  const showAnalysis = analysisCount > 0 || analyzing;
  function closeEditor() {
    reviewDialog.current?.close();
    setActiveArtwork("");
    setFraming("");
    activeButton.current?.focus({ preventScroll: true });
  }
  const connectionChooser = (
    <label>
      Sprite analysis connection
      <select
        aria-label="Sprite analysis connection"
        value={connectionId}
        disabled={busy}
        onChange={(event) => {
          setConnectionId(event.target.value);
          try {
            window.localStorage.setItem(analysisConnectionKey, event.target.value);
          } catch {
            // The current choice still works when browser storage is unavailable.
          }
        }}
      >
        <option value="">Choose a vision-capable connection</option>
        {connectionId && !connections.some((item) => item.id === connectionId) ? (
          <option value={connectionId}>Unavailable connection</option>
        ) : null}
        {connections.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>
    </label>
  );
  return (
    <dialog
      className="villages-sprite-setup"
      ref={dialog}
      aria-label={`${name} sprite setup`}
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) void perform(close);
      }}
    >
      <style>{`
      .villages-sprite-setup{position:fixed;inset:0;margin:auto;height:fit-content;background:#111d31;color:#f2f4fb;border:1px solid #66758f;border-radius:14px;padding:0;width:min(780px,calc(100vw - 24px));max-height:90dvh;overflow:hidden;box-sizing:border-box;font-family:system-ui,sans-serif}
      .villages-sprite-setup[open]{display:flex;flex-direction:column}
      .villages-sprite-setup::backdrop{background:#080e19bd}
      .villages-sprite-setup header,.villages-sprite-setup footer{display:flex;gap:12px;justify-content:space-between;align-items:center;padding:16px;flex-wrap:wrap;flex-shrink:0}
      .villages-sprite-setup h2{margin:0;font-size:1.25rem}.villages-sprite-setup h3{margin:0;font-size:1rem}
      .villages-sprite-setup main{overflow:auto;min-height:0;padding:0 16px 16px}
      .villages-sprite-setup button,.villages-sprite-setup input,.villages-sprite-setup select,.villages-sprite-setup textarea{font:inherit;color:inherit;background:#1a2b44;border:1px solid #62718a;border-radius:6px;padding:8px;box-sizing:border-box;max-width:100%}
      .villages-sprite-setup button{min-height:44px}.villages-sprite-setup button:disabled{opacity:.5}.villages-sprite-setup .sprite-primary{background:#36567a}
      .villages-sprite-setup .sprite-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
      .villages-sprite-setup label{display:grid;gap:4px}.villages-sprite-setup .sprite-inline{display:flex;align-items:center;gap:6px}
      .villages-sprite-setup .sprite-inline input{flex:0 0 18px;width:18px;height:18px;min-width:18px;min-height:18px;padding:0;margin:0}
      .villages-sprite-setup small{overflow-wrap:anywhere;color:#b9c6da}.villages-sprite-setup [role=alert]{color:#ffbeb5}
      .villages-sprite-setup .sprite-counts{margin:0 0 14px;color:#b9c6da}.villages-sprite-setup .sprite-counts span{display:inline-block}
      .villages-sprite-setup .sprite-analysis{display:grid;gap:2px;margin-bottom:14px}
      .villages-sprite-setup .sprite-gallery{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:12px 0}
      .villages-sprite-setup .sprite-choice{min-width:0;display:grid;gap:6px;align-content:start}
      .villages-sprite-setup .sprite-thumb{position:relative;width:100%;display:grid;gap:6px;justify-items:center;align-content:start;min-width:0}
      .villages-sprite-setup .sprite-thumb[aria-pressed=true]{outline:2px solid #b0d2ff;outline-offset:-2px;background:#36567a}
      .villages-sprite-setup .sprite-thumb img{width:100%;height:110px;object-fit:contain}
      .villages-sprite-setup .sprite-thumb span{overflow-wrap:anywhere;text-align:center}
      .villages-sprite-setup .sprite-thumb small{text-align:center}
      .villages-sprite-setup .sprite-prepared{position:absolute;top:6px;right:6px;width:22px;height:22px;border-radius:50%;background:#315d46;color:#ecfff1;display:grid;place-items:center;font-size:14px;line-height:1}
      .villages-sprite-setup .villages-sprite-review{position:fixed;inset:0;margin:auto;padding:0;width:min(720px,calc(100vw - 24px));max-height:90dvh;height:fit-content;overflow:hidden;background:#111d31;color:#f2f4fb;border:1px solid #66758f;border-radius:14px;box-sizing:border-box}
      .villages-sprite-setup .villages-sprite-review[open]{display:flex;flex-direction:column}
      .villages-sprite-setup .villages-sprite-review::backdrop{background:#080e19bd}
      .villages-sprite-setup .sprite-analysis-options summary{cursor:pointer;padding:8px 0}
      .villages-sprite-setup .sprite-tile{display:grid;grid-template-columns:minmax(120px,1fr) minmax(0,2fr);gap:16px;padding:16px;background:#1a2b44;border-radius:8px}
      .villages-sprite-setup .sprite-inspector-image{min-width:0;display:grid;gap:6px;align-content:start}
      .villages-sprite-setup .sprite-inspector-image img{width:100%;height:240px;object-fit:contain;background:#233048;border-radius:8px}
      .villages-sprite-setup .sprite-fields{display:grid;gap:10px;min-width:0}.villages-sprite-setup textarea{resize:vertical}
      .villages-sprite-setup .sprite-fields input:not([type=checkbox]):not([type=radio]),.villages-sprite-setup textarea,.villages-sprite-setup select{width:100%}
      @media(max-width:480px){.villages-sprite-setup input,.villages-sprite-setup select,.villages-sprite-setup textarea{font-size:16px}.villages-sprite-setup header,.villages-sprite-setup footer{padding:12px}.villages-sprite-setup main{padding:0 12px 12px}.villages-sprite-setup .sprite-gallery{grid-template-columns:repeat(3,minmax(0,1fr))}.villages-sprite-setup .sprite-thumb{padding:6px;font-size:14px}.villages-sprite-setup .sprite-thumb img{height:90px}.villages-sprite-setup .sprite-tile{grid-template-columns:1fr}.villages-sprite-setup .sprite-inspector-image{grid-template-columns:90px minmax(0,1fr);align-items:center}.villages-sprite-setup .sprite-inspector-image img{height:120px}.villages-sprite-setup footer button{flex:1}}
    `}</style>
      <header>
        <div>
          <h2>{name}’s sprites</h2>
          {!data || importing ? (
            <p role="status" style={{ margin: "4px 0 0", fontSize: "0.875rem", color: "#b9c6da" }}>
              {importing ? "Preparing sprites…" : "Reading sprites…"}
            </p>
          ) : null}
        </div>
        <button disabled={busy} onClick={() => void perform(close)}>
          Back
        </button>
      </header>
      <main>
        {error && !activeArtwork ? <p role="alert">{error}</p> : null}
        <fieldset disabled={importing} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
          {!data ? null : (
            <>
              <p role="status" className="sprite-counts">
                {candidates.length} sprites · {completeCount} ready
                {analysisCount ? <span> · {analysisCount} need analysis</span> : null}
                {included.length - completeCount - analysisCount > 0 ? (
                  <span> · {included.length - completeCount - analysisCount} incomplete</span>
                ) : null}
                {excludedCount ? <span> · {excludedCount} excluded</span> : null}
                {defaultItem ? <span> · Default: {defaultItem.name}</span> : null}
              </p>
              {showAnalysis && !activeArtwork ? (
                <div className="sprite-analysis">
                  {connectionChooser}
                  <div className="sprite-actions">
                    <button
                      disabled={busy || !connections.some((item) => item.id === connectionId) || !analysisCount}
                      onClick={() => void perform(analyze)}
                    >
                      {progress ? "Analyze remaining" : "Analyze sprites"}
                    </button>
                    {analyzing ? <button onClick={() => abort.current?.abort()}>Cancel analysis</button> : null}
                  </div>
                </div>
              ) : null}
              {connectionError && showAnalysis && !activeArtwork ? <p role="alert">{connectionError}</p> : null}
              {data.libraryError ? <p role="alert">{data.libraryError}</p> : null}
              {progress && (analyzing || progress.done < progress.total) ? (
                <p role="status" className="sprite-progress">
                  {analyzing
                    ? `Analyzing ${Math.min(progress.done + 1, progress.total)} of ${progress.total}…`
                    : `Analysis stopped · ${progress.done} of ${progress.total} completed this run`}
                </p>
              ) : null}
              <div className="sprite-actions">
                <button
                  disabled={busy}
                  onClick={() =>
                    void perform(async () => {
                      await save(data.useSprites);
                      void importArtwork();
                    })
                  }
                >
                  Refresh sprites
                </button>
              </div>
              {!importing && !candidates.length ? <p>No character sprites available.</p> : null}
              <>
                <div className="sprite-gallery" aria-label="Sprites">
                  {data.manager.artwork.map((art, index) => {
                    const item = candidates.find((item) => item.artworkId === art.id)!;
                    return (
                      <div className="sprite-choice" key={art.id}>
                        <button
                          type="button"
                          className="sprite-thumb"
                          disabled={busy}
                          aria-label={`Sprite ${index + 1}: ${item.name || "Needs assignment"}${complete(item) ? " · Prepared" : ""}`}
                          aria-pressed={art.id === activeArtwork}
                          onClick={(event) => {
                            activeButton.current = event.currentTarget;
                            setActiveArtwork(art.id);
                            setFraming("");
                          }}
                        >
                          {complete(item) ? (
                            <span className="sprite-prepared" aria-hidden="true">
                              ✓
                            </span>
                          ) : null}
                          <img src={art.rendered.url} alt="" loading="lazy" />
                          <span>{item.name || art.name}</span>
                          <small>
                            {data.errors[art.id] ? "Retry · " : ""}
                            {!item.included
                              ? "Excluded"
                              : needsAnalysis(item, data)
                                ? "Needs analysis"
                                : !complete(item)
                                  ? "Incomplete"
                                  : { front: "Front", left: "Left", right: "Right" }[item.direction]}
                            {defaultItem?.artworkId === art.id ? " · Default" : ""}
                          </small>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
              {Object.entries(data.errors)
                .filter(([key]) => !data.manager.artwork.some((art) => art.id === key))
                .map(([file, problem]) => (
                  <small key={file} role="alert">
                    {file}: {problem}
                  </small>
                ))}
            </>
          )}
        </fieldset>
      </main>
      <footer>
        {data && included.length > 0 && completeCount === included.length && !defaultItem ? (
          <small>Choose a default sprite.</small>
        ) : null}
        <button disabled={busy} onClick={() => void perform(() => finish(false))}>
          Add without sprites
        </button>
        <button
          className="sprite-primary"
          disabled={busy || importing || !canFinish}
          onClick={() => void perform(() => finish(true))}
        >
          {existing ? "Use sprites" : "Add villager with sprites"}
        </button>
      </footer>
      {data ? (
        <dialog
          className="villages-sprite-review"
          ref={reviewDialog}
          aria-label={`${name} sprite review`}
          onCancel={(event) => {
            event.preventDefault();
            event.stopPropagation();
            if (!busy) closeEditor();
          }}
        >
          <header>
            <h2>Review sprite</h2>
            <button disabled={busy} onClick={closeEditor}>
              Done
            </button>
          </header>
          <main>
            {error && activeArtwork ? <p role="alert">{error}</p> : null}

            {data.manager.artwork
              .filter((art) => art.id === activeArtwork)
              .map((art) => {
                const suggestion = data.suggestions.find((item) => item.artworkId === art.id);
                const item = suggestion ?? data.assignments.find((item) => item.artworkId === art.id)!;
                return (
                  <section className="sprite-tile" key={art.id} aria-label={art.name}>
                    <div className="sprite-inspector-image">
                      <img src={art.rendered.url} alt={art.name} loading="lazy" />
                      <small>{art.name}</small>
                    </div>
                    <div className="sprite-fields">
                      <label>
                        Expression
                        <input
                          autoComplete="off"
                          aria-label="Expression"
                          disabled={busy}
                          value={item.name}
                          maxLength={100}
                          onChange={(event) => edit(art.id, { name: event.target.value })}
                        />
                      </label>
                      <label>
                        Use when
                        <textarea
                          autoComplete="off"
                          aria-label="Use when"
                          disabled={busy}
                          value={item.useWhen}
                          maxLength={1000}
                          rows={2}
                          onChange={(event) => edit(art.id, { useWhen: event.target.value })}
                        />
                      </label>
                      <label>
                        Facing
                        <select
                          aria-label="Facing"
                          disabled={busy}
                          value={item.direction}
                          onChange={(event) =>
                            edit(art.id, { direction: event.target.value as SpriteSetupAssignment["direction"] })
                          }
                        >
                          <option value="">Unassigned</option>
                          <option value="front">Front</option>
                          <option value="left">Left</option>
                          <option value="right">Right</option>
                        </select>
                      </label>
                      <label className="sprite-inline">
                        <input
                          autoComplete="off"
                          type="checkbox"
                          disabled={busy}
                          checked={item.included}
                          onChange={(event) => edit(art.id, { included: event.target.checked })}
                        />
                        Include
                      </label>
                      <label className="sprite-inline">
                        <input
                          autoComplete="off"
                          type="radio"
                          name="sprite-default"
                          disabled={busy || !complete(item)}
                          checked={defaultItem?.artworkId === art.id}
                          onChange={() => setData({ ...data, defaultArtworkId: art.id })}
                        />
                        Default
                      </label>
                      {data.errors[art.id] ? <small role="alert">{data.errors[art.id]}</small> : null}
                      <button
                        disabled={busy}
                        onClick={() => {
                          setFraming(framing === art.id ? "" : art.id);
                          setFrameDraft(art.frame);
                        }}
                      >
                        Adjust framing
                      </button>
                      {framing === art.id && frameDraft ? (
                        <>
                          {(["scale", "offsetX", "offsetY"] as const).map((key) => (
                            <label key={key}>
                              {{ scale: "Size", offsetX: "Horizontal position", offsetY: "Foot position" }[key]}
                              <input
                                autoComplete="off"
                                type="number"
                                disabled={busy}
                                value={frameDraft[key]}
                                step={key === "scale" ? 0.05 : 1}
                                onChange={(event) =>
                                  setFrameDraft({ ...frameDraft, [key]: Number(event.target.value) })
                                }
                              />
                            </label>
                          ))}
                          <button
                            disabled={busy}
                            onClick={() =>
                              void perform(async () => {
                                const saved = await save(data.useSprites);
                                setData(
                                  await request<SpriteSetupState>(base + "/frame", {
                                    method: "POST",
                                    body: JSON.stringify({
                                      revision: saved.revision,
                                      artworkId: art.id,
                                      frame: frameDraft,
                                    }),
                                  }),
                                );
                              })
                            }
                          >
                            Save framing
                          </button>
                        </>
                      ) : null}
                      <details className="sprite-analysis-options">
                        <summary>Analysis</summary>
                        {connectionChooser}
                        {connectionError ? <p role="alert">{connectionError}</p> : null}
                        <div className="sprite-actions">
                          <button
                            disabled={busy || !connections.some((entry) => entry.id === connectionId)}
                            onClick={() => void perform(() => analyze(art.id))}
                          >
                            Analyze sprite
                          </button>
                          {analyzing ? <button onClick={() => abort.current?.abort()}>Cancel analysis</button> : null}
                        </div>
                      </details>
                      {art.warnings.map((warning) => (
                        <small key={warning}>{warning}</small>
                      ))}
                    </div>
                  </section>
                );
              })}
          </main>
        </dialog>
      ) : null}
    </dialog>
  );
}
