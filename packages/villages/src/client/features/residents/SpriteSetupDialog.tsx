import { useCallback, useEffect, useRef, useState } from "react";
import type { SpriteFrame, SpriteSetupAssignment, SpriteSetupState } from "../../../shared/contracts/sprites.js";
import { request, messageFrom, VillageApiError } from "../../shared/api.js";
import type { Portrait } from "../../shared/types.js";

type Props = {
  characterId: string;
  name: string;
  portrait?: Portrait;
  onClose(revision?: number): void;
  onDone(revision?: number): void | Promise<void>;
  existing?: boolean;
  preserveSelection?: boolean;
};
const complete = (item: SpriteSetupAssignment) => item.included && Boolean(item.name.trim());
export function SpriteSetupDialog({ characterId, name, onClose, onDone, existing, preserveSelection }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const importAbort = useRef<AbortController | null>(null);
  const working = useRef(false);
  const [data, setData] = useState<SpriteSetupState | null>(null);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [reloadRequired, setReloadRequired] = useState(false);
  const [importing, setImporting] = useState(false);
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
        if (!controller.signal.aborted) {
          // Import may have saved before its response was lost. Read after its writer settles.
          try {
            const value = await request<SpriteSetupState>(base + "/settled", { signal: controller.signal });
            if (!controller.signal.aborted) setData(value);
          } catch {
            if (!controller.signal.aborted) setReloadRequired(true);
          }
          if (!controller.signal.aborted) setError(messageFrom(cause, "Could not import sprites."));
        }
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
    void request<SpriteSetupState>(base + "/settled", { signal: controller.signal })
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
        if (!controller.signal.aborted) {
          setReloadRequired(true);
          setError(messageFrom(cause, "Could not load sprites."));
        }
      });
    return () => {
      controller.abort();
      importAbort.current?.abort();
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
      if (
        cause instanceof VillageApiError &&
        (cause.status === 409 ||
          cause.status === 0 ||
          cause.status >= 500 ||
          cause.code === "INVALID_RESPONSE" ||
          cause.code === "RESPONSE_READ_FAILED")
      )
        setReloadRequired(true);
    } finally {
      working.current = false;
      setBusy(false);
    }
  }
  async function reloadSavedSprites() {
    const saved = await request<SpriteSetupState>(base + "/settled");
    setData(saved);
    setReloadRequired(false);
    closeEditor();
  }
  const recovery = reloadRequired ? (
    <button disabled={busy || importing} onClick={() => void perform(reloadSavedSprites)}>
      Discard edits & reload
    </button>
  ) : null;
  function edit(artworkId: string, patch: Partial<SpriteSetupAssignment>) {
    setData(
      (prior) =>
        prior && {
          ...prior,
          assignments: prior.assignments.map((item) =>
            item.artworkId === artworkId
              ? {
                  ...item,
                  ...patch,
                  approved: false,
                }
              : item,
          ),
        },
    );
  }
  async function save(useSprites: boolean, validateForUse = false) {
    if (!data) return null;
    // Only the final action approves the set; closing or framing saves the draft.
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
  const candidates = data?.assignments ?? [];
  const included = candidates.filter((item) => item.included);
  const completeCount = included.filter(complete).length;
  const excludedCount = candidates.length - included.length;
  const defaultItem = candidates.find((item) => complete(item) && item.artworkId === data?.defaultArtworkId);
  const canFinish = Boolean(defaultItem && completeCount === included.length);
  function closeEditor() {
    reviewDialog.current?.close();
    setActiveArtwork("");
    setFraming("");
    activeButton.current?.focus({ preventScroll: true });
  }
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
      .villages-sprite-setup{position:fixed;inset:0;margin:auto;height:90dvh;background:#111d31;color:#f2f4fb;border:1px solid #66758f;border-radius:14px;padding:0;width:min(780px,calc(100vw - 24px));max-height:90dvh;overflow:hidden;box-sizing:border-box;font-family:system-ui,sans-serif}
      .villages-sprite-setup[open]{display:flex;flex-direction:column}
      .villages-sprite-setup::backdrop{background:#080e19bd}
      .villages-sprite-setup header,.villages-sprite-setup footer{display:flex;gap:12px;justify-content:space-between;align-items:center;padding:16px;flex-wrap:wrap;flex-shrink:0}
      .villages-sprite-setup h2{margin:0;font-size:1.25rem}.villages-sprite-setup h3{margin:0;font-size:1rem}
      .villages-sprite-setup main{overflow:auto;min-height:0;padding:0 16px 16px}
      .villages-sprite-setup > main{flex:1}
      .villages-sprite-setup button,.villages-sprite-setup input,.villages-sprite-setup select,.villages-sprite-setup textarea{font:inherit;color:inherit;background:#1a2b44;border:1px solid #62718a;border-radius:6px;padding:8px;box-sizing:border-box;max-width:100%}
      .villages-sprite-setup button{min-height:44px}.villages-sprite-setup button:disabled{opacity:.5}.villages-sprite-setup .sprite-primary{background:#36567a}
      .villages-sprite-setup .sprite-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
      .villages-sprite-setup label{display:grid;gap:4px}.villages-sprite-setup .sprite-inline{display:flex;align-items:center;gap:6px}
      .villages-sprite-setup .sprite-inline input{flex:0 0 18px;width:18px;height:18px;min-width:18px;min-height:18px;padding:0;margin:0}
      .villages-sprite-setup small{overflow-wrap:anywhere;color:#b9c6da}.villages-sprite-setup [role=alert]{color:#ffbeb5}
      .villages-sprite-setup .sprite-counts{margin:0 0 14px;color:#b9c6da}.villages-sprite-setup .sprite-counts span{display:inline-block}
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
        {!activeArtwork ? (
          <>
            {error ? <p role="alert">{error}</p> : null}
            {recovery}
          </>
        ) : null}
        <fieldset disabled={importing} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
          {!data ? null : (
            <>
              <p role="status" className="sprite-counts">
                {candidates.length} sprites · {completeCount} ready
                {included.length - completeCount > 0 ? (
                  <span> · {included.length - completeCount} incomplete</span>
                ) : null}
                {excludedCount ? <span> · {excludedCount} excluded</span> : null}
                {defaultItem ? <span> · Default: {defaultItem.name}</span> : null}
              </p>
              {included.length > 0 && completeCount === included.length && !defaultItem ? (
                <p>
                  <small>Choose a default sprite.</small>
                </p>
              ) : null}
              <p>
                <small>Use front views or side views facing right.</small>
              </p>
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
              {data.libraryError ? <p role="alert">{data.libraryError}</p> : null}
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
                              : !complete(item)
                                ? "Incomplete"
                                : item.view === "front"
                                  ? "Front"
                                  : "Side"}
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
            {activeArtwork ? recovery : null}

            {data.manager.artwork
              .filter((art) => art.id === activeArtwork)
              .map((art) => {
                const item = data.assignments.find((item) => item.artworkId === art.id)!;
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
                        Facing
                        <select
                          aria-label="Facing"
                          disabled={busy}
                          value={item.view}
                          onChange={(event) => edit(art.id, { view: event.target.value as "front" | "side" })}
                        >
                          <option value="front">Front</option>
                          <option value="side">Side</option>
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
          </main>
        </dialog>
      ) : null}
    </dialog>
  );
}
