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
const ready = (item: SpriteSetupAssignment) => item.included && Boolean(item.name.trim() && item.direction);
export function SpriteSetupDialog({ characterId, name, portrait, onClose, onDone, existing }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const abort = useRef<AbortController | null>(null);
  const working = useRef(false);
  const [data, setData] = useState<SpriteSetupState | null>(null);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
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
          assignments: prior.assignments.map((item) => (item.artworkId === artworkId ? { ...item, ...patch } : item)),
        },
    );
  }
  async function save(useSprites: boolean) {
    if (!data) return null;
    const saved = await request<SpriteSetupState>(base + "/save", {
      method: "POST",
      body: JSON.stringify({
        revision: data.revision,
        assignments: data.assignments,
        defaultArtworkId: data.defaultArtworkId,
        useSprites,
        pendingSuggestionIds: data.suggestions.map((item) => item.artworkId),
      }),
    });
    setData(saved);
    return saved;
  }
  async function finish(useSprites: boolean) {
    const saved = await save(useSprites);
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
      ? selected
      : saved.assignments
          .filter(
            (item) => !ready(item) && !saved.suggestions.some((suggestion) => suggestion.artworkId === item.artworkId),
          )
          .map((item) => item.artworkId)
          .slice(0, 40);
    if (!ids.length) {
      setError("Select sprites to analyze.");
      return;
    }
    const controller = new AbortController();
    abort.current = controller;
    setAnalyzing(true);
    try {
      const answer = await request<SpriteSetupState>(base + "/analyze", {
        method: "POST",
        signal: controller.signal,
        body: JSON.stringify({ revision: saved.revision, requestId: createVillagesClientId(), artworkIds: ids }),
      });
      setData(answer);
      setExpanded(true);
    } catch (cause) {
      if (!controller.signal.aborted) throw cause;
      setData(await request<SpriteSetupState>(base));
      setExpanded(true);
    } finally {
      abort.current = null;
      setAnalyzing(false);
    }
  }
  const assigned = data?.assignments.filter(ready) ?? [];
  const defaultItem = assigned.find((item) => item.artworkId === data.defaultArtworkId);
  const defaultArt = defaultItem && data.manager.artwork.find((art) => art.id === defaultItem.artworkId);
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
      .villages-sprite-setup{background:#111d31;color:#f2f4fb;border:1px solid #66758f;border-radius:14px;padding:0;width:min(740px,calc(100vw - 24px));max-height:90dvh;overflow:hidden;box-sizing:border-box;font-family:system-ui,sans-serif}
      .villages-sprite-setup[open]{display:flex;flex-direction:column}.villages-sprite-setup header,.villages-sprite-setup footer{flex-shrink:0}.villages-sprite-setup main{overflow:auto;min-height:0}.villages-sprite-setup::backdrop{background:#080e19bd}.villages-sprite-setup header,.villages-sprite-setup footer{display:flex;gap:12px;justify-content:space-between;align-items:center;padding:16px;flex-wrap:wrap}.villages-sprite-setup h2{margin:0;font-size:1.25rem}.villages-sprite-setup main{padding:0 16px 16px;display:grid;gap:16px}.villages-sprite-setup button,.villages-sprite-setup input,.villages-sprite-setup select,.villages-sprite-setup textarea{font:inherit;color:inherit;background:#1a2b44;border:1px solid #62718a;border-radius:6px;padding:8px;box-sizing:border-box;max-width:100%}.villages-sprite-setup button{min-height:44px}.villages-sprite-setup button:disabled{opacity:.5}.villages-sprite-setup .sprite-primary{background:#36567a}.villages-sprite-setup .sprite-preview{display:flex;gap:18px;align-items:center;flex-wrap:wrap}.villages-sprite-setup .sprite-preview img{height:160px;width:110px;object-fit:contain}.villages-sprite-setup .sprite-actions{display:flex;gap:8px;flex-wrap:wrap}.villages-sprite-setup .sprite-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(155px,1fr));gap:14px}.villages-sprite-setup .sprite-tile{display:grid;gap:8px;align-content:start;min-width:0}.villages-sprite-setup .sprite-tile>img{width:100%;height:170px;object-fit:contain;background:#233048;border-radius:8px}.villages-sprite-setup label{display:grid;gap:4px}.villages-sprite-setup .sprite-inline{display:flex;align-items:center;gap:6px}.villages-sprite-setup small{overflow-wrap:anywhere;color:#b9c6da}.villages-sprite-setup .sprite-bulk{display:flex;gap:8px;flex-wrap:wrap}.villages-sprite-setup .sprite-bulk>*{flex:1;min-width:130px}.villages-sprite-setup [role=alert]{color:#ffbeb5;margin:0}.villages-sprite-setup .sprite-tile input:not([type=checkbox]):not([type=radio]),.villages-sprite-setup textarea,.villages-sprite-setup select{width:100%}@media(max-width:480px){.villages-sprite-setup .sprite-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.villages-sprite-setup input,.villages-sprite-setup select,.villages-sprite-setup textarea{font-size:16px}.villages-sprite-setup header,.villages-sprite-setup footer{padding:12px}.villages-sprite-setup main{padding:0 12px 12px}}
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
            <div className="sprite-preview">
              {defaultArt ? (
                <img src={defaultArt.rendered.url} alt={`${name} default sprite`} />
              ) : (
                <AvatarFace portrait={portrait} name={name} glyph="person" className="sprite-portrait" />
              )}
              <div>
                <strong>{defaultItem?.name || "Character portrait"}</strong>
                <p role="status">
                  {assigned.length} ready · {data.assignments.length - assigned.length} unresolved
                </p>
                <div className="sprite-actions">
                  <button disabled={busy || !data.manager.artwork.length} onClick={() => void perform(analyze)}>
                    Analyze sprites
                  </button>
                  <button disabled={busy} onClick={() => setExpanded(!expanded)}>
                    {expanded ? "Close grid" : assigned.length ? "Review sprites" : "Set up manually"}
                  </button>
                  {analyzing ? <button onClick={() => abort.current?.abort()}>Cancel analysis</button> : null}
                  <button
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
            {data.suggestions.length ? (
              <div className="sprite-actions">
                <span>{data.suggestions.length} suggestions</span>
                <button
                  disabled={busy}
                  onClick={() =>
                    setData((prior) => ({
                      ...prior,
                      assignments: prior.assignments.map(
                        (item) =>
                          prior.suggestions.find((suggestion) => suggestion.artworkId === item.artworkId) ?? item,
                      ),
                      defaultArtworkId: prior.defaultArtworkId || prior.suggestedDefaultArtworkId || "",
                      suggestions: [],
                    }))
                  }
                >
                  Apply suggestions
                </button>
                <button disabled={busy} onClick={() => setData({ ...data, suggestions: [] })}>
                  Discard suggestions
                </button>
              </div>
            ) : null}
            {expanded ? (
              <>
                <div className="sprite-bulk" aria-label="Batch edit sprites">
                  <input
                    aria-label="Batch expression"
                    placeholder="Expression"
                    value={bulkName}
                    onChange={(event) => setBulkName(event.target.value)}
                  />
                  <input
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
                    disabled={busy || !selected.length}
                    onClick={() =>
                      setData((prior) => ({
                        ...prior,
                        assignments: prior.assignments.map((item) =>
                          selected.includes(item.artworkId)
                            ? {
                                ...item,
                                ...(bulkName ? { name: bulkName } : {}),
                                ...(bulkUse ? { useWhen: bulkUse } : {}),
                                ...(bulkFacing ? { direction: bulkFacing as SpriteSetupAssignment["direction"] } : {}),
                              }
                            : item,
                        ),
                      }))
                    }
                  >
                    Apply to selected
                  </button>
                </div>
                <div className="sprite-grid">
                  {data.manager.artwork.map((art) => {
                    const item = data.assignments.find((item) => item.artworkId === art.id)!;
                    const suggestion = data.suggestions.find((item) => item.artworkId === art.id);
                    return (
                      <section className="sprite-tile" key={art.id} aria-label={art.name}>
                        <img src={art.rendered.url} alt={art.name} loading="lazy" />
                        <small>{art.name}</small>
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
                          Select
                        </label>
                        {suggestion ? (
                          <>
                            <small>
                              {suggestion.name || "Unclear expression"} · {suggestion.direction || "Facing unknown"}
                            </small>
                            <small>{suggestion.useWhen}</small>
                            <button
                              disabled={busy}
                              onClick={() => {
                                edit(art.id, suggestion);
                                setData((prior) => ({
                                  ...prior,
                                  suggestions: prior.suggestions.filter((item) => item.artworkId !== art.id),
                                }));
                              }}
                            >
                              Use suggestion
                            </button>
                          </>
                        ) : null}
                        <label>
                          Expression
                          <input
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
                            type="checkbox"
                            disabled={busy}
                            checked={item.included}
                            onChange={(event) => edit(art.id, { included: event.target.checked })}
                          />
                          Include
                        </label>
                        <label className="sprite-inline">
                          <input
                            type="radio"
                            name="sprite-default"
                            disabled={busy || !ready(item)}
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
