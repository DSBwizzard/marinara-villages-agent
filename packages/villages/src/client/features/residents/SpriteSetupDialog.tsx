import { useEffect, useRef, useState } from "react";
import type { SpriteFrame, SpriteSetupAssignment, SpriteSetupState } from "../../../shared/contracts/sprites.js";
import { request, messageFrom } from "../../shared/api.js";
import { createVillagesClientId } from "../../shared/request-id.js";
import type { Portrait } from "../../shared/types.js";
import { AvatarFace } from "./ResidentPanels.js";

type Props = {
  characterId: string;
  name: string;
  portrait?: Portrait;
  onClose(revision?: number): void;
  onDone(revision: number): void | Promise<void>;
  existing?: boolean;
};
const complete = (item: SpriteSetupAssignment) => item.included && Boolean(item.name.trim() && item.direction);
const ready = (item: SpriteSetupAssignment) => item.approved === true && complete(item);
const needsAnalysis = (item: SpriteSetupAssignment, data: SpriteSetupState) =>
  item.included &&
  !complete(item) &&
  !item.name.trim() &&
  !item.useWhen.trim() &&
  !item.direction &&
  !data.suggestions.some((suggestion) => suggestion.artworkId === item.artworkId);
export function SpriteSetupDialog({ characterId, name, portrait, onClose, onDone, existing }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const abort = useRef<AbortController | null>(null);
  const working = useRef(false);
  const [data, setData] = useState<SpriteSetupState | null>(null);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [activeArtwork, setActiveArtwork] = useState("");
  const [framing, setFraming] = useState<string>("");
  const [frameDraft, setFrameDraft] = useState<SpriteFrame | null>(null);
  const [expanded, setExpanded] = useState(false),
    [selected, setSelected] = useState<string[]>([]);
  const [bulkName, setBulkName] = useState(""),
    [bulkUse, setBulkUse] = useState(""),
    [bulkFacing, setBulkFacing] = useState("");
  const base = `/characters/${encodeURIComponent(characterId)}/sprites/setup`;
  useEffect(() => {
    const controller = new AbortController();
    dialog.current?.showModal();
    void request<SpriteSetupState>(base, { signal: controller.signal })
      .then(async (value) => {
        setData(value);
        if (
          value.files.some((file) => !value.manager.artwork.some((art) => art.engineSource?.filename === file.filename))
        ) {
          setBusy(true);
          try {
            value = await request<SpriteSetupState>(base + "/prepare", { method: "POST", signal: controller.signal });
            setData(value);
          } finally {
            setBusy(false);
          }
        }
      })
      .catch((cause) => {
        if (!controller.signal.aborted) setError(messageFrom(cause, "Could not load sprites."));
      });
    return () => {
      controller.abort();
      abort.current?.abort();
    };
  }, [base]);
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
  function approve(ids: string[]) {
    setData((prior) => {
      const assignments = prior.assignments.map((item) => {
        const candidate = prior.suggestions.find((suggestion) => suggestion.artworkId === item.artworkId) ?? item;
        return ids.includes(item.artworkId) && complete(candidate) ? { ...candidate, approved: true } : item;
      });
      const approved = assignments.filter(ready).map((item) => item.artworkId);
      return {
        ...prior,
        assignments,
        suggestions: prior.suggestions.filter(
          (item) => !ids.includes(item.artworkId) || !approved.includes(item.artworkId),
        ),
        defaultArtworkId:
          prior.defaultArtworkId ||
          (approved.includes(prior.suggestedDefaultArtworkId ?? "") ? prior.suggestedDefaultArtworkId! : ""),
      };
    });
  }
  async function save(useSprites: boolean, validateForUse = false) {
    if (!data) return null;
    const saved = await request<SpriteSetupState>(base + "/save", {
      method: "POST",
      body: JSON.stringify({
        revision: data.revision,
        assignments: data.assignments,
        defaultArtworkId: data.defaultArtworkId,
        useSprites,
        validateForUse,
        pendingSuggestionIds: data.suggestions.map((item) => item.artworkId),
      }),
    });
    setData(saved);
    return saved;
  }
  async function finish(useSprites: boolean) {
    const saved = await save(useSprites, true);
    if (!saved) return;
    if (existing)
      await request(base + "/apply", {
        method: "POST",
        body: JSON.stringify({ revision: saved.revision, residentToken: data.residentToken }),
      });
    await onDone(saved.revision);
  }
  async function analyze() {
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
    setExpanded(true);
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
  const assigned = data?.assignments.filter(ready) ?? [];
  const analysisCount = data?.assignments.filter((item) => needsAnalysis(item, data)).length ?? 0;
  const excludedCount = data?.assignments.filter((item) => !item.included).length ?? 0;
  const reviewCount = (data?.assignments.length ?? 0) - analysisCount - assigned.length - excludedCount;
  const defaultItem = assigned.find((item) => item.artworkId === data.defaultArtworkId);
  const defaultArt = defaultItem && data.manager.artwork.find((art) => art.id === defaultItem.artworkId);
  const activeIndex = Math.max(0, data?.manager.artwork.findIndex((art) => art.id === activeArtwork) ?? 0);
  return (
    <dialog
      className="villages-sprite-setup"
      ref={dialog}
      aria-label={`${name} sprite setup`}
      onCancel={(event) => {
        event.preventDefault();
        if (!busy)
          void perform(async () => {
            const saved = data?.revision ? await save(data.useSprites) : data;
            onClose(saved?.revision);
          });
      }}
    >
      <style>{`
      .villages-sprite-setup{position:fixed;inset:0;margin:auto;height:fit-content;background:#111d31;color:#f2f4fb;border:1px solid #66758f;border-radius:14px;padding:0;width:min(740px,calc(100vw - 24px));max-height:90dvh;overflow:hidden;box-sizing:border-box;font-family:system-ui,sans-serif}
      .villages-sprite-setup[open]{display:flex;flex-direction:column}.villages-sprite-setup header,.villages-sprite-setup footer{flex-shrink:0}.villages-sprite-setup main{overflow:auto;min-height:0}.villages-sprite-setup::backdrop{background:#080e19bd}.villages-sprite-setup header,.villages-sprite-setup footer{display:flex;gap:12px;justify-content:space-between;align-items:center;padding:16px;flex-wrap:wrap}.villages-sprite-setup h2{margin:0;font-size:1.25rem}.villages-sprite-setup main{padding:0 16px 16px;display:flex;flex-direction:column;gap:12px}.villages-sprite-setup main>*{flex-shrink:0}.villages-sprite-setup button,.villages-sprite-setup input,.villages-sprite-setup select,.villages-sprite-setup textarea{font:inherit;color:inherit;background:#1a2b44;border:1px solid #62718a;border-radius:6px;padding:8px;box-sizing:border-box;max-width:100%}.villages-sprite-setup button{min-height:44px}.villages-sprite-setup button:disabled{opacity:.5}.villages-sprite-setup .sprite-primary{background:#36567a}.villages-sprite-setup .sprite-preview{display:flex;gap:18px;align-items:center;flex-wrap:wrap}.villages-sprite-setup .sprite-preview>img{height:160px;width:110px;object-fit:contain}.villages-sprite-setup .sprite-portrait{position:relative;display:flex;align-items:center;justify-content:center;flex:0 0 110px;width:110px;height:110px;overflow:hidden;border-radius:8px;background:#233048}.villages-sprite-setup .sprite-portrait>img{display:block;width:100%;height:100%;object-fit:cover}.villages-sprite-setup .sprite-portrait>svg{width:64px;height:64px}.villages-sprite-setup .sprite-actions{display:flex;gap:8px;flex-wrap:wrap}.villages-sprite-setup .sprite-tile{display:grid;gap:8px;align-content:start;min-width:0}.villages-sprite-setup label{display:grid;gap:4px}.villages-sprite-setup .sprite-inline{display:flex;align-items:center;gap:6px}.villages-sprite-setup small{overflow-wrap:anywhere;color:#b9c6da}.villages-sprite-setup .sprite-bulk{display:flex;gap:8px;flex-wrap:wrap}.villages-sprite-setup .sprite-bulk>*{flex:1;min-width:130px}.villages-sprite-setup [role=alert]{color:#ffbeb5;margin:0}.villages-sprite-setup .sprite-tile input:not([type=checkbox]):not([type=radio]),.villages-sprite-setup textarea,.villages-sprite-setup select{width:100%}@media(max-width:480px){.villages-sprite-setup input,.villages-sprite-setup select,.villages-sprite-setup textarea{font-size:16px}.villages-sprite-setup header,.villages-sprite-setup footer{padding:12px}.villages-sprite-setup main{padding:0 12px 12px}}
      .villages-sprite-setup .sprite-preview-small>.sprite-portrait,.villages-sprite-setup .sprite-preview-small>img,.villages-sprite-setup .sprite-preview-small strong{display:none}
      .villages-sprite-setup .sprite-preview-small .sprite-refresh{display:none}.villages-sprite-setup .sprite-select{display:none}.villages-sprite-setup .sprite-batch[open]+.sprite-editor .sprite-select{display:flex}.villages-sprite-setup .sprite-counts span{display:inline-block;white-space:nowrap}.villages-sprite-setup .sprite-thumb{min-width:86px}.villages-sprite-setup .sprite-progress{margin:0}.villages-sprite-setup .sprite-gallery{display:flex;gap:8px;overflow-x:auto;min-width:0;padding:3px 0 8px}.villages-sprite-setup .sprite-thumb{flex:0 0 76px;padding:4px;display:grid;gap:4px;font-size:12px}.villages-sprite-setup .sprite-thumb[aria-pressed=true]{outline:2px solid #b0d2ff;outline-offset:-2px;background:#36567a}.villages-sprite-setup .sprite-thumb img{width:66px;height:76px;object-fit:contain}.villages-sprite-setup .sprite-thumb span{white-space:nowrap}.villages-sprite-setup .sprite-navigation{display:flex;align-items:center;justify-content:space-between;gap:8px}.villages-sprite-setup .sprite-batch summary{cursor:pointer;padding:8px 0}.villages-sprite-setup .sprite-tile{grid-template-columns:minmax(120px,1fr) minmax(0,2fr);gap:16px}.villages-sprite-setup .sprite-inspector-image{min-width:0;display:grid;gap:6px;align-content:start}.villages-sprite-setup .sprite-inspector-image img{width:100%;height:260px;object-fit:contain;background:#233048;border-radius:8px}.villages-sprite-setup .sprite-fields{display:grid;gap:10px;min-width:0}.villages-sprite-setup .sprite-fields>.sprite-inline{display:inline-flex}.villages-sprite-setup .sprite-fields>.sprite-select{display:none}.villages-sprite-setup .sprite-tile textarea{resize:vertical}@media(max-width:480px){.villages-sprite-setup .sprite-tile{grid-template-columns:1fr}.villages-sprite-setup .sprite-inspector-image{grid-template-columns:110px minmax(0,1fr);align-items:center}.villages-sprite-setup .sprite-inspector-image img{height:140px}.villages-sprite-setup .sprite-fields{gap:8px}.villages-sprite-setup .sprite-preview-small p{margin:0 0 8px}}
    `}</style>
      <header>
        <h2>{name}’s sprites</h2>
        <button
          disabled={busy}
          onClick={() =>
            void perform(async () => {
              const saved = data?.revision ? await save(data.useSprites) : data;
              onClose(saved?.revision);
            })
          }
        >
          Back
        </button>
      </header>
      <main>
        {error ? <p role="alert">{error}</p> : null}
        {!data ? (
          <p role="status">Loading sprites…</p>
        ) : (
          <>
            <div className={`sprite-preview ${expanded ? "sprite-preview-small" : ""}`}>
              {defaultArt ? (
                <img src={defaultArt.rendered.url} alt={`${name} default sprite`} />
              ) : (
                <AvatarFace portrait={portrait} name={name} glyph="person" className="sprite-portrait" />
              )}
              <div>
                <strong>{defaultItem?.name || "Character portrait"}</strong>
                <p role="status" className="sprite-counts">
                  <span>{data.assignments.length} total</span> · <span>{analysisCount} need analysis</span> ·{" "}
                  <span>{reviewCount} need review</span> · <span>{assigned.length} approved</span>
                  {excludedCount ? <span> · {excludedCount} excluded</span> : null}
                </p>
                <div className="sprite-actions">
                  <button disabled={busy || (!selected.length && !analysisCount)} onClick={() => void perform(analyze)}>
                    {selected.length
                      ? "Analyze selected"
                      : data.suggestions.length || progress || assigned.length || reviewCount
                        ? "Analyze remaining"
                        : "Analyze sprites"}
                  </button>
                  <button disabled={busy} onClick={() => setExpanded(!expanded)}>
                    {expanded ? "Overview" : assigned.length || reviewCount ? "Review sprites" : "Set up manually"}
                  </button>
                  {analyzing ? <button onClick={() => abort.current?.abort()}>Cancel analysis</button> : null}
                  <button
                    className="sprite-refresh"
                    disabled={busy}
                    onClick={() =>
                      void perform(async () => {
                        await save(data.useSprites);
                        setData(await request<SpriteSetupState>(base + "/prepare", { method: "POST" }));
                      })
                    }
                  >
                    Refresh character sprites
                  </button>
                </div>
                {data.libraryError ? <p role="alert">{data.libraryError}</p> : null}
              </div>
            </div>
            {progress && (analyzing || progress.done < progress.total) ? (
              <p role="status" className="sprite-progress">
                {analyzing
                  ? `Analyzing ${Math.min(progress.done + 1, progress.total)} of ${progress.total}…`
                  : `Analysis stopped · ${progress.done} of ${progress.total} completed this run`}
              </p>
            ) : null}
            {reviewCount ? (
              <div className="sprite-actions">
                <button
                  disabled={
                    busy ||
                    !data.assignments.some(
                      (item) =>
                        complete(
                          data.suggestions.find((suggestion) => suggestion.artworkId === item.artworkId) ?? item,
                        ) && !ready(item),
                    )
                  }
                  onClick={() => approve(data.assignments.filter((item) => !ready(item)).map((item) => item.artworkId))}
                >
                  Approve all
                </button>
                {data.suggestions.length ? (
                  <button disabled={busy} onClick={() => setData({ ...data, suggestions: [] })}>
                    Discard
                  </button>
                ) : null}
              </div>
            ) : null}
            {expanded ? (
              <>
                <div className="sprite-gallery" aria-label="Sprites">
                  {data.manager.artwork.map((art, index) => {
                    const item = data.assignments.find((item) => item.artworkId === art.id)!;
                    const suggestion = data.suggestions.find((item) => item.artworkId === art.id);
                    return (
                      <button
                        key={art.id}
                        type="button"
                        className="sprite-thumb"
                        aria-label={`Sprite ${index + 1}: ${suggestion?.name || item.name || "Needs assignment"}`}
                        aria-pressed={index === activeIndex}
                        onClick={() => {
                          setActiveArtwork(art.id);
                          setFraming("");
                        }}
                      >
                        <img src={art.rendered.url} alt="" loading="lazy" />
                        <span>
                          {index + 1} ·{" "}
                          {data.errors[art.id]
                            ? "Retry"
                            : ready(item)
                              ? "Approved"
                              : needsAnalysis(item, data)
                                ? "Analyze"
                                : "Review"}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="sprite-navigation">
                  <button
                    disabled={!activeIndex}
                    onClick={() => {
                      setActiveArtwork(data.manager.artwork[activeIndex - 1].id);
                      setFraming("");
                    }}
                  >
                    Previous
                  </button>
                  <span>
                    {activeIndex + 1} / {data.manager.artwork.length}
                  </span>
                  <button
                    disabled={activeIndex >= data.manager.artwork.length - 1}
                    onClick={() => {
                      setActiveArtwork(data.manager.artwork[activeIndex + 1].id);
                      setFraming("");
                    }}
                  >
                    Next
                  </button>
                </div>
                <details className="sprite-batch">
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
                </details>
                <div className="sprite-editor">
                  {data.manager.artwork.slice(activeIndex, activeIndex + 1).map((art) => {
                    const suggestion = data.suggestions.find((item) => item.artworkId === art.id);
                    const item = suggestion ?? data.assignments.find((item) => item.artworkId === art.id)!;
                    return (
                      <section className="sprite-tile" key={art.id} aria-label={art.name}>
                        <div className="sprite-inspector-image">
                          <img src={art.rendered.url} alt={art.name} loading="lazy" />
                          <small>{art.name}</small>
                        </div>
                        <div className="sprite-fields">
                          <label className="sprite-inline sprite-select">
                            <input
                              autoComplete="off"
                              type="checkbox"
                              disabled={busy}
                              checked={selected.includes(art.id)}
                              onChange={(event) =>
                                setSelected((prior) =>
                                  event.target.checked ? [...prior, art.id] : prior.filter((id) => id !== art.id),
                                )
                              }
                            />
                            Select
                          </label>
                          {!ready(item) ? (
                            <>
                              <button disabled={busy || !complete(item)} onClick={() => approve([art.id])}>
                                Approve sprite
                              </button>
                            </>
                          ) : null}
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
                            {!item.direction ? <small>Choose the original facing.</small> : null}
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
                              checked={data.defaultArtworkId === art.id}
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
            ) : null}
            {Object.entries(data.errors)
              .filter(([key]) => !data.manager.artwork.some((art) => art.id === key))
              .map(([file, problem]) => (
                <small key={file} role="alert">
                  {file}: {problem}
                </small>
              ))}
          </>
        )}
      </main>
      <footer>
        <button disabled={busy || !data} onClick={() => void perform(() => finish(false))}>
          Add without using sprites
        </button>
        <button
          className="sprite-primary"
          disabled={busy || !defaultItem}
          onClick={() => void perform(() => finish(true))}
        >
          {existing ? "Save sprites" : "Add villager"}
        </button>
      </footer>
    </dialog>
  );
}
