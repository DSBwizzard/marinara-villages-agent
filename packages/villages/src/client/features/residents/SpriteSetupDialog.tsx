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
  const editor = useRef<HTMLDivElement>(null);
  const activeButton = useRef<HTMLButtonElement | null>(null);
  const [framing, setFraming] = useState<string>("");
  const [frameDraft, setFrameDraft] = useState<SpriteFrame | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [batchOpen, setBatchOpen] = useState(false);
  const [bulkName, setBulkName] = useState(""),
    [bulkUse, setBulkUse] = useState(""),
    [bulkFacing, setBulkFacing] = useState("");
  const base = `/characters/${encodeURIComponent(characterId)}/sprites/setup`;
  useEffect(() => {
    if (activeArtwork) editor.current?.scrollIntoView({ block: "nearest" });
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
  async function analyze() {
    if (!connections.some((item) => item.id === connectionId)) {
      setError("Choose a vision-capable sprite analysis connection.");
      return;
    }
    const saved = await save(data.useSprites);
    if (!saved) return;
    const ids = selected.length
      ? selected.slice(0, 40)
      : saved.assignments
          .filter((item) => needsAnalysis(item, saved))
          .map((item) => item.artworkId)
          .slice(0, 40);
    if (!ids.length) {
      setError("Select sprites to analyze.");
      return;
    }
    const controller = new AbortController();
    abort.current = controller;
    setAnalyzing(true);
    setProgress({ done: 0, total: ids.length });
    setSelected([]);
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
  const showAnalysis = analysisCount > 0 || selected.length > 0 || analyzing;
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
      .villages-sprite-setup small{overflow-wrap:anywhere;color:#b9c6da}.villages-sprite-setup [role=alert]{color:#ffbeb5}
      .villages-sprite-setup .sprite-counts{margin:0 0 14px;color:#b9c6da}.villages-sprite-setup .sprite-counts span{display:inline-block}
      .villages-sprite-setup .sprite-analysis{display:grid;gap:2px;margin-bottom:14px}
      .villages-sprite-setup .sprite-gallery{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:12px 0}
      .villages-sprite-setup .sprite-choice{min-width:0;display:grid;gap:6px;align-content:start}
      .villages-sprite-setup .sprite-thumb{width:100%;display:grid;gap:6px;justify-items:center;align-content:start;min-width:0}
      .villages-sprite-setup .sprite-thumb[aria-pressed=true]{outline:2px solid #b0d2ff;outline-offset:-2px;background:#36567a}
      .villages-sprite-setup .sprite-thumb img{width:100%;height:110px;object-fit:contain}
      .villages-sprite-setup .sprite-thumb span{overflow-wrap:anywhere;text-align:center}
      .villages-sprite-setup .sprite-thumb small{text-align:center}
      .villages-sprite-setup .sprite-batch{margin:12px 0}.villages-sprite-setup .sprite-batch summary{cursor:pointer;padding:8px 0}
      .villages-sprite-setup .sprite-bulk{display:flex;gap:8px;flex-wrap:wrap}.villages-sprite-setup .sprite-bulk>*{flex:1;min-width:130px}
      .villages-sprite-setup .sprite-tile{display:grid;grid-template-columns:minmax(120px,1fr) minmax(0,2fr);gap:16px;padding:16px;background:#1a2b44;border-radius:8px}
      .villages-sprite-setup .sprite-inspector-image{min-width:0;display:grid;gap:6px;align-content:start}
      .villages-sprite-setup .sprite-inspector-image img{width:100%;height:240px;object-fit:contain;background:#233048;border-radius:8px}
      .villages-sprite-setup .sprite-editor-heading{display:flex;gap:8px;justify-content:space-between;align-items:center}
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
        {error ? <p role="alert">{error}</p> : null}
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
              {showAnalysis ? (
                <div className="sprite-analysis">
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
                  <div className="sprite-actions">
                    <button
                      disabled={
                        busy ||
                        !connections.some((item) => item.id === connectionId) ||
                        (!selected.length && !analysisCount)
                      }
                      onClick={() => void perform(analyze)}
                    >
                      {selected.length ? "Analyze selected" : progress ? "Analyze remaining" : "Analyze sprites"}
                    </button>
                    {analyzing ? <button onClick={() => abort.current?.abort()}>Cancel analysis</button> : null}
                  </div>
                </div>
              ) : null}
              {connectionError && showAnalysis ? <p role="alert">{connectionError}</p> : null}
              {data.libraryError ? <p role="alert">{data.libraryError}</p> : null}
              {progress && (analyzing || progress.done < progress.total) ? (
                <p role="status" className="sprite-progress">
                  {analyzing
                    ? `Analyzing ${Math.min(progress.done + 1, progress.total)} of ${progress.total}…`
                    : `Analysis stopped · ${progress.done} of ${progress.total} completed this run`}
                </p>
              ) : null}
              {!candidates.length ? <p>No character sprites available.</p> : null}
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
                          aria-label={`Sprite ${index + 1}: ${item.name || "Needs assignment"}`}
                          aria-pressed={art.id === activeArtwork}
                          onClick={(event) => {
                            activeButton.current = event.currentTarget;
                            setActiveArtwork(art.id === activeArtwork ? "" : art.id);
                            setFraming("");
                          }}
                        >
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
                        {batchOpen ? (
                          <label className="sprite-inline">
                            <input
                              type="checkbox"
                              disabled={busy}
                              checked={selected.includes(art.id)}
                              onChange={(event) =>
                                setSelected((prior) =>
                                  event.target.checked ? [...prior, art.id] : prior.filter((id) => id !== art.id),
                                )
                              }
                            />
                            Select sprite {index + 1}
                          </label>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
                <details className="sprite-batch" onToggle={(event) => setBatchOpen(event.currentTarget.open)}>
                  <summary>Batch edit</summary>
                  <div className="sprite-bulk" aria-label="Batch edit sprites">
                    <button disabled={busy} onClick={() => setSelected(data.manager.artwork.map((art) => art.id))}>
                      Select all
                    </button>
                    <button disabled={busy} onClick={() => setSelected([])}>
                      Clear selection
                    </button>
                    <input
                      autoComplete="off"
                      aria-label="Batch expression"
                      placeholder="Expression"
                      value={bulkName}
                      onChange={(event) => setBulkName(event.target.value)}
                    />
                    <input
                      autoComplete="off"
                      aria-label="Batch use when"
                      placeholder="Use when"
                      value={bulkUse}
                      onChange={(event) => setBulkUse(event.target.value)}
                    />
                    <select
                      aria-label="Batch facing"
                      value={bulkFacing}
                      onChange={(event) => setBulkFacing(event.target.value)}
                    >
                      <option value="">Facing</option>
                      <option value="front">Front</option>
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                    </select>
                    <button
                      disabled={busy || !selected.length || !(bulkName || bulkUse || bulkFacing)}
                      onClick={() =>
                        setData((prior) => ({
                          ...prior,
                          assignments: prior.assignments.map((item) =>
                            selected.includes(item.artworkId)
                              ? {
                                  ...(prior.suggestions.find((suggestion) => suggestion.artworkId === item.artworkId) ??
                                    item),
                                  ...(bulkName ? { name: bulkName } : {}),
                                  ...(bulkUse ? { useWhen: bulkUse } : {}),
                                  ...(bulkFacing
                                    ? { direction: bulkFacing as SpriteSetupAssignment["direction"] }
                                    : {}),
                                  approved: false,
                                }
                              : item,
                          ),
                          suggestions: prior.suggestions.filter((item) => !selected.includes(item.artworkId)),
                        }))
                      }
                    >
                      Apply to selected
                    </button>
                  </div>
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
                    {data.suggestions.length ? (
                      <button disabled={busy} onClick={() => setData({ ...data, suggestions: [] })}>
                        Discard suggestions
                      </button>
                    ) : null}
                  </div>
                </details>
                <div className="sprite-editor" ref={editor}>
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
                            <div className="sprite-editor-heading">
                              <h3>{item.name || "Edit sprite"}</h3>
                              <button
                                disabled={busy}
                                onClick={() => {
                                  setActiveArtwork("");
                                  setFraming("");
                                  activeButton.current?.focus();
                                }}
                              >
                                Done
                              </button>
                            </div>
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
                            {art.warnings.map((warning) => (
                              <small key={warning}>{warning}</small>
                            ))}
                          </div>
                        </section>
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
    </dialog>
  );
}
